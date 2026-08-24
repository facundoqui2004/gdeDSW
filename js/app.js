/**
 * SuperGestor Backend Docs - Interactive Application
 * Estilo Express.js & MikroORM
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTabs();
  initCopyButtons();
  initApiTesters();
  initQuizzes();
  initSearch();
  initTocHighlight();
});

/* ==========================================================================
   1. Tema Claro / Oscuro
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('sg_docs_theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sg_docs_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('title', theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro');
}

/* ==========================================================================
   2. Navegación y Sidebar
   ========================================================================== */
function initNavigation() {
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');

  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Cerrar sidebar al hacer clic fuera en móviles
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Manejo de secciones (Home vs Controlador)
  const navLinks = document.querySelectorAll('.nav-route');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      if (targetId) {
        e.preventDefault();
        showSection(targetId);
        window.location.hash = targetId;
      }
    });
  });

  // Chequear hash inicial en la URL
  if (window.location.hash) {
    const targetHash = window.location.hash.substring(1);
    const validSection = document.getElementById(targetHash);
    if (validSection && validSection.classList.contains('doc-section')) {
      showSection(targetHash);
    }
  }
}

function showSection(sectionId) {
  const sections = document.querySelectorAll('.doc-section');
  sections.forEach(sec => {
    sec.style.display = 'none';
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar enlaces activos en el sidebar
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    const route = item.querySelector('.nav-route');
    if (route && route.getAttribute('data-target') === sectionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Actualizar breadcrumbs
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (breadcrumbCurrent) {
    if (sectionId === 'section-home') {
      breadcrumbCurrent.textContent = 'Introducción & Arquitectura';
    } else if (sectionId === 'section-metahumano-controller') {
      breadcrumbCurrent.textContent = 'metahumano.controller.ts';
    }
  }

  // Actualizar tabla de contenidos
  generateTocForCurrentSection(sectionId);
}

/* ==========================================================================
   3. Tabla de Contenidos Dinámica (TOC)
   ========================================================================== */
function generateTocForCurrentSection(sectionId) {
  const tocContainer = document.getElementById('toc-content');
  if (!tocContainer) return;

  const currentSection = document.getElementById(sectionId);
  if (!currentSection) return;

  const headings = currentSection.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocContainer.innerHTML = '<p class="text-muted" style="font-size:12px;">Sin apartados</p>';
    return;
  }

  let html = '<ul class="toc-list">';
  headings.forEach(heading => {
    const id = heading.id || heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    heading.id = id;
    
    const isH3 = heading.tagName.toLowerCase() === 'h3';
    const indentStyle = isH3 ? 'padding-left: 12px; font-size: 11.5px;' : 'font-weight: 500;';

    html += `
      <li style="${indentStyle}">
        <a href="#${id}" class="toc-link" data-id="${id}">${heading.textContent.replace('🔗', '').trim()}</a>
      </li>
    `;
  });
  html += '</ul>';

  tocContainer.innerHTML = html;
}

function initTocHighlight() {
  window.addEventListener('scroll', () => {
    const headings = document.querySelectorAll('.doc-section[style*="display: block"] h2, .doc-section:not([style*="display: none"]) h2');
    const scrollPos = window.scrollY + 100;

    let activeHeading = null;
    headings.forEach(h => {
      if (h.offsetTop <= scrollPos) {
        activeHeading = h;
      }
    });

    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
      if (activeHeading && link.getAttribute('data-id') === activeHeading.id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   4. Pestañas / Tabs en Cajas de Código
   ========================================================================== */
function initTabs() {
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (!tabBtn) return;

    const box = tabBtn.closest('.breakdown-box');
    if (!box) return;

    const tabTarget = tabBtn.getAttribute('data-tab');

    // Desactivar todos los botones de esta caja
    box.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabBtn.classList.add('active');

    // Mostrar el contenido correspondiente
    box.querySelectorAll('.tab-content').forEach(content => {
      if (content.getAttribute('data-tab-pane') === tabTarget) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   5. Botones para Copiar Código
   ========================================================================== */
function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;

    const container = copyBtn.closest('.code-container');
    if (!container) return;

    const codeEl = container.querySelector('pre code');
    if (!codeEl) return;

    const textToCopy = codeEl.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '¡Copiado!';
      copyBtn.style.color = '#28a745';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.color = '';
      }, 2000);
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
    });
  });
}

/* ==========================================================================
   6. Simulador / Tester Interactivo de API
   ========================================================================== */
function initApiTesters() {
  // Simulador de crearPerfilMetahumano
  const runRegistroBtn = document.getElementById('run-registro-btn');
  if (runRegistroBtn) {
    runRegistroBtn.addEventListener('click', () => {
      const inputVal = document.getElementById('tester-registro-input').value;
      const responseEl = document.getElementById('tester-registro-output');
      
      try {
        const payload = JSON.parse(inputVal);
        
        // Simular lógica de validaciones de metahumano.controller.ts
        if (!payload.usuarioId || !payload.nombre || !payload.alias || !payload.origen) {
          responseEl.textContent = JSON.stringify({
            status: 400,
            error: "Bad Request",
            message: "Campos requeridos: usuarioId, nombre, alias, origen"
          }, null, 2);
          responseEl.style.borderLeft = "4px solid #dc3545";
          return;
        }

        const tipo = (payload.tipoMeta || '').toUpperCase();
        let entityCreated = {};
        
        if (tipo === 'HEROE' || tipo === 'HERÓE') {
          entityCreated = {
            id: Math.floor(Math.random() * 100) + 1,
            nombre: payload.nombre,
            alias: payload.alias,
            origen: payload.origen,
            tipoMeta: "heroe",
            nivelFama: payload.nivelFama || "Bajo",
            estatus: "activo",
            numeroVictorias: payload.numeroVictorias || 0,
            usuarioId: payload.usuarioId,
            email: "heroe.nuevo@supergestor.gov",
            telefono: "+54 11 4455-6677",
            latitud: payload.latitud ? Number(payload.latitud) : null,
            longitud: payload.longitud ? Number(payload.longitud) : null
          };
        } else if (tipo === 'VILLANO') {
          entityCreated = {
            id: Math.floor(Math.random() * 100) + 1,
            nombre: payload.nombre,
            alias: payload.alias,
            origen: payload.origen,
            tipoMeta: "villano",
            nivelPeligrosidad: payload.nivelPeligrosidad || "Baja",
            estado: "activo",
            recompensa: 0,
            usuarioId: payload.usuarioId,
            email: "villano.nuevo@supergestor.gov",
            telefono: "+54 11 9988-1122",
            latitud: payload.latitud ? Number(payload.latitud) : null,
            longitud: payload.longitud ? Number(payload.longitud) : null
          };
        } else {
          entityCreated = {
            id: Math.floor(Math.random() * 100) + 1,
            nombre: payload.nombre,
            alias: payload.alias,
            origen: payload.origen,
            tipoMeta: "metahumano",
            usuarioId: payload.usuarioId,
            email: "metahumano@supergestor.gov",
            telefono: "+54 11 1234-5678"
          };
        }

        responseEl.textContent = JSON.stringify({
          status: 201,
          message: "Perfil de metahumano creado exitosamente",
          data: entityCreated
        }, null, 2);
        responseEl.style.borderLeft = "4px solid #28a745";

      } catch (err) {
        responseEl.textContent = JSON.stringify({
          status: 400,
          error: "JSON Parse Error",
          message: "El cuerpo de la petición no tiene un formato JSON válido"
        }, null, 2);
        responseEl.style.borderLeft = "4px solid #dc3545";
      }
    });
  }

  // Simulador de definirEstiloVida
  const runEstiloBtn = document.getElementById('run-estilo-btn');
  if (runEstiloBtn) {
    runEstiloBtn.addEventListener('click', () => {
      const inputVal = document.getElementById('tester-estilo-input').value;
      const responseEl = document.getElementById('tester-estilo-output');

      try {
        const payload = JSON.parse(inputVal);
        const tipoMeta = (payload.tipoMeta || '').toUpperCase();

        if (!tipoMeta) {
          responseEl.textContent = JSON.stringify({
            status: 400,
            message: "El campo tipoMeta es requerido (HEROE o VILLANO)"
          }, null, 2);
          responseEl.style.borderLeft = "4px solid #dc3545";
          return;
        }

        if (tipoMeta !== 'HEROE' && tipoMeta !== 'HERÓE' && tipoMeta !== 'VILLANO') {
          responseEl.textContent = JSON.stringify({
            status: 400,
            message: "tipoMeta inválido. Debe ser HEROE o VILLANO"
          }, null, 2);
          responseEl.style.borderLeft = "4px solid #dc3545";
          return;
        }

        let data = {};
        if (tipoMeta === 'HEROE' || tipoMeta === 'HERÓE') {
          data = {
            id: 12,
            nombre: "Barry Allen",
            alias: "The Flash",
            origen: "Accidente con acelerador de partículas",
            tipoMeta: "heroe",
            nivelFama: payload.nivelFama || "Alto",
            estatus: payload.estatus || "activo",
            numeroVictorias: payload.numeroVictorias || 15,
            mision: payload.mision || "Proteger Central City"
          };
        } else {
          // Villano: recompensa calculada de multas
          const multasSimuladas = [
            { id: 1, montoMulta: 15000, estado: "PENDIENTE" },
            { id: 2, montoMulta: 35000, estado: "EMITIDA" }
          ];
          const recompensaCalculada = multasSimuladas.reduce((acc, m) => acc + m.montoMulta, 0);

          data = {
            id: 12,
            nombre: "Leonard Snart",
            alias: "Captain Cold",
            origen: "Armamento criogénico avanzado",
            tipoMeta: "villano",
            nivelPeligrosidad: payload.nivelPeligrosidad || "Alta",
            estado: payload.estado || "activo",
            recompensa: recompensaCalculada,
            motivacion: payload.motivacion || "El control del bajo mundo criminal",
            _notaNegocio: "Recompensa calculada automáticamente sumando multas impagas ($50,000)"
          };
        }

        responseEl.textContent = JSON.stringify({
          status: 200,
          message: `Estilo de vida definido como ${tipoMeta} exitosamente`,
          data: data
        }, null, 2);
        responseEl.style.borderLeft = "4px solid #28a745";

      } catch (err) {
        responseEl.textContent = JSON.stringify({
          status: 400,
          error: "JSON Parse Error",
          message: "Formato JSON inválido"
        }, null, 2);
        responseEl.style.borderLeft = "4px solid #dc3545";
      }
    });
  }
}

/* ==========================================================================
   7. Quizzes Interactivos
   ========================================================================== */
function initQuizzes() {
  document.addEventListener('click', (e) => {
    const option = e.target.closest('.quiz-option');
    if (!option) return;

    const question = option.closest('.quiz-question');
    if (!question) return;

    // Desactivar opciones anteriores
    question.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('correct', 'incorrect');
    });

    const isCorrect = option.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      option.classList.add('correct');
    } else {
      option.classList.add('incorrect');
      // Mostrar la correcta
      const correctOpt = question.querySelector('[data-correct="true"]');
      if (correctOpt) correctOpt.classList.add('correct');
    }

    // Mostrar explicación
    const explanation = question.querySelector('.quiz-explanation');
    if (explanation) {
      explanation.style.display = 'block';
      explanation.style.backgroundColor = isCorrect ? 'var(--tip-bg)' : 'var(--warn-bg)';
      explanation.style.color = isCorrect ? 'var(--tip-text)' : 'var(--warn-text)';
      explanation.style.border = isCorrect ? '1px solid var(--tip-border)' : '1px solid var(--warn-border)';
    }
  });
}

/* ==========================================================================
   8. Buscador en Tiempo Real
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) return;

    // Buscar en títulos y párrafos
    const currentSection = document.querySelector('.doc-section[style*="display: block"]') || document.getElementById('section-home');
    if (!currentSection) return;

    const searchableElements = currentSection.querySelectorAll('h2, h3, h4, p, code');
    let firstMatch = null;

    searchableElements.forEach(el => {
      if (el.textContent.toLowerCase().includes(query)) {
        if (!firstMatch) firstMatch = el;
      }
    });

    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}
