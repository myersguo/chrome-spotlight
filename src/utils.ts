export function fuzzySearch(query: string, results: string[]): string[] {
  const shouldSplitChar = (char: string) => 
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Arabic}\p{Script=Hangul}]/u.test(char);

  const splitMixedPart = (part: string): string[] => {
    const chunks: string[] = [];
    let currentChunk = "";
    
    for (const char of part) {
      if (shouldSplitChar(char)) {
        if (currentChunk) {
          chunks.push(currentChunk.toLowerCase());
          currentChunk = "";
        }
        chunks.push(char.toLowerCase());
      } else {
        currentChunk += char;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.toLowerCase());
    }
    
    return chunks;
  };

  const keywords = query
    .split(/\s+/) 
    .flatMap(part => splitMixedPart(part))
    .filter(k => k.length > 0);

  if (keywords.length === 0) return [...results];

  return results.filter(result => {
    const lowerResult = result.toLowerCase();
    return keywords.every(keyword => lowerResult.includes(keyword));
  });
}

  export function fuzzyMatch(query: string, compare: string): boolean {
    return fuzzySearch(query, [compare]).length > 0;
  }
