import { useState, useEffect, useCallback, useMemo } from 'react'
import TextInput from './components/TextInput'
import ReadingPane from './components/ReadingPane'
import SpeedControl from './components/SpeedControl'
import PlaybackControls from './components/PlaybackControls'
import ProgressBar from './components/ProgressBar'
import { calculateORP, splitWordForORP, wpmToMs, getPunctuationPause } from './utils/orpUtils'
import { usePreciseTimer } from './hooks/usePreciseTimer'
import './App.css'

function App() {
  // Reading state
  const [text, setText] = useState('')
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(300)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [startTime, setStartTime] = useState(null)

  // Text processing function
  const processText = useCallback((inputText) => {
    const processedWords = inputText
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
    setWords(processedWords)
    setCurrentIndex(0)
  }, [])

  // Handle text input changes
  const handleTextChange = useCallback((newText) => {
    setText(newText)
    processText(newText)
  }, [processText])

  // Get word display data with ORP splitting
  const getWordDisplayData = useCallback((word) => {
    return splitWordForORP(word)
  }, [])

  // Advanced timing with specific punctuation pauses
  const getWordInterval = useCallback((word) => {
    const baseInterval = wpmToMs(wpm)
    const punctuationPause = getPunctuationPause(word)
    return baseInterval + punctuationPause
  }, [wpm, wpmToMs])

  // Precise timer callback
  const handleWordAdvance = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= words.length) {
        setIsPlaying(false)
        return prev
      }
      return next
    })
  }, [words.length])

  // Initialize precise timer with current word's interval
  const currentWord = words[currentIndex]
  const currentInterval = currentWord ? getWordInterval(currentWord) : wpmToMs(wpm)

  usePreciseTimer(handleWordAdvance, currentInterval, isPlaying && currentIndex < words.length)

  // Play/pause functionality
  const play = useCallback(() => {
    if (words.length === 0) return
    setIsPlaying(true)
    setStartTime(performance.now())
  }, [words.length])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
    setStartTime(null)
  }, [])

  // Focus mode toggle
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev)
  }, [])

  // Handle speed changes with optimized re-rendering
  const handleSpeedChange = useCallback((newWpm) => {
    setWpm(newWpm)
    // If currently playing, restart with new speed
    if (isPlaying) {
      pause()
      // Use requestAnimationFrame for smoother restart
      requestAnimationFrame(() => play())
    }
  }, [isPlaying, pause, play])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Spacebar: play/pause
      if (e.code === 'Space') {
        e.preventDefault()
        if (isPlaying) {
          pause()
        } else if (words.length > 0) {
          play()
        }
      }

      // 'R': reset
      if (e.code === 'KeyR') {
        e.preventDefault()
        reset()
      }

      // 'F': toggle focus mode
      if (e.code === 'KeyF' && words.length > 0) {
        e.preventDefault()
        toggleFocusMode()
      }

      // Escape: exit focus mode
      if (e.code === 'Escape' && isFocusMode) {
        e.preventDefault()
        toggleFocusMode()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, words.length, play, pause, reset, toggleFocusMode, isFocusMode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Timer cleanup is handled by the usePreciseTimer hook
    }
  }, [])

  // Memoize expensive calculations
  const progress = useMemo(() =>
    words.length > 0 ? (currentIndex / words.length) * 100 : 0,
    [words.length, currentIndex]
  )

  const wordsRead = currentIndex
  const totalWords = words.length

  // Memoize current word display data
  const currentWordData = useMemo(() => {
    if (words.length === 0 || currentIndex >= words.length) return null
    return getWordDisplayData(words[currentIndex])
  }, [words, currentIndex, getWordDisplayData])

  return (
    <div className={`app ${isFocusMode ? 'focus-mode' : ''}`}>
      {!isFocusMode && (
        <header>
          <h1>RSVP Speed Reader</h1>
          <p>Read at 100-1000 Words Per Minute with Optimal Recognition Point highlighting</p>
        </header>
      )}

      <main className={isFocusMode ? 'focus-main' : ''}>
        {!isFocusMode && (
          <div className="input-section">
            <TextInput
              text={text}
              onTextChange={handleTextChange}
              wordCount={totalWords}
            />
          </div>
        )}

        <div className="reading-section">
          <ReadingPane
            currentWordData={currentWordData}
            isReadyState={words.length === 0}
            isFocusMode={isFocusMode}
          />

          <div className={`controls-section ${isFocusMode ? 'focus-controls' : ''}`}>
            <SpeedControl
              wpm={wpm}
              onSpeedChange={handleSpeedChange}
            />

            <PlaybackControls
              isPlaying={isPlaying}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              disabled={words.length === 0}
            />

            {words.length > 0 && (
              <button
                onClick={toggleFocusMode}
                className="focus-mode-btn"
              >
                {isFocusMode ? '📱 Exit Focus' : '🎯 Focus Mode'}
              </button>
            )}
          </div>

          {!isFocusMode && (
            <ProgressBar
              progress={progress}
              wordsRead={wordsRead}
              totalWords={totalWords}
              wpm={wpm}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App