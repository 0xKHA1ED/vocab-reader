import os
import json
import glob

VOCAB_LISTS_PATH = 'lists'
LISTS_JSON_PATH = os.path.join(VOCAB_LISTS_PATH, 'lists.json')
EXCLUDE_FILES = ['available_vocab.json', 'lists.json', '__gitkeep__']

def generate_vocab_file_list():
    """Generates a JSON file containing the names of all vocabulary files."""
    try:
        all_files = glob.glob(os.path.join(VOCAB_LISTS_PATH, '*.json'))
        # Exclude the file that contains the list of all files and the processed words file
        vocab_files = [os.path.basename(f) for f in all_files if os.path.basename(f) not in EXCLUDE_FILES]

        with open(LISTS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(vocab_files, f, indent=2)
        print(f"✅ Successfully generated vocabulary file list at '{LISTS_JSON_PATH}'")
        print(f"Found and wrote {len(vocab_files)} files.")

    except Exception as e:
        print(f"❌ Error generating vocabulary file list: {e}")

if __name__ == "__main__":
    generate_vocab_file_list()
