import { formatTime } from "../../utils/helpers";

export function SlotPicker({ slots = [], value, onChange, disabled = false }) {
  if (!slots.length) {
    return (
      <div className="rounded-xl border border-[#D6EEE7] bg-[#EEF1F0] px-4 py-3 text-sm text-[#5A6872]" aria-live="polite">
        No slots available for the selected date. Please try another date.
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Available slots" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {slots.map((slot) => {
        const isSelected = value === slot.startTime;

        return (
          <button
            key={`${slot.startTime}-${slot.endTime}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(slot)}
            className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-150 ${
              isSelected
                ? "border-[#2BA68A] bg-[#2BA68A] text-white shadow-sm"
                : "border-[#D6EEE7] bg-white text-[#5A6872] hover:border-[#2BA68A] hover:bg-[#D6EEE7] hover:text-[#2BA68A]"
            }`}
          >
            {formatTime(slot.startTime)}
          </button>
        );
      })}
    </div>
  );
}
