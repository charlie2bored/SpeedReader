/**
 * Calculate Optimal Recognition Point (ORP) for a word based on its length
 * @param {string} word - The word to analyze
 * @returns {number} The index of the optimal recognition point (0-indexed)
 */
export function calculateORP(word) {
  // Advanced ORP calculation for optimal recognition point
  if (word.length === 1) {
    return 0 // 1st char for single-letter words
  } else if (word.length >= 2 && word.length <= 5) {
    return 1 // 2nd char for 2-5 letter words
  } else if (word.length >= 6 && word.length <= 9) {
    return 2 // 3rd char for 6-9 letter words
  } else if (word.length >= 10 && word.length <= 13) {
    return 3 // 4th char for 10-13 letter words
  } else if (word.length >= 14) {
    return 4 // 5th char for 14+ letter words
  }

  return 0 // fallback
}

/**
 * Split a word into prefix, focus-letter, and suffix based on ORP
 * @param {string} word - The word to split
 * @returns {object} Object with prefix, focusLetter, and suffix properties
 */
export function splitWordForORP(word) {
  const orpIndex = calculateORP(word)
  const actualIndex = Math.min(orpIndex, word.length - 1)

  return {
    prefix: word.substring(0, actualIndex),
    focusLetter: word.charAt(actualIndex),
    suffix: word.substring(actualIndex + 1)
  }
}

/**
 * Convert Words Per Minute to milliseconds delay
 * Formula: 60,000 / WPM
 * @param {number} wpm - Words per minute
 * @returns {number} Delay in milliseconds
 */
export function wpmToMs(wpm) {
  return 60000 / wpm
}

/**
 * Get the additional pause time in milliseconds for punctuation
 * @param {string} word - The word to check
 * @returns {number} Additional pause time in milliseconds (0 for no pause)
 */
export function getPunctuationPause(word) {
  const lastChar = word.slice(-1)

  switch (lastChar) {
    case '.':
    case '!':
    case '?':
      return 750 // 750ms pause for sentence-ending punctuation
    case ',':
      return 375 // 375ms pause for commas
    default:
      return 0 // No additional pause for other characters
  }
}

/**
 * Check if a word should have extended display time (punctuation)
 * @param {string} word - The word to check
 * @returns {boolean} True if word ends with punctuation that should pause
 */
export function shouldPause(word) {
  return getPunctuationPause(word) > 0
}

/**
 * Get comfort delay multiplier for words ending with punctuation (legacy compatibility)
 * @param {string} word - The word to check
 * @returns {number} - Delay multiplier (1.0 for normal, adjusted for punctuation)
 */
export function getComfortMultiplier(word) {
  const baseMs = 200 // Assuming 300 WPM = 200ms per word
  const pauseMs = getPunctuationPause(word)
  return (baseMs + pauseMs) / baseMs
}

// Example usage:
// const { prefix, focusLetter, suffix } = splitWordForORP("hello")
// console.log(prefix, focusLetter, suffix) // "h", "e", "llo"
// console.log(wpmToMs(300)) // 200 milliseconds
// console.log(getPunctuationPause("Hello.")) // 750ms (period)
// console.log(getPunctuationPause("Hello,")) // 375ms (comma)
// console.log(getPunctuationPause("Hello"))  // 0ms (no punctuation)
