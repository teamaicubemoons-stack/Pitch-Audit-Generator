import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import AuditResult from './pages/AuditResult';
import Login from './components/Login';
import { LogOut, ShieldCheck, User } from 'lucide-react';

// Wrapper for Private Routes
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] bg-slate-50">
      
      {user && (
        <nav className="bg-[#0F172A] text-white px-8 py-3 flex items-center justify-between shadow-2xl sticky top-0 z-[1000] border-b border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-lg">
              <img 
                src="/logo.png" 
                alt="Cubemoons" 
                className="w-10 h-10 object-contain" 
                onError={(e) => { e.target.src = "https://cubemoons.com/assets/logo/cubemoons-favicon.svg" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-[0.2em] uppercase">Cubemoons</span>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Intelligence Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
              <User size={12} className="text-[#00D1FF]" />
              <span className="text-[10px] font-bold tracking-tight text-blue-50">{user.username} <span className="text-blue-400/50 ml-1 opacity-70">({user.role})</span></span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-[10px] font-black uppercase tracking-widest group"
            >
              <LogOut size={14} className="group-hover:text-blue-400 transition-colors" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/result" 
            element={
              <ProtectedRoute>
                <AuditResult />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {user && (
        <footer className="bg-white py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 mb-2 opacity-30">
             <img src="/logo.png" alt="CM" className="w-6 h-6 grayscale object-contain" />
          </div>
          <p>&copy; {new Date().getFullYear()} Cubemoons Pvt. Ltd. • Strategic Internal Tool</p>
        </footer>
      )}
    </div>
  );
}

export default App;
