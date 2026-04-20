// ─── Core Data Types ──────────────────────────────────────────────────────────

export type CardType = 'concept' | 'definition' | 'application' | 'example';
export type DifficultyRating = 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: CardType;
  tags: string[];
}

// ─── SM-2 Spaced Repetition State ─────────────────────────────────────────────

export interface CardProgress {
  cardId: string;
  easeFactor: number;       // SM-2 ease factor (starts at 2.5)
  interval: number;         // Days until next review
  repetitions: number;      // Number of successful reviews
  nextReview: number;       // Unix timestamp (ms)
  lastRating?: DifficultyRating;
  totalReviews: number;
  successCount: number;
}

// ─── Deck ─────────────────────────────────────────────────────────────────────

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: number;
  lastStudied?: number;
  color: string;            // Accent color for the deck card
  icon: string;             // Emoji icon
}

// ─── Deck with Progress ────────────────────────────────────────────────────────

export interface DeckWithProgress {
  deck: Deck;
  progress: Record<string, CardProgress>;
  masteredCount: number;
  dueCount: number;
  totalCount: number;
  masteryPercent: number;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface StudySession {
  deckId: string;
  startTime: number;
  cardsStudied: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface GenerateResponse {
  cards: Flashcard[];
  deckName: string;
  description: string;
}

export interface GenerateError {
  error: string;
}
