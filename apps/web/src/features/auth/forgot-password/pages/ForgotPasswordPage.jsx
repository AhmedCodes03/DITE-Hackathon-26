import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Seo } from "../../../../components/common/Seo";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmittedEmail(values.email);
  });

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#F8FAF8] px-6 py-10 sm:py-12">
      <Seo
        title="Forgot Password | Health Care"
        description="Reset your Health Care account password securely."
        path="/forgot-password"
      />

      <section className="w-full max-w-lg rounded-3xl border border-[#BFC9C0]/35 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[#005235]">Reset password</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#3F4943]">
            Enter your account email and we will send password reset instructions.
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="forgot-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#3F4943]">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="material-symbols-outlined text-xl text-[#6F7A72]">mail</span>
              </div>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...form.register("email")}
                className="block w-full rounded-xl border-none bg-[#F2F4F2] py-4 pl-12 pr-4 text-sm text-[#191C1B] placeholder:text-[#6F7A72]/50 transition-all focus:bg-white focus:ring-2 focus:ring-[#005235]"
              />
            </div>
            {form.formState.errors.email ? (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#BA1A1A]">
                <span className="material-symbols-outlined text-sm">error</span>
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="font-headline min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-4 text-base font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center text-sm text-[#3F4943]">
            Remember your password?
            <Link to="/login" className="ml-1 font-semibold text-[#005235] underline-offset-2 transition-colors hover:text-[#7EC143]">
              Back to Sign In
            </Link>
          </div>
        </form>

        {submittedEmail ? (
          <div className="mt-6 rounded-xl border border-[#ADE0D0] bg-[#D6EEE7] px-4 py-3 text-sm text-[#1A7A62]">
            Reset instructions sent to {submittedEmail}.
          </div>
        ) : null}
      </section>
    </main>
  );
}
