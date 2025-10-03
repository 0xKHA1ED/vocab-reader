document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('main.container');
    const urlParams = new URLSearchParams(window.location.search);
    const vocabFileName = urlParams.get('vocab');

    if (vocabFileName) {
        // Load a specific lesson
        loadLesson(vocabFileName);
    } else {
        // Load the list of lessons
        loadLessonList();
    }

    function loadLessonList() {
        fetch('lists/lists.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(files => {
                if (files.length > 0) {
                    const list = document.createElement('ul');
                    list.className = 'vocab-list';

                    files.forEach(file => {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        const vocabName = file.replace('.json', '');
                        link.href = `?vocab=${vocabName}`;
                        link.textContent = vocabName.replace(/_/g, ' ').replace(/-/g, ' ');
                        listItem.appendChild(link);
                        list.appendChild(listItem);
                    });

                    mainContainer.appendChild(list);
                } else {
                    mainContainer.textContent = 'No vocabulary lists found.';
                }
            })
            .catch(error => {
                console.error('Error fetching vocabulary list:', error);
                mainContainer.textContent = 'Could not load vocabulary lists.';
            });
    }

    function loadLesson(vocabFileName) {
        const vocabFilePath = `lists/${vocabFileName}.json`;

        fetch(vocabFilePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                mainContainer.innerHTML = ''; // Clear existing static content

                let animationDelay = 0;
                data.sections.forEach(section => {
                    const sectionTitle = document.createElement('h2');
                    sectionTitle.textContent = section.title;
                    sectionTitle.classList.add('animate-fade-in');
                    mainContainer.appendChild(sectionTitle);

                    if (section.title.includes('Conjugation')) {
                        const table = document.createElement('table');
                        table.classList.add('conjugation-table', 'glass-card');

                        const thead = document.createElement('thead');
                        tr.innerHTML = `
                                        <td><span class="english-word"><span class="speaker-icon">🔊</span> ${word.forms.present}</span></td>
                                        <td><span class="english-word"><span class="speaker-icon">🔊</span> ${word.forms.past}</span></td>
                                        <td><span class="english-word"><span class="speaker-icon">🔊</span> ${word.forms.pastParticiple}</span></td>
                                       `;
                        table.appendChild(thead);

                        const tbody = document.createElement('tbody');
                        section.words.forEach((word, index) => {
                            const tr = document.createElement('tr');
                            tr.classList.add('animate-slide-up');
                            tr.style.animationDelay = `${(index % 5) * 100}ms`;
                            tr.innerHTML = `
                                <td><span class="english-word"><span class="speaker-icon">🔊</span> ${word.en}</span></td>
                                <td><span class="english-word"><span class="speaker-icon">🔊</span> ${word.past}</span></td>
                                <td><span class="english-word"><span class="speaker-icon">🔊</span> ${word.pastParticiple}</span></td>
                            `;
                            
                            // Add event listeners to each word in the conjugation table
                            tr.querySelectorAll('.english-word').forEach(span => {
                                span.addEventListener('click', (event) => {
                                    const clickedWord = event.target.textContent.replace('🔊', '').trim();
                                    playAudio(clickedWord);
                                });
                            });

                            tbody.appendChild(tr);
                        });
                        table.appendChild(tbody);
                        mainContainer.appendChild(table);

                    } else {
                        const vocabGrid = document.createElement('div');
                        vocabGrid.classList.add('vocab-grid');
                        animationDelay = 0; // Reset for each grid

                        section.words.forEach(word => {
                            const vocabItem = document.createElement('div');
                            vocabItem.classList.add('vocab-item', 'glass-card', 'animate-slide-up');
                            animationDelay++;
                            vocabItem.style.animationDelay = `${animationDelay * 75}ms`;

                            const englishDiv = document.createElement('div');
                            const englishWordSpan = document.createElement('span');
                            englishWordSpan.classList.add('english-word');
                            englishWordSpan.innerHTML = `<span class="speaker-icon">🔊</span> ${word.en}`;
                            englishDiv.appendChild(englishWordSpan);

                            if (word.definition) {
                                const definitionP = document.createElement('p');
                                definitionP.classList.add('definition');
                                definitionP.textContent = word.definition;
                                englishDiv.appendChild(definitionP);
                            }
                            vocabItem.appendChild(englishDiv);

                            const arabicMeaningSpan = document.createElement('span');
                            arabicMeaningSpan.classList.add('arabic-meaning');
                            arabicMeaningSpan.textContent = word.ar;
                            vocabItem.appendChild(arabicMeaningSpan);

                            vocabItem.addEventListener('click', () => {
                                playAudio(word.en);
                            });

                            vocabGrid.appendChild(vocabItem);
                        });
                        mainContainer.appendChild(vocabGrid);
                    }
                });
            })
            .catch(error => console.error('Error fetching vocabulary:', error));
    }

    /**
     * Cleans a string to make it a safe filename, mirroring the Python script's logic.
     * - Converts to lowercase.
     * - Replaces spaces and slashes with hyphens.
     * - Removes any character that is not a letter, number, hyphen, or underscore.
     */
    function sanitizeFilename(word) {
        let s = word.toLowerCase().trim();
        s = s.replace(/[\s/]+/g, '-');
        s = s.replace(/[^a-z0-9-_]/g, '');
        return s;
    }

    function playAudio(word) {
        const sanitizedWord = sanitizeFilename(word);
        const audioUrl = `https://pub-a1e6f72463af4141a258ec150f1aa29a.r2.dev/${sanitizedWord}.mp3`;
        const audio = new Audio(audioUrl);
        
        audio.play().catch((error) => {
            console.error(`Could not play audio from ${audioUrl}:`, error);
            // Fallback to browser's native TTS if audio fails
            const utterance = new SpeechSynthesisUtterance(word);
            speechSynthesis.speak(utterance);
        });
    }
});