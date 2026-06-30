import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Appointments from './pages/Appointments';
import Schedule from './pages/Schedule';
import Chat from './pages/Chat';

// Doctor Layout Wrapper
const DoctorLayout = () => {
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

          {/* Protected Doctor Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Appointments />} />
            <Route path="schedule" element={<Schedule />} />
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
