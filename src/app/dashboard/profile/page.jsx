"use client";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserWithProfile, updateUserProfile, updateTherapistProfile } from "@/lib/actions/profile";
import DashboardLayout from "../../components/DashboardLayout";

export default function ProfilePage() {
	const [user, setUser] = useState(null);
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({});
	const [message, setMessage] = useState(null);

	useEffect(() => {
		(async () => {
			const u = await getCurrentUser();
			if (!u) {
				window.location.href = "/login";
				return;
			}
			setUser(u);
			const res = await getCurrentUserWithProfile(u.id);
			if (res.success) {
				setProfile(res.data);
				setForm({
					firstName: res.data.firstName || "",
					lastName: res.data.lastName || "",
					phone: res.data.phone || "",
					dateOfBirth: res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().slice(0,10) : "",
					gender: res.data.gender || "",
					kycDocumentUrl: res.data.kycDocumentUrl || "",
					coruRegistration: res.data.physiotherapistProfile?.coruRegistration || "",
					qualification: res.data.physiotherapistProfile?.qualification || "",
					yearsExperience: res.data.physiotherapistProfile?.yearsExperience ?? "",
					bio: res.data.physiotherapistProfile?.bio || "",
					hourlyRate: res.data.physiotherapistProfile?.hourlyRate ?? "",
					profileImageUrl: res.data.physiotherapistProfile?.profileImageUrl || "",
					therapistKycDocumentUrl: res.data.physiotherapistProfile?.kycDocumentUrl || "",
				});
			}
			setLoading(false);
		})();
	}, []);

	const isTherapist = profile?.role?.name === "physiotherapist";

	const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

	const onSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setMessage(null);
		try {
			const base = {
				firstName: form.firstName,
				lastName: form.lastName,
				phone: form.phone,
				dateOfBirth: form.dateOfBirth,
				gender: form.gender || null,
				kycDocumentUrl: form.kycDocumentUrl || null,
			};
			const uRes = await updateUserProfile(user.id, base);
			if (!uRes.success) throw new Error(uRes.error || 'Failed to update user');
			if (isTherapist) {
				const tRes = await updateTherapistProfile(user.id, {
					firstName: form.firstName,
					lastName: form.lastName,
					phone: form.phone,
					coruRegistration: form.coruRegistration,
					qualification: form.qualification,
					yearsExperience: form.yearsExperience !== "" ? Number(form.yearsExperience) : undefined,
					bio: form.bio,
					hourlyRate: form.hourlyRate !== "" ? Number(form.hourlyRate) : undefined,
					profileImageUrl: form.profileImageUrl,
					kycDocumentUrl: form.therapistKycDocumentUrl || null,
				});
				if (!tRes.success) throw new Error(tRes.error || 'Failed to update therapist');
			}
			setMessage('Saved successfully');
		} catch (err) {
			setMessage(err.message || 'Failed to save');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading profile...</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="p-6">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
				<form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
					<div className="grid md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm text-gray-700 mb-1">First Name</label>
							<input name="firstName" value={form.firstName||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-1">Last Name</label>
							<input name="lastName" value={form.lastName||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-1">Phone</label>
							<input name="phone" value={form.phone||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
							<input type="date" name="dateOfBirth" value={form.dateOfBirth||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-1">Gender</label>
							<select name="gender" value={form.gender||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2">
								<option value="">Select</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
								<option value="Other">Other</option>
								<option value="PreferNotToSay">Prefer not to say</option>
							</select>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm text-gray-700 mb-1">KYC Document URL (User)</label>
							<input name="kycDocumentUrl" value={form.kycDocumentUrl||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" placeholder="https://..." />
							<p className="text-xs text-gray-500 mt-1">Upload your ID/utility bill to storage and paste the public link.</p>
						</div>
					</div>

					{isTherapist && (
						<div className="space-y-4 pt-4 border-t">
							<h2 className="text-lg font-semibold">Professional Details</h2>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-gray-700 mb-1">CORU Registration</label>
									<input name="coruRegistration" value={form.coruRegistration||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
								</div>
								<div>
									<label className="block text-sm text-gray-700 mb-1">Qualification</label>
									<input name="qualification" value={form.qualification||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
								</div>
								<div>
									<label className="block text-sm text-gray-700 mb-1">Years Experience</label>
									<input name="yearsExperience" type="number" value={form.yearsExperience||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
								</div>
								<div>
									<label className="block text-sm text-gray-700 mb-1">Hourly Rate (€)</label>
									<input name="hourlyRate" type="number" step="0.01" value={form.hourlyRate||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
								</div>
								<div className="md:col-span-2">
									<label className="block text-sm text-gray-700 mb-1">Bio </label>
									<textarea name="bio" value={form.bio||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" rows={4} />
								</div>
								<div className="md:col-span-2">
									<label className="block text-sm text-gray-700 mb-1">Profile Image URL</label>
									<input name="profileImageUrl" value={form.profileImageUrl||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" />
									<p className="text-xs text-gray-500 mt-1">Upload the image to your storage and paste the public URL here.</p>
								</div>
								<div className="md:col-span-2">
									<label className="block text-sm text-gray-700 mb-1">KYC Document URL (Therapist)</label>
									<input name="therapistKycDocumentUrl" value={form.therapistKycDocumentUrl||""} onChange={onChange} className="w-full text-black border rounded px-3 py-2" placeholder="https://..." />
									<p className="text-xs text-gray-500 mt-1">Upload your CORU certificate or ID and paste the public link.</p>
								</div>
							</div>

						</div>
					)}

					<div className="pt-2">
						<button disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
						{message && <span className="ml-3 text-sm text-gray-700">{message}</span>}
					</div>
				</form>
				</div>
			</div>
		</DashboardLayout>
	);
} 