/**
 * The table: three piles, and the rule that turns them into three offers.
 *
 * A pile is a face-down deck with a face-up discard beside it. What a player
 * reads off one pile is a pair drawn from two different cards:
 *
 *   number  <- the top of the discard, already turned over
 *   action  <- the back of the card still on top of the deck
 *
 * Flipping advances every pile at once. The card that was showing you an action
 * lands on the discard showing its number, and the card beneath it becomes the
 * new action. That is why the action on offer this turn is the number on offer
 * next turn, and it is the entire planning game.
 */

import { buildDeck, shuffle, PILE_COUNT, PILE_SIZE } from './deck.js'

/**
 * @typedef {object} Pile
 * @property {import('./deck.js').Card[]} draw    face down, top of pile is last
 * @property {import('./deck.js').Card[]} discard face up, visible card is last
 * @property {boolean} reshuffled true if the last flip exhausted and rebuilt it
 */

/**
 * @typedef {object} Table
 * @property {Pile[]} piles
 * @property {number} turn
 */

/**
 * A deck is never left empty. The instant the last card is turned over, the
 * discard is picked up and shuffled back underneath — everything except the
 * card just turned face up, which stays put as the visible number. This is what
 * hands do at a table, and it is why `draw` is never empty and every pile always
 * shows both an action and a number.
 *
 * @param {Pile} pile
 * @param {() => number} rng
 * @returns {Pile}
 */
function replenish(pile, rng) {
  if (pile.draw.length > 0) return { ...pile, reshuffled: false }
  const faceUp = pile.discard[pile.discard.length - 1]
  return {
    draw: shuffle(pile.discard.slice(0, -1), rng),
    discard: [faceUp],
    reshuffled: true,
  }
}

/**
 * Deal a new table: 81 shuffled cards split into three piles of 27, then the
 * top card of each pile turned face up beside it.
 *
 * @param {() => number} rng
 * @returns {Table}
 */
export function newTable(rng = Math.random) {
  const deck = buildDeck(rng)
  const piles = []
  for (let i = 0; i < PILE_COUNT; i++) {
    const cards = deck.slice(i * PILE_SIZE, (i + 1) * PILE_SIZE)
    const faceUp = cards[cards.length - 1]
    piles.push({ draw: cards.slice(0, -1), discard: [faceUp], reshuffled: false })
  }
  return { piles, turn: 0 }
}

/**
 * Turn the top card of every pile. Returns a new table; the old one is left
 * intact so it can be pushed onto an undo stack.
 *
 * @param {Table} table
 * @param {() => number} rng
 * @returns {Table}
 */
export function flip(table, rng = Math.random) {
  const piles = table.piles.map((pile) => {
    const turned = pile.draw[pile.draw.length - 1]
    return replenish(
      { draw: pile.draw.slice(0, -1), discard: [...pile.discard, turned] },
      rng,
    )
  })
  return { piles, turn: table.turn + 1 }
}

/**
 * What a player can actually see, one entry per pile.
 *
 * @param {Table} table
 */
export function visible(table) {
  return table.piles.map((pile, index) => {
    const numberCard = pile.discard[pile.discard.length - 1]
    const actionCard = pile.draw[pile.draw.length - 1]
    return {
      index,
      number: numberCard.number,
      action: actionCard.action,
      /** The number that will replace the one above on the next flip. */
      nextNumber: actionCard.number,
      numberCardId: numberCard.id,
      actionCardId: actionCard.id,
      remaining: pile.draw.length,
      reshuffled: pile.reshuffled,
    }
  })
}

/** Every card on the table, in no particular order. Used to prove none are lost. */
export function allCards(table) {
  return table.piles.flatMap((pile) => [...pile.draw, ...pile.discard])
}
