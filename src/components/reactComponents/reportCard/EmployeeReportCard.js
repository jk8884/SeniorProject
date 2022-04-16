import React from "react";
import { Card } from "react-bootstrap";
import * as Styles from '../../constants/styles/styles'

function EmployeeReportCard(props) {
    return (
       <Card style={Styles.CardContainer}>
           <Card.Body>
                <Card.Title>Employee Data Report</Card.Title>
                <Card.Text style={Styles.TotalText}>Employee: </Card.Text>
                <Card.Text>{props.employee}</Card.Text>
                <Card.Text style={Styles.TotalText}>Location: </Card.Text>
                <Card.Text>{props.location}</Card.Text>
                <Card.Text style={Styles.TotalText}>Total proccesed: </Card.Text>
                <Card.Text>{props.totalProccesed}</Card.Text>
                <Card.Text style={Styles.TotalText} >Total adverse effects:</Card.Text>
                <Card.Text>{props.totalSideEffects}</Card.Text>
           </Card.Body>
       </Card>
    )
}

export default EmployeeReportCard;