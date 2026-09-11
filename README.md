# Where From

An on-the-go **Welcome To...** construction deck for phones. Play with the
paper score sheets you already own and let this hold the cards, so nothing goes
missing down the side of the sofa.

## What it does

Replaces the 81 physical construction cards. It shows the three piles the way
they sit on a table — a face-down deck with its face-up discard beside it — and
turns all three over on a tap, with the cards flipping through the air.

- **The real deck.** 81 cards. House numbers 1–15 on a bell (3, 3, 4, 5, 6, 7,
  8, 9, 8, 7, 6, 5, 4, 3, 3) and six actions at 18/18/18/9/9/9.
- **The real mechanism.** Each offer is a pair taken from two different cards:
  the number from the discard, the action from the back of the card still on
  the deck. So the action you are offered this turn is the number you will be
  offered next turn, which is the thing the whole game is planned around.
- **Shuffles when a table would.** The moment a deck is emptied, its discard is
  picked up and shuffled back underneath — everything except the card just
  turned face up, which stays on show. No deck is ever left without an action.
- **Nothing is lost.** All 81 cards are accounted for on every turn, and a saved
  game that is not a whole deck is thrown away rather than played on.
- Undo the last dozen flips, mark the pile you mean to take, and close the app
  mid-game without losing it.

## Running it

```
npm install
npm run dev      # in a browser
npm test         # the deck and pile rules
npm run build
npm run sync     # build, then push into the iOS and Android projects
```

## How it is built

Vite + React, no UI framework, wrapped in Capacitor for iOS and Android. The
cards are plain CSS 3D transforms — `preserve-3d`, `backface-visibility` and a
`rotateY` — which is the one thing the web does better than a game engine, and
the reason this is a web app rather than a Godot one.

The rules live in `src/game/` and have no React in them:

| file | what it holds |
| --- | --- |
| `deck.js` | the 81 cards, the printed proportions, an unbiased shuffle |
| `table.js` | three piles, flipping, and picking the discard back up |
| `actions.js` | the six actions and the colour each one wears |

`src/hooks/useGame.js` is the only stateful piece: undo history, persistence and
the timing of a flip.

## One honest caveat

The real deck has a fixed printed pairing of number to action, and that pairing
is not published anywhere I could verify. Here the two faces are married at
random once at the start of a game and never separated afterwards. Every count
is exact, and so is the coupling across a flip — only *which* number sits behind
*which* action differs from the cardboard.

## Not built yet

The score sheet. This is the deck half; you still keep score on paper.
