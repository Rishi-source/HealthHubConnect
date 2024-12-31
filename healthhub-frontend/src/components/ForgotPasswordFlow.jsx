import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LockKeyhole, Loader, Heart } from 'lucide-react';
import { EmailStep } from './EmailStep';
import { OTPStep } from './OTPStep';
import { NewPasswordStep } from './NewPasswordStep';

const TransitionOverlay = ({ isVisible }) => {
  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 bg-white/5 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                  }}
                  transition={{
                    duration: 5,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    top: `${30 + i * 20}%`,
                    left: `${20 + i * 30}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center space-y-8"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 border-4 border-white/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div
                    className="absolute inset-0 border-t-4 border-white rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={pulseAnimation}
                >
                  <LockKeyhole className="w-8 h-8 text-white mr-20" />
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-xl font-medium text-white">
                  Please wait
                </h3>
                <p className="text-white/80">
                  Securing your session...
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ForgotPasswordFlow = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTransition = async (callback) => {
    setShowTransition(true);
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await callback();
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error during transition:', error);
    } finally {
      setShowTransition(false);
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (email) => {
    await handleTransition(async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            type: 'forgot_password_email',
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        await response.json();
        setEmail(email);
        navigate('/forgot-password/verify');
      } catch (error) {
        throw new Error('Failed to process email submission');
      }
    });
  };

  const handleOTPSubmit = async (otp) => {
    await handleTransition(async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
            type: 'verify_otp',
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to verify OTP');
        }

        await response.json();
        navigate('/forgot-password/reset');
      } catch (error) {
        throw new Error('Failed to verify OTP');
      }
    });
  };

  const handlePasswordReset = async (newPassword) => {
    await handleTransition(async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            newPassword,
            type: 'reset_password',
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reset password');
        }

        await response.json();
        navigate('/auth');
      } catch (error) {
        throw new Error('Failed to reset password');
      }
    });
  };

  return (
    <>
      <TransitionOverlay isVisible={showTransition} />
      
      <motion.div 
        key={location.pathname}
        className="bg-white rounded-3xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          <Route index element={
            <EmailStep 
              onSubmit={handleEmailSubmit}
              onBack={() => navigate('/auth')}
              isLoading={isLoading}
            />
          } />
          
          <Route path="verify" element={
            <OTPStep
              email={email}
              onSubmit={handleOTPSubmit}
              onResendOTP={() => console.log('Resend OTP')}
              isLoading={isLoading}
            />
          } />
          
          <Route path="reset" element={
            <NewPasswordStep
              onSubmit={handlePasswordReset}
              isLoading={isLoading}
            />
          } />

          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </motion.div>
    </>
  );
};

export default ForgotPasswordFlow;