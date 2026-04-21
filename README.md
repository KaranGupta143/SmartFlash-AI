<div align="center">

# ✦ SmartFlash AI
### Intelligent Flashcard Engine • Powered by GPT-4o

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Installation](#-getting-started) • [Algorithm](#-spaced-repetition-sm-2) • [Deployment](#-deployment)

---

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-00A67E?style=for-the-badge&logo=openai)](https://openai.com/)

</div>

---

## 📖 Overview
Most students spend hours re-reading notes — yet forget most of what they study. The problem isn’t effort. It’s the method.

**SmartFlash AI** transforms static PDFs into intelligent, adaptive flashcards designed for **long-term retention**, not short-term cramming. Instead of passively consuming content, users actively learn through:

* **Concept-driven flashcards** (not shallow Q&A)
* **Adaptive spaced repetition** (SM-2)
* **Continuous feedback** on weak vs strong areas

**The Goal:** Turn studying into a system that actually works.

---

## ✨ Key Features

- **🧠 Intelligent PDF Ingestion**
  Upload any PDF (textbooks, lecture notes, research papers). Our engine extracts **concepts, definitions, examples, and relationships** — not just surface-level summaries.

- **🔁 Spaced Repetition (SM-2)**
  Uses the industry-standard SM-2 algorithm to intelligently schedule reviews based on your performance. Focus on what you *don't* know.

- **🎨 Premium Study Experience**
  A sleek, dark-themed interface featuring glassmorphic design, smooth 3D flip card animations, and responsive layouts for desktop and mobile.

- **📊 Comprehensive Analytics**
  Track your mastery levels, see your streak, and visualize cards "Due Today" via an intuitive dashboard.

- **🔐 Privacy First**
  Your study progress is saved locally in your browser. No accounts required. No tracking. Pure productivity.

---

## 🎯 What Makes It Different

* **Not a basic PDF converter:** Most tools just summarize; we build a curriculum.
* **Deep Understanding:** Focuses on comprehension, not just shallow recall.
* **Edge Case Coverage:** Generates cards for examples and complex relationships.
* **Science-Backed:** Built entirely on learning science principles (Active Recall + Spaced Repetition).

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Engine:** [OpenAI GPT-4o](https://platform.openai.com/)
- **PDF Processing:** [pdf2json](https://www.npmjs.com/package/pdf2json)
- **Styling:** CSS Modules with Vanilla CSS Variables
- **Storage:** Web Storage API (localStorage)
- **Animations:** CSS Keyframes & 3D Transforms

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- An OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KaranGupta143/SmartFlash-AI.git
   cd smartflash-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

4. **Launch development server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to see it in action.

---

## 🧠 Spaced Repetition (SM-2)

SmartFlash AI implements a refined version of the **SuperMemo-2 (SM-2)** algorithm. For every card, we track:
- **Ease Factor (EF):** Controls how quickly the review interval grows.
- **Interval (I):** The number of days until the next review.
- **Repetitions (R):** Successful consecutive reviews.

### Grading Logic:
- **Easy:** Massive interval boost. Card won't appear for 7+ days.
- **Medium:** Moderate interval growth.
- **Hard:** Interval reset to 1 day. Card will reappear imminently.

---

## ⚠️ Challenges & Learnings

* **Card Quality:** Engineering expert prompts to ensure AI generates non-generic, high-utility cards.
* **Deduplication:** Designing logic to avoid repeating similar content within large PDFs.
* **UX/UI Flow:** Balancing complex spaced repetition logic with a clean, intuitive interface.

---

## 🚀 Future Roadmap

* [ ] **Advanced SM-2 Optimization:** Adaptive easing based on specific subject difficulty.
* [ ] **Deeper Analytics:** Visual heatmaps of learning progress and peak memory retention.
* [ ] **Collaborative Decks:** Share AI-generated decks with classmates or teams.
* [ ] **Multi-Model Support:** Integration with Claude 3.5 and Gemini Pro.

---

## 🎯 Conclusion

SmartFlash AI transforms passive studying into an **adaptive, intelligent learning system**. It’s not just about creating flashcards — it’s about helping users **actually remember what they learn**.

---

<div align="center">
Built with ✦ by Karan Gupta
</div>
