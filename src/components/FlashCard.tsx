'use client';

import { useState } from 'react';
import { Flashcard, CardProgress, DifficultyRating } from '@/lib/types';
import styles from './FlashCard.module.css';

interface FlashCardProps {
  card: Flashcard;
  progress?: CardProgress;
  cardNumber: number;
  totalCards: number;
  onRate: (rating: DifficultyRating) => void;
}

export default function FlashCard({
  card,
  progress,
  cardNumber,
  totalCards,
  onRate,
}: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [rating, setRating] = useState<DifficultyRating | null>(null);

  function handleFlip() {
    setFlipped((f) => !f);
  }

  function handleRate(r: DifficultyRating) {
    setRating(r);
    setTimeout(() => {
      setFlipped(false);
      setRating(null);
      onRate(r);
    }, 400);
  }

  const typeLabels: Record<string, string> = {
    concept: 'Concept',
    definition: 'Definition',
    application: 'Application',
    example: 'Example',
  };

  return (
    <div className={styles.wrapper}>
      {/* Session progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${((cardNumber - 1) / totalCards) * 100}%` }}
        />
      </div>

      <div className={styles.meta}>
        <span className={`badge badge-${card.type}`}>{typeLabels[card.type] ?? card.type}</span>
        <span className={styles.counter}>{cardNumber} / {totalCards}</span>
      </div>

      {/* 3D Flip Card */}
      <div
        className={`${styles.scene} ${flipped ? styles.flipped : ''}`}
        onClick={!flipped ? handleFlip : undefined}
        role="button"
        aria-label={flipped ? 'Card answer' : 'Click to reveal answer'}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); }}
      >
        <div className={styles.card}>
          {/* Front */}
          <div className={styles.front}>
            <div className={styles.cardGlow} />
            <div className={styles.cardContent}>
              <p className={styles.hint}>Click to reveal answer</p>
              <h2 className={styles.question}>{card.front}</h2>
              {card.tags.length > 0 && (
                <div className={styles.tags}>
                  {card.tags.slice(0, 3).map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.flipHint}>
              <span>↩ Flip</span>
            </div>
          </div>

          {/* Back */}
          <div className={styles.back}>
            <div className={styles.cardGlowCyan} />
            <div className={styles.cardContent}>
              <p className={styles.answerLabel}>Answer</p>
              <p className={styles.answer}>{card.back}</p>
            </div>

            {/* Rating buttons */}
            {!rating && (
              <div className={styles.ratingSection}>
                <p className={styles.ratingLabel}>How well did you know this?</p>
                <div className={styles.ratingButtons}>
                  <button
                    className={`${styles.ratingBtn} ${styles.hard}`}
                    onClick={(e) => { e.stopPropagation(); handleRate('hard'); }}
                  >
                    <span className={styles.ratingIcon}>🔥</span>
                    Hard
                    <span className={styles.ratingHint}>Soon</span>
                  </button>
                  <button
                    className={`${styles.ratingBtn} ${styles.medium}`}
                    onClick={(e) => { e.stopPropagation(); handleRate('medium'); }}
                  >
                    <span className={styles.ratingIcon}>⚡</span>
                    Medium
                    <span className={styles.ratingHint}>3 days</span>
                  </button>
                  <button
                    className={`${styles.ratingBtn} ${styles.easy}`}
                    onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
                  >
                    <span className={styles.ratingIcon}>✓</span>
                    Easy
                    <span className={styles.ratingHint}>7+ days</span>
                  </button>
                </div>
              </div>
            )}

            {rating && (
              <div className={styles.ratedFeedback}>
                {rating === 'easy' && <span>✓ Great job!</span>}
                {rating === 'medium' && <span>⚡ Got it!</span>}
                {rating === 'hard' && <span>🔥 Keep practicing!</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      {!flipped && (
        <p className={styles.keyboardHint}>Press <kbd>Space</kbd> or <kbd>Enter</kbd> to flip</p>
      )}
    </div>
  );
}
