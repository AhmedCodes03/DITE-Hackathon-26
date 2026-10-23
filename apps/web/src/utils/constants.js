export const USER_ROLES = {
  ADMIN: "admin",
  PATIENT: "patient"
};

export const APPOINTMENT_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show"
};

export const APPOINTMENT_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No Show"
};

export const APPOINTMENT_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  no_show: "bg-gray-100 text-gray-800"
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "dr_xyz_auth_token",
  AUTH_REFRESH_TOKEN: "dr_xyz_auth_refresh_token",
  AUTH_USER: "dr_xyz_auth_user",
  APPOINTMENT_DRAFT: "dr_xyz_appointment_draft"
};

export const API_MODES = {
  API: "api",
  MOCK: "mock",
  HYBRID: "hybrid"
};

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];

export const DAY_OF_WEEK_OPTIONS = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" }
];
