import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Seo } from "../../../../components/common/Seo";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile";
import { usePublicReveal } from "../../animations/usePublicReveal";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(8, "Message must be at least 8 characters")
});

function ContactInfoCard({ icon, title, value }) {
  return (
    <div className="rounded-xl bg-white p-6 transition-all duration-300 hover:shadow-sm">
      <div className="flex items-start gap-5">
        <div className="rounded-lg bg-[#F2F4F2] p-3 text-[#1A6B4A]">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h3 className="mb-1 font-headline text-base font-bold text-[#191C1B]">{title}</h3>
          <p className="text-sm text-[#3F4943]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  usePublicReveal();

  const { data: profile } = useDoctorProfile();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const onSubmit = form.handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    form.reset();
  });

  return (
    <>
      <Seo
        title="Contact - Health Care"
        description="Reach out for appointment questions and clinic information."
        path="/contact"
      />

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-8" data-reveal>
        <div className="mb-4 flex items-baseline gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#386B00]">Contact</span>
          <div className="h-px flex-1 bg-[#BFC9C0]/30" />
        </div>

        <h1 className="font-headline text-[56px] font-extrabold leading-tight tracking-[-0.02em] text-[#005235]">
          Get in <span className="text-[#386B00]">Touch</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3F4943]">
          Reach out for appointment questions or clinic information. Our team is here to provide the precision care you deserve.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-8" data-reveal>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="grid grid-cols-1 gap-4">
              <ContactInfoCard icon="location_on" title="Clinic Address" value={profile?.clinicAddress || "Hyderabad, Pakistan"} />
              <ContactInfoCard icon="call" title="Phone" value={profile?.contactPhone || "03xx-xxxxxx"} />
              <ContactInfoCard icon="mail" title="Email" value={profile?.contactEmail || "info@drxyz.com"} />
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#E6E9E7]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFIMjLFicDhHvmCyWLDtJj3kh0XovuGBjCk4b-b9uFoJdPT9qDZ_8TTbWm85HksXcg1o3KohfI0icDYc3yFT1pprqoiVDsC0A68eb_VM9YtRHWn4GAk7JvpAB4Zt39ikXKHScW_MtklyCkHtmPClgYuxFPevwlePCeYAJVp--VE5JJF1E3NlRICEuh_MQQZoX5VS4UkB_KN09Kl24zn2UawhT6S1o-nE_8bJEDUA3Y0jHdnWxz4Q1Rz1J92JVg8J1VtOuAGQhiIck"
                alt="Hyderabad city map"
                className="h-full w-full object-cover grayscale opacity-80"
              />
              <div className="absolute inset-0 bg-[#005235]/10 mix-blend-multiply" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Hyderabad,+Pakistan"
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-sm text-[#005235]">explore</span>
                <span className="text-xs font-bold tracking-tight text-[#005235]">VIEW CLINIC LOCATION</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F2F4F2] p-8 md:p-10 lg:col-span-7 lg:p-12">
            <h2 className="mb-8 font-headline text-[28px] font-bold text-[#005235]">Send a Message</h2>
            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="block font-label text-[11px] font-medium uppercase tracking-[0.05em] text-[#6F7A72]"
                  >
                    Name*
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-12 w-full rounded-[10px] border-none bg-white px-4 text-sm text-[#191C1B] placeholder:text-[#6F7A72] transition-all focus:outline-none focus:ring-1 focus:ring-[#1A6B4A]"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-[#BA1A1A]">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="block font-label text-[11px] font-medium uppercase tracking-[0.05em] text-[#6F7A72]"
                  >
                    Email*
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="Email address"
                    className="h-12 w-full rounded-[10px] border-none bg-white px-4 text-sm text-[#191C1B] placeholder:text-[#6F7A72] transition-all focus:outline-none focus:ring-1 focus:ring-[#1A6B4A]"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-[#BA1A1A]">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-phone"
                  className="block font-label text-[11px] font-medium uppercase tracking-[0.05em] text-[#6F7A72]"
                >
                  Phone (optional)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="Primary contact number"
                  className="h-12 w-full rounded-[10px] border-none bg-white px-4 text-sm text-[#191C1B] placeholder:text-[#6F7A72] transition-all focus:outline-none focus:ring-1 focus:ring-[#1A6B4A]"
                  {...form.register("phone")}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="block font-label text-[11px] font-medium uppercase tracking-[0.05em] text-[#6F7A72]"
                >
                  Message*
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="How can we help you today?"
                  className="w-full resize-none rounded-[10px] border-none bg-white p-4 text-sm text-[#191C1B] placeholder:text-[#6F7A72] transition-all focus:outline-none focus:ring-1 focus:ring-[#1A6B4A]"
                  {...form.register("message")}
                />
                {form.formState.errors.message ? (
                  <p className="text-xs text-[#BA1A1A]">{form.formState.errors.message.message}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
                className="font-headline min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-4 text-sm font-bold tracking-wide text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {form.formState.isSubmitting ? "Sending..." : "Send Message"}
              </button>

              <p className="pt-1 text-center text-[11px] leading-relaxed text-[#6F7A72]">
                This feature is for demonstration. No messages are stored.
              </p>

              {submitted ? (
                <div className="rounded-lg border border-[#ADE0D0] bg-[#D6EEE7] px-4 py-3 text-sm text-[#1A7A62]">
                  Message submitted successfully. We will contact you soon.
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ECEEEC] bg-[#F2F4F2] px-4 py-24 sm:px-8" data-reveal>
        <div className="mx-auto max-w-4xl space-y-9 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#005235] to-[#1A6B4A] text-[#9BE9BF] shadow-xl">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
          </div>
          <h2 className="font-headline text-4xl font-bold tracking-tight text-[#005235]">Need a consultation directly?</h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-[#3F4943]">
            Book an appointment for expert radiology consultation and receive personalized medical insights from our specialized team.
          </p>
          <Link
            to="/book-appointment"
            className="font-headline inline-flex min-h-[44px] items-center rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-4 text-lg font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-95"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
