import Anthropic from '@anthropic-ai/sdk';
import type { VisionResult } from './vision.js';
import { flattenCategories } from '../../src/app/lib/data.js';

const client = new Anthropic();

function buildCategoryList(): string {
  return flattenCategories()
    .filter(c => !flattenCategories().some(other => other.id !== c.id && other.id.startsWith(c.id + '.')))
    .map(c => `${c.id}: ${c.label}`)
    .join('\n');
}

const CATEGORY_LIST = buildCategoryList();

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
              text: `Identify the main object in this image as specifically as possible. Include brand and model number/name if recognizable. Translate all descriptive words to Norwegian Bokmål, but keep proper nouns (brand names, model names) in their original form.

Then select the single best matching category ID from this list:
${CATEGORY_LIST}

Respond with only a JSON object in this exact format, no other text:
{"name": "specific name here", "category": "category.id-from-list"}`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { name: parsed.name ?? 'Ukjent', category: parsed.category ?? 'annet' };
    }
  } catch (err) {
    console.error('Claude vision error:', err);
  }

  return { name: 'Ukjent', category: 'annet' };
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
