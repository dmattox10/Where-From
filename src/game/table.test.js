import { describe, it, expect } from 'vitest'
import { mulberry32, DECK_SIZE, PILE_SIZE, PILE_COUNT } from './deck.js'
import { newTable, flip, visible, allCards } from './table.js'

const seeded = (seed = 2024) => {
  const rng = mulberry32(seed)
  return { rng, table: newTable(rng) }
}

describe('dealing', () => {
  it('splits 81 cards into three piles of 27', () => {
    const { table } = seeded()
    expect(table.piles).toHaveLength(PILE_COUNT)
    for (const pile of table.piles) {
      expect(pile.draw.length + pile.discard.length).toBe(PILE_SIZE)
    }
    expect(allCards(table)).toHaveLength(DECK_SIZE)
  })

  it('turns one card face up per pile, leaving 26 face down', () => {
    const { table } = seeded()
    for (const pile of table.piles) {
      expect(pile.discard).toHaveLength(1)
      expect(pile.draw).toHaveLength(26)
    }
    expect(table.turn).toBe(0)
  })

  it('shows an action and a number on every pile', () => {
    for (const seen of visible(seeded().table)) {
      expect(seen.number).toBeGreaterThanOrEqual(1)
      expect(seen.number).toBeLessThanOrEqual(15)
      expect(typeof seen.action).toBe('string')
    }
  })
})

describe('flipping', () => {
  it('offers this turn as the number on offer next turn', () => {
    // The coupling the whole game plans around: the card showing you an action
    // is the card that will be showing you a number one turn later.
    const { rng, table } = seeded(77)
    let current = table
    for (let turn = 0; turn < 60; turn++) {
      const before = visible(current)
      current = flip(current, rng)
      const after = visible(current)
      for (let i = 0; i < PILE_COUNT; i++) {
        expect(after[i].number).toBe(before[i].nextNumber)
      }
    }
  })

  it('moves exactly one card per pile from deck to discard', () => {
    const { rng, table } = seeded(5)
    const next = flip(table, rng)
    for (let i = 0; i < PILE_COUNT; i++) {
      expect(next.piles[i].draw).toHaveLength(25)
      expect(next.piles[i].discard).toHaveLength(2)
    }
    expect(next.turn).toBe(1)
  })

  it('leaves the previous table untouched, so undo is just keeping it', () => {
    const { rng, table } = seeded(6)
    const snapshot = JSON.stringify(table)
    const next = flip(table, rng)
    expect(JSON.stringify(table)).toBe(snapshot)
    expect(next).not.toBe(table)
  })
})

describe('the deck never runs dry', () => {
  it('always leaves an action showing, across a full re-deal and beyond', () => {
    const { rng, table } = seeded(31)
    let current = table
    for (let turn = 0; turn < 200; turn++) {
      current = flip(current, rng)
      for (const pile of current.piles) {
        expect(pile.draw.length).toBeGreaterThan(0)
        expect(pile.discard.length).toBeGreaterThan(0)
      }
    }
  })

  it('picks the discard back up on the turn the deck empties, keeping the face-up card', () => {
    const { rng, table } = seeded(88)
    let current = table
    const faceUpBefore = []
    // 26 face-down cards, so the 26th flip is the one that empties each pile.
    for (let turn = 0; turn < 25; turn++) current = flip(current, rng)
    for (const pile of current.piles) {
      expect(pile.draw).toHaveLength(1)
      expect(pile.reshuffled).toBe(false)
    }
    current = flip(current, rng)
    for (const [i, pile] of current.piles.entries()) {
      expect(pile.reshuffled).toBe(true)
      expect(pile.draw).toHaveLength(26)
      expect(pile.discard).toHaveLength(1)
      faceUpBefore.push(pile.discard[0].id)
    }
    // The card just turned over stays on show; it is not swept back into the deck.
    const after = visible(current)
    for (let i = 0; i < PILE_COUNT; i++) {
      expect(after[i].numberCardId).toBe(faceUpBefore[i])
    }
  })

  it('clears the reshuffled flag on the following turn', () => {
    const { rng, table } = seeded(88)
    let current = table
    for (let turn = 0; turn < 26; turn++) current = flip(current, rng)
    expect(current.piles.every((p) => p.reshuffled)).toBe(true)
    current = flip(current, rng)
    expect(current.piles.every((p) => !p.reshuffled)).toBe(true)
  })
})

describe('no card is ever lost', () => {
  it('holds all 81 distinct cards through 300 turns of flips and reshuffles', () => {
    const { rng, table } = seeded(1001)
    let current = table
    for (let turn = 0; turn < 300; turn++) {
      current = flip(current, rng)
      const cards = allCards(current)
      expect(cards).toHaveLength(DECK_SIZE)
      expect(new Set(cards.map((c) => c.id)).size).toBe(DECK_SIZE)
      for (const pile of current.piles) {
        expect(pile.draw.length + pile.discard.length).toBe(PILE_SIZE)
      }
    }
  })

  it('keeps a card in exactly one place at a time', () => {
    const { rng, table } = seeded(1002)
    let current = table
    for (let turn = 0; turn < 40; turn++) current = flip(current, rng)
    for (const pile of current.piles) {
      const drawIds = new Set(pile.draw.map((c) => c.id))
      for (const card of pile.discard) expect(drawIds.has(card.id)).toBe(false)
    }
  })
})
