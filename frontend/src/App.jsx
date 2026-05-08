import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuditResult from './pages/AuditResult';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="https://cubemoons.com/assets/logo/cubemoons-favicon.svg" alt="Cubemoons" className="w-8 h-8" />
          <span className="font-bold text-xl tracking-wide">CUBEMOONS</span>
        </div>
        <div className="text-sm font-medium text-gray-300">
          AI Audit Generator
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<AuditResult />} />
        </Routes>
      </main>

      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} Cubemoons Pvt. Ltd. Confidential Internal Tool.</p>
      </footer>
    </div>
  );
}

export default App;
