import { Deck, CardProgress, DeckWithProgress } from './types';
import { createInitialProgress, isDue, isMastered } from './sm2';

const DECKS_KEY = 'smartflash_decks';
const PROGRESS_PREFIX = 'smartflash_progress_';

// ─── Deck CRUD ────────────────────────────────────────────────────────────────

export function getDecks(): Deck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx >= 0) {
    decks[idx] = deck;
  } else {
    decks.unshift(deck);
  }
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

export function getDeck(id: string): Deck | null {
  return getDecks().find((d) => d.id === id) ?? null;
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter((d) => d.id !== id);
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  localStorage.removeItem(PROGRESS_PREFIX + id);
}

export function updateDeckLastStudied(id: string): void {
  const deck = getDeck(id);
  if (deck) {
    deck.lastStudied = Date.now();
    saveDeck(deck);
  }
}

// ─── Progress CRUD ────────────────────────────────────────────────────────────

export function getDeckProgress(deckId: string): Record<string, CardProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + deckId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCardProgress(deckId: string, progress: CardProgress): void {
  const all = getDeckProgress(deckId);
  all[progress.cardId] = progress;
  localStorage.setItem(PROGRESS_PREFIX + deckId, JSON.stringify(all));
}

export function getOrCreateCardProgress(
  deckId: string,
  cardId: string
): CardProgress {
  const all = getDeckProgress(deckId);
  if (all[cardId]) return all[cardId];
  const fresh = createInitialProgress(cardId);
  saveCardProgress(deckId, fresh);
  return fresh;
}

// ─── Aggregated Stats ─────────────────────────────────────────────────────────

export function getDeckWithProgress(deckId: string): DeckWithProgress | null {
  const deck = getDeck(deckId);
  if (!deck) return null;
  const progress = getDeckProgress(deckId);

  let masteredCount = 0;
  let dueCount = 0;

  for (const card of deck.cards) {
    const p = progress[card.id] ?? createInitialProgress(card.id);
    if (isMastered(p)) masteredCount++;
    if (isDue(p)) dueCount++;
  }

  const totalCount = deck.cards.length;
  const masteryPercent =
    totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return { deck, progress, masteredCount, dueCount, totalCount, masteryPercent };
}

export function getAllDeckStats(): DeckWithProgress[] {
  return getDecks()
    .map((d) => getDeckWithProgress(d.id))
    .filter(Boolean) as DeckWithProgress[];
}

// ─── Due Cards for a Deck ─────────────────────────────────────────────────────

export function getDueCards(deckId: string) {
  const deck = getDeck(deckId);
  if (!deck) return [];
  const progress = getDeckProgress(deckId);
  return deck.cards.filter((card) => {
    const p = progress[card.id];
    if (!p) return true; // Never studied → due
    return isDue(p);
  });
}

// ─── Global Stats ─────────────────────────────────────────────────────────────

export function getGlobalStats() {
  const all = getAllDeckStats();
  const totalDecks = all.length;
  const totalCards = all.reduce((s, d) => s + d.totalCount, 0);
  const masteredCards = all.reduce((s, d) => s + d.masteredCount, 0);
  const dueCards = all.reduce((s, d) => s + d.dueCount, 0);
  const avgMastery =
    totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  return { totalDecks, totalCards, masteredCards, dueCards, avgMastery };
}
