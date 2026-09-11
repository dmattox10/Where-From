import ActionIcon from './ActionIcon.jsx'
import { actionOf } from '../game/actions.js'

/**
 * The action face: the back of a card, sitting on top of a face-down deck.
 * Full-bleed colour so a pile reads from across the table.
 */
export function ActionFace({ action }) {
  const meta = actionOf(action)
  return (
    <div
      className="face face--action"
      style={{ '--hue': meta.color, '--hue-deep': meta.deep }}
    >
      <div className="face__frame">
        <span className="face__corner face__corner--tl">{meta.short}</span>
        <ActionIcon action={action} className="face__icon" />
        <span className="face__label">{meta.label}</span>
        <span className="face__corner face__corner--br">{meta.short}</span>
      </div>
    </div>
  )
}

/**
 * The number face: a card already turned over, showing the house number it
 * was hiding. Cream paper, corner indices like a playing card.
 */
export function NumberFace({ number }) {
  return (
    <div className="face face--number">
      <div className="face__frame">
        <span className="face__corner face__corner--tl">{number}</span>
        <span className="face__number">{number}</span>
        <span className="face__rule" />
        <span className="face__corner face__corner--br">{number}</span>
      </div>
    </div>
  )
}
