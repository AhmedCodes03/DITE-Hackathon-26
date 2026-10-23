import { DAY_SELECTOR_ORDER, DAY_SHORT, SLOT_OPTIONS } from "../utils/scheduleUtils";

export function ScheduleRuleForm({ form, selectedDays, editingId, createMutation, updateMutation, onSubmit, resetDraft }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <h2 className="mb-6 font-headline text-2xl font-bold leading-none text-[#191C1B] sm:text-[34px]">Create New Rule</h2>

      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">REPEAT ON</label>
          <div className="flex flex-wrap gap-2">
            {DAY_SELECTOR_ORDER.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => form.setValue("dayOfWeek", day, { shouldValidate: true })}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                    active
                      ? "border-[#ACF36E] bg-[#ACF36E] text-[#3A6F00]"
                      : "border-[#BFC9C0] text-[#191C1B] hover:bg-[#F2F4F2]"
                  }`}
                >
                  {DAY_SHORT[day]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-schedule-start-time" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">
              START TIME
            </label>
            <input
              id="admin-schedule-start-time"
              type="time"
              {...form.register("startTime")}
              className="w-full rounded-xl border-none bg-[#F2F4F2] px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-[#005235]"
            />
          </div>
          <div>
            <label htmlFor="admin-schedule-end-time" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">
              END TIME
            </label>
            <input
              id="admin-schedule-end-time"
              type="time"
              {...form.register("endTime")}
              className="w-full rounded-xl border-none bg-[#F2F4F2] px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-[#005235]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">SLOT DURATION</label>
          <select
            {...form.register("slotDurationMinutes")}
            className="w-full appearance-none rounded-xl border-none bg-[#F2F4F2] px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-[#005235]"
          >
            {SLOT_OPTIONS.map((slot) => (
              <option key={slot} value={slot}>{`${slot} Minutes`}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-4 font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined">add</span>
            {editingId ? "Save Rule" : "Add Rule"}
          </button>

          <button
            type="button"
            onClick={resetDraft}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#E53935] px-6 py-4 font-bold text-white transition-all hover:brightness-95"
          >
            <span className="material-symbols-outlined">delete_sweep</span>
            Clear All Drafts
          </button>
        </div>
      </form>
    </div>
  );
}
