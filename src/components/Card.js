import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Card = props => {
    const { card, icon, color, display } = props
    
    const borderColor = `border-${color}`
    
    return (
        <div className={`card card-block ${borderColor} mb-3`}>
            <div className={`card-header text-center display-1 text-${color}`}>{ display }</div>
            <div className="card-body">
                <div className="row">
                    <div className='column'><h1 className='text-center'>{ card.front }</h1></div>
                </div>
                <div className='row'>
                    <span className='d-flex justify-content-center'><FontAwesomeIcon icon={icon} size='6x' color={color} /></span>
                </div>
            </div>
        </div>
    )
}

export default Card


