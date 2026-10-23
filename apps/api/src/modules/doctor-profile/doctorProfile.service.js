import DoctorProfile from "../../models/doctorProfile.model.js";
import { ApiError } from "../../utils/ApiError.js";

function toPublicDoctorProfile(profile) {
  if (!profile) return profile;

  const plain = typeof profile.toObject === "function" ? profile.toObject() : { ...profile };
  delete plain.__v;
  return plain;
}

export async function getDoctorProfile() {
  let profile = await DoctorProfile.findOne();

  if (!profile) {
    profile = await DoctorProfile.create({
      doctorName: "Dr. Adnan Khan",
      specialty: "Consultant Radiologist",
      title: "Consultant Radiologist",
      bio: "Experienced consultant radiologist specializing in high-resolution diagnostic imaging, ultrasound, MRI, and patient-centered diagnostic insights.",
      introText: "Dr. Adnan Khan is a dedicated consultant radiologist committed to providing precise diagnostic imaging services with a focus on patient comfort, clarity, and rapid diagnosis.",
      aboutText: "With over 10 years of experience in clinical radiology, Dr. Adnan Khan provides comprehensive consultation across ultrasound, MRI, CT scanning, and digital X-ray interpretation. His patient-centered approach ensures that every individual receives clear explanations, compassionate guidance, and accurate diagnostic results.",
      experienceYears: 10,
      qualifications: ["MBBS", "FCPS (Radiology)"],
      clinicName: "Advanced Radiology & Diagnostic Center",
      clinicAddress: "Gulberg III, Lahore, Pakistan",
      contactPhone: "+92 300 1234567",
      contactEmail: "contact@adnanradiology.com",
      heroHeadline: "Precision in Radiology. Confidence in Care.",
      heroSubtext: "Book your consultation with Dr. Adnan Khan for expert diagnostic imaging and radiology care.",
      bookingEnabled: true
    });
  } else if (profile.doctorName === "Dr. XYZ" || profile.clinicName?.includes("XYZ")) {
    await DoctorProfile.updateOne(
      { _id: profile._id },
      {
        $set: {
          doctorName: "Dr. Adnan Khan",
          specialty: "Consultant Radiologist",
          title: "Consultant Radiologist",
          clinicName: "Advanced Radiology & Diagnostic Center",
          clinicAddress: profile.clinicAddress && !profile.clinicAddress.includes("XYZ") ? profile.clinicAddress : "Gulberg III, Lahore, Pakistan",
          contactPhone: "+92 300 1234567",
          contactEmail: "contact@adnanradiology.com",
          experienceYears: 10,
          qualifications: ["MBBS", "FCPS (Radiology)"],
          introText: "Dr. Adnan Khan is a dedicated consultant radiologist committed to providing precise diagnostic imaging services with a focus on patient comfort and clarity.",
          aboutText: "With over 10 years of experience in clinical radiology, Dr. Adnan Khan provides comprehensive consultation and imaging-focused guidance with a patient-centered approach.",
          heroSubtext: "Book your consultation with Dr. Adnan Khan for expert diagnostic imaging and radiology care."
        }
      }
    );
    profile = await DoctorProfile.findById(profile._id);
  }

  return toPublicDoctorProfile(profile);
}

export async function updateDoctorProfile(updates) {
  const allowedFields = [
    "doctorName",
    "specialty",
    "title",
    "bio",
    "introText",
    "aboutText",
    "experienceYears",
    "qualifications",
    "clinicName",
    "clinicAddress",
    "contactPhone",
    "contactEmail",
    "heroHeadline",
    "heroSubtext",
    "photoUrl",
    "bookingEnabled"
  ];

  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const profile = await DoctorProfile.findOneAndUpdate({}, filteredUpdates, {
    new: true,
    upsert: true,
    runValidators: true
  });

  return toPublicDoctorProfile(profile);
}

export async function getMyDoctorProfile(userId) {
  let profile = await DoctorProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError("Doctor profile not found", 404);
  }
  return toPublicDoctorProfile(profile);
}

export async function updateMyDoctorProfile(userId, updates) {
  const allowedFields = [
    "doctorName",
    "specialty",
    "title",
    "bio",
    "introText",
    "aboutText",
    "experienceYears",
    "qualifications",
    "clinicName",
    "clinicAddress",
    "contactPhone",
    "contactEmail",
    "consultationFee",
    "consultationDurationMinutes",
    "photoUrl",
    "isAvailable"
  ];

  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const profile = await DoctorProfile.findOneAndUpdate({ userId }, filteredUpdates, {
    new: true,
    runValidators: true
  });

  if (!profile) {
    throw new ApiError("Doctor profile not found", 404);
  }

  return toPublicDoctorProfile(profile);
}
