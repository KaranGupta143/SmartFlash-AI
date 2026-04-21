import OpenAI from 'openai';
import { Flashcard, CardType } from './types';
import { v4 as uuidv4 } from 'uuid';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

// ─── Prompt Engineering ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert educator and curriculum designer with 20 years of experience creating flashcards for university students, professional certification exams, and self-learners.

Your flashcards are NEVER generic or shallow. They:
- Target specific, important concepts that a student must deeply understand
- Use precise, unambiguous language
- Include worked examples where relevant
- Cover edge cases and common misconceptions
- Vary question types to test different cognitive levels (recall, understanding, application, analysis)

You always respond with valid JSON only. No markdown, no explanation outside the JSON.`;

function buildUserPrompt(text: string, chunkIndex: number, totalChunks: number): string {
  return `You are analyzing chunk ${chunkIndex + 1} of ${totalChunks} from a study document.

DOCUMENT TEXT:
---
${text}
---

Generate high-quality flashcards from this content. 

RULES:
1. Generate 8–15 cards for this chunk (vary count based on content density)
2. Cover: key concepts, definitions, relationships between ideas, applications, edge cases, examples
3. AVOID: trivial facts, overly obvious questions, duplicate concepts
4. Each card must add unique educational value
5. Use student-friendly language — clear and direct
6. Question types: "concept", "definition", "application", "example"

Respond ONLY with this JSON (no markdown, no extra text):
{
  "deckName": "<inferred topic name, 2-5 words>",
  "description": "<one sentence describing what this material covers>",
  "cards": [
    {
      "front": "<question or concept prompt>",
      "back": "<clear, complete answer — include examples if helpful>",
      "type": "<concept|definition|application|example>",
      "tags": ["<topic tag>"]
    }
  ]
}`;
}

// ─── Text Chunking ─────────────────────────────────────────────────────────────

function chunkText(text: string, maxChars = 6000): string[] {
  // Split on paragraph boundaries to avoid cutting mid-sentence
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + para).length > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += '\n\n' + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.slice(0, maxChars)];
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function deduplicateCards(cards: Flashcard[]): Flashcard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = card.front.toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Main Generation Function ─────────────────────────────────────────────────

export interface GenerationResult {
  cards: Flashcard[];
  deckName: string;
  description: string;
}

export async function generateFlashcards(
  extractedText: string
): Promise<GenerationResult> {
  const client = getClient();
  const chunks = chunkText(extractedText);
  const MAX_CHUNKS = 2; // Reduced for Vercel Hobby stability (10s timeout)
  const chunksToProcess = chunks.slice(0, MAX_CHUNKS);

  let allCards: Flashcard[] = [];
  let deckName = 'Study Deck';
  let description = 'Generated flashcards from uploaded PDF.';

  for (let i = 0; i < chunksToProcess.length; i++) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(chunksToProcess[i], i, chunksToProcess.length) },
      ],
      temperature: 0.7,
      max_tokens: 1500, // Reduced for faster response time
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    
    try {
      const parsed = JSON.parse(content);
      
      if (i === 0) {
        deckName = parsed.deckName || deckName;
        description = parsed.description || description;
      }

      const rawCards: Array<{front: string; back: string; type: string; tags: string[]}> = parsed.cards || [];
      const flashcards: Flashcard[] = rawCards.map((c) => ({
        id: uuidv4(),
        front: c.front || '',
        back: c.back || '',
        type: (c.type as CardType) || 'concept',
        tags: Array.isArray(c.tags) ? c.tags : [],
      })).filter((c) => c.front && c.back);

      allCards = [...allCards, ...flashcards];
    } catch {
      console.error('Failed to parse OpenAI response for chunk', i);
    }
  }

  return {
    cards: deduplicateCards(allCards),
    deckName,
    description,
  };
}
