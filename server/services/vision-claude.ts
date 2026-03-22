import Anthropic from '@anthropic-ai/sdk';
import type { VisionResult } from './vision.js';

const client = new Anthropic();

export async function analyzeImageClaude(base64: string): Promise<VisionResult> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Identify the main object in this image as specifically as possible. Include brand and model number/name if recognizable. Translate all descriptive words to Norwegian Bokmål, but keep proper nouns (brand names, model names) in their original form. Respond with only a JSON object in this exact format, no other text: {"name": "specific name here", "category": "Annet"}. Examples: {"name": "DeWalt DCD777 drill", "category": "Annet"} → {"name": "DeWalt DCD777 boremaskin", "category": "Annet"}. A generic red chair → {"name": "rød stol", "category": "Annet"}.',
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { name: parsed.name ?? 'Ukjent', category: 'Annet' };
    }
  } catch (err) {
    console.error('Claude vision error:', err);
  }

  return { name: 'Ukjent', category: 'Annet' };
}

export async function translateToNorwegian(name: string): Promise<string> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: `Translate the following English object name to Norwegian Bokmål. Keep proper nouns (brand names, model names) unchanged. Respond with only the translated name, no extra text.\n\n${name}`,
        },
      ],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    return text || name;
  } catch (err) {
    console.error('Claude translate error:', err);
    return name;
  }
}
