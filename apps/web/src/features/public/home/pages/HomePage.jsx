import { Link } from "react-router-dom";
import { Seo } from "../../../../components/common/Seo";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU";

const doctorImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU";

export default function HomePage() {
  const { data: doctorProfile } = useDoctorProfile();
  const doctorName = doctorProfile?.doctorName || "Dr. Sarah Mitchell";
  const doctorSpecialty = doctorProfile?.specialty || "Specialist";
  const doctorSurname = doctorName.replace(/^Dr\.?\s*/i, "").trim().split(" ").pop() || "Mitchell";
  const shortDoctorName = `Dr. ${doctorSurname}`;

  return (
    <>
      <Seo
        title={`Health Care | ${doctorName} - ${doctorSpecialty}`}
        description={`Expert imaging interpretation and clinical guidance from ${doctorName}.`}
        path="/"
      />

      <main>
        <section
          className="hero-gradient overflow-hidden px-4 pb-12 pt-24 text-white sm:px-6 md:pb-16 md:pt-32 lg:px-8"
          style={{ background: "linear-gradient(135deg, #0d2b1f 0%, #1a6b4a 100%)" }}
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:min-h-[calc(100vh-120px)] lg:grid-cols-2">
            <div className="z-10 text-center md:text-center lg:text-left">
              <h1 className="font-headline mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[56px]">
                Book Your Radiology Consultation <span className="text-lime-400">Effortlessly</span>
              </h1>
              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-emerald-100/80 md:mx-auto md:text-xl md:text-center md:[text-align-last:center] lg:mx-0 lg:max-w-lg lg:text-left lg:[text-align-last:auto]">
                Expert imaging interpretation and clinical guidance from {doctorName}. Professional care meets botanical precision.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row md:justify-center lg:justify-start">
                <Link
                  to="/book-appointment"
                  className="font-headline w-full rounded-[10px] bg-[#7EC143] px-8 py-4 text-center text-lg font-bold text-[#0D2000] transition-all hover:brightness-95 sm:w-auto"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/doctors"
                  className="font-headline flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-white/30 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/12 sm:w-auto"
                >
                  <span className="material-symbols-outlined">stethoscope</span>
                  Browse Doctors
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 translate-x-1/4 transform rounded-full bg-lime-400/20 blur-[120px]" />
              <img
                src={heroImage}
                alt="professional female radiologist"
                className="h-[500px] w-full rounded-3xl object-cover shadow-2xl grayscale-[20%] transition-all duration-700 hover:grayscale-0"
              />

              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-6 shadow-xl lg:flex">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ACF36E] text-[#285000]">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#191c1b]">9+ Years</div>
                    <div className="text-xs text-[#3f4943]">Expert Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f8faf8] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="font-headline mb-4 text-4xl font-bold text-[#005235]">Precision Services</h2>
              <p className="mx-auto max-w-2xl text-[#3f4943]">
                Comprehensive diagnostic support tailored to your clinical needs with meticulous attention to detail.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <article className="group rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f2f4f2] transition-colors group-hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#005235] group-hover:text-lime-400">clinical_notes</span>
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold text-[#191c1b] group-hover:text-white">Radiology Consultation</h3>
                <p className="mb-6 text-sm leading-relaxed text-[#3f4943] group-hover:text-emerald-100/70">
                  Direct clinical discussion regarding imaging findings and diagnostic pathways.
                </p>
                <Link
                  to="/services"
                  className="flex items-center gap-2 text-sm font-bold text-[#005235] transition-all group-hover:gap-3 group-hover:text-lime-400"
                >
                  Learn more
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </article>

              <article className="group rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:shadow-lg md:-translate-y-4">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f2f4f2] transition-colors group-hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#005235] group-hover:text-lime-400">visibility</span>
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold text-[#191c1b] group-hover:text-white">Scan Review</h3>
                <p className="mb-6 text-sm leading-relaxed text-[#3f4943] group-hover:text-emerald-100/70">
                  Meticulous analysis of X-rays, CTs, and MRIs with detailed reporting.
                </p>
                <Link
                  to="/services"
                  className="flex items-center gap-2 text-sm font-bold text-[#005235] transition-all group-hover:text-lime-400"
                >
                  Get started
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </article>

              <article className="group rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f2f4f2] transition-colors group-hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#005235] group-hover:text-lime-400">assignment_turned_in</span>
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold text-[#191c1b] group-hover:text-white">Second Opinion</h3>
                <p className="mb-6 text-sm leading-relaxed text-[#3f4943] group-hover:text-emerald-100/70">
                  Validation of existing diagnoses to provide peace of mind and clarity.
                </p>
                <Link
                  to="/services"
                  className="flex items-center gap-2 text-sm font-bold text-[#005235] transition-all group-hover:gap-3 group-hover:text-lime-400"
                >
                  Learn more
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </article>

              <article className="group rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f2f4f2] transition-colors group-hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#005235] group-hover:text-lime-400">calendar_today</span>
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold text-[#191c1b] group-hover:text-white">Planning Guidance</h3>
                <p className="mb-6 text-sm leading-relaxed text-[#3f4943] group-hover:text-emerald-100/70">
                  Imaging modality and timing recommendations tailored to urgency, clinical context, and cost-effectiveness.
                </p>
                <Link
                  to="/services"
                  className="flex items-center gap-2 text-sm font-bold text-[#005235] transition-all group-hover:gap-3 group-hover:text-lime-400"
                >
                  Learn more
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#f2f4f2] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl lg:flex">
              <div className="relative h-[280px] sm:h-[360px] lg:h-auto lg:w-1/2">
                <img src={doctorImage} alt={doctorName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#005235]/60 to-transparent" />
                <div className="absolute bottom-8 left-8 rounded-xl border border-white/30 bg-white/20 px-6 py-4 backdrop-blur-md">
                  <span className="font-headline block text-3xl font-bold text-white">9+ Years</span>
                  <span className="text-sm font-medium text-white/80">{doctorSpecialty}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center p-6 text-center sm:p-10 md:items-center md:text-center lg:w-1/2 lg:items-start lg:p-16 lg:text-left">
                <span className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#386b00]">Lead Clinician</span>
                <h2 className="font-headline mb-6 text-2xl font-bold text-[#005235] sm:text-3xl lg:text-4xl">{doctorName}</h2>
                <p className="mb-8 text-lg leading-relaxed text-[#3f4943] md:max-w-2xl md:text-center md:[text-align-last:center] lg:max-w-none lg:text-left lg:[text-align-last:auto]">
                  Specializing in diagnostic radiology and complex scan interpretations, {shortDoctorName} brings a decade of expertise to
                  Health Care. Her approach blends advanced medical technology with a personalized touch, ensuring every patient receives a
                  clear roadmap to their health.
                </p>

                <div className="mb-10 grid grid-cols-2 gap-6 md:mx-auto lg:mx-0">
                  {[
                    "Board Certified",
                    "98% Accuracy Rate",
                    "Quick Reporting",
                    "Patient First Care"
                  ].map((item) => (
                    <div className="flex items-center gap-3" key={item}>
                      <span className="material-symbols-outlined text-[#386b00]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <span className="text-sm font-medium text-[#191c1b]">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/about"
                  className="font-headline w-full rounded-[10px] bg-[#7EC143] px-8 py-4 text-center text-lg font-bold text-[#0D2000] transition-all hover:brightness-95 sm:w-auto"
                >
                  View Credentials
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#f8faf8] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="relative mx-auto w-full max-w-7xl">
            <div className="mb-20 flex flex-col gap-6 md:items-center md:text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
              <div className="max-w-2xl">
                <h2 className="font-headline mb-4 text-4xl font-bold text-[#005235] md:text-5xl">Streamlined Process</h2>
                <p className="text-lg text-[#3f4943] md:[text-align-last:center] lg:[text-align-last:auto]">
                  Accessing expert radiology advice shouldn't be complicated. Our three-step flow is designed for speed and clinical
                  accuracy.
                </p>
              </div>
              <div className="hidden md:block">
                <span className="material-symbols-outlined pointer-events-none absolute -top-10 right-0 select-none text-9xl text-[#005235]/5">
                  medical_services
                </span>
              </div>
            </div>

            <div className="absolute left-[15%] right-[15%] top-[184px] -z-0 hidden h-0.5 bg-gradient-to-r from-transparent via-[#386b00]/20 to-transparent lg:block" />

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
              {[
                {
                  icon: "calendar_month",
                  title: "Select Date",
                  text: `Choose a consultation window that fits your schedule from ${shortDoctorName}'s available calendar.`
                },
                {
                  icon: "upload_file",
                  title: "Submit Details",
                  text: "Upload your imaging scans and provide clinical history through our HIPAA-compliant portal."
                },
                {
                  icon: "task_alt",
                  title: "Receive Status",
                  text: `Get real-time updates and your completed diagnostic report directly via ${shortDoctorName}.`
                }
              ].map((item, index) => (
                <article
                  className="group relative flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm lg:items-start lg:text-left"
                  key={item.title}
                >
                  <div className="relative mb-8">
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#ACF36E] text-[#285000] shadow-lg shadow-[#386b00]/10 transition-transform duration-300 group-hover:scale-110">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {item.icon}
                      </span>
                    </div>
                    <div className="font-headline absolute -right-6 -top-6 z-0 select-none text-7xl font-extrabold text-[#e1e3e1]/30">
                      {index + 1}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-headline text-2xl font-extrabold tracking-tight text-[#005235]">{item.title}</h3>
                    <p className="text-base leading-relaxed text-[#3f4943]">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[24px] bg-[#005235] p-8 text-center md:rounded-[32px] md:p-20">
            <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_16px,rgba(172,243,110,0.45)_16px,rgba(172,243,110,0.45)_17px),repeating-linear-gradient(-45deg,transparent_0,transparent_22px,rgba(255,255,255,0.2)_22px,rgba(255,255,255,0.2)_23px)]" />
            <div className="absolute right-0 top-0 hidden h-64 w-64 -translate-y-1/2 translate-x-1/2 bg-lime-400 opacity-10 blur-[100px] lg:block" />
            <div className="absolute bottom-0 left-0 hidden h-64 w-64 translate-y-1/2 -translate-x-1/2 bg-emerald-900 opacity-30 blur-[100px] lg:block" />

            <div className="relative z-10">
              <h2 className="font-headline mx-auto mb-8 max-w-2xl text-2xl font-bold text-white sm:text-3xl md:text-5xl">
                Ready for your professional radiology review?
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-lg text-emerald-100/70">
                Schedule your first consultation with {shortDoctorName} today and experience a new standard in healthcare.
              </p>
              <Link
                to="/book-appointment"
                className="font-headline inline-flex w-full justify-center rounded-[10px] bg-[#7EC143] px-10 py-5 text-xl font-bold text-[#0D2000] transition-all hover:scale-105 hover:brightness-95 sm:w-auto"
              >
                Book Appointment Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
