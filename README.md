# Where From

An on-the-go **Welcome To...** construction deck for phones. Play with the
paper score sheets you already own and let this hold the cards, so nothing goes
missing down the side of the sofa.

## What it does

Replaces the 81 physical construction cards. Held upright the three piles run
down the screen, each a deck with the card it has already turned over beside
it. Turned on its side the title and buttons move into a rail on the right and
the piles go across instead — three decks along the top, the number each one
turned over directly below it — and the flight drops onto it. Either way a tap
turns all three decks over, with the cards flipping through the air.

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

## On a phone

It installs as a web app: open the URL, then **Share → Add to Home Screen** on
iOS, or **Install app** on Android. That matters for more than the icon — a
home-screen web app gets its own storage that Safari does not sweep up the way
it does a tab you have not opened in a week.

Once it has been opened once it works with no signal at all. The whole app is
about 320KB and the service worker keeps a copy, so a cold start at a table
with no bars deals the hand it was holding rather than showing a blank page.

**Your game survives the phone going to sleep.** iOS throws away a backgrounded
web view whenever it wants the memory, and what comes back is a cold start, not
a paused app. Every turn is written down as it happens — the deck, the undo
history and the pile you had marked — and read back on the way in, so the app
reopens on the turn you were on. It never reshuffles behind your back. A save
that is not a whole 81-card deck is refused rather than played on.

## Putting it online

Pushing to `main` builds and publishes to GitHub Pages (`.github/workflows/
pages.yml`), which gates the deploy on the test suite. Enable it once under
**Settings → Pages → Source → GitHub Actions**. The site lands at
`https://<user>.github.io/Where-From/`.

The build needs to know where it is being served from: GitHub Pages puts a
project site in a subdirectory, Capacitor serves from `file://` where only
relative paths work. The workflow sets `GITHUB_PAGES=true` and `vite.config.js`
picks the base path from it.

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

## Licence and trademark

The code is MIT, as in [LICENSE](LICENSE).

This is an unofficial fan-made companion app. It is not affiliated with,
endorsed by, or connected to the publishers of *Welcome To...*, and it is not a
substitute for owning the game — it replaces the construction deck for people
who already own a copy and keep score on the printed sheets. No artwork, text
or other material from the published game is reproduced here; the card counts
are factual game mechanics, and every icon and pixel in this repository is the
author's own. *Welcome To...* and any associated marks belong to their
respective owners.
