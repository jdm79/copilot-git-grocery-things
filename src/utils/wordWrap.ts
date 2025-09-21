export function wrapWords(text: string): string {
  if (!text || text.trim() === '') return text;

  const words = text.split(' ');
  const wrappedWords: string[] = [];

  for (const word of words) {
    if (word.length <= 20) {
      wrappedWords.push(word);
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < word.length; i += 19) {
        const chunk = word.slice(i, i + 19);
        if (i + 19 < word.length) {
          chunks.push(chunk + '-');
        } else {
          chunks.push(chunk);
        }
      }
      wrappedWords.push(...chunks);
    }
  }

  return wrappedWords.join(' ');
}