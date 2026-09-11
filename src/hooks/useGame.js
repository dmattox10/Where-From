import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { newTable, flip, visible, allCards } from '../game/table.js'
import { DECK_SIZE, PILE_COUNT, PILE_SIZE } from '../game/deck.js'

const STORAGE_KEY = 'where-from/table/v1'
const UNDO_DEPTH = 12

export const FLIGHT_MS = 560
export const STAGGER_MS = 85
export const FLIGHT_TOTAL = FLIGHT_MS + STAGGER_MS * (PILE_COUNT - 1)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/**
 * A restored game has to be a whole deck or it is not a game. Anything short,
 * duplicated or reshaped by an old version is thrown away rather than played
 * on, because a silently missing card is the exact failure this app exists to
 * rule out.
 */
function isWholeDeck(table) {
  if (!table || !Array.isArray(table.piles) || table.piles.length !== PILE_COUNT) return false
  for (const pile of table.piles) {
    if (!Array.isArray(pile?.draw) || !Array.isArray(pile?.discard)) return false
    if (pile.draw.length < 1 || pile.discard.length < 1) return false
    if (pile.draw.length + pile.discard.length !== PILE_SIZE) return false
  }
  const cards = allCards(table)
  if (cards.length !== DECK_SIZE) return false
  if (new Set(cards.map((c) => c?.id)).size !== DECK_SIZE) return false
  return cards.every((c) => typeof c.number === 'number' && typeof c.action === 'string')
}

const restore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    return isWholeDeck(saved) ? saved : null
  } catch {
    return null
  }
}

const buzz = async (style) => {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle[style] })
  } catch {
    /* haptics are a nicety, never a requirement */
  }
}

export function useGame() {
  const [table, setTable] = useState(() => restore() ?? newTable())
  const [history, setHistory] = useState([])
  const [flying, setFlying] = useState(null)
  const [chosen, setChosen] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(table))
    } catch {
      /* a full or blocked store costs persistence, not the game in hand */
    }
  }, [table])

  useEffect(() => () => clearTimeout(timer.current), [])

  const seen = useMemo(() => visible(table), [table])

  const flipAll = useCallback(() => {
    if (flying) return
    const turned = table.piles.map((pile) => pile.draw[pile.draw.length - 1])
    const leaving = seen.map((s) => s.number)
    const next = flip(table)

    setHistory((past) => [table, ...past].slice(0, UNDO_DEPTH))
    setTable(next)
    setChosen(null)
    buzz('Medium')

    if (prefersReducedMotion()) return
    setFlying({ turned, leaving })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setFlying(null), FLIGHT_TOTAL + 40)
  }, [flying, seen, table])

  const undo = useCallback(() => {
    setHistory((past) => {
      if (past.length === 0) return past
      clearTimeout(timer.current)
      setFlying(null)
      setTable(past[0])
      setChosen(null)
      buzz('Light')
      return past.slice(1)
    })
  }, [])

  const reset = useCallback(() => {
    clearTimeout(timer.current)
    setFlying(null)
    setHistory([])
    setChosen(null)
    setTable(newTable())
    buzz('Heavy')
  }, [])

  const choose = useCallback((index) => {
    setChosen((current) => (current === index ? null : index))
  }, [])

  return {
    table,
    seen,
    flying,
    chosen,
    choose,
    turn: table.turn,
    canUndo: history.length > 0,
    flipAll,
    undo,
    reset,
  }
}
