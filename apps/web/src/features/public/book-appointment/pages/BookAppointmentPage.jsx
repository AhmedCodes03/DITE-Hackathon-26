import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "../../../../components/common/Seo";
import { LoadingState } from "../../../../components/common/LoadingState";
import { ErrorState } from "../../../../components/common/ErrorState";
import { availabilityApi } from "../../../appointments/api/availability.api";
import { appointmentsApi } from "../../../appointments/api/appointments.api";
import { doctorsApi } from "../../../doctors/api/doctors.api";
import { doctorProfileApi } from "../../../doctor-profile/api/doctor-profile.api";
import { usePublicReveal } from "../../animations/usePublicReveal";
import { formatTime } from "../../../../utils/helpers";
import { BookingFiltersPanel } from "../components/BookingFiltersPanel";
import { BookingModal } from "../components/BookingModal";
import { DoctorCard, fallbackDoctorCard } from "../components/DoctorCard";
import {
  addDays,
  buildWeekCells,
  findNextSelectableDate,
  findPrevSelectableDate,
  getTodayISOInPk,
  parseIsoDate,
  splitSlots,
  weekdayFromIso
} from "../utils/bookingDateUtils";

export default function BookAppointmentPage({ redirectOnCloseTo = "/", redirectOnSuccessTo = "/" } = {}) {
  usePublicReveal();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const minDateIso = getTodayISOInPk();

  const urlDoctorId = searchParams.get("doctorId") || "";
  const [selectedDoctorId, setSelectedDoctorId] = useState(urlDoctorId);
  const [appointmentDate, setAppointmentDate] = useState(minDateIso);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visitNotes, setVisitNotes] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  // Fetch all approved doctors
  const {
    data: doctorsList = [],
    isLoading: doctorsLoading
  } = useQuery({
    queryKey: ["public-doctors-list"],
    queryFn: async () => {
      const response = await doctorsApi.listDoctors();
      return response.success ? response.data : [];
    }
  });

  const {
    data: legacyDoctorProfileEnvelope
  } = useQuery({
    queryKey: ["doctor-profile-booking-public"],
    queryFn: async () => {
      const response = await doctorProfileApi.getDoctorProfile();
      return response.data?.data ?? response.data;
    }
  });

  const doctorCards = useMemo(() => {
    const defaultList = [
      {
        id: "doc-adnan",
        _id: "doc-adnan",
        name: "Dr. Adnan Khan",
        specialty: "Consultant Radiologist",
        rating: "4.9",
        reviews: "142",
        tags: ["Advanced Radiology Center", "12+ Yrs Exp", "PKR 3000"],
        location: "Gulberg III, Lahore",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "doc-sara",
        _id: "doc-sara",
        name: "Dr. Sara Ahmed",
        specialty: "Cardiologist",
        rating: "4.9",
        reviews: "98",
        tags: ["Heart Care Clinic", "10+ Yrs Exp", "PKR 2500"],
        location: "DHA Phase 5, Karachi",
        image: "https://images.unsplash.com/photo-1594824813589-9a7065e94b29?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "doc-zain",
        _id: "doc-zain",
        name: "Dr. Zain Malik",
        specialty: "General Physician",
        rating: "4.8",
        reviews: "86",
        tags: ["Family Health Center", "8+ Yrs Exp", "PKR 1500"],
        location: "F-10 Markaz, Islamabad",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "doc-nadia",
        _id: "doc-nadia",
        name: "Dr. Nadia Hussain",
        specialty: "Dermatologist",
        rating: "4.9",
        reviews: "115",
        tags: ["Glow Skin Clinic", "7+ Yrs Exp", "PKR 2200"],
        location: "Johar Town, Lahore",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "doc-tariq",
        _id: "doc-tariq",
        name: "Dr. Tariq Mahmood",
        specialty: "Orthopedic Surgeon",
        rating: "4.9",
        reviews: "130",
        tags: ["Bone & Joint Care", "14+ Yrs Exp", "PKR 3000"],
        location: "Blue Area, Islamabad",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80"
      }
    ];

    if (doctorsList.length > 0) {
      const mappedApi = doctorsList.map((doc) => ({
        id: doc._id,
        _id: doc._id,
        name: doc.doctorName,
        specialty: doc.specialty,
        rating: "4.9",
        reviews: "110",
        tags: [doc.clinicName || "Clinic", `${doc.experienceYears || 5}+ Yrs Exp`, `PKR ${doc.consultationFee || 2000}`],
        location: doc.clinicAddress || "Central Medical Clinic",
        image:
          doc.photoUrl ||
          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
      }));

      // Overlay API records over defaults where matching, and append others
      for (const def of defaultList) {
        if (!mappedApi.some((a) => a.name.toLowerCase() === def.name.toLowerCase())) {
          mappedApi.push(def);
        }
      }
      return mappedApi;
    }

    return defaultList;
  }, [doctorsList]);

  const selectedDoctor = useMemo(() => {
    if (!doctorCards.length) return null;
    if (!selectedDoctorId) return doctorCards[0];
    return doctorCards.find((d) => d.id === selectedDoctorId) || doctorCards[0];
  }, [doctorCards, selectedDoctorId]);

  // If URL specified doctorId, ensure it's selected
  useEffect(() => {
    if (urlDoctorId && urlDoctorId !== selectedDoctorId) {
      setSelectedDoctorId(urlDoctorId);
    }
  }, [urlDoctorId, selectedDoctorId]);

  // Fetch slots for the selected doctor
  const {
    data: slotsEnvelope,
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots
  } = useQuery({
    queryKey: ["availability-slots-public", selectedDoctor?.id, appointmentDate],
    queryFn: async () => {
      if (selectedDoctor?._id) {
        const response = await doctorsApi.getDoctorSlots(selectedDoctor._id, appointmentDate);
        return response.data ?? response;
      }
      const response = await availabilityApi.getSlots(appointmentDate);
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(appointmentDate && selectedDoctor)
  });

  // Fetch availability rules for the selected doctor
  const { data: availabilityRulesEnvelope } = useQuery({
    queryKey: ["availability-rules-public", selectedDoctor?.id],
    queryFn: async () => {
      if (selectedDoctor?._id) {
        const response = await doctorsApi.getDoctorAvailability(selectedDoctor._id);
        return response.data ?? response;
      }
      const response = await availabilityApi.getAll();
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(selectedDoctor)
  });

  const bookMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await appointmentsApi.book(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability-slots-public"] });
      navigate(redirectOnSuccessTo);
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || "Unable to confirm appointment.";
      setSubmissionError(message);
    }
  });

  const { morning, afternoon } = useMemo(() => splitSlots(slotsEnvelope?.slots || []), [slotsEnvelope]);

  const activeWeekdays = useMemo(() => {
    const items = Array.isArray(availabilityRulesEnvelope) ? availabilityRulesEnvelope : [];
    const activeRules = items.filter((item) => item?.isActive && item?.dayOfWeek);
    return new Set(activeRules.map((item) => String(item.dayOfWeek).toLowerCase()));
  }, [availabilityRulesEnvelope]);

  useEffect(() => {
    if (!activeWeekdays.size) return;
    if (activeWeekdays.has(weekdayFromIso(appointmentDate)) && appointmentDate >= minDateIso) return;
    const nextDate = findNextSelectableDate(appointmentDate, minDateIso, activeWeekdays);
    if (nextDate !== appointmentDate) {
      setAppointmentDate(nextDate);
      setSelectedSlot(null);
    }
  }, [activeWeekdays, appointmentDate, minDateIso]);

  const calendarCells = useMemo(
    () => buildWeekCells(appointmentDate, minDateIso, activeWeekdays),
    [appointmentDate, minDateIso, activeWeekdays]
  );

  const selectedTimeLabel = selectedSlot
    ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`
    : "Select a time slot";

  const canConfirm = Boolean(selectedDoctor && selectedSlot && appointmentDate) && !bookMutation.isPending;

  const handleConfirm = () => {
    setSubmissionError("");
    if (!selectedSlot) {
      setSubmissionError("Please select a slot before confirming.");
      return;
    }

    bookMutation.mutate({
      doctorId: selectedDoctor?._id || selectedDoctor?.id,
      appointmentDate,
      startTime: selectedSlot.startTime,
      reason: `Consultation with ${selectedDoctor?.name || selectedDoctor?.specialty || "Doctor"}`,
      notes: visitNotes
    });
  };

  const renderSlotButton = (slot) => {
    const isSelected = selectedSlot?.startTime === slot.startTime;
    const label = formatTime(slot.startTime);

    return (
      <button
        key={`${slot.startTime}-${slot.endTime}`}
        type="button"
        onClick={() => setSelectedSlot(slot)}
        className={`rounded-xl px-1 py-3 text-sm transition-all ${
          isSelected
            ? "border-2 border-[#005235]/25 bg-[#005235] font-bold text-white"
            : "border border-transparent bg-[#F2F4F2] font-medium text-[#191C1B] hover:border-[#005235]"
        }`}
      >
        {label}
      </button>
    );
  };

  if (doctorsLoading) {
    return <LoadingState label="Loading booking view..." className="m-6" />;
  }

  return (
    <>
      <Seo
        title="Book Appointment | Health Care"
        description="Select your doctor, choose a real-time slot, and confirm your appointment."
        path="/book-appointment"
      />

      <main className="bg-[#F8FAF8] px-4 pb-24 pt-24 sm:px-6 sm:pt-28 md:pt-32">
        <div className="mx-auto w-full max-w-[960px]" data-reveal>
          <div className="mb-12">
            <div className="overflow-x-auto">
              <div className="relative flex min-w-[520px] items-center justify-between">
                <div className="absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-[#ECEEEC]" />
                <div className="absolute left-0 top-1/2 z-0 h-[2px] w-1/2 -translate-y-1/2 bg-[#ACF36E]" />

                {["Select Doctor", "Choose Time", "Confirm"].map((label, index) => (
                  <div key={label} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        index === 0
                          ? "bg-[#005235] text-white"
                          : index === 1
                            ? "bg-[#ACF36E] text-[#285000]"
                            : "bg-[#ECEEEC] text-[#6F7A72]"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`mt-2 hidden font-headline text-xs font-bold uppercase tracking-[0.14em] sm:block ${
                        index === 0 ? "text-[#005235]" : index === 1 ? "text-[#191C1B]" : "text-[#6F7A72]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 items-start gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
            <BookingFiltersPanel
              selectedDoctor={selectedDoctor}
              appointmentDate={appointmentDate}
              minDateIso={minDateIso}
              activeWeekdays={activeWeekdays}
              setAppointmentDate={setAppointmentDate}
              setSelectedSlot={setSelectedSlot}
              setVisitNotes={setVisitNotes}
              getTodayISOInPk={getTodayISOInPk}
              weekdayFromIso={weekdayFromIso}
            />

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-gray-700">
                  Select a Doctor ({doctorCards.length} Available)
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {doctorCards.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={(selectedDoctorId || doctorCards[0]?.id) === doctor.id}
                    onSelect={() => {
                      setSelectedDoctorId(doctor.id);
                      setSelectedSlot(null);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BookingModal
        navigate={navigate}
        redirectOnCloseTo={redirectOnCloseTo}
        appointmentDate={appointmentDate}
        minDateIso={minDateIso}
        activeWeekdays={activeWeekdays}
        setAppointmentDate={setAppointmentDate}
        setSelectedSlot={setSelectedSlot}
        calendarCells={calendarCells}
        parseIsoDate={parseIsoDate}
        addDays={addDays}
        findPrevSelectableDate={findPrevSelectableDate}
        findNextSelectableDate={findNextSelectableDate}
        slotsLoading={slotsLoading}
        slotsError={slotsError}
        refetchSlots={refetchSlots}
        morning={morning}
        afternoon={afternoon}
        renderSlotButton={renderSlotButton}
        selectedDoctor={selectedDoctor}
        selectedTimeLabel={selectedTimeLabel}
        visitNotes={visitNotes}
        setVisitNotes={setVisitNotes}
        submissionError={submissionError}
        canConfirm={canConfirm}
        handleConfirm={handleConfirm}
        bookMutation={bookMutation}
      />
    </>
  );
}
