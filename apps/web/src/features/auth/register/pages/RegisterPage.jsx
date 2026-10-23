import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { addBreadcrumb } from "../../../../lib/sentry";
import { authApi } from "../../api/auth.api.js";
import { useAuthStore } from "../../../../stores/authStore.js";

const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Consultant Radiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Psychiatrist",
  "ENT Specialist"
];

const patientRegisterSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

const doctorRegisterSchema = z
  .object({
    fullName: z.string().min(2, "Doctor name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    specialty: z.string().min(2, "Specialty is required"),
    clinicName: z.string().min(2, "Clinic / Hospital name is required"),
    experienceYears: z.coerce.number().min(0, "Experience years must be positive"),
    consultationFee: z.coerce.number().min(0, "Fee must be non-negative").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [role, setRole] = useState("patient"); // "patient" | "doctor"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [doctorSuccess, setDoctorSuccess] = useState(false);

  const currentSchema = role === "doctor" ? doctorRegisterSchema : patientRegisterSchema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      specialty: "General Physician",
      clinicName: "",
      experienceYears: 1,
      consultationFee: 2000,
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = { ...values };
      delete payload.confirmPassword;

      if (role === "doctor") {
        const response = await authApi.registerDoctor(payload);
        if (response.success) {
          setDoctorSuccess(true);
          addBreadcrumb({
            category: "auth",
            level: "info",
            message: "doctor_registration_submitted"
          }).catch(() => {});
        } else {
          throw new Error(response.message || "Doctor registration failed");
        }
      } else {
        const response = await authApi.register(payload);
        if (response.success && response.data) {
          const { user, accessToken, refreshToken } = response.data;
          login({ token: accessToken, refreshToken, user });
          addBreadcrumb({
            category: "auth",
            level: "info",
            message: "registration_success",
            data: { role: user.role }
          }).catch(() => {});
          navigate("/patient/dashboard", { replace: true });
        } else {
          throw new Error(response.message || "Registration failed");
        }
      }
    } catch (err) {
      const rawMessage = err.response?.data?.message || err.message || "";
      const message =
        err.code === "ECONNABORTED" || rawMessage.toLowerCase().includes("timeout")
          ? "Connection timed out. The server took longer than expected. Please try again."
          : rawMessage || "Registration failed. Please try again.";
      setError(message);
      addBreadcrumb({
        category: "auth",
        level: "warning",
        message: "auth_failure",
        data: { action: "register", reason: message }
      }).catch(() => {});

      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((item) => {
          form.setError(item.field, { message: item.message });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <main className="flex min-h-[calc(100vh-76px)] lg:min-h-screen">
      <section className="verdant-gradient relative hidden min-h-[calc(100vh-76px)] overflow-hidden p-10 xl:p-12 lg:flex lg:min-h-screen lg:w-1/2 lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#7EC143]/15 blur-3xl" />

        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm text-[#A6E85C]">verified</span>
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-white">Join Healthcare Network</span>
          </div>

          <h1 className="font-headline mb-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
            {role === "doctor" ? "Join as a Healthcare Provider" : "Your Health Journey Begins Here"}
          </h1>

          <p className="font-body text-base text-white/80 xl:text-lg">
            {role === "doctor"
              ? "Register your practice, set your consultation hours, and connect with thousands of patients seeking quality care."
              : "Register in under two minutes to schedule consultations with premier specialists, view appointment records, and receive timely care."}
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <span className="material-symbols-outlined text-[#A6E85C]">check_circle</span>
              <span className="font-body text-sm font-medium">
                {role === "doctor" ? "Manage your schedule & slots dynamically" : "Select from verified, approved doctors"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="material-symbols-outlined text-[#A6E85C]">check_circle</span>
              <span className="font-body text-sm font-medium">Instant notifications & status updates</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="material-symbols-outlined text-[#A6E85C]">check_circle</span>
              <span className="font-body text-sm font-medium">Secure patient and clinical data privacy</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md py-6">
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <span className="material-symbols-outlined text-[20px] text-[#005235]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="font-headline text-xl font-bold text-[#005235]">Health Care</span>
          </div>

          {doctorSuccess ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline text-2xl font-bold text-gray-900">Registration Submitted!</h2>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Thank you, <strong>{form.getValues("fullName")}</strong>. Your doctor application has been received and is currently <strong>pending admin approval</strong>.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Once an administrator approves your profile, patients will be able to book appointments with you. You can log in with your email and password now to preview your dashboard.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full rounded-xl bg-[#005235] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#004028]"
                >
                  Proceed to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-headline mb-2 text-2xl font-bold text-[#191C1B] sm:text-3xl">Create your account</h2>
                <p className="font-body text-sm text-[#3F4943]">Choose your role to get started.</p>

                {/* Role Switcher */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setRole("patient"); form.reset(); }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      role === "patient"
                        ? "bg-white text-[#005235] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    I am a Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole("doctor"); form.reset(); }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      role === "doctor"
                        ? "bg-[#005235] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                    I am a Doctor
                  </button>
                </div>
              </div>

              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                {error && (
                  <div className="rounded-xl border border-[#BA1A1A]/20 bg-[#FFDAD6]/30 px-4 py-3">
                    <div className="flex items-start gap-2 text-[#BA1A1A]">
                      <span className="material-symbols-outlined text-sm">error</span>
                      <p className="font-body text-xs font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label htmlFor="register-fullName" className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                    {role === "doctor" ? "Doctor Full Name" : "Full Name"}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <span className="material-symbols-outlined text-lg text-[#6F7A72]">person</span>
                    </div>
                    <input
                      id="register-fullName"
                      type="text"
                      placeholder={role === "doctor" ? "Dr. Jane Smith" : "John Smith"}
                      {...form.register("fullName")}
                      className={`block w-full rounded-xl py-3 pl-11 pr-3 text-sm text-[#191C1B] ${
                        errors.fullName
                          ? "border border-[#BA1A1A]/20 bg-[#FFDAD6]/20 focus:ring-2 focus:ring-[#BA1A1A]"
                          : "border-none bg-[#F2F4F2] focus:ring-2 focus:ring-[#005235]"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-[#BA1A1A]">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Doctor-Specific Fields */}
                {role === "doctor" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                          Specialty
                        </label>
                        <select
                          {...form.register("specialty")}
                          className="block w-full rounded-xl py-3 px-3 text-sm bg-[#F2F4F2] text-[#191C1B] border-none focus:ring-2 focus:ring-[#005235]"
                        >
                          {SPECIALTIES.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                        {errors.specialty && (
                          <p className="mt-1 text-xs text-[#BA1A1A]">{errors.specialty.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          {...form.register("experienceYears")}
                          className="block w-full rounded-xl py-3 px-3 text-sm bg-[#F2F4F2] text-[#191C1B] border-none focus:ring-2 focus:ring-[#005235]"
                        />
                        {errors.experienceYears && (
                          <p className="mt-1 text-xs text-[#BA1A1A]">{errors.experienceYears.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                          Clinic / Hospital
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. City Care Hospital"
                          {...form.register("clinicName")}
                          className="block w-full rounded-xl py-3 px-3 text-sm bg-[#F2F4F2] text-[#191C1B] border-none focus:ring-2 focus:ring-[#005235]"
                        />
                        {errors.clinicName && (
                          <p className="mt-1 text-xs text-[#BA1A1A]">{errors.clinicName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                          Fee (PKR)
                        </label>
                        <input
                          type="number"
                          placeholder="2000"
                          {...form.register("consultationFee")}
                          className="block w-full rounded-xl py-3 px-3 text-sm bg-[#F2F4F2] text-[#191C1B] border-none focus:ring-2 focus:ring-[#005235]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="register-email" className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <span className="material-symbols-outlined text-lg text-[#6F7A72]">mail</span>
                    </div>
                    <input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      {...form.register("email")}
                      className={`block w-full rounded-xl py-3 pl-11 pr-3 text-sm text-[#191C1B] ${
                        errors.email
                          ? "border border-[#BA1A1A]/20 bg-[#FFDAD6]/20 focus:ring-2 focus:ring-[#BA1A1A]"
                          : "border-none bg-[#F2F4F2] focus:ring-2 focus:ring-[#005235]"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-[#BA1A1A]">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="register-phone" className="ml-1 mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <span className="material-symbols-outlined text-lg text-[#6F7A72]">call</span>
                    </div>
                    <input
                      id="register-phone"
                      type="tel"
                      placeholder="03001234567"
                      {...form.register("phone")}
                      className={`block w-full rounded-xl py-3 pl-11 pr-3 text-sm text-[#191C1B] ${
                        errors.phone
                          ? "border border-[#BA1A1A]/20 bg-[#FFDAD6]/20 focus:ring-2 focus:ring-[#BA1A1A]"
                          : "border-none bg-[#F2F4F2] focus:ring-2 focus:ring-[#005235]"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[#BA1A1A]">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-xs font-semibold text-[#005235] hover:text-[#7EC143]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <span className="material-symbols-outlined text-lg text-[#6F7A72]">lock</span>
                    </div>
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      {...form.register("password")}
                      className={`block w-full rounded-xl py-3 pl-11 pr-3 text-sm text-[#191C1B] ${
                        errors.password
                          ? "border border-[#BA1A1A]/20 bg-[#FFDAD6]/20 focus:ring-2 focus:ring-[#BA1A1A]"
                          : "border-none bg-[#F2F4F2] focus:ring-2 focus:ring-[#005235]"
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-[#BA1A1A]">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <label htmlFor="register-confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#3F4943]">
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="text-xs font-semibold text-[#005235] hover:text-[#7EC143]"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <span className="material-symbols-outlined text-lg text-[#6F7A72]">lock</span>
                    </div>
                    <input
                      id="register-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      {...form.register("confirmPassword")}
                      className={`block w-full rounded-xl py-3 pl-11 pr-3 text-sm text-[#191C1B] ${
                        errors.confirmPassword
                          ? "border border-[#BA1A1A]/20 bg-[#FFDAD6]/20 focus:ring-2 focus:ring-[#BA1A1A]"
                          : "border-none bg-[#F2F4F2] focus:ring-2 focus:ring-[#005235]"
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#BA1A1A]">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {role === "doctor" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-600 mt-0.5">info</span>
                    <span>Doctor registrations require administrator approval before patient appointments can be accepted.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-headline mt-2 min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-3.5 text-sm font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {role === "doctor" ? "Submitting Application..." : "Creating Account..."}
                    </span>
                  ) : (
                    role === "doctor" ? "Register as Doctor" : "Create Account"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="font-body text-sm text-[#3F4943]">
                  Already have an account?{" "}
                  <Link to="/login" className="ml-1 font-semibold text-[#005235] underline-offset-2 transition-colors hover:text-[#7EC143]">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
