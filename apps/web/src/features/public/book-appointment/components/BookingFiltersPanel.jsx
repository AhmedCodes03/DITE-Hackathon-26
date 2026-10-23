export function BookingFiltersPanel({
  selectedDoctor,
  appointmentDate,
  minDateIso,
  activeWeekdays,
  setAppointmentDate,
  setSelectedSlot,
  setVisitNotes,
  getTodayISOInPk,
  weekdayFromIso
}) {
  return (
    <aside className="w-full space-y-8 rounded-2xl bg-[#F2F4F2] p-5 sm:p-6 md:sticky md:top-28">
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-headline text-sm font-bold text-[#005235]">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          Filters
        </h3>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="public-booking-specialty"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]"
            >
              Specialty
            </label>
            <input
              id="public-booking-specialty"
              value={selectedDoctor?.specialty || ""}
              readOnly
              aria-label="Selected specialty"
              className="w-full rounded-lg border-0 bg-white text-sm text-[#191C1B]"
            />
          </div>

          <div>
            <label
              htmlFor="public-booking-date"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]"
            >
              Date
            </label>
            <input
              id="public-booking-date"
              type="date"
              value={appointmentDate}
              min={minDateIso}
              onChange={(event) => {
                const nextDate = event.target.value;
                if (activeWeekdays.size && !activeWeekdays.has(weekdayFromIso(nextDate))) {
                  return;
                }
                setAppointmentDate(nextDate);
                setSelectedSlot(null);
              }}
              className="w-full rounded-lg border-0 bg-white text-sm focus:ring-1 focus:ring-[#005235]"
            />
          </div>

          <div>
            <label
              htmlFor="public-booking-location"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]"
            >
              Location
            </label>
            <div className="relative">
              <input
                id="public-booking-location"
                value={selectedDoctor?.location || ""}
                readOnly
                aria-label="Selected clinic location"
                className="w-full rounded-lg border-0 bg-white pl-9 text-sm text-[#191C1B]"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-[#6F7A72]">
                location_on
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const resetDate = getTodayISOInPk();
          setAppointmentDate(resetDate);
          setSelectedSlot(null);
          setVisitNotes("");
        }}
        className="w-full rounded-lg border border-[#005235]/25 py-2.5 font-headline text-xs font-bold uppercase tracking-[0.14em] text-[#005235] transition-colors hover:bg-[#005235]/5"
      >
        Clear All
      </button>
    </aside>
  );
}
