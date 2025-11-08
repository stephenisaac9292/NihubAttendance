"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { Rolecontex } from "@/app/Admincontex";
import Input from "@/public/src/components/manageEventpagecomponents/forminput";
import Scroll from "@/public/src/components/scroll";
import style from "./admin.module.css";

const Admin = () => {
  const { Role, isLoading } = useContext(Rolecontex);
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ fullname: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  // --- Security Check ---
  useEffect(() => {
    console.log("Role check:", { Role, isLoading });
    // Wait for loading to finish before checking role
    if (!isLoading && Role && Role !== "superadmin") {
      console.log("Not superadmin, redirecting...");
      router.push("/ManageEvent");
    }
  }, [Role, isLoading, router]);

  // --- Initial Fetch ---
  useEffect(() => {
    console.log("Fetch effect triggered:", { Role, isLoading });
    if (Role && Role === "superadmin") {
      fetchAdmins();
    }
  }, [Role]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      console.log("Fetching admins...");
      
      const response = await api.get("/users/admins");
      console.log("Admins response:", response);
      console.log("Response data:", response.data);
      
      // Handle nested response structure - adjust based on your API
      let adminsData = [];
      
      if (Array.isArray(response.data)) {
        adminsData = response.data;
      } else if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          adminsData = response.data.data;
        } else if (response.data.data.admins) {
          adminsData = response.data.data.admins;
        } else if (response.data.data.users) {
          adminsData = response.data.data.users;
        }
      } else if (response.data?.admins) {
        adminsData = response.data.admins;
      } else if (response.data?.users) {
        adminsData = response.data.users;
      }
      
      console.log("Extracted admins:", adminsData);
      setAdmins(adminsData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch admins", err);
      console.error("Error response:", err.response);
      
      // Only show error if it's not just an empty list (404)
      if (err.response?.status !== 404) {
         setError("Could not load admin list.");
      } else {
        setAdmins([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newAdmin.fullname || !newAdmin.email || !newAdmin.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (newAdmin.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setCreating(true);
      // UPDATED ENDPOINT AND PAYLOAD
      await api.post("/users", {
        name: newAdmin.fullname,
        email: newAdmin.email,
        password: newAdmin.password,
        role: "admin" // Explicitly set the role
      });
      
      setSuccess("New admin created successfully!");
      setShowModal(false);
      setNewAdmin({ fullname: "", email: "", password: "" });
      fetchAdmins(); // Refresh list
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Create admin error:", err);
      setError(err.response?.data?.message || "Failed to create admin.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
    try {
      // Optimistic update
      setAdmins(admins.filter(a => (a.id || a._id) !== id));
      
      await api.delete(`/users/${id}`);
      setSuccess("Admin deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete admin");
      fetchAdmins(); // Revert on error
    }
  };

  // While checking auth, show loader
  if (isLoading) {
    return (
      <div className={style.pageWrapper}>
        <div className={style.loadingState}>
          <div className={style.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not a superadmin, don't render (useEffect will redirect)
  if (Role !== "superadmin") {
    return null;
  }

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.headerSection}>
          <div>
            <h2 className={style.title}>Manage Admins</h2>
            <p className={style.subtitle}>Create and manage admin accounts</p>
          </div>
          <button className={style.createBtn} onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Admin
          </button>
        </div>

        {error && <div className={style.error}>{error}</div>}
        {success && <div className={style.success}>{success}</div>}

        <div className={style.tableCard}>
          <div className={style.tableHeader}>
            <span>Full Name</span>
            <span>Email Address</span>
            <span>Role</span>
            <span className={style.actionsLabel}>Actions</span>
          </div>

          {loading && (
             <div className={style.loadingState}>
                <div className={style.spinner}></div>
                <p>Loading admins...</p>
             </div>
          )}

          {!loading && admins.length === 0 && (
            <div className={style.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>No admins found. Click "Create New Admin" to add one.</p>
            </div>
          )}

          <Scroll>
            <div className={style.listContainer}>
              {!loading && admins.map((admin) => (
                <div key={admin._id || admin.id} className={style.listItem}>
                  <span className={style.adminName}>{admin.name || admin.fullname || 'N/A'}</span>
                  <span className={style.adminEmail}>{admin.email || 'N/A'}</span>
                  <span><span className={style.roleBadge}>{admin.role || 'Admin'}</span></span>
                  <div className={style.actionButtons}>
                    <button 
                      onClick={() => handleDelete(admin._id || admin.id)} 
                      className={style.deleteBtn} 
                      title="Delete Admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Scroll>
        </div>
      </div>

      {showModal && (
        <div className={style.modalOverlay}>
          <div className={style.modalContent}>
            <div className={style.modalHeader}>
              <h3>Create New Admin</h3>
              <button onClick={() => setShowModal(false)} className={style.closeModal}>×</button>
            </div>
            <form onSubmit={handleCreate} className={style.modalForm}>
              <div className={style.formGroup}>
                 <Input 
                   type="text" 
                   label="Full Name" 
                   value={newAdmin.fullname} 
                   setValue={(val) => setNewAdmin({...newAdmin, fullname: val})} 
                 />
              </div>
              <div className={style.formGroup}>
                 <Input 
                   type="email" 
                   label="Email Address" 
                   value={newAdmin.email} 
                   setValue={(val) => setNewAdmin({...newAdmin, email: val})} 
                 />
              </div>
              <div className={style.formGroup}>
                 <Input 
                   type="password" 
                   label="Password" 
                   value={newAdmin.password} 
                   setValue={(val) => setNewAdmin({...newAdmin, password: val})} 
                 />
                 <p className={style.passwordHint}>Must be at least 6 characters long.</p>
              </div>
              <div className={style.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className={style.cancelBtn} 
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className={style.saveBtn} disabled={creating}>
                  {creating ? (
                    <>
                      <div className={style.buttonSpinner}></div>
                      Creating...
                    </>
                  ) : (
                    "Create Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;