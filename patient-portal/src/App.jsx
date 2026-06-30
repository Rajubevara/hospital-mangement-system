import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import BookAppointment from './pages/BookAppointment';
import Bookings from './pages/Bookings';
import Prescriptions from './pages/Prescriptions';
import Chat from './pages/Chat';

// Patient Layout Wrapper
const PatientLayout = () => {
  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Pages */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Patient Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BookAppointment />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="chat" element={<Chat />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
