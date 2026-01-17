import './PlaybackControls.css'

function PlaybackControls({ isPlaying, onPlay, onPause, onReset, disabled }) {
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  return (
    <div className="playback-controls">
      <button
        onClick={handlePlayPause}
        disabled={disabled}
        className={`play-pause-btn ${isPlaying ? 'playing' : 'paused'}`}
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>

      <button
        onClick={onReset}
        disabled={disabled}
        className="reset-btn"
      >
        🔄 Reset
      </button>
    </div>
  )
}

export default PlaybackControls
