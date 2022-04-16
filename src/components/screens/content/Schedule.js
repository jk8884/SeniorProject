import Footer from "../extra/Footer";
import * as Styles from "../../constants/styles/styles";
import React, { useEffect, useRef, useState } from "react";
import app, { auth, db } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Alert } from "react-bootstrap";
import Sidebar from "react-sidebar";
import CustomSidebar from "../../reactComponents/CustomSidebar";
import moment from "moment";
import DatePicker from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { format } from "date-fns";
import "../../constants/styles/style.css";

function Schedule({ setIsAuth }) {
  let navigate = useNavigate();

  const [loader, setLoader] = useState(true);
  const [delay, setDelay] = useState(5000)


  const [locationsList, setLocationsList] = useState([]);
  const locationsCollectionRef = collection(db, "Locations");
  const [timeslotsList, setTimeslotsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);

  const [date, setDate] = useState();

  const [currentLocation, setCurrentLocation] = useState("");
  const [loading, setLoading] = useState(false);

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  useEffect(() => {

    let isCancelled = false
    const handleChange = async () => {

      if(auth.currentUser == null){
        navigate("/login")
    }

      await timeout(5000)

      getLocations();

    }
    handleChange()

    return () => {
      isCancelled = true
    }

  });

  const getLocations = async () => {
    const data = await getDocs(locationsCollectionRef);
    setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const getTimeslots = async (locationID) => {
    setAppointmentsList([]);

    setTimeslotsList([]);

    setCurrentLocation(locationID);

    const data = await getDocs(
      collection(db, "Locations", locationID, "Timeslots")
    );

    data.docs.map((doc) =>
      setTimeslotsList((timeslotsList) => [
        ...timeslotsList,
        { ...doc.data(), id: doc.id },
      ])
    );
  };

  const getAppointments = async (locationID, timeslotID) => {
    setAppointmentsList([]);

    const data = await getDocs(
      collection(
        db,
        "Locations",
        locationID,
        "Timeslots",
        timeslotID,
        "Appointments"
      )
    );

    const data2 = await getDocs(
      collection(db,'Patients')
    )

    data.docs.map((doc) =>
      setAppointmentsList((appointmentsList) => [
        ...appointmentsList,
        { ...doc.data(), id: doc.id },
      ])
    );
  };

  function getRandomString(length) {
    var randomChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    return result;
  }

  return (
    <Sidebar
      docked={true}
      sidebar={<CustomSidebar />}
      styles={{
        sidebar: {
          background: "white",
          width: "15rem",
          paddingTop: "7rem",
        },
      }}
    >
      <div className="container flex flex-wrap gap-8" style={Styles.MainBody}>
        <div className="flex flex-wrap gap-8 p-4">

          <table className="border-separate border border-slate-500 bg-white">
            <thead>
              <tr>
                <th className="text-2xl font-black text-gray-500 border border-slate-600 p-2 tracking-wide">
                  Location
                </th>
                <th className="text-2xl font-black text-gray-500 border border-slate-600 p-2 tracking-wide">
                  Timeslot
                </th>
                <th className="text-2xl font-black text-gray-500 border border-slate-600 p-2 tracking-wide">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="list-none">
                <td className="font-bold text-gray-500 border border-slate-700">
                  {locationsList.map((location) => {
                    return (
                      <div className="align-left p-2">
                        <button onClick={() => getTimeslots(location.id)}>
                          {location.id}
                        </button>
                      </div>
                    );
                  })}
                </td>
                <td className="font-bold text-gray-500 border border-slate-700">
                  {timeslotsList.map((timeslot) => {
                    return (
                      <div className="align-left p-2">
                        <button
                          onClick={() =>
                            getAppointments(currentLocation, timeslot.id)
                          }
                        >
                          {timeslot.id}
                        </button>
                      </div>
                    );
                  })}
                </td>
                <td className="font-bold text-gray-500 border border-slate-700">
                  {appointmentsList.map((appointment) => {
                    const today = new Date();

                    const formatted = format(today, "yyyy-MM-dd");

                    if (formatted == appointment.date) {
                      return (
                        <div className="align-left p-2">
                          <h1>{appointment.name}</h1>
                        </div>
                      );
                    } else {
                      return;
                    }
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
    </Sidebar>
  );
}

export default Schedule;
