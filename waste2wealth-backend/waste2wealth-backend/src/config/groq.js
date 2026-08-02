const Groq = require('groq-sdk');

if (!process.env.GROQ_API_KEY) {
  console.warn('[Groq] WARNING: GROQ_API_KEY is not set. AI features will fail until it is configured.');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEXT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'llama-3.2-90b-vision-preview';

/**
 * Calls Groq chat completion and expects a strict JSON object back.
 * Uses response_format json_object where supported, plus a system instruction,
 * plus defensive parsing (models occasionally wrap JSON in prose or code fences).
 *
 * @param {Object} params
 * @param {string} params.system - system prompt enforcing role + JSON contract
 * @param {string} params.user - user prompt with the actual data to reason over
 * @param {number} [params.temperature=0.3]
 * @param {string} [params.model]
 * @returns {Promise<Object>} parsed JSON object
 */
async function groqJSON({ system, user, temperature = 0.3, model = TEXT_MODEL }) {
  const completion = await groq.chat.completions.create({
    model,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  return safeParseJSON(raw);
}

/**
 * Calls Groq with an image (base64 data URL or public URL) for vision-based tasks
 * such as waste classification from a photo.
 */
async function groqVisionJSON({ system, prompt, imageUrl, temperature = 0.2 }) {
  const completion = await groq.chat.completions.create({
    model: VISION_MODEL,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  return safeParseJSON(raw);
}

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        throw new Error('Groq returned unparseable JSON: ' + raw.slice(0, 300));
      }
    }
    throw new Error('Groq returned unparseable JSON: ' + raw.slice(0, 300));
  }
}

module.exports = { groq, groqJSON, groqVisionJSON, TEXT_MODEL, VISION_MODEL };
