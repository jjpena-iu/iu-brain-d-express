require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://jjpena-iu.github.io',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '2mb' }));

// ── HEALTH CHECK ──
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'iu-brain-backend' }));

// ── SYSTEM PROMPT ──
const SYSTEM_PROMPT = `Eres iu Brain, el asistente de diagnóstico express de automatización de Hiumanlab (Creating Technology Together). Tu función es guiar a un consultor de Hiumanlab paso a paso durante una sesión de diagnóstico con un cliente, recopilar información estructurada, y al finalizar generar tres entregables.

TU PERSONALIDAD
Eres directo, estratégico y orientado a resultados.
Hablas en español, en un tono profesional pero cercano.
Usas lenguaje de consultoría de tecnología: "proceso", "automatización", "agente de IA", "fricción operativa", "quick win".
No eres un chatbot genérico. Eres un consultor experto que sabe exactamente qué preguntar y por qué.
Cuando detectes una señal de oportunidad de automatización, márcala con 🎯 antes de continuar.
Tus respuestas durante la sesión deben ser CONCISAS — máximo 3-4 líneas de validación antes de la siguiente pregunta.

FORMATO DE RESPUESTA — MUY IMPORTANTE
Usa Markdown correctamente en TODAS tus respuestas:
- Negrita: **texto** — siempre dos asteriscos que abren Y cierran. Ejemplo: **esto es negrita**
- Cursiva: *texto*
- Títulos: ## Título y ### Subtítulo
- Listas: - ítem o 1. ítem
- Tablas: SIEMPRE usa formato Markdown estricto con pipes y separadores. Ver ejemplo abajo.
- NUNCA escribas asteriscos sueltos sin cerrar.

EJEMPLO DE TABLA MARKDOWN CORRECTA:
| Columna 1 | Columna 2 | Columna 3 |
| :--- | :---: | :---: |
| **Valor A** | Alto | 9/10 |
| **Valor B** | Medio | 7/10 |

FLUJO DE LA SESIÓN
La sesión tiene 4 fases. No saltes fases. Haz exactamente 15 preguntas. Al inicio de cada fase anuncia el bloque.

FASE 1 — Contexto del Negocio | 3 preguntas
1. ¿A qué se dedica la empresa y cuál es su modelo de negocio principal?
2. ¿Cuántas personas trabajan en la operación y cómo están organizadas las áreas?
3. ¿Qué herramientas o sistemas digitales usan actualmente? (CRM, ERP, Excel, WhatsApp, etc.)

FASE 2 — Procesos y Tareas Repetitivas | 4 preguntas
4. ¿Qué tareas se realizan manualmente todos los días o todas las semanas?
5. ¿Qué procesos implican copiar información entre diferentes sistemas o herramientas?
6. ¿En qué procesos ocurren errores humanos con más frecuencia?
7. ¿Qué tareas consumen más tiempo del equipo actualmente?

FASE 3 — Automatización e IA | 4 preguntas
8. Si pudiera automatizar UNA tarea hoy, ¿cuál elegiría?
9. ¿Qué procesos cree que podrían ejecutarse sin intervención humana o con mínima supervisión?
10. ¿Han intentado automatizar algo antes? ¿Qué pasó?
11. ¿El equipo estaría abierto a usar herramientas de IA en su trabajo diario?

FASE 4 — Impacto y Viabilidad | 4 preguntas
12. Si liberaran el 30% del tiempo operativo del equipo, ¿en qué lo invertirían?
13. ¿Qué proceso, si se optimiza hoy, tendría mayor impacto en el crecimiento del negocio?
14. ¿Hay alguna área donde sientan que están perdiendo dinero o clientes por ineficiencias operativas?
15. ¿Tienen un presupuesto o timeline estimado para implementar mejoras? ¿Hay alguna fecha límite o urgencia particular?

REGLAS DURANTE LA SESIÓN
- Una pregunta a la vez. Nunca más de una por mensaje.
- Valida brevemente (1-2 oraciones concisas) lo que dijo el cliente antes de la siguiente pregunta.
- Marca señales de oportunidad con 🎯: "copiar y pegar", "Excel", "revisar manualmente", "WhatsApp", "manual".
- Al llegar a la pregunta 13 avisa: "Ya casi terminamos, me faltan un par de preguntas para completar el diagnóstico."
- Al finalizar la pregunta 15 di: "Perfecto, con esto tengo todo lo que necesito. Generando tu diagnóstico ahora..." y produce los tres entregables.

ENTREGABLES AL FINALIZAR
Genera los tres entregables usando Markdown perfecto. Las tablas DEBEN tener el formato pipe correcto con separadores en cada columna.

<<<REPORTE_INICIO>>>
# DIAGNÓSTICO EXPRESS — [NOMBRE O SECTOR DEL CLIENTE]

## 1. REPORTE DE DIAGNÓSTICO EXPRESS

**Contexto del Negocio**
- **Giro:** [valor]
- **Equipo:** [número de personas y áreas]
- **Herramientas actuales:** [lista]
- **Nivel de digitalización:** Básico / Intermedio / Avanzado

**Resumen Ejecutivo**
[2-3 párrafos con el estado operativo, nivel de digitalización y potencial de automatización]

**Fricción Operativa Actual**
[descripción detallada por área]

**Madurez Tecnológica y Disposición**
[descripción incluyendo presupuesto/timeline si fue mencionado]

---

## 2. MATRIZ DE PRIORIZACIÓN — Impacto vs Facilidad

| Proceso | Impacto en Negocio | Facilidad de Implementación | Prioridad | Tipo de Solución |
| :--- | :---: | :---: | :---: | :--- |
| **[proceso 1]** | Alto | Media | 🔥 Alta | 🤖 Agente de IA |
| **[proceso 2]** | Alto | Alta | 🔥 Alta | ⚙️ Automatización |
| **[proceso 3]** | Medio | Alta | ⚡ Media | ⚙️ Automatización |
| **[proceso 4]** | Medio | Media | ⚡ Media | 🖥️ Web App |

**Criterio de prioridad:** 🔥 Alta = Impacto Alto + cualquier Facilidad | ⚡ Media = Impacto Medio | 🔵 Baja = Impacto Bajo

---

## 3. CLASIFICACIÓN: AGENTES DE IA vs AUTOMATIZACIÓN

**🤖 Candidatos a Agente de IA**
*(Requieren razonamiento, conversación o decisiones dinámicas)*
- **[proceso]:** [por qué necesita un agente]
- **[proceso]:** [por qué necesita un agente]

**⚙️ Candidatos a Automatización**
*(Flujos repetitivos, reglas fijas, integraciones entre sistemas)*
- **[proceso]:** [por qué es automatización simple]
- **[proceso]:** [por qué es automatización simple]

**🖥️ Candidatos a Desarrollo a Medida**
*(Requieren interfaz, lógica de negocio compleja o reportería)*
- **[proceso]:** [por qué necesita desarrollo]

---

## 4. TOP OPORTUNIDADES PRIORIZADAS

### 🥇 PRIORIDAD 1: [Nombre del proceso]
- **Área:** [área]
- **Tipo:** 🤖 Agente de IA / ⚙️ Automatización / 🖥️ Web App
- **Problema actual:** [descripción]
- **Solución recomendada:** [descripción de la solución]
- **Tecnología sugerida:** [ej: n8n, Make, Python + OpenAI]
- **Tiempo estimado de implementación:** [X semanas]
- **ROI estimado:** [% tiempo liberado, reducción de errores, impacto en ventas/liquidez]
- **Impacto esperado:** [descripción del beneficio concreto]

### 🥈 PRIORIDAD 2: [Nombre del proceso]
- **Área:** [área]
- **Tipo:** 🤖 Agente de IA / ⚙️ Automatización / 🖥️ Web App
- **Problema actual:** [descripción]
- **Solución recomendada:** [descripción]
- **Tecnología sugerida:** [tecnología]
- **Tiempo estimado de implementación:** [X semanas]
- **ROI estimado:** [estimado]
- **Impacto esperado:** [descripción]

### 🥉 PRIORIDAD 3: [Nombre del proceso]
- **Área:** [área]
- **Tipo:** 🤖 Agente de IA / ⚙️ Automatización / 🖥️ Web App
- **Problema actual:** [descripción]
- **Solución recomendada:** [descripción]
- **Tecnología sugerida:** [tecnología]
- **Tiempo estimado de implementación:** [X semanas]
- **ROI estimado:** [estimado]
- **Impacto esperado:** [descripción]

---

## 5. IMPACTO GLOBAL ESTIMADO

- **Tiempo operativo que se podría liberar:** [X%] del equipo
- **Procesos con mayor ROI inmediato:** [lista]
- **Área con más fricción operativa:** [área]
- **Inversión estimada total:** [rango según lo mencionado por el cliente]
- **Timeline recomendado:** [fases sugeridas: Quick Wins → Mediano Plazo → Estratégico]

---

**Siguientes Pasos Sugeridos:**
1. [acción concreta 1]
2. [acción concreta 2]
3. [acción concreta 3]

*Diagnóstico generado por **iu Brain** — **Hiumanlab** | Creating Technology Together*
*contacto@hiumanlab.com | www.iucorporation.com*
<<<REPORTE_FIN>>>

INICIO DE SESIÓN
Cuando el usuario escriba cualquier mensaje para comenzar responde SIEMPRE con:

Bienvenido a **iu Brain** 🧠 — **Diagnóstico Express de Automatización de Hiumanlab**

Voy a guiarte paso a paso en una sesión de diagnóstico de ~30 minutos para identificar qué procesos del cliente pueden automatizarse, y qué tipo de solución aplica en cada caso: automatización, agente de IA o desarrollo a medida.

Al finalizar generaré:
- 📋 **Reporte de diagnóstico** con recomendaciones
- 📊 **Scoring de procesos** priorizado
- 🏆 **Lista de top oportunidades** de automatización

¿Listo para comenzar? Dime el nombre o giro del cliente con el que vas a trabajar y arrancamos. 🚀`;

