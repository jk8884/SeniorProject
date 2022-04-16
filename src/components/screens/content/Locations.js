import Footer from '../extra/Footer';
import * as Styles from '../../constants/styles/styles';
import React, { useEffect, useRef, useState } from 'react'
import { auth, db } from '../../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, setDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { Alert } from 'react-bootstrap'
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import moment from 'moment';
import DatePicker from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { Card } from "react-bootstrap";

function Locations() {

    let navigate = useNavigate();

    const locationNameRef = useRef()
    const addressRef = useRef()
    const startTimeRef = useRef()
    const capacityRef = useRef()

    const [usersList, setUsersList] = useState([]);
    const usersCollectionRef = collection(db, 'Users')
    const [locationsList, setLocationsList] = useState([]);
    const locationsCollectionRef = collection(db, 'Locations')
    const [timeslotsList, setTimeslotsList] = useState([]);
    const [timeslotsShown, setTimeslotsShown] = useState(false)
    const [chosenLocation, setChosenLocation] = useState('')
    const [chosenTimeslot, setChosenTimeslot] = useState('')
    const [capacity, setCapacity] = useState('')
    const [customDates, setCustomDates] = useState([])

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

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

            getUsers();
            getLocations();

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    })

    const getUnavailableDates = async (locationID, timeslotID) => {

        setCustomDates([])

        const unavailableDocs = await getDocs(collection(db, 'Locations', locationID, 'Timeslots', timeslotID, 'Unavailable Dates'))

        unavailableDocs.docs.map((doc) => {

            const data = doc.data()

            setCustomDates((customDates) => [
                ...customDates,
                data.date
            ])

        })

    }

    const disableCustomDt = current => {

        return !customDates.includes(current.format('YYYY-MM-DD'));
    }


    function getRandomString(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    const [date, setDate] = useState(new Date());

    const [timeslot, setTimeslot] = useState({
        start_time: '',
        capacity: ''
    })

    const [location, setLocation] = useState({
        location_name: '',
        address: ''
    })

    const addLocation = async (e) => {

        e.preventDefault();

        await setDoc(doc(db, 'Locations', location.location_name), {
            location_name: location.location_name,
            address: location.address,
            active: false
        })

        usersList.map(async (user) => {

            await setDoc(doc(db, 'Users', user.id, 'Locations', location.location_name), {
                total_proccesed: 0,
                total_side_effects: 0
            })

        }).then(() => {
            setLocation({
                location_name: '',
                timeslot: ''
            })
        })




        document.getElementById('name').value = ''
        document.getElementById('address').value = ''

    }

    const showTimeslots = async (id) => {

        setTimeslotsList([])

        var timeslotsListRef = collection(db, 'Locations', id, 'Timeslots')

        var data = await getDocs(timeslotsListRef)

        setTimeslotsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

    }

    const editingTimeslot = async (locationID, timeslotID) => {

        const timeslotDoc = doc(db, 'Locations', locationID, 'Timeslots', timeslotID)
        const timeslotSnap = await getDoc(timeslotDoc)
        const timeslot = timeslotSnap.data()

        setCapacity(timeslot.capacity)

    }

    const addUnavailableDate = async (e, locationID, timeslotID) => {

        e.preventDefault();

        const formatted = date.format('YYYY-MM-DD')

        await setDoc(doc(db, 'Locations', locationID, 'Timeslots', timeslotID, 'Unavailable Dates', formatted), {
            date: formatted
        })

        setTimeslotsShown(false)

    }

    const updateTimeslot = async (e, locationID, timeslotID) => {

        e.preventDefault();

        const timeslotDoc = doc(db, 'Locations', locationID, 'Timeslots', timeslotID)

        await updateDoc(timeslotDoc, {
            capacity: capacity
        })

    }

    const deactivateLocation = async (id) => {

        const locationDoc = doc(db, 'Locations', id)
        await updateDoc(locationDoc, {
            active: false
        })

    }

    const deleteTimeslot = async (location_id, id) => {

        const timeslotDoc = doc(db, 'Locations', location_id, 'Timeslots', id)
        await deleteDoc(timeslotDoc)

    }

    const addTimeslot = async (e) => {

        e.preventDefault();

        await setDoc(doc(collection(db, 'Locations', location.location_name, 'Timeslots'), location.location_name + ' ' + timeslot.start_time), {
            start_time: timeslot.start_time,
            capacity: timeslot.capacity
        })
        setLocation({
            location_name: ''
        })
        setTimeslot({
            start_time: '',
            capacity: ''
        })

        document.getElementById('addTimeslotLocation').value = ''
        document.getElementById('startTime').value = ''
        document.getElementById('capacity').value = ''

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
            <div className="container gap-8" style={Styles.MainBody}>
                {/* Ovdje su dvoje valjajuce forme za addanje locationa i timeslotova*/}
                <div className="col-sm-4" >
                    <h1 className="text-4xl font-black text-gray-600">Add timeslot</h1>
                    <br />
                    {error && <Alert variant='danger'>{error}</Alert>}
                    <form onSubmit={addTimeslot}>
                        <div className='pb-2'>
                            <label htmlFor="name" className="form-label font-black text-gray-500">Add Location</label>
                            <select type="text" className="form-control"
                                placeholder="Enter..." id="addTimeslotLocation" ref={locationNameRef}
                                onChange={(e) =>
                                    setLocation({ ...location, location_name: e.target.value })} required>
                                <option value=''></option>
                                {
                                    locationsList.map((location) => {
                                        return (
                                            <option value={location.id}>{location.id}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className='pb-2'>
                            <label htmlFor="location" className="form-label font-black text-gray-500">Starting time</label>
                            <input type="text" className="form-control" placeholder="Enter..." ref={startTimeRef} id='startTime'
                                onChange={(e) =>
                                    setTimeslot({ ...timeslot, start_time: e.target.value })} required />
                        </div>
                        <div className='pb-10'>
                            <label htmlFor="location" className="form-label font-black text-gray-500">Capacity</label>
                            <input type="text" className="form-control" placeholder="Enter..." ref={capacityRef} id='capacity'
                                onChange={(e) =>
                                    setTimeslot({ ...timeslot, capacity: e.target.value })} required />
                        </div>
                        <div className="col-sm-auto">
                            <button type="submit" className="btn btn-primary bg-blue-500 font-semibold">
                                SUBMIT TIMESLOT
                            </button>
                        </div>
                    </form>
                </div>
                <br />
                <br />
                <div className="col-sm-4">
                    <h1 className="text-4xl font-black text-gray-600">Add location</h1>
                    <br />
                    {error && <Alert variant='danger'>{error}</Alert>}
                    <form onSubmit={addLocation}>
                        <div className='pb-2'>
                            <label htmlFor="name" className="form-label font-black text-gray-500">Vaccination location</label>
                            <input type="text" className="form-control"
                                placeholder="Enter..." id="name" ref={locationNameRef}
                                onChange={(e) =>
                                    setLocation({ ...location, location_name: e.target.value })} required />
                        </div>
                        <div className='pb-10'>
                            <label htmlFor="location" className="form-label font-black text-gray-500">Address</label>
                            <input type="text" className="form-control" placeholder="Enter..." ref={addressRef} id='address'
                                onChange={(e) =>
                                    setLocation({ ...location, address: e.target.value })} required />
                        </div>
                        <div className="col-sm-auto">
                            <button type="submit" className="btn btn-primary bg-blue-500 font-semibold">
                                SUBMIT LOCATION
                            </button>
                        </div>
                    </form>
                </div>
                <div className="flex gap-8" style={Styles.MainBody}>
                    <div>{locationsList.map((location) => {
                        if (location.active == true) {
                            return (

                                <Card style={Styles.CardContainer}>
                                    <Card.Body>
                                        <div className='post'>
                                            <button className='postHeader' onClick={() => {
                                                showTimeslots(location.id)
                                                setChosenLocation(location.id)
                                            }}>
                                                {location.location_name}
                                            </button>
                                            <div className='deletePost'>

                                                <button style={Styles.DeleteButton} onClick={() => { deactivateLocation(location.id) }} > {' '} &#128465; </button>

                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )
                        }
                    })}</div>
                    <div>{timeslotsList.map((timeslot) => {
                        return (

                            <Card style={Styles.CardContainerTimeslot}>
                                <Card.Body>
                                    <Card.Text >{timeslot.id}</Card.Text>
                                    <div class="columns-2">
                                        <div className='deletePost'>

                                            <button style={Styles.CardLink} onClick={() => {
                                                setTimeslotsShown(true);
                                                setChosenTimeslot(timeslot.id);
                                                editingTimeslot(chosenLocation, timeslot.id)
                                                getUnavailableDates(chosenLocation, timeslot.id);
                                            }} > Edit </button>

                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                        )
                    })}</div>
                    {timeslotsShown && <div className="col-sm-4" >
                        <h1 className="text-4xl font-black text-gray-600">Edit timeslot</h1>
                        <br />
                        {error && <Alert variant='danger'>{error}</Alert>}
                        <form>
                            <div className='row-sm-8'>
                                <label htmlFor="location" className="form-label font-black text-gray-500">Capacity</label>
                                <input type="text" className="form-control" placeholder="Enter..." ref={capacityRef} value={timeslot.capacity}
                                    onChange={(e) =>
                                        setTimeslot({ ...timeslot, capacity: e.target.value })} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="timeslot" className="font-black text-gray-500 py-2">Add Unavailable Dates</label>
                                <DatePicker timeFormat={false} isValidDate={disableCustomDt} selected={date}
                                    onChange={(date) => setDate(date)} required />
                            </div>
                            <div style={Styles.GridBtn} className="col-sm-auto">
                                <button type="submit" className="btn btn-primary bg-blue-500 font-semibold" onClick={(e) => { addUnavailableDate(e, chosenLocation, chosenTimeslot) }}>
                                    UPDATE
                                </button>
                                <button type="submit" className="btn btn-primary bg-blue-500 font-semibold" onClick={(e) => { updateTimeslot(e, chosenLocation, chosenTimeslot) }}>
                                    SAVE CHANGES
                                </button>
                            </div>
                        </form>
                    </div>}
                </div>
                <Footer />
            </div>
        </Sidebar>
    )
}

export default Locations;