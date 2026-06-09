import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ExportData {
    profile: any;
    stats: any;
    steps: any[];
    sessions: any;
    wellness: any;
    adherence: any;
    notes: any[];
}

const GENDER_LABEL: Record<string, string> = {
    male: 'Masculino', female: 'Femenino', other: 'Otro',
};

const SEMAPHORE_COLOR: Record<string, string> = {
    green: '#2D9E75', yellow: '#E07B54', red: '#E74C3C',
};

const SEMAPHORE_LABEL: Record<string, string> = {
    green: 'Buena adherencia', yellow: 'Moderada', red: 'Baja',
};

function generateStepsBars(steps: ExportData['steps']): string {
    if (!steps.length) return '<p style="color:#aaa;">Sin datos</p>';
    const max = Math.max(...steps.map(s => s.numSteps), 1);
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return `
    <div style="display:flex; align-items:flex-end; gap:3px; height:60px; margin-top:8px;">
      ${steps.map(s => {
        const pct = Math.max((s.numSteps / max) * 100, 3);
        const dayIdx = new Date(s.date).getDay();
        const label = days[(dayIdx + 6) % 7];
        const color = s.isReached ? '#534AB7' : pct > 50 ? '#7F77DD' : '#AFA9EC';
        return `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;">
            <div style="width:100%; height:${pct}%; background:${color}; border-radius:2px 2px 0 0;"></div>
            <span style="font-size:7px; color:#aaa;">${label}</span>
          </div>`;
    }).join('')}
    </div>`;
}

