import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePatientPDF = (patientName, history) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('CogniCare Patient Report', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Patient Name: ${patientName}`, 14, 32);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 40);

  if (!history || history.length === 0) {
    doc.text('No test history available for this patient.', 14, 50);
    doc.save(`${patientName}_Report.pdf`);
    return;
  }

  // Calculate averages
  const avgScore = (history.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0) / history.length).toFixed(1);
  const avgTime = (history.reduce((acc, curr) => acc + curr.averageResponseTime, 0) / history.length).toFixed(1);
  const avgAttn = (history.reduce((acc, curr) => acc + curr.attentionScore, 0) / history.length).toFixed(1);

  doc.text(`Average Score: ${avgScore}%`, 14, 50);
  doc.text(`Average Response Time: ${avgTime}s`, 14, 58);
  doc.text(`Average Attention: ${avgAttn}%`, 14, 66);

  const tableData = history.map(h => {
    const s = ((h.score / h.maxScore) * 100).toFixed(0);
    return [
      `Day ${h.day}`,
      new Date(h.dateTaken).toLocaleDateString(),
      `${s}%`,
      `${h.averageResponseTime?.toFixed(1)}s`,
      `${h.attentionScore}%`,
      s > 80 ? 'Low' : s > 50 ? 'Medium' : 'High'
    ];
  });

  doc.autoTable({
    startY: 75,
    head: [['Day', 'Date', 'Score', 'Response Time', 'Attention', 'Risk Level']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [45, 170, 109] } // CogniCare green theme
  });

  doc.save(`${patientName.replace(/\s+/g, '_')}_Cognitive_Report.pdf`);
};
