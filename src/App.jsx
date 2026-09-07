import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import TableOfContents from './components/TableOfContents';
import HomeView from './views/HomeView';
import MetahumanoControllerView from './views/MetahumanoControllerView';
import MiddlewaresView from './views/MiddlewaresView';
import AppTsView from './views/AppTsView';
import MetahumanoEntityView from './views/MetahumanoEntityView';
import MetahumanoRoutesView from './views/MetahumanoRoutesView';
import AsincroniasView from './views/AsincroniasView';
import TestAutenticacionView from './views/TestAutenticacionView';
import TestAppView from './views/TestAppView';
import TestIntegracionApiView from './views/TestIntegracionApiView';
import UsuarioView from './views/UsuarioView';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [theme, setTheme] = useState('light');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('sg_docs_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Manejo de búsqueda simple en tiempo real
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      if (q.includes('usuario') || q.includes('login') || q.includes('registro') || q.includes('register') || q.includes('perfil') || q.includes('password') || q.includes('requireauth') || q.includes('requireroles')) {
        setActiveView('usuario-sistema');
      } else if (q.includes('metahumano') || q.includes('crud') || q.includes('sanitize') || q.includes('poder') || q.includes('estilo')) {
        setActiveView('metahumano-controller');
      } else if (q.includes('async') || q.includes('await') || q.includes('promesa') || q.includes('promise') || q.includes('asinc') || q.includes('callback')) {
        setActiveView('asincronias');
      } else if (q.includes('bcrypt') || q.includes('jwt') || q.includes('hash') || q.includes('autenticac')) {
        setActiveView('test-autenticacion');
      } else if (q.includes('integracion') || q.includes('integración') || q.includes('supertest') || q.includes('401') || q.includes('403') || q.includes('role') || q.includes('rol')) {
        setActiveView('test-integracion-api');
      } else if (q.includes('arquitectura') || q.includes('instancia') || q.includes('app.test') || q.includes('router stack')) {
        setActiveView('test-app');
      } else if (q.includes('token') || q.includes('test')) {
        setActiveView('test-autenticacion');
      }
    }
  }, [searchQuery]);

  return (
    <>
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        setTheme={setTheme}
        onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Breadcrumb 
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="app-container">
        <Sidebar 
          activeView={activeView}
          setActiveView={setActiveView}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <main id="main-content">
          {activeView === 'home' && <HomeView setActiveView={setActiveView} />}
          {activeView === 'metahumano-controller' && <MetahumanoControllerView />}
          {activeView === 'middlewares' && <MiddlewaresView />}
          {activeView === 'app-ts' && <AppTsView />}
          {activeView === 'metahumano-entity' && <MetahumanoEntityView />}
          {activeView === 'metahumano-routes' && <MetahumanoRoutesView />}
          {activeView === 'asincronias' && <AsincroniasView />}
          {activeView === 'test-autenticacion' && <TestAutenticacionView />}
          {activeView === 'test-app' && <TestAppView />}
          {activeView === 'test-integracion-api' && <TestIntegracionApiView />}
          {activeView === 'usuario-sistema' && <UsuarioView />}
        </main>

        <TableOfContents activeView={activeView} />
      </div>

      <footer id="footer">
        <div className="footer-container">
          <div className="footer-links">
            <button onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Inicio
            </button>
            <button onClick={() => { setActiveView('metahumano-controller'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Metahumanos Controller
            </button>
            <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">Express.js</a>
            <a href="https://mikro-orm.io/" target="_blank" rel="noopener noreferrer">MikroORM</a>
          </div>
          <p>SuperGestor Backend Docs &copy; 2026. Construido con React.js + Node.js.</p>
        </div>
      </footer>
    </>
  );
}
