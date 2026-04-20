'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeckWithProgress } from '@/lib/types';
import { getAllDeckStats, getGlobalStats } from '@/lib/storage';
import { Deck } from '@/lib/types';
import UploadModal from '@/components/UploadModal';
import ProgressRing from '@/components/ProgressRing';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithProgress[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDecks(getAllDeckStats());
    setMounted(true);
  }, []);

  function handleSuccess(deck: Deck) {
    setShowModal(false);
    router.push(`/decks/${deck.id}`);
  }

  const stats = mounted ? getGlobalStats() : { totalDecks: 0, totalCards: 0, masteredCards: 0, dueCards: 0, avgMastery: 0 };

  const recentDecks = decks.slice(0, 3);
  const dueDecks = decks.filter((d) => d.dueCount > 0).slice(0, 4);

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Your learning overview</p>
          </div>
          <button className={styles.newDeckBtn} onClick={() => setShowModal(true)}>
            + Upload New PDF
          </button>
        </div>

        {/* Global Stats */}
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Decks', value: stats.totalDecks, icon: '📚', color: '#7c3aed' },
            { label: 'Total Cards', value: stats.totalCards, icon: '🃏', color: '#06b6d4' },
            { label: 'Mastered', value: stats.masteredCards, icon: '✅', color: '#10b981' },
            { label: 'Due Today', value: stats.dueCards, icon: '⏰', color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div>
                <p className={styles.statValue} style={{ color: s.color }}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          {/* Left: Mastery Ring + Quick Actions */}
          <div className={styles.leftCol}>
            {/* Overall Mastery */}
            <div className={styles.masteryCard}>
              <h2 className={styles.cardTitle}>Overall Mastery</h2>
              <div className={styles.masteryContent}>
                <ProgressRing
                  percent={stats.avgMastery}
                  size={140}
                  strokeWidth={10}
                  color="#7c3aed"
                  label={`${stats.avgMastery}%`}
                  sublabel="Mastered"
                />
                <div className={styles.masteryDetails}>
                  <div className={styles.masteryItem}>
                    <span className={styles.mDot} style={{ background: '#7c3aed' }} />
                    <span>{stats.masteredCards} mastered</span>
                  </div>
                  <div className={styles.masteryItem}>
                    <span className={styles.mDot} style={{ background: '#f59e0b' }} />
                    <span>{stats.dueCards} due for review</span>
                  </div>
                  <div className={styles.masteryItem}>
                    <span className={styles.mDot} style={{ background: '#475569' }} />
                    <span>{stats.totalCards - stats.masteredCards} in progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
              <div className={styles.actionList}>
                <button className={styles.actionItem} onClick={() => setShowModal(true)}>
                  <span className={styles.actionIcon}>📄</span>
                  <div>
                    <p className={styles.actionTitle}>Upload PDF</p>
                    <p className={styles.actionDesc}>Generate new flashcards</p>
                  </div>
                  <span className={styles.actionArrow}>→</span>
                </button>
                <Link href="/decks" className={styles.actionItem}>
                  <span className={styles.actionIcon}>📚</span>
                  <div>
                    <p className={styles.actionTitle}>All Decks</p>
                    <p className={styles.actionDesc}>Browse and manage</p>
                  </div>
                  <span className={styles.actionArrow}>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Due Reviews + Recent Decks */}
          <div className={styles.rightCol}>
            {/* Due for review */}
            <div className={styles.dueSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.cardTitle}>Due for Review</h2>
                {dueDecks.length > 0 && (
                  <span className={styles.dueBadge}>{stats.dueCards} cards</span>
                )}
              </div>
              {dueDecks.length === 0 ? (
                <div className={styles.emptyState}>
                  <span>🎉</span>
                  <p>All caught up! No cards due.</p>
                </div>
              ) : (
                <div className={styles.dueList}>
                  {dueDecks.map((dwp) => (
                    <Link
                      key={dwp.deck.id}
                      href={`/decks/${dwp.deck.id}`}
                      className={styles.dueItem}
                      style={{ '--deck-color': dwp.deck.color } as React.CSSProperties}
                    >
                      <span className={styles.dueIcon}>{dwp.deck.icon}</span>
                      <div className={styles.dueMeta}>
                        <p className={styles.dueName}>{dwp.deck.name}</p>
                        <p className={styles.dueCount}>{dwp.dueCount} cards due</p>
                      </div>
                      <span className={styles.dueArrow}>Study →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Per-deck mastery */}
            {recentDecks.length > 0 && (
              <div className={styles.deckMasterySection}>
                <h2 className={styles.cardTitle}>Deck Progress</h2>
                <div className={styles.deckMasteryList}>
                  {recentDecks.map((dwp) => (
                    <div key={dwp.deck.id} className={styles.deckMasteryItem}>
                      <div className={styles.deckMasteryHeader}>
                        <span>{dwp.deck.icon} {dwp.deck.name}</span>
                        <span className={styles.deckMasteryPct} style={{ color: dwp.deck.color }}>
                          {dwp.masteryPercent}%
                        </span>
                      </div>
                      <div className={styles.deckMasteryTrack}>
                        <div
                          className={styles.deckMasteryFill}
                          style={{ width: `${dwp.masteryPercent}%`, background: dwp.deck.color }}
                        />
                      </div>
                      <div className={styles.deckMasteryMeta}>
                        <span>{dwp.masteredCount}/{dwp.totalCount} mastered</span>
                        <span>{dwp.dueCount} due</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {decks.length === 0 && (
              <div className={styles.noDecksCard}>
                <div className={styles.noDecksIcon}>📚</div>
                <h3>No decks yet</h3>
                <p>Upload a PDF to create your first flashcard deck</p>
                <button className={styles.noDecksBtn} onClick={() => setShowModal(true)}>
                  Upload PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
