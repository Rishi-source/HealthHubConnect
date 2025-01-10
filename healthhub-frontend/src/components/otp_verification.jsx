import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowRight, Check, Mail, RefreshCw, Sparkles, LockKeyhole, Fingerprint, AlertCircle } from 'lucide-react';

const PulseCircle = ({ delay = 0, top, left, size = "lg" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div
      className="absolute"
      style={{ top, left }}
    >
      <div
        className={`absolute ${sizes[size]} rounded-full bg-white/10 animate-pulse-ring`}
        style={{ animationDelay: `${delay}ms` }}
      />
      <div
        className={`absolute ${sizes[size]} rounded-full bg-white/20 animate-pulse-ring-delay`}
        style={{ animationDelay: `${delay + 400}ms` }}
      />
    </div>
  );
};

const FloatingSparkle = ({ delay = 0, top, left }) => (
  <div
    className="absolute animate-float"
    style={{
      top,
      left,
      animationDelay: `${delay}ms`,
    }}
  >
    <Sparkles className="w-4 h-4 text-white/20" />
  </div>
);

const HeartbeatLine = ({ top }) => (
  <div className="absolute pointer-events-none overflow-hidden" style={{ top }}>
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

const NumberInput = ({ value, onChange, onKeyDown, onFocus, onBlur, inputRef, isActive, index, isComplete }) => {
  const [isFilled, setIsFilled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value) {
      setIsAnimating(true);
      setIsFilled(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsFilled(false);
    }
  }, [value]);

  return (
    <div className="relative group">
      {isActive && (
        <div className="absolute inset-0 bg-teal-500/20 rounded-xl animate-pulse-soft" />
      )}

      <input
        ref={inputRef}
        type="text"
        maxLength={1}
        value={value}
        onChange={(e) => onChange(e)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`
          relative w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-bold 
          border-2 rounded-xl outline-none transition-all duration-300
          ${isActive
            ? 'border-teal-500 bg-teal-50/50 ring-4 ring-teal-500/20 scale-110 z-10'
            : 'border-gray-200 hover:border-teal-300'
          }
          ${isFilled
            ? 'bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600'
            : 'bg-white text-gray-700'
          }
          ${isAnimating ? 'animate-bounce-soft' : ''}
          ${isComplete && isFilled ? 'border-green-500' : ''}
          transform hover:scale-105 focus:scale-110
          transition-all duration-300 ease-in-out
        `}
      />

      <div className={`
        mt-2 h-1.5 w-1.5 rounded-full mx-auto
        transition-all duration-300
        ${isFilled ? 'bg-teal-500 scale-100' : 'bg-gray-300 scale-75'}
      `} />

      {isFilled && isAnimating && (
        <Sparkles
          className="absolute top-0 right-0 text-teal-500 transform -translate-y-1/2 translate-x-1/2 animate-ping"
        />
      )}
    </div>
  );
};

