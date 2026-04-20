import { CardProgress, DifficultyRating } from './types';

// ─── SM-2 Algorithm ───────────────────────────────────────────────────────────
// Based on the SuperMemo SM-2 spaced repetition algorithm.
// Maps our 3-button UX (easy/medium/hard) to SM-2 quality grades (0–5).

const QUALITY_MAP: Record<DifficultyRating, number> = {
  easy: 5,    // Perfect recall with ease
  medium: 3,  // Correct recall with some effort
  hard: 1,    // Incorrect / very difficult
};

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

export function createInitialProgress(cardId: string): CardProgress {
  return {
    cardId,
    easeFactor: INITIAL_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    totalReviews: 0,
    successCount: 0,
  };
}

export function updateProgress(
  current: CardProgress,
  rating: DifficultyRating
): CardProgress {
  const quality = QUALITY_MAP[rating];
  const now = Date.now();

  let { easeFactor, interval, repetitions } = current;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    ...current,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastRating: rating,
    totalReviews: current.totalReviews + 1,
    successCount: current.successCount + (quality >= 3 ? 1 : 0),
  };
}

export function isDue(progress: CardProgress): boolean {
  return Date.now() >= progress.nextReview;
}

export function isMastered(progress: CardProgress): boolean {
  // Mastered = reviewed at least 3 times, interval >= 7 days, success rate >= 70%
  if (progress.totalReviews < 3) return false;
  if (progress.interval < 7) return false;
  const successRate = progress.successCount / progress.totalReviews;
  return successRate >= 0.7;
}

export function getNextReviewLabel(progress: CardProgress): string {
  const diff = progress.nextReview - Date.now();
  if (diff <= 0) return 'Due now';
  const hours = diff / (1000 * 60 * 60);
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 30) return `${Math.round(days)}d`;
  return `${Math.round(days / 30)}mo`;
}
