import { describe, it, expect } from 'vitest'
import {
  NUMBER_COUNTS, ACTION_COUNTS, DECK_SIZE, PILE_SIZE,
  numberPool, actionPool, shuffle, buildDeck, mulberry32,
} from './deck.js'

const tally = (list) => list.reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {})

describe('deck composition', () => {
  it('is 81 cards', () => {
    expect(numberPool()).toHaveLength(DECK_SIZE)
    expect(actionPool()).toHaveLength(DECK_SIZE)
    expect(PILE_SIZE).toBe(27)
  })

  it('has the printed number spread, 1 to 15 on a bell', () => {
    expect(tally(numberPool())).toEqual({
      1: 3, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9,
      9: 8, 10: 7, 11: 6, 12: 5, 13: 4, 14: 3, 15: 3,
    })
    // Symmetric about 8, which is why 8 is the commonest number in the game.
    const counts = numberPool()
    for (let n = 1; n <= 7; n++) {
      expect(counts.filter((c) => c === n)).toHaveLength(counts.filter((c) => c === 16 - n).length)
    }
  })

  it('has three actions at 18 and three at 9', () => {
    const counts = Object.values(ACTION_COUNTS)
    expect(counts.filter((c) => c === 18)).toHaveLength(3)
    expect(counts.filter((c) => c === 9)).toHaveLength(3)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(DECK_SIZE)
  })

  it('cannot be edited at runtime', () => {
    expect(Object.isFrozen(NUMBER_COUNTS)).toBe(true)
    expect(Object.isFrozen(ACTION_COUNTS)).toBe(true)
  })
})

describe('shuffle', () => {
  it('leaves the caller array untouched', () => {
    // The version this replaces aliased its argument and shuffled in place,
    // which corrupted the module-level deck definition on the first call.
    const original = [1, 2, 3, 4, 5, 6, 7, 8]
    const snapshot = original.slice()
    const out = shuffle(original, mulberry32(7))
    expect(original).toEqual(snapshot)
    expect(out).not.toBe(original)
  })

  it('keeps every element exactly once', () => {
    const input = Array.from({ length: 40 }, (_, i) => i)
    expect(shuffle(input, mulberry32(3)).sort((a, b) => a - b)).toEqual(input)
  })

  it('handles empty and single-element arrays', () => {
    expect(shuffle([], mulberry32(1))).toEqual([])
    expect(shuffle(['x'], mulberry32(1))).toEqual(['x'])
  })

  it('reaches every permutation at roughly equal odds', () => {
    const rng = mulberry32(12345)
    const seen = {}
    for (let i = 0; i < 6000; i++) {
      const key = shuffle(['a', 'b', 'c'], rng).join('')
      seen[key] = (seen[key] ?? 0) + 1
    }
    expect(Object.keys(seen)).toHaveLength(6)
    // 1000 expected each; a biased swap loop skews well past this band.
    for (const count of Object.values(seen)) {
      expect(count).toBeGreaterThan(850)
      expect(count).toBeLessThan(1150)
    }
  })
})

describe('buildDeck', () => {
  it('makes 81 cards with unique ids', () => {
    const deck = buildDeck(mulberry32(9))
    expect(deck).toHaveLength(DECK_SIZE)
    expect(new Set(deck.map((c) => c.id)).size).toBe(DECK_SIZE)
  })

  it('preserves both printed spreads', () => {
    const deck = buildDeck(mulberry32(11))
    expect(tally(deck.map((c) => c.number))).toEqual(tally(numberPool()))
    expect(tally(deck.map((c) => c.action))).toEqual(tally(actionPool()))
  })

  it('is reproducible from a seed and varies without one', () => {
    const a = buildDeck(mulberry32(42))
    const b = buildDeck(mulberry32(42))
    const c = buildDeck(mulberry32(43))
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })
})
