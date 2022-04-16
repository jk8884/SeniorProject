import Footer from '../extra/Footer';
import * as Styles from '../../constants/styles/styles';
import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { auth, db } from '../../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { getDocs, getDoc, collection, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import { Card } from "react-bootstrap";
import BookingCard from '../../reactComponents/BookingCard';

function Patients({ setIsAuth }) {

    let navigate = useNavigate();

    const [patient, setPatient] = useState({
        id: '',
        name: '',
        address: '',
        state: '',
        dob: '',
        zip_code: '',
        phone_number: '',
        email: '',
        HI_company: '',
        insurance_id: ''
    })

    const [nameValue, setNameValue] = useState('')

    const [usersList, setUsersList] = useState([]);
    const [shotsList, setShotsList] = useState([]);
    const usersCollectionRef = collection(db, 'Users')
    const [patientsList, setPatientsList] = useState([]);
    const patientsCollectionRef = collection(db, 'Patients')
    const [currentPatientInfo, setCurrentPatientInfo] = useState()

    const [editing, setEditing] = useState(false)
    const [editedPatient, setEditedPatient] = useState('')

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    useEffect(() => {

        let isCancelled = false
        const handleChange = async () => {

            if (auth.currentUser == null) {
                navigate("/login")
            }

            await timeout(5000)

            const getUsers = async () => {

                const data = await getDocs(usersCollectionRef)
                setUsersList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

            }

            const getPatients = async () => {

                const data = await getDocs(patientsCollectionRef)
                setPatientsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

            }

            getUsers();
            getPatients();

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    })

    const deletePatient = async (id) => {

        const patientDoc = doc(db, 'Patients', id)
        await deleteDoc(patientDoc)

    }

    const moreInfo = async (id) => {

        setShotsList([])

        setCurrentPatientInfo(id)

        const data = await getDocs(collection(db, "Patients", id, "Shots"))
        setShotsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

    }

    const editPatient = async (id) => {

        const patientDoc = doc(db, 'Patients', id)
        const patientSnap = await getDoc(patientDoc)
        const patient = patientSnap.data()

        console.log(id)
        console.log(patient.name)

        setPatient({
            id: id,
            name: patient.name,
            address: patient.address,
            dob: patient.dob,
            state: patient.state,
            zip_code: patient.zip_code,
            phone_number: patient.phone_number,
            email: patient.email,
            HI_company: patient.HI_company,
            insurance_id: patient.insurance_id
        })

        setEditedPatient(id)
        setEditing(true)

    }

    const updatePatient = async (id) => {

        console.log(id)
        console.log(patient.name)

        const patientDoc = doc(db, 'Patients', id)
        await updateDoc(patientDoc, {
            name: patient.name,
            address: patient.address,
            dob: patient.dob,
            state: patient.state,
            zip_code: patient.zip_code,
            phone_number: patient.phone_number,
            email: patient.email,
            HI_company: patient.HI_company,
            insurance_id: patient.insurance_id
        })

        setPatient({
            id: '',
            name: '',
            type_of_vaccine: '',
            batch: '',
            side_effects: '',
            HI_company: '',
            insurance_id: ''
        })

        setEditing(false)

    }

    return (
        <Sidebar
            docked={true}
            sidebar={
                <CustomSidebar />
            }
            styles={{
                sidebar: {
                    background: "white",
                    width: '15rem',
                    paddingTop: '7rem'
                }
            }}
        >
            <div className="container" style={Styles.MainBody}>
                <div className="row">
                    <div className="col-6">{patientsList.map((patient) => {
                        return (
                            <Card style={Styles.CardContainer}>
                                <Card.Body>
                                    <Card.Title >{patient.name}</Card.Title>
                                    {
                                        shotsList.map((shot) => {
                                            if (currentPatientInfo == patient.id) {
                                                return (
                                                    <Card.Text>{shot.type_of_vaccine}, Dose: {shot.batch}</Card.Text>
                                                )
                                            }
                                        })
                                    }
                                    <div class="columns-3">
                                        <div className='editPost' style={Styles.CardLink}>
                                            <button onClick={() => { moreInfo(patient.id) }} > Shots </button>
                                        </div>
                                        <div className='editPost' style={Styles.CardLink}>
                                            <button onClick={() => { editPatient(patient.id) }} > Edit </button>
                                        </div>
                                        <div className='deletePost' style={Styles.CardLink}>
                                            <button onClick={() => { deletePatient(patient.id) }} > {' '} &#128465; </button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        )
                    })}</div>

                    {editing && <div className="col-6">
                        {/* {error && <Alert variant='danger'>{error}</Alert>} */}
                        <form>
                            <div className='col-sm-6'>
                                <label htmlFor="name" className="form-label font-black text-gray-500">Patient name</label>
                                <input type="text" className="form-control"
                                    placeholder="Enter..." id="name" value={patient.name}
                                    onChange={(e) =>
                                        setPatient({ ...patient, name: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="address" className="font-black text-gray-500">Address</label>
                                <input type="text" className="form-control" id='address' placeholder="Enter..." value={patient.address}
                                    onChange={(e) =>
                                        setPatient({ ...patient, address: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="state" className="font-black text-gray-500">State</label>
                                <input type="text" className="form-control" id='state' placeholder="Enter..." value={patient.state}
                                    onChange={(e) =>
                                        setPatient({ ...patient, state: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="zip_code" className="font-black text-gray-500">Zip Code</label>
                                <input type="text" className="form-control" id='zip_code' placeholder="Enter..." value={patient.zip_code}
                                    onChange={(e) =>
                                        setPatient({ ...patient, zip_code: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="dob" className="font-black text-gray-500">Date of Birth</label>
                                <input type="text" className="form-control" id='dob' placeholder="YYYY-MM-DD" value={patient.dob}
                                    onChange={(e) =>
                                        setPatient({ ...patient, dob: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="phone_number" className="font-black text-gray-500">Phone Number</label>
                                <input type="text" className="form-control" id='phone_number' placeholder="Enter..." value={patient.phone_number}
                                    onChange={(e) =>
                                        setPatient({ ...patient, phone_number: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="email" className="font-black text-gray-500">Email</label>
                                <input type="text" className="form-control" id='email' placeholder="Enter..." value={patient.email}
                                    onChange={(e) =>
                                        setPatient({ ...patient, email: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="location" className="font-black text-gray-500">Health Insurance Provider</label>
                                <input type="text" className="form-control" id='HI_company' placeholder="Enter..." value={patient.HI_company}
                                    onChange={(e) =>
                                        setPatient({ ...patient, HI_company: e.target.value })} required />
                            </div>
                            <div className='col-sm-6'>
                                <label htmlFor="location" className="font-black text-gray-500">Insurance ID</label>
                                <input type="text" className="form-control" id='insurance_id' placeholder="Enter..." value={patient.insurance_id}
                                    onChange={(e) =>
                                        setPatient({ ...patient, insurance_id: e.target.value })} required />
                            </div>
                            <div className="col-sm-auto pt-8">
                                <button type="button" onClick={() => updatePatient(editedPatient)} className="btn btn-primary bg-blue-500 font-black text-white-500">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                    }
                    <Footer />
                </div>
            </div>
        </Sidebar>
    )
}

export default Patients;