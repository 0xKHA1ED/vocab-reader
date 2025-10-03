import os
import json
import requests
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import glob
import re
import random


# --- ⚙️ CONFIGURATION ---
UNREAL_SPEECH_API_KEY = os.environ.get('UNREAL_SPEECH_API_KEY', 'YOUR_UNREAL_SPEECH_API_KEY')
R2_ACCESS_KEY_ID = os.environ.get('R2_ACCESS_KEY_ID', 'YOUR_R2_ACCESS_KEY')
R2_SECRET_ACCESS_KEY = os.environ.get('R2_SECRET_ACCESS_KEY', 'YOUR_R2_SECRET_KEY')
R2_BUCKET = os.environ.get('R2_BUCKET', 'your-bucket-name')
R2_ENDPOINT = os.environ.get('R2_ENDPOINT', 'https://<your_account_id>.r2.cloudflarestorage.com')

VOCAB_LISTS_PATH = 'lists'
PROCESSED_WORDS_FILE = os.path.join(VOCAB_LISTS_PATH, 'available_vocab.json')


def load_processed_words():
    """Loads the set of words that have already been processed."""
    try:
        with open(PROCESSED_WORDS_FILE, 'r', encoding='utf-8') as f:
            return set(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def save_processed_words(words_set):
    """Saves the updated set of processed words back to the JSON file."""
    with open(PROCESSED_WORDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(list(words_set), f, indent=2)
    print(f"✅ Updated processed words list at '{PROCESSED_WORDS_FILE}'")


def get_all_unique_words():
    """
    Finds all JSON files in the lists directory and extracts unique words
    based on the new, explicit schema.
    """
    all_words = set()
    json_files = glob.glob(os.path.join(VOCAB_LISTS_PATH, '*.json'))
    json_files = [f for f in json_files if not f.endswith('available_vocab.json')]
    print(f"Found {len(json_files)} vocabulary files to process.")

    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for section in data.get('sections', []):
                    section_type = section.get('type')
                    for word_entry in section.get('words', []):
                        # --- Logic for standard vocabulary and expressions ---
                        if section_type in ['vocabulary', 'expressions']:
                            if 'en' in word_entry and word_entry['en']:
                                all_words.add(word_entry['en'])

                        # --- Logic for verb conjugations ---
                        elif section_type == 'conjugations':
                            if 'forms' in word_entry and isinstance(word_entry.get('forms'), dict):
                                for form in word_entry['forms'].values():
                                    if form:
                                        all_words.add(form)

                        # --- Logic for synonyms and antonyms ---
                        elif section_type == 'synonyms_antonyms':
                            for key in ['word', 'synonym', 'antonym']:
                                if key in word_entry and word_entry[key]:
                                    # Handle multiple entries separated by '/'
                                    entries = word_entry[key].split('/')
                                    for entry in entries:
                                        if entry.strip():
                                            all_words.add(entry.strip())

        except Exception as e:
            print(f"⚠️  Could not process file {file_path}: {e}")

    # Filter out any empty strings that may have been added
    return {word for word in all_words if word}


def sanitize_filename(word):
    """
    Cleans a string to make it a safe filename.
    - Converts to lowercase.
    - Replaces spaces with hyphens.
    - Removes any character that is not a letter, number, hyphen, or underscore.
    """
    s = word.lower().strip()
    s = re.sub(r'[\s/]+', '-', s)
    s = re.sub(r'[^a-z0-9-_]', '', s)
    return s


def process_vocabulary():
    """Main function to generate audio and upload to R2."""
    s3_client = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY
    )

    processed_words = load_processed_words()
    all_words = get_all_unique_words()

    words_to_generate = all_words - processed_words

    if not words_to_generate:
        print("🎉 All vocabulary words are already processed. Nothing to do.")
        return

    print(f"Found {len(words_to_generate)} new words to process.")

    for word in words_to_generate:
        print(f"\nProcessing word: '{word}'")

        # --- A. Generate Audio ---
        try:
            url = 'https://api.v8.unrealspeech.com/stream'
            headers = {
                'Authorization': f'Bearer {UNREAL_SPEECH_API_KEY}',
                'Content-Type': 'application/json'
            }
            voice_choice = random.choice(
                ['Autumn', 'Melody', 'Hannah',
                 'Emily', 'Ivy', 'Kaitlyn', 'Luna',
                 'Willow', 'Lauren', 'Sierra',
                 'Noah', 'Jasper', 'C Caleb',
                 'Ronan', 'Ethan', 'Daniel', 'Zane']
                 )
            data = {"Text": word, "VoiceId": voice_choice, "Bitrate": "128k"}
            response = requests.post(url, headers=headers, data=json.dumps(data), timeout=60)

            if response.status_code != 200:
                print(f"❌ Error generating audio for '{word}': {response.status_code} - {response.text}")
                continue

            audio_content = response.content
            print(f"🔊 Audio generated successfully for '{word}'.")

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to connect to TTS API for '{word}': {e}")
            continue

        # --- B. Upload to R2 ---
        try:
            sanitized_word = sanitize_filename(word)
            file_name = f"{sanitized_word}.mp3"
            remote_path = f"{file_name}"

            print(f"Uploading '{file_name}' to R2 bucket '{R2_BUCKET}'...")

            s3_client.put_object(
                Bucket=R2_BUCKET,
                Key=remote_path,
                Body=audio_content,
                ContentType='audio/mpeg'
            )

            print("☁️ Upload successful.")
            processed_words.add(word)

        except (NoCredentialsError, ClientError) as e:
            print(f"❌ Failed to upload '{file_name}': {e}")
            continue

    save_processed_words(processed_words)
    update_vocab_manifest()
    print("\n✨ Process complete.")


def update_vocab_manifest():
    """Scans the lists directory and creates a JSON manifest of all vocab files."""
    manifest_file = os.path.join(VOCAB_LISTS_PATH, 'lists.json')
    all_json_files = glob.glob(os.path.join(VOCAB_LISTS_PATH, '*.json'))

    # Exclude special files from the list
    excluded_files = [
        PROCESSED_WORDS_FILE,
        manifest_file
    ]

    # Get just the base filename, e.g., 'unit-1.json', and sort them
    vocab_files = sorted([os.path.basename(f) for f in all_json_files if f not in excluded_files])

    with open(manifest_file, 'w', encoding='utf-8') as f:
        json.dump(vocab_files, f, indent=2)
    print(f"✅ Updated vocabulary manifest file at '{manifest_file}'")


if __name__ == "__main__":
    process_vocabulary()
