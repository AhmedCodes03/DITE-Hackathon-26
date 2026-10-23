import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { addBreadcrumb } from "../../../../lib/sentry";
import { authApi } from "../../api/auth.api.js";
import { useAuthStore } from "../../../../stores/authStore.js";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile.js";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { data: doctorProfile } = useDoctorProfile();
  const doctorName = doctorProfile?.doctorName || "Dr. Sarah Mitchell";

  const redirectPath = useMemo(() => searchParams.get("redirect") || "", [searchParams]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authApi.login(values);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        login({ token: accessToken, refreshToken, user });
        addBreadcrumb({
          category: "auth",
          level: "info",
          message: "login_success",
          data: { role: user.role }
        }).catch(() => {});

        let destination = "/patient/dashboard";
        if (user.role === "admin") {
          destination = "/admin/dashboard";
        } else if (user.role === "doctor") {
          destination = "/doctor/dashboard";
        }

        if (redirectPath) {
          const decodedRedirect = decodeURIComponent(redirectPath);
          if (decodedRedirect.startsWith("/admin") && user.role === "admin") {
            destination = decodedRedirect;
          } else if (decodedRedirect.startsWith("/patient") && user.role === "patient") {
            destination = decodedRedirect;
          } else if (decodedRedirect.startsWith("/doctor") && user.role === "doctor") {
            destination = decodedRedirect;
          }
        }

        navigate(destination, { replace: true });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      const rawMessage = err.response?.data?.message || err.message || "";
      const message =
        err.code === "ECONNABORTED" || rawMessage.toLowerCase().includes("timeout")
          ? "Connection timed out. The server took longer than expected. Please try again."
          : rawMessage || "Invalid email or password";
      setError(message);
      addBreadcrumb({
        category: "auth",
        level: "warning",
        message: "auth_failure",
        data: { action: "login", reason: message }
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

  const emailError = form.formState.errors.email;
  const passwordError = form.formState.errors.password;

  return (
    <main className="grid min-h-[calc(100vh-76px)] grid-cols-1 bg-[#F6F7F6] lg:min-h-screen lg:grid-cols-2">
      <section className="relative hidden min-h-[calc(100vh-76px)] overflow-hidden bg-gradient-to-br from-[#04673f] via-[#066941] to-[#1f7b53] px-10 py-10 xl:px-12 xl:py-12 lg:flex lg:min-h-screen lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7EC143]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-14%] top-12 h-96 w-96 rounded-full bg-white/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[8%] h-72 w-72 rounded-full bg-[#7EC143]/12 blur-3xl" />

        <div className="relative z-10">
          <div className="max-w-[560px]">
            <h1 className="font-headline mb-5 text-[58px] font-bold leading-[1.04] tracking-[-0.02em] text-white xl:text-[64px]">Welcome Back</h1>
            <p className="font-body text-[19px] leading-[1.5] text-emerald-100/85 xl:text-[20px]">
              Access your medical history, manage upcoming appointments, and connect with your care team in one secure place.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-7 flex items-center justify-center">
          <div className="relative w-full max-w-[600px]">
            <div className="rotate-[-3deg] overflow-hidden rounded-[42px] border-[6px] border-[#2f8564] shadow-[0_30px_80px_rgba(7,52,35,0.45)]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
                alt="Doctor portrait"
                className="h-[330px] w-full object-cover xl:h-[342px]"
              />
            </div>

            <div className="absolute -bottom-2 left-[57%] w-[314px] -translate-x-1/2 rotate-[6deg] rounded-[20px] bg-white px-5 py-4 shadow-2xl">
              <div className="mb-3 flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A6E85C] text-[#295f00]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                </div>
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-[#6F7A72]">Next Appointment</p>
                  <p className="font-headline text-[17px] font-bold text-[#005235]">{doctorName}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[13px] text-[#3F4943]">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">schedule</span>
                  Tomorrow, 10:30 AM
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">location_on</span>
                  Central Medical Wing
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="flex w-full items-center justify-center px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-14 lg:py-10 xl:px-16 xl:py-12">
        <div className="w-full max-w-md lg:max-w-[620px]">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <span className="material-symbols-outlined text-[20px] text-[#005235]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="font-headline text-xl font-bold text-[#005235]">Health Care</span>
          </div>

          <div className="mb-7">
            <h2 className="font-headline mb-3 text-[40px] font-bold leading-[1.12] tracking-[-0.02em] text-[#191C1B] xl:text-[42px]">Sign in to your account</h2>
            <p className="font-body text-[16px] text-[#3F4943]">Enter your details to access your patient dashboard.</p>
          </div>

          <div className="mb-5" />

          <form className="space-y-[22px]" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {error ? (
              <div className="rounded-xl border border-[#BA1A1A]/20 bg-[#FFDAD6]/30 px-4 py-3">
                <div className="flex items-start gap-2 text-[#BA1A1A]">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <p className="font-body text-xs font-medium">{error}</p>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="login-email" className="ml-1 mb-2 block text-sm font-bold uppercase tracking-wider text-[#3F4943]">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-xl text-[#6F7A72]">mail</span>
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="alex@example.com"
                  {...form.register("email")}
                  className="block h-[54px] w-full rounded-xl border-none bg-[#F2F4F2] py-3.5 pl-12 pr-4 text-sm text-[#191C1B] placeholder:text-[#6F7A72]/50 transition-all focus:bg-white focus:ring-2 focus:ring-[#005235]"
                />
              </div>
              {emailError ? (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#BA1A1A]">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {emailError.message}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                  <label htmlFor="login-password" className={`block text-sm font-bold uppercase tracking-wider ${passwordError ? "text-[#BA1A1A]" : "text-[#3F4943]"}`}>
                    Password
                  </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold text-[#005235] underline-offset-2 transition-colors hover:text-[#7EC143]"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span
                    className={`material-symbols-outlined text-xl ${passwordError ? "text-[#BA1A1A]" : "text-[#6F7A72]"}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...form.register("password")}
                   className={`block h-[54px] w-full rounded-xl py-3.5 pl-12 pr-12 text-sm text-[#191C1B] transition-all ${{
                     true: "bg-[#FFDAD6]/20 border border-[#BA1A1A]/20 focus:bg-white focus:ring-2 focus:ring-[#BA1A1A]",
                     false: "bg-[#F2F4F2] border-none focus:bg-white focus:ring-2 focus:ring-[#005235]"
                   }[String(Boolean(passwordError))]}`}
                 />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-[#6F7A72] transition-colors hover:text-[#191C1B]"
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>

              {passwordError ? (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#BA1A1A]">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {passwordError.message || "The password you entered is incorrect. Please try again."}
                </p>
              ) : null}
            </div>

            <label className="flex items-center gap-2 px-1 pt-0.5">
              <input id="login-remember-me" type="checkbox" aria-label="Remember me for 30 days" className="h-4 w-4 cursor-pointer rounded border-[#BFC9C0] text-[#005235] focus:ring-[#005235]" />
              <span className="font-body cursor-pointer text-sm font-medium text-[#3F4943]">Remember me for 30 days</span>
            </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="font-headline mt-1 min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-3.5 text-[15px] font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[#3F4943]">
              Don't have an account?
              <Link to="/register" className="ml-1 inline-block font-semibold text-[#005235] underline-offset-2 transition-colors hover:text-[#7EC143]">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
