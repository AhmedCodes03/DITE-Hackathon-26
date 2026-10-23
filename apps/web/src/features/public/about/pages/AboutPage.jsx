import { Link } from "react-router-dom";
import { Seo } from "../../../../components/common/Seo";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile";
import { usePublicReveal } from "../../animations/usePublicReveal";

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start justify-center gap-6 text-left md:justify-center lg:justify-start">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F2F4F2] text-[#005235]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6F7A72]">{label}</div>
        <div className="text-lg font-medium text-[#191C1B]">{value}</div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  usePublicReveal();
  const { data: profile } = useDoctorProfile();
  const doctorName = profile?.doctorName || "Dr. Sarah Mitchell";
  const doctorSpecialty = profile?.specialty || "Specialist";
  const shortDoctorName = doctorName.replace(/^Dr\.?\s*/i, "Dr. ");

  return (
    <>
      <Seo
        title={`About ${doctorName} | Health Care`}
        description={`Meet ${doctorName}, ${doctorSpecialty}, and explore clinic information, credentials, and consultation booking.`}
        path="/about"
      />

      <section className="mx-auto grid min-h-[70vh] w-full max-w-7xl grid-cols-1 items-center gap-16 px-4 text-center sm:px-6 md:min-h-[80vh] md:text-center lg:min-h-[100vh] lg:grid-cols-12 lg:gap-16 lg:px-8 lg:text-left" data-reveal>
        <div className="lg:col-span-7 lg:pr-4">
          <h1 className="mb-8 font-headline text-[56px] font-bold leading-[1.1] tracking-tight text-[#005235]">
            Meet {doctorName}
          </h1>
          <p className="mx-auto max-w-2xl text-[28px] font-medium leading-relaxed text-[#191C1B] md:[text-align-last:center] lg:mx-0 lg:[text-align-last:auto]">
            A {doctorSpecialty.toLowerCase()} focused on high-quality diagnosis and clear patient communication.
          </p>
        </div>

        <div className="relative lg:col-span-5">
          <div className="aspect-[3/4] overflow-hidden rounded-[32px] bg-[#E6E9E7] shadow-2xl sm:aspect-[4/5]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
              alt={profile?.doctorName || "Doctor"}
              className="h-full w-full object-cover object-[center_top] sm:object-center"
            />
          </div>

          <div className="absolute -bottom-8 -left-8 hidden rounded-[24px] bg-gradient-to-br from-[#005235] to-[#1A6B4A] p-8 text-white shadow-xl md:block">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl">shield</span>
              <div>
                <div className="font-headline text-2xl font-bold">{profile?.experienceYears || 9}+ Years</div>
                <div className="text-sm text-white/80">Clinical Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F2F4F2] py-20" data-reveal>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-24 px-4 text-center sm:px-6 md:text-center lg:grid-cols-2 lg:px-8 lg:text-left">
          <div>
            <h2 className="font-headline text-[48px] font-bold tracking-tight text-[#005235]">Biography</h2>
            <div className="mx-auto mt-8 max-w-[560px] space-y-6 text-[16px] leading-relaxed text-[#3F4943] md:[text-align-last:center] lg:mx-0 lg:[text-align-last:auto]">
              <p>
                {profile?.bio ||
                  `Experienced ${doctorSpecialty.toLowerCase()} focused on accurate clinical insight and patient-centered support. With years of experience, ${shortDoctorName} provides comprehensive consultation and clear guidance.`}
              </p>
              <p>
                {profile?.aboutText ||
                  "A patient-centered approach ensures every patient receives clear explanations and optimal care, bridging the gap between complex diagnostics and patient understanding."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <article className="rounded-2xl bg-white p-8">
              <span className="material-symbols-outlined mb-4 text-[28px] text-[#005235]">school</span>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6F7A72]">Education</div>
              <div className="font-headline text-[30px] font-bold text-[#191C1B]">{profile?.qualifications?.[0] || "MBBS"}</div>
            </article>

            <article className="rounded-2xl bg-white p-8">
              <span className="material-symbols-outlined mb-4 text-[28px] text-[#005235]">workspace_premium</span>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6F7A72]">Certification</div>
              <div className="font-headline text-[30px] font-bold text-[#191C1B]">{profile?.qualifications?.[1] || "FCPS"}</div>
            </article>

            <article className="rounded-2xl bg-white p-8 sm:col-span-2">
              <span className="material-symbols-outlined mb-4 text-[28px] text-[#005235]">radiology</span>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6F7A72]">Core Specialty</div>
              <div className="font-headline text-[32px] font-bold text-[#191C1B]">{doctorSpecialty}</div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8" data-reveal>
        <div className="overflow-hidden rounded-[24px] bg-[#F2F4F2] shadow-sm lg:flex">
          <div className="flex-1 p-12 text-center md:text-center lg:p-20 lg:text-left">
            <h2 className="font-headline text-[42px] font-bold tracking-tight text-[#005235]">Clinic Information</h2>
            <div className="mt-12 space-y-10">
              <InfoItem icon="location_on" label="Location" value={profile?.clinicAddress || "Hyderabad, Pakistan"} />
              <InfoItem icon="call" label="Phone" value={profile?.contactPhone || "03xx-xxxxxx"} />
              <InfoItem icon="mail" label="Email" value={profile?.contactEmail || "info@drxyz.com"} />
            </div>
          </div>

          <div className="h-[400px] bg-[#E6E9E7] p-10 lg:h-auto lg:w-[45%] lg:p-14">
            <div className="h-full w-full overflow-hidden border border-[#BFC9C0]/70 bg-white shadow-[0_10px_24px_rgba(25,28,27,0.2)]">
              <iframe
                title="Hyderabad clinic map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=67.005%2C25.320%2C68.565%2C25.555&layer=mapnik&marker=25.3960%2C68.3578"
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8" data-reveal>
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#005235] to-[#1A6B4A] p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_16px,rgba(172,243,110,0.45)_16px,rgba(172,243,110,0.45)_17px),repeating-linear-gradient(-45deg,transparent_0,transparent_22px,rgba(255,255,255,0.2)_22px,rgba(255,255,255,0.2)_23px)]" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#386B00]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#8AD6AE]/10 blur-3xl" />

          <h2 className="relative z-10 font-headline text-4xl font-bold text-white md:text-5xl">Ready to schedule your consultation?</h2>
          <Link
            to="/book-appointment"
            className="relative z-10 mt-8 inline-flex rounded-lg bg-[#7EC143] px-10 py-4 font-headline text-lg font-bold text-[#0D2000] transition hover:brightness-95"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
