import { useId } from "react";
import { FieldError } from "./FieldError";

export function TextAreaField({
  label,
  registration,
  error,
  rows = 4,
  required,
  placeholder,
  disabled,
  hint
}) {
  const fallbackId = useId();
  const textareaId = registration?.name ? `field-${registration.name}` : fallbackId;

  return (
    <div>
      <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        {...registration}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}
