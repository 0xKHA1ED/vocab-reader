document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vocabFileName = urlParams.get('vocab') || 'vocab'; // Default to 'vocab' if no parameter
    const vocabFilePath = `lists/${vocabFileName}.json`;

    fetch(vocabFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const mainContainer = document.querySelector('main.container');
            mainContainer.innerHTML = ''; // Clear existing static content

            let animationDelay = 0;
            data.sections.forEach(section => {
                const sectionTitle = document.createElement('h2');
                sectionTitle.textContent = section.title;
                sectionTitle.classList.add('animate-fade-in');
                mainContainer.appendChild(sectionTitle);

                if (section.title.includes('Conjugation of Verbs')) {
                    const table = document.createElement('table');
                    table.classList.add('conjugation-table', 'glass-card');

                    const thead = document.createElement('thead');
                    thead.innerHTML = `
                        <tr>
                            <th>Present (المضارع)</th>
                            <th>Past (الماضي)</th>
                            <th>Past Participle (التصريف الثالث)</th>
                        </tr>
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

    function playAudio(word) {
        const audio = new Audio(`audio/${word.toLowerCase()}.mp3`);
        audio.play().catch(() => {
            // Fallback to browser's native TTS if audio fails
            const utterance = new SpeechSynthesisUtterance(word);
            speechSynthesis.speak(utterance);
        });
    }
});
