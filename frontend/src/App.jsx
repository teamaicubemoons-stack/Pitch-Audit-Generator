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
    <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] relative">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      
      {user && (
        <nav className="glass-card sticky top-0 z-[1000] px-8 py-4 flex items-center justify-between border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <img 
                src="/logo.png" 
                alt="CM" 
                className="w-8 h-8 object-contain" 
                onError={(e) => { e.target.src = "https://cubemoons.com/assets/logo/cubemoons-favicon.svg" }}
              />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-none">Cubemoons</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Audit AI Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <User size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="premium-button-primary text-sm flex items-center gap-2"
            >
              <LogOut size={16} />
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
             <img src="/logo.png" alt="CM" className="w-8 h-8 object-contain" />
          </div>
          <p>&copy; {new Date().getFullYear()} Cubemoons Pvt. Ltd. • Strategic Internal Tool</p>
        </footer>
      )}
    </div>
  );
}

export default App;
