import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { doctorProfileApi } from "../../../doctor-profile/api/doctor-profile.api.js";
import { extractError } from "../../../../utils/extractError";
import { useApiQuery } from "../../../../hooks/useApiQuery";

const schema = z.object({
  doctorName: z.string().min(2, "Doctor name is required"),
  specialty: z.string().min(2, "Specialty is required"),
  heroHeadline: z.string().optional(),
  heroSubtext: z.string().optional(),
  bio: z.string().optional(),
  aboutText: z.string().optional(),
  qualifications: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  bookingEnabled: z.boolean().optional()
});

export default function AdminDoctorProfilePage() {
  const [photoUrl, setPhotoUrl] = useState("");
  const [appliedPhotoUrl, setAppliedPhotoUrl] = useState("");
  const [photoFeedback, setPhotoFeedback] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const fileInputRef = useRef(null);

  const { data: profileData, isLoading, isError, refetch } = useApiQuery({
    queryKey: ["doctor-profile-admin"],
    queryFn: doctorProfileApi.getDoctorProfile
  });

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const response = await doctorProfileApi.updateDoctorProfile(values);
      return response?.data ?? response;
    }
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      doctorName: "",
      specialty: "",
      heroHeadline: "",
      heroSubtext: "",
      bio: "",
      aboutText: "",
      qualifications: "",
      experienceYears: 0,
      clinicName: "",
      clinicAddress: "",
      contactPhone: "",
      contactEmail: "",
      bookingEnabled: true
    }
  });

  useEffect(() => {
    if (!profileData) return;

    form.reset({
      doctorName: profileData.doctorName || "",
      specialty: profileData.specialty || "",
      heroHeadline: profileData.heroHeadline || "",
      heroSubtext: profileData.heroSubtext || "",
      bio: profileData.bio || "",
      aboutText: profileData.aboutText || "",
      qualifications: (profileData.qualifications || []).join(", "),
      experienceYears: profileData.experienceYears || 0,
      clinicName: profileData.clinicName || "",
      clinicAddress: profileData.clinicAddress || "",
      contactPhone: profileData.contactPhone || "",
      contactEmail: profileData.contactEmail || "",
      bookingEnabled: profileData.bookingEnabled ?? true
    });

    setPhotoUrl(profileData.profilePhoto || "");
    setAppliedPhotoUrl(profileData.profilePhoto || "");
    setPhotoFeedback("");
  }, [form, profileData]);

  const handleApplyPhoto = () => {
    const next = photoUrl.trim();
    if (!next) {
      setPhotoFeedback("Please enter an image URL first.");
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(next);
      setAppliedPhotoUrl(next);
      setPhotoFeedback("Photo preview updated.");
    } catch {
      setPhotoFeedback("Please enter a valid URL.");
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoFeedback("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      if (!result) {
        setPhotoFeedback("Unable to read the selected file.");
        return;
      }
      setPhotoUrl(result);
      setAppliedPhotoUrl(result);
      setPhotoFeedback("Photo uploaded from your device.");
    };
    reader.onerror = () => {
      setPhotoFeedback("Unable to read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    setAppliedPhotoUrl("");
    setPhotoFeedback("Photo removed.");
  };

  const onSubmit = async (values) => {
    try {
      const qualificationsList = typeof values.qualifications === "string"
        ? values.qualifications.split(",").map((item) => item.trim()).filter(Boolean)
        : Array.isArray(values.qualifications)
          ? values.qualifications
          : [];

      await updateMutation.mutateAsync({
        ...values,
        photoUrl: appliedPhotoUrl || photoUrl || "",
        qualifications: qualificationsList
      });
      form.setError("root", {
        type: "success",
        message: "Settings updated successfully"
      });
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (error) {
      const parsedError = extractError(error, "Unable to save settings");
      form.setError("root", {
        type: "server",
        message: parsedError.message
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState label="Loading doctor profile..." />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load doctor profile"
        description="Please retry to load the latest profile details."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 bg-[#F7F9F7]/95 px-4 py-2 backdrop-blur-xl sm:px-6 lg:h-16 lg:flex-nowrap lg:px-10">
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <span className="flex items-center gap-2 font-headline text-xl font-bold tracking-tight text-[#1A6B4A] sm:text-2xl lg:text-[30px]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>medical_services</span>
            Health Care
          </span>
          <nav className="hidden gap-6 lg:flex">
            <span className="border-b-2 border-[#1A6B4A] pb-1 text-sm font-bold text-[#1A6B4A]">Settings</span>
            <Link to="/admin/patients" className="text-sm font-medium text-[#5A6872] transition-colors hover:text-[#7EC143]">
              Patient View
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.alert("No new notifications.")}
            aria-label="Notifications"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5A6872] transition-colors hover:text-[#1A6B4A] active:scale-95"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="ml-2 h-8 w-8 overflow-hidden rounded-full ring-2 ring-[#7EC143]/20">
            {appliedPhotoUrl ? (
              <img src={appliedPhotoUrl} alt="Doctor profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-[#ECEEEC]" />
            )}
          </div>
        </div>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-1 font-headline text-3xl font-extrabold tracking-tight text-[#005235] sm:text-[38px]">Settings & Configuration</h1>
              <p className="font-medium text-[#3F4943]">Manage your clinic configuration, public profile, and booking controls.</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ACF36E] px-4 py-2">
              <span className={`h-2 w-2 rounded-full ${form.watch("bookingEnabled") ? "bg-[#386B00] animate-pulse" : "bg-[#BA1A1A]"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A6F00]">
                {form.watch("bookingEnabled") ? "BOOKINGS ACTIVE" : "BOOKINGS PAUSED"}
              </span>
            </div>
          </div>

          {form.formState.errors.root?.message && (
            <div
              className={`mt-4 rounded-xl p-4 text-sm font-medium ${
                form.formState.errors.root.type === "success"
                  ? "border border-[#7EC143]/40 bg-[#ACF36E]/20 text-[#255200]"
                  : "border border-[#BA1A1A]/40 bg-[#FFDAD6]/40 text-[#93000A]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  {form.formState.errors.root.type === "success" ? "check_circle" : "error"}
                </span>
                <span>{form.formState.errors.root.message}</span>
              </div>
            </div>
          )}

          <div className="mb-10 mt-8 grid grid-cols-12 gap-5 sm:gap-6 lg:mb-32 lg:mt-10 lg:gap-8">
            <div className="col-span-12 space-y-6 lg:col-span-4">
              {/* Online Booking Toggle Card */}
              <div className="rounded-2xl border border-[#BFC9C0]/30 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#191C1B]">Accept Online Bookings</h4>
                    <p className="text-xs text-[#5A6872]">Allow patients to schedule appointments</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={!!form.watch("bookingEnabled")}
                      onChange={(e) => form.setValue("bookingEnabled", e.target.checked, { shouldDirty: true })}
                      className="peer sr-only"
                    />
                    <div className="peer h-7 w-12 rounded-full bg-[#ECEEEC] transition-colors peer-checked:bg-[#7EC143] after:absolute after:left-[2px] after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-[#ECEEEC] pt-3 text-xs text-[#3F4943]">
                  <span className={`h-2 w-2 rounded-full ${form.watch("bookingEnabled") ? "bg-[#386B00]" : "bg-[#BA1A1A]"}`} />
                  <span className="font-semibold">
                    {form.watch("bookingEnabled") ? "Online bookings enabled" : "Bookings temporarily disabled"}
                  </span>
                </div>
              </div>

              {/* Profile Card Preview */}
              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="mb-6 h-32 w-32 overflow-hidden rounded-2xl bg-[#ECEEEC] shadow-xl ring-4 ring-[#F2F4F2]">
                      {appliedPhotoUrl ? <img src={appliedPhotoUrl} alt="Doctor profile" className="h-full w-full object-cover" /> : null}
                    </div>
                    <button type="button" onClick={handleChooseFile} aria-label="Upload doctor photo" className="absolute right-2 top-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#005235] text-white shadow-lg transition-colors hover:bg-[#1A6B4A]">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </button>
                  </div>

                  <h2 className="mb-1 text-xl font-bold text-[#005235] sm:text-2xl">{form.watch("doctorName") || "Dr. Sarah Mitchell"}</h2>
                  <p className="mb-6 font-medium text-[#191C1B]">{form.watch("specialty") || "Specialist"}</p>

                  <div className="grid w-full grid-cols-2 gap-4 border-t border-[#F2F4F2] pt-6">
                    <div className="text-left">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6F7A72]">EXPERIENCE</p>
                      <p className="text-lg font-bold text-[#191C1B]">{form.watch("experienceYears") || 0} Years</p>
                    </div>
                    <div className="text-left">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6F7A72]">PATIENT RATING</p>
                      <div className="flex items-center gap-1">
                        <p className="text-lg font-bold text-[#191C1B]">4.9</p>
                        <span className="material-symbols-outlined text-sm text-[#386B00]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#005235] to-[#1A6B4A] p-5 text-white sm:p-6 lg:p-8">
                <div className="relative z-10">
                  <h3 className="mb-1 text-lg font-bold">Patient-Facing Preview</h3>
                  <p className="mb-8 text-xs text-emerald-100/60">This is how patients see your profile on the booking portal.</p>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                        <span className="material-symbols-outlined">event_available</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold">Booking Status</p>
                        <p className="text-[10px] text-emerald-100/70">{form.watch("bookingEnabled") ? "Available Online" : "Paused"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.alert("Preview only. Booking is available on patient pages.")}
                      className="min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-2 text-xs font-bold uppercase tracking-wider text-[#0D2000] transition-all hover:brightness-95"
                    >
                      BOOK CONSULTATION
                    </button>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
              </div>
            </div>

            <div className="col-span-12 space-y-8 lg:col-span-8">
              {/* Doctor & Clinic Information */}
              <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#005235]">badge</span>
                  <h3 className="text-xl font-bold text-[#005235]">Doctor & Clinic Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-doctor-name" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">FULL NAME</label>
                    <input
                      id="doctor-profile-doctor-name"
                      type="text"
                      {...form.register("doctorName")}
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-specialty" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">SPECIALTY</label>
                    <input
                      id="doctor-profile-specialty"
                      type="text"
                      {...form.register("specialty")}
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-clinic-name" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">HOSPITAL / CLINIC</label>
                    <input
                      id="doctor-profile-clinic-name"
                      type="text"
                      {...form.register("clinicName")}
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-clinic-address" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">CLINIC ADDRESS</label>
                    <input
                      id="doctor-profile-clinic-address"
                      type="text"
                      {...form.register("clinicAddress")}
                      placeholder="e.g. 123 Healthcare Blvd, Suite 400"
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-experience-years" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">YEARS OF EXPERIENCE</label>
                    <input
                      id="doctor-profile-experience-years"
                      type="number"
                      {...form.register("experienceYears")}
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-qualifications" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">QUALIFICATIONS (COMMA-SEPARATED)</label>
                    <input
                      id="doctor-profile-qualifications"
                      type="text"
                      {...form.register("qualifications")}
                      placeholder="e.g. MBBS, FCPS (Radiology), MD"
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-contact-phone" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">PHONE NUMBER</label>
                    <input
                      id="doctor-profile-contact-phone"
                      type="tel"
                      {...form.register("contactPhone")}
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-contact-email" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">EMAIL ADDRESS</label>
                    <input
                      id="doctor-profile-contact-email"
                      type="email"
                      {...form.register("contactEmail")}
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>
                </div>
              </section>

              {/* Homepage Hero Settings */}
              <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#005235]">view_headline</span>
                  <h3 className="text-xl font-bold text-[#005235]">Website Hero & Public Notice</h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-hero-headline" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">HERO HEADLINE</label>
                    <input
                      id="doctor-profile-hero-headline"
                      type="text"
                      {...form.register("heroHeadline")}
                      placeholder="e.g. Modern Healthcare & Compassionate Clinical Expertise"
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctor-profile-hero-subtext" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">HERO SUBTEXT</label>
                    <textarea
                      id="doctor-profile-hero-subtext"
                      rows={2}
                      {...form.register("heroSubtext")}
                      placeholder="e.g. Accurate diagnostics and personalized patient care with cutting-edge medical technology."
                      className="w-full rounded-[10px] border-none bg-[#F2F4F2] p-4 font-medium leading-relaxed text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>
                </div>
              </section>

              {/* Profile Photo */}
              <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#005235]">add_a_photo</span>
                  <h3 className="text-xl font-bold text-[#005235]">Profile Photo</h3>
                </div>

                <div className="space-y-4">
                  <input id="doctor-profile-photo-file" ref={fileInputRef} type="file" accept="image/*" aria-label="Upload doctor profile photo" className="hidden" onChange={handleFileUpload} />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <input
                      id="doctor-profile-photo-url"
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://image-url.com/dr-mitchell.jpg"
                      aria-label="Doctor profile photo URL"
                      className="h-[50px] w-full rounded-[10px] border-none bg-[#F2F4F2] px-4 font-medium text-[#191C1B] transition-all placeholder:text-[#6F7A72] focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                    <button type="button" onClick={handleApplyPhoto} className="min-h-[44px] w-full rounded-[10px] border-2 border-[#005235] bg-transparent px-6 font-bold text-[#005235] transition-all hover:bg-[#005235] hover:text-white sm:w-auto">
                      Apply
                    </button>
                    <button type="button" onClick={handleChooseFile} className="min-h-[44px] w-full rounded-[10px] border-2 border-[#005235] bg-transparent px-6 font-bold text-[#005235] transition-all hover:bg-[#005235] hover:text-white sm:w-auto">
                      Choose File
                    </button>
                    {appliedPhotoUrl && (
                      <button type="button" onClick={handleRemovePhoto} className="min-h-[44px] w-full rounded-[10px] border border-[#BA1A1A]/40 bg-transparent px-4 font-bold text-[#BA1A1A] transition-all hover:bg-red-50 sm:w-auto">
                        Remove
                      </button>
                    )}
                  </div>

                  {photoFeedback ? (
                    <p className={`text-xs ${photoFeedback.includes("updated") || photoFeedback.includes("uploaded") ? "text-[#386B00]" : photoFeedback.includes("removed") ? "text-[#5A6872]" : "text-[#BA1A1A]"}`}>
                      {photoFeedback}
                    </p>
                  ) : null}

                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border-2 border-[#005235] bg-[#F2F4F2]">
                      {appliedPhotoUrl ? <img src={appliedPhotoUrl} alt="Profile thumbnail" className="h-full w-full object-cover" /> : null}
                    </div>
                    <span className="text-xs text-[#5A6872]">
                      {appliedPhotoUrl ? "Active photo preview" : "No photo set (default avatar will display)"}
                    </span>
                  </div>
                </div>
              </section>

              {/* About & Bio */}
              <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#005235]">description</span>
                    <h3 className="text-lg font-bold text-[#005235] sm:text-xl">About & Clinical Bio</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6F7A72] sm:text-[11px]">
                    {form.watch("bio")?.length || 0} / 1000 characters
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="doctor-profile-bio" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">PRACTICE BIO</label>
                    <textarea
                      id="doctor-profile-bio"
                      rows={5}
                      {...form.register("bio")}
                      placeholder="Describe your clinical practice, philosophy, and special interests..."
                      className="w-full rounded-[10px] border-none bg-[#F2F4F2] p-4 font-medium leading-relaxed text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="doctor-profile-about-text" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#5A6872]">DETAILED ABOUT TEXT</label>
                    <textarea
                      id="doctor-profile-about-text"
                      rows={4}
                      {...form.register("aboutText")}
                      placeholder="Extended bio or clinical profile for the About section..."
                      className="w-full rounded-[10px] border-none bg-[#F2F4F2] p-4 font-medium leading-relaxed text-[#191C1B] transition-all focus:bg-white focus:ring-1 focus:ring-[#005235]"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#F8FAF8]/90 px-4 py-4 backdrop-blur-xl sm:px-6 md:fixed md:bottom-0 md:left-20 md:right-0 md:z-40 md:h-20 md:flex-row md:items-center md:justify-between md:rounded-none md:px-8 md:py-0 lg:left-[260px] lg:px-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#6F7A72]">schedule</span>
            <p className="text-sm font-medium text-[#6F7A72]">
              Last saved today at {lastSavedAt || "10:42 AM"}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4 md:w-auto">
              <button
                type="button"
              onClick={() => {
                if (!profileData) return;
                form.reset({
                  doctorName: profileData.doctorName || "",
                  specialty: profileData.specialty || "",
                  heroHeadline: profileData.heroHeadline || "",
                  heroSubtext: profileData.heroSubtext || "",
                  bio: profileData.bio || "",
                  aboutText: profileData.aboutText || "",
                  qualifications: (profileData.qualifications || []).join(", "),
                  experienceYears: profileData.experienceYears || 0,
                  clinicName: profileData.clinicName || "",
                  clinicAddress: profileData.clinicAddress || "",
                  contactPhone: profileData.contactPhone || "",
                  contactEmail: profileData.contactEmail || "",
                  bookingEnabled: profileData.bookingEnabled ?? true
                });
                setPhotoUrl(profileData.photoUrl || profileData.profilePhoto || "");
                setAppliedPhotoUrl(profileData.photoUrl || profileData.profilePhoto || "");
                setPhotoFeedback("");
                form.clearErrors("root");
              }}
               className="min-h-[44px] w-full rounded-[10px] border-2 border-[#005235] bg-transparent px-6 py-2.5 font-bold text-[#005235] transition-all hover:bg-[#005235] hover:text-white sm:w-auto"
             >
               Discard Changes
             </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
               className="min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-2.5 font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
             >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
