import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from 'docx';
import { Project, WorkEntry } from '../types';
import { saveFile } from './downloadHelper';

const BLUE = '1E2937';
const LIGHT_BLUE = '3B82F6';
const GRAY = '64748B';
const LIGHT_GRAY = 'F1F5F9';
const WHITE = 'FFFFFF';
const AMBER = '92400E';
const AMBER_BG = 'FFFBEB';

async function fetchLogoArrayBuffer(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch('/stemma-repubblica-italiana-seeklogo.png');
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Data URL non valido');
  const binary = atob(base64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

function getImageType(dataUrl: string): 'png' | 'jpg' | 'gif' {
  if (dataUrl.startsWith('data:image/png')) return 'png';
  if (dataUrl.startsWith('data:image/gif')) return 'gif';
  return 'jpg';
}

async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = dataUrl;
  });
}

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
    insideHorizontal: { style: BorderStyle.NONE, size: 0 },
    insideVertical: { style: BorderStyle.NONE, size: 0 },
  };
}

function thinBorder() {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' };
  return { top: b, bottom: b, left: b, right: b };
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 18, color: GRAY, font: 'Calibri' })],
    spacing: { before: 120, after: 40 },
    shading: { type: ShadingType.CLEAR, fill: LIGHT_GRAY },
    indent: { left: convertInchesToTwip(0.05), right: convertInchesToTwip(0.05) },
  });
}

function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: '374151', font: 'Calibri' })],
    spacing: { before: 40, after: 40 },
  });
}

function kvRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: GRAY, font: 'Calibri' })] })],
        width: { size: 25, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
        shading: { type: ShadingType.CLEAR, fill: LIGHT_GRAY },
        margins: { top: 60, bottom: 60, left: 120, right: 60 },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: value || '—', size: 18, color: BLUE, font: 'Calibri' })] })],
        width: { size: 75, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
        margins: { top: 60, bottom: 60, left: 120, right: 60 },
      }),
    ],
  });
}

