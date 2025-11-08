"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { Rolecontex } from "../Admincontex";
import api from "@/utils/api";
import Header from "@/public/src/components/AdminLoginpageComponents/header";
import Input from "@/public/src/components/AdminLoginpageComponents/Forminput";
import style from "./AdminLogin.module.css";

const AdminLogin = () => {
  const { login } = useContext(Rolecontex);
  const router = useRouter();

  // UI state for role switching (SuperAdmin/Admin)
  const [currentView, setCurrentView] = useState("SuperAdmin");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Feedback states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setCurrentView(newRole);
    setError("");
    // Don't clear email/password - user might just be switching views
  };

  const handleGoBack = () => {
    router.push("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Frontend validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Clean the inputs
    const payload = {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    console.log("Login attempt with:", { email: payload.email, passwordLength: payload.password.length });

    try {
      const response = await api.post("/auth/login", payload);
      
      console.log("Login successful - Full response:", response);
      console.log("Response data:", response.data);

      // Handle different possible response structures
      const data = response.data;
      const user = data.user || data.data?.user || data;
      const token = data.token || data.data?.token || data.accessToken;

      console.log("Extracted user:", user);
      console.log("Extracted token:", token);

      if (!user) {
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      // Optional: Verify the user's role matches what they selected
      // Only check if user.role exists
      if (user.role) {
        const userRole = user.role.toLowerCase();
        if (currentView === "SuperAdmin" && userRole !== "superadmin") {
          setError("This account is not a SuperAdmin account. Please select Admin.");
          setLoading(false);
          return;
        }

        if (currentView === "Admin" && userRole !== "admin") {
          setError("This account is not an Admin account. Please select SuperAdmin.");
          setLoading(false);
          return;
        }
      }

      // Store credentials in context
      login(user, token);

      // Redirect to dashboard
      router.push("/ManageEvent");

    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      
      // Extract error message
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.pageWrapper}>
      {/* Back Button */}
      <div className={style.backButtonContainer}>
        <button className={style.backbotton} onClick={handleGoBack}>
          Back to Events
        </button>
      </div>

      <div className={style.container}>
        {/* Header Section with Logo */}
        <div className={style.headerSection}>
          <div className={style.logoContainer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h2 className={style.Login}>Admin Login</h2>
          <p className={style.subtitle}>Sign in to access the admin dashboard</p>
        </div>

        {/* Role Selector */}
        <div className={style.Role}>
          <button
            className={currentView === "SuperAdmin" ? style.Active : ""}
            onClick={() => handleRoleChange("SuperAdmin")}
            type="button"
          >
            SuperAdmin
          </button>
          <button
            className={currentView === "Admin" ? style.Active : ""}
            onClick={() => handleRoleChange("Admin")}
            type="button"
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={style.loginForm}>
          <Input
            type="email"
            label="Email"
            value={email}
            setValue={setEmail}
          />
          <Input
            type="password"
            label="Password"
            value={password}
            setValue={setPassword}
          />

          {/* Error Message */}
          {error && <div className={style.error}>{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className={style.submit}
            disabled={loading}
          >
            {loading && <span className={style.loadingSpinner}></span>}
            {loading ? "Signing in..." : `Login as ${currentView}`}
          </button>
        </form>

        {/* Link to Registration */}
        <div className={style.registerLink}>
          <p>
            Don't have an account?
            <button
              onClick={() => router.push("/SuperAdminLogin")}
              type="button"
            >
              Register here
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={style.footer}>
        <p>© 2025 Event Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;