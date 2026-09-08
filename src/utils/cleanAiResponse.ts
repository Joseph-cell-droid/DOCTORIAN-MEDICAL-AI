/**
 * cleanAiResponse.ts
 * Ensures AI chat responses are modern, completely free of '**' bolding artifacts,
 * and richly styled with interactive emojis.
 */

export function cleanAiResponse(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    // Strip bolding double-asterisks: **text** -> text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Strip single-asterisk italics/emphasis: *text* -> text
    .replace(/\*(.*?)\*/g, '$1')
    // Strip any remaining lone double asterisks
    .replace(/\*\*/g, '')
    // Strip lone single asterisks that are not bullets
    .replace(/(^|\s)\*(?!\s)/g, '$1')
    .replace(/\*(?=\s|$)/g, '')
    // Convert markdown bullet asterisks or dashes into clean round bullets
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    // Convert markdown headers like ### Title into clean Title
    .replace(/^#{1,6}\s+/gm, '')
    // Clean up excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

/**
 * Ensures the response has rich, friendly emojis to make it modern and interactive.
 * If the response lacks emojis or has very few, this injects appropriate medical emojis
 * into key headings and bullet points.
 */
export function ensureModernEmojiInteractivity(text: string): string {
  let cleaned = cleanAiResponse(text);
  if (!cleaned) return cleaned;

  // Check if text already has a good amount of emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const emojiCount = (cleaned.match(new RegExp(emojiRegex.source, 'gu')) || []).length;

  if (emojiCount >= 3) {
    return cleaned;
  }

  // Inject emojis into common clinical section headers if missing
  cleaned = cleaned
    .replace(/^(Clinical Overview|Clinical Impression|Assessment|Overview):/gim, '🩺 $1:')
    .replace(/^(Recommended Actions|Recommendations|Management|Next Steps):/gim, '💡 $1:')
    .replace(/^(Medication|Medications|Prescriptions|Supportive Care):/gim, '💊 $1:')
    .replace(/^(Warning Signs|Emergency Signs|Red Flags|Precautions):/gim, '⚠️ $1:')
    .replace(/^(Hydration|Fluids|Nutrition|Diet):/gim, '💧 $1:')
    .replace(/^(Monitoring|Vitals|Tracking):/gim, '📊 $1:')
    .replace(/^(Follow-up|Next Consultation|Questions):/gim, '❓ $1:');

  return cleaned;
}

/**
 * Parses a bot message and extracts interactive question prompts or generates
 * contextual quick-reply chips so the patient can engage with one tap.
 */
export function extractInteractiveSuggestions(text: string): string[] {
  const lower = (text || '').toLowerCase();
  const suggestions: string[] = [];

  // Look for direct questions in the text (lines ending in ? or starting with ❓)
  const lines = (text || '').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.endsWith('?') && (trimmed.includes('how') || trimmed.includes('have you') || trimmed.includes('do you') || trimmed.includes('when') || trimmed.includes('temperature') || trimmed.includes('fever') || trimmed.includes('pain') || trimmed.startsWith('❓'))) {
      // Create a contextual answer
      if (trimmed.includes('temperature') || trimmed.includes('fever')) {
        if (!suggestions.includes('🌡️ My temp is normal')) suggestions.push('🌡️ My temp is normal');
        if (!suggestions.includes('🔥 High fever (>38°C)')) suggestions.push('🔥 High fever (>38°C)');
      } else if (trimmed.includes('how long') || trimmed.includes('days') || trimmed.includes('when did')) {
        if (!suggestions.includes('⏱️ Started today')) suggestions.push('⏱️ Started today');
        if (!suggestions.includes('📅 Started 2-3 days ago')) suggestions.push('📅 Started 2-3 days ago');
      } else if (trimmed.includes('pain') || trimmed.includes('severe')) {
        if (!suggestions.includes('⚡ Mild discomfort')) suggestions.push('⚡ Mild discomfort');
        if (!suggestions.includes('😣 Severe / worsening')) suggestions.push('😣 Severe / worsening');
      }
    }
  }

  // Contextual chips based on keywords
  if (lower.includes('fever') || lower.includes('temperature') || lower.includes('musujja')) {
    if (suggestions.length < 3 && !suggestions.includes('💊 What medicine can I take?')) {
      suggestions.push('💊 What medicine can I take?');
    }
    if (suggestions.length < 4 && !suggestions.includes('💧 Oral rehydration advice')) {
      suggestions.push('💧 Oral rehydration advice');
    }
  } else if (lower.includes('malaria') || lower.includes('mosquito')) {
    if (suggestions.length < 3 && !suggestions.includes('🔬 Where can I get an RDT test?')) {
      suggestions.push('🔬 Where can I get an RDT test?');
    }
    if (suggestions.length < 4 && !suggestions.includes('💊 Artemether/Coartem dosage')) {
      suggestions.push('💊 Artemether/Coartem dosage');
    }
  } else if (lower.includes('cough') || lower.includes('breathe') || lower.includes('chest')) {
    if (suggestions.length < 3 && !suggestions.includes('🫁 Breathing exercises')) {
      suggestions.push('🫁 Breathing exercises');
    }
    if (suggestions.length < 4 && !suggestions.includes('🚨 Warning signs for pneumonia')) {
      suggestions.push('🚨 Warning signs for pneumonia');
    }
  } else if (lower.includes('headache') || lower.includes('migraine')) {
    if (suggestions.length < 3 && !suggestions.includes('🛌 Natural relief tips')) {
      suggestions.push('🛌 Natural relief tips');
    }
  }

  // Default interactive options if none matched
  if (suggestions.length === 0) {
    suggestions.push('🩺 Explain in simpler terms');
    suggestions.push('💊 What should I avoid?');
    suggestions.push('🏥 When should I see a doctor?');
    suggestions.push('✨ What home remedies help?');
  }

  return suggestions.slice(0, 4);
}
