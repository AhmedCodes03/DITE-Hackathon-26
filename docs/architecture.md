# Architecture Notes (Single Doctor)

This project is intentionally scoped to **one doctor only**: **Dr. XYZ (Radiologist)**.

## Core Boundaries

- Frontend: public brand website + authenticated patient/admin app areas.
- Backend: role-based API (`admin`, `patient`) with single-doctor appointment logic.
- Shared package: cross-app constants and shared schemas.

## Backend Modules

- `auth`
- `patients`
- `appointments`
- `availability`
- `admin`
- `doctor-profile`

## Core Models

- `User`
- `PatientProfile`
- `DoctorProfile` (single global document)
- `Availability`
- `Appointment`

## API Versioning

- Base path: `/api/v1`
