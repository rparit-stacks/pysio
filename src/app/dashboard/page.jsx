"use client";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const u = await getCurrentUser();
			if (!u) {
				window.location.href = "/login";
				return;
			}
			setUser(u);
			setLoading(false);
		})();
	}, []);

	if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;

	const isTherapist = user?.role?.name === "physiotherapist";

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto px-4 py-10">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
				<div className="grid md:grid-cols-2 gap-6">
					<Link href="/my-bookings" className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition">
						<div className="text-xl font-semibold mb-1">My Bookings</div>
						<p className="text-gray-600">View upcoming and past appointments{isTherapist ? " (therapists see their schedule in 'Therapist Bookings')" : ""}.</p>
					</Link>
					<Link href="/dashboard/profile" className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition">
						<div className="text-xl font-semibold mb-1">Edit Profile</div>
						<p className="text-gray-600">Update your personal {isTherapist ? "and professional " : ""}details.</p>
					</Link>
					{isTherapist && (
						<Link href="/therapist-bookings" className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition">
							<div className="text-xl font-semibold mb-1">Therapist Bookings</div>
							<p className="text-gray-600">Manage, accept/reject, reschedule, and delete bookings.</p>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
} 