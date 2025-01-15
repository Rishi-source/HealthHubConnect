import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Eye, EyeOff, Check, Shield, Stethoscope,
    AlertCircle, Award, Building, Key
} from 'lucide-react';

const HeartbeatLine = ({ top, opacity = 1 }) => (
    <div
        className="absolute pointer-events-none overflow-hidden"
        style={{
            top: top,
            left: 0,
            right: 0,
            opacity: opacity
        }}
    >
        <svg
            viewBox="0 0 900 100"
            className="w-full h-20 stroke-current"
        >
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

const PasswordStrengthIndicator = ({ password, confirmPassword }) => {
    const requirements = [
        {
            text: "8+ characters long",
            met: password.length >= 8,
            icon: Lock
        },
        {
            text: "At least one uppercase letter",
            met: /[A-Z]/.test(password),
            icon: Shield
        },
        {
            text: "At least one number",
            met: /\d/.test(password),
            icon: Key
        },
        {
            text: "Passwords match",
            met: password === confirmPassword && password !== '',
            icon: Check
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 bg-gray-50 p-4 rounded-xl"
        >
            <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Shield className="w-4 h-4 text-red-500" />
                <span>Password Requirements</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirements.map((req, index) => (
                    <motion.div
                        key={index}
                        initial={false}
                        animate={{
                            scale: req.met ? [1, 1.05, 1] : 1,
                            transition: { duration: 0.2 }
                        }}
                        className="flex items-center gap-2"
                    >
                        <div className={`
                            h-2 w-2 rounded-full transition-colors duration-300
                            ${req.met ? 'bg-green-500' : 'bg-gray-300'}
                        `} />
                        <span className={`
                            text-sm transition-colors duration-300
                            ${req.met ? 'text-green-600' : 'text-gray-500'}
                        `}>
                            {req.text}
                        </span>
                        {req.met && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-green-500"
                            >
                                <req.icon className="w-4 h-4" />
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

const DoctorNewPasswordStep = ({ email, otp, onSubmit }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validatePassword = () => {
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/\d/.test(newPassword)) {
            setError('Password must contain at least one number');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            await onSubmit(newPassword);
            setIsSuccess(true);

        } catch (error) {
            setError(error.message || 'Failed to reset password. Please try again.');
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

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
                            <h1 className="text-5xl font-bold text-white">
                                DocConnect
                            </h1>
                        </div>

                        <div className="space-y-12">
                            <div className="transform hover:translate-x-2 transition-all duration-300">
                                <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
                                    Create Your New Password
                                </h2>
                                <p className="text-xl text-white/90">
                                    Choose a strong password to secure your doctor account
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: Shield,
                                        text: "Medical Data Protection",
                                        bgColor: "bg-white/10"
                                    },
                                    {
                                        icon: Award,
                                        text: "Professional Account Security",
                                        bgColor: "bg-white/10"
                                    },
                                    {
                                        icon: Building,
                                        text: "Hospital Portal Access",
                                        bgColor: "bg-white/10"
                                    }
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 group hover:translate-x-2 transition-all duration-300"
                                    >
                                        <div className={`p-4 rounded-xl ${feature.bgColor} group-hover:bg-white/20 transition-colors`}>
                                            <feature.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-lg text-white font-medium">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Key className="w-6 h-6 text-white" />
                            <div>
                                <h3 className="text-white font-medium">Password Protected</h3>
                                <p className="text-white/80 text-sm">Your medical practice data is secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            <div className="p-8 bg-gradient-to-r from-red-500 to-rose-500">
                                <div className="flex items-center gap-4">
                                    <Lock className="w-8 h-8 text-white" />
                                    <h2 className="text-2xl font-bold text-white">
                                        {isSuccess ? 'Password Reset Complete' : 'Create New Password'}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className={`transform transition-all duration-300 ${activeField === 'password' ? 'scale-105' : ''}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 
                                                text-gray-400 group-hover:text-red-500 transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value);
                                                    setError('');
                                                }}
                                                onFocus={() => setActiveField('password')}
                                                onBlur={() => setActiveField(null)}
                                                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl
                                                    focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                                                    transition-all duration-300 group-hover:border-gray-300"
                                                placeholder="Enter new password"
                                                disabled={isLoading || isSuccess}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2
                                                    text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`transform transition-all duration-300 ${activeField === 'confirm' ? 'scale-105' : ''}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 
                                                text-gray-400 group-hover:text-red-500 transition-colors" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    setError('');
                                                }}
                                                onFocus={() => setActiveField('confirm')}
                                                onBlur={() => setActiveField(null)}
                                                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl
                                                    focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                                                    transition-all duration-300 group-hover:border-gray-300"
                                                placeholder="Confirm new password"
                                                disabled={isLoading || isSuccess}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2
                                                    text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <PasswordStrengthIndicator
                                        password={newPassword}
                                        confirmPassword={confirmPassword}
                                    />

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
                                        type="submit"
                                        disabled={isLoading || !newPassword || !confirmPassword || isSuccess}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                                            w-full py-4 rounded-xl font-medium
                                            flex items-center justify-center gap-2
                                            transition-all duration-300
                                            ${isSuccess
                                                ? 'bg-green-500 text-white'
                                                : newPassword && confirmPassword && !isLoading
                                                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin mr-2">
                                                    <Lock className="h-5 w-5" />
                                                </div>
                                                Resetting...
                                            </>
                                        ) : isSuccess ? (
                                            <>
                                                <Check className="h-5 w-5" />
                                                Password Reset Complete
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-5 w-5" />
                                                Reset Password
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
                                    <Shield className="w-4 h-4 text-red-500" />
                                    <span>Secure Password Reset</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorNewPasswordStep;