'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Deck } from '@/lib/types';
import UploadModal from '@/components/UploadModal';
import styles from './page.module.css';

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Generation', desc: 'GPT-4o analyzes your PDF and creates high-quality cards covering concepts, definitions, applications, and examples.' },
  { icon: '🔁', title: 'Spaced Repetition', desc: 'SM-2 algorithm schedules reviews at the perfect moment — just before you forget — for maximum retention.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'See your mastery level per deck, track weak spots, and visualize your learning over time.' },
  { icon: '⚡', title: 'Instant Practice', desc: 'Start studying within seconds of uploading. No setup, no accounts — just pure focused learning.' },
];

const STATS = [
  { value: '10x', label: 'Faster Learning' },
  { value: '94%', label: 'Retention Rate' },
  { value: '∞', label: 'PDF Support' },
];

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  function handleSuccess(deck: Deck) {
    setShowModal(false);
    router.push(`/decks/${deck.id}`);
  }

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />
        <div className={styles.container}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Powered by GPT-4o
          </div>

          <h1 className={styles.heroTitle}>
            Turn any PDF into<br />
            <span className="gradient-text">Smart Flashcards</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Upload your study materials and let AI craft high-quality flashcards.<br />
            Then master them with spaced repetition — the scientifically proven method.
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.uploadBtn}
              onClick={() => setShowModal(true)}
              id="hero-upload-btn"
            >
              <span className={styles.uploadBtnIcon}>📄</span>
              Upload PDF & Generate Cards
            </button>
            <Link href="/decks" className={styles.viewDecksBtn}>
              View My Decks →
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.heroStats}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.heroStat}>
                <span className={styles.heroStatValue}>{s.value}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating card preview */}
        <div className={styles.cardPreview}>
          <div className={styles.previewCard}>
            <div className={styles.previewCardHeader}>
              <span className="badge badge-concept">Concept</span>
              <span className={styles.previewCardNum}>1 / 24</span>
            </div>
            <p className={styles.previewCardQ}>What is the difference between supervised and unsupervised learning?</p>
            <div className={styles.previewCardHint}>Click to reveal →</div>
          </div>
          <div className={styles.previewCard2}>
            <div className={styles.previewCardHeader}>
              <span className="badge badge-application">Application</span>
            </div>
            <p className={styles.previewCardQ}>When would you use a CNN over an RNN?</p>
          </div>
          <div className={styles.previewCard3}>
            <div className={styles.previewCardHeader}>
              <span className="badge badge-definition">Definition</span>
            </div>
            <p className={styles.previewCardQ}>Define: Gradient Descent</p>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className={styles.howSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSubtitle}>From PDF to mastery in three steps</p>
          <div className={styles.steps}>
            {[
              { num: '01', icon: '📄', title: 'Upload your PDF', desc: 'Upload any textbook, lecture notes, or research paper up to 20 MB.' },
              { num: '02', icon: '✦', title: 'AI generates cards', desc: 'GPT-4o reads and understands your content, then crafts thoughtful flashcards — never shallow ones.' },
              { num: '03', icon: '🔁', title: 'Study & master', desc: 'Rate each card. The SM-2 algorithm schedules reviews so you spend time where it matters most.' },
            ].map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < 2 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Built for serious learners</h2>
          <p className={styles.sectionSubtitle}>Every detail designed to maximize your retention</p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} />
            <h2 className={styles.ctaTitle}>Ready to study smarter?</h2>
            <p className={styles.ctaSubtitle}>Upload your first PDF and get flashcards in under 30 seconds.</p>
            <button
              className={styles.ctaBtn}
              onClick={() => setShowModal(true)}
              id="cta-upload-btn"
            >
              ✦ Get Started — It&apos;s Free
            </button>
          </div>
        </div>
      </section>

      {/* Upload Modal */}
      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
