# 🗣️ Vocab Reader

A simple, elegant web-based tool for practicing vocabulary with audio pronunciation. This tool is designed to read vocabulary lists from JSON files and display them in a clean, user-friendly interface. It includes an automated workflow to generate and upload audio for each new word, making it easy to expand the vocabulary lists.

## ✨ How It Works

The project is composed of two main parts: a **frontend** to display the vocabulary and a **backend script** to automate audio generation.

### Frontend

- **HTML (`index.html`)**: The main structure of the web page.
- **CSS (`styles.css`)**: Provides the styling for a modern, "glassmorphism" look and feel.
- **JavaScript (`script.js`)**:
    - Fetches vocabulary data from a specified JSON file in the `lists/` directory.
    - Dynamically generates the HTML to display the words, definitions, and verb conjugations.
    - Handles click events to play the audio pronunciation of each word. Audio files are fetched from a Cloudflare R2 bucket.

### Backend & Automation

- **Python Script (`generate_and_upload.py`)**:
    - Scans all `.json` files in the `lists/` directory to find unique English words.
    - Compares the found words against a list of already processed words (`lists/available_vocab.json`).
    - For any new words, it uses the **Unreal Speech API** to generate an MP3 audio file.
    - Uploads the generated audio file to a specified **Cloudflare R2 bucket**.
    - Updates the `lists/available_vocab.json` file to include the newly processed words.
- **GitHub Actions (`.github/workflows/audio-automation.yml`)**:
    - This workflow is triggered automatically whenever a change is pushed to the `master` branch that affects the `lists/` directory (i.e., when a new vocabulary JSON file is added or an existing one is modified).
    - It sets up a Python environment, installs the necessary dependencies, and runs the `generate_and_upload.py` script.
    - It uses repository secrets to securely access the required API keys and credentials.
    - Finally, it commits and pushes the updated `lists/available_vocab.json` file back to the repository.

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
    
3. **Push to GitHub**: Commit and push your new JSON file to the `master` branch.
4. **Automation Takes Over**: The GitHub Action will automatically run, generate audio for any new words, upload them, and update the list of available vocabulary.

### Viewing a Vocabulary List

To view a specific vocabulary list, append the `?vocab=<filename>` query parameter to the URL, without the `.json` extension.

- **Example**: To view the list from `lists/unit1.json`, the URL would be:
`https://your-github-username.github.io/your-repo-name/?vocab=unit1`

If no `vocab` parameter is provided, it will default to loading `lists/vocab.json`.

## ⚙️ Configuration

For the audio generation and upload automation to work, you need to configure the following secrets in your GitHub repository's settings (`Settings > Secrets and variables > Actions`):

- `UNREAL_SPEECH_API_KEY`: Your API key for the Unreal Speech service.
- `R2_ACCESS_KEY_ID`: Your access key ID for your Cloudflare R2 bucket.
- `R2_SECRET_ACCESS_KEY`: Your secret access key for your Cloudflare R2 bucket.
- `R2_BUCKET`: The name of your R2 bucket.
- `R2_ENDPOINT`: The endpoint URL for your R2 bucket.
