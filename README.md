# 🗣️ Vocab Reader

A simple, elegant web-based tool for practicing vocabulary with audio pronunciation. This tool is designed to read vocabulary lists from JSON files and display them in a clean, user-friendly interface. It includes an automated workflow to generate and upload audio for each new word, making it easy to expand the vocabulary lists.

## ✨ How It Works

The project is composed of two main parts: a **frontend** to display the vocabulary and a **backend script** to automate audio generation.

### Frontend

- **Homepage (`index.html`)**: The main landing page that displays a list of all available vocabulary lessons.
- **Lessons Page (`lessons.html`)**: The page that displays the vocabulary words, definitions, and conjugations for a selected lesson.
- **CSS (`styles.css`)**: Provides the styling for a modern, "glassmorphism" look and feel across the site.
- **JavaScript (`home.js`)**: Attached to `index.html`, this script fetches the list of vocabulary files from `lists/lists.json` and dynamically generates the lesson list.
- **JavaScript (`script.js`)**: Attached to `lessons.html`, this script:
    - Fetches vocabulary data from a specified JSON file based on a URL query parameter.
    - Dynamically generates the HTML to display the words, definitions, and verb conjugations.
    - Handles click events to play the audio pronunciation of each word. Audio files are fetched from a Cloudflare R2 bucket.

### Backend & Automation

- **Python Script (`generate_list.py`)**:
    - This script scans the `lists/` directory and generates a `lists/lists.json` file.
    - This JSON file contains a list of all available vocabulary files, which is then used by the frontend to create the list of lessons on the homepage.
- **Python Script (`generate_and_upload.py`)**:
    - Scans all `.json` files in the `lists/` directory to find unique English words.
    - Compares the found words against a list of already processed words (`lists/available_vocab.json`).
    - For any new words, it uses the **Unreal Speech API** to generate an MP3 audio file.
    - Uploads the generated audio file to a specified **Cloudflare R2 bucket**.
    - Updates the `lists/available_vocab.json` file to include the newly processed words.
- **GitHub Actions (`.github/workflows/audio-automation.yml`)**:
    - This workflow is triggered automatically whenever a change is pushed to the `master` branch that affects the `lists/` directory.
    - It runs two main jobs in sequence:
        1. **Generate Vocabulary List**: Runs the `generate_list.py` script to update `lists/lists.json`.
        2. **Generate and Upload Audio**: Runs the `generate_and_upload.py` script to generate and upload audio for new words.
    - It uses repository secrets to securely access the required API keys and credentials.
    - Finally, it commits and pushes the updated `lists/lists.json` and `lists/available_vocab.json` files back to the repository.

## 🚀 How to Use

### Adding New Vocabulary

1. **Create a JSON File**: Add a new `.json` file inside the `lists/` directory. You can name it anything you like (e.g., `unit2.json`).
2. **Format the JSON**: Structure your JSON file like the `example_json/example.json`. You can have different sections like "Key Vocabulary," "Expressions," and "Conjugation of Verbs."
    
    ```
    {
      "sections": [
        {
          "title": "Key Vocabulary (أهم الكلمات)",
          "words": [
            { "en": "example", "ar": "مثال" },
            { "en": "project", "ar": "مشروع", "definition": "A planned piece of work." }
          ]
        },
        {
          "title": "Conjugation of Verbs (تصريفات الأفعال)",
          "words": [
            { "en": "go", "ar": "يذهب", "past": "went", "pastParticiple": "gone" }
          ]
        }
      ]
    }
    
    ```
    
3. **Update the Lesson List (Locally)**: Run the `generate_list.py` script to add your new file to `lists/lists.json`.

    ```bash
    python generate_list.py
    ```

4. **Push to GitHub**: Commit and push your new JSON file and the updated `lists/lists.json` to the `master` branch.
5. **Automation Takes Over**: The GitHub Action will automatically run, generate audio for any new words, upload them, and update the list of available vocabulary.

### Viewing a Vocabulary List

1. **Open the Homepage**: Navigate to the main `index.html` page of the deployed project.
2. **Select a Lesson**: You will see a list of all available vocabulary lessons. Click on any lesson to view it.
3. **View the Vocabulary**: The `lessons.html` page will load with the selected vocabulary, including words, definitions, and audio playback.

## ⚙️ Configuration

For the audio generation and upload automation to work, you need to configure the following secrets in your GitHub repository's settings (`Settings > Secrets and variables > Actions`):

- `UNREAL_SPEECH_API_KEY`: Your API key for the Unreal Speech service.
- `R2_ACCESS_KEY_ID`: Your access key ID for your Cloudflare R2 bucket.
- `R2_SECRET_ACCESS_KEY`: Your secret access key for your Cloudflare R2 bucket.
- `R2_BUCKET`: The name of your R2 bucket.
- `R2_ENDPOINT`: The endpoint URL for your R2 bucket.
