import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { patientApi } from "../../../patients/api/patients.api";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile";
import { extractError } from "../../../../utils/extractError";
import { useApiQuery } from "../../../../hooks/useApiQuery";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(3, "Phone is required"),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  address: z.string().optional(),
  medicalNotes: z.string().optional()
});

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMemberSince(value) {
  if (!value) return "Member since October 2022";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Member since October 2022";
  return `Member since ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

export default function PatientProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const { data: profileData, isLoading, isError, refetch } = useApiQuery({
    queryKey: ["patient-profile"],
    queryFn: patientApi.getMyProfile,
    select: (payload) => payload?.data ?? payload
  });

  const { data: doctorProfile } = useDoctorProfile();
  const doctorName = doctorProfile?.doctorName || "Dr. Sarah Mitchell";

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      return patientApi.updateMyProfile(values);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["patient-profile"], data?.data ?? data);
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      return patientApi.uploadProfilePhoto(file);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["patient-profile"], (prev) => ({
        ...(prev || {}),
        ...((data?.data ?? data) || {})
      }));
      form.setError("root", { type: "success", message: "Profile photo updated successfully." });
    },
    onError: (error) => {
      const parsedError = extractError(error, "Unable to upload photo right now.");
      form.setError("root", {
        type: "server",
        message: parsedError.message
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      address: "",
      medicalNotes: ""
    }
  });

  useEffect(() => {
    if (!profileData) return;
    form.reset({
      fullName: profileData.fullName || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      gender: profileData.gender || "",
      dateOfBirth: toDateInput(profileData.dateOfBirth),
      emergencyContactName: profileData.emergencyContactName || "",
      emergencyContactPhone: profileData.emergencyContactPhone || "",
      address: profileData.address || "",
      medicalNotes: profileData.medicalNotes || ""
    });
  }, [form, profileData]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        gender: values.gender || undefined,
        dateOfBirth: values.dateOfBirth ? new Date(`${values.dateOfBirth}T00:00:00.000Z`).toISOString() : undefined,
        emergencyContactName: values.emergencyContactName || undefined,
        emergencyContactPhone: values.emergencyContactPhone || undefined,
        address: values.address || undefined,
        medicalNotes: values.medicalNotes || undefined
      };

      await updateMutation.mutateAsync(payload);
      form.setError("root", { type: "success", message: "Profile updated successfully." });
    } catch (error) {
      const parsedError = extractError(error, "Unable to save your profile right now.");
      form.setError("root", {
        type: "server",
        message: parsedError.message
      });
    }
  };

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      form.setError("root", { type: "server", message: "Please choose an image file." });
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    await uploadPhotoMutation.mutateAsync(file);
    event.target.value = "";
  };

  const fullName = form.watch("fullName") || "Patient";

  if (isLoading) return <LoadingState label="Loading profile..." className="py-8" />;

  if (isError) {
    return (
      <ErrorState
        title="Unable to load profile"
        description="Please retry to load your profile information."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-10 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[#1A6B4A] sm:text-4xl">My Profile</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ACF36E] px-3 py-1.5">
            <span className="material-symbols-outlined text-[14px] text-[#285000]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#285000]">Profile Verified</span>
          </div>
        </div>

        <button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
          className="min-h-[44px] rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-3.5 font-headline text-sm font-bold text-[#0D2000] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </header>

      <section className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:gap-7">
        <div className="relative">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl sm:h-32 sm:w-32 md:h-40 md:w-40">
            <img
              src={photoPreview || profileData?.profileImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={openPhotoPicker}
            disabled={uploadPhotoMutation.isPending}
            className="absolute bottom-1 right-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#005235] text-white shadow-lg transition-transform hover:scale-105"
            aria-label="Upload profile photo"
          >
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
          <input
            id="patient-profile-photo-file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="Select profile photo"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-headline text-2xl font-bold text-[#191C1B] sm:text-[34px]">{fullName}</h2>
          <p className="flex items-center gap-2 font-medium text-[#3F4943]">
            <span className="material-symbols-outlined text-sm">medical_information</span>
            Patient of {doctorName}
          </p>
          <p className="text-sm text-[#6F7A72]">{formatMemberSince(profileData?.createdAt)}</p>
        </div>
      </section>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-10">
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgba(13,31,26,0.04)] sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#005235]">account_circle</span>
                <h3 className="font-headline text-2xl font-bold text-[#191C1B] sm:text-[34px]">Personal Details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="patient-profile-full-name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A6872]">Full Name</label>
                <input
                  id="patient-profile-full-name"
                  {...form.register("fullName")}
                  className="w-full rounded-[14px] border-none bg-[#ECEEEC] px-5 py-4 text-base font-medium text-[#191C1B] focus:ring-1 focus:ring-[#005235]"
                />
              </div>

              <div>
                <label htmlFor="patient-profile-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A6872]">Email Address</label>
                <div className="relative">
                  <input
                    id="patient-profile-email"
                    {...form.register("email")}
                    readOnly
                    className="w-full rounded-[14px] border-none bg-[#E1E3E1] px-5 py-4 pr-12 text-base text-[#3F4943] focus:ring-0"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#6F7A72]">lock</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A6872]">Gender <span className="text-[#BA1A1A]">*</span></label>
                  <select
                    {...form.register("gender")}
                    className="w-full rounded-[14px] border-none bg-[#ECEEEC] px-5 py-4 text-base font-medium text-[#191C1B] focus:ring-1 focus:ring-[#005235]"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="patient-profile-date-of-birth" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A6872]">Date of Birth <span className="text-[#BA1A1A]">*</span></label>
                  <input
                    id="patient-profile-date-of-birth"
                    type="date"
                    {...form.register("dateOfBirth")}
                    className="w-full rounded-[14px] border-none bg-[#ECEEEC] px-5 py-4 text-base font-medium text-[#191C1B] focus:ring-1 focus:ring-[#005235]"
                  />
                </div>
              </div>
            </div>
          </article>

          <div className="space-y-8">
            <article className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgba(13,31,26,0.04)] sm:p-6 lg:p-8">
              <div className="mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#005235]">contact_phone</span>
                <h3 className="font-headline text-2xl font-bold text-[#191C1B] sm:text-[34px]">Communication</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="patient-profile-phone" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A6872]">Phone Number</label>
                  <input
                    id="patient-profile-phone"
                    {...form.register("phone")}
                    className="w-full rounded-[14px] border-none bg-[#ECEEEC] px-5 py-4 text-base font-medium text-[#191C1B] focus:ring-1 focus:ring-[#005235]"
                  />
                </div>

                <div>
                  <label htmlFor="patient-profile-emergency-contact-name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A6872]">Emergency Contact</label>
                  <div className="flex flex-col gap-2 rounded-[14px] bg-[#ECEEEC] p-2 pr-2 sm:flex-row sm:items-center sm:gap-3 sm:pr-4">
                    <input
                      id="patient-profile-emergency-contact-name"
                      {...form.register("emergencyContactName")}
                      className="w-full border-none bg-transparent px-3 py-2 text-base font-medium text-[#191C1B] focus:ring-0"
                    />
                    <span className="inline-flex w-fit rounded-full bg-[#005235]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#005235]">Spouse</span>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </section>

        {form.formState.errors.root?.message ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              form.formState.errors.root.type === "success"
                ? "border border-[#ACF36E] bg-[#F2FBE8] text-[#285000]"
                : "border border-[#FFDAD6] bg-[#FFF4F2] text-[#93000A]"
            }`}
          >
            {form.formState.errors.root.message}
          </div>
        ) : null}
      </form>
    </div>
  );
}
