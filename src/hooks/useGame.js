import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { newTable, flip, visible } from '../game/table.js'
import { PILE_COUNT } from '../game/deck.js'
import { load, save } from '../game/save.js'

const UNDO_DEPTH = 12

export const FLIGHT_MS = 560
export const STAGGER_MS = 85
export const FLIGHT_TOTAL = FLIGHT_MS + STAGGER_MS * (PILE_COUNT - 1)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/** `typeof` first: touching localStorage where it does not exist throws. */
const store = () => (typeof localStorage === 'undefined' ? null : localStorage)

const restore = () => {
  const held = store()
  return held ? load(held) : null
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
  // Read the save once, on the way in. Everything below starts from it.
  const [saved] = useState(restore)
  const [table, setTable] = useState(() => saved?.table ?? newTable())
  const [history, setHistory] = useState(() => saved?.history ?? [])
  const [chosen, setChosen] = useState(() => saved?.chosen ?? null)
  const [flying, setFlying] = useState(null)
  const timer = useRef(null)

  /**
   * Write the whole game down whenever any of it moves — the deck, the undo
   * history and the pile you had marked. This runs before the phone has any
   * chance to sleep, so what comes back after the web view is discarded is the
   * turn you were on and not a fresh shuffle.
   *
   * `flying` is deliberately not saved: it is an animation in progress, and a
   * game restored mid-flight should land on the turn, not replay it.
   */
  useEffect(() => {
    const held = store()
    if (held) save(held, { table, history, chosen })
  }, [table, history, chosen])

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
