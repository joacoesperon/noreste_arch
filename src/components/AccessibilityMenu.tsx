"use client";

import { useState, useEffect, useCallback } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────
type A11yState = {
  fontSize: "normal" | "large" | "xlarge";
  contrast: "normal" | "high";
  reducedMotion: boolean;
  letterSpacing: boolean;
  dyslexicFont: boolean;
  readingGuide: boolean;
};

const STORAGE_KEY = "noreste-a11y";

const DEFAULTS: A11yState = {
  fontSize: "normal",
  contrast: "normal",
  reducedMotion: false,
  letterSpacing: false,
  dyslexicFont: false,
  readingGuide: false,
};

// ── Aplica los data-attributes al <html> ───────────────────────────────────
function applyToDOM(state: A11yState) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-a11y-font", state.fontSize);
  html.setAttribute("data-a11y-contrast", state.contrast);
  html.setAttribute("data-a11y-motion", state.reducedMotion ? "reduced" : "normal");
  html.setAttribute("data-a11y-spacing", state.letterSpacing ? "wide" : "normal");
  html.setAttribute("data-a11y-font-family", state.dyslexicFont ? "dyslexic" : "normal");
}

// ── Componente Guía de Lectura ─────────────────────────────────────────────
function ReadingGuide({ active }: { active: boolean }) {
  const [posY, setPosY] = useState(0);

  useEffect(() => {
    if (!active) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [active]);

  if (!active) return null;

  return (
    <div 
      className="reading-guide" 
      style={{ transform: `translateY(${posY}px)` }} 
    />
  );
}

// ── Componente Principal ───────────────────────────────────────────────────
export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  // Cargar preferencias guardadas + detectar prefers-reduced-motion
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    const systemReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleOpenExternal = () => setOpen(true);
    window.addEventListener("open-a11y-menu", handleOpenExternal);

    if (saved) {
      try {
        const parsed: A11yState = JSON.parse(saved);
        const merged = { ...DEFAULTS, ...parsed };
        // Si el sistema prefiere reducir movimiento, lo respetamos
        if (systemReducedMotion) merged.reducedMotion = true;
        setState(merged);
        applyToDOM(merged);
      } catch (e) {
        console.error("Error loading a11y settings", e);
      }
    } else if (systemReducedMotion) {
      const initial = { ...DEFAULTS, reducedMotion: true };
      setState(initial);
      applyToDOM(initial);
    }

    return () => window.removeEventListener("open-a11y-menu", handleOpenExternal);
  }, []);

  // Persistir y aplicar
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyToDOM(state);
  }, [state, mounted]);

  const update = <K extends keyof A11yState>(key: K, value: A11yState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setState(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!mounted) return null;

  const isModified = JSON.stringify(state) !== JSON.stringify(DEFAULTS);

  return (
    <>
      <ReadingGuide active={state.readingGuide} />

      {/* ── Botón Discreto ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones de accesibilidad"
        aria-expanded={open}
        className="
          fixed bottom-6 left-6 z-[1000]
          w-10 h-10
          flex items-center justify-center
          rounded-full
          bg-[var(--background)]
          text-[var(--color-text)]
          shadow-[0_2px_10px_rgba(0,0,0,0.1)]
          border border-[var(--color-text)]/10
          transition-all duration-300
          hover:scale-110 hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)]
          active:scale-95
        "
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="1.5" />
          <path d="M12 7v7" />
          <path d="M8 10l4 1 4-1" />
          <path d="M10 21l2-4 2 4" />
        </svg>
        {isModified && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-black rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Panel Moderno ── */}
      {open && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/5 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            className="
              fixed bottom-20 left-6 z-[1000]
              w-[320px] max-h-[80vh] overflow-y-auto
              bg-[var(--background)]
              border border-[var(--color-text)]/20
              shadow-[0_10px_30px_rgba(0,0,0,0.1)]
              p-6
              flex flex-col gap-6
              animate-in fade-in slide-in-from-bottom-4 duration-300
            "
          >
            <div className="flex items-center justify-between flex-wrap gap-y-2 border-b border-[var(--color-text)]/10 pb-4">
              <h2 className="text-[0.625rem] uppercase tracking-[0.15em] font-medium text-[var(--color-text)]/60">
                Accesibilidad
              </h2>
              <button onClick={reset} className="text-[0.56rem] uppercase tracking-wider hover:underline opacity-40 hover:opacity-100 py-1 px-2 -mr-2">
                Reset
              </button>
            </div>

            {/* Tamaño de Texto */}
            <div className="space-y-3">
              <span className="text-[0.75rem] font-medium">Tamaño de interfaz</span>
              <div className="flex gap-1 bg-[var(--color-text)]/5 p-1 rounded-sm">
                {(["normal", "large", "xlarge"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => update("fontSize", size)}
                    className={`
                      flex-1 py-1.5 text-[0.625rem] uppercase transition-all
                      ${state.fontSize === size 
                        ? "bg-[var(--background)] shadow-sm text-[var(--color-text)]" 
                        : "text-[var(--color-text)]/40 hover:text-[var(--color-text)]"}
                    `}
                  >
                    {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <A11yToggle 
                label="Alto Contraste" 
                active={state.contrast === "high"} 
                onToggle={() => update("contrast", state.contrast === "high" ? "normal" : "high")} 
              />
              <A11yToggle 
                label="Fuente Dislexia" 
                active={state.dyslexicFont} 
                onToggle={() => update("dyslexicFont", !state.dyslexicFont)} 
              />
              <A11yToggle 
                label="Reducir Movimiento" 
                active={state.reducedMotion} 
                onToggle={() => update("reducedMotion", !state.reducedMotion)} 
              />
              <A11yToggle 
                label="Mayor Espaciado" 
                active={state.letterSpacing} 
                onToggle={() => update("letterSpacing", !state.letterSpacing)} 
              />
              <A11yToggle 
                label="Guía de Lectura" 
                active={state.readingGuide} 
                onToggle={() => update("readingGuide", !state.readingGuide)} 
              />
            </div>
            
            <p className="text-[0.56rem] text-[var(--color-text)]/30 text-center mt-2 italic">
              Ajustes guardados automáticamente
            </p>
          </div>
        </>
      )}
    </>
  );
}

function A11yToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
      <span className="text-[0.75rem] text-[var(--color-text)]/80 group-hover:text-[var(--color-text)] transition-colors">{label}</span>
      <div className={`
        relative w-8 h-4 rounded-full transition-all duration-300 border
        ${active ? "bg-black border-black" : "bg-transparent border-[var(--color-text)]/20"}
      `}>
        <div className={`
          absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-300
          ${active ? "translate-x-[16px] bg-white" : "translate-x-0 bg-[var(--color-text)]/20"}
        `} 
        style={{ left: '2px' }}
        />
      </div>
    </div>
  );
}
