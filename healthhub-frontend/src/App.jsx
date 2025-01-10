import React, {
  useState,
  createContext,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

import AuthPage from './components/authentication';
import OTPVerification from './components/otp_verification';
import HealthProfileForm from './components/medication_details';
import ForgotPasswordFlow from './components/ForgotPasswordFlow';
import DashboardLayout from './components/DashboardLayout';
import LoadingTransition from './components/LoadingTransition';

export const AuthContext = createContext({
  email: '',
  setEmail: () => { },
  formData: {},
  setFormData: () => { },
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  user: null,
  setUser: () => { }
});

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white">
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
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
  </div>
);

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

const useAuth = () => {
  const navigate = useNavigate();
  const tokenExpiryCheckRef = useRef(null);
  const refreshingRef = useRef(false);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const verifyAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return false;

      if (!isTokenExpired(accessToken)) {
        return true;
      }

      const response = await fetch('https://anochat.in/v1/protected/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Auth verification error:', error);
      return false;
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (refreshingRef.current) return false;
    refreshingRef.current = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken || isTokenExpired(refreshToken)) {
        throw new Error('No valid refresh token');
      }

      const accessToken = localStorage.getItem('access_token');
      if (accessToken && !isTokenExpired(accessToken)) {
        return true;
      }

      const response = await fetch('https://anochat.in/v1/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data?.success && data?.data?.tokens) {
        localStorage.setItem('access_token', data.data.tokens.access_token);
        if (data.data.tokens.refresh_token) {
          localStorage.setItem('refresh_token', data.data.tokens.refresh_token);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    if (tokenExpiryCheckRef.current) {
      clearInterval(tokenExpiryCheckRef.current);
    }
  }, []);

  return { verifyAuth, refreshAccessToken, clearAuth, isTokenExpired };
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyAuth, refreshAccessToken, clearAuth, isTokenExpired } = useAuth();
  const authCheckRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (authCheckRef.current) return;
      authCheckRef.current = true;

      try {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          throw new Error('No access token');
        }

        if (!isTokenExpired(accessToken)) {
          if (mounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setIsLoading(true);
        }

        const refreshSuccess = await refreshAccessToken();
        if (!refreshSuccess) {
          throw new Error('Token refresh failed');
        }

        const isValid = await verifyAuth();

        if (mounted) {
          setIsAuthenticated(isValid);
          if (!isValid) {
            clearAuth();
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          clearAuth();
          setIsAuthenticated(false);
          navigate('/auth', { replace: true });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
        authCheckRef.current = false;
      }
    };

    const timer = setTimeout(checkAuth, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigate, verifyAuth, refreshAccessToken, clearAuth, isTokenExpired]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white">
        <div className="relative bg-white p-8 rounded-2xl shadow-lg space-y-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 animate-pulse" />
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-lg animate-pulse" />
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-gray-600 text-center font-medium">
              Verifying your session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};
const App = () => {
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({});
  const [showLoading, setShowLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback((loginData) => {
    const { tokens, user } = loginData.data;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const handleAuthComplete = useCallback((userEmail, loginData) => {
    setEmail(userEmail);
    if (loginData) {
      handleAuthSuccess(loginData);
      navigate('/dashboard');
    } else {
      navigate('/otp-verification');
    }
  }, [navigate, handleAuthSuccess]);

  const handleOTPComplete = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleProfileComplete = useCallback(async (data) => {
    try {
      setFormData(data);
      setShowLoading(true);
      localStorage.setItem('healthProfile', JSON.stringify(data));
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to save profile');
      setShowLoading(false);
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    navigate('/dashboard');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      email,
      setEmail,
      formData,
      setFormData,
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUser
    }}>
      <Layout>
        {showLoading && <LoadingTransition onComplete={handleLoadingComplete} />}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/auth" element={
            <PageTransition>
              <AuthPage onComplete={handleAuthComplete} />
            </PageTransition>
          } />

          <Route path="/forgot-password/*" element={
            <PageTransition>
              <ForgotPasswordFlow />
            </PageTransition>
          } />

          <Route path="/otp-verification" element={
            <PageTransition>
              <OTPVerification
                email={email}
                onVerificationComplete={handleOTPComplete}
              />
            </PageTransition>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <PageTransition>
                <HealthProfileForm
                  initialData={formData}
                  onComplete={handleProfileComplete}
                />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />

          <Route path="*" element={
            <PageTransition>
              <div className="flex items-center justify-center min-h-screen">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4"
                >
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Page Not Found
                  </h2>
                  <p className="text-gray-600 mb-6">
                    The page you are looking for doesn't exist or has been moved.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/auth')}
                    className="px-6 py-3 bg-teal-500 text-white rounded-lg
                      hover:bg-teal-600 transition-colors duration-300"
                  >
                    Return to Login
                  </motion.button>
                </motion.div>
              </div>
            </PageTransition>
          } />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  );
};

export default App;