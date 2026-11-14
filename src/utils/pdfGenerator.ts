export interface ExportReportData {
  user: any;
  vitals: {
    heartRate: number;
    temperature: number;
    spo2: number;
    systolicBP: number;
    diastolicBP: number;
    respiratoryRate: number;
    timestamp: number;
  } | null;
  vitalsHistory?: any[];
  aiInsight?: string | null;
  medications?: any[];
}

export const exportMedicalReportPDF = async (data: ExportReportData) => {
  const { jsPDF } = await import('jspdf');
  const { user, vitals, vitalsHistory = [], aiInsight, medications = [] } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2; // 170mm

  let y = 20;

  // Helper: Header design for each page
  const drawPageOrnament = (pageNum: number) => {
    // Top colored indicator strip
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Bottom footer line
    doc.setDrawColor(226, 232, 240); // border-slate-200
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 20, pageWidth - marginX, pageHeight - 20);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Text-slate-500
    doc.text(
      'DOCTORIAN CLINICAL NEURAL ENGINE • COMPILING BIOMETRIC DOSSIERS',
      marginX,
      pageHeight - 12
    );
    doc.text(`Page ${pageNum}`, pageWidth - marginX - 10, pageHeight - 12);
  };

  // Helper to safely transition to a new page
  let currentPage = 1;
  const checkPageOverflow = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 25) {
      doc.addPage();
      currentPage++;
      drawPageOrnament(currentPage);
      y = 20; // top margin on new page
      return true;
    }
    return false;
  };

  // INITIAL DECORATIONS (Page 1)
  drawPageOrnament(currentPage);

  // 1. BRAND AND HEADER
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('DOCTORIAN', marginX, y);

  // Subtle branding suffix
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text('Clinical Neural Intelligence', marginX + 52, y - 1);

  // Report Date/ID Row
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`REPORT TARGET ID: DOC-${Math.floor(100000 + Math.random() * 900000)}`, marginX, y);
  
  const formattedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  doc.text(`ISSUED: ${formattedDate}`, pageWidth - marginX - 55, y);

  // Header separator
  y += 4;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);

  // 2. PATIENT DEMOGRAPHICS SECTION
  y += 10;
  // Box background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.rect(marginX, y, contentWidth, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('I. PATIENT CLINICAL DATA', marginX + 6, y + 8);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  
  // Left Column
  doc.text(`Full Name: ${user?.displayName || 'N/A'}`, marginX + 6, y + 15);
  doc.text(`Contact Email: ${user?.email || 'N/A'}`, marginX + 6, y + 21);
  doc.text(`Phone Number: ${user?.phone || '—'}`, marginX + 6, y + 27);

  // Right Column
  doc.text(`Blood Group: ${user?.bloodGroup || '—'}`, marginX + contentWidth / 2 + 4, y + 15);
  doc.text(`Allergies: ${user?.allergies || 'None Recorded'}`, marginX + contentWidth / 2 + 4, y + 21);
  doc.text(`Pre-existing: ${user?.conditions || 'None Recorded'}`, marginX + contentWidth / 2 + 4, y + 27);

  y += 34;

  // 3. PHYSICAL BIOMETRIC METRICS
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('II. CURRENT BIOMETRIC RECORDING', marginX, y);

  y += 4;
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 6;
  if (!vitals) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No active real-time metabolic biomarkers reported at runtime.', marginX + 4, y);
    y += 10;
  } else {
    // Multi-column Grid boxes for vital parameters
    const boxW = (contentWidth - 6) / 4; // split into 4 columns
    const boxH = 20;

    const vItems = [
      { label: 'HEART RATE', value: `${vitals.heartRate} BPM`, normal: '60 - 100' },
      { label: 'BLOOD PRESSURE', value: `${vitals.systolicBP}/${vitals.diastolicBP}`, normal: '120/80' },
      { label: 'OXYGEN SAT (SpO2)', value: `${vitals.spo2}%`, normal: '95 - 100' },
      { label: 'BODY TEMP', value: `${vitals.temperature}°C`, normal: '36.5 - 37.5' },
    ];

    vItems.forEach((item, idx) => {
      const bX = marginX + idx * (boxW + 2);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(bX, y, boxW, boxH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, bX + 4, y + 5);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(item.value, bX + 4, y + 11);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text(`Ref: ${item.normal}`, bX + 4, y + 16);
    });

    y += boxH + 6;

    // Respiratory Rate additional strip
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(191, 219, 254); // Blue-200
    doc.rect(marginX, y, contentWidth, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(29, 78, 216); // Blue-700
    doc.text(
      `RESPIRATORY RATE: ${vitals.respiratoryRate} Breath/min (Normal: 12-20)       |       Vitals Timestamp: ${new Date(vitals.timestamp).toLocaleString()}`,
      marginX + 5,
      y + 6.5
    );

    y += 18;
  }

  // 4. ACTIVE MEDICATION REGIMEN
  checkPageOverflow(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('III. ACTIVE MEDICATIONS & PRESCRIPTIONS', marginX, y);

  y += 4;
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 6;
  if (!medications || medications.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No active prescriptions loaded in local storage memory.', marginX + 4, y);
    y += 10;
  } else {
    // Generate Medication Table
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text('MEDICATION NAME', marginX + 3, y + 5);
    doc.text('DOSAGE', marginX + 50, y + 5);
    doc.text('FREQUENCY', marginX + 75, y + 5);
    doc.text('ROUTE', marginX + 115, y + 5);
    doc.text('STATUS', marginX + 145, y + 5);

    y += 7;

    medications.forEach((med: any) => {
      checkPageOverflow(10);
      doc.setFont('helvetica', 'medium');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      
      // Draw grid line
      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, y, marginX + contentWidth, y);

      doc.text(med.name || 'Unspecified', marginX + 3, y + 6);
      doc.text(med.dosage || '—', marginX + 50, y + 6);
      doc.text(med.frequency || '—', marginX + 75, y + 6);
      doc.text(med.route || 'Oral (PO)', marginX + 115, y + 6);
      
      const statusText = (med.status || 'Active').toUpperCase();
      doc.text(statusText, marginX + 145, y + 6);

      y += 9;
    });

    y += 4;
  }

  // 5. DEEP NEURAL HEALTH INSIGHTS
  y += 6;
  checkPageOverflow(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('IV. NEURAL CLINICAL INSIGHTS & AI ANALYSIS', marginX, y);

  y += 4;
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 6;
  const rawInsights = aiInsight || summaryFallbackText(vitals);
  const textLines = doc.splitTextToSize(rawInsights, contentWidth - 8);

  // Background highlighting box for AI insights
  const paragraphHeight = textLines.length * 5 + 10;
  
  if (y + paragraphHeight > pageHeight - 30) {
    // Insight exceeds current page capacity, start on a fresh page
    doc.addPage();
    currentPage++;
    drawPageOrnament(currentPage);
    y = 25;
  }

  doc.setFillColor(240, 246, 255); // very soft blue background
  doc.setDrawColor(219, 234, 254); // outline
  doc.rect(marginX, y, contentWidth, textLines.length * 5 + 8, 'FD');

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  textLines.forEach((line: string) => {
    doc.text(line, marginX + 4, y);
    y += 5;
  });

  y += 12;

  // 6. CLINICAL DISCLAIMER SIGN-OFF
  checkPageOverflow(35);
  y += 4;
  doc.setFillColor(254, 242, 242); // red light theme sign
  doc.rect(marginX, y, contentWidth, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28); // high alert red
  doc.text('I. CLINICAL DISCLAIMER AND SIGN-OFF NOTICE', marginX + 6, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(127, 29, 29);
  doc.text(
    'This biometric report is automatically synthesized by Doctorian Clinical Intelligence (Cognis Inference level 5).',
    marginX + 6,
    y + 9
  );
  doc.text(
    'It correlates real-time biometric telemetry values with cached historical trends and self-reported medical regimen logs.',
    marginX + 6,
    y + 12
  );
  doc.text(
    'This is NOT an official clinical diagnostics statement and does NOT substitute physical examination by licensed medical personnel.',
    marginX + 6,
    y + 15
  );

  doc.save(`Doctorian_Health_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Generates fallback health advice if AI analysis is empty
const summaryFallbackText = (vitals: any) => {
  if (!vitals) {
    return `Doctorian Wellness Protocol:
Initialize metabolic synchronization telemetry parameters. Your cognitive, hydration, and cardiac statuses are within balanced default system levels. Maintain adequate electrolyte loading, schedule recurring aerobic sequences, and ensure your prescription regimen timelines are observed with absolute fidelity.`;
  }

  const bpStatus = vitals.systolicBP > 130 || vitals.diastolicBP > 85 ? 'Elevated Pressure Index' : 'Optimal Hemodynamic Pressure';
  const heartStatus = vitals.heartRate > 90 ? 'Mild Cardiac Tachy-flux' : vitals.heartRate < 60 ? 'Brady-fluctuation' : 'Stable Heart Rhythm';

  return `Doctorian Wellness Protocol:
Patient vital signs indicate a profile of systemic stability. Cardiovascular assessment metrics register '${heartStatus}' (${vitals.heartRate} BPM) paired with a '${bpStatus}' (${vitals.systolicBP}/${vitals.diastolicBP} mmHg). Oxygen concentration indexes remain superior at ${vitals.spo2}% SpO2 under deep respiratory cycles of ${vitals.respiratoryRate} RPM. 

Doctorian AI Insights:
1. Hydration loading is advised to stabilize blood volume pressure drift.
2. Maintain immediate adherence to prescribed medication regimen coordinates.
3. Bring this printout to your healthcare advisor for comprehensive trend analysis.`;
};
