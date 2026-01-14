import { useState, useEffect } from 'react'

function App() {
  const [words, setWords] = useState([])
  const [fileName, setFileName] = useState('')
  const [wpm, setWpm] = useState(300)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const speed = 60000 / wpm

  useEffect(() => {
    window.electronAPI.onUpdateIndex((event, index) => {
      setCurrentIndex(index)
    })
    window.electronAPI.onReadingDone(() => {
      setIsPlaying(false)
      setCurrentIndex(-1)
    })
    window.electronAPI.onStartFromDisplay(() => {
      setIsPlaying(true)
    })
    window.electronAPI.onStopFromDisplay(() => {
      setIsPlaying(false)
    })
  }, [])

  useEffect(() => {
    window.electronAPI.setWpm(wpm)
  }, [wpm])

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? 'black' : 'white'
    document.body.style.color = isDark ? 'white' : 'black'
  }, [isDark])

  const handleImport = async () => {
    const result = await window.electronAPI.openFile()
    if (result) {
      setWords(result.words)
      setFileName(result.fileName)
      setCurrentIndex(-1)
    }
  }

  const handleStart = () => {
    if (words.length > 0) {
      window.electronAPI.startReading(words, speed)
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    window.electronAPI.stopReading()
    setIsPlaying(false)
  }

  const toggleDark = () => {
    setIsDark(!isDark);
    window.electronAPI.toggleDark();
  }

  const changeFont = async () => {
    const fontPath = await window.electronAPI.selectFont();
    if (fontPath) {
      window.electronAPI.setFont(fontPath);
      console.log('Font selected:', fontPath);
    } else {
      console.log('No font selected');
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      minHeight: '100vh',
      background: isDark ? 'linear-gradient(135deg, #2c2c2c, #4a4a4a)' : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
      color: isDark ? 'white' : 'black',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5em', textShadow: isDark ? '0 0 10px rgba(255,255,255,0.5)' : '0 0 10px rgba(0,0,0,0.2)' }}>One Word Reader</h1>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={handleImport} style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: isDark ? '#007bff' : '#0056b3',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'all 0.3s'
        }}>Import .md File</button>
        <button onClick={toggleDark} style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: isDark ? '#28a745' : '#218838',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'all 0.3s'
        }}>{isDark ? 'Light Mode' : 'Night Mode'}</button>
        <button onClick={changeFont} style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: isDark ? '#ffc107' : '#e0a800',
          color: 'black',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'all 0.3s'
        }}>Change Font</button>
      </div>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <label style={{ display: 'block', marginBottom: '15px', fontSize: '1.3em', fontWeight: 'bold' }}>Speed (wpm): {wpm}</label>
        <input
          type="range"
          min="300"
          max="900"
          step="50"
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          style={{
            width: '300px',
            height: '8px',
            borderRadius: '4px',
            background: isDark ? '#555' : '#ddd',
            outline: 'none'
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button onClick={handleStart} disabled={isPlaying || words.length === 0} style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: isPlaying || words.length === 0 ? '#6c757d' : '#dc3545',
          color: 'white',
          cursor: isPlaying || words.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: '1em',
          transition: 'all 0.3s',
          boxShadow: isPlaying ? 'inset 0 3px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
          transform: isPlaying ? 'translateY(1px)' : 'translateY(0)'
        }}>Start</button>
        <button onClick={handleStop} disabled={!isPlaying} style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: !isPlaying ? '#6c757d' : '#17a2b8',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'all 0.3s',
          boxShadow: !isPlaying ? 'inset 0 3px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
          transform: !isPlaying ? 'translateY(1px)' : 'translateY(0)'
        }}>Stop</button>
      </div>
      <div style={{ textAlign: 'center', fontSize: '1.1em' }}>
        <div style={{ marginBottom: '10px' }}>Loaded file: <strong>{fileName || 'None'}</strong></div>
        <div style={{ marginBottom: '10px' }}>Words loaded: <strong>{words.length}</strong></div>
        <div>Current word index: <strong>{currentIndex >= 0 ? currentIndex + 1 : 0}</strong></div>
      </div>
    </div>
  )
}

export default App