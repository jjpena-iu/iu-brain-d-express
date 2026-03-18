import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, FileText, CheckCircle2, Loader2, User, Download, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, extractReport, stripReportMarkers } from './services/api.js';
 
const PHASES = [
  { id: 1, label: 'Contexto del Negocio', time: '0-5 min' },
  { id: 2, label: 'Procesos y Tareas', time: '5-15 min' },
  { id: 3, label: 'Automatización e IA', time: '15-25 min' },
  { id: 4, label: 'Impacto de Negocio', time: '25-30 min' },
];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [report, setReport] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const scrollRef = useRef(null);

  // Show welcome message on load
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: 'Bienvenido a **iu Brain** 🧠 — **Diagnóstico Express de Automatización de Hiumanlab**\n\nVoy a guiarte paso a paso en una sesión de diagnóstico de ~30 minutos para identificar qué procesos del cliente pueden automatizarse, y qué tipo de solución aplica en cada caso: automatización, agente de IA o desarrollo a medida.\n\nAl finalizar generaré:\n- 📋 **Reporte de diagnóstico** con recomendaciones\n- 📊 **Scoring de procesos** priorizado\n- 🏆 **Lista de top oportunidades** de automatización\n\n¿Listo para comenzar? Dime el nombre o giro del cliente con el que vas a trabajar y arrancamos. 🚀',
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const detectPhase = (text) => {
    if (text.includes('FASE 4') || text.includes('Fase 4') || text.includes('Impacto')) return 4;
    if (text.includes('FASE 3') || text.includes('Fase 3') || text.includes('Automatización')) return 3;
    if (text.includes('FASE 2') || text.includes('Fase 2') || text.includes('Repetitivas')) return 2;
    return null;
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || sessionDone) return;

    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setQuestionCount(prev => prev + 1);

    const newHistory = [...history, { role: 'user', parts: [{ text }] }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(newHistory);

      const phase = detectPhase(reply);
      if (phase) setCurrentPhase(phase);

      const reportContent = extractReport(reply);
      if (reportContent) {
        setReport(reportContent);
        setSessionDone(true);
        setCurrentPhase('completed');
      }

      const displayText = stripReportMarkers(reply);
      setMessages(prev => [...prev, { role: 'assistant', content: displayText }]);
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: reply }] }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error de conexión:** ${err.message}\n\nVerifica que el backend esté corriendo correctamente.`,
      }]);
    }
    setIsLoading(false);
  };

  const copyReport = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      alert('Reporte copiado al portapapeles');
    }
  };

  const exportPDF = async () => {
    if (!report || !window.html2pdf) return;
    const el = document.getElementById('pdf-content');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `iu-brain-diagnostico-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    await window.html2pdf().set(opt).from(el).save();
  };

  const progress = Math.min(questionCount, 15);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-72 bg-hiuman-dark text-white p-6 flex flex-col border-r border-indigo-900/50 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-hiuman-purple p-2 rounded-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none">iu Brain</h1>
            <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Hiumanlab</p>
          </div>
        </div>

        {/* Phases */}
        <nav className="flex-1 space-y-2">
          <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">Fases del Diagnóstico</p>
          {PHASES.map((phase) => {
            const isActive = currentPhase === phase.id;
            const isDone = typeof currentPhase === 'number' && currentPhase > phase.id || currentPhase === 'completed';
            return (
              <div
                key={phase.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                  isActive ? 'bg-white/10 ring-1 ring-white/20' : isDone ? 'opacity-70' : 'opacity-35'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                  isActive ? 'bg-hiuman-purple text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                )}>
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : phase.id}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-none">{phase.label}</p>
                  <p className="text-[10px] text-indigo-300 mt-0.5">{phase.time}</p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Progress bar */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Progreso</p>
              <p className="text-[10px] font-bold text-white">{progress}/15</p>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-hiuman-purple rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(progress / 15) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          {/* Logo Hiumanlab */}
          <div className="mt-4 flex justify-center">
            <img src="/iu-brain-backend-d-express/logo-hiumanlab.png" alt="Hiumanlab" className="h-5 opacity-40" />
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sesión Activa</span>
          </div>
          <FileText className="w-4 h-4 text-slate-400" />
        </header>

        <div className="flex-1 flex overflow-hidden">

          {/* Chat */}
          <div className={cn('flex flex-col transition-all duration-500 overflow-hidden', report ? 'w-1/2' : 'w-full')}>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('flex gap-3 max-w-[88%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '')}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                      msg.role === 'assistant' ? 'bg-hiuman-purple text-white' : 'bg-slate-200 text-slate-600'
                    )}>
                      {msg.role === 'assistant' ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Bubble */}
                    <div className={cn(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm',
                      msg.role === 'assistant'
                        ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                        : 'bg-hiuman-dark text-white rounded-tr-sm'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-[88%]">
                  <div className="w-8 h-8 rounded-xl bg-hiuman-purple text-white flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <motion.span key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full"
                          animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-200 flex-shrink-0">
              <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={sessionDone ? 'Diagnóstico completado ✅' : 'Escribe tu respuesta aquí...'}
                  disabled={isLoading || sessionDone}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-hiuman-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || sessionDone}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-hiuman-purple text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-bold">
                iu Brain — Hiumanlab | Creating Technology Together
              </p>
            </div>
          </div>

          {/* Report panel */}
          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-1/2 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-20 overflow-hidden"
              >
                {/* Report header */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50/80 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-hiuman-purple" />
                    <h2 className="font-display font-bold text-slate-800 text-sm">Entregables Generados</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyReport} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500" title="Copiar">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-hiuman-purple text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-all">
                      <Download className="w-3.5 h-3.5" />
                      Imprimir PDF
                    </button>
                  </div>
                </div>

                {/* PDF printable content */}
                <div className="flex-1 overflow-y-auto">
                  <div id="pdf-content" className="p-10">
                    {/* PDF branding header */}
                    <div className="flex items-start justify-between pb-6 mb-8 border-b border-slate-200">
                      <div>
                        <img src="/iu-brain-backend-d-express/logo-hiumanlab.png" alt="Hiumanlab" className="h-7 mb-2" />
                        <p className="text-[10px] font-bold text-hiuman-purple uppercase tracking-widest">iu Brain · Diagnóstico Express</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Creating Technology Together</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reporte de Diagnóstico</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="markdown-body">
                      <ReactMarkdown>{report}</ReactMarkdown>
                    </div>

                    {/* PDF footer */}
                    <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center">
                      <img src="/iu-brain-backend-d-express/logo-hiumanlab.png" alt="Hiumanlab" className="h-4 opacity-40" />
                      <p className="text-[10px] text-slate-400 text-right leading-relaxed">
                        contacto@hiumanlab.com · www.iucorporation.com<br />
                        Generado por iu Brain — Creating Technology Together
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
