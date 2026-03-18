import React, { useRef } from 'react';
import { parseMarkdown } from '../services/markdown.js';

function PdfDocument({ reportMarkdown, clientName }) {
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div id="pdf-document" style={{
      background: '#0a0a12', padding: '40px 44px', minHeight: '100%',
      fontFamily: "'DM Sans', sans-serif", color: '#e8e8f0',
    }}>
      {/* PDF Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '32px',
      }}>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <img
              src="/iu-brain-backend-d-express/logo-hiumanlab.png"
              alt="Hiumanlab"
              style={{ height: '28px', display: 'block' }}
            />
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '11px', color: '#a78bfa', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              iu Brain · Diagnóstico Express
            </div>
            <div style={{ fontSize: '12px', color: '#6b6b8a' }}>Creating Technology Together</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Reporte de Diagnóstico
          </div>
          {clientName && (
            <div style={{ fontSize: '13px', color: '#e8e8f0', fontWeight: 500, marginTop: '3px' }}>{clientName}</div>
          )}
          <div style={{ fontSize: '12px', color: '#6b6b8a', marginTop: '3px' }}>{today}</div>
        </div>
      </div>

      {/* Report Content */}
      <div
        className="report-md-content"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(reportMarkdown) }}
      />

        <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/iu-brain/logo-hiumanlab.png" alt="Hiumanlab" style={{ height: '18px', opacity: 0.6 }} />
          <div style={{ fontSize: '11px', color: '#6b6b8a', textAlign: 'right', lineHeight: 1.7 }}>
            contacto@hiumanlab.com · www.iucorporation.com<br />
            Generado por iu Brain — Creating Technology Together
          </div>
        </div>
    </div>
  );
}

export default function ReportPanel({ report, clientName }) {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!report || !window.html2pdf) return;
    setExporting(true);
    try {
      const element = document.getElementById('pdf-document');
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `iu-brain-diagnostico-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#0a0a12', useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
      alert('Error al generar PDF: ' + e.message);
    }
    setExporting(false);
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>
      <style>{`
        .report-md-content { font-size: 13px; line-height: 1.75; color: #9898b8; }
        .report-md-content strong { font-weight: 600; color: #e8e8f0; }
        .report-md-content em { font-style: italic; }
        .report-md-content h1 { font-family: 'Syne',sans-serif; font-size: 22px; font-weight: 800; color: #e8e8f0; margin: 0 0 24px; letter-spacing: -.5px; }
        .report-md-content h2 { font-family: 'Syne',sans-serif; font-size: 12px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1.2px; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .report-md-content h3 { font-family: 'Syne',sans-serif; font-size: 14px; font-weight: 700; color: #e8e8f0; margin: 20px 0 8px; }
        .report-md-content p { margin-bottom: 10px; }
        .report-md-content ul,.report-md-content ol { padding-left: 20px; margin-bottom: 10px; }
        .report-md-content li { margin-bottom: 5px; }
        .report-md-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 28px 0; }
        .report-md-content table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px; }
        .report-md-content th { background: rgba(124,92,252,0.12); border: 1px solid rgba(255,255,255,0.07); padding: 8px 10px; text-align: left; font-weight: 600; color: #a78bfa; }
        .report-md-content td { border: 1px solid rgba(255,255,255,0.07); padding: 7px 10px; }
        .report-md-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
        .report-md-content blockquote { border-left: 3px solid #7c5cfc; padding-left: 14px; margin: 12px 0; color: #9898b8; font-style: italic; }
        .report-md-content code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Diagnóstico Generado
        </span>
        <button
          onClick={handleExport}
          disabled={!report || exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
            border: 'none', borderRadius: '8px', padding: '7px 14px',
            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: '#fff',
            cursor: report ? 'pointer' : 'not-allowed',
            opacity: report ? (exporting ? 0.6 : 1) : 0.3,
            transition: 'opacity var(--transition)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          {exporting ? 'Generando…' : 'Imprimir PDF'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!report ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '12px',
            color: 'var(--text-muted)', padding: '40px', textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
            }}>🧠</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-dim)' }}>
              Diagnóstico pendiente
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '260px' }}>
              Completa la sesión de preguntas. El reporte completo aparecerá aquí al finalizar.
            </div>
          </div>
        ) : (
          <PdfDocument reportMarkdown={report} clientName={clientName} />
        )}
      </div>
    </section>
  );
}
