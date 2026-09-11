/**
 * Keeping a game across a reload.
 *
 * A phone will throw this page away. iOS discards a backgrounded web view
 * whenever it wants the memory back, and what comes back is not a paused app
 * but a cold start. So every turn is written down as it happens, and what is
 * read back is checked before it is trusted: a save that is not a whole deck
 * is refused rather than played on, because a game that quietly lost a card is
 * worse than a game that honestly starts over.
 */

import { DECK_SIZE, PILE_COUNT, PILE_SIZE } from './deck.js'
import { allCards } from './table.js'

export const SAVE_KEY = 'where-from/save/v2'
const FORMAT = 2

/**
 * Is this a complete 81-card deck, split three ways, with both an action and a
 * number showing on every pile?
 *
 * @param {unknown} table
 * @returns {boolean}
 */
export function isWholeDeck(table) {
  if (!table || typeof table !== 'object') return false
  if (!Array.isArray(table.piles) || table.piles.length !== PILE_COUNT) return false

  for (const pile of table.piles) {
    if (!pile || !Array.isArray(pile.draw) || !Array.isArray(pile.discard)) return false
    // An empty deck means no action is showing, which the table never allows.
    if (pile.draw.length < 1 || pile.discard.length < 1) return false
    if (pile.draw.length + pile.discard.length !== PILE_SIZE) return false
  }

  const cards = allCards(table)
  if (cards.length !== DECK_SIZE) return false
  if (new Set(cards.map((card) => card?.id)).size !== DECK_SIZE) return false
  return cards.every(
    (card) => Number.isInteger(card.number) && typeof card.action === 'string',
  )
}

/**
 * @typedef {object} Saved
 * @property {object} table
 * @property {object[]} history  most recent first
 * @property {number|null} chosen
 */

/** @param {Saved} state */
export function pack({ table, history = [], chosen = null }) {
  return JSON.stringify({ format: FORMAT, table, history, chosen })
}

/**
 * Read a save back, or null if there is nothing trustworthy in it.
 *
 * A corrupt undo history costs you the undo history, not the game in front of
 * you — the table is the part worth saving, so it is kept even when the rest
 * of the save is unusable.
 *
 * @param {unknown} raw
 * @returns {Saved|null}
 */
export function unpack(raw) {
  if (typeof raw !== 'string' || raw === '') return null

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null

  // Saves written before the undo history was kept are a bare table.
  const save = Array.isArray(parsed.piles)
    ? { format: FORMAT, table: parsed, history: [], chosen: null }
    : parsed

  if (save.format !== FORMAT) return null
  if (!isWholeDeck(save.table)) return null

  const history =
    Array.isArray(save.history) && save.history.every(isWholeDeck) ? save.history : []

  const chosen =
    Number.isInteger(save.chosen) && save.chosen >= 0 && save.chosen < PILE_COUNT
      ? save.chosen
      : null

  return { table: save.table, history, chosen }
}

/**
 * Storage is passed in rather than reached for, so this is testable and so a
 * browser that refuses it — private windows, blocked site data, a full quota —
 * costs persistence and never the running game.
 */
export function load(storage) {
  try {
    return unpack(storage.getItem(SAVE_KEY))
  } catch {
    return null
  }
}

/** @returns {boolean} whether it actually got written */
export function save(storage, state) {
  try {
    storage.setItem(SAVE_KEY, pack(state))
    return true
  } catch {
    return false
  }
}