export async function exportToWord(project: Project, entries: WorkEntry[]) {
  const logoBuffer = await fetchLogoArrayBuffer();

  const logoChildren: (Paragraph | Table)[] = [];
  if (logoBuffer) {
    logoChildren.push(
      new Paragraph({
        children: [
          new ImageRun({ data: logoBuffer, transformation: { width: 60, height: 60 }, type: 'png' }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
      })
    );
  }

  const coverChildren: (Paragraph | Table)[] = [
    ...logoChildren,
    new Paragraph({
      children: [new TextRun({ text: 'GIORNALE DEI LAVORI', bold: true, size: 48, color: WHITE, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      shading: { type: ShadingType.CLEAR, fill: LIGHT_BLUE },
    }),
    new Paragraph({
      children: [new TextRun({ text: project.name, size: 32, color: BLUE, font: 'Calibri', bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder(),
      rows: [
        kvRow('Ubicazione', project.location),
        kvRow('Cliente', project.client),
        kvRow('Contratto', project.contract || '—'),
        kvRow('Importo', project.contractAmount ? `€ ${project.contractAmount}` : '—'),
        kvRow('Inizio lavori', project.startDate ? new Date(project.startDate).toLocaleDateString('it-IT') : '—'),
        kvRow('Fine prevista', project.endDate ? new Date(project.endDate).toLocaleDateString('it-IT') : '—'),
        kvRow('Impresa', project.contractor),
        kvRow('Data stampa', new Date().toLocaleDateString('it-IT')),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: `${entries.length} ${entries.length !== 1 ? 'giornate registrate' : 'giornata registrata'}`, size: 18, color: GRAY, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
  ];

  const entryChildren: (Paragraph | Table)[] = [];

  for (let ei = 0; ei < entries.length; ei++) {
    const entry = entries[ei];

    entryChildren.push(new Paragraph({ children: [], pageBreakBefore: true }));

    if (logoBuffer) {
      entryChildren.push(
        new Paragraph({
          children: [
            new ImageRun({ data: logoBuffer, transformation: { width: 22, height: 22 }, type: 'png' }),
            new TextRun({ text: '  GIORNALE DEI LAVORI', bold: true, size: 20, color: WHITE, font: 'Calibri' }),
          ],
          alignment: AlignmentType.CENTER,
          shading: { type: ShadingType.CLEAR, fill: BLUE },
          spacing: { before: 0, after: 0 },
        })
      );
    } else {
      entryChildren.push(
        new Paragraph({
          children: [new TextRun({ text: 'GIORNALE DEI LAVORI', bold: true, size: 20, color: WHITE, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          shading: { type: ShadingType.CLEAR, fill: BLUE },
          spacing: { before: 0, after: 0 },
        })
      );
    }

    const dateStr = new Date(entry.date).toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    entryChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: dateCapitalized, bold: true, size: 24, color: BLUE, font: 'Calibri' }),
          ...(entry.weather || entry.temperature
            ? [new TextRun({ text: `   ${[entry.weather, entry.temperature].filter(Boolean).join(' • ')}`, size: 20, color: GRAY, font: 'Calibri' })]
            : []),
        ],
        shading: { type: ShadingType.CLEAR, fill: LIGHT_GRAY },
        spacing: { before: 80, after: 80 },
        indent: { left: convertInchesToTwip(0.1) },
      })
    );

    entryChildren.push(sectionHeading('Lavori Eseguiti'));
    entryChildren.push(bodyText(entry.workDescription));

    if (entry.workers.length > 0) {
      entryChildren.push(sectionHeading('Manodopera'));
      entryChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder(),
          rows: entry.workers.map(w =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: w.name, size: 19, font: 'Calibri', color: BLUE })] })], width: { size: 50, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: w.role || '—', size: 19, font: 'Calibri', color: GRAY })] })], width: { size: 35, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: w.attendance === 'mezza' ? 'Mezza g.' : 'Intera g.', size: 19, bold: true, font: 'Calibri', color: LIGHT_BLUE })] })], width: { size: 15, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
              ],
            })
          ),
        })
      );
    }

    if (entry.materials.length > 0) {
      entryChildren.push(sectionHeading('Materiali Utilizzati'));
      entryChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder(),
          rows: entry.materials.map(m => {
            const qty = m.quantity ? `${m.quantity} ${m.unit}` : '—';
            return new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.name, size: 19, font: 'Calibri', color: BLUE, bold: true })] })], width: { size: 40, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: qty, size: 19, font: 'Calibri', color: GRAY })] })], width: { size: 20, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.supplier || '—', size: 19, font: 'Calibri', color: GRAY })] })], width: { size: 40, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
              ],
            });
          }),
        })
      );
    }

    if (entry.equipment.length > 0) {
      entryChildren.push(sectionHeading('Mezzi e Attrezzature'));
      entryChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder(),
          rows: entry.equipment.map(eq =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: eq.name, size: 19, font: 'Calibri', color: BLUE, bold: true })] })], width: { size: 50, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: eq.hours ? `${eq.hours}h` : '—', size: 19, font: 'Calibri', color: GRAY })] })], width: { size: 15, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: eq.notes || '—', size: 19, font: 'Calibri', color: GRAY })] })], width: { size: 35, type: WidthType.PERCENTAGE }, borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 60 } }),
              ],
            })
          ),
        })
      );
    }

    if (entry.safetyNotes) {
      entryChildren.push(sectionHeading('Note sulla Sicurezza'));
      entryChildren.push(
        new Paragraph({
          children: [new TextRun({ text: entry.safetyNotes, size: 20, color: AMBER, font: 'Calibri' })],
          shading: { type: ShadingType.CLEAR, fill: AMBER_BG },
          spacing: { before: 40, after: 40 },
          indent: { left: convertInchesToTwip(0.1) },
        })
      );
    }

    if (entry.additionalNotes) {
      entryChildren.push(sectionHeading('Note Aggiuntive'));
      entryChildren.push(bodyText(entry.additionalNotes));
    }

    const photos = entry.photos ?? [];
    if (photos.length > 0) {
      entryChildren.push(sectionHeading(`Foto (${photos.length})`));
      const MAX_W = 320;
      const MAX_H = 240;

      for (let pi = 0; pi < photos.length; pi += 2) {
        const pair = photos.slice(pi, pi + 2);
        const cells = await Promise.all(
          pair.map(async (src, idx) => {
            try {
              const buf = dataUrlToArrayBuffer(src);
              const type = getImageType(src);
              const { width: nw, height: nh } = await getImageDimensions(src);
              const scale = Math.min(MAX_W / nw, MAX_H / nh, 1);
              const w = Math.round(nw * scale);
              const h = Math.round(nh * scale);
              return new TableCell({
                children: [
                  new Paragraph({ children: [new ImageRun({ data: buf, transformation: { width: w, height: h }, type })], alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
                  new Paragraph({ children: [new TextRun({ text: `Foto ${pi + idx + 1}`, size: 16, color: GRAY, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
                ],
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: thinBorder(),
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
              });
            } catch {
              return new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: `Foto ${pi + idx + 1} (non disponibile)`, size: 18, color: GRAY, font: 'Calibri' })] })],
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: thinBorder(),
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
              });
            }
          })
        );

        if (cells.length === 1) {
          cells.push(new TableCell({ children: [new Paragraph({ children: [] })], width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorder() }));
        }

        entryChildren.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder(),
          rows: [new TableRow({ children: cells })],
        }));
      }
    }
  }

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(20),
              bottom: convertMillimetersToTwip(20),
              left: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun({ text: `${project.name} — ${project.location}`, size: 16, color: GRAY, font: 'Calibri' })],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 0 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: noBorder(),
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: 'Ditta', size: 15, bold: true, color: GRAY, font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                          new Paragraph({ children: [new TextRun({ text: ' ', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                          new Paragraph({ children: [new TextRun({ text: '_______________________________', size: 15, color: 'CCCCCC', font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                        ],
                        width: { size: 33, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
                        margins: { top: 60, bottom: 60, left: 120, right: 120 },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: 'Assistente di Cantiere', size: 15, bold: true, color: GRAY, font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                          new Paragraph({ children: [new TextRun({ text: ' ', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                          new Paragraph({ children: [new TextRun({ text: '_______________________________', size: 15, color: 'CCCCCC', font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                        ],
                        width: { size: 34, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
                        margins: { top: 60, bottom: 60, left: 120, right: 120 },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: 'Il Direttore dei Lavori', size: 15, bold: true, color: GRAY, font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                          new Paragraph({ children: [new TextRun({ text: ' ', size: 22, font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                          new Paragraph({ children: [new TextRun({ text: '_______________________________', size: 15, color: 'CCCCCC', font: 'Calibri' })], alignment: AlignmentType.CENTER }),
                        ],
                        width: { size: 33, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
                        margins: { top: 60, bottom: 60, left: 120, right: 120 },
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${project.name} — ${project.location}   `, size: 15, color: GRAY, font: 'Calibri' }),
                  new TextRun({ text: `Stampato il ${new Date().toLocaleDateString('it-IT')}   `, size: 15, color: GRAY, font: 'Calibri' }),
                  new TextRun({ children: ['Pag. ', PageNumber.CURRENT], size: 15, color: GRAY, font: 'Calibri' }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 80 },
              }),
            ],
          }),
        },
        children: [...coverChildren, ...entryChildren],
      },
    ],
  });

  const blob = await Packer.toBlob(wordDoc);
  const filename = `Giornale_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  await saveFile(blob, filename);
}
