import './ProgressBar.css'

function ProgressBar({ progress, wordsRead, totalWords, wpm }) {
  const estimatedTimeRemaining = totalWords > 0 && wpm > 0
    ? Math.ceil((totalWords - wordsRead) / wpm)
    : 0

  return (
    <div className="progress-section">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="progress-stats">
        <div className="progress-text">
          <span className="words-read">{wordsRead}</span>
          <span className="separator">/</span>
          <span className="total-words">{totalWords}</span>
          <span className="words-label">words</span>
        </div>

        {estimatedTimeRemaining > 0 && (
          <div className="time-remaining">
            {estimatedTimeRemaining} min remaining
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressBar
