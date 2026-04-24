import jsPDF from 'jspdf';
import { saveFile } from './downloadHelper';
import { Project, WorkEntry } from '../types';

async function loadLogoBase64(): Promise<string> {
  const res = await fetch('/stemma-repubblica-italiana-seeklogo.png');
  if (!res.ok) throw new Error('logo not found');
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return `data:image/png;base64,${btoa(binary)}`;
}

// A4 landscape: 297 x 210 mm
const PW = 297;
const PH = 210;
const MARGIN = 15;
const CONTENT_W = PW - MARGIN * 2;
const COL_L = MARGIN;
const COL_R = MARGIN + CONTENT_W / 2 + 4;
const COL_W = CONTENT_W / 2 - 4;

function addPageHeader(doc: jsPDF, project: Project, pageNum: number, totalPages: number, logo?: string) {
  const H = 22;
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, PW, H, 'F');

  if (logo) {
    const lh = 10;
    doc.addImage(logo, 'PNG', PW / 2 - lh / 2, 1, lh, lh);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('GIORNALE DEI LAVORI', PW / 2, logo ? 14.5 : 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(project.name, MARGIN, H / 2 + 1);
  doc.text(`Pag. ${pageNum} / ${totalPages}`, PW - MARGIN, H / 2 + 1, { align: 'right' });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(0, H, PW, H);
}

function addPageFooter(doc: jsPDF, project: Project) {
  const SIG_Y = PH - 22;
  const SIG_W = 60;
  const SIG_H = 14;
  const colCX = PW / 2 - SIG_W / 2;
  const colRX = PW - MARGIN - SIG_W;

  const boxes: [string, number][] = [
    ['Ditta', MARGIN],
    ['Assistente di Cantiere', colCX],
    ['Il Direttore dei Lavori', colRX],
  ];

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);

  boxes.forEach(([label, x]) => {
    doc.rect(x, SIG_Y, SIG_W, SIG_H);
    doc.text(label, x + SIG_W / 2, SIG_Y + 3.5, { align: 'center' });
    doc.setDrawColor(210, 210, 210);
    doc.line(x + 4, SIG_Y + SIG_H - 3, x + SIG_W - 4, SIG_Y + SIG_H - 3);
    doc.setDrawColor(180, 180, 180);
  });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PH - 6, PW - MARGIN, PH - 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(150, 150, 150);
  doc.text(`${project.name} — ${project.location}`, MARGIN, PH - 2);
  doc.text(`Stampato il ${new Date().toLocaleDateString('it-IT')}`, PW - MARGIN, PH - 2, { align: 'right' });
}

function sectionTitle(doc: jsPDF, label: string, x: number, y: number, w: number): number {
  doc.setFillColor(241, 245, 249);
  doc.rect(x, y, w, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(label.toUpperCase(), x + 2, y + 3.8);
  return y + 6.5;
}

function textBlock(doc: jsPDF, text: string, x: number, y: number, w: number, lineH = 4): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  const lines = doc.splitTextToSize(text, w - 4);
  doc.text(lines, x + 2, y + 3.5);
  return y + lines.length * lineH + 2;
}

function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number, w: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(label, x + 2, y + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const lines = doc.splitTextToSize(value, w - 30);
  doc.text(lines, x + 28, y + 3.5);
  return y + lines.length * 4 + 1.5;
}

