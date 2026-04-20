'use client';

import { useRef, useState, useCallback } from 'react';
import { Deck, GenerateResponse } from '@/lib/types';
import { saveDeck } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import styles from './UploadModal.module.css';

const DECK_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#3b82f6', '#ec4899',
];
const DECK_ICONS = ['📚', '🧠', '⚡', '🔬', '📐', '💡', '🎯', '🌍', '🧬', '💻'];

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (deck: Deck) => void;
}

type Step = 'upload' | 'generating' | 'done' | 'error';

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.');
      return;
    }
    setFile(f);
    setErrorMsg('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  async function handleGenerate() {
    if (!file) return;
    setStep('generating');
    setProgress(10);
    setStatusMsg('Extracting text from PDF…');

    const formData = new FormData();
    formData.append('file', file);

    // Fake progress animation while waiting for AI
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) { clearInterval(progressInterval); return 85; }
        return p + Math.random() * 8;
      });
      const msgs = [
        'Extracting text from PDF…',
        'Analyzing key concepts…',
        'Identifying definitions…',
        'Crafting application questions…',
        'Generating example-based cards…',
        'Removing duplicates…',
        'Finalizing your deck…',
      ];
      setStatusMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 1500);

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setProgress(95);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setProgress(100);
      setResult(data as GenerateResponse);
      setStep('done');
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  function handleSave() {
    if (!result) return;
    const deck: Deck = {
      id: uuidv4(),
      name: result.deckName,
      description: result.description,
      cards: result.cards,
      createdAt: Date.now(),
      color: DECK_COLORS[Math.floor(Math.random() * DECK_COLORS.length)],
      icon: DECK_ICONS[Math.floor(Math.random() * DECK_ICONS.length)],
    };
    saveDeck(deck);
    onSuccess(deck);
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Upload PDF</h2>
            <p className={styles.subtitle}>AI will generate smart flashcards automatically</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <div className={styles.body}>
            <div
              className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className={styles.fileInput}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {file ? (
                <div className={styles.fileSelected}>
                  <div className={styles.fileIcon}>📄</div>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <span className={styles.changeFile}>Click to change file</span>
                </div>
              ) : (
                <div className={styles.dropzoneInner}>
                  <div className={styles.uploadIcon}>📁</div>
                  <p className={styles.dropText}>Drop your PDF here</p>
                  <p className={styles.dropSubtext}>or click to browse</p>
                  <div className={styles.dropHints}>
                    <span>✓ Textbooks</span>
                    <span>✓ Lecture notes</span>
                    <span>✓ Research papers</span>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && <p className={styles.errorMsg}>⚠ {errorMsg}</p>}

            <div className={styles.footer}>
              <p className={styles.footerNote}>Max 20 MB · PDF with selectable text only</p>
              <button
                className={styles.generateBtn}
                onClick={handleGenerate}
                disabled={!file}
              >
                <span>✦</span> Generate Flashcards
              </button>
            </div>
          </div>
        )}

        {/* Generating step */}
        {step === 'generating' && (
          <div className={styles.body}>
            <div className={styles.generatingSection}>
              <div className={styles.aiOrb}>
                <div className={styles.orbRing} />
                <div className={styles.orbRing2} />
                <span className={styles.orbIcon}>✦</span>
              </div>
              <h3 className={styles.generatingTitle}>Crafting your flashcards…</h3>
              <p className={styles.statusMsg}>{statusMsg}</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressLabel}>{Math.round(progress)}%</p>
              <p className={styles.aiNote}>GPT-4o is analyzing your PDF and creating high-quality cards</p>
            </div>
          </div>
        )}

        {/* Done step */}
        {step === 'done' && result && (
          <div className={styles.body}>
            <div className={styles.successSection}>
              <div className={styles.successIcon}>🎉</div>
              <h3 className={styles.successTitle}>{result.deckName}</h3>
              <p className={styles.successDesc}>{result.description}</p>
              <div className={styles.successStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{result.cards.length}</span>
                  <span className={styles.statLabel}>Cards Generated</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{result.cards.filter(c => c.type === 'concept').length}</span>
                  <span className={styles.statLabel}>Concept Cards</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{result.cards.filter(c => c.type === 'application').length}</span>
                  <span className={styles.statLabel}>Application Cards</span>
                </div>
              </div>
              <div className={styles.previewCards}>
                <p className={styles.previewLabel}>Preview:</p>
                {result.cards.slice(0, 3).map((card, i) => (
                  <div key={i} className={styles.previewCard}>
                    <span className={`badge badge-${card.type}`}>{card.type}</span>
                    <p className={styles.previewQ}>{card.front}</p>
                  </div>
                ))}
              </div>
              <button className={styles.saveBtn} onClick={handleSave}>
                Save Deck & Start Studying →
              </button>
            </div>
          </div>
        )}

        {/* Error step */}
        {step === 'error' && (
          <div className={styles.body}>
            <div className={styles.errorSection}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3 className={styles.errorTitle}>Something went wrong</h3>
              <p className={styles.errorText}>{errorMsg}</p>
              <button className={styles.retryBtn} onClick={() => setStep('upload')}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
