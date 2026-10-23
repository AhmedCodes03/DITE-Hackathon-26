export function ScheduleRulesList({ rules, form, setEditingId, setDeleteId }) {
  return (
    <div className="rounded-2xl bg-[#F2F4F2] p-5 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#005235]">
        <span className="material-symbols-outlined text-sm">verified</span>
        Active Configuration
      </h3>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule._id}
            role="button"
            tabIndex={0}
            onClick={() => {
              setEditingId(rule._id);
              form.reset({
                dayOfWeek: rule.dayOfWeek,
                startTime: rule.startTime,
                endTime: rule.endTime,
                slotDurationMinutes: rule.slotDurationMinutes,
                breakStartTime: rule.breakStartTime || "",
                breakEndTime: rule.breakEndTime || "",
                isActive: rule.isActive
              });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setEditingId(rule._id);
                form.reset({
                  dayOfWeek: rule.dayOfWeek,
                  startTime: rule.startTime,
                  endTime: rule.endTime,
                  slotDurationMinutes: rule.slotDurationMinutes,
                  breakStartTime: rule.breakStartTime || "",
                  breakEndTime: rule.breakEndTime || "",
                  isActive: rule.isActive
                });
              }
            }}
            className="flex cursor-pointer items-center justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-[#191C1B] capitalize">{rule.dayOfWeek === "weekdays" ? "Standard Weekdays" : rule.dayOfWeek}</p>
              <p className="text-xs text-[#3F4943]">
                {rule.startTime} - {rule.endTime} ({rule.slotDurationMinutes}m slots)
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setDeleteId(rule._id);
              }}
              aria-label={`Delete ${rule.dayOfWeek} rule`}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6F7A72] transition-colors hover:text-[#BA1A1A]"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
