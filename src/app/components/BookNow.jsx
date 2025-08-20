
"use client"

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/lib/actions/stripe";

export default function TherapistCard({ therapist, userId }) {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleBook() {
    setLoading(true);
    startTransition(async () => {
      const session = await createCheckoutSession({
        therapistId: therapist.id,
        userId,
        amount: therapist.price * 100,
        currency: "usd",
        therapistName: therapist.name,
      });
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert("Failed to start payment.");
        setLoading(false);
      }
    });
  }

  return (
    <button
      onClick={handleBook}
      disabled={loading || isPending}
      className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded"
    >
      {loading || isPending ? "Processing..." : "Book Appointment"}
    </button>
  );
}
