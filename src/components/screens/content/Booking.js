import Footer from '../extra/Footer';
import * as Styles from '../../constants/styles/styles';
import React, { useEffect, useRef, useState } from 'react'
import { auth, db } from '../../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, setDoc, doc, addDoc } from 'firebase/firestore'
import { Alert } from 'react-bootstrap'
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import moment from 'moment';
import DatePicker from 'react-datetime';
import "react-datetime/css/react-datetime.css";

const Booking = () => {

    let navigate = useNavigate();

    const fullNameRef = useRef()
    const type_of_vaccineRef = useRef()
    const batchRef = useRef()
    const HI_companyRef = useRef()
    const insurance_idRef = useRef()
    const emailRef = useRef()
    const phone_numberRef = useRef()

    const [usersList, setUsersList] = useState([]);
    const [locationsList, setLocationsList] = useState([]);
    const [vaccinesList, setVaccinesList] = useState([]);
    const [availableTimeslots, setAvailableTimeslots] = useState([]);
    const usersCollectionRef = collection(db, 'Users')
    const locationsCollectionRef = collection(db, 'Locations')
    const vaccinesCollectionRef = collection(db, 'Vaccines')
    const [chosenLocation, setChosenLocation] = useState('')
    const [customDates, setCustomDates] = useState([])
    const [date, setDate] = useState(new Date());
    var badDateTrigger = false
    var trigger = 0


    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [disableTimeslots, setDisableTimeslots] = useState(false)
    const [locSel, setLocSel] = useState(false)

    const placeholder = () => {
        var value = ''
        if (loading) {
            value = 'Loading...'
        }
        else {
            value = ''
        }
        return value;
    }

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

            const getLocations = async () => {

                const data = await getDocs(locationsCollectionRef)
                setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

            }

            const getVaccines = async () => {

                const data = await getDocs(vaccinesCollectionRef)
                setVaccinesList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

            }

            getUsers();

            getLocations();

            getVaccines();

            setLoading(false);

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    })

    const chosenLoc = async (e) => {

        setLocSel(true)

        var current = document.getElementById('location').value

        setLocation({ ...location, location_name: current })

        console.log('chosenLoc')

        setChosenLocation(current)

    }

    const changeDate = (newDate) => {
        setDate(newDate)

        getUnavailableDates(newDate)
    }

    function getRandomString(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    const getUnavailableDates = async (newDate) => {

        setCustomDates([])
        setAvailableTimeslots([])

        console.log('happened')

        var timeslotList = ''

        timeslotList = await getDocs(collection(db, 'Locations', chosenLocation, 'Timeslots'))

        timeslotList.docs.map(async (timeslot) => {

            trigger = 0

            var unavailableDocs = ''

            unavailableDocs = await getDocs(collection(db, 'Locations', chosenLocation, 'Timeslots', timeslot.id, 'Unavailable Dates'))

            unavailableDocs.docs.map((doc) => {

                console.log('in loop' + trigger)

                const data = doc.data()

                const formattedNewDate = newDate.format('YYYY-MM-DD')

                if (data.date == formattedNewDate) {

                    console.log('X')

                    badDateTrigger = true

                    trigger = -9999

                }

                trigger = trigger + 1

            })

            console.log("before setting " + trigger)
            console.log("before setting " + badDateTrigger)

            if ((badDateTrigger == false) && trigger > 0) {

                setAvailableTimeslots((availableTimeslots) => [
                    ...availableTimeslots,
                    timeslot
                ])

            } else {
                badDateTrigger = false
            }

        })

    }

    const disableCustomDt = current => {

        return !customDates.includes(current.format('YYYY-MM-DD'));

    }

    const [patient, setPatient] = useState({
        name: '',
        HI_company: '',
        insurance_id: '',
        side_effects: '',
        email: '',
        phone_number: ''
    })

    const [location, setLocation] = useState({
        location_name: '',
        timeslot: '',
        patient_identifier: '',
        type_of_vaccine: '',
        batch: '',
        date: ''
    })

    const handleSubmit = async (e) => {

        e.preventDefault();

        const patientIdentifier = getRandomString(9)
        const patientsRef = collection(db, 'Patients')

        const appointmentsRef = doc(collection(db, 'Locations', location.location_name, 'Timeslots', location.timeslot, 'Appointments'));

        await setDoc(doc(patientsRef, patientIdentifier), {
            name: patient.name,
            dob: '',
            address: '',
            zip_code: '',
            state: '',
            HI_company: patient.HI_company,
            insurance_id: patient.insurance_id,
            email: patient.email,
            phone_number: patient.phone_number,
            patient_identifier: patientIdentifier
        })
        await setDoc(doc(collection(db, 'Patients', patientIdentifier, 'Shots'), patient.type_of_vaccine), {
            type_of_vaccine: patient.type_of_vaccine,
            batch: patient.batch,
            date: date.format('YYYY-MM-DD'),
            side_effects: '',
            doctor: auth.currentUser.email,
            appointment_location: location.location_name,
            completed: false
        })
        await setDoc(appointmentsRef, {
            patient_identifier: patientIdentifier,
            type_of_vaccine: patient.type_of_vaccine,
            name: patient.name,
            date: date.format('YYYY-MM-DD')
        })
        setPatient({
            name: '',
            HI_company: '',
            insurance_id: '',
            side_effects: '',
            email: '',
            phone_number: '',
            patient_identifier: ''
        })
        setLocation({
            location_name: '',
            type_of_vaccine: '',
            batch: '',
            timeslot: '',
            date: ''
        })
        setDate(new Date())


        document.getElementById('name').value = ''
        document.getElementById('location').value = ''
        document.getElementById('timeslots').value = ''
        document.getElementById('batch').value = ''
        document.getElementById('typeOfVaccine').value = ''
        document.getElementById('HICompany').value = ''
        document.getElementById('insurance').value = ''
        document.getElementById('email').value = ''
        document.getElementById('phoneNumber').value = ''

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
                <div className="row" >
                    <h1 style={Styles.Title} className="text-4xl font-black text-gray-600">Vaccination Booking</h1>
                </div>
                <br />
                <div className="row">
                    {error && <Alert variant='danger'>{error}</Alert>}
                    <form className='row' onSubmit={handleSubmit}>
                        <div className='col-sm-5 justify-content-around pb-4 pt-2' style={Styles.ColWide}>
                            <h4 className='font-black text-gray-500' style={Styles.Title}>
                                Personal Information
                            </h4>
                            <div className='row-sm-8'>
                                <label htmlFor="name" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Full Name</label>
                                <input type="text" className="form-control"
                                    placeholder="Enter..." id="name" ref={fullNameRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, name: e.target.value })} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="email" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Contact Email</label>
                                <input type="email" className="form-control" placeholder="Enter..." id="email" ref={emailRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, email: e.target.value })} />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="phone_number" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Contact Number</label>
                                <input type="text" className="form-control" placeholder="Enter..." id="phoneNumber" ref={phone_numberRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, phone_number: e.target.value })} />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="HI_company" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Insurance Provider</label>
                                <input type="text" className="form-control" placeholder="Enter..." id="HICompany" ref={HI_companyRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, HI_company: e.target.value })} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="insurance_id" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Insurance ID</label>
                                <input type="text" className="form-control" placeholder="Enter..." id="insurance" ref={insurance_idRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, insurance_id: e.target.value })} required />
                            </div>
                        </div>

                        <div className='row-sm-8 pb-4 pt-2' style={Styles.ColWide}>
                            <h4 className="font-black text-gray-500" style={Styles.Title}>
                                Vaccine Information
                            </h4>
                            <div className='row-sm-8'>
                                <label htmlFor="type_of_vaccine" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Vaccine Dose</label>
                                <select type="text" className="form-control" placeholder="Enter..." id="typeOfVaccine" ref={type_of_vaccineRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, type_of_vaccine: e.target.value })} required>
                                <option value=''></option>
                                <option value='Immunization 1'>Immunization 1</option>
                                <option value='Immunization 2'>Immunization 2</option>
                                <option value='Booster 1'>Booster 1</option>
                                <option value='Booster 2'>Booster 2</option>
                                <option value='Booster 3'>Booster 3</option>
                                </select>
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="batch" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Vaccine Brand</label>
                                <select className="form-control" type="text"  id="batch" placeholder="Batch" disabled={disableTimeslots} ref={batchRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, batch: e.target.value })} required>
                                    <option value=''></option>
                                    {
                                        vaccinesList.map((vaccine) => {

                                            return (<option value={vaccine.id}>{vaccine.id}</option>)

                                        })
                                    }
                                </select>
                            </div>
                        </div>

                        <div className='col-sm-5 pb-4 pt-2' style={Styles.ColWide}>
                            <h4 className='row-sm-8 font-black text-gray-500' style={Styles.Title}>
                                Venue Information
                            </h4>
                            <div className='row-sm-8'>
                                <label htmlFor="location" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Venue</label>
                                <select className="form-control" type="text" id="location" placeholder="Location"
                                    onChange={((e) => chosenLoc(e))} required>
                                    <option value=''></option>
                                    {
                                        locationsList.map((loc) => {

                                            return (<option value={loc.id}>{loc.id}</option>)

                                        })
                                    }
                                </select>
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Date</label>
                                <DatePicker timeFormat={false} selected={date} onChange={((date) => changeDate(date))} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Timeslot</label>
                                <select className="form-control" type="text" id="timeslots" placeholder="Timeslots" disabled={disableTimeslots}
                                    onChange={(e) => setLocation({ ...location, timeslot: e.target.value })} required>
                                        <option value=''></option>
                                    {
                                        availableTimeslots.map((time) => {

                                            return (<option value={time.id}>{time.id}</option>)

                                        })
                                    }
                                </select>
                            </div>
                        </div>

                        <br />
                        <div className="col-sm-auto">
                            <button type="submit" className="btn btn-primary bg-blue-500 font-semibold">
                                BOOK APPOINTMENT
                            </button>
                        </div>
                    </form>
                </div>
                <Footer />
            </div>
        </Sidebar>
    )
}

export default Booking;