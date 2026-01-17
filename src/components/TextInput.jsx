import { useRef, useEffect } from 'react'
import './TextInput.css'

function TextInput({ text, onTextChange, wordCount }) {
  const textareaRef = useRef(null)

  const handleTextChange = (e) => {
    const newText = e.target.value
    onTextChange(newText)
  }

  const handlePaste = async () => {
    try {
      // Try to read from clipboard first
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText()
        onTextChange(clipboardText)
        // Focus and move cursor to end
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(clipboardText.length, clipboardText.length)
          }
        }, 100)
      } else {
        // Fallback to focusing the textarea
        if (textareaRef.current) {
          textareaRef.current.focus()
          // Select all existing text so user can easily replace it
          textareaRef.current.select()
        }
      }
    } catch (error) {
      // Fallback if clipboard access fails
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      }
    }
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [text])

  return (
    <div className="text-input-container">
      <div className="input-header">
        <h2>Paste Your Text</h2>
        <div className="input-meta">
          <span className="word-count">
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
          <button onClick={handlePaste} className="paste-btn" title="Paste from clipboard">
            📝 Paste
          </button>
        </div>
      </div>

      <div className="textarea-container">
        <textarea
          ref={textareaRef}
          className="text-input"
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your article, book excerpt, or any text you want to read faster..."
          spellCheck="false"
          autoComplete="off"
        />
      </div>

      <div className="input-footer">
        <p className="help-text">
          💡 Pro tip: Paste long articles or documents for the best speed reading experience!
        </p>
      </div>
    </div>
  )
}

export default TextInput
