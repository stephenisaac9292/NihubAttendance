"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Header from "@/public/src/components/RegistrationPageComponents/header";

const Registration = () => {
  const router = useRouter();

  // Form states
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend Validation
    if (!fullname || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Prepare payload (backend expects 'name', not 'fullname')
    const payload = {
      name: fullname.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    console.log("Registration payload:", { name: payload.name, email: payload.email });

    try {
      setLoading(true);

      const response = await api.post("/auth/register-superadmin", payload);

      console.log("Registration successful:", response.data);

      setSuccess(
        response.data.message ||
          "Registration successful! Redirecting to login..."
      );
      setError("");

      // Reset form
      setFullname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/AdminLogin");
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);

      let message = "Registration failed. Please try again.";
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.response?.status === 400) {
        message = "Invalid data. Please check your inputs.";
      } else if (err.response?.status === 409) {
        message = "User with this email already exists.";
      }

      setError(message);
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
              <label htmlFor="fullname" className={labelStyle}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className={inputStyle}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelStyle}>
                Email <span className="text-red-500">*</span>
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
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelStyle}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7741C3] hover:bg-[#6a39a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7741C3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/AdminLogin")}
                className="text-[#7741C3] hover:text-[#6a39a9] font-medium underline"
                type="button"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;