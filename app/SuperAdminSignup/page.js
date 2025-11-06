"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api"; // Your configured axios instance
import Header from "@/public/src/components/RegistrationPageComponents/header";

const Registration = () => {
  const router = useRouter();

  // Form states - 'fullname' is fine for the UI
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback and loading
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- Frontend Validation ---
    if (!fullname || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // --- THIS IS THE FIX ---
    // The payload now sends 'name' (which your backend expects)
    // using the value from the 'fullname' state.
    const payload = {
      name: fullname, // <-- The fix is right here
      email,
      password,
    };
    // --- END OF FIX ---

    try {
      setLoading(true);

      // Send payload to your superadmin endpoint
      // Your controller sends back a { success: true, message: "...", ... }
      const response = await api.post("/auth/register-superadmin", payload);

      // Use the success message from your backend controller
      setSuccess(
        response.data.message ||
          "Registration successful! Please check your email."
      );
      setError("");

      // Reset form
      setFullname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to the AdminLogin page
      setTimeout(() => {
        router.push("/AdminLogin");
      }, 3000); // 3 seconds to read the success message
    } catch (err) {
      console.error(err); // Log the full error

      // This will now display the JSON error message from your backend
      let message = "Registration failed. Please try again.";
      if (err.response?.data?.message) {
        // This will show "User with this email already exists" etc.
        message = err.response.data.message;
      } else if (err.response?.status === 400) {
        message = "Validation Failed: The server rejected the data.";
      }

      if (err.response?.status !== 401) {
        setError(message);
      }
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  // Tailwind classes
  const inputStyle =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm " +
    "focus:outline-none focus:ring-[#7741C3] focus:border-[#7741C3] sm:text-sm text-black";

  const labelStyle = "block text-sm font-medium text-gray-900";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-[#7741C3]">
        <Header />
      </div>

      {/* Content */}
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Superadmin Account
            </h2>
            <p className="mt-1 text-md text-gray-700">
              Please fill in your details to sign up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Fullname */}
            <div>
              {/* This label can stay as "Fullname" for the user */}
              <label htmlFor="fullname" className={labelStyle}>
                Fullname
              </label>
              <input
                type="text"
                id="fullname"
                value={fullname} // State is still 'fullname'
                onChange={(e) => setFullname(e.target.value)}
                className={inputStyle}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelStyle}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                placeholder="e.g. you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelStyle}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelStyle}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Feedback */}
            <div className="text-center">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7741C3] hover:bg-[#6a39a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7741C3] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;