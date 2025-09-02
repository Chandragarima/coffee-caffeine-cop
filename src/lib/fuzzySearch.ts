/**
 * Fuzzy search utilities for handling typos and misspellings
 */

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Common phonetic/typo patterns
const PHONETIC_CORRECTIONS: Record<string, string> = {
  'expresso': 'espresso',
  'capucino': 'cappuccino',
  'capuccino': 'cappuccino',
  'macchiato': 'macchiato',
  'latte': 'latte',
  'mocha': 'mocha',
  'americano': 'americano',
  'frappuccino': 'frappuccino',
  'frappe': 'frappe',
  'macchiatto': 'macchiato',
  'expreso': 'espresso',
  'capuchinno': 'cappuccino'
};

// Calculate fuzzy match score (0-1, higher is better)
function fuzzyScore(searchTerm: string, target: string): number {
  const search = searchTerm.toLowerCase();
  const text = target.toLowerCase();
  
  // Exact match gets highest score
  if (text === search) return 1.0;
  
  // Starts with gets high score
  if (text.startsWith(search)) return 0.9;
  
  // Contains gets medium score
  if (text.includes(search)) return 0.7;
  
  // Calculate edit distance score
  const distance = levenshteinDistance(search, text);
  const maxLength = Math.max(search.length, text.length);
  
  // Only consider matches with small edit distance relative to length
  const threshold = Math.max(1, Math.floor(maxLength * 0.3));
  if (distance > threshold) return 0;
  
  // Score based on edit distance (closer = higher score)
  return Math.max(0, (maxLength - distance) / maxLength) * 0.6;
}

export interface FuzzyMatch {
  item: any;
  score: number;
  correctedQuery?: string;
}

export function fuzzySearch<T>(
  items: T[], 
  searchTerm: string, 
  getSearchableText: (item: T) => string[],
  minScore: number = 0.3
): FuzzyMatch[] {
  const query = searchTerm.toLowerCase().trim();
  
  if (!query) return [];
  
  // Check for phonetic corrections
  const correctedQuery = PHONETIC_CORRECTIONS[query] || query;
  const useCorrection = correctedQuery !== query;
  
  const matches: FuzzyMatch[] = [];
  
  items.forEach(item => {
    const searchableTexts = getSearchableText(item);
    let bestScore = 0;
    
    searchableTexts.forEach(text => {
      // Try original query
      const originalScore = fuzzyScore(query, text);
      bestScore = Math.max(bestScore, originalScore);
      
      // Try corrected query if different
      if (useCorrection) {
        const correctedScore = fuzzyScore(correctedQuery, text);
        bestScore = Math.max(bestScore, correctedScore);
      }
    });
    
    if (bestScore >= minScore) {
      matches.push({
        item,
        score: bestScore,
        correctedQuery: useCorrection ? correctedQuery : undefined
      });
    }
  });
  
  // Sort by score (highest first)
  return matches.sort((a, b) => b.score - a.score);
}

export function getTypoSuggestion(searchTerm: string): string | null {
  const query = searchTerm.toLowerCase().trim();
  return PHONETIC_CORRECTIONS[query] || null;
}