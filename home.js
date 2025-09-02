document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('main.container');

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
                    link.href = `index.html?vocab=${vocabName}`;
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
});
