"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/utils/api";
import Input from "@/public/src/components/manageEventpagecomponents/forminput";
import DescribeInput from "@/public/src/components/manageEventpagecomponents/Descriptioninput";
import Scroll from "@/public/src/components/scroll";
import style from "./ManageEvent.module.css";

const ManageEvent = () => {
  // Main event list state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Modal State
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    date: "",
    location: "",
    capacity: "",
    description: "",
    imageUrl: "",
  });

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      
      console.log("Fetch events response:", response);
      console.log("Response data:", response.data);

      // Handle different possible response structures
      let eventData = [];
      
      if (Array.isArray(response.data)) {
        eventData = response.data;
      } else if (response.data.events && Array.isArray(response.data.events)) {
        eventData = response.data.events;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        eventData = response.data.data;
      } else if (response.data.data?.events && Array.isArray(response.data.data.events)) {
        eventData = response.data.data.events;
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Unexpected data format from server.");
      }

      console.log("Extracted events array:", eventData);
      setEvents(eventData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch events:", err);
      console.error("Error response:", err.response?.data);
      
      setError(err.response?.data?.message || "Could not load events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle event status (Open/Closed)
  const handleStatusChange = async (id, currentStatus) => {
    try {
      // Optimistic update
      setEvents(events.map(e => 
        (e.id === id || e._id === id) ? { ...e, status: !currentStatus } : e
      ));

      await api.put(`/events/${id}/status`, { status: !currentStatus });
      
      setSuccess("Event status updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || "Failed to update event status.");
      fetchEvents(); // Revert changes
      setTimeout(() => setError(""), 3000);
    }
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      // Optimistic delete
      setEvents(events.filter(e => e.id !== id && e._id !== id));
      
      await api.delete(`/events/${id}`);
      
      setSuccess("Event deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete event:", err);
      setError(err.response?.data?.message || "Failed to delete event.");
      fetchEvents(); // Revert
      setTimeout(() => setError(""), 3000);
    }
  };

  // Open Edit Modal
  const openEditModal = (event) => {
    setEditId(event.id || event._id);
    setEditForm({
      name: event.name || "",
      date: event.date ? event.date.split('T')[0] : "",
      location: event.location || "",
      capacity: event.Register || event.capacity || "",
      description: event.programDescription || event.description || "",
      imageUrl: event.imageurl || event.imageUrl || "",
    });
    setEditMode(true);
    setError("");
    setSuccess("");
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditMode(false);
    setEditId(null);
    setEditForm({
      name: "",
      date: "",
      location: "",
      capacity: "",
      description: "",
      imageUrl: "",
    });
  };

  // Save Edited Event
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.name.trim()) {
      setError("Event title is required.");
      return;
    }
    
    if (!editForm.date) {
      setError("Event date is required.");
      return;
    }

    try {
      await api.put(`/events/${editId}`, editForm);

      setSuccess("Event updated successfully.");
      closeEditModal();
      fetchEvents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update event:", err);
      setError(err.response?.data?.message || "Failed to update event. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.loadingContainer}>
          <div className={style.spinner}></div>
          <p className={style.loadingText}>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <Scroll>
        <div className={style.box}>
          {/* Header Section */}
          <div className={style.headerSection}>
            <div>
              <h4 className={style.text}>Manage Events</h4>
              <p className={style.subtitle}>
                View and manage all your events in one place
              </p>
            </div>
            <div className={style.statsContainer}>
              <div className={style.statBox}>
                <span className={style.statNumber}>{events.length}</span>
                <span className={style.statLabel}>Total Events</span>
              </div>
              <div className={style.statBox}>
                <span className={style.statNumber}>
                  {events.filter(e => e.status).length}
                </span>
                <span className={style.statLabel}>Active</span>
              </div>
            </div>
          </div>
          
          {/* Feedback Messages */}
          {error && (
            <div className={style.error}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className={style.success}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {success}
            </div>
          )}

          <div className={style.subbox}>
            {/* Table Header */}
            <div className={style.headercontainer}>
              <span className={style.eventtitle}>Event Title</span>
              <span className={style.events}>Date</span>
              <span className={style.events}>Capacity</span>
              <span className={style.events}>Status</span>
              <span className={style.actions}>Actions</span>
            </div>

            {/* Event List */}
            {events.length === 0 ? (
              <div className={style.emptyState}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M32 8L8 20V44L32 56L56 44V20L32 8Z" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M32 56V32M32 32L8 20M32 32L56 20" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>No events found</h3>
                <p>Create your first event to get started</p>
              </div>
            ) : (
              <div className={style.eventsList}>
                {events.map((event) => (
                  <div key={event.id || event._id} className={style.list}>
                    <div className={style.listItemContent}>
                      <div className={style.eventNameContainer}>
                        <span className={style.eventname}>
                          {event.name || "Untitled Event"}
                        </span>
                        {event.location && (
                          <span className={style.eventLocation}>
                            📍 {event.location}
                          </span>
                        )}
                      </div>
                      
                      <span className={style.date}>
                        {formatDate(event.date)}
                      </span>
                      
                      <span className={style.register}>
                        {event.Register || event.capacity || "N/A"}
                      </span>
                      
                      <button
                        className={event.status ? style.statusOpen : style.statusClose}
                        onClick={() => handleStatusChange(event.id || event._id, event.status)}
                        title={`Click to ${event.status ? 'close' : 'open'} registration`}
                      >
                        {event.status ? "Open" : "Closed"}
                      </button>
                      
                      <div className={style.actionButtons}>
                        <button 
                          className={style.edit} 
                          onClick={() => openEditModal(event)}
                          title="Edit event"
                        >
                          <Image src="/edit.svg" alt="Edit" width={16} height={16} />
                        </button>
                        <button 
                          className={style.delete} 
                          onClick={() => handleDelete(event.id || event._id)}
                          title="Delete event"
                        >
                          <Image src="/delete.svg" alt="Delete" width={16} height={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Tracks Display */}
                    {event.Tracks && event.Tracks.length > 0 && (
                      <div className={style.tracksContainer}>
                         <span className={style.trackLabel}>Tracks:</span>
                         {event.Tracks.map(t => (
                           <span key={t.id || t._id} className={style.trackBadge}>
                             {t.fullname || t.name}
                           </span>
                         ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Scroll>

      {/* Edit Modal */}
      {editMode && (
        <div className={style.modalOverlay} onClick={closeEditModal}>
          <form 
            className={style.modalbox} 
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={style.modalHeader}>
               <h3>Edit Event</h3>
               <button 
                 type="button" 
                 className={style.canclemodal} 
                 onClick={closeEditModal}
                 aria-label="Close modal"
               >
                 ×
               </button>
            </div>
            
            <div className={style.formGrid}>
              <Input 
                type="text" 
                label="Event Title" 
                value={editForm.name} 
                setValue={(val) => setEditForm({...editForm, name: val})}
                required
              />
              
              <Input 
                type="date" 
                label="Event Date" 
                value={editForm.date} 
                setValue={(val) => setEditForm({...editForm, date: val})}
                required
              />
              
              <Input 
                type="text" 
                label="Location" 
                value={editForm.location} 
                setValue={(val) => setEditForm({...editForm, location: val})}
                placeholder="e.g. Main Auditorium"
              />
              
              <Input 
                type="number" 
                label="Capacity" 
                value={editForm.capacity} 
                setValue={(val) => setEditForm({...editForm, capacity: val})}
                placeholder="e.g. 100"
                min="1"
              />
              
              <div className={style.fullWidth}>
                <DescribeInput 
                  type="text" 
                  label="Description" 
                  value={editForm.description} 
                  setValue={(val) => setEditForm({...editForm, description: val})}
                  placeholder="Brief description of the event..."
                />
              </div>
              
              <div className={style.fullWidth}>
                <Input 
                  type="url" 
                  label="Image URL" 
                  value={editForm.imageUrl} 
                  setValue={(val) => setEditForm({...editForm, imageUrl: val})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className={style.modalActions}>
              <button 
                type="button" 
                className={style.canclebutton} 
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button type="submit" className={style.savebutton}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;