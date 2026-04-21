import { NextRequest, NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/openai';

// Use Node.js runtime for PDF processing
export const runtime = 'nodejs';
export const maxDuration = 60; // Note: Hobby plans are capped at 10s

// Polyfill DOMMatrix for PDF libraries that might check for it in serverless envs
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}

export async function POST(req: NextRequest) {
  console.log('--- API: Generate Flashcards Started ---');
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is missing');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    // 20 MB limit
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 20 MB.' }, { status: 400 });
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    try {
      // Use pdf2json for robust, Node-safe PDF text extraction
      const PDFParser = (await import('pdf2json')).default;
      
      const textPromise = new Promise<string>((resolve, reject) => {
        const pdfParser = new (PDFParser as any)();
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('PDF Parser Error:', errData);
          reject(new Error(errData.parserError || 'Failed to parse PDF'));
        });
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          let text = '';
          if (pdfData && pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              page.Texts.forEach((textItem: any) => {
                // Texts in pdf2json are URI encoded
                if (textItem.R && textItem.R[0]) {
                  text += decodeURIComponent(textItem.R[0].T) + ' ';
                }
              });
              text += '\n';
            });
          }
          resolve(text);
        });
        
        pdfParser.parseBuffer(buffer);
      });
      
      extractedText = await textPromise;
    } catch (err) {
      console.error('PDF parse error:', err);
      return NextResponse.json(
        { error: 'Could not read PDF. Make sure it contains selectable text (not just scanned images).' },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or contains only images. Please upload a PDF with text content.' },
        { status: 422 }
      );
    }

    // Generate flashcards via OpenAI
    const result = await generateFlashcards(extractedText);

    if (result.cards.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate flashcards from this document. Try a different PDF.' },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Generate route error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
