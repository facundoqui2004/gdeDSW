import React, { useState, useMemo, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-tsx.js';

export default function CodeBlock({ title, language = 'TypeScript', code = '' }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wrapLines, setWrapLines] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Manejo de la tecla Escape para cerrar la visión ampliada
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const normalizedLang = useMemo(() => {
    const l = (language || 'typescript').toLowerCase().trim();
    if (l === 'typescript' || l === 'ts') return 'typescript';
    if (l === 'javascript' || l === 'js') return 'javascript';
    if (l === 'sql') return 'sql';
    if (l === 'json') return 'json';
    if (l === 'bash' || l === 'sh' || l === 'shell') return 'bash';
    if (l === 'jsx' || l === 'tsx') return 'tsx';
    return 'typescript';
  }, [language]);

  const highlightedHtml = useMemo(() => {
    const grammar = Prism.languages[normalizedLang] || Prism.languages.typescript || Prism.languages.javascript;
    try {
      return Prism.highlight((code || '').trim(), grammar, normalizedLang);
    } catch {
      return code;
    }
  }, [code, normalizedLang]);

  const lines = useMemo(() => {
    return (code || '').trim().split('\n');
  }, [code]);

  const langBadgeColor = useMemo(() => {
    switch (normalizedLang) {
      case 'typescript': return '#3178c6';
      case 'javascript': return '#f7df1e';
      case 'sql': return '#e38c00';
      case 'json': return '#0cbc87';
      case 'bash': return '#4e5a65';
      default: return '#0076c6';
    }
  }, [normalizedLang]);

  const langBadgeTextColor = useMemo(() => {
    if (normalizedLang === 'javascript') return '#000';
    return '#fff';
  }, [normalizedLang]);

  return (
    <>
      <div className="code-container">
        <div className="code-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="window-dots" aria-hidden="true">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="code-title">
              {title || `${language} Snippet`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="code-lang-tag"
              style={{
                backgroundColor: langBadgeColor,
                color: langBadgeTextColor,
                fontWeight: 700
              }}
            >
              {language}
            </span>

            <button
              className="code-action-btn"
              onClick={() => setIsExpanded(true)}
              title="Abrir visión ampliada (pantalla completa)"
              aria-label="Abrir visión ampliada"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
              <span>Ampliar</span>
            </button>

            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copiar código al portapapeles"
              aria-label="Copiar código"
            >
              {copied ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4ade80' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>¡Copiado!</span>
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copiar</span>
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="code-body-wrapper">
          {lines.length > 1 && (
            <div className="code-line-numbers" aria-hidden="true">
              {lines.map((_, i) => (
                <span key={i} className="line-num">{i + 1}</span>
              ))}
            </div>
          )}
          <pre className="code-pre">
            <code
              className={`code-highlight language-${normalizedLang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE VISIÓN AMPLIADA (FULLSCREEN / FOCUS MODE)
          ========================================================================= */}
      {isExpanded && (
        <div className="code-modal-backdrop" onClick={() => setIsExpanded(false)}>
          <div
            className="code-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Visión ampliada: ${title || language}`}
          >
            <div className="code-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="window-dots" aria-hidden="true">
                  <span className="dot dot-red" onClick={() => setIsExpanded(false)} style={{ cursor: 'pointer' }} title="Cerrar (Esc)" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="code-modal-title">{title || `${language} Snippet`}</span>
                  <span
                    className="code-lang-tag"
                    style={{
                      backgroundColor: langBadgeColor,
                      color: langBadgeTextColor,
                      fontWeight: 700
                    }}
                  >
                    {language}
                  </span>
                </div>
              </div>

              {/* Barra de Controles de la visión ampliada */}
              <div className="code-modal-toolbar">
                {/* Control de tamaño de fuente */}
                <div className="code-toolbar-group" title="Tamaño de texto">
                  <button
                    className="code-tool-btn"
                    onClick={() => setFontSize((prev) => Math.max(11, prev - 1))}
                    disabled={fontSize <= 11}
                    aria-label="Reducir fuente"
                  >
                    A-
                  </button>
                  <span className="code-font-indicator">{fontSize}px</span>
                  <button
                    className="code-tool-btn"
                    onClick={() => setFontSize((prev) => Math.min(22, prev + 1))}
                    disabled={fontSize >= 22}
                    aria-label="Aumentar fuente"
                  >
                    A+
                  </button>
                </div>

                {/* Alternar ajuste de línea */}
                <button
                  className={`code-tool-btn ${wrapLines ? 'active' : ''}`}
                  onClick={() => setWrapLines((prev) => !prev)}
                  title="Alternar ajuste de línea (Wrap)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 10 21 14 17 18" />
                    <path d="M3 6h18" />
                    <path d="M3 12h15a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H3" />
                  </svg>
                  <span>{wrapLines ? 'Líneas Ajustadas' : 'Sin Ajuste'}</span>
                </button>

                {/* Copiar */}
                <button
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  title="Copiar código"
                >
                  {copied ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4ade80' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>¡Copiado!</span>
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copiar</span>
                    </span>
                  )}
                </button>

                {/* Cerrar modal */}
                <button
                  className="code-close-modal-btn"
                  onClick={() => setIsExpanded(false)}
                  title="Cerrar visión ampliada (Esc)"
                  aria-label="Cerrar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="kbd-hint">ESC</span>
                </button>
              </div>
            </div>

            <div className="code-modal-body">
              <div className="code-body-wrapper expanded-body">
                {lines.length > 1 && (
                  <div
                    className="code-line-numbers"
                    style={{ fontSize: `${fontSize}px` }}
                    aria-hidden="true"
                  >
                    {lines.map((_, i) => (
                      <span key={i} className="line-num">{i + 1}</span>
                    ))}
                  </div>
                )}
                <pre
                  className="code-pre"
                  style={{
                    fontSize: `${fontSize}px`,
                    whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
                    wordBreak: wrapLines ? 'break-word' : 'normal'
                  }}
                >
                  <code
                    className={`code-highlight language-${normalizedLang}`}
                    style={{
                      fontSize: `${fontSize}px`,
                      whiteSpace: wrapLines ? 'pre-wrap' : 'pre'
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                </pre>
              </div>
            </div>

            <div className="code-modal-footer">
              <span>{lines.length} líneas &bull; {code.length} caracteres &bull; {normalizedLang.toUpperCase()}</span>
              <span style={{ color: '#565f89' }}>Haz clic fuera o presiona <kbd style={{ background: '#24283b', padding: '1px 5px', borderRadius: '3px', color: '#c0caf5', border: '1px solid #3b4261' }}>ESC</kbd> para salir</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
