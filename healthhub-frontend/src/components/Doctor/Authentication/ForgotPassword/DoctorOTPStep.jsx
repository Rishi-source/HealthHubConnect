// DoctorOTPStep.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, ArrowRight, Check, Stethoscope, RefreshCw,
    Sparkles, Shield, AlertCircle, Activity, Building
} from 'lucide-react';

const HeartbeatLine = ({ top, opacity = 1 }) => {
    return (
        <div className="absolute pointer-events-none overflow-hidden"
            style={{ top, left: 0, right: 0, opacity }}>
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

const TimerCircle = ({ seconds }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progress = (seconds / 30) * circumference;

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
                    className="text-red-500 transition-all duration-500"
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
    disabled,
    inputRef
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

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
                            ? 'border-red-500 bg-red-50/50 ring-4 ring-red-500/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                        ${value
                            ? 'bg-gradient-to-br from-red-50 to-rose-50 text-red-600'
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
                    backgroundColor: value ? '#EF4444' : '#d1d5db'
                }}
            />

            {isAnimating && value && (
                <Sparkles
                    className="absolute top-0 right-0 text-red-500 
                        transform -translate-y-1/2 translate-x-1/2 animate-ping"
                />
            )}
        </div>
    );
};

const DoctorOTPStep = ({ email, onSubmit, onResendOTP, isLoading }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [focusedInput, setFocusedInput] = useState(0);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const inputRefs = useRef([]);

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
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            setFocusedInput(index - 1);
            inputRefs.current[index - 1]?.focus();
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            setFocusedInput(index - 1);
            inputRefs.current[index - 1]?.focus();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' && index < 5) {
            setFocusedInput(index + 1);
            inputRefs.current[index + 1]?.focus();
            e.preventDefault();
        }
    };

    const handleVerification = async () => {
        if (!otp.every(digit => digit !== '')) {
            setError('Please enter the complete verification code');
            return;
        }

        try {
            await onSubmit(otp.join(''));
            setVerificationComplete(true);
        } catch (error) {
            setError(error.message || 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            const success = await onResendOTP();
            if (success) {
                setCanResend(false);
                setTimer(30);
                setOtp(['', '', '', '', '', '']);
                setFocusedInput(0);
                setError('');
            } else {
                throw new Error('Failed to send new code');
            }
        } catch (error) {
            setError('Failed to send new code. Please try again.');
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-rose-50 to-white">
            <div className="min-h-screen flex">
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden p-12 flex-col justify-between">
                    <div className="absolute inset-0 bg-black/10" />

                    <HeartbeatLine top="20%" />
                    <HeartbeatLine top="40%" />
                    <HeartbeatLine top="60%" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-12 group">
                            <div className="relative">
                                <Stethoscope className="h-14 w-14 text-white group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-white/20 rounded-full blur group-hover:blur-lg transition-all" />
                            </div>
                            <h1 className="text-5xl font-bold text-white">DocConnect</h1>
                        </div>

                        <div className="space-y-12">
                            <div className="transform hover:translate-x-2 transition-all duration-300">
                                <h2 className="text-4xl font-bold text-white">OTP Verification</h2>
                                <p className="text-xl text-white/90 mt-4">
                                    We've sent a verification code to
                                    <span className="block mt-2 font-medium bg-white/10 px-4 py-2 rounded-lg">
                                        {email}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <Shield className="w-6 h-6 text-white" />
                                    <div>
                                        <h3 className="font-medium text-white">Secure Verification</h3>
                                        <p className="text-sm text-white/80">Protecting your medical practice</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Activity className="w-6 h-6 text-white" />
                            <div>
                                <h3 className="text-white font-medium">Multi-factor Authentication</h3>
                                <p className="text-white/80 text-sm">Enhanced security for your account</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            <div className="p-8 bg-gradient-to-r from-red-500 to-rose-500">
                                <div className="flex items-center gap-4">
                                    <Building className="w-8 h-8 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Verify Your Account</h2>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="space-y-8">
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
                                                inputRef={el => inputRefs.current[index] = el}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-center">
                                        {!canResend ? (
                                            <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-6 py-3 rounded-full">
                                                <TimerCircle seconds={timer} />
                                                <span className="font-medium">until resend</span>
                                            </div>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleResend}
                                                disabled={isLoading || verificationComplete}
                                                className="flex items-center gap-2 text-red-600 hover:text-red-700 
                                                    px-4 py-2 rounded-full hover:bg-red-50 transition-colors
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Resend Code
                                            </motion.button>
                                        )}
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl"
                                        >
                                            <AlertCircle className="w-5 h-5" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <motion.button
                                        onClick={handleVerification}
                                        disabled={!isComplete || isLoading || verificationComplete}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                                            w-full py-4 rounded-xl font-semibold
                                            flex items-center justify-center gap-2
                                            transition-all duration-300
                                            ${isComplete && !verificationComplete && !isLoading
                                                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }
                                            ${verificationComplete ? 'bg-green-500 text-white' : ''}
                                        `}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                <span>Verifying...</span>
                                            </div>
                                        ) : verificationComplete ? (
                                            <div className="flex items-center gap-2">
                                                <Check className="w-5 h-5" />
                                                <span>Verified Successfully!</span>
                                            </div>
                                        ) : (
                                            <>
                                                Verify Account
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        Having trouble? Contact support at{' '}
                                        <span className="text-red-600">support@docconnect.com</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes bounce-soft {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                .animate-bounce-soft {
                    animation: bounce-soft 0.5s ease-in-out;
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

export default DoctorOTPStep;