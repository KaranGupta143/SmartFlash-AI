'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeckWithProgress } from '@/lib/types';
import { getAllDeckStats } from '@/lib/storage';
import { Deck } from '@/lib/types';
import DeckCard from '@/components/DeckCard';
import UploadModal from '@/components/UploadModal';
import styles from './decks.module.css';

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithProgress[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  function reload() {
    setDecks(getAllDeckStats());
  }

  useEffect(() => {
    reload();
    setMounted(true);
  }, []);

  function handleSuccess(deck: Deck) {
    setShowModal(false);
    reload();
    router.push(`/decks/${deck.id}`);
  }

  const filtered = decks.filter((d) =>
    d.deck.name.toLowerCase().includes(search.toLowerCase()) ||
    d.deck.description.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>My Decks</h1>
            <p className={styles.pageSubtitle}>{decks.length} deck{decks.length !== 1 ? 's' : ''} · {decks.reduce((s, d) => s + d.totalCount, 0)} total cards</p>
          </div>
          <button className={styles.newBtn} onClick={() => setShowModal(true)} id="decks-upload-btn">
            + Upload PDF
          </button>
        </div>

        {/* Search */}
        {decks.length > 0 && (
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search decks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="deck-search"
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        )}

        {/* Deck Grid */}
        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((dwp) => (
              <DeckCard key={dwp.deck.id} dwp={dwp} onDelete={reload} />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📚</div>
            <h2 className={styles.emptyTitle}>No decks yet</h2>
            <p className={styles.emptyDesc}>
              Upload a PDF and SmartFlash AI will generate high-quality flashcards from your study material.
            </p>
            <button className={styles.emptyBtn} onClick={() => setShowModal(true)}>
              ✦ Upload Your First PDF
            </button>
            <div className={styles.emptyHints}>
              <span>📖 Textbooks</span>
              <span>📝 Lecture notes</span>
              <span>📄 Research papers</span>
              <span>📋 Study guides</span>
            </div>
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>No decks match &quot;{search}&quot;</p>
            <button onClick={() => setSearch('')}>Clear search</button>
          </div>
        )}
      </div>

      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
