"use client";

import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  // Get query params from window.location
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
    setEmail(params.get("email") || "");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setStatus("");

    const password = e.target.password.value;

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
      });
      const data = await res.json();
      setStatus(data.message);

      if (data.success) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Enter new password"
            className="w-full border rounded p-2 mb-4"
            required
            disabled={processing}
          />
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded text-white ${
              processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={processing}
          >
            {processing ? "Processing..." : "Reset Password"}
          </button>
        </form>
        {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
      </div>
    </div>
  );
}
