import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, logout } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-yellow-700">Kumbisaly Hotel</Link>
            <div className="space-x-4">
              <Link to="/rooms" className="text-gray-600 hover:text-gray-900">Rooms</Link>
              {user ? (
                <>
                  <Link to="/bookings" className="text-gray-600 hover:text-gray-900">My Bookings</Link>
                  {['manager', 'receptionist'].includes(user.role) && (
                    <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
                  )}
                  <button onClick={logout} className="text-gray-600 hover:text-gray-900">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                  <Link to="/register" className="text-gray-600 hover:text-gray-900">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2026 Kumbisaly Heritage Hotel. Contact: +233535975422</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
