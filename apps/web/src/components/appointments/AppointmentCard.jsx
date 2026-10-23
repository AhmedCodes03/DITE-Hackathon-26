import { StatusBadge } from "../common/StatusBadge";
import { formatDate, formatTime } from "../../utils/helpers";

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function AppointmentCard({
  item,
  onCancel,
  onReschedule,
  onConfirm,
  onComplete,
  onNoShow,
  isAdmin = false,
  showPatient = true
}) {
  return (
    <div className="group rounded-xl border border-[#D6EEE7] bg-[#F5F0EB] p-5 transition-all duration-200 hover:border-[#2BA68A] hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-[#5A6872]">
            <CalendarIcon />
            <span className="text-sm font-medium text-[#2A2E35]">{formatDate(item.appointmentDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-[#5A6872]">
            <ClockIcon />
            <span className="text-sm font-medium text-[#2A2E35]">
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </span>
          </div>

          {showPatient && item.patient?.fullName && (
            <div className="flex items-center gap-2 text-[#5A6872]">
              <UserIcon />
              <span className="text-sm font-medium text-[#2A2E35]">{item.patient.fullName}</span>
            </div>
          )}

          {item.reason && (
            <p className="text-sm text-[#5A6872] mt-2 pl-7">
              {item.reason}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {(onCancel || onReschedule || onConfirm || onComplete || onNoShow) && (
        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-[#D6EEE7]">
          {isAdmin && onConfirm && item.status === "pending" && (
            <button
              onClick={() => onConfirm(item._id || item.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2BA68A] px-4 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-[#1A7A62]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm
            </button>
          )}
          
          {isAdmin && onComplete && item.status === "confirmed" && (
            <button
              onClick={() => onComplete(item._id || item.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#ADE0D0] px-4 py-2 text-xs font-medium text-[#083831] transition-all duration-150 hover:bg-[#D6EEE7]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark Complete
            </button>
          )}
          
          {isAdmin && onNoShow && item.status === "confirmed" && (
            <button
              onClick={() => onNoShow(item._id || item.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEF1F0] px-4 py-2 text-xs font-medium text-[#5A6872] transition-all duration-150 hover:bg-[#D6EEE7]"
            >
              No Show
            </button>
          )}
          
          {onReschedule && item.status !== "cancelled" && item.status !== "completed" && (
            <button
              onClick={() => onReschedule(item)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6EEE7] bg-white px-4 py-2 text-xs font-medium text-[#5A6872] transition-all duration-150 hover:border-[#2BA68A] hover:text-[#2BA68A]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reschedule
            </button>
          )}
          
          {onCancel && item.status !== "cancelled" && item.status !== "completed" && (
            <button
              onClick={() => onCancel(item)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#FADCD1] bg-white px-4 py-2 text-xs font-medium text-[#E8825A] transition-all duration-150 hover:bg-[#FDF0EB]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