export async function exportDashboardPDF(data: ExportData, userId: number) {
    const p = data.profile;
    const today = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
    const adherenceColor = SEMAPHORE_COLOR[data.adherence?.status ?? 'red'];

    const wellnessRows = data.wellness
        ? `
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-top:8px;">
        ${[
            { label: 'Dolor', val: data.wellness.pain },
            { label: 'Fatiga', val: data.wellness.fatigue },
            { label: 'Sueño', val: data.wellness.sleepiness },
            { label: 'Ánimo', val: data.wellness.mood },
        ].map(w => `
          <div style="text-align:center; background:#f5f3ff; border-radius:8px; padding:8px;">
            <div style="font-size:9px; color:#888;">${w.label}</div>
            <div style="font-size:18px; font-weight:600; color:#534AB7;">${w.val}</div>
          </div>`).join('')}
      </div>`
        : '<p style="color:#aaa; font-size:11px;">Sin datos</p>';

    const categoriesRows = Object.entries(data.sessions?.categoryCount ?? {})
        .map(([cat, count]) => {
            const labels: Record<string, string> = {
                aerobic: 'Cardio', strength: 'Fuerza',
                flexibility: 'Flexibilidad', balance: 'Equilibrio',
            };
            const colors: Record<string, string> = {
                aerobic: '#FF6B6B', strength: '#6B5B95',
                flexibility: '#2D9E75', balance: '#E07B54',
            };
            const max = Math.max(...Object.values(data.sessions.categoryCount as Record<string, number>), 1);
            const pct = Math.round(((count as number) / max) * 100);
            return `
        <div style="margin-bottom:6px;">
          <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px;">
            <span>${labels[cat] ?? cat}</span>
            <span style="color:${colors[cat]}; font-weight:600;">${count} sesiones</span>
          </div>
          <div style="height:5px; background:#eee; border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:${colors[cat]}; border-radius:3px;"></div>
          </div>
        </div>`;
        }).join('');

    const notesRows = data.notes.slice(0, 5).map(n => `
    <tr>
      <td style="padding:4px 6px; font-size:9px; color:#888; white-space:nowrap;">
        ${new Date(n.date).toLocaleDateString('es-ES')}
      </td>
      <td style="padding:4px 6px; font-size:10px; color:#2D3E50;">${n.content}</td>
    </tr>`).join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, Arial, sans-serif;
    font-size: 11px; color: #2D3E50;
    padding: 24px; max-width: 700px; margin: 0 auto;
  }
  h1 { font-size: 18px; font-weight: 700; color: #2D3E50; }
  h2 { font-size: 12px; font-weight: 600; color: #888;
       text-transform: uppercase; letter-spacing: 0.05em;
       margin: 16px 0 6px; border-bottom: 0.5px solid #eee; padding-bottom: 4px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #6B5B95; }
  .badge { display: inline-block; background: #FFF3CD; color: #8B6914;
           font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
  .card { background: #f9f9f9; border-radius: 8px; padding: 10px;
          border: 0.5px solid #eee; }
  .metric-val { font-size: 20px; font-weight: 600; }
  .metric-lbl { font-size: 9px; color: #888; margin-bottom: 2px; }
  .row { display: flex; justify-content: space-between;
         padding: 4px 0; border-bottom: 0.5px solid #f0f0f0; }
  .row:last-child { border-bottom: none; }
  .row-lbl { color: #888; }
  .row-val { font-weight: 500; }
  table { width: 100%; border-collapse: collapse; }
  td { vertical-align: top; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 0.5px solid #eee;
            font-size: 9px; color: #aaa; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Informe de seguimiento</h1>
    <p style="color:#888; font-size:10px; margin-top:4px;">
      ID ${userId} · Generado el ${today}
    </p>
  </div>
  ${p?.diagnosis ? `<span class="badge">${p.diagnosis}</span>` : ''}
</div>

${p ? `
<h2>Datos clínicos</h2>
<div class="grid-2">
  <div class="card">
    <div class="row"><span class="row-lbl">Edad</span><span class="row-val">${p.age} años</span></div>
    <div class="row"><span class="row-lbl">Género</span><span class="row-val">${GENDER_LABEL[p.gender] ?? p.gender}</span></div>
    <div class="row"><span class="row-lbl">Altura</span><span class="row-val">${p.height} cm</span></div>
    <div class="row"><span class="row-lbl">Peso</span><span class="row-val">${p.weight} kg</span></div>
  </div>
  <div class="card">
    <div class="row"><span class="row-lbl">Hospital</span><span class="row-val">${p.hospital}</span></div>
    <div class="row"><span class="row-lbl">Nacimiento</span><span class="row-val">${new Date(p.birthDate).toLocaleDateString('es-ES')}</span></div>
    <div class="row"><span class="row-lbl">Fin tratamiento</span><span class="row-val">${new Date(p.treatmentEndDate).toLocaleDateString('es-ES')}</span></div>
  </div>
</div>` : ''}

<h2>Resumen de actividad</h2>
<div class="grid-4">
  <div class="card" style="text-align:center;">
    <div class="metric-lbl">Racha</div>
    <div class="metric-val" style="color:#E07B54;">${data.stats.streak}d</div>
  </div>
  <div class="card" style="text-align:center;">
    <div class="metric-lbl">Pasos hoy</div>
    <div class="metric-val">${data.stats.todaySteps.toLocaleString()}</div>
  </div>
  <div class="card" style="text-align:center;">
    <div class="metric-lbl">Sesiones mes</div>
    <div class="metric-val">${data.stats.sessionsThisMonth}</div>
  </div>
  <div class="card" style="text-align:center;">
    <div class="metric-lbl">Adherencia</div>
    <div class="metric-val" style="color:${adherenceColor};">${data.adherence?.pct ?? 0}%</div>
  </div>
</div>

${data.adherence ? `
<h2>Adherencia al programa</h2>
<div class="card">
  <div style="display:flex; align-items:center; gap:12px;">
    <div style="width:14px; height:14px; border-radius:50%; background:${adherenceColor};"></div>
    <span style="font-weight:600; color:${adherenceColor};">${SEMAPHORE_LABEL[data.adherence.status]}</span>
    <span style="color:#888; margin-left:auto;">${data.adherence.completed} / ${data.adherence.planned} días completados</span>
  </div>
  <div style="height:5px; background:#eee; border-radius:3px; overflow:hidden; margin-top:8px;">
    <div style="height:100%; width:${data.adherence.pct}%; background:${adherenceColor}; border-radius:3px;"></div>
  </div>
</div>` : ''}

<h2>Pasos diarios — últimas 2 semanas</h2>
<div class="card" style="height:80px; display:flex; flex-direction:column; justify-content:flex-end;">
  ${generateStepsBars(data.steps)}
</div>

<div class="grid-2" style="margin-top:12px;">
  <div>
    <h2>Sesiones por tipo</h2>
    <div class="card">${categoriesRows || '<p style="color:#aaa;">Sin datos</p>'}</div>
  </div>
  <div>
    <h2>Bienestar medio (1–5)</h2>
    <div class="card">${wellnessRows}</div>
  </div>
</div>

${data.notes.length ? `
<h2>Notas del supervisor (últimas ${Math.min(data.notes.length, 5)})</h2>
<div class="card">
  <table>
    <tbody>${notesRows}</tbody>
  </table>
</div>` : ''}

<div class="footer">
  <span>Health Game — Informe generado automáticamente</span>
  <span>${today}</span>
</div>

</body>
</html>`;

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartir informe',
            UTI: 'com.adobe.pdf',
        });
    } else {
        await Print.printAsync({ uri });
    }
}