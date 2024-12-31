import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ArrowRight, Check, LockKeyhole, RefreshCw, 
  Sparkles, Heart, AlertCircle 
} from 'lucide-react';

const HeartbeatLine = ({ top, opacity = 1 }) => {
  return (
    <div
      className="absolute pointer-events-none overflow-hidden"
      style={{ top, left: 0, right: 0, opacity }}
    >
      <svg viewBox="0 0 900 100" className="w-full h-20 stroke-current">
        <path
          d="M0,50 L200,50 L230,20 L260,80 L290,20 L320,80 L350,50 L600,50 L630,20 L660,80 L690,20 L720,80 L750,50 L900,50"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          className="heartbeat-line"
        />
      </svg>
    </div>
  );
};

const TimerCircle = ({ seconds, maxSeconds }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / maxSeconds) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="text-teal-500 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-medium text-gray-600">
        {seconds}
      </div>
    </div>
  );
};

const OTPInput = ({ 
  value, 
  onChange, 
  index,
  isFocused,
  onFocus,
  onKeyDown,
  isComplete,
  disabled
}) => {
  const inputRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="relative group">
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.1 : 1,
          opacity: isFocused ? 1 : 0.8
        }}
        className="relative"
      >
        <input
          ref={inputRef}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onFocus={() => onFocus(index)}
          disabled={disabled}
          className={`
            w-14 h-16 text-center text-2xl font-bold 
            border-2 rounded-xl outline-none
            transition-all duration-300
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${isFocused 
              ? 'border-teal-500 bg-teal-50/50 ring-4 ring-teal-500/20' 
              : 'border-gray-200 hover:border-gray-300'
            }
            ${value 
              ? 'bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600' 
              : 'bg-white text-gray-700'
            }
            ${isAnimating ? 'animate-bounce-soft' : ''}
            ${isComplete && value ? 'border-green-500' : ''}
          `}
        />
      </motion.div>

      <motion.div 
        className="mt-2 h-1.5 w-1.5 rounded-full mx-auto"
        animate={{
          scale: value ? 1 : 0.75,
          backgroundColor: value ? '#14b8a6' : '#d1d5db'
        }}
      />

      {isAnimating && value && (
        <Sparkles 
          className="absolute top-0 right-0 text-teal-500 
            transform -translate-y-1/2 translate-x-1/2 animate-ping" 
        />
      )}
    </div>
  );
};

export const OTPStep = ({ onSubmit, onBack , email, onVerificationComplete }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    setFocusedInput(0);
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev <= 1 ? (setCanResend(true), 0) : prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOTPChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    setError('');

    if (value && index < 5) {
      setFocusedInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setFocusedInput(index - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedInput(index - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setFocusedInput(index + 1);
      e.preventDefault();
    }
  };

  const makeAPICall = async (endpoint, data) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.every(digit => digit !== '')) {
      setError('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await makeAPICall('/verify', {
        email,
        otp: otp.join(''),
        type: 'otp_verification',
        timestamp: new Date().toISOString()
      });

      setVerificationComplete(true);
      onSubmit(otp);
      setTimeout(() => {
        onVerificationComplete?.();
      }, 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      await makeAPICall('/resend', {
        email,
        type: 'otp_resend',
        timestamp: new Date().toISOString()
      });

      setCanResend(false);
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setFocusedInput(0);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-teal-50 to-white">
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700 relative overflow-hidden p-12 flex-col justify-between">
          <div className="absolute inset-0 bg-black/10" />
          
          <HeartbeatLine top="20%" />
          <HeartbeatLine top="40%" />
          <HeartbeatLine top="60%" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12 group">
              <div className="relative">
                <Heart className="h-14 w-14 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-white/20 rounded-full blur group-hover:blur-lg transition-all" />
              </div>
              <h1 className="text-5xl font-bold text-white">HealthHub</h1>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">OTP Verification</h2>
                <p className="text-xl text-white/90">
                  We've sent a verification code to
                  <span className="block mt-2 font-medium bg-white/10 px-4 py-2 rounded-lg">
                    {email}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Enhanced Security</h3>
                <p className="text-white/80 text-sm">Multi-factor authentication enabled</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-8 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <LockKeyhole className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold">Verify Your Email</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <OTPInput
                        key={index}
                        value={digit}
                        onChange={handleOTPChange}
                        index={index}
                        isFocused={focusedInput === index}
                        onFocus={setFocusedInput}
                        onKeyDown={handleKeyDown}
                        isComplete={isComplete}
                        disabled={isLoading || verificationComplete}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-500 text-sm justify-center"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-center">
                    {!canResend ? (
                      <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-6 py-3 rounded-full">
                        <TimerCircle seconds={timer} maxSeconds={30} />
                        <span className="font-medium">until resend</span>
                      </div>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={handleResend}
                        disabled={isLoading || verificationComplete}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 
                          px-4 py-2 rounded-full hover:bg-teal-50 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend Code
                      </motion.button>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!isComplete || isLoading || verificationComplete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-4 rounded-xl font-medium
                      flex items-center justify-center gap-2
                      transition-all duration-300
                      ${isComplete && !verificationComplete
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                      ${verificationComplete ? 'bg-green-500 text-white' : ''}
                    `}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : verificationComplete ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        <span>Verified Successfully!</span>
                      </div>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              <div className="px-8 pb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex justify-center gap-8 text-sm text-gray-500">
                    {['OTP Verification', 'End-to-End Encrypted', 'Secure Channel'].map((text, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-teal-500" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    <LockKeyhole className="w-4 h-4 text-teal-500" />
                    <span>Secure verification session</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-sm text-gray-500"
            >
              <p>
                Didn't receive the code? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isLoading || verificationComplete}
                  className="text-teal-600 hover:text-teal-700 font-medium 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  request a new one
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-bounce-soft {
          animation: bounce-soft 0.5s ease-in-out;
        }

        input:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.4);
        }

        @media (max-width: 640px) {
          input {
            width: 3rem;
            height: 3.5rem;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OTPStep;