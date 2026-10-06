/**
 * The assistant writes a deliberately small dialect: paragraphs, "•"/"-" bullets and
 * **bold**. This turns it into blocks the bubble can render with plain <Text>, so there
 * is no markdown library in the bundle and nothing unexpected can render.
 */

export interface Run {
  text: string;
  bold: boolean;
}

export type Block = { type: 'paragraph'; runs: Run[] } | { type: 'bullets'; items: Run[][] };

const BULLET = /^\s*(?:[•\-*]|\d+[.)])\s+/;

/** Splits `**bold**` spans out of a line. Unbalanced markers are left as literal text. */
export const parseInline = (line: string): Run[] => {
  const runs: Run[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of line.matchAll(re)) {
    const start = match.index;
    if (start > last) runs.push({ text: line.slice(last, start), bold: false });
    runs.push({ text: match[1]!, bold: true });
    last = start + match[0].length;
  }
  if (last < line.length) runs.push({ text: line.slice(last), bold: false });
  return runs.length ? runs : [{ text: '', bold: false }];
};

export const parseMarkdownLite = (text: string): Block[] => {
  const blocks: Block[] = [];
  const chunks = text
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/);
  for (const chunk of chunks) {
    const lines = chunk.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    // A run of bullet lines is a list; a list with a lead-in sentence keeps the sentence as its own paragraph.
    const firstBullet = lines.findIndex((l) => BULLET.test(l));
    if (firstBullet !== -1 && lines.slice(firstBullet).every((l) => BULLET.test(l))) {
      if (firstBullet > 0) blocks.push({ type: 'paragraph', runs: parseInline(lines.slice(0, firstBullet).join(' ')) });
      blocks.push({ type: 'bullets', items: lines.slice(firstBullet).map((l) => parseInline(l.replace(BULLET, ''))) });
    } else {
      blocks.push({ type: 'paragraph', runs: parseInline(lines.join(' ')) });
    }
  }
  return blocks;
};

/** First line, without markup, for list previews. */
export const previewOf = (text: string, max = 80): string => {
  const flat = text.replace(/\*\*/g, '').replace(BULLET, '').replace(/\s+/g, ' ').trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
};
