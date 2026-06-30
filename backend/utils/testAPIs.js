import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

const logStep = (message) => {
  console.log(`\n\x1b[36m=== ${message} ===\x1b[0m`);
};

const logSuccess = (message, data) => {
  console.log(`\x1b[32m✔ ${message}\x1b[0m`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logError = (message, error) => {
  console.error(`\x1b[31m✘ ${message}\x1b[0m`);
  console.error(error);
};

async function run() {
  try {
    console.log(`Starting API Sample Data Creation and Verification...`);
    console.log(`Targeting backend base URL: ${BASE_URL}`);

    // =========================================================================
    // STEP 1: Admin Login
    // =========================================================================
    logStep('1. Admin Login to retrieve Admin JWT');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hms.com',
        password: 'password123',
      }),
    });

    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok || !adminLoginData.success) {
      throw new Error(`Admin login failed: ${adminLoginData.message}`);
    }
    const adminToken = adminLoginData.token;
    logSuccess('Admin logged in successfully.', { email: adminLoginData.user.email });


    // =========================================================================
    // STEP 2: Create a Specialty via Admin
    // =========================================================================
    logStep('2. Creating a new Specialty (Oncology)');
    const specialtyRes = await fetch(`${BASE_URL}/admin/specialties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Oncology',
        description: 'Prevention, diagnosis, and treatment of cancer.',
        icon: 'ShieldCheckIcon',
      }),
    });

    const specialtyData = await specialtyRes.json();
    if (!specialtyRes.ok || !specialtyData.success) {
      // If it already exists, let's fetch specialties to get the ID
      if (specialtyData.message && specialtyData.message.includes('already exists')) {
        logSuccess('Specialty "Oncology" already exists. Fetching existing specialties...');
      } else {
        throw new Error(`Create specialty failed: ${specialtyData.message}`);
      }
    } else {
      logSuccess('Specialty created successfully.', specialtyData.specialty);
    }

    // Get specialty ID of Oncology
    const getSpecsRes = await fetch(`${BASE_URL}/admin/specialties`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const getSpecsData = await getSpecsRes.json();
    const oncologySpecialty = getSpecsData.specialties.find((s) => s.name === 'Oncology');
    if (!oncologySpecialty) {
      throw new Error('Could not find Oncology specialty in database.');
    }
    const specialtyId = oncologySpecialty._id;
    console.log(`Oncology Specialty ID: ${specialtyId}`);


    // =========================================================================
    // STEP 3: Create a Doctor via Admin
    // =========================================================================
    logStep('3. Creating a new Doctor (Dr. Sarah Jenkins)');
    const doctorRes = await fetch(`${BASE_URL}/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@hms.com',
        password: 'password123',
        phone: '5550192834',
        specialty: specialtyId,
        experience: 15,
        qualification: 'MD, PhD in Oncology',
        biography: 'Dr. Jenkins is an acclaimed Oncologist specializing in immunotherapies.',
        consultationFee: 200,
        availability: [
          { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
          { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        ],
      }),
    });

    const doctorData = await doctorRes.json();
    let doctorId;
    if (!doctorRes.ok || !doctorData.success) {
      if (doctorData.message && doctorData.message.includes('already registered')) {
        logSuccess('Doctor "Dr. Sarah Jenkins" already registered. Fetching existing doctors...');
        const getDocsRes = await fetch(`${BASE_URL}/admin/doctors`, {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        const getDocsData = await getDocsRes.json();
        const existingDoc = getDocsData.doctors.find((d) => d.user && d.user.email === 'sarah.jenkins@hms.com');
        if (!existingDoc) throw new Error('Could not find existing doctor in database.');
        doctorId = existingDoc._id;
      } else {
        throw new Error(`Create doctor failed: ${doctorData.message}`);
      }
    } else {
      doctorId = doctorData.doctor._id;
      logSuccess('Doctor created successfully.', doctorData.doctor);
    }
    console.log(`Doctor ID: ${doctorId}`);


    // =========================================================================
    // STEP 4: Register a new Patient
    // =========================================================================
    logStep('4. Registering a new Patient (Alice Johnson)');
    const patientRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson',
        email: 'alice.johnson@hms.com',
        password: 'password123',
        phone: '5559876543',
        gender: 'Female',
        dateOfBirth: '1995-10-24',
        bloodGroup: 'A+',
        address: '789 Pine Lane, Boston, MA',
      }),
    });

    const patientRegData = await patientRegRes.json();
    let patientToken;
    let patientId;
    if (!patientRegRes.ok || !patientRegData.success) {
      if (patientRegData.message && patientRegData.message.includes('already exists')) {
        logSuccess('Patient already registered. Performing Patient Login to retrieve token...');
        const patientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'alice.johnson@hms.com',
            password: 'password123',
          }),
        });
        const patientLoginData = await patientLoginRes.json();
        if (!patientLoginRes.ok || !patientLoginData.success) {
          throw new Error(`Patient login failed: ${patientLoginData.message}`);
        }
        patientToken = patientLoginData.token;
        patientId = patientLoginData.user.patientId;
      } else {
        throw new Error(`Patient registration failed: ${patientRegData.message}`);
      }
    } else {
      patientToken = patientRegData.token;
      patientId = patientRegData.user.patientId;
      logSuccess('Patient registered successfully.', patientRegData.user);
    }
    console.log(`Patient ID: ${patientId}`);


    // =========================================================================
    // STEP 5: Book an Appointment via Patient
    // =========================================================================
    logStep('5. Patient Booking an Appointment with Dr. Sarah Jenkins');
    
    // Choose a future Thursday date to match Dr. Sarah Jenkins' availability
    const targetDate = new Date();
    // Advance to next Thursday
    while (targetDate.getDay() !== 4) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dateStr = targetDate.toISOString().split('T')[0];
    console.log(`Booking for Thursday date: ${dateStr}`);

    const bookingRes = await fetch(`${BASE_URL}/patient/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: doctorId,
        date: dateStr,
        slot: '10:00',
        reason: 'Discussion of routine scan results.',
      }),
    });

    const bookingData = await bookingRes.json();
    let appointmentId;
    if (!bookingRes.ok || !bookingData.success) {
      if (bookingData.message && bookingData.message.includes('already booked')) {
        logSuccess('This appointment slot was already booked. Fetching patient appointments...');
        const getPatAppsRes = await fetch(`${BASE_URL}/patient/appointments`, {
          headers: { 'Authorization': `Bearer ${patientToken}` },
        });
        const getPatAppsData = await getPatAppsRes.json();
        const existingApp = getPatAppsData.appointments.find((a) => a.doctor && a.doctor._id === doctorId && a.slot === '10:00');
        if (!existingApp) throw new Error('Could not find existing appointment.');
        appointmentId = existingApp._id;
      } else {
        throw new Error(`Booking appointment failed: ${bookingData.message}`);
      }
    } else {
      appointmentId = bookingData.appointment._id;
      logSuccess('Appointment booked successfully.', bookingData.appointment);
    }
    console.log(`Appointment ID: ${appointmentId}`);


    // =========================================================================
    // STEP 6: Doctor Login
    // =========================================================================
    logStep('6. Doctor Login to retrieve Doctor JWT');
    const doctorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.jenkins@hms.com',
        password: 'password123',
      }),
    });

    const doctorLoginData = await doctorLoginRes.json();
    if (!doctorLoginRes.ok || !doctorLoginData.success) {
      throw new Error(`Doctor login failed: ${doctorLoginData.message}`);
    }
    const doctorToken = doctorLoginData.token;
    logSuccess('Doctor logged in successfully.', { email: doctorLoginData.user.email });


    // =========================================================================
    // STEP 7: Confirm Appointment via Doctor
    // =========================================================================
    logStep('7. Doctor confirming the Appointment');
    const confirmRes = await fetch(`${BASE_URL}/doctor/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        status: 'Confirmed',
      }),
    });

    const confirmData = await confirmRes.json();
    if (!confirmRes.ok || !confirmData.success) {
      throw new Error(`Confirm appointment failed: ${confirmData.message}`);
    }
    logSuccess('Appointment confirmed by Doctor.', confirmData.appointment);


    // =========================================================================
    // STEP 8: Write Prescription & Complete Appointment via Doctor
    // =========================================================================
    logStep('8. Doctor writing Prescription (Completes Appointment & Generates PDF)');
    const prescriptionRes = await fetch(`${BASE_URL}/doctor/appointments/${appointmentId}/prescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        diagnosis: 'Healthy recovery, clear scan reports.',
        medicines: [
          { name: 'Multivitamins Forte', dosage: '1-0-0', duration: '15 days', instructions: 'After breakfast' },
          { name: 'Vitamin D3 60K', dosage: 'Once weekly', duration: '4 weeks', instructions: 'With milk at night' },
        ],
        labTests: ['Complete Blood Count (CBC)'],
        advice: 'Continue healthy diets, exercise regularly, and return for a follow-up checkup in 6 months.',
      }),
    });

    const prescriptionData = await prescriptionRes.json();
    if (!prescriptionRes.ok || !prescriptionData.success) {
      throw new Error(`Writing prescription failed: ${prescriptionData.message}`);
    }
    logSuccess('Prescription created successfully and PDF generated.', prescriptionData.prescription);

    console.log(`\n\x1b[32;1m★★★ ALL API END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY! ★★★\x1b[0m`);
    console.log(`Sample data successfully created and saved in the MongoDB database.\n`);
  } catch (error) {
    logError('API Test Execution Failed', error.message);
  }
}

run();
