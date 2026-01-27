import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import RatePlans from "./pages/admin/RatePlans";
import ManageAddons from "./pages/admin/Addons";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AuditLogs from "./pages/admin/AuditLogs";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const { user, logout } = useAuthStore();
  const [contactNumber, setContactNumber] = useState("+233535975422");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navFx =
    "relative inline-block group text-gray-600 hover:text-gray-900 transition-transform duration-300 ease-out hover:scale-[1.03] " +
    "before:content-[''] before:absolute before:left-0 before:-bottom-1 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-yellow-500 before:via-orange-500 before:to-pink-500 before:transition-all before:duration-500 group-hover:before:w-full";
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
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
    <ErrorBoundary>
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
              <div className="hidden md:flex space-x-4">
                <Link to="/" className={navFx}>
                  Home
                </Link>
                <Link to="/about" className={navFx}>
                  About
                </Link>
                <Link to="/rooms" className={navFx}>
                  Rooms
                </Link>
                {user ? (
                  <>
                    <Link to="/bookings" className={navFx}>
                      My Bookings
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className={navFx}>
                        Admin
                      </Link>
                    )}
                    {user.role === "manager" && (
                      <Link to="/manager" className={navFx}>
                        Manager
                      </Link>
                    )}
                    {user.role === "receptionist" && (
                      <Link to="/receptionist" className={navFx}>
                        Reception
                      </Link>
                    )}
                    <Link to="/profile" className={navFx}>
                      Profile
                    </Link>
                    <button onClick={logout} className={navFx}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={navFx}>
                      Login
                    </Link>
                    <Link to="/register" className={navFx}>
                      Register
                    </Link>
                  </>
                )}
              </div>
              <button
                aria-label="Open menu"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMobileOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </nav>
          {mobileOpen && (
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-4/5 max-w-xs bg-white shadow-xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-yellow-700">
                    Menu
                  </span>
                  <button
                    aria-label="Close menu"
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <Link
                    to="/"
                    className={navFx}
                    onClick={() => setMobileOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className={navFx}
                    onClick={() => setMobileOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/rooms"
                    className={navFx}
                    onClick={() => setMobileOpen(false)}
                  >
                    Rooms
                  </Link>
                  {user ? (
                    <>
                      <Link
                        to="/bookings"
                        className={navFx}
                        onClick={() => setMobileOpen(false)}
                      >
                        My Bookings
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className={navFx}
                          onClick={() => setMobileOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      {user.role === "manager" && (
                        <Link
                          to="/manager"
                          className={navFx}
                          onClick={() => setMobileOpen(false)}
                        >
                          Manager
                        </Link>
                      )}
                      {user.role === "receptionist" && (
                        <Link
                          to="/receptionist"
                          className={navFx}
                          onClick={() => setMobileOpen(false)}
                        >
                          Reception
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className={navFx}
                        onClick={() => setMobileOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          logout();
                        }}
                        className={navFx}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className={navFx}
                        onClick={() => setMobileOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className={navFx}
                        onClick={() => setMobileOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
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
                path="/forgot-password"
                element={
                  <div className="container mx-auto p-4">
                    <ForgotPassword />
                  </div>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <div className="container mx-auto p-4">
                    <ResetPassword />
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <div className="container mx-auto p-4">
                      <AdminDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager"
                element={
                  <ProtectedRoute roles={["manager"]}>
                    <div className="container mx-auto p-4">
                      <ManagerDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist"
                element={
                  <ProtectedRoute roles={["receptionist"]}>
                    <div className="container mx-auto p-4">
                      <ReceptionistDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rate-plans"
                element={
                  <ProtectedRoute roles={["admin", "manager", "receptionist"]}>
                    <div className="container mx-auto p-4">
                      <RatePlans />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/addons"
                element={
                  <ProtectedRoute roles={["admin", "manager", "receptionist"]}>
                    <div className="container mx-auto p-4">
                      <ManageAddons />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute roles={["admin", "manager", "receptionist"]}>
                    <div className="container mx-auto p-4">
                      <Reports />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <div className="container mx-auto p-4">
                      <Settings />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <div className="container mx-auto p-4">
                      <AuditLogs />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
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
    </ErrorBoundary>
  );
}

export default App;
