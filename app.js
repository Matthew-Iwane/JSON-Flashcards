// State
let cards = [];
let currentIndex = 0;

// DOM Elements
const elements = {
  jsonInput: document.getElementById('jsonInput'),
  message: document.getElementById('message'),
  example: document.getElementById('example'),
  flashcardSection: document.getElementById('flashcardSection'),
  emptyState: document.getElementById('emptyState'),
  currentIndex: document.getElementById('currentIndex'),
  totalCards: document.getElementById('totalCards'),
  frontText: document.getElementById('frontText'),
  backText: document.getElementById('backText'),
  card: document.getElementById('card'),
};

// Initialize app
function init() {
  loadFromStorage();
  bindEvents();
  updateUI();
}

// Load cards from localStorage
function loadFromStorage() {
  const saved = localStorage.getItem('flashcards');
  if (saved) {
    try {
      cards = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved cards:', e);
    }
  }
}

// Save cards to localStorage
function saveToStorage() {
  localStorage.setItem('flashcards', JSON.stringify(cards));
}

// Bind event listeners
function bindEvents() {
  document.getElementById('importBtn').addEventListener('click', importCards);
  document.getElementById('exampleBtn').addEventListener('click', toggleExample);
  document.getElementById('clearBtn').addEventListener('click', clearDeck);
  document.getElementById('cardContainer').addEventListener('click', flipCard);
  document.getElementById('prevBtn').addEventListener('click', prevCard);
  document.getElementById('nextBtn').addEventListener('click', nextCard);
  document.getElementById('shuffleBtn').addEventListener('click', shuffle);

  // Keyboard navigation
  document.addEventListener('keydown', handleKeydown);
}

// Handle keyboard input
function handleKeydown(e) {
  // Ignore if typing in textarea
  if (e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      flipCard();
      break;
    case 'ArrowRight':
      nextCard();
      break;
    case 'ArrowLeft':
      prevCard();
      break;
  }
}

// Import cards from JSON input
function importCards() {
  const input = elements.jsonInput.value.trim();

  if (!input) {
    showMessage('Please paste some JSON first.', 'error');
    return;
  }

  try {
    const parsed = JSON.parse(input);
    validateCards(parsed);

    cards = parsed;
    currentIndex = 0;
    saveToStorage();

    showMessage(`✓ Imported ${cards.length} cards!`, 'success');
    elements.jsonInput.value = '';
    updateUI();
  } catch (e) {
    showMessage(`Error: ${e.message}`, 'error');
  }
}

// Validate card structure
function validateCards(parsed) {
  if (!Array.isArray(parsed)) {
    throw new Error('JSON must be an array');
  }

  if (parsed.length === 0) {
    throw new Error('Array is empty');
  }

  for (let i = 0; i < parsed.length; i++) {
    if (!parsed[i].front || !parsed[i].back) {
      throw new Error(`Card ${i + 1} is missing "front" or "back" field`);
    }
  }
}

// Show message to user
function showMessage(text, type) {
  elements.message.innerHTML = `<p class="${type}">${text}</p>`;
}

// Toggle example visibility
function toggleExample() {
  elements.example.classList.toggle('visible');
}

// Clear all cards
function clearDeck() {
  if (cards.length === 0 || confirm('Clear all flashcards?')) {
    cards = [];
    currentIndex = 0;
    localStorage.removeItem('flashcards');
    showMessage('Deck cleared.', 'success');
    updateUI();
  }
}

// Update UI based on current state
function updateUI() {
  if (cards.length === 0) {
    elements.flashcardSection.classList.remove('active');
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.flashcardSection.classList.add('active');
  elements.emptyState.style.display = 'none';

  elements.currentIndex.textContent = currentIndex + 1;
  elements.totalCards.textContent = cards.length;
  elements.frontText.textContent = cards[currentIndex].front;
  elements.backText.textContent = cards[currentIndex].back;

  // Reset flip state
  elements.card.classList.remove('flipped');
}

// Flip the current card
function flipCard() {
  elements.card.classList.toggle('flipped');
}

// Go to next card
function nextCard() {
  if (cards.length === 0) return;
  currentIndex = (currentIndex + 1) % cards.length;
  updateUI();
}

// Go to previous card
function prevCard() {
  if (cards.length === 0) return;
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateUI();
}

// Shuffle the deck
function shuffle() {
  if (cards.length < 2) return;

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  currentIndex = 0;
  saveToStorage();
  updateUI();
}

// Start the app
init();