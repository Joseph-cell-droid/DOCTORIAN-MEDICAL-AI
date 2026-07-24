export function generateProfessionalTitle(rawText: string): string {
  if (!rawText || !rawText.trim()) return "Clinical Inquiry";

  // 1. Remove markdown tags, formatting, carriage returns, leading/trailing spaces
  let clean = rawText
    .trim()
    .replace(/^[\#\*\_\`\-\>\s]+/, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ');

  // 2. Remove common conversational greetings, filler verbs, and question starters
  const prefixPatterns = [
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|doctorian|doctor|dr)[,\.\!\?\s]*/i,
    /^(can you|could you|please|kindly|i need|i want|would you|help me|tell me|explain|describe|what is|what are|how to|how do i|how can i|give me|show me|list|summary of|detail|find|provide|is there|why does|why do|can we|can i)[,\.\!\?\s]*/i,
    /^(can you tell me|can you explain|can you give me|i want to know|i need to know|what is the|what are the|how do i manage|how to treat|help with|details about|information on|guidelines for|protocol for)[,\.\!\?\s]*/i
  ];

  let phrase = clean;
  // Apply stripping passes to clean stacked preambles
  for (let pass = 0; pass < 3; pass++) {
    for (const pattern of prefixPatterns) {
      phrase = phrase.replace(pattern, '');
    }
  }

  // Remove trailing punctuation (?, !, ., ,, :, ;)
  phrase = phrase.replace(/[\?\!\.\,\:\;\-\_]+$/g, '').trim();

  // Fallback if stripped phrase became empty or too short (< 3 chars)
  if (phrase.length < 3) {
    phrase = clean.replace(/[\?\!\.\,\:\;\-\_]+$/g, '').trim();
  }

  if (!phrase) return "Clinical Consultation";

  // 3. Limit to 6 words max for clean, scannable history card titles
  const words = phrase.split(' ');
  if (words.length > 6) {
    phrase = words.slice(0, 6).join(' ');
  }

  // 4. Convert to Title Case smartly with minor word exceptions
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of', 'v', 'vs']);
  const titleCased = phrase
    .split(' ')
    .map((w, idx) => {
      if (!w) return '';
      const lower = w.toLowerCase();
      // Preserve uppercase medical abbreviations / acronyms (e.g., TB, HIV, ART, IV, ECG, ICU, MRI, CPR)
      if (w === w.toUpperCase() && w.length >= 2 && w.length <= 5) {
        return w;
      }
      if (idx > 0 && minorWords.has(lower)) {
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(' ');

  // 5. Length constraint (max 38 characters to fit perfectly in history cards without ugly wrapping)
  if (titleCased.length > 38) {
    const truncated = titleCased.substring(0, 36);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 12) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  }

  return titleCased || "Clinical Inquiry";
}
