import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doctorsApi } from "../../../doctors/api/doctors.api";
import { LoadingState } from "../../../../components/common/LoadingState";
import { Seo } from "../../../../components/common/Seo";

const SPECIALTIES = [
  "All",
  "General Physician",
  "Cardiologist",
  "Consultant Radiologist",
  "Dermatologist",
  "Orthopedic Surgeon"
];

const CURATED_DOCTORS = [
  {
    _id: "doc-adnan",
    doctorName: "Dr. Adnan Khan",
    specialty: "Consultant Radiologist",
    title: "Consultant Radiologist & Diagnostic Imaging Specialist",
    bio: "Expert in high-resolution diagnostic imaging, MRI, CT scanning, ultrasound, and digital X-rays with 12+ years of clinical experience.",
    clinicName: "Advanced Radiology & Diagnostic Center",
    clinicAddress: "Gulberg III, Lahore, Pakistan",
    experienceYears: 12,
    consultationFee: 3000,
    rating: "4.9",
    reviewsCount: 142,
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "doc-sara",
    doctorName: "Dr. Sara Ahmed",
    specialty: "Cardiologist",
    title: "Senior Consultant Cardiologist",
    bio: "Specialist in preventive cardiology, echocardiography, hypertension, and heart disease management with 10 years of experience.",
    clinicName: "Heart Care Clinic",
    clinicAddress: "DHA Phase 5, Karachi, Pakistan",
    experienceYears: 10,
    consultationFee: 2500,
    rating: "4.9",
    reviewsCount: 98,
    photoUrl: "https://images.unsplash.com/photo-1594824813589-9a7065e94b29?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "doc-zain",
    doctorName: "Dr. Zain Malik",
    specialty: "General Physician",
    title: "General Physician & Family Medicine Specialist",
    bio: "Experienced general physician specializing in family healthcare, chronic illness management, and preventive screening.",
    clinicName: "Family Health Center",
    clinicAddress: "F-10 Markaz, Islamabad, Pakistan",
    experienceYears: 8,
    consultationFee: 1500,
    rating: "4.8",
    reviewsCount: 86,
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "doc-nadia",
    doctorName: "Dr. Nadia Hussain",
    specialty: "Dermatologist",
    title: "Consultant Dermatologist & Skin Specialist",
    bio: "Dedicated dermatologist specializing in skin disorders, clinical dermatology, acne therapies, and aesthetic skin care.",
    clinicName: "Glow Skin & Laser Clinic",
    clinicAddress: "Johar Town, Lahore, Pakistan",
    experienceYears: 7,
    consultationFee: 2200,
    rating: "4.9",
    reviewsCount: 115,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "doc-tariq",
    doctorName: "Dr. Tariq Mahmood",
    specialty: "Orthopedic Surgeon",
    title: "Senior Consultant Orthopedic Surgeon",
    bio: "Specializing in joint disorders, sports injuries, fracture management, and musculoskeletal health with 14 years of experience.",
    clinicName: "Bone & Joint Care Center",
    clinicAddress: "Blue Area, Islamabad, Pakistan",
    experienceYears: 14,
    consultationFee: 3000,
    rating: "4.9",
    reviewsCount: 130,
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80"
  }
];

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [apiDoctors, setApiDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const res = await doctorsApi.listDoctors();
        if (res.success && Array.isArray(res.data)) {
          setApiDoctors(res.data);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, []);

  // Merge live API doctors with curated roster (substituting actual DB _ids where matched)
  const allDoctors = useMemo(() => {
    const list = [...apiDoctors];

    // Check curated doctors not yet in list and add them
    for (const curated of CURATED_DOCTORS) {
      const existing = list.find(
        (d) => d.doctorName?.toLowerCase() === curated.doctorName.toLowerCase()
      );
      if (existing) {
        // Enrich existing DB doctor with photo if missing
        if (!existing.photoUrl) existing.photoUrl = curated.photoUrl;
        if (!existing.rating) existing.rating = curated.rating;
        if (!existing.reviewsCount) existing.reviewsCount = curated.reviewsCount;
      } else {
        list.push(curated);
      }
    }

    return list;
  }, [apiDoctors]);

  // Apply filters
  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doc) => {
      const matchesSpecialty =
        selectedSpecialty === "All" ||
        doc.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase());

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        doc.doctorName?.toLowerCase().includes(query) ||
        doc.specialty?.toLowerCase().includes(query) ||
        doc.clinicName?.toLowerCase().includes(query) ||
        doc.clinicAddress?.toLowerCase().includes(query);

      return matchesSpecialty && matchesSearch;
    });
  }, [allDoctors, selectedSpecialty, search]);

  return (
    <>
      <Seo
        title="Find Doctors & Medical Specialists | Health Care"
        description="Browse certified doctors, view credentials and consultation fees, and book appointments online."
        path="/doctors"
      />

      <main className="min-h-screen bg-[#F8FAF8] pb-24">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden py-16 text-white sm:py-24"
          style={{ background: "linear-gradient(135deg, #072a1e 0%, #0d4a34 50%, #176848 100%)" }}
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#7EC143]/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

          <div className="page-container relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md mb-4 text-xs font-semibold text-[#A6E85C]">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>VERIFIED HEALTHCARE SPECIALISTS</span>
            </div>
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              Find the Right Specialist for You
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-100/90 sm:text-lg">
              Connect with leading radiologists, cardiologists, dermatologists, and physicians. Review credentials, fees, and patient reviews, then book your consultation online in seconds.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="page-container -mt-8 relative z-20">
          <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xl sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Specialty Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      selectedSpecialty === spec
                        ? "bg-[#005235] text-white shadow-md shadow-emerald-900/20"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[280px]">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-lg text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="Search by name, specialty, or clinic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Doctors Roster */}
        <section className="page-container mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-gray-900">
              Available Doctors ({filteredDoctors.length})
            </h2>
            <span className="text-xs text-gray-500">
              Showing approved healthcare providers
            </span>
          </div>

          {loading && filteredDoctors.length === 0 ? (
            <LoadingState label="Loading doctor profiles..." />
          ) : filteredDoctors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
              <span className="material-symbols-outlined mx-auto text-5xl text-gray-300">person_search</span>
              <h3 className="mt-3 text-base font-bold text-gray-900">No specialists match your criteria</h3>
              <p className="mt-1 text-xs text-gray-500">
                Try selecting "All" specialties or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedSpecialty("All"); setSearch(""); }}
                className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor) => {
                const bookingUrl = `/book-appointment?doctorId=${doctor._id}`;
                const patientBookingUrl = `/patient/book-appointment?doctorId=${doctor._id}`;

                return (
                  <article
                    key={doctor._id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-400"
                  >
                    <div>
                      {/* Doctor Portrait Header */}
                      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-900 to-[#072a1e]">
                        <img
                          src={
                            doctor.photoUrl ||
                            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={doctor.doctorName}
                          className="h-full w-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#005235] uppercase tracking-wider backdrop-blur-md">
                            <span className="material-symbols-outlined text-[13px] text-[#7EC143]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              verified
                            </span>
                            {doctor.specialty}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                            <span className="material-symbols-outlined text-[13px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                            {doctor.rating || "4.9"}
                          </span>
                        </div>

                        {/* Bottom Name Overlay */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="font-headline text-xl font-bold text-white drop-shadow-sm truncate">
                            {doctor.doctorName}
                          </h3>
                          <p className="text-xs text-emerald-200 truncate">
                            {doctor.title || doctor.specialty}
                          </p>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6">
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {doctor.bio || doctor.aboutText || "Experienced specialist committed to personalized clinical care."}
                        </p>

                        <div className="mt-4 space-y-2 rounded-2xl bg-gray-50/80 p-3.5 text-xs text-gray-700 border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-emerald-700 shrink-0">apartment</span>
                            <span className="truncate font-semibold text-gray-900">{doctor.clinicName}</span>
                          </div>
                          {doctor.clinicAddress && (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-gray-400 shrink-0">location_on</span>
                              <span className="truncate text-gray-500">{doctor.clinicAddress}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                            <span className="text-gray-500">
                              Experience: <strong className="text-gray-800">{doctor.experienceYears || 5}+ yrs</strong>
                            </span>
                            <span className="font-bold text-[#005235]">
                              Fee: PKR {doctor.consultationFee || 2000}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Actions */}
                    <div className="p-6 pt-0 space-y-2">
                      <button
                        type="button"
                        onClick={() => navigate(bookingUrl)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#005235] py-3 text-xs font-bold text-white transition hover:bg-[#003d28] shadow-sm hover:shadow"
                      >
                        <span className="material-symbols-outlined text-base">calendar_month</span>
                        Book with {doctor.doctorName.split(" ")[1] || "Doctor"}
                      </button>

                      <Link
                        to={patientBookingUrl}
                        className="block text-center text-[11px] font-semibold text-gray-500 hover:text-[#005235] py-1"
                      >
                        Registered Patient? Quick Book →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
