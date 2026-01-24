import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
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
import Settings from "./pages/admin/Settings";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, logout } = useAuthStore();
  const [contactNumber, setContactNumber] = useState("+233535975422");

  useEffect(() => {
    const fetchSettings = () => {
      fetch("/api/settings/contact_number")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.value) {
            setContactNumber(data.value);
          }
        })
        .catch(() => {
          // keep default contact number without logging error
        });
    };

    fetchSettings();
    window.addEventListener("settings-updated", fetchSettings);
    return () => window.removeEventListener("settings-updated", fetchSettings);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cover bg-[center_65%] relative bg-fixed bg-hero">
        <div className="fixed inset-0 bg-black bg-opacity-40 pointer-events-none z-0"></div>
        <nav className="bg-white/90 backdrop-blur-sm shadow-sm p-4 relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Kumbisaly Heritage Logo"
                className="h-12 w-12 rounded-full border-2 border-yellow-600"
              />
              <span className="text-xl font-bold text-yellow-700 hidden sm:block">
                Kumbisaly Heritage Hotel & Restaurant
              </span>
            </Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
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
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/login"
              element={
                <div className="container mx-auto p-4">
                  <Login />
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <div className="container mx-auto p-4">
                  <Register />
                </div>
              }
            />
            <Route
              path="/rooms"
              element={
                <div className="container mx-auto p-4">
                  <Rooms />
                </div>
              }
            />
            <Route
              path="/rooms/:id"
              element={
                <div className="container mx-auto p-4">
                  <RoomDetails />
                </div>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto p-4">
                    <MyBookings />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto p-4">
                    <Checkout />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <div className="container mx-auto p-4">
                    <AdminDashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rate-plans"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <div className="container mx-auto p-4">
                    <RatePlans />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/addons"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <div className="container mx-auto p-4">
                    <ManageAddons />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute roles={["manager", "receptionist"]}>
                  <div className="container mx-auto p-4">
                    <Reports />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute roles={["manager"]}>
                  <div className="container mx-auto p-4">
                    <Settings />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>
            © 2026 Kumbisaly Heritage Hotel &amp; Restaurant. Contact:{" "}
            {contactNumber}
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
