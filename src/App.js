import { useWindowSize } from 'rooks'

import './App.css';
import { useDeck } from './hooks/useDeck'
import { deckContext } from './contexts/deckContext'

import  Hand from './components/Hand'

function App() {
  const [hand, deal] = useDeck()
  const size = useWindowSize()
  const styles = {
    height: size.height
  }

  const dealHand = e => {
    e.preventDefault()
    deal()
  }
  return (
    <div className="App" style={styles}>
      <deckContext.Provider value={{hand}}>
        <div className='container-fluid'>
          { hand ? <Hand /> : null }
          <button className='btn btn-lg btn-danger full-width' type='button' onClick={e => dealHand(e)}>Deal!</button>
        </div>
      </deckContext.Provider>
    </div>
  );
}

export default App;