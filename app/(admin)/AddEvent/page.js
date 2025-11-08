"use client";
import { useState } from "react";
import api from "@/utils/api"; // Your configured axios instance
import Input from "@/public/src/components/AddEventPageComponents/Forminput";
import DescribeInput from "@/public/src/components/AddEventPageComponents/Descriptioninput";
import Scroll from "@/public/src/components/scroll";
import style from "./AddEvent.module.css"; // We'll create this CSS file

const AddEvent = () => {
  // Notice: No layout code, no Role context, no navigation handlers.
  // This component only focuses on creating an event.

  // Event Details
  const [eventname, setEventname] = useState("");    
  const [eventdate, setEventdate] = useState("");
  const [eventlocation, setEventlocation] = useState("");
  const [eventdescription, setEventdescription] = useState("");
  const [eventcapacity, setEventcapacity] = useState("");
  const [eventimageurl, setEventimageurl] = useState(""); // Assuming this is a URL

  // Track Details
  const [trackid, setTrackid] = useState("");
  const [trackname, setTrackname] = useState("");
  const [trackabbrivation, setTrackabbrvation] = useState("");
  const [eventtracks, setEventtracks] = useState([]); // A list of track objects

  // UI State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handledropdown = () => {
    setDropdown(!dropdown);
    setError(""); // Clear error when toggling
  };

  const handleaddtrack = () => {
    if (!trackid || !trackabbrivation || !trackname) {
      setError("Please fill in all track fields to add a track.");
      return;
    }

    const newtrack = {
      id: trackid, // Use the state variable
      abbreviation: trackabbrivation,
      name: trackname
    };

    setEventtracks([...eventtracks, newtrack]);

    // Clear track inputs
    setTrackid("");
    setTrackname("");
    setTrackabbrvation("");
    setError("");
    setDropdown(false); // Close dropdown after adding
  };

  // Main form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!eventname || !eventdate || !eventlocation || !eventdescription) {
      setError("Please fill in all required event fields.");
      setLoading(false);
      return;
    }

    // This is the final object to send to the backend
    const eventPayload = {
      name: eventname,
      date: eventdate,
      location: eventlocation,
      description: eventdescription,
      capacity: eventcapacity || 0, // Default to 0 if empty
      imageUrl: eventimageurl,
      tracks: eventtracks // Send the array of track objects
    };

    try {
      // Send the payload to your backend
      await api.post("/events/create", eventPayload); // Example endpoint

      setSuccess("Event created successfully!");

      // Reset form
      setEventname("");
      setEventdate("");
      setEventlocation("");
      setEventdescription("");
      setEventcapacity("");
      setEventimageurl("");
      setEventtracks([]);
      setError("");

    } catch (err) {
      const message = err.response?.data?.message || "Event creation failed.";
      setError(message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    // The page starts RIGHT at the specific content.
    // The (admin)/layout.jsx file automatically wraps this.
    <Scroll>
      <div className={style.formcontainer}>
        <h3 className={style.create}>Create New Event</h3>
        <h1 className={style.createsubtitle}>Add a new event to the platform</h1>
        
        <div className={style.inputcontainer}>
          <Input type="text" label="Event Title" value={eventname} setValue={setEventname} />
          <Input type="date" label="Event Date" value={eventdate} setValue={setEventdate} /> 
        </div>
        
        <DescribeInput type="text" label="Description" value={eventdescription} setValue={setEventdescription} />
        
        <div className={style.inputcontainer}>
          <Input type="text" label="Event Location" value={eventlocation} setValue={setEventlocation} />
          <Input type="number" label="Event Capacity" value={eventcapacity} setValue={setEventcapacity} />
        </div>
        
        <div className={style.inputcontainer2}>
          <Input type="text" label="Event Image URL" value={eventimageurl} setValue={setEventimageurl} />
        </div>

        {/* --- Track Section --- */}
        <div className={style.trackSection}>
          <h3 className={style.trackTitle}>Event Tracks</h3>
          {eventtracks.length > 0 ? (
            <ul className={style.trackList}>
              {eventtracks.map((track, index) => (
                <li key={index}>{track.name} ({track.abbreviation})</li>
              ))}
            </ul>
          ) : (
            <p className={style.noTracks}>No tracks added yet.</p>
          )}
        </div>
        
        <div className={style.inputcontainer3}>
          <button className={style.button} onClick={handledropdown}>
            {dropdown ? "Close Track Form" : "Create Track"}
          </button>
          <button className={style.button} onClick={handleSubmit} disabled={loading}>
            {!loading ? "Create Event" : "Please wait..."}
          </button>
        </div>

        {/* --- Track Form Dropdown --- */}
        {dropdown && ( 
          <div className={style.dropdowncontainer}> 
            <Input type="text" label="Track ID" value={trackid} setValue={setTrackid} />
            <Input type="text" label="Track Name" value={trackname} setValue={setTrackname} />
            <Input type="text" label="Track Abbreviation" value={trackabbrivation} setValue={setTrackabbrvation} />
            <button className={style.button2} onClick={handleaddtrack}>Add Track</button>
          </div>
        )}

        {/* --- Feedback --- */}
        {error && <p className={style.error}>{error}</p>}
        {success && <p className={style.success}>{success}</p>}
      </div>
    </Scroll>
  );
};

export default AddEvent;