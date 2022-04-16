import { Component, React, useEffect, useRef, useState } from 'react'
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import Footer from '../extra/Footer';
import * as Styles from '../../constants/styles/styles';
import { auth, db } from '../../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'

function Maps() {

  let navigate = useNavigate();

  const [locationsList, setLocationsList] = useState([]);
  const locationsCollectionRef = collection(db, 'Locations')

  useEffect(() => {

    if(auth.currentUser == null){
      navigate("/login")

  }

  })

  const getLocations = async () => {

    const data = await getDocs(locationsCollectionRef)
    setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

  }

  const displayMarkers = () => {

    getLocations();

    return locationsList.map((location, index) => {
      return <Marker key={index} id={index} position={{
        lat: location.latitude,
        lng: location.longitude
      }}
        onClick={() => console.log(location.location_name)} />
    })
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
      <button onClick={() => displayMarkers()} className="text-4xl font-black text-gray-600">Show Locations</button>
        <Map
          google={window.google}
          style={Styles.MapStyling}
          zoom={10}
          initialCenter={
            {
              lat: 43.1007274,
              lng: -77.5381825
            }
          }>
          {locationsList.map((location, index) => {
            return <Marker key={index} id={index} position={{
              lat: location.latitude,
              lng: location.longitude
            }}
              onClick={() => console.log("You clicked me!")} />
          })}
        </Map>
      </div>
      <Footer />
    </Sidebar>
  );
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBUH34ZHgRRL22G67Hd0Mt_9Kp7xou5_6E'
})(Maps);