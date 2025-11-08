"use client";
import { useRouter, usePathname } from "next/navigation";
import { useContext, useEffect, Suspense } from "react";
import Image from "next/image";
import { Rolecontex } from "../Admincontex";
import Header from "@/public/src/components/AddEventPageComponents/header";
import style from "./AdminLayout.module.css";

function AdminLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // Get isLoading from the context to prevent premature redirects
  const { Role, logout, isLoading } = useContext(Rolecontex);

  // Authorization Guard
  useEffect(() => {
    // Only redirect if we are done loading AND there is no valid role
    if (!isLoading && !Role) {
      router.push("/AdminLogin");
    }
  }, [Role, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/AdminLogin");
  };

  const isActive = (path) => pathname === path;

  // Determine header text based on active route
  const getHeaderText = () => {
    if (isActive("/AddEvent")) return "Create Event";
    if (isActive("/ManageEvent")) return "Manage Events";
    if (isActive("/Attendance")) return "Take Attendance";
    if (isActive("/admin")) return "Manage Admins";
    return "Admin Dashboard";
  };

  // 1. Show a loading screen while checking LocalStorage
  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h3 style={{ color: "#6b7280" }}>Loading dashboard...</h3>
      </div>
    );
  }

  // 2. If not loading and still no role, render nothing while waiting for redirect
  if (!Role) return null;

  // 3. Render Dashboard
  return (
    <div>
      <Header info={getHeaderText()} />
      
      <div className={style.container}>
        <div className={style.Titleandlogoutcontainer}>
          <div className={style.title}>Admin Dashboard</div>
          <button onClick={handleLogout} className={style.logoutbox}>
            <Image src="/logout.svg" width={14} height={14} alt="logout" />
            <span className={style.logout}>Logout</span>
          </button>
        </div>
        <h4 className={style.subtitle}>
          Manage events, attendance, and system administrators.
        </h4>
      </div>

      {/* Navigation Menu */}
      <div className={style.buttonscontainer}>
        <button 
          className={isActive("/AddEvent") ? style.Active : ""} 
          onClick={() => router.push("/AddEvent")}
        >
          Create Event
        </button>
        <button 
          className={isActive("/ManageEvent") ? style.Active : ""} 
          onClick={() => router.push("/ManageEvent")}
        >
          Manage Events
        </button>
        <button 
          className={isActive("/Attendance") ? style.Active : ""} 
          onClick={() => router.push("/Attendance")}
        >
          Attendance
        </button>

        {/* Only SuperAdmin sees this button */}
        {Role === "superadmin" && (
          <button 
            className={isActive("/admin") ? style.Active : ""} 
            onClick={() => router.push("/admin")}
          >
            Manage Admins
          </button>
        )}
      </div>

      <main>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}