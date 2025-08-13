document.addEventListener('DOMContentLoaded', async () => {
  const vocabContainer = document.getElementById('vocab-container');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const backToTopButton = document.getElementById('back-to-top');

  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.remove('hidden');
    } else {
      backToTopButton.classList.add('hidden');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  try {
    // Fetch the vocabulary data from the JSON file
    const response = await fetch('vocab.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const vocabData = await response.json();

    // Generate the HTML for the vocabulary sections
    generateVocabSections(vocabData, vocabContainer);

  } catch (error) {
    console.error('Failed to load vocabulary:', error);
    vocabContainer.innerHTML = '<p class="text-center text-white/70">Could not load vocabulary lists. Please try again later.</p>';
  }
});

function generateVocabSections(data, container) {
  // Clear any existing content (like the error message)
  container.innerHTML = '';

  // Loop through each section in the JSON data
  data.sections.forEach(section => {
    // 1. Create the section header (e.g., "General Vocab")
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'text-2xl md:text-3xl font-bold tracking-tight text-white/90 mb-6';
    sectionTitle.textContent = section.title;
    container.appendChild(sectionTitle);

    // 2. Create the grid container for the cards in this section
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12';

    // 3. Loop through the words in the section and create a card for each
    section.words.forEach(word => {
      const cardElement = document.createElement('div');
      cardElement.className = 'flip-card glass-card animate-slide-up p-4';
      cardElement.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <span class="text-lg font-semibold">${word.en}</span>
            <div class="speaker-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
          </div>
          <div class="flip-card-back">
            <span class="font-arabic text-2xl">${word.ar}</span>
          </div>
        </div>
      `;

      // 4. Add event listener for audio playback
      cardElement.addEventListener('click', () => {
        cardElement.classList.add('clicked');

        // This assumes you have .mp3 files named after the English words
        const wordToPlay = word.en.trim().toLowerCase().replace(/ /g, '-'); // handle multi-word phrases
        const audio = new Audio(`audio/${wordToPlay}.mp3`); // Assuming audio is in an /audio/ folder

        audio.play().catch(e => {
          console.error("Could not play audio:", e);
          alert(`Audio for "${word.en}" not available.`);
        });

        setTimeout(() => {
          cardElement.classList.remove('clicked');
        }, 500);
      });

      gridContainer.appendChild(cardElement);
    });

    container.appendChild(gridContainer);
  });
}
