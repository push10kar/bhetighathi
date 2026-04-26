import { useState, useEffect, useCallback } from 'react'
import './App.css'

const LOC_A = 'Ramsung Galaxy'
const LOC_B = 'Yampire Yeastate'

const MODES = [
  { id: 'flip',  label: 'flip',   rounds: 1  },
  { id: 'r3',    label: 'bo3',    rounds: 3  },
  { id: 'r5',    label: 'bo5',    rounds: 5  },
  { id: 'r7',    label: 'bo7',    rounds: 7  },
  { id: 'r11',   label: 'bo11',   rounds: 11 },
]

function fairCoin() { return Math.random() < 0.5 ? 0 : 1 }

function runSeries(n) {
  let winsA = 0, winsB = 0, rounds = []
  for (let i = 0; i < n; i++) {
    const f = fairCoin()
    rounds.push(f)
    if (f === 0) winsA++; else winsB++
  }
  return { winsA, winsB, rounds, winner: winsA > winsB ? 0 : 1 }
}

function PipRow({ rounds, revealed }) {
  return (
    <div className="pip-row">
      {rounds.map((r, i) => (
        <span
          key={i}
          className={`pip ${i < revealed ? (r === 0 ? 'pip-a' : 'pip-b') : 'pip-empty'}`}
        />
      ))}
    </div>
  )
}

function ResultCard({ result, onReset }) {
  const isA = result.winner === 0
  return (
    <div className="result-card">
      <div className="result-label">meet here</div>
      <div className={`result-winner ${isA ? 'color-a' : 'color-b'}`}>
        {isA ? LOC_A : LOC_B}
      </div>

      {result.rounds.length > 1 && (
        <>
          <PipRow rounds={result.rounds} revealed={result.rounds.length} />
          <div className="result-score">
            <span className="color-a">{LOC_A} {result.winsA}</span>
            <span className="score-sep">—</span>
            <span className="color-b">{result.winsB} {LOC_B}</span>
          </div>
        </>
      )}

      <button className="retry-btn" onClick={onReset}>
        try again
      </button>
    </div>
  )
}

function AnimatingCard({ result, onDone }) {
  const [revealed, setRevealed] = useState(0)
  const total = result.rounds.length

  useEffect(() => {
    if (total === 1) {
      setTimeout(onDone, 1000)
      return
    }
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= total) {
        clearInterval(interval)
        setTimeout(onDone, 500)
      }
    }, 260)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="result-card animating">
      <div className="result-label">deciding...</div>
      {total > 1 && <PipRow rounds={result.rounds} revealed={revealed} />}
      {total === 1 && (
        <div className="coin-wrap">
          <div className="coin">
            <div className="coin-side side-a">{LOC_A[0]}</div>
            <div className="coin-side side-b">{LOC_B[0]}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [mode, setMode]         = useState(MODES[0])
  const [phase, setPhase]       = useState('idle')   // idle | animating | result
  const [result, setResult]     = useState(null)
  const [history, setHistory]   = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const go = useCallback(() => {
    if (phase !== 'idle') return
    const r = runSeries(mode.rounds)
    setResult(r)
    setPhase('animating')
  }, [phase, mode])

  const onDone = useCallback(() => {
    setPhase('result')
    setHistory(h => [{
      mode: mode.label,
      winner: result.winner === 0 ? LOC_A : LOC_B,
      score: result.rounds.length > 1 ? `${result.winsA}-${result.winsB}` : null,
    }, ...h].slice(0, 20))
  }, [mode, result])

  const reset = useCallback(() => {
    setPhase('idle')
    setResult(null)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') go()
      if (e.key === 'Escape') reset()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, reset])

  return (
    <div className="app">
      <div className="container">
        {/* header */}
        <header className="header">
          <div className="logo-section">
            <span className="logo">bhetighathi</span>
          </div>
          <div className="top-nav">
            <button
              className={`nav-link ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(s => !s)}
              title="View History"
            >
              <span className="nav-text">history</span>
            </button>
          </div>
        </header>

        {/* mode bar */}
        <div className="mode-bar">
          <div className="mode-group">
            <span className="mode-title">mode</span>
            <div className="mode-options">
              {MODES.map(m => (
                <button
                  key={m.id}
                  className={`mode-btn ${mode.id === m.id ? 'active' : ''}`}
                  onClick={() => { setMode(m); reset() }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* main area */}
        <main className="main">
          <div className="content-wrapper">
            {phase === 'idle' && (
              <div className="idle-area">
                <div className="versus">
                  <div className="loc-wrapper">
                    <span className="loc color-a">{LOC_A}</span>
                  </div>
                  <div className="vs-wrapper">
                    <span className="vs">vs</span>
                  </div>
                  <div className="loc-wrapper">
                    <span className="loc color-b">{LOC_B}</span>
                  </div>
                </div>
                <div className="action-area">
                  <button className="go-btn" onClick={go}>
                    decide
                  </button>
                  <div className="hint">press <kbd>enter</kbd> to decide</div>
                </div>
              </div>
            )}

            {phase === 'animating' && result && (
              <AnimatingCard result={result} onDone={onDone} />
            )}

            {phase === 'result' && result && (
              <ResultCard result={result} onReset={reset} />
            )}
          </div>
        </main>

        {/* history panel */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <span className="history-title">session history</span>
              {history.length > 0 && (
                <button className="clear-btn" onClick={() => setHistory([])}>
                  clear all
                </button>
              )}
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="history-empty">no decisions yet</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="history-row">
                    <span className="history-mode">{h.mode}</span>
                    <span className={`history-winner ${h.winner === LOC_A ? 'color-a' : 'color-b'}`}>
                      {h.winner}
                    </span>
                    <div className="history-meta">
                      {h.score && <span className="history-score">{h.score}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* footer */}
        <footer className="footer">
          <div className="footer-left">
            <span>fair 50/50 — no bias</span>
          </div>
          <div className="footer-right">
            <span>esc to reset</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
