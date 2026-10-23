import { Link } from "react-router-dom";
import { Seo } from "../../../../components/common/Seo";
import { usePublicReveal } from "../../animations/usePublicReveal";

export default function ServicesPage() {
  usePublicReveal();

  return (
    <>
      <Seo
        title="Experience | Health Care"
        description="Experience precision care with radiology consultation, scan review, and guided booking."
        path="/services"
      />

      <section className="relative min-h-[70vh] overflow-hidden bg-[#F8FAF8] md:min-h-[80vh] lg:min-h-[100vh]" data-reveal>
        <div className="absolute inset-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#F8FAF8] via-[#F8FAF8]/88 to-transparent" />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
            alt="Medical professional"
            className="h-full w-full object-cover object-[center_top] sm:object-center"
          />
        </div>

          <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl text-center md:mx-auto md:text-center lg:mx-0 lg:text-left">
              <h1 className="font-headline text-5xl font-extrabold leading-[1.08] tracking-[-0.02em] text-[#005235] sm:text-6xl">
                Experience
                <br />
                <span className="text-[#386B00]">Precision Care.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3F4943] md:[text-align-last:center] lg:max-w-lg lg:[text-align-last:auto]">
                Navigating radiology should not be complex. We provide a seamless bridge between diagnostic imaging and actionable health insights.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 md:justify-center lg:justify-start">
              <Link
                to="/about"
                className="rounded-xl bg-[#7EC143] px-8 py-4 font-headline text-lg font-bold text-[#0D2000] transition hover:brightness-95"
              >
                Explore Services
              </Link>
              <a
                href="#streamlined-process"
                className="inline-flex items-center gap-2 rounded-xl border border-[#005235]/25 px-6 py-4 font-headline text-base font-bold text-[#005235] transition hover:bg-[#005235]/5"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                Watch How it Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F2F4F2] py-24" data-reveal>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col gap-8 md:items-center md:text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div className="max-w-2xl">
              <h2 className="font-headline text-5xl font-extrabold tracking-tight text-[#005235]">Radiology Services</h2>
              <p className="mt-4 text-lg text-[#3F4943] md:[text-align-last:center] lg:[text-align-last:auto]">Services designed for clarity and confidence in your healthcare journey.</p>
            </div>
            <div className="hidden h-px flex-1 bg-[#BFC9C0]/25 md:block" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <article className="group relative overflow-hidden rounded-[2rem] border border-[#BFC9C0]/20 bg-white p-10 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:text-white hover:shadow-lg md:col-span-7">
              <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-15">
                <span className="material-symbols-outlined text-[150px]">medical_services</span>
              </div>
              <div className="relative z-10 mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005235]/5 text-[#005235] transition-colors group-hover:bg-white/10 group-hover:text-[#ACF36E]">
                <span className="material-symbols-outlined text-[30px]">medical_services</span>
              </div>
              <h3 className="relative z-10 font-headline text-[34px] font-bold tracking-tight text-[#005235] transition-colors group-hover:text-white">Radiology Consultation</h3>
              <p className="relative z-10 mt-4 max-w-[60ch] text-base leading-relaxed text-[#3F4943] transition-colors group-hover:text-white/80">
                Detailed consultation for patients needing imaging-focused clinical guidance. We sit with you to explain the "why" behind the referral and the "what" behind the results.
              </p>
              <ul className="relative z-10 mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium text-[#386B00] transition-colors group-hover:text-[#ACF36E]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Personalized care plan
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-[#386B00] transition-colors group-hover:text-[#ACF36E]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Direct access to specialists
                </li>
              </ul>
            </article>

            <article className="group relative overflow-hidden rounded-[2rem] border border-[#BFC9C0]/20 bg-white p-10 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:text-white hover:shadow-lg md:col-span-5">
              <div className="absolute -bottom-6 -right-6 opacity-15">
                <span className="material-symbols-outlined text-[150px]">biotech</span>
              </div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005235]/5 transition-colors group-hover:bg-white/10">
                <span className="material-symbols-outlined text-[30px] text-[#005235] transition-colors group-hover:text-[#ACF36E]">biotech</span>
              </div>
              <h3 className="font-headline text-[34px] font-bold tracking-tight text-[#005235] transition-colors group-hover:text-white">Scan and Report Review</h3>
              <p className="mt-4 text-base leading-relaxed text-[#3F4943] transition-colors group-hover:text-white/80">
                Comprehensive review of existing radiology scans and reports for clearer decisions. No more confusing medical jargon.
              </p>
              <Link to="/about" className="mt-8 inline-flex items-center gap-2 font-headline text-lg font-bold text-[#386B00] transition hover:gap-3 group-hover:text-[#ACF36E]">
                Explore more
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </article>

            <article className="group relative overflow-hidden rounded-[2rem] border border-[#BFC9C0]/20 bg-white p-10 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:text-white hover:shadow-lg md:col-span-5">
              <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-15">
                <span className="material-symbols-outlined text-[150px]">clinical_notes</span>
              </div>
              <div className="relative z-10 mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ACF36E]/20 text-[#386B00] transition-colors group-hover:bg-white/10 group-hover:text-[#ACF36E]">
                <span className="material-symbols-outlined text-[30px]">clinical_notes</span>
              </div>
              <h3 className="relative z-10 font-headline text-[34px] font-bold tracking-tight text-[#005235] transition-colors group-hover:text-white">Second Opinion</h3>
              <p className="relative z-10 mt-4 max-w-[60ch] text-base leading-relaxed text-[#3F4943] transition-colors group-hover:text-white/80">
                Independent second-opinion reads to confirm diagnostic direction and reduce uncertainty in complex cases.
              </p>
            </article>

            <article className="group relative overflow-hidden rounded-[2rem] border border-[#BFC9C0]/20 bg-white p-10 shadow-sm transition-all duration-300 hover:bg-[#005235] hover:text-white hover:shadow-lg md:col-span-7">
              <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-15">
                <span className="material-symbols-outlined text-[150px]">calendar_today</span>
              </div>
              <div className="relative z-10 mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005235]/5 text-[#005235] transition-colors group-hover:bg-white/10 group-hover:text-[#ACF36E]">
                <span className="material-symbols-outlined text-[30px]">calendar_today</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline text-[34px] font-bold tracking-tight text-[#005235] transition-colors group-hover:text-white">Imaging Planning Guidance</h3>
                <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-[#3F4943] transition-colors group-hover:text-white/80">
                  Support in selecting the most appropriate imaging modality and timing. We help you choose between MRI, CT, or Ultrasound based on clinical necessity and cost-effectiveness.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="streamlined-process" className="bg-[#F8FAF8] py-24" data-reveal>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            <h2 className="mt-6 font-headline text-5xl font-extrabold tracking-tight text-[#005235]">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#3F4943]">
              Three simple steps to transition from uncertainty to professional medical clarity.
            </p>
          </div>

          <div className="relative mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="absolute left-0 top-10 hidden h-[2px] w-full bg-gradient-to-r from-transparent via-[#BFC9C0]/30 to-transparent md:block" />

            {[
              {
                title: "Schedule Your Visit",
                text: "Select your date and preferred slot on the booking page using our intuitive calendar interface.",
                icon: "event_available"
              },
              {
                title: "Submit Details",
                text: "Submit your consultation reason and clinical notes securely through our encrypted portal.",
                icon: "description"
              },
              {
                title: "Track Real-time",
                text: "Receive status updates from pending to confirmed in your dashboard with instant notifications.",
                icon: "dashboard_customize"
              }
            ].map((step, index) => (
              <article key={step.title} className="relative flex flex-col items-center px-4 text-center">
                <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#ECEEEC] bg-white shadow-md">
                  <span className="material-symbols-outlined text-[30px] text-[#005235]">{step.icon}</span>
                  <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#386B00] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#005235]">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#3F4943]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" data-reveal>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[3rem] bg-[#005235] px-10 py-12 md:px-16 md:py-16">
            <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_16px,rgba(172,243,110,0.45)_16px,rgba(172,243,110,0.45)_17px),repeating-linear-gradient(-45deg,transparent_0,transparent_22px,rgba(255,255,255,0.2)_22px,rgba(255,255,255,0.2)_23px)]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#1A6B4A] to-transparent" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#ACF36E]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-10 text-center md:items-center md:text-center lg:flex-row lg:items-center lg:text-left">
              <div className="max-w-2xl">
                <h2 className="font-headline text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
                  Ready for a clearer
                  <br />
                  medical perspective?
                </h2>
                <p className="mt-6 text-lg text-white/75 md:[text-align-last:center] lg:[text-align-last:auto]">
                  Our specialists are ready to guide you through your radiology results with empathy and expertise.
                </p>
              </div>

              <Link
                to="/book-appointment"
                className="rounded-2xl bg-[#7EC143] px-12 py-6 font-headline text-xl font-black text-[#0D2000] shadow-xl transition hover:scale-[1.03] hover:brightness-95"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
