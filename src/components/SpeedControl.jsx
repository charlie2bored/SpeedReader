import './SpeedControl.css'

function SpeedControl({ wpm, onSpeedChange }) {
  const handleSpeedChange = (e) => {
    const newWpm = parseInt(e.target.value)
    onSpeedChange(newWpm)
  }

  const getSpeedLabel = (speed) => {
    if (speed < 200) return 'Slow'
    if (speed < 400) return 'Normal'
    if (speed < 600) return 'Fast'
    if (speed < 800) return 'Very Fast'
    return 'Lightning'
  }

  return (
    <div className="speed-control">
      <label htmlFor="speed-slider">Reading Speed</label>
      <div className="speed-input-group">
        <input
          type="range"
          id="speed-slider"
          min="100"
          max="1000"
          value={wpm}
          onChange={handleSpeedChange}
          className="speed-slider"
        />
        <div className="speed-display">
          <span className="wpm-value">{wpm}</span>
          <span className="wpm-label">WPM</span>
        </div>
      </div>
      <div className="speed-label">
        {getSpeedLabel(wpm)}
      </div>
    </div>
  )
}

export default SpeedControl
