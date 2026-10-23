export function fallbackDoctorCard(profile) {
  return {
    id: profile?.id || "doctor-primary",
    name: profile?.doctorName || "Doctor",
    specialty: profile?.specialty || "Specialist",
    rating: "4.9",
    reviews: "120",
    tags: [profile?.clinicName || "Verified Clinic", `${profile?.experienceYears || 10}+ Yrs Exp`],
    location: profile?.clinicAddress || "Main Medical Plaza, Suite 402",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
  };
}

export function DoctorCard({ doctor, isSelected, onSelect }) {
  return (
    <article
      className={`group rounded-2xl bg-[#ffffff] p-6 shadow-sm transition-shadow hover:shadow-md ${
        isSelected ? "border-2 border-[#005235]/15" : "border border-transparent"
      }`}
    >
      <div className="mb-4 flex gap-4">
        <img src={doctor.image} alt={doctor.name} className="h-20 w-20 rounded-xl bg-[#ECEEEC] object-cover" />

        <div className="flex-1">
          <h4 className="font-headline text-lg font-bold text-[#191C1B]">{doctor.name}</h4>
          <p className="text-sm font-medium text-[#005235]">{doctor.specialty}</p>

          <div className="mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-lg text-[#7EC143]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-sm font-bold text-[#191C1B]">{doctor.rating}</span>
            <span className="ml-1 text-xs text-[#6F7A72]">({doctor.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {doctor.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#ECEEEC] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6F7A72]"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-xl py-3 font-headline text-sm font-bold transition-all active:scale-100 ${
          isSelected
            ? "bg-[#005235] text-white shadow-lg shadow-[#005235]/30"
            : "bg-[#005235] text-white hover:scale-[1.02] hover:bg-[#1A6B4A]"
        }`}
      >
        {isSelected ? "Selected" : "Select Doctor"}
      </button>
    </article>
  );
}
