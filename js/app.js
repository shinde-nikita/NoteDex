/**
 * NoteDex - Core Data Model & Local Storage Management
 */
const NoteDex = (() => {
    const STORAGE_KEY = 'notedex_decks';

    // --- Utility Functions ---

    /** Loads all decks from Local Storage, or initializes with sample data. */
    const loadDecks = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return createSampleData(); // Fallback to sample data if storage is empty
    };

    /** Saves the current state of decks to Local Storage. */
    const saveDecks = (decks) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    };

    /** Generates a simple, unique ID. */
    const generateId = () => Math.random().toString(36).substring(2, 9);

    /** Creates two sample decks for a fresh start. */
    const createSampleData = () => {
        const sampleDeckId = generateId();
        return [
            {
                id: sampleDeckId,
                name: "Web Dev Fundamentals",
                cards: [
                    { id: generateId(), front: "What does HTML stand for?", back: "HyperText Markup Language" },
                    { id: generateId(), front: "What CSS property controls the text size?", back: "font-size" },
                    { id: generateId(), front: "How do you declare a variable in modern JavaScript?", back: "Using `let` or `const`" },
                    { id: generateId(), front: "What is the purpose of the 'viewport' meta tag?", back: "To control the scaling and dimensions for mobile devices." },
                    { id: generateId(), front: "What is an event loop in JavaScript?", back: "A mechanism that handles asynchronous callbacks." }
                ],
                // >>> CORRECTED: Added the required 'progress' object
                progress: {
                    studiedCount: 0,
                    knownCount: 0
                } 
            },
            {
                id: generateId(),
                name: "Physics Basics",
                cards: [
                    { id: generateId(), front: "What is the formula for Force?", back: "$F = ma$ (Mass \\times Acceleration)" },
                    { id: generateId(), front: "Define Kinetic Energy.", back: "The energy an object possesses due to its motion." },
                    { id: generateId(), front: "What is the unit of electric resistance?", back: "Ohm (Ω)" }
                ],
                // >>> CORRECTED: Added the required 'progress' object
                progress: { 
                    studiedCount: 0,
                    knownCount: 0
                }
            }
        ];
    };

    // --- Deck Management ---

    const getDecks = () => loadDecks();
    
    const getDeck = (deckId) => {
        return loadDecks().find(d => d.id === deckId);
    };

    const createDeck = (name) => {
        const decks = loadDecks();
        const newDeck = {
            id: generateId(),
            name: name,
            cards: [],
            // Simple progress tracking
            progress: {
                studiedCount: 0,
                knownCount: 0
            }
        };
        decks.push(newDeck);
        saveDecks(decks);
        return newDeck.id;
    };

    const deleteDeck = (deckId) => {
        let decks = loadDecks();
        decks = decks.filter(d => d.id !== deckId);
        saveDecks(decks);
    };

    const updateDeckProgress = (deckId, isKnown) => {
        const decks = loadDecks();
        const deck = decks.find(d => d.id === deckId);
        if (deck) {
            // Ensure progress object exists before updating
            if (!deck.progress) {
                deck.progress = { studiedCount: 0, knownCount: 0 };
            }
            deck.progress.studiedCount = (deck.progress.studiedCount || 0) + 1;
            if (isKnown) {
                deck.progress.knownCount = (deck.progress.knownCount || 0) + 1;
            }
            saveDecks(decks);
        }
    };

    // --- Card Management ---

    const addCard = (deckId, front, back) => {
        const decks = loadDecks();
        const deck = decks.find(d => d.id === deckId);
        if (deck) {
            deck.cards.push({ id: generateId(), front, back });
            saveDecks(decks);
        }
    };

    const updateCard = (deckId, cardId, front, back) => {
        const decks = loadDecks();
        const deck = decks.find(d => d.id === deckId);
        if (deck) {
            const cardIndex = deck.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                deck.cards[cardIndex].front = front;
                deck.cards[cardIndex].back = back;
                saveDecks(decks);
            }
        }
    };

    const deleteCard = (deckId, cardId) => {
        const decks = loadDecks();
        const deck = decks.find(d => d.id === deckId);
        if (deck) {
            deck.cards = deck.cards.filter(card => card.id !== cardId);
            saveDecks(decks);
        }
    };

    // --- UI Rendering (for index.html) ---

    const displayDecks = () => {
        const deckListContainer = document.getElementById('deck-list');
        const decks = loadDecks();
        deckListContainer.innerHTML = ''; // Clear existing content

        if (decks.length === 0) {
            deckListContainer.innerHTML = '<p class="empty-state">No decks created yet. Click "Create New Deck" to begin!</p>';
            return;
        }

        decks.forEach(deck => {
            // Ensure the deck has the progress object for calculation (for robustness)
            const deckProgress = deck.progress || { studiedCount: 0, knownCount: 0 };
            
            const progressPercent = deck.cards.length > 0 
                ? Math.round((deckProgress.knownCount / deck.cards.length) * 100)
                : 0;
            
            const deckElement = document.createElement('div');
            deckElement.className = 'deck-card';
            deckElement.innerHTML = `
                <h3>${deck.name}</h3>
                <p>${deck.cards.length} Cards</p>
                <div class="deck-progress">
                    <div class="progress-bar-small">
                        <div style="width: ${progressPercent}%;"></div>
                    </div>
                    <span>${progressPercent}% Studied</span>
                </div>
                <div class="card-actions">
                    <a href="study.html?deckId=${deck.id}" class="secondary-btn">Study</a>
                    <a href="create.html?deckId=${deck.id}" class="secondary-btn">Edit Cards</a>
                    <button class="delete-deck-btn" data-deck-id="${deck.id}">Delete</button>
                </div>
            `;
            deckListContainer.appendChild(deckElement);
        });

        // Attach delete listeners
        deckListContainer.querySelectorAll('.delete-deck-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const deckId = e.target.dataset.deckId;
                const deckName = decks.find(d => d.id === deckId).name;
                if (confirm(`Are you sure you want to delete the deck "${deckName}" and all its cards?`)) {
                    deleteDeck(deckId);
                    displayDecks(); // Re-render the list
                }
            });
        });
    };

    // --- Public Interface ---
    return {
        getDecks,
        getDeck,
        createDeck,
        deleteDeck,
        addCard,
        updateCard,
        deleteCard,
        displayDecks,
        updateDeckProgress
    };
})();