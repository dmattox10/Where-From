/**
 * The printed "Welcome To..." construction deck.
 *
 * 81 cards. Every card carries a house number on one face and a construction
 * action on the other. Those two faces belong to the same physical card, and
 * keeping them married is the whole point of this file: the action you are
 * offered this turn is the number you will be offered next turn.
 */

/**
 * House numbers, 1-15, bell curved. Sums to 81.
 * Carried over from the original hand-transcribed deck in this repo.
 */
export const NUMBER_COUNTS = Object.freeze({
  1: 3, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9,
  9: 8, 10: 7, 11: 6, 12: 5, 13: 4, 14: 3, 15: 3,
})

/** The six construction actions. Three appear 18 times, three appear 9. Sums to 81. */
export const ACTION_COUNTS = Object.freeze({
  surveyor: 18,
  landscaper: 18,
  agent: 18,
  pool: 9,
  temp: 9,
  bis: 9,
})

export const DECK_SIZE = 81
export const PILE_COUNT = 3
export const PILE_SIZE = DECK_SIZE / PILE_COUNT // 27

/**
 * @typedef {object} Card
 * @property {number} id     stable identity, 0-80, unique for the life of a game
 * @property {number} number the house number face
 * @property {string} action the construction action face
 */

/** Expand a count map into a flat pool. `{a: 2}` becomes `['a', 'a']`. */
function expand(counts) {
  const pool = []
  for (const [key, count] of Object.entries(counts)) {
    const value = Number.isNaN(Number(key)) ? key : Number(key)
    for (let i = 0; i < count; i++) pool.push(value)
  }
  return pool
}

export const numberPool = () => expand(NUMBER_COUNTS)
export const actionPool = () => expand(ACTION_COUNTS)

/**
 * Fisher-Yates, unbiased, and — unlike the version this replaces — it copies
 * first. The old one aliased its argument and shuffled the caller's array in
 * place, which quietly destroyed the module-level deck definition on first use.
 *
 * @template T
 * @param {readonly T[]} input
 * @param {() => number} rng
 * @returns {T[]} a new array
 */
export function shuffle(input, rng = Math.random) {
  const out = input.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const swap = out[i]
    out[i] = out[j]
    out[j] = swap
  }
  return out
}

/**
 * Build the 81 cards.
 *
 * Caveat worth knowing: the real deck has a fixed printed pairing of number to
 * action, and that pairing is not published anywhere I can verify. So the two
 * faces are married at random once, at the start of a game, and never separated
 * after. Every count above is exact and the number/action correlation across a
 * flip is exact; only which number sits behind which action differs from the
 * cardboard.
 *
 * @param {() => number} rng
 * @returns {Card[]}
 */
export function buildDeck(rng = Math.random) {
  const numbers = shuffle(numberPool(), rng)
  const actions = shuffle(actionPool(), rng)
  return numbers.map((number, id) => ({ id, number, action: actions[id] }))
}

/** A small seedable PRNG, so a game can be replayed and a test can be written. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
