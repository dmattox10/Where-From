import { ActionFace, NumberFace } from './Card.jsx'
import { FLIGHT_MS, STAGGER_MS } from '../hooks/useGame.js'

/**
 * One pile: the face-down deck with the card it has already turned face up.
 * Side by side on a phone held upright, stacked when it is turned.
 *
 * While a flip is in flight the deck has already revealed its next
 * action — which is what happens on a table, the moment the card lifts off —
 * and the discard still shows the number being covered. The card in the air
 * carries both faces of the one card actually being turned.
 */
export default function Site({ seen, flight, index, chosen, onChoose }) {
  return (
    <div
      className={`site${chosen ? ' site--chosen' : ''}`}
      style={{ '--i': index }}
    >
      <button
        type="button"
        className="site__hit"
        onClick={onChoose}
        aria-pressed={chosen}
        aria-label={`Pile ${index + 1}: number ${seen.number}, ${seen.action}. ${seen.remaining} cards left.`}
      >
        <div className="slot slot--deck">
          {/* The stack thins out under the top card as the pile is spent. */}
          {seen.remaining > 2 && <div className="deck-edge" aria-hidden="true" />}
          {seen.remaining > 6 && <div className="deck-edge deck-edge--2" aria-hidden="true" />}
          <ActionFace action={seen.action} />
          <span className="slot__count">{seen.remaining}</span>
          {seen.reshuffled && <span className="slot__flag">reshuffled</span>}
        </div>

        <div className="slot slot--discard">
          <NumberFace number={flight ? flight.leaving : seen.number} />
        </div>

        {flight && (
          <div
            className="flyer__shadow"
            aria-hidden="true"
            style={{
              '--flight': `${FLIGHT_MS}ms`,
              '--delay': `${index * STAGGER_MS}ms`,
            }}
          />
        )}

        {flight && (
          <div
            className="flyer"
            style={{
              '--flight': `${FLIGHT_MS}ms`,
              '--delay': `${index * STAGGER_MS}ms`,
            }}
          >
            <div className="flyer__inner">
              <div className="flyer__face flyer__face--front">
                <ActionFace action={flight.card.action} />
              </div>
              <div className="flyer__face flyer__face--back">
                <NumberFace number={flight.card.number} />
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  )
}
