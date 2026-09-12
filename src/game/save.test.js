import { describe, it, expect } from 'vitest'
import { mulberry32 } from './deck.js'
import { newTable, flip } from './table.js'
import { SAVE_KEY, isWholeDeck, pack, unpack, load, save } from './save.js'

const rng = () => mulberry32(4242)
const aTable = (turns = 0) => {
  const r = rng()
  let t = newTable(r)
  for (let i = 0; i < turns; i++) t = flip(t, r)
  return t
}

const fakeStorage = () => {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    size: () => map.size,
  }
}

const hostileStorage = {
  getItem() { throw new DOMException('blocked') },
  setItem() { throw new DOMException('quota exceeded') },
}

describe('isWholeDeck', () => {
  it('accepts a real table, fresh or played', () => {
    expect(isWholeDeck(aTable(0))).toBe(true)
    expect(isWholeDeck(aTable(40))).toBe(true)
  })

  it('refuses anything that is not a table at all', () => {
    for (const junk of [null, undefined, 0, 'table', [], {}, { piles: [] }]) {
      expect(isWholeDeck(junk)).toBe(false)
    }
  })

  it('refuses a deck a card short', () => {
    const t = aTable()
    t.piles[1].draw.pop()
    expect(isWholeDeck(t)).toBe(false)
  })

  it('refuses a deck where a card moved from one pile to another', () => {
    // Still 81 cards, still all different — only the 27-a-pile rule catches it.
    const t = aTable()
    t.piles[1].draw.push(t.piles[0].draw.pop())
    expect(isWholeDeck(t)).toBe(false)
  })

  it('refuses a deck holding the same card twice', () => {
    const t = aTable()
    t.piles[0].draw[3] = { ...t.piles[0].draw[4] }
    expect(isWholeDeck(t)).toBe(false)
  })

  it('refuses a pile with nothing left face down, which shows no action', () => {
    const t = aTable()
    t.piles[2].discard.push(...t.piles[2].draw)
    t.piles[2].draw = []
    expect(isWholeDeck(t)).toBe(false)
  })

  it('refuses cards that lost a face', () => {
    const t = aTable()
    delete t.piles[0].discard[0].number
    expect(isWholeDeck(t)).toBe(false)
  })
})

describe('a save and the game that comes back', () => {
  it('brings back the same deck, in the same order, mid-game', () => {
    const table = aTable(9)
    const restored = unpack(pack({ table, history: [], chosen: null }))
    expect(restored.table).toEqual(table)
  })

  it('keeps the undo history and the pile you had marked', () => {
    const history = [aTable(3), aTable(2)]
    const restored = unpack(pack({ table: aTable(4), history, chosen: 2 }))
    expect(restored.history).toEqual(history)
    expect(restored.chosen).toBe(2)
  })

  it('defaults an absent history and mark rather than failing', () => {
    const restored = unpack(pack({ table: aTable() }))
    expect(restored.history).toEqual([])
    expect(restored.chosen).toBeNull()
  })
})

describe('a save that cannot be trusted', () => {
  it('is refused when it is not a save at all', () => {
    for (const junk of ['', 'null', '{', '[]', '{"format":2}', 'undefined', null, 7]) {
      expect(unpack(junk)).toBeNull()
    }
  })

  it('is refused when the deck inside it is short', () => {
    const table = aTable()
    table.piles[0].draw.pop()
    expect(unpack(pack({ table }))).toBeNull()
  })

  it('is refused when written by a format this version does not know', () => {
    const raw = JSON.stringify({ format: 99, table: aTable(), history: [], chosen: null })
    expect(unpack(raw)).toBeNull()
  })

  it('drops a corrupt history but keeps the game in front of you', () => {
    const table = aTable(5)
    const raw = JSON.stringify({
      format: 2,
      table,
      history: [aTable(4), { piles: 'gone' }],
      chosen: null,
    })
    const restored = unpack(raw)
    expect(restored.table).toEqual(table)
    expect(restored.history).toEqual([])
  })

  it('ignores a marked pile that is out of range', () => {
    for (const chosen of [-1, 3, 1.5, '1', null]) {
      expect(unpack(pack({ table: aTable(), chosen }))?.chosen).toBeNull()
    }
  })
})

describe('a save written before the undo history was kept', () => {
  it('is read as a bare table and carries on', () => {
    const table = aTable(6)
    const restored = unpack(JSON.stringify(table))
    expect(restored.table).toEqual(table)
    expect(restored.history).toEqual([])
  })

  it('is still refused if that bare table is not a whole deck', () => {
    const table = aTable()
    table.piles.pop()
    expect(unpack(JSON.stringify(table))).toBeNull()
  })
})

describe('talking to storage', () => {
  it('round-trips through a store', () => {
    const store = fakeStorage()
    const table = aTable(11)
    expect(save(store, { table, history: [], chosen: 1 })).toBe(true)
    expect(load(store).table).toEqual(table)
    expect(load(store).chosen).toBe(1)
  })

  it('writes under one known key', () => {
    const store = fakeStorage()
    save(store, { table: aTable() })
    expect(store.getItem(SAVE_KEY)).toBeTypeOf('string')
    expect(store.size()).toBe(1)
  })

  it('reads nothing from an empty store instead of throwing', () => {
    expect(load(fakeStorage())).toBeNull()
  })

  it('survives a browser that refuses storage outright', () => {
    // A private window, blocked site data, or a full quota costs persistence.
    // It must never cost the game in hand, so neither call may throw.
    expect(() => load(hostileStorage)).not.toThrow()
    expect(load(hostileStorage)).toBeNull()
    expect(() => save(hostileStorage, { table: aTable() })).not.toThrow()
    expect(save(hostileStorage, { table: aTable() })).toBe(false)
  })
})
