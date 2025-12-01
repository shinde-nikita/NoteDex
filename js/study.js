/**
 * NoteDex - Study Mode Logic (Flashcard and Quiz)
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const deckId = params.get('deckId');

    if (!deckId) {
        document.getElementById('study-deck-title').textContent = "Error: Deck not found.";
        return;
    }

    const deck = NoteDex.getDeck(deckId);
    if (!deck || deck.cards.length === 0) {
        document.getElementById('study-deck-title').textContent = deck ? `${deck.name} (Empty)` : "Deck not found.";
        document.getElementById('mode-selection').innerHTML = deck ? 
            `<p class="empty-state">This deck has no cards. <a href="create.html?deckId=${deckId}">Add some cards</a> to begin studying.</p>` :
            '';
        return;
    }

    document.getElementById('study-deck-title').textContent = `Study: ${deck.name}`;

    const totalCards = deck.cards.length;
    let cardIndex = 0;
    let shuffledCards = [...deck.cards]; // Work with a shuffled copy
    let knownCount = 0;
    let studiedIndices = []; // Indices of cards that have been shown

    const flashcardView = document.getElementById('flashcard-view');
    const quizView = document.getElementById('quiz-view');
    const modeSelection = document.getElementById('mode-selection');

    // --- Utility: Shuffling ---
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    // --- Flashcard Mode Logic ---

    const setupFlashcardMode = () => {
        modeSelection.classList.add('hidden');
        flashcardView.classList.remove('hidden');
        shuffleArray(shuffledCards);
        cardIndex = 0;
        knownCount = 0;
        studiedIndices = [];
        updateProgressIndicator();
        displayCurrentCard();
    };

    const updateProgressIndicator = () => {
        const total = totalCards;
        const current = studiedIndices.length;
        const known = knownCount;
        
        document.getElementById('total-cards').textContent = total;
        document.getElementById('current-card-index').textContent = current + 1;

        const progressPercent = total > 0 ? (current / total) * 100 : 0;
        const knownPercent = total > 0 ? (known / total) * 100 : 0;

        const progressIndicator = document.getElementById('progress-indicator');
        progressIndicator.style.width = `${progressPercent}%`;
        progressIndicator.style.backgroundColor = 'var(--color-primary)'; // Primary color for studied
    };

    const displayCurrentCard = () => {
        if (cardIndex >= shuffledCards.length) {
            endStudySession();
            return;
        }
        
        const card = shuffledCards[cardIndex];
        const container = document.getElementById('flashcard-container');
        
        container.innerHTML = `
            <div class="flashcard" onclick="this.classList.toggle('flipped')">
                <div class="flashcard-front">
                    <p>${card.front}</p>
                    <span class="flip-hint">Tap to Flip</span>
                </div>
                <div class="flashcard-back">
                    <p>${card.back}</p>
                </div>
            </div>
        `;
        document.getElementById('current-card-index').textContent = studiedIndices.length + 1;
    };

    const markCard = (isKnown) => {
        if (cardIndex < shuffledCards.length) {
            const currentCardId = shuffledCards[cardIndex].id;
            
            // Mark progress for the deck (simple tracking)
            NoteDex.updateDeckProgress(deckId, isKnown);
            
            // Track for the session
            if (isKnown) {
                knownCount++;
            }
            if (!studiedIndices.includes(cardIndex)) {
                 studiedIndices.push(cardIndex);
            }

            cardIndex++;
            updateProgressIndicator();
            displayCurrentCard();
        }
    };
    
    document.getElementById('known-btn').addEventListener('click', () => markCard(true));
    document.getElementById('unknown-btn').addEventListener('click', () => markCard(false));
    document.getElementById('flashcard-mode-btn').addEventListener('click', setupFlashcardMode);

    // --- Quiz Mode Logic ---
    
    let quizIndex = 0;
    let quizCards = [];
    let currentQuizCard = null;

    const setupQuizMode = () => {
        modeSelection.classList.add('hidden');
        flashcardView.classList.add('hidden');
        quizView.classList.remove('hidden');
        
        // Shuffle and set up the quiz cards
        quizCards = [...deck.cards];
        shuffleArray(quizCards);
        quizIndex = 0;
        
        loadNextQuizQuestion();
    };

    const generateQuizOptions = (correctCard) => {
        // Get 3 other random, incorrect cards
        let incorrectOptions = deck.cards
            .filter(card => card.id !== correctCard.id)
            .sort(() => 0.5 - Math.random()) // Shuffle the remaining
            .slice(0, 3)
            .map(card => card.back); // Use the backs (answers) as distractors
        
        // Combine with the correct answer and shuffle
        let options = [correctCard.back, ...incorrectOptions];
        shuffleArray(options);
        return options;
    };
    
    const loadNextQuizQuestion = () => {
        if (quizIndex >= quizCards.length) {
            endQuizSession();
            return;
        }

        currentQuizCard = quizCards[quizIndex];
        const options = generateQuizOptions(currentQuizCard);
        
        document.getElementById('quiz-question').textContent = currentQuizCard.front;
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        options.forEach(answer => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = answer;
            btn.dataset.answer = answer;
            btn.addEventListener('click', handleQuizAnswer);
            optionsContainer.appendChild(btn);
        });

        document.getElementById('next-quiz-btn').style.display = 'none';
        quizIndex++;
    };

    const handleQuizAnswer = (e) => {
        const selectedAnswer = e.target.dataset.answer;
        const correctAnswer = currentQuizCard.back;
        const isCorrect = selectedAnswer === correctAnswer;

        // Disable all buttons after selection
        document.querySelectorAll('.quiz-option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.dataset.answer === selectedAnswer) {
                btn.classList.add('incorrect');
            }
        });

        // Track progress (optional: could track per card here too)
        NoteDex.updateDeckProgress(deckId, isCorrect);
        
        document.getElementById('next-quiz-btn').style.display = 'block';
    };

    document.getElementById('next-quiz-btn').addEventListener('click', loadNextQuizQuestion);
    document.getElementById('quiz-mode-btn').addEventListener('click', setupQuizMode);

    // --- End Session ---
    const endStudySession = () => {
        const total = totalCards;
        const known = knownCount;
        const unknown = total - known;

        const container = document.getElementById('flashcard-container');
        container.innerHTML = `
            <div class="session-summary">
                <h2>Session Complete! 🎉</h2>
                <p>You studied ${total} cards.</p>
                <p class="summary-known">Known: ${known}</p>
                <p class="summary-unknown">Unknown: ${unknown}</p>
                <a href="index.html" class="primary-btn">Go to All Decks</a>
                <button class="secondary-btn" onclick="setupFlashcardMode()">Study Again</button>
            </div>
        `;
        document.getElementById('study-actions').style.display = 'none';
    };
    
    const endQuizSession = () => {
         document.getElementById('quiz-view').innerHTML = `
            <div class="session-summary">
                <h2>Quiz Complete! 🎉</h2>
                <p>You finished all ${totalCards} questions.</p>
                <p>Your overall deck progress has been updated.</p>
                <a href="index.html" class="primary-btn">Go to All Decks</a>
                <button class="secondary-btn" onclick="setupQuizMode()">Quiz Again</button>
            </div>
        `;
    };

    // Default to showing mode selection
    document.getElementById('flashcard-view').classList.add('hidden');
    document.getElementById('quiz-view').classList.add('hidden');
    document.getElementById('mode-selection').classList.remove('hidden');

});