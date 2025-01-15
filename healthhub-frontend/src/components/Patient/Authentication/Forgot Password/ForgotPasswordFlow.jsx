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
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Current state:', { email, otp });
  }, [email, otp]);

  const handleTransition = async (callback) => {
    setShowTransition(true);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await callback();
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error during transition:', error);
      throw error;
    } finally {
      setShowTransition(false);
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (email) => {
    await handleTransition(async () => {
      try {
        const response = await fetch('https://anochat.in/v1/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase()
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.data?.message || 'Failed to send email');
        }

        setEmail(email.trim().toLowerCase());
        navigate('/forgot-password/verify');
      } catch (error) {
        throw new Error('Failed to process email submission');
      }
    });
  };

  const handleOTPSubmit = async (otpValue) => {
    await handleTransition(async () => {
      try {
        const response = await fetch('https://anochat.in/v1/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp: otpValue
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.data?.message || 'Failed to verify OTP');
        }

        setOtp(otpValue);
        navigate('/forgot-password/reset');
      } catch (error) {
        throw new Error('Failed to verify OTP');
      }
    });
  };

  const handlePasswordReset = async (newPassword) => {
    await handleTransition(async () => {
      try {
        const response = await fetch('https://anochat.in/v1/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
            new_password: newPassword
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (data.data?.message === 'invalid OTP') {
            setOtp('');
            navigate('/forgot-password/verify');
            throw new Error('OTP has expired. Please request a new OTP.');
          }
          throw new Error(data.data?.message || 'Failed to reset password');
        }

        setEmail('');
        setOtp('');
        navigate('/auth');
      } catch (error) {
        console.error('Password reset error:', error);
        throw error;
      }
    });
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('https://anochat.in/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.data?.message || 'Failed to send OTP');
      }

      setTimer(30);
      setCanResend(false);

      setOtp(['', '', '', '', '', '']);
      setFocusedInput(0);
      setError('');
    } catch (error) {
      setError('Failed to send new OTP. Please try again.');
    }
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
              onResendOTP={handleEmailSubmit}
              isLoading={isLoading}
            />
          } />

          <Route path="reset" element={
            <NewPasswordStep
              email={email}
              otp={otp}
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