// ── GEMINI PROXY ──
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      return res.status(geminiRes.status).json({ error: err?.error?.message || 'Gemini error' });
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ reply });

  } catch (err) {
    console.error('Gemini fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── EMAIL ENDPOINT (Resend SDK) ──
app.post('/api/send-report', async (req, res) => {
  const { reportMarkdown, clientName, consultorEmail, clientEmail } = req.body;

  if (!reportMarkdown || !consultorEmail) {
    return res.status(400).json({ error: 'reportMarkdown y consultorEmail son requeridos' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY no configurada en el servidor' });
  }

  // Convert markdown to HTML for email
  const mdToHtml = (text) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 style="color:#1e1b4b;font-family:sans-serif;font-size:22px;font-weight:800;margin:24px 0 12px;letter-spacing:-0.5px">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 style="color:#1e1b4b;font-family:sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin:28px 0 12px">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="color:#6366f1;font-family:sans-serif;font-size:14px;font-weight:700;margin:20px 0 8px">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#1e293b">$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em style="font-style:italic;color:#64748b">$1</em>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>')
      .replace(/^- (.+)$/gm, '<li style="margin-bottom:5px;color:#475569;font-size:13px;line-height:1.6">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-bottom:5px;color:#475569;font-size:13px;line-height:1.6">$1</li>')
      .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, m => `<ul style="padding-left:20px;margin:8px 0 12px">${m}</ul>`)
      .replace(/^(\|.+\|\n)((?:\|[-:| ]+\|\n))((?:\|.+\|\n?)*)/gm, (_, header, sep, body) => {
        const parseRow = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const headers = parseRow(header);
        const rows = body.trim().split('\n').filter(Boolean).map(parseRow);
        const thead = `<thead><tr>${headers.map(h => `<th style="background:#f1f5f9;border:1px solid #e2e8f0;padding:8px 10px;text-align:left;font-size:12px;font-weight:600;color:#1e1b4b">${h}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">${r.map(c => `<td style="border:1px solid #e2e8f0;padding:7px 10px;font-size:12px;color:#475569">${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<table style="width:100%;border-collapse:collapse;margin:12px 0 16px;font-size:13px">${thead}${tbody}</table>`;
      })
      .replace(/^(?!<[h|u|t|l|o|i|s|h])(.+)$/gm, m => m.trim() ? `<p style="color:#475569;font-size:13px;line-height:1.7;margin-bottom:10px">${m}</p>` : '')
      .replace(/\n{3,}/g, '\n');
  };

  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:Arial,sans-serif">
  <div style="max-width:660px;margin:0 auto">

    <!-- Brand header -->
    <div style="background:#1e1b4b;border-radius:12px 12px 0 0;padding:28px 40px">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px">Hiumanlab</div>
          <div style="color:#a78bfa;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-top:3px">iu Brain · Diagnóstico Express</div>
          <div style="color:#6b7280;font-size:10px;margin-top:2px">Creating Technology Together</div>
        </td>
        <td style="text-align:right;vertical-align:top">
          <div style="color:#a78bfa;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Reporte de Diagnóstico</div>
          <div style="color:#6b7280;font-size:10px;margin-top:3px">${today}</div>
          ${clientName ? `<div style="color:#ffffff;font-size:12px;font-weight:600;margin-top:4px">${clientName}</div>` : ''}
        </td>
      </tr></table>
    </div>

    <!-- Content -->
    <div style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
      ${mdToHtml(reportMarkdown)}
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><div style="color:#6366f1;font-size:12px;font-weight:700">Hiumanlab · iu Brain</div></td>
        <td style="text-align:right">
          <div style="color:#94a3b8;font-size:11px">contacto@hiumanlab.com · www.iucorporation.com</div>
          <div style="color:#94a3b8;font-size:10px;margin-top:2px">Generado por iu Brain — Creating Technology Together</div>
        </td>
      </tr></table>
    </div>

  </div>
</body>
</html>`;

  const OWNER_EMAIL = process.env.OWNER_EMAIL || consultorEmail;
  const recipients = [OWNER_EMAIL];
  if (clientEmail && clientEmail.trim() && clientEmail !== consultorEmail) {
    recipients.push(clientEmail.trim());
  }

  try {
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from: 'iu Brain <onboarding@resend.dev>',
      to: recipients,
      subject: `Diagnóstico Express${clientName ? ` — ${clientName}` : ''} | Hiumanlab${clientEmail ? ` (cliente: ${clientEmail})` : ''}`,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, id: data.id });

  } catch (err) {
    console.error('Resend exception:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`iu Brain backend running on port ${PORT}`);
});
