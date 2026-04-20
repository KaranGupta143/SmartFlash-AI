'use client';

import Link from 'next/link';
import { DeckWithProgress } from '@/lib/types';
import { deleteDeck } from '@/lib/storage';
import { useState } from 'react';
import { getNextReviewLabel } from '@/lib/sm2';
import styles from './DeckCard.module.css';

interface DeckCardProps {
  dwp: DeckWithProgress;
  onDelete: () => void;
}

export default function DeckCard({ dwp, onDelete }: DeckCardProps) {
  const { deck, masteredCount, dueCount, totalCount, masteryPercent } = dwp;
  const [confirming, setConfirming] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (confirming) {
      deleteDeck(deck.id);
      onDelete();
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  const nextDue = Object.values(dwp.progress).reduce(
    (min, p) => (p.nextReview < min ? p.nextReview : min),
    Infinity
  );

  return (
    <div className={styles.card} style={{ '--deck-color': deck.color } as React.CSSProperties}>
      <div className={styles.colorBar} />
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <span className={styles.icon}>{deck.icon}</span>
          </div>
          <button
            className={`${styles.deleteBtn} ${confirming ? styles.confirmDelete : ''}`}
            onClick={handleDelete}
            title={confirming ? 'Click again to confirm' : 'Delete deck'}
          >
            {confirming ? '⚠ Confirm?' : '✕'}
          </button>
        </div>

        {/* Name & description */}
        <h3 className={styles.name}>{deck.name}</h3>
        <p className={styles.desc}>{deck.description}</p>

        {/* Mastery bar */}
        <div className={styles.masteryWrap}>
          <div className={styles.masteryTrack}>
            <div
              className={styles.masteryFill}
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
          <span className={styles.masteryLabel}>{masteryPercent}% mastered</span>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalCount}</span>
            <span className={styles.statLbl}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: '#34d399' }}>{masteredCount}</span>
            <span className={styles.statLbl}>Mastered</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: '#fbbf24' }}>{dueCount}</span>
            <span className={styles.statLbl}>Due</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {dueCount > 0 ? (
            <Link href={`/decks/${deck.id}`} className={styles.studyBtn}>
              Study Now ({dueCount} due)
            </Link>
          ) : (
            <Link href={`/decks/${deck.id}`} className={styles.reviewBtn}>
              Review Deck
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
