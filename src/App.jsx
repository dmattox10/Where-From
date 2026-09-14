import { useState } from 'react'
import Site from './components/Site.jsx'
import { useGame } from './hooks/useGame.js'
import { DECK_SIZE } from './game/deck.js'
import { track } from './analytics.js'

export default function App() {
  const { seen, flying, chosen, choose, turn, canUndo, flipAll, undo, reset } = useGame()
  const [confirming, setConfirming] = useState(false)

  // What a tool like this needs to report is whether anybody plays it and how
  // far they get -- a game abandoned on turn two and one played to the end of
  // the deck are the same single page_view otherwise. `turn` is carried on
  // every event so depth is answerable without a session-scoped dimension.

  const left = seen.reduce((sum, s) => sum + s.remaining, 0)

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true" />
          <h1>Where From</h1>
        </div>
        <dl className="topbar__stats">
          <div><dt>Turn</dt><dd>{turn}</dd></div>
          <div><dt>Face&nbsp;down</dt><dd>{left}<span>/{DECK_SIZE}</span></dd></div>
        </dl>
      </header>

      <main className="table">
        <div className="table__grid">
          {seen.map((site, index) => (
            <Site
              key={site.index}
              index={index}
              seen={site}
              chosen={chosen === index}
              onChoose={() => { track('card_chosen', { turn, pile: index }); choose(index) }}
              flight={flying ? { card: flying.turned[index], leaving: flying.leaving[index] } : null}
            />
          ))}
        </div>
      </main>

      <footer className="controls">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => { track('undo_used', { turn }); undo() }}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => { track('turn_taken', { turn, face_down: left }); flipAll() }}
        >
          Flip
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setConfirming(true)}
        >
          New
        </button>
      </footer>

      {confirming && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Start a new deck">
          <div className="sheet__card">
            <h2>Shuffle a new deck?</h2>
            <p>All 81 cards go back in and the turn count starts over. This game is gone.</p>
            <div className="sheet__row">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                Keep playing
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  // Fired before the reset so the turn count is the one the
                  // abandoned game reached, not zero.
                  track('deck_reset', { turn, face_down: left })
                  reset()
                  setConfirming(false)
                }}
              >
                New deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
