/**
 * The six construction actions, with the look each one wears in this app.
 *
 * The palette is mid-century suburbia on purpose — avocado, burnt orange,
 * harvest gold, turquoise, brick, plum — because that is the era the game is
 * set in and because six hues that far apart stay tellable apart at a glance
 * across a table, which is the only job a card back has.
 */
export const ACTIONS = Object.freeze({
  landscaper: { id: 'landscaper', label: 'Landscaper', short: 'Park',  color: '#7A8C3F', deep: '#5C6A2E' },
  surveyor:   { id: 'surveyor',   label: 'Surveyor',   short: 'Fence', color: '#C25A2C', deep: '#96411C' },
  agent:      { id: 'agent',      label: 'Estate Agent', short: 'Value', color: '#D9A128', deep: '#A97917' },
  pool:       { id: 'pool',       label: 'Pool',       short: 'Pool',  color: '#2E8C8C', deep: '#1F6A6A' },
  temp:       { id: 'temp',       label: 'Temp Agency',short: 'Temp',  color: '#A83E4A', deep: '#822C36' },
  bis:        { id: 'bis',        label: 'Bis',        short: 'Bis',   color: '#6E4A78', deep: '#52355A' },
})

export const actionOf = (id) => ACTIONS[id]
