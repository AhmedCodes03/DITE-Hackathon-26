import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { formatDate } from "../../../../utils/helpers";

export function BookingModal({
  navigate,
  redirectOnCloseTo,
  appointmentDate,
  minDateIso,
  activeWeekdays,
  setAppointmentDate,
  setSelectedSlot,
  calendarCells,
  parseIsoDate,
  addDays,
  findPrevSelectableDate,
  findNextSelectableDate,
  slotsLoading,
  slotsError,
  refetchSlots,
  morning,
  afternoon,
  renderSlotButton,
  selectedDoctor,
  selectedTimeLabel,
  visitNotes,
  setVisitNotes,
  submissionError,
  canConfirm,
  handleConfirm,
  bookMutation
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[#005235]/20 p-0 backdrop-blur-sm md:items-center md:p-4">
      <div className="relative h-full max-h-screen w-full max-w-4xl overflow-y-auto bg-[#F8FAF8] shadow-2xl md:h-auto md:max-h-[92vh] md:rounded-[2rem]">
        <button
          type="button"
          onClick={() => navigate(redirectOnCloseTo)}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F2] transition-colors hover:bg-[#ECEEEC] sm:right-8 sm:top-8"
          aria-label="Close overlay"
        >
          <span className="material-symbols-outlined text-[#191C1B]">close</span>
        </button>

        <div className="p-4 pb-8 pt-16 sm:p-8 md:p-10 md:pt-16 lg:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            <section className="space-y-10 lg:col-span-3">
              <div>
                <h2 className="mb-6 font-headline text-xl font-bold text-[#191C1B] sm:text-2xl">Choose Date &amp; Time</h2>

                <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-6 flex items-center justify-between gap-2">
                    <span className="font-headline text-base font-bold text-[#005235]" aria-hidden="true">
                      {parseIsoDate(appointmentDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const prevDate = findPrevSelectableDate(addDays(appointmentDate, -7), minDateIso, activeWeekdays);
                          if (prevDate < minDateIso || prevDate === appointmentDate) return;
                          setAppointmentDate(prevDate);
                          setSelectedSlot(null);
                        }}
                        className="rounded-lg p-2 transition-colors hover:bg-[#ECEEEC]"
                        aria-label="Previous week"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextDate = findNextSelectableDate(addDays(appointmentDate, 7), minDateIso, activeWeekdays);
                          setAppointmentDate(nextDate);
                          setSelectedSlot(null);
                        }}
                        className="rounded-lg p-2 transition-colors hover:bg-[#ECEEEC]"
                        aria-label="Next week"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#6F7A72] sm:gap-2 sm:tracking-[0.14em]">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
                    {calendarCells.map((cell) => (
                      <button
                        key={cell.key}
                        type="button"
                        disabled={cell.disabled}
                        onClick={() => {
                          if (!cell.dateIso) return;
                          setAppointmentDate(cell.dateIso);
                          setSelectedSlot(null);
                        }}
                        className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all ${
                          cell.isSelected
                            ? "bg-[#ACF36E] font-extrabold text-[#285000] ring-2 ring-[#386B00]/60"
                            : cell.muted
                              ? "cursor-not-allowed font-medium text-[#6F7A72]/35"
                              : "font-bold text-[#191C1B] hover:bg-[#ECEEEC]"
                        }`}
                      >
                        <span>{cell.day}</span>
                        {cell.isSelected ? <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#386B00]" /> : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-4 font-headline text-xs font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Morning Slots</h4>
                  {slotsLoading ? <LoadingState label="Loading slots..." /> : null}
                  {slotsError ? (
                    <ErrorState
                      title="Failed to load slots"
                      description="Please retry to see available times."
                      onRetry={refetchSlots}
                    />
                  ) : null}
                  {!slotsLoading && !slotsError ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {morning.length ? morning.map(renderSlotButton) : <p className="col-span-full text-sm text-[#6F7A72]">No morning slots.</p>}
                    </div>
                  ) : null}
                </div>

                <div>
                  <h4 className="mb-4 font-headline text-xs font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Afternoon Slots</h4>
                  {!slotsLoading && !slotsError ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {afternoon.length ? (
                        afternoon.map(renderSlotButton)
                      ) : (
                        <p className="col-span-full text-sm text-[#6F7A72]">No afternoon slots.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <aside className="h-fit space-y-8 rounded-2xl bg-[#F2F4F2] p-5 sm:p-8 lg:col-span-2 md:sticky md:top-4">
              <div>
                <h3 className="mb-6 font-headline text-lg font-bold text-[#191C1B]">Appointment Summary</h3>

                <div className="mb-6 flex items-center gap-4 rounded-xl bg-white p-4">
                  <img src={selectedDoctor?.image} alt={selectedDoctor?.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#191C1B]">{selectedDoctor?.name}</p>
                    <p className="text-xs font-medium text-[#005235]">{selectedDoctor?.specialty}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-[#191C1B]">
                    <span className="material-symbols-outlined text-[#005235]">calendar_today</span>
                    <span className="font-medium">{formatDate(appointmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#191C1B]">
                    <span className="material-symbols-outlined text-[#005235]">schedule</span>
                    <span className="font-medium">{selectedTimeLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#191C1B]">
                    <span className="material-symbols-outlined text-[#005235]">location_on</span>
                    <span className="font-medium">{selectedDoctor?.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Visit Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={visitNotes}
                  onChange={(event) => setVisitNotes(event.target.value)}
                  placeholder="Briefly describe your symptoms..."
                  className="w-full rounded-xl border-0 bg-white p-4 text-sm focus:ring-1 focus:ring-[#005235]"
                />
              </div>

              {submissionError ? (
                <div className="rounded-lg border border-[#FFDAD6] bg-[#FFF4F2] px-3 py-2 text-sm text-[#93000A]">
                  {submissionError}
                </div>
              ) : null}

              <div className="space-y-4 pt-6">
                <button
                  type="button"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                  className="w-full rounded-xl bg-[#005235] py-4 font-headline text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#005235]/30 transition-all hover:scale-[1.02] hover:bg-[#1A6B4A] active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookMutation.isPending ? "Confirming..." : "Confirm Appointment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlot(null);
                    setVisitNotes("");
                  }}
                  className="w-full text-sm font-bold text-[#3F4943] transition-colors hover:text-[#005235]"
                >
                  Back to Selection
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
