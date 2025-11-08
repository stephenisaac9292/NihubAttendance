"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/utils/api";
import Scroll from "@/public/src/components/scroll";
import style from "./Attendance.module.css";

const Attendance = () => {
  // --- Data State ---
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  
  // --- UI State ---
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Initial Load: Fetch Events for dropdown ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        console.log("Fetch events response:", response);
        console.log("Response data:", response.data);
        
        // Handle nested response structure similar to your card component
        const eventsData = response?.data?.data?.events ?? [];
        console.log("Extracted events array:", eventsData);
        
        setEvents(eventsData);
      } catch (err) {
        console.error("Failed to load events", err);
        setError("Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  // --- Fetch Students when an Event is selected ---
  useEffect(() => {
    if (!selectedEventId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Adjust endpoint to match your backend
        const response = await api.get(`/events/${selectedEventId}/participants`);
        console.log("Participants response:", response);
        
        // Handle nested structure if needed
        const participantsData = response?.data?.data?.participants ?? response?.data ?? [];
        setStudents(participantsData);
        setError("");
      } catch (err) {
        console.error("Failed to load students", err);
        setError("Could not load student list for this event.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedEventId]);

  // --- derived state for UI ---
  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    return students.filter((s) =>
      (s.fullname || s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.matricNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!Array.isArray(students)) return { total: 0, present: 0, absent: 0, rate: 0 };
    
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, rate };
  }, [students]);

  // --- Actions ---
  const markPresent = async (studentId) => {
    try {
      // Optimistic update
      setStudents(prev => 
        Array.isArray(prev) 
          ? prev.map(s => s.id === studentId || s._id === studentId ? {...s, status: 'present'} : s)
          : []
      );
      
      await api.put(`/participants/${studentId}/attendance`, { status: 'present' });
      showSuccess("Marked present");
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setError("Failed to mark attendance");
    }
  };

  const markAllPresent = async () => {
    if (!confirm("Mark ALL displayed students as present?")) return;
    try {
        setLoading(true);
        // Assuming backend has a bulk endpoint
        await api.put(`/events/${selectedEventId}/attendance/mark-all`, { status: 'present' });
        
        // Update local state
        setStudents(prev => 
          Array.isArray(prev) 
            ? prev.map(s => ({...s, status: 'present'}))
            : []
        );
        showSuccess("All students marked present");
    } catch (err) {
        console.error("Failed to mark all present:", err);
        setError("Failed to mark all present");
    } finally {
        setLoading(false);
    }
  }

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        {/* Header & Controls */}
        <div className={style.headerSection}>
            <div>
                <h2 className={style.title}>Attendance Management</h2>
                <p className={style.subtitle}>Track and manage participant attendance</p>
            </div>
            
            {/* Event Selector Dropdown */}
            <div className={style.selectorContainer}>
                <select 
                    className={style.eventSelector}
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                >
                    <option value="">-- Select an Event --</option>
                    {Array.isArray(events) && events.map(event => (
                        <option key={event._id || event.id} value={event._id || event.id}>
                            {event.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Stats Cards */}
        <div className={style.statsGrid}>
            <div className={style.statCard}>
                <div className={style.statIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <h4>Total Registered</h4>
                <p className={style.statNumber}>{stats.total}</p>
            </div>
            <div className={`${style.statCard} ${style.statCardPresent}`}>
                <div className={style.statIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h4>Present</h4>
                <p className={style.statNumber}>{stats.present}</p>
            </div>
            <div className={`${style.statCard} ${style.statCardAbsent}`}>
                <div className={style.statIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
                <h4>Absent</h4>
                <p className={style.statNumber}>{stats.absent}</p>
            </div>
            <div className={style.statCard}>
                <div className={style.statIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                </div>
                <h4>Attendance Rate</h4>
                <p className={style.statNumber}>{stats.rate}%</p>
            </div>
        </div>

        {/* Main Content Area */}
        <div className={style.contentCard}>
            {/* Toolbar */}
            <div className={style.toolbar}>
                <div className={style.searchContainer}>
                    <svg className={style.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search by name or matric number..." 
                        className={style.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={style.toolbarActions}>
                     <button className={style.qrButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM16.5 19.5h.75v.75h-.75v-.75z" />
                        </svg>
                        Scan QR
                     </button>
                     <button 
                        className={style.markAllBtn} 
                        onClick={markAllPresent} 
                        disabled={!selectedEventId || students.length === 0}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        Mark All Present
                     </button>
                </div>
            </div>

            {/* Feedback */}
            {error && <div className={style.error}>{error}</div>}
            {success && <div className={style.success}>{success}</div>}

            {/* Student Table */}
            <div className={style.tableContainer}>
                <div className={style.tableHeader}>
                    <span>Name</span>
                    <span>Matric Number</span>
                    <span>Status</span>
                    <span>Action</span>
                </div>

                <Scroll>
                    <div className={style.listBody}>
                        {loading ? (
                            <div className={style.emptyState}>
                                <div className={style.loadingSpinner}></div>
                                <p>Loading participants...</p>
                            </div>
                        ) : !selectedEventId ? (
                            <div className={style.emptyState}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <p>Please select an event above to view participants.</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className={style.emptyState}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </svg>
                                <p>No participants found.</p>
                            </div>
                        ) : (
                            filteredStudents.map((student) => (
                                <div key={student._id || student.id} className={style.listItem}>
                                    <span className={style.studentName}>
                                        {student.fullname || student.name || 'N/A'}
                                    </span>
                                    <span className={style.matric}>
                                        {student.matricNumber || 'N/A'}
                                    </span>
                                    <span>
                                        <span className={student.status === 'present' ? style.badgePresent : style.badgeAbsent}>
                                            {student.status || 'absent'}
                                        </span>
                                    </span>
                                    <span>
                                        {student.status !== 'present' && (
                                            <button 
                                                className={style.markBtn} 
                                                onClick={() => markPresent(student._id || student.id)}
                                            >
                                                Mark Present
                                            </button>
                                        )}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Scroll>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;