import { useEffect, useState } from 'react'
import { shuffleArray } from '../lib/shuffle'

const symbols = ['park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'park', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'stonks', 'biz', 'biz', 'biz', 'biz', 'biz', 'biz', 'biz', 'biz', 'biz', 'pool', 'pool', 'pool', 'pool', 'pool', 'pool', 'pool', 'pool', 'pool', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'fence', 'temp', 'temp', 'temp', 'temp', 'temp', 'temp', 'temp', 'temp', 'temp', ]
const numbers = [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 15, 15]

export const useDeck = () => {

    const prepDeck = () => {
        let fronts = shuffleArray(numbers)
        let backs = shuffleArray(symbols)
        let builtDeck = []
        let id = 0
        while (fronts.length > 0) {
            id++
            builtDeck.push({
                front: fronts.pop(),
                back: backs.pop(),
                id: id
            })
        }
        console.log(builtDeck)
        return builtDeck
    }

    const [deck, updateDeck] = useState(null)
    const [hand, updateHand] = useState(null)

    // useEffect(() => {
    //     if (deck && deck.length < 3) {
    //         updateDeck(prepDeck())
    //     }
    // }, [deck])

    useEffect(() => {
        if (!deck) {
            const initialDeck = prepDeck
            const shuffledDeck = shuffleArray(initialDeck)
            updateDeck(shuffledDeck)
        }
    }, [deck])

    const deal = () => {
        if (deck.length > 3) {
            let builtHand = []
            for (let i = 0; i < 3; i++) {
                builtHand.push(deck[i])
            }
            const newDeck = deck.filter(each => {
                return !builtHand.includes(each.id)
            })
            updateHand(builtHand)
            updateDeck(newDeck)
        } else {
            const initialDeck = prepDeck
            const shuffledDeck = shuffleArray(initialDeck)
            updateDeck(shuffledDeck)
            deal()
        }
        // let deckCopy = deck
        
        // for ( let i = 0; i < 3; i++) {
        //     let card = deckCopy.pop()
        //     builtHand.push(card)
        // }
        // builtHand.forEach(handCard => {
        //     updateDeck(prevDeck => prevDeck.filter(deckCard => deckCard.id !== handCard.id))
        // })
        // updateHand(builtHand)
    }

    return [hand, deal]
}

// const newList = list.filter((item) => item.id !== id);

//     setList(newList);