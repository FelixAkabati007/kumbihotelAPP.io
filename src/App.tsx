import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import RatePlans from "./pages/admin/RatePlans";
import ManageAddons from "./pages/admin/Addons";
import Reports from "./pages/admin/Reports";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, logout } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Kumbisaly Heritage Logo"
                className="h-12 w-12 rounded-full border-2 border-yellow-600"
              />
              <span className="text-xl font-bold text-yellow-700 hidden sm:block">
                Kumbisaly Heritage
              </span>
            </Link>
            <div className="space-x-4">
              <Link to="/rooms" className="text-gray-600 hover:text-gray-900">
                Rooms
              </Link>
              {user ? (
                <>
                  <Link
                    to="/bookings"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Bookings
                  </Link>
                  {["manager", "receptionist"].includes(user.role) && (
                    <Link
                      to="/admin"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Register
                  </Link>
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
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rate-plans"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <RatePlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/addons"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <ManageAddons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
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
