import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LockKeyhole, Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import DoctorAuthPage from './DoctorAuthPage';
import DoctorOTPVerification from './DoctorOTPVerification';
import DoctorProfileForm from '../Profile/DoctorProfileForm';
import DoctorForgotPasswordFlow from './ForgotPassword/DoctorForgotPasswordFlow';
import DoctorLayout from '../Dashboard/DoctorLayout.jsx';
import DoctorDashboard from '../Dashboard/DoctorDashboard.jsx';
import AppointmentsPage from '../Dashboard/AppointmentsPage';
import ChatInterface from '../Dashboard/ChatInterface';
import DoctorSchedule from '../Dashboard/DoctorSchedule';
import PrescriptionsPage from '../Dashboard/PrescriptionsPage';
import BillingSettings from '../Dashboard/PaymentDetails';
import AnalyticsDashboard from '../Dashboard/AnalyticsDashboard';
import EditProfile from '../Dashboard/EditProfile';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const DoctorAuthFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  
  useEffect(() => {
    const logMount = () => {
      console.log('DoctorAuthFlow mounted');
      console.log('Current path:', location.pathname);
    };

    logMount();
    
    return () => {
      console.log('DoctorAuthFlow unmounted');
    };
  }, [location.pathname]);

  const DoctorProtectedRoute = ({ children }) => {
    return children;
  };
      
  
  const handleSignupComplete = useCallback(async (signupData) => {
    console.log('Handling doctor signup:', signupData);
    if (signupData?.success) {
      setEmail(signupData.email);
      setShowTransition(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/doctor/verify');
      } finally {
        setShowTransition(false);
      }
    }
  }, [navigate]);
  
  const handleLoginComplete = useCallback(async (loginData) => {
    console.log('Handling doctor login:', loginData);
    if (loginData?.data?.tokens) {
      setShowTransition(true);
      try {
        localStorage.setItem('doctor_access_token', loginData.data.tokens.access_token);
        localStorage.setItem('doctor_refresh_token', loginData.data.tokens.refresh_token);
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/doctor-dashboard');
      } finally {
        setShowTransition(false);
      }
    }
  }, [navigate]);
  
  const handleOTPComplete = useCallback(async () => {
    console.log('Handling OTP completion');
    setShowTransition(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/doctor/profile');
    } finally {
      setShowTransition(false);
    }
  }, [navigate]);

  const handleResendOTP = useCallback(async () => {
    console.log('Attempting to resend OTP for email:', email);
    try {
      const response = await fetch('https://anochat.in/v1/doctor/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      return true;
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      return false;
    }
  }, [email]);

  const handleProfileComplete = useCallback(async (profileData) => {
    console.log('Profile completion:', profileData);
    setShowTransition(true);
    try {
      const accessToken = localStorage.getItem('doctor_access_token');
      if (accessToken) {
        await fetch('https://anochat.in/v1/doctor/profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData)
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error('Profile save error:', error);
    } finally {
      setShowTransition(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto" />
          <p className="text-gray-600">Initializing doctor portal...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-white w-full">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            style: { background: '#10B981', color: 'white' },
            iconTheme: { primary: 'white', secondary: '#10B981' }
          },
          error: {
            style: { background: '#EF4444', color: 'white' },
            iconTheme: { primary: 'white', secondary: '#EF4444' }
          }
        }}
      />
      <AnimatePresence mode="wait">
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader className="w-12 h-12 text-white animate-spin mx-auto" />
                <p className="text-white text-xl">Please wait...</p>
              </div>
            </div>
          </motion.div>
        )}

        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={
            <PageTransition>
              <DoctorAuthPage 
                onLoginComplete={handleLoginComplete}
                onSignupComplete={handleSignupComplete}
              />
            </PageTransition>
          } />
          
          <Route path="/verify" element={
            <PageTransition>
              <DoctorOTPVerification
                email={email}
                onVerificationComplete={handleOTPComplete}
                onResendOTP={handleResendOTP}
              />
            </PageTransition>
          } />

          <Route path="/profile" element={
            <PageTransition>
              <DoctorProfileForm
                onComplete={handleProfileComplete}
              />
            </PageTransition>
          } />

          <Route path="/forgot-password/*" element={
            <PageTransition>
              <DoctorForgotPasswordFlow />
            </PageTransition>
          } />

          <Route path="/dashboard/*" element={
  <DoctorProtectedRoute>
    <PageTransition>
      <DoctorLayout>
        <Routes>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="schedule" element={<div><DoctorSchedule /></div>} />
          <Route path="chat" element={<ChatInterface />} />
          <Route path="prescriptions" element={<div><PrescriptionsPage /></div>} />
          <Route path="analytics" element={<div><AnalyticsDashboard /></div>} />
          <Route path="billing" element={<div><BillingSettings /></div>} />
          <Route path="settings" element={<div><EditProfile /></div>} />
        </Routes>
      </DoctorLayout>
    </PageTransition>
  </DoctorProtectedRoute>
} />

          <Route path="*" element={
            <PageTransition>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/doctor')}
                    className="px-6 py-3 bg-teal-500 text-white rounded-lg 
                      hover:bg-teal-600 transition-colors"
                  >
                    Return to Login
                  </motion.button>
                </div>
              </div>
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default DoctorAuthFlow;
