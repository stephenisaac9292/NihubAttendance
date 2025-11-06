"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api"; // Your configured axios instance

// --- Icons ---
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-16 h-16 text-green-500 mx-auto"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-16 h-16 text-red-500 mx-auto"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
    />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-10 w-10 text-[#7741C3] mx-auto"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
// --- End Icons ---

/**
 * This component reads the URL params and calls the API.
 * It's wrapped in <Suspense> below.
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // This function calls your backend to verify the token
    const verifyUserEmail = async () => {
      if (!token || !email) {
        setError("Invalid verification link. Token or email is missing.");
        setLoading(false);
        return;
      }

      try {
        // --- API Call ---
        // This MUST match an endpoint on your backend.
        const response = await api.post("/auth/verify-email", { token, email });

        setSuccess(
          response.data.message ||
            "Email verified successfully! You can now log in."
        );
        setError("");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/AdminLogin");
        }, 3000);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Verification failed. The link may be invalid or expired.";
        setError(message);
        setSuccess("");
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [token, email, router]); // Run once when component mounts

  // --- Render logic ---
  return (
    <div className="text-center space-y-4">
      {loading && (
        <>
          <LoadingSpinner />
          <h2 className="text-xl font-semibold text-gray-800">
            Verifying your email...
          </h2>
          <p className="text-gray-600">Please wait.</p>
        </>
      )}

      {error && (
        <>
          <ExclamationCircleIcon />
          <h2 className="text-xl font-semibold text-red-600">
            Verification Failed
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Link
            href="/AdminLogin"
            className="inline-block mt-4 px-4 py-2 text-sm font-medium text-white bg-[#7741C3] rounded-md hover:bg-[#6a39a9]"
          >
            Go to Login
          </Link>
        </>
      )}

      {success && (
        <>
          <CheckCircleIcon />
          <h2 className="text-xl font-semibold text-green-600">
            Email Verified!
          </h2>
          <p className="text-gray-600 mt-2">{success}</p>
          <p className="text-gray-500 text-sm mt-4">
            Redirecting you to the login page...
          </p>
        </>
      )}
    </div>
  );
}

/**
 * This is the main page component.
 * We must wrap our content in <Suspense> to use useSearchParams().
 */
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <Suspense
            fallback={
              <div className="text-center">
                <LoadingSpinner />
                <h2 className="text-xl font-semibold text-gray-800">
                  Loading...
                </h2>
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}