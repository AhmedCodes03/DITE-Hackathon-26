import * as availabilityService from "../availability/availability.service.js";
import * as doctorProfileService from "../doctor-profile/doctorProfile.service.js";
import DoctorProfile from "../../models/doctorProfile.model.js";

const TOOLS_DEFINITION = [
  {
    type: "function",
    function: {
      name: "get_available_slots",
      description: "Get available appointment time slots for a specific date in YYYY-MM-DD format.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Date in YYYY-MM-DD format (e.g. 2026-10-24)"
          }
        },
        required: ["date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_clinic_details",
      description: "Get information about the clinic, doctor qualifications, specialty, address, phone number, and booking status.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "find_next_available_days",
      description: "Find the next available days that have open appointment slots within the upcoming 7 days.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_available_doctors",
      description: "List all verified and approved doctors with their specialty, clinic, experience, and consultation fee.",
      parameters: {
        type: "object",
        properties: {
          specialty: {
            type: "string",
            description: "Optional specialty to filter by (e.g. Cardiologist, Radiologist, General Physician, Dermatologist, Orthopedic Surgeon)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "recommend_doctor_by_symptoms",
      description: "Analyze patient symptoms, recommend the best matching medical specialist, and provide clinical preparation suggestions.",
      parameters: {
        type: "object",
        properties: {
          symptoms: {
            type: "string",
            description: "The patient's described symptoms (e.g. chest pain, knee swelling, rash, persistent fever)"
          },
          specialty: {
            type: "string",
            description: "Recommended medical specialty based on symptoms (e.g. Cardiologist, Dermatologist, Orthopedic Surgeon, General Physician, Consultant Radiologist)"
          }
        },
        required: ["symptoms", "specialty"]
      }
    }
  }
];

async function executeTool(name, args) {
  if (name === "get_available_slots") {
    const date = args.date || new Date().toISOString().split("T")[0];
    try {
      const data = await availabilityService.getAvailableSlots(date);
      const available = (data.slots || []).filter((s) => s.isAvailable);
      return {
        date,
        totalAvailable: available.length,
        slots: available.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
      };
    } catch (err) {
      return { error: err.message, date, slots: [] };
    }
  }

  if (name === "get_clinic_details") {
    const profile = await doctorProfileService.getDoctorProfile();
    return {
      doctorName: profile?.doctorName || "Doctor",
      specialty: profile?.specialty || "Radiology & General Practice",
      qualifications: profile?.qualifications || ["MBBS", "FCPS"],
      experienceYears: profile?.experienceYears || 10,
      clinicName: profile?.clinicName || "Health Care Clinic",
      clinicAddress: profile?.clinicAddress || "123 Medical Center Way",
      contactPhone: profile?.contactPhone || "+1 (555) 234-5678",
      contactEmail: profile?.contactEmail || "clinic@healthcare.org",
      bookingEnabled: profile?.bookingEnabled ?? true
    };
  }

  if (name === "find_next_available_days") {
    const results = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      try {
        const data = await availabilityService.getAvailableSlots(dateStr);
        const count = (data.slots || []).filter((s) => s.isAvailable).length;
        if (count > 0) {
          results.push({ date: dateStr, availableSlotsCount: count });
        }
      } catch {
        // ignore date error
      }
    }
    return { upcomingAvailableDays: results };
  }

  if (name === "list_available_doctors") {
    const query = { status: "approved", isAvailable: true };
    if (args.specialty) {
      query.specialty = { $regex: args.specialty, $options: "i" };
    }
    const doctors = await DoctorProfile.find(query).select(
      "doctorName specialty clinicName experienceYears consultationFee contactPhone"
    );
    return {
      doctors: doctors.map((d) => ({
        id: d._id.toString(),
        name: d.doctorName,
        specialty: d.specialty,
        clinic: d.clinicName,
        experienceYears: d.experienceYears,
        fee: d.consultationFee
      }))
    };
  }

  if (name === "recommend_doctor_by_symptoms") {
    const query = { status: "approved", isAvailable: true };
    if (args.specialty) {
      query.specialty = { $regex: args.specialty, $options: "i" };
    }
    let doctor = await DoctorProfile.findOne(query);
    if (!doctor) {
      doctor = await DoctorProfile.findOne({ status: "approved" });
    }
    return {
      symptoms: args.symptoms,
      specialty: args.specialty,
      recommendedDoctor: doctor
        ? {
            id: doctor._id.toString(),
            name: doctor.doctorName,
            specialty: doctor.specialty,
            clinic: doctor.clinicName,
            fee: doctor.consultationFee,
            experienceYears: doctor.experienceYears,
            photoUrl: doctor.photoUrl
          }
        : null
    };
  }

  return { error: `Tool ${name} not recognized` };
}

function buildSystemPrompt(profile) {
  const clinic = profile?.clinicName || "Health Care Medical Network";
  const phone = profile?.contactPhone || "the clinic front desk";

  return `You are the empathetic, intelligent AI Medical & Booking Assistant for ${clinic}.
Clinic Contact: ${phone}.

Our Available Specialists:
1. Dr. Sara Ahmed - Senior Consultant Cardiologist (Heart disease, chest pain, palpitations, hypertension, ECG/Echo review)
2. Dr. Tariq Mahmood - Senior Consultant Orthopedic Surgeon (Joint pain, knee/back pain, fractures, arthritis, sports injuries)
3. Dr. Nadia Hussain - Consultant Dermatologist (Skin rashes, acne, itching, eczema, allergies, hair & cosmetic issues)
4. Dr. Adnan Khan - Consultant Radiologist (MRI, CT scans, Ultrasound, X-ray interpretation, diagnostic imaging)
5. Dr. Zain Malik - General Physician & Family Medicine (Fever, flu, cough, stomach pain, weakness, chronic disease checkups)

Your duties:
1. When a patient describes symptoms:
   - Empathize with their discomfort.
   - Provide safe preliminary clinical suggestions (e.g. hydration, rest, avoiding aggravating activities).
   - Infer the appropriate medical specialty.
   - ALWAYS call the "recommend_doctor_by_symptoms" tool with the inferred specialty and symptom summary so the system can attach an interactive booking card.
   - Explain why that specific specialist is recommended for their situation.
2. If the user asks for open slots or timings, use "get_available_slots" or "find_next_available_days".
3. If the user asks for all available specialists, call "list_available_doctors".
4. Keep answers structured, warm, and concise. Use bullet points where appropriate.
5. CRITICAL TRIAGE SAFETY: If the patient describes red-flag or potentially life-threatening symptoms (e.g., severe crushing chest pain, difficulty breathing, sudden face drooping or speech difficulty), immediately advise them to seek emergency services (dial emergency services or go to the nearest emergency room).`;
}

/**
 * Fallback reasoning engine when OPENAI_API_KEY is not yet configured or quota is exceeded.
 */
async function fallbackResponse(messages, profile) {
  const lastMsg = (messages[messages.length - 1]?.content || "").toLowerCase();
  const docName = profile?.doctorName || "the Doctor";

  // 1. Cardiovascular / Heart Symptoms
  if (
    lastMsg.includes("chest") ||
    lastMsg.includes("heart") ||
    lastMsg.includes("palpitation") ||
    lastMsg.includes("breathless") ||
    lastMsg.includes("angina") ||
    lastMsg.includes("blood pressure") ||
    lastMsg.includes("bp") ||
    lastMsg.includes("hypertension")
  ) {
    const doctor = await DoctorProfile.findOne({ specialty: { $regex: "Cardio", $options: "i" } });
    const doctorInfo = doctor
      ? {
          id: doctor._id.toString(),
          name: doctor.doctorName,
          specialty: doctor.specialty,
          clinic: doctor.clinicName,
          fee: doctor.consultationFee
        }
      : {
          id: "doc-sara",
          name: "Dr. Sara Ahmed",
          specialty: "Senior Consultant Cardiologist",
          clinic: "Heart Care Clinic, DHA Phase 5",
          fee: 2500
        };

    return {
      reply: `I understand you are experiencing cardiovascular symptoms. Please take this seriously:

**Clinical Suggestions & Precautions:**
• Sit down, rest in a comfortable upright position, and avoid sudden physical exertion.
• Avoid caffeine, tobacco, or heavy meals while monitoring your heart rate.
• If you have a home BP monitor, record your blood pressure.

⚠️ **Urgent Safety Warning:** If your chest discomfort is severe, radiates to your left arm, neck, or jaw, or is accompanied by cold sweat or shortness of breath, please **seek emergency medical care immediately**.

**Recommended Specialist:**
For a thorough evaluation and ECG/Echocardiography, I recommend scheduling a consultation with **${doctorInfo.name}** (${doctorInfo.specialty}).`,
      recommendedDoctor: doctorInfo
    };
  }

  // 2. Orthopedic / Joint & Bone Symptoms
  if (
    lastMsg.includes("joint") ||
    lastMsg.includes("knee") ||
    lastMsg.includes("back pain") ||
    lastMsg.includes("bone") ||
    lastMsg.includes("spine") ||
    lastMsg.includes("shoulder") ||
    lastMsg.includes("fracture") ||
    lastMsg.includes("sprain") ||
    lastMsg.includes("stiffness") ||
    lastMsg.includes("swelling") ||
    lastMsg.includes("arthritis")
  ) {
    const doctor = await DoctorProfile.findOne({ specialty: { $regex: "Ortho", $options: "i" } });
    const doctorInfo = doctor
      ? {
          id: doctor._id.toString(),
          name: doctor.doctorName,
          specialty: doctor.specialty,
          clinic: doctor.clinicName,
          fee: doctor.consultationFee
        }
      : {
          id: "doc-tariq",
          name: "Dr. Tariq Mahmood",
          specialty: "Senior Consultant Orthopedic Surgeon",
          clinic: "Bone & Joint Care Center, Blue Area",
          fee: 3000
        };

    return {
      reply: `I'm sorry to hear that you are dealing with musculoskeletal pain. Here are preliminary suggestions to help reduce discomfort:

**Self-Care Suggestions:**
• **R.I.C.E. Method:** Rest the affected area, apply an ice pack for 15-20 minutes wrapped in a cloth, and keep the joint elevated if swollen.
• Avoid high-impact movement, heavy lifting, or deep squatting until evaluated.
• Maintain a neutral posture when sitting or resting.

**Recommended Specialist:**
To evaluate for ligament tears, joint degeneration, or disc issues, I recommend a clinical assessment with our orthopedic specialist, **${doctorInfo.name}** (${doctorInfo.specialty}).`,
      recommendedDoctor: doctorInfo
    };
  }

  // 3. Dermatology / Skin, Rash & Allergy Symptoms
  if (
    lastMsg.includes("skin") ||
    lastMsg.includes("rash") ||
    lastMsg.includes("acne") ||
    lastMsg.includes("pimple") ||
    lastMsg.includes("itch") ||
    lastMsg.includes("itching") ||
    lastMsg.includes("eczema") ||
    lastMsg.includes("allergy") ||
    lastMsg.includes("hives") ||
    lastMsg.includes("hair fall") ||
    lastMsg.includes("scalp")
  ) {
    const doctor = await DoctorProfile.findOne({ specialty: { $regex: "Derma", $options: "i" } });
    const doctorInfo = doctor
      ? {
          id: doctor._id.toString(),
          name: doctor.doctorName,
          specialty: doctor.specialty,
          clinic: doctor.clinicName,
          fee: doctor.consultationFee
        }
      : {
          id: "doc-nadia",
          name: "Dr. Nadia Hussain",
          specialty: "Consultant Dermatologist",
          clinic: "Glow Skin & Laser Clinic, Johar Town",
          fee: 2200
        };

    return {
      reply: `Skin irritation and rashes can be uncomfortable. Here are some immediate care tips:

**Skin Care Suggestions:**
• Wash gently with lukewarm water and a fragrance-free, mild cleanser.
• Avoid scratching the area to prevent secondary bacterial infections.
• Do not apply unprescribed steroid creams or harsh scrubs before a doctor inspects the lesion.
• Use a gentle, soothing hypoallergenic moisturizer or cool compress.

**Recommended Specialist:**
For targeted diagnosis (e.g. contact dermatitis, eczema, acne, or fungal infection), I recommend consulting **${doctorInfo.name}** (${doctorInfo.specialty}).`,
      recommendedDoctor: doctorInfo
    };
  }

  // 4. Radiology & Diagnostic Imaging
  if (
    lastMsg.includes("x-ray") ||
    lastMsg.includes("xray") ||
    lastMsg.includes("mri") ||
    lastMsg.includes("ct scan") ||
    lastMsg.includes("scan") ||
    lastMsg.includes("ultrasound") ||
    lastMsg.includes("sonography") ||
    lastMsg.includes("radiolog")
  ) {
    const doctor = await DoctorProfile.findOne({ specialty: { $regex: "Radio", $options: "i" } });
    const doctorInfo = doctor
      ? {
          id: doctor._id.toString(),
          name: doctor.doctorName,
          specialty: doctor.specialty,
          clinic: doctor.clinicName,
          fee: doctor.consultationFee
        }
      : {
          id: "doc-adnan",
          name: "Dr. Adnan Khan",
          specialty: "Consultant Radiologist",
          clinic: "Advanced Radiology & Diagnostic Center",
          fee: 3000
        };

    return {
      reply: `For diagnostic imaging and scan interpretation:

**Imaging Preparation Tips:**
• Bring all previous reports, films, or digital CDs from referring physicians.
• If undergoing an abdominal ultrasound, fast for 6-8 hours beforehand.
• For pelvic ultrasounds, drink 3-4 glasses of water 1 hour prior.

**Recommended Specialist:**
Our senior imaging expert **${doctorInfo.name}** (${doctorInfo.specialty}) provides high-resolution imaging and detailed consultation.`,
      recommendedDoctor: doctorInfo
    };
  }

  // 5. General Medicine / Fever, Cough, Stomach, Fatigue
  if (
    lastMsg.includes("fever") ||
    lastMsg.includes("cough") ||
    lastMsg.includes("cold") ||
    lastMsg.includes("flu") ||
    lastMsg.includes("stomach") ||
    lastMsg.includes("headache") ||
    lastMsg.includes("vomit") ||
    lastMsg.includes("nausea") ||
    lastMsg.includes("diarrhea") ||
    lastMsg.includes("weakness") ||
    lastMsg.includes("fatigue") ||
    lastMsg.includes("pain") ||
    lastMsg.includes("sore throat")
  ) {
    const doctor = await DoctorProfile.findOne({ specialty: { $regex: "General", $options: "i" } });
    const doctorInfo = doctor
      ? {
          id: doctor._id.toString(),
          name: doctor.doctorName,
          specialty: doctor.specialty,
          clinic: doctor.clinicName,
          fee: doctor.consultationFee
        }
      : {
          id: "doc-zain",
          name: "Dr. Zain Malik",
          specialty: "General Physician & Family Medicine",
          clinic: "Family Health Center, F-10 Markaz",
          fee: 1500
        };

    return {
      reply: `I understand you are experiencing discomfort. Here are basic initial wellness measures:

**General Care Suggestions:**
• **Hydration:** Drink plenty of fluids (water, clear broths, or ORS) to prevent dehydration.
• **Rest:** Allow your body adequate sleep and avoid physical strain.
• **Monitoring:** Record your body temperature if running a fever.
• Seek prompt medical evaluation if symptoms worsen, or if high fever persists over 48 hours.

**Recommended Specialist:**
For a comprehensive clinical assessment, I recommend booking with our primary care physician, **${doctorInfo.name}** (${doctorInfo.specialty}).`,
      recommendedDoctor: doctorInfo
    };
  }

  // Check slots
  if (
    lastMsg.includes("slot") ||
    lastMsg.includes("available") ||
    lastMsg.includes("book") ||
    lastMsg.includes("time") ||
    lastMsg.includes("schedule")
  ) {
    const today = new Date().toISOString().split("T")[0];
    const data = await availabilityService.getAvailableSlots(today);
    const available = (data.slots || []).filter((s) => s.isAvailable);

    if (available.length > 0) {
      const slotList = available.slice(0, 6).map((s) => `• ${s.startTime} - ${s.endTime}`).join("\n");
      return {
        reply: `Hello! Here are the open appointment slots available today (${today}):\n${slotList}\n\nWould you like to book one of these times, or choose a different date?`,
        slots: available.slice(0, 6),
        date: today
      };
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return {
      reply: `Slots for today are currently fully booked, but bookings are open for tomorrow (${tomorrow}). Would you like me to check tomorrow's available timings?`,
      date: tomorrow
    };
  }

  // Doctor / Clinic info
  if (lastMsg.includes("doctor") || lastMsg.includes("who") || lastMsg.includes("specialty") || lastMsg.includes("qualif")) {
    return {
      reply: `Our clinic features experienced specialists across cardiology, radiology, orthopedics, dermatology, and family medicine.\n\nTell me about your symptoms or what care you are looking for, and I will recommend the best specialist for your needs!`
    };
  }

  // Address / Location
  if (
    lastMsg.includes("address") ||
    lastMsg.includes("location") ||
    lastMsg.includes("where") ||
    lastMsg.includes("clinic") ||
    lastMsg.includes("phone")
  ) {
    return {
      reply: `📍 **${profile?.clinicName || "Health Care Medical Network"}**\nAddress: ${profile?.clinicAddress || "Central Healthcare Plaza, Lahore / Islamabad / Karachi"}\nPhone: ${profile?.contactPhone || "+92 300 1234567"}\nEmail: ${profile?.contactEmail || "contact@clinic.com"}\n\nFeel free to ask if you would like to book a visit!`
    };
  }

  // Default greeting / help
  return {
    reply: `Hello! 👋 I am your **HealthCare AI Assistant**.\n\nI can help you with:\n• **Symptom Triage & Doctor Recommendation** (e.g. tell me "I have back pain" or "chest tightness")\n• Finding open appointment slots & timings\n• Clinic locations and doctor credentials\n\nHow can I help you today?`
  };
}

export async function processAiMessage({ messages, patientContext }) {
  const profile = await doctorProfileService.getDoctorProfile();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return fallbackResponse(messages, profile);
  }

  try {
    const systemPrompt = buildSystemPrompt(profile);
    const conversation = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-10) // Keep recent turns for context
    ];

    let currentResponse = null;
    let toolResultSlots = [];
    let toolResultDate = null;
    let toolResultDoctor = null;

    // Loop for tool calls (up to 3 turns)
    for (let turn = 0; turn < 3; turn++) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: conversation,
          tools: TOOLS_DEFINITION,
          tool_choice: "auto",
          temperature: 0.5,
          max_tokens: 700
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API call error:", errorText);
        return fallbackResponse(messages, profile);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      if (!message) {
        return fallbackResponse(messages, profile);
      }

      // Check for tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        conversation.push(message);

        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          let fnArgs = {};
          try {
            fnArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            fnArgs = {};
          }

          const result = await executeTool(fnName, fnArgs);

          if (result.slots && Array.isArray(result.slots)) {
            toolResultSlots = result.slots;
            toolResultDate = result.date;
          }

          if (result.recommendedDoctor) {
            toolResultDoctor = result.recommendedDoctor;
          }

          conversation.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
      } else {
        currentResponse = message.content;
        break;
      }
    }

    return {
      reply: currentResponse || "I am here to help. Please let me know your symptoms or preferred consultation time.",
      slots: toolResultSlots.length > 0 ? toolResultSlots : undefined,
      date: toolResultDate || undefined,
      recommendedDoctor: toolResultDoctor || undefined
    };
  } catch (error) {
    console.error("Error in processAiMessage:", error);
    return fallbackResponse(messages, profile);
  }
}
