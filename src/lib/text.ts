// Small helpers for working with text.

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Makes sure a handle starts with "@" (unless empty). */
export function formatHandle(handle: string): string {
  const clean = handle.trim().replace(/^@+/, "");
  return clean ? `@${clean}` : "";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strips punctuation from the ends of a word, e.g. "time." → "time". */
export function bareWord(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

export interface Segment {
  text: string;
  accent: boolean;
}

/** Splits one line of text into normal and accent parts. Matching ignores upper/lower case. */
export function splitAccents(line: string, accents: string[]): Segment[] {
  const marks = new Array<boolean>(line.length).fill(false);
  for (const phrase of accents) {
    const clean = phrase.trim();
    if (!clean) continue;
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(clean)}(?![\\p{L}\\p{N}])`, "giu");
    for (const match of line.matchAll(pattern)) {
      const start = match.index ?? 0;
      for (let i = start; i < start + match[0].length; i++) marks[i] = true;
    }
  }
  const segments: Segment[] = [];
  for (let i = 0; i < line.length; i++) {
    const last = segments[segments.length - 1];
    if (last && last.accent === marks[i]) last.text += line[i];
    else segments.push({ text: line[i], accent: marks[i] });
  }
  return segments;
}

function phraseWords(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .map((w) => bareWord(w));
}

/** True if this word is part of any accent phrase. */
export function isAccented(word: string, accents: string[]): boolean {
  const bare = bareWord(word).toLowerCase();
  if (!bare) return false;
  return accents.some((phrase) => phraseWords(phrase).includes(bare));
}

/** Adds or removes a tapped word from the accent list. */
export function toggleAccent(word: string, accents: string[]): string[] {
  const bare = bareWord(word);
  if (!bare) return accents;
  const lower = bare.toLowerCase();
  if (isAccented(word, accents)) {
    return accents.filter((phrase) => !phraseWords(phrase).includes(lower));
  }
  return [...accents, bare];
}

/** Keeps only accent phrases that still appear in the text. */
export function accentsInText(accents: string[], text: string): string[] {
  return accents.filter((a) => splitAccents(text, [a]).some((s) => s.accent));
}

/** Splits text into lines; a single long line is split into sentences. */
export function linesOrSentences(text: string): string[] {
  const lines = text.split("\n");
  if (lines.filter((l) => l.trim()).length > 1) return lines;
  const sentences = text.trim().split(/(?<=[.!?])\s+/);
  return sentences.length > 1 ? sentences : lines;
}
