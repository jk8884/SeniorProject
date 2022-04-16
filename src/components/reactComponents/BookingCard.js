import React from "react";
import { Card } from "react-bootstrap";
import * as Styles from '../constants/styles/styles'

function BookingCard(props) {
    return (
       <Card style={Styles.CardContainer}>
           <Card.Body>
               <Card.Title >{props.name}</Card.Title>
                <Card.Text>{props.vaxType}, Dose: {props.vaxDose}</Card.Text>
           </Card.Body>
       </Card>
    )
}

export default BookingCard;