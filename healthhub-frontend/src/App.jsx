import React, { useState, createContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/authentication';
import OTPVerification from './components/otp_verification';
import HealthProfileForm from './components/medication_details';
import ForgotPasswordFlow from './components/ForgotPasswordFlow';
import Dashboard from './components/Dashboard';
import LoadingTransition from './components/LoadingTransition';

export const AuthContext = createContext(null);

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white">
    {children}
  </div>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = true; // actual auth check is required
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const App = () => {
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({});
    const [showLoading, setShowLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleAuthComplete = (userEmail) => {
      setEmail(userEmail);
      navigate('/otp-verification');
    };
  
    const handleOTPComplete = () => {
      navigate('/profile');
    };
  
    const handleProfileComplete = async (data) => {
        try {
          setFormData(data);
          setShowLoading(true);
          localStorage.setItem('healthProfile', JSON.stringify(data));
        } catch (error) {
          console.error('Error completing profile:', error);
          setShowLoading(false); 
        }
      };
  
    const handleLoadingComplete = () => {
      setShowLoading(false);
      navigate('/dashboard');
    };
  
    return (
      <AuthContext.Provider value={{ email, setEmail, formData, setFormData }}>
        <Layout>
          {showLoading && <LoadingTransition onComplete={handleLoadingComplete} />}
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route 
              path="/auth" 
              element={<AuthPage onComplete={handleAuthComplete} />} 
            />
            <Route 
              path="/forgot-password/*" 
              element={<ForgotPasswordFlow />} 
            />
            <Route 
              path="/otp-verification" 
              element={
                <OTPVerification 
                  email={email}
                  onVerificationComplete={handleOTPComplete}
                />
              } 
            />
            <Route 
              path="/profile" 
              element={
                <HealthProfileForm 
                  initialData={formData}
                  onComplete={handleProfileComplete}
                />
              } 
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                  <button
                    onClick={() => navigate('/auth')}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg"
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </Layout>
      </AuthContext.Provider>
    );
  };
  
  export default App;