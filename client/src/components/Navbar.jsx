import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 relative">
      <div className="app-container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🅿️</div>
          <div>
            <div className="text-lg font-bold text-gray-800">Parking Manager</div>
            <div className="text-xs text-gray-500">Simple, fast parking for your site</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Admin
            </button>
          )}

          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="hidden sm:inline">👤</span> {user?.name}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile: hamburger */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-md bg-white/60 border border-gray-100"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div>
          <div className="nav-mobile-backdrop" onClick={() => setOpen(false)} />
          <div className="nav-mobile-panel card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{user?.name || 'Guest'}</div>
              <div className="text-xs text-gray-400">{user?.role || ''}</div>
            </div>

            <div className="flex flex-col gap-2">
              {user?.role === 'admin' && (
                <button onClick={() => { setOpen(false); navigate('/admin'); }} className="text-left text-sm text-blue-600 font-medium">Admin Panel</button>
              )}
              <button onClick={() => { setOpen(false); navigate('/dashboard'); }} className="text-left text-sm">Dashboard</button>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="text-left text-sm text-red-600">Logout</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}