async function loadImageAsDataUrl(src: string): Promise<{ dataUrl: string; aspect: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ dataUrl: src, aspect: img.naturalWidth / img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

function getImageFormat(dataUrl: string): string {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

export async function exportToPDF(project: Project, entries: WorkEntry[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  let logo: string | undefined;
  try { logo = await loadLogoBase64(); } catch { /* proceed without logo */ }

  // ── Cover page ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PW, PH, 'F');

  doc.setFillColor(59, 130, 246);
  doc.rect(0, PH / 2 - 38, PW, 76, 'F');

  if (logo) {
    doc.addImage(logo, 'PNG', PW / 2 - 12, PH / 2 - 36, 24, 24);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('GIORNALE DEI LAVORI', PW / 2, PH / 2 - 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(219, 234, 254);
  doc.text(project.name, PW / 2, PH / 2 + 10, { align: 'center' });

  const infoY = PH / 2 + 30;
  const col1X = PW / 2 - 70;
  const col2X = PW / 2 + 10;

  const fields: [string, string][] = [
    ['Ubicazione', project.location],
    ['Cliente', project.client],
    ['Contratto', project.contract || '—'],
    ['Importo', project.contractAmount ? `€ ${project.contractAmount}` : '—'],
    ['Inizio lavori', project.startDate ? new Date(project.startDate).toLocaleDateString('it-IT') : '—'],
    ['Fine prevista', project.endDate ? new Date(project.endDate).toLocaleDateString('it-IT') : '—'],
    ['Impresa', project.contractor],
    ['Data stampa', new Date().toLocaleDateString('it-IT')],
  ];

  doc.setFontSize(9);
  fields.forEach(([lbl, val], i) => {
    const col = i % 2 === 0 ? col1X : col2X;
    const row = infoY + Math.floor(i / 2) * 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text(lbl + ':', col, row);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(val || '—', col + 30, row);
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${entries.length} giornate registrate`, PW / 2, PH - 12, { align: 'center' });

  // ── Entry pages ─────────────────────────────────────────────────────────────
  const totalPages = entries.length + 1;

  for (let ei = 0; ei < entries.length; ei++) {
    const entry = entries[ei];
    const photos = entry.photos || [];
    doc.addPage();

    addPageHeader(doc, project, ei + 2, totalPages, logo);
    addPageFooter(doc, project);

    const dateStr = new Date(entry.date).toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    doc.setFillColor(248, 250, 252);
    doc.rect(MARGIN, 25, CONTENT_W, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, 25, CONTENT_W, 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(dateCapitalized, COL_L + 3, 30.5);

    if (entry.weather || entry.temperature) {
      const meteo = [entry.weather, entry.temperature].filter(Boolean).join('  •  ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(meteo, PW - MARGIN - 3, 30.5, { align: 'right' });
    }

    let yL = 36;
    let yR = 36;

    // LEFT: Lavori eseguiti
    yL = sectionTitle(doc, 'Lavori Eseguiti', COL_L, yL, COL_W);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    const wdLines = doc.splitTextToSize(entry.workDescription, COL_W - 4);
    const wdH = wdLines.length * 4 + 4;
    doc.rect(COL_L, yL, COL_W, wdH);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(wdLines, COL_L + 2, yL + 3.5);
    yL += wdH + 4;

    if (entry.workers.length > 0) {
      yL = sectionTitle(doc, 'Manodopera', COL_L, yL, COL_W);
      entry.workers.forEach(w => {
        const tag = w.attendance === 'mezza' ? 'Mezza g.' : 'Intera g.';
        const line = `${w.name}${w.role ? '  —  ' + w.role : ''}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(55, 65, 81);
        doc.text(doc.splitTextToSize(line, COL_W - 28), COL_L + 2, yL + 3.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(59, 130, 246);
        doc.text(tag, COL_L + COL_W - 2, yL + 3.5, { align: 'right' });
        yL += 5.5;
      });
      yL += 2;
    }

    if (entry.materials.length > 0) {
      yL = sectionTitle(doc, 'Materiali Utilizzati', COL_L, yL, COL_W);
      entry.materials.forEach(m => {
        const qty = m.quantity ? `${m.quantity} ${m.unit}` : '';
        const sup = m.supplier ? ` (${m.supplier})` : '';
        yL = labelValue(doc, m.name, `${qty}${sup}` || '—', COL_L, yL, COL_W);
      });
      yL += 2;
    }

    if (entry.equipment.length > 0) {
      yL = sectionTitle(doc, 'Mezzi e Attrezzature', COL_L, yL, COL_W);
      entry.equipment.forEach(eq => {
        const hrs = eq.hours && eq.hours > 0 ? `${eq.hours}h` : '';
        const detail = [hrs, eq.notes].filter(Boolean).join(' — ') || '—';
        yL = labelValue(doc, eq.name, detail, COL_L, yL, COL_W);
      });
      yL += 2;
    }

    // RIGHT: Safety, notes, photos
    if (entry.safetyNotes) {
      yR = sectionTitle(doc, 'Note sulla Sicurezza', COL_R, yR, COL_W);
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.2);
      const snLines = doc.splitTextToSize(entry.safetyNotes, COL_W - 4);
      const snH = snLines.length * 4 + 4;
      doc.rect(COL_R, yR, COL_W, snH);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(1.5);
      doc.line(COL_R, yR, COL_R, yR + snH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 80, 0);
      doc.text(snLines, COL_R + 3, yR + 3.5);
      yR += snH + 4;
    }

    if (entry.additionalNotes) {
      yR = sectionTitle(doc, 'Note Aggiuntive', COL_R, yR, COL_W);
      yR = textBlock(doc, entry.additionalNotes, COL_R, yR, COL_W);
      yR += 2;
    }

    if (photos.length > 0) {
      yR = sectionTitle(doc, `Foto (${photos.length})`, COL_R, yR, COL_W);
      const maxPhotoH = PH - yR - 14;
      const photoRowH = Math.min(maxPhotoH, 50);
      const photoW = (COL_W - (photos.length - 1) * 2) / photos.length;

      for (let pi = 0; pi < photos.length; pi++) {
        try {
          const { dataUrl, aspect } = await loadImageAsDataUrl(photos[pi]);
          const fitW = Math.min(photoW, photoRowH * aspect);
          const fitH = fitW / aspect;
          const px = COL_R + pi * (photoW + 2) + (photoW - fitW) / 2;
          const py = yR + (photoRowH - fitH) / 2;
          const fmt = getImageFormat(dataUrl);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.rect(COL_R + pi * (photoW + 2), yR, photoW, photoRowH);
          doc.addImage(dataUrl, fmt, px, py, fitW, fitH);
        } catch {
          // skip broken image
        }
      }
      yR += photoRowH + 3;
    }
  }

  const blob = doc.output('blob') as Blob;
  const filename = `Giornale_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  await saveFile(new Blob([blob], { type: 'application/pdf' }), filename);
}
