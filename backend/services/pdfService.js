import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates a clean and professional prescription PDF
 * @param {Object} data - Prescription and metadata details
 * @param {string} outputPath - Relative output path
 */
export const generatePrescriptionPDF = (data, outputPath) => {
  return new Promise((resolve, reject) => {
    // Ensure uploads directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Header: Hospital / Clinic branding
    doc
      .fillColor('#1e40af') // Tailwind blue-800
      .fontSize(24)
      .text('MEDICLINK GENERAL HOSPITAL', { align: 'center', bold: true });
    
    doc
      .fillColor('#4b5563') // Gray-600
      .fontSize(10)
      .text('123 Care Street, Health City, HC 94000', { align: 'center' })
      .text('Phone: +1 (555) 019-2834 | Email: contact@mediclink.com', { align: 'center' });

    doc.moveDown();
    
    // Horizontal rule
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(2);

    // Doctor & Patient Details Grid
    const startY = doc.y;
    
    // Left Column: Doctor Info
    doc
      .fillColor('#374151') // Gray-700
      .fontSize(11)
      .text(`DOCTOR:`, 50, startY, { bold: true })
      .text(`Dr. ${data.doctorName}`)
      .text(`Mediclink Medical Practitioner`);

    // Right Column: Patient Info
    doc
      .text(`PATIENT:`, 320, startY, { bold: true })
      .text(`Name: ${data.patientName}`)
      .text(`Date: ${new Date(data.date).toLocaleDateString()}`);

    doc.moveDown(3);

    // Rx Symbol
    doc
      .fillColor('#1e40af')
      .fontSize(28)
      .text('Rx', 50, doc.y, { bold: true });

    doc.moveDown();

    // Diagnosis Section
    doc
      .fillColor('#111827')
      .fontSize(12)
      .text(`DIAGNOSIS:`, { bold: true })
      .fillColor('#374151')
      .fontSize(11)
      .text(data.diagnosis || 'General Checkup')
      .moveDown();

    // Medicines Section
    doc
      .fillColor('#111827')
      .fontSize(12)
      .text(`PRESCRIBED MEDICINES:`, { bold: true })
      .moveDown(0.5);

    if (data.medicines && data.medicines.length > 0) {
      data.medicines.forEach((med, index) => {
        doc
          .fillColor('#111827')
          .fontSize(11)
          .text(`${index + 1}. ${med.name}`, { bold: true })
          .fillColor('#4b5563')
          .fontSize(10)
          .text(`   Dosage: ${med.dosage}  |  Duration: ${med.duration}  |  Instructions: ${med.instructions || 'As directed'}`)
          .moveDown(0.5);
      });
    } else {
      doc.fontSize(11).text('No medicines prescribed.').moveDown();
    }

    doc.moveDown();

    // Lab Tests Section
    if (data.labTests && data.labTests.length > 0) {
      doc
        .fillColor('#111827')
        .fontSize(12)
        .text(`RECOMMENDED LAB TESTS:`, { bold: true })
        .moveDown(0.5);

      data.labTests.forEach((test) => {
        doc
          .fillColor('#374151')
          .fontSize(10)
          .text(`- ${test}`)
          .moveDown(0.2);
      });
      doc.moveDown();
    }

    // Advice / Remarks
    if (data.advice) {
      doc
        .fillColor('#111827')
        .fontSize(12)
        .text(`ADVICE & REMARKS:`, { bold: true })
        .fillColor('#374151')
        .fontSize(10)
        .text(data.advice)
        .moveDown();
    }

    doc.moveDown(4);

    // Signature Area
    const sigY = doc.y;
    doc
      .strokeColor('#9ca3af')
      .lineWidth(0.5)
      .moveTo(350, sigY)
      .lineTo(520, sigY)
      .stroke();

    doc
      .fillColor('#4b5563')
      .fontSize(9)
      .text('Authorized Signature', 350, sigY + 5, { align: 'center', width: 170 });

    doc.end();

    writeStream.on('finish', () => {
      resolve();
    });

    writeStream.on('error', (error) => {
      reject(error);
    });
  });
};
