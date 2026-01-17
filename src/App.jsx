import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import TextInput from './components/TextInput'
import ReadingPane from './components/ReadingPane'
import SpeedControl from './components/SpeedControl'
import PlaybackControls from './components/PlaybackControls'
import ProgressBar from './components/ProgressBar'
import { calculateORP, splitWordForORP, wpmToMs, getPunctuationPause } from './utils/orpUtils'
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

  // Timer ref for word timing
  const wordTimerRef = useRef(null)

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

  // Precise timer callback - advances word and schedules next with correct timing
  const handleWordAdvance = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= words.length) {
        setIsPlaying(false)
        return prev
      }

      // Schedule next word with its specific timing
      const nextWord = words[next]
      const nextInterval = nextWord ? getWordInterval(nextWord) : wpmToMs(wpm)
      wordTimerRef.current = setTimeout(() => {
        handleWordAdvance()
      }, nextInterval)

      return next
    })
  }, [words, getWordInterval, wpmToMs])

  // Play/pause functionality
  const play = useCallback(() => {
    if (words.length === 0 || currentIndex >= words.length) return

    // Clear any existing timer
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current)
    }

    setIsPlaying(true)
    setStartTime(performance.now())

    // Start timing for the current word
    const currentWord = words[currentIndex]
    const interval = currentWord ? getWordInterval(currentWord) : wpmToMs(wpm)

    wordTimerRef.current = setTimeout(() => {
      handleWordAdvance()
    }, interval)
  }, [words, currentIndex, getWordInterval, wpmToMs, handleWordAdvance])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current)
      wordTimerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current)
      wordTimerRef.current = null
    }
    setCurrentIndex(0)
    setStartTime(null)
  }, [])

  // Focus mode toggle
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (wordTimerRef.current) {
        clearTimeout(wordTimerRef.current)
      }
    }
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
      // Don't trigger shortcuts when user is typing in input fields
      const activeElement = document.activeElement
      const isInputFocused = activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.contentEditable === 'true')

      if (isInputFocused) return

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

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!isPlaying || words.length === 0) return null

    const remainingWords = words.length - currentIndex
    const avgWordTime = wpmToMs(wpm) // Base time, punctuation adds extra
    const estimatedMs = remainingWords * avgWordTime
    const minutes = Math.floor(estimatedMs / 60000)
    const seconds = Math.floor((estimatedMs % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [isPlaying, words.length, currentIndex, wpm])

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