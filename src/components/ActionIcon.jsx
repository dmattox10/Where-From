/**
 * Six hand-drawn marks, one per action. Geometric and flat on purpose: they are
 * read at arm's length on a phone laid on a table, so they are built from
 * circles, triangles and bars rather than detail that turns to mush at 40px.
 */
const paths = {
  // A conifer. A round canopy on a trunk is the prettier tree but at 40px it
  // reads as a balloon, and two overlapping canopies read as a heart; stacked
  // triangles are the one tree silhouette nothing else is mistaken for.
  landscaper: (
    <>
      <path d="M24 3l9.5 13.5h-19z" />
      <path d="M24 13l12.5 16h-25z" />
      <path d="M24 24l15.5 18h-31z" />
      <rect x="20.5" y="40" width="7" height="6" rx="1.2" />
    </>
  ),
  // Pickets and rails.
  surveyor: (
    <>
      <path d="M10 20l4-6 4 6v22h-8z" />
      <path d="M20 20l4-6 4 6v22h-8z" />
      <path d="M30 20l4-6 4 6v22h-8z" />
      <rect x="6" y="23.5" width="36" height="4" />
      <rect x="6" y="32.5" width="36" height="4" />
    </>
  ),
  // Value climbing over a rising bar chart.
  agent: (
    <>
      <rect x="8" y="30" width="7" height="12" rx="1.2" />
      <rect x="20.5" y="24" width="7" height="18" rx="1.2" />
      <rect x="33" y="16" width="7" height="26" rx="1.2" />
      <path d="M9 20l11-9 7 5 11-10" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M30 5h10v10" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  // Water in a basin, with a ladder on the rim.
  pool: (
    <>
      <path d="M7 18h34a3 3 0 013 3v15a6 6 0 01-6 6H10a6 6 0 01-6-6V21a3 3 0 013-3z" opacity=".45" />
      <path d="M6 27c4 0 4 3.4 8 3.4S18 27 22 27s4 3.4 8 3.4S34 27 38 27s4 3.4 8 3.4" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M6 36c4 0 4 3.4 8 3.4S18 36 22 36s4 3.4 8 3.4S34 36 38 36s4 3.4 8 3.4" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M16 20V8h10v12" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M16 13h10" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </>
  ),
  // Two people: an agency supplies staff. A hard hat is the more literal mark
  // but a filled dome over a brim is a bowler at this size, and the ridge that
  // would tell them apart is invisible in a single-colour icon.
  temp: (
    <>
      <circle cx="32" cy="17" r="6" opacity=".45" />
      <path d="M22 42v-5a11 11 0 0122 0v5z" opacity=".45" />
      <circle cx="19" cy="19" r="7.5" />
      <path d="M5 43v-6a14 14 0 0128 0v6z" />
    </>
  ),
  // One roofline standing behind another: the same number, built twice.
  bis: (
    <>
      <path d="M18 16L30 6l12 10v20H18z" opacity=".45" />
      <path d="M6 22L20 11l14 11v20H6z" />
      <rect x="16" y="28" width="8" height="14" rx="1" opacity=".35" />
    </>
  ),
}

export default function ActionIcon({ action, className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="currentColor" stroke="currentColor">
      {paths[action] ?? null}
    </svg>
  )
}
