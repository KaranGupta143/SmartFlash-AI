<div align="center">

# ✦ SmartFlash AI
### Intelligent Flashcard Engine • Powered by GPT-4o

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Installation](#-getting-started) • [Algorithm](#-spaced-repetition-sm-2) • [Deployment](#-deployment)

---

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-00A67E?style=for-the-badge&logo=openai)](https://openai.com/)

</div>

---

## 📖 Overview
**SmartFlash AI** is a professional-grade EdTech platform that leverages Artificial Intelligence to transform static study materials into dynamic learning experiences. By combining **GPT-4o**'s advanced comprehension with the scientifically-proven **SM-2 Spaced Repetition Algorithm**, SmartFlash helps students and professionals master complex subjects with minimal effort and maximum retention.

> "Don't just read. Retain."

---

## ✨ Key Features

- **🧠 Intelligent PDF Ingestion**
  Upload any PDF (textbooks, lecture notes, research papers). Our engine extracts core concepts, definitions, and application-based questions with surgical precision.

- **🔁 Spaced Repetition (SM-2)**
  Uses the industry-standard SM-2 algorithm (popularized by Anki) to calculate the optimal time for you to review each card based on your past performance.

- **🎨 Premium Study Experience**
  A sleek, dark-themed interface featuring glassmorphic design, smooth 3D flip card animations, and responsive layouts for desktop and mobile.

- **📊 Comprehensive Analytics**
  Track your mastery levels, see your streak, and visualize cards "Due Today" via an intuitive dashboard.

- **🔐 Privacy First**
  Your study progress is saved locally in your browser. No accounts required. No tracking. Pure productivity.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Engine:** [OpenAI GPT-4o](https://platform.openai.com/)
- **PDF Processing:** [pdf2json](https://www.npmjs.com/package/pdf2json) (Pure Node implementation)
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
   ```bash
   touch .env.local
   ```
   Add your API key:
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
- **Easy (`Quality 5`):** Massive interval boost. Card won't appear for 7+ days.
- **Medium (`Quality 3`):** Moderate interval growth.
- **Hard (`Quality 1`):** Interval reset to 1 day. card will reappear in your next session.

---

## 📂 Project Structure

```text
smartflash-ai/
├── src/
│   ├── app/
│   │   ├── api/generate/   # PDF to JSON flashcard conversion
│   │   ├── dashboard/      # User analytics & progress
│   │   ├── decks/          # Deck management & practice screen
│   │   └── page.tsx        # High-conversion landing page
│   ├── components/         # Reusable UI components (Navbar, Cards, etc.)
│   └── lib/
│       ├── sm2.ts          # Core SR Algorithm
│       ├── storage.ts      # Browser-based persistence
│       └── openai.ts       # Prompt engineering & LLM integration
├── public/                 # Static assets
└── next.config.ts          # Turbopack & External Lib configuration
```

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub.
2. Connect your repository to [Vercel](https://vercel.com).
3. Add `OPENAI_API_KEY` to the **Environment Variables** in the project settings.
4. Deploy.

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.

---

<div align="center">
Built with ✦ by KaranGupta143
</div>
