import { DAY_LABELS, WEEK_ORDER, toDisplayTime, toMinutes, toTimeString } from "../utils/scheduleUtils";

function createHourlyPreviewByDay(slotsByDay, timeRows) {
  const map = {};
  WEEK_ORDER.forEach((day) => {
    const slots = slotsByDay[day] || [];
    map[day] = timeRows.map((hour) => {
      const hourStart = toMinutes(hour);
      const hourEnd = hourStart + 60;
      const hourSlots = slots.filter((slot) => {
        const slotTime = toMinutes(slot.startTime);
        return slotTime >= hourStart && slotTime < hourEnd;
      });

      if (!hourSlots.length) return { type: "empty", label: "" };

      const availableSlot = hourSlots.find((slot) => !slot.isBreak);
      if (availableSlot) return { type: "available", label: availableSlot.label };

      return { type: "break", label: "LUNCH" };
    });
  });
  return map;
}

export function buildTimeRows(dayRuleMap) {
  const activeRules = Object.values(dayRuleMap).filter(Boolean);
  if (!activeRules.length) return [];
  const minStart = Math.min(...activeRules.map((rule) => toMinutes(rule.startTime)));
  const maxEnd = Math.max(...activeRules.map((rule) => toMinutes(rule.endTime)));
  const rows = [];
  for (let t = minStart; t < maxEnd; t += 60) {
    rows.push(toTimeString(t));
  }
  return rows;
}

export function SchedulePreviewGrid({ rules, weekDates, dayRuleMap, slotsByDay, timeRows, resetDraft, queryClient, mutationsPending }) {
  const hourlyPreviewByDay = createHourlyPreviewByDay(slotsByDay, timeRows);

  return (
    <section className="min-w-0 w-full flex-1">
      <div className="flex h-[620px] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm sm:h-[700px] xl:h-[740px]">
        <div className="flex flex-col gap-3 border-b border-[#F2F4F2] bg-white p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-2xl font-bold leading-none text-[#191C1B] sm:text-[34px]">Live Preview</h2>
            <span className="rounded bg-[#ACF36E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3A6F00]">DRAFT MODE</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full bg-[#F8FAF8] px-3 py-1 text-[11px] font-medium text-[#3F4943]">
              <span className="h-2 w-2 rounded-full bg-[#386B00]" /> Available
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#F8FAF8] px-3 py-1 text-[11px] font-medium text-[#3F4943]">
              <span className="h-2 w-2 rounded-full bg-[#BFC9C0]" /> Blocked
            </div>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-auto bg-[#F2F4F2]/30 p-3 sm:p-4 lg:p-6">
          <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: "74px repeat(7, minmax(0, 1fr))" }}>
            <div />
            {WEEK_ORDER.map((day, index) => {
              const date = weekDates[index];
              const hasRule = Boolean(dayRuleMap[day]);
              const isWeekend = day === "saturday" || day === "sunday";
              return (
                <div
                  key={day}
                  className={`rounded-lg p-2 text-center shadow-sm ${
                    hasRule
                      ? "border-b-2 border-[#386B00] bg-white"
                      : `${isWeekend ? "opacity-60" : ""} bg-[#F2F4F2] text-[#6F7A72]`
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest">{DAY_LABELS[day]}</p>
                  <p className={`text-lg font-bold ${hasRule ? "text-[#005235]" : "text-[#6F7A72]"}`}>{date.getDate()}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "74px repeat(7, minmax(0, 1fr))" }}>
            <div className="space-y-4 pt-1">
              {timeRows.map((t) => (
                <div key={t} className="flex h-10 items-center justify-end pr-2 text-right text-[11px] font-bold text-[#6F7A72]">
                  {toDisplayTime(t)}
                </div>
              ))}
            </div>

            {WEEK_ORDER.map((day) => {
              const slots = slotsByDay[day] || [];
              const hourlyRows = hourlyPreviewByDay[day] || [];
              if (!slots.length) {
                return (
                  <div
                    key={day}
                    className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#BFC9C0]/20 bg-[#F8FAF8] p-4 text-center"
                  >
                    <span className="material-symbols-outlined mb-2 text-4xl text-[#BFC9C0]/60">hotel</span>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-[#BFC9C0]">WEEKEND REST</p>
                  </div>
                );
              }

              return (
                <div key={day} className="space-y-2">
                  {hourlyRows.map((slot, index) => (
                    <div
                      key={`${day}-${timeRows[index]}`}
                      className={`flex h-10 items-center justify-center rounded-lg border text-[10px] font-bold ${
                        slot.type === "break"
                          ? "border-dashed border-[#BFC9C0]/30 bg-[#F2F4F2] text-[#6F7A72]"
                          : slot.type === "available"
                            ? "border-[#386B00]/20 bg-[#ACF36E]/60 text-[#3A6F00]"
                            : "border-transparent bg-transparent"
                      }`}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {!rules.length && (
            <div className="mt-4 rounded-xl border border-dashed border-[#BFC9C0]/40 bg-[#F8FAF8] p-8 text-center text-sm text-[#6F7A72]">
              Create your first active availability rule to render the live weekly schedule.
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-3 border-t border-[#F2F4F2] bg-white p-4 sm:flex-row sm:gap-4 sm:p-6">
          <button
            type="button"
            onClick={resetDraft}
            className="min-h-[44px] w-full rounded-[10px] border-2 border-[#005235] bg-transparent px-6 py-3 font-bold text-[#005235] transition-all hover:bg-[#005235] hover:text-white sm:w-auto"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["availability"] })}
            disabled={mutationsPending}
            className="min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-3 font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Publish Schedule
          </button>
        </div>
      </div>
    </section>
  );
}
