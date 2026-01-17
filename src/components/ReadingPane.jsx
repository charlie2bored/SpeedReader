import { memo } from 'react'
import './ReadingPane.css'

const ReadingPane = memo(({ currentWordData, isReadyState, isFocusMode }) => {
  if (isReadyState) {
    return (
      <div className="reading-pane">
        <div className="word-container">
          <div className="word-display ready-state">
            Ready to read
          </div>
        </div>
      </div>
    )
  }

  if (!currentWordData) {
    return (
      <div className="reading-pane">
        <div className="word-container">
          <div className="word-display">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  const { prefix, focusLetter, suffix } = currentWordData

  return (
    <div className={`reading-pane ${isFocusMode ? 'focus-mode' : ''}`}>
      <div className="word-container">
        <div className="word-display">
          <span className="word-prefix">{prefix}</span>
          <span className="orp-focus">{focusLetter}</span>
          <span className="word-suffix">{suffix}</span>
        </div>
      </div>
    </div>
  )
})

ReadingPane.displayName = 'ReadingPane'

export default ReadingPane