const OTPVerification = ({ email = "example@email.com", onVerificationComplete }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (index, e) => {
    const value = e.target.value;
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    setError('');
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOTP = async (otpCode) => {
    try {
      const response = await fetch('https://anochat.in/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      if (data.success && data.data) {
        if (data.data.tokens) {
          const { access_token, refresh_token } = data.data.tokens;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
        }

        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        return true;
      }

      throw new Error('Verification failed');
    } catch (error) {
      console.error('OTP Verification error:', error);
      throw new Error(error.message || 'Failed to verify code. Please try again.');
    }
  };

  const handleVerification = async () => {
    try {
      setIsVerifying(true);
      setError('');

      const otpCode = otp.join('');
      const result = await verifyOTP(otpCode);

      if (result) {
        setVerificationComplete(true);
        setSuccessMessage('Verification successful!');

        await new Promise(resolve => setTimeout(resolve, 1000));

        localStorage.setItem('isAuthenticated', 'true');

        onVerificationComplete?.();
      }
    } catch (error) {
      setError(error.message);
      localStorage.removeItem('isAuthenticated');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setCanResend(false);
      await resendOTP();

      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setActiveInput(0);
      setSuccessMessage('New code sent successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message);
      setCanResend(true);
    }
  };

  const validateOTP = (otpArray) => {
    const otpString = otpArray.join('');
    if (otpString.length !== 6) {
      throw new Error('Please enter all digits of the verification code');
    }
    if (!/^\d+$/.test(otpString)) {
      throw new Error('Verification code must contain only numbers');
    }
    return otpString;
  };
  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-teal-50 to-white">
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700 relative overflow-hidden p-12 flex-col justify-between">
          <div className="absolute inset-0 bg-black/10"></div>
          <HeartbeatLine top="20%" />
          <HeartbeatLine top="60%" />
          <HeartbeatLine top="40%" />

          <PulseCircle delay={0} top="10%" left="10%" size="xl" />
          <PulseCircle delay={500} top="70%" left="80%" size="lg" />
          <PulseCircle delay={1000} top="40%" left="60%" size="md" />

          <FloatingSparkle delay={0} top="20%" left="20%" />
          <FloatingSparkle delay={1000} top="60%" left="70%" />
          <FloatingSparkle delay={2000} top="30%" left="90%" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12 group">
              <div className="relative">
                <LockKeyhole className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
              </div>
              <h1 className="text-5xl font-bold text-white">
                HealthHub
              </h1>
            </div>

            <div className="space-y-8">
              <div className="transform hover:translate-x-2 transition-all duration-300">
                <h2 className="text-3xl font-bold text-white leading-tight">
                  Secure Authentication
                </h2>
                <p className="text-xl text-white/90">
                  Your security is our top priority
                </p>
              </div>

              <div className="space-y-6">
                {['256-bit Encryption', 'HIPAA Compliant', 'Biometric Ready'].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 group hover:translate-x-2 transition-all duration-300"
                  >
                    <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      {i === 0 ? <Shield className="h-6 w-6 text-white" /> :
                        i === 1 ? <LockKeyhole className="h-6 w-6 text-white" /> :
                          <Fingerprint className="h-6 w-6 text-white" />}
                    </div>
                    <span className="text-lg text-white font-medium">{text}</span>
                  </div>
                ))}
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
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-500">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-teal-50 rounded-2xl mb-4 group">
                    <Mail className="h-8 w-8 text-teal-500 transform group-hover:scale-110 transition-transform" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-gray-600">
                    We've sent a verification code to
                  </p>
                  <p className="text-gray-800 font-medium mt-1 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                    {email}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg animate-shake">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-6 flex items-center gap-2 text-green-500 bg-green-50 p-3 rounded-lg animate-bounce-soft">
                    <Check className="w-5 h-5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between gap-1">
                      {otp.map((digit, index) => (
                        <NumberInput
                          key={index}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={() => setActiveInput(index)}
                          onBlur={() => setActiveInput(null)}
                          aria-label={`Digit ${index + 1} of verification code`}
                          role="textbox"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          inputRef={el => inputRefs.current[index] = el}
                          isActive={activeInput === index}
                          index={index}
                          isComplete={isComplete}
                        />
                      ))}
                    </div>

                    <div className="flex justify-center">
                      {!canResend ? (
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center animate-pulse">
                            <div className="text-sm font-medium">{timer}</div>
                          </div>
                          <span>seconds until resend</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleResendOTP}
                          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium 
                            px-4 py-2 rounded-full hover:bg-teal-50 transition-all duration-300 group"
                        >
                          <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" />
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleVerification}
                    disabled={!isComplete || isVerifying || verificationComplete}
                    className={`
                      w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 
                      transition-all duration-500 transform hover:scale-102
                      ${isComplete && !verificationComplete && !isVerifying
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                      ${verificationComplete ? 'bg-green-500 text-white' : ''}
                    `}
                  >
                    {isVerifying ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Verifying...</span>
                      </div>
                    ) : verificationComplete ? (
                      <div className="flex items-center gap-2 animate-bounce">
                        <Check className="h-5 w-5" />
                        <span>Verified Successfully!</span>
                        <Sparkles className="h-5 w-5" />
                      </div>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full
                      transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                    >
                      <Shield className="h-4 w-4 text-teal-500" />
                      <span>Secure Verification</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
