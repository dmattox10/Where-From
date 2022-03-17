import { useContext } from "react"
import { faBriefcase, faPalette, faTree, faPersonSwimming, faArrowTrendUp, faHelmetSafety } from '@fortawesome/free-solid-svg-icons'
import { deckContext } from "../contexts/deckContext"

import Card from './Card'

const Hand = props => {
    const { hand } = useContext(deckContext)

    const options = [
        {
            name: 'biz',
            icon: faBriefcase,
            color: 'primary',
            display: 'Biz'
        },
        {
            name: 'fence',
            icon: faPalette,
            color: 'light',
            display: 'Fence'
        },
        {
            name: 'park',
            icon: faTree,
            color: 'success',
            display: 'Park'
        },
        {
            name: 'pool',
            icon: faPersonSwimming,
            color: 'info',
            display: 'Pool'
        },
        {
            name: 'stonks',
            icon: faArrowTrendUp,
            color: 'secondary',
            display: 'Stonks'
        },
        {
            name: 'temp',
            icon: faHelmetSafety,
            color: 'warning',
            display: 'Temp'
        },
    ]
    return (
        <div className='row justify-content-md-center'>
            {hand.map(card => {
                const selection = options.filter(option => option.name === card.back)
                const color = selection[0].color
                const icon = selection[0].icon
                const display = selection[0].display
                return (
                    <div className='col-12 col-sm-4'>
                        <Card card={card} key={card.id * card.front} color={color} display={display} icon={icon} />
                    </div>
                )}
            )}
        </div>
    )
}

export default Hand