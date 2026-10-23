import { useEffect } from "react";
import FocusTrap from "focus-trap-react";

export function ConfirmationModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  variant = "danger"
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <FocusTrap>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-slide-up"
        >
          <div className="p-6">
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              variant === "danger" ? "bg-red-100" : "bg-primary-100"
            }`}>
              <svg
                className={`h-6 w-6 ${variant === "danger" ? "text-red-600" : "text-primary-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3
              id="confirm-dialog-title"
              className="mt-4 text-center text-lg font-semibold text-slate-900"
            >
              {title}
            </h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              {message}
            </p>
          </div>
          <div className="flex gap-3 border-t border-slate-200 bg-slate-50/50 p-4 rounded-b-2xl">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
