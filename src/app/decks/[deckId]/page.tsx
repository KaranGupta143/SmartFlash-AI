'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Flashcard, DifficultyRating } from '@/lib/types';
import {
  getDeckWithProgress,
  getOrCreateCardProgress,
  saveCardProgress,
  updateDeckLastStudied,
  getDueCards,
} from '@/lib/storage';
import { updateProgress } from '@/lib/sm2';
import FlashCard from '@/components/FlashCard';
import ProgressRing from '@/components/ProgressRing';
import styles from './practice.module.css';

type SessionMode = 'due' | 'all';

interface SessionResult {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [mode, setMode] = useState<SessionMode>('due');
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'study' | 'complete'>('setup');
  const [result, setResult] = useState<SessionResult>({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [mounted, setMounted] = useState(false);

  const dwp = mounted ? getDeckWithProgress(deckId) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  function startSession(m: SessionMode) {
    setMode(m);
    let cards: Flashcard[] = [];
    if (!dwp) return;

    if (m === 'due') {
      cards = getDueCards(deckId);
    } else {
      cards = [...dwp.deck.cards];
    }

    // Shuffle the cards
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    setQueue(cards);
    setCurrentIndex(0);
    setResult({ easy: 0, medium: 0, hard: 0, total: 0 });
    setPhase('study');
    updateDeckLastStudied(deckId);
  }

  const handleRate = useCallback(
    (rating: DifficultyRating) => {
      const card = queue[currentIndex];
      if (!card) return;

      // Update SM-2 progress
      const current = getOrCreateCardProgress(deckId, card.id);
      const updated = updateProgress(current, rating);
      saveCardProgress(deckId, updated);

      // Update session results
      setResult((r) => ({
        ...r,
        [rating]: r[rating] + 1,
        total: r.total + 1,
      }));

      // Move to next card or complete
      if (currentIndex + 1 >= queue.length) {
        setPhase('complete');
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [queue, currentIndex, deckId]
  );

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}><div className="spinner" /></div>
      </div>
    );
  }

  if (!dwp) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Deck not found</h2>
          <Link href="/decks" className={styles.backLink}>← Back to decks</Link>
        </div>
      </div>
    );
  }

  const { deck, masteredCount, dueCount, totalCount, masteryPercent } = dwp;

  // ── Setup phase ───────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Back */}
          <Link href="/decks" className={styles.backBtn}>← Back to Decks</Link>

          {/* Deck header */}
          <div className={styles.deckHeader}>
            <div className={styles.deckIconWrap} style={{ background: `${deck.color}20`, borderColor: `${deck.color}40` }}>
              <span className={styles.deckIcon}>{deck.icon}</span>
            </div>
            <div>
              <h1 className={styles.deckName}>{deck.name}</h1>
              <p className={styles.deckDesc}>{deck.description}</p>
            </div>
          </div>

          <div className={styles.setupGrid}>
            {/* Stats */}
            <div className={styles.statsCard}>
              <h2 className={styles.cardTitle}>Deck Stats</h2>
              <div className={styles.ringRow}>
                <ProgressRing
                  percent={masteryPercent}
                  size={120}
                  strokeWidth={8}
                  color={deck.color}
                  label={`${masteryPercent}%`}
                  sublabel="Mastered"
                />
                <div className={styles.statsDetail}>
                  {[
                    { label: 'Total Cards', value: totalCount, color: 'var(--text-primary)' },
                    { label: 'Mastered', value: masteredCount, color: '#34d399' },
                    { label: 'Due Now', value: dueCount, color: '#fbbf24' },
                    { label: 'In Progress', value: totalCount - masteredCount - dueCount, color: 'var(--text-muted)' },
                  ].map((s) => (
                    <div key={s.label} className={styles.statsRow}>
                      <span className={styles.statsLabel}>{s.label}</span>
                      <span className={styles.statsValue} style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Session options */}
            <div className={styles.sessionCard}>
              <h2 className={styles.cardTitle}>Start a Session</h2>
              <div className={styles.modeCards}>
                {dueCount > 0 && (
                  <button
                    className={`${styles.modeCard} ${styles.modePrimary}`}
                    onClick={() => startSession('due')}
                    id="study-due-btn"
                  >
                    <div className={styles.modeTop}>
                      <span className={styles.modeIcon}>⏰</span>
                      <span className={styles.modeBadge}>{dueCount} cards</span>
                    </div>
                    <h3 className={styles.modeTitle}>Study Due Cards</h3>
                    <p className={styles.modeDesc}>Focus on cards that are scheduled for review today. Most efficient study method.</p>
                    <span className={styles.modeArrow}>Start Session →</span>
                  </button>
                )}

                <button
                  className={`${styles.modeCard} ${styles.modeSecondary}`}
                  onClick={() => startSession('all')}
                  id="study-all-btn"
                >
                  <div className={styles.modeTop}>
                    <span className={styles.modeIcon}>📚</span>
                    <span className={styles.modeBadge}>{totalCount} cards</span>
                  </div>
                  <h3 className={styles.modeTitle}>Review Entire Deck</h3>
                  <p className={styles.modeDesc}>Go through all cards in random order. Good for a comprehensive review.</p>
                  <span className={styles.modeArrow}>Start →</span>
                </button>
              </div>

              {dueCount === 0 && (
                <div className={styles.allCaughtUp}>
                  <span>🎉</span>
                  <p>All caught up! No cards due today. You can still review the full deck.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card preview list */}
          <div className={styles.cardList}>
            <h2 className={styles.sectionTitle}>All Cards in this Deck</h2>
            <div className={styles.cardListGrid}>
              {deck.cards.slice(0, 12).map((card, i) => (
                <div key={card.id} className={styles.cardListItem}>
                  <span className={`badge badge-${card.type}`}>{card.type}</span>
                  <p className={styles.cardListQ}>{card.front}</p>
                </div>
              ))}
              {deck.cards.length > 12 && (
                <div className={styles.cardListMore}>+{deck.cards.length - 12} more cards</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Study phase ───────────────────────────────────────────────────────────
  if (phase === 'study') {
    const card = queue[currentIndex];
    const progress = getOrCreateCardProgress(deckId, card.id);

    return (
      <div className={styles.page}>
        <div className={styles.studyContainer}>
          {/* Top bar */}
          <div className={styles.studyTopBar}>
            <button className={styles.exitBtn} onClick={() => setPhase('setup')}>← Exit</button>
            <div className={styles.studyMeta}>
              <span className={styles.studyModeBadge}>{mode === 'due' ? '⏰ Due Cards' : '📚 Full Review'}</span>
              <span className={styles.studyDeckName}>{deck.name}</span>
            </div>
            <div />
          </div>

          <FlashCard
            card={card}
            progress={progress}
            cardNumber={currentIndex + 1}
            totalCards={queue.length}
            onRate={handleRate}
          />
        </div>
      </div>
    );
  }

  // ── Complete phase ─────────────────────────────────────────────────────────
  const successRate = result.total > 0
    ? Math.round(((result.easy + result.medium) / result.total) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.completeCard}>
          {/* Confetti-style header */}
          <div className={styles.completeHeader}>
            <div className={styles.completeEmoji}>
              {successRate >= 80 ? '🏆' : successRate >= 60 ? '⚡' : '💪'}
            </div>
            <h1 className={styles.completeTitle}>Session Complete!</h1>
            <p className={styles.completeSubtitle}>
              You reviewed <strong>{result.total}</strong> cards {mode === 'due' ? 'from your due queue' : 'from the full deck'}
            </p>
          </div>

          {/* Score ring */}
          <div className={styles.completeRingWrap}>
            <ProgressRing
              percent={successRate}
              size={160}
              strokeWidth={12}
              color={successRate >= 80 ? '#10b981' : successRate >= 60 ? '#f59e0b' : '#f43f5e'}
              label={`${successRate}%`}
              sublabel="Success Rate"
            />
          </div>

          {/* Breakdown */}
          <div className={styles.breakdownGrid}>
            <div className={`${styles.breakdownItem} ${styles.bEasy}`}>
              <span className={styles.bIcon}>✓</span>
              <span className={styles.bValue}>{result.easy}</span>
              <span className={styles.bLabel}>Easy</span>
            </div>
            <div className={`${styles.breakdownItem} ${styles.bMedium}`}>
              <span className={styles.bIcon}>⚡</span>
              <span className={styles.bValue}>{result.medium}</span>
              <span className={styles.bLabel}>Medium</span>
            </div>
            <div className={`${styles.breakdownItem} ${styles.bHard}`}>
              <span className={styles.bIcon}>🔥</span>
              <span className={styles.bValue}>{result.hard}</span>
              <span className={styles.bLabel}>Hard</span>
            </div>
          </div>

          {/* SM-2 note */}
          <div className={styles.sm2Note}>
            <span>🔁</span>
            <p>
              SmartFlash AI has scheduled your next reviews using the SM-2 algorithm.
              {result.hard > 0 && ` ${result.hard} difficult card${result.hard > 1 ? 's' : ''} will appear again soon.`}
              {result.easy > 0 && ` ${result.easy} easy card${result.easy > 1 ? 's' : ''} won't appear for 7+ days.`}
            </p>
          </div>

          {/* Actions */}
          <div className={styles.completeActions}>
            <button
              className={styles.studyAgainBtn}
              onClick={() => startSession(mode)}
            >
              {mode === 'due' ? '🔄 Study Due Cards Again' : '🔄 Full Deck Again'}
            </button>
            <Link href="/decks" className={styles.backToDecksBtn}>
              ← Back to Decks
            </Link>
            <Link href="/dashboard" className={styles.dashboardBtn}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
