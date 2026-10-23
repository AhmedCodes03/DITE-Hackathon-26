import { useState, useEffect } from "react";
import { doctorProfileApi } from "../../../doctor-profile/api/doctor-profile.api";
import { LoadingState } from "../../../../components/common/LoadingState";

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: "",
    title: "",
    specialty: "",
    bio: "",
    aboutText: "",
    clinicName: "",
    clinicAddress: "",
    contactPhone: "",
    contactEmail: "",
    consultationFee: 2000,
    consultationDurationMinutes: 30,
    isAvailable: true
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await doctorProfileApi.getMyProfile();
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          setFormData({
            doctorName: d.doctorName || "",
            title: d.title || "",
            specialty: d.specialty || "",
            bio: d.bio || "",
            aboutText: d.aboutText || "",
            clinicName: d.clinicName || "",
            clinicAddress: d.clinicAddress || "",
            contactPhone: d.contactPhone || "",
            contactEmail: d.contactEmail || "",
            consultationFee: d.consultationFee || 2000,
            consultationDurationMinutes: d.consultationDurationMinutes || 30,
            isAvailable: d.isAvailable !== false
          });
        }
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotice(null);
      await doctorProfileApi.updateMyProfile(formData);
      setNotice({ type: "success", text: "Doctor profile updated successfully!" });
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your profile..." />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#073623]">
          Provider Profile & Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">
          Update your public profile, practice address, consultation fees, and patient booking status.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Availability Toggle */}
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4">
          <div>
            <h3 className="font-bold text-sm text-[#073623]">Accepting New Patients</h3>
            <p className="text-xs text-gray-600">When enabled, patients can browse and book appointments with you.</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#005235] peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Doctor Name</label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Specialty</label>
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Title / Tagline</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Senior Consultant Cardiologist"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Clinic / Hospital Name</label>
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Clinic Address</label>
          <input
            type="text"
            name="clinicAddress"
            placeholder="e.g. Suite 402, Medical City, Gulberg, Lahore"
            value={formData.clinicAddress}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
          />
        </div>

        {/* Contact & Fees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Consultation Fee (PKR)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
            />
          </div>
        </div>

        {/* Bio & About */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Short Bio</label>
          <textarea
            rows="3"
            name="bio"
            placeholder="Brief introduction for patients..."
            value={formData.bio}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Detailed About & Clinical Expertise</label>
          <textarea
            rows="4"
            name="aboutText"
            placeholder="Share your experience, specialties, procedures, and philosophy of care..."
            value={formData.aboutText}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#005235] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#004028] disabled:opacity-50 shadow"
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
