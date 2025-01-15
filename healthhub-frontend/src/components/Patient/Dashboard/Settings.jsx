import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Mail, Lock, UserX, AlertCircle, X,
    Eye, EyeOff, ArrowRight, Shield, LogOut,
    Check, Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-gray-800"
            >
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
                    <p className="text-gray-400">{message}</p>
                </div>

                <div className="p-4 border-t border-gray-800 flex gap-3 justify-end bg-gray-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white
              ${isDangerous
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-teal-500 hover:bg-teal-600'} 
              transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SuccessNotification = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg 
        shadow-lg flex items-center gap-2"
        >
            <Check className="w-5 h-5" />
            {message}
        </motion.div>
    );
};
const EmailOTPDialog = ({ onClose, onVerify, email }) => {  
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef([]);

    const handleOTPChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value;
        setOtp(newOTP);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete verification code');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const response = await fetch('https://anochat.in/v1/auth/verify-email-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    email: email,
                    otp: otpString
                })
            });

            const data = await response.json();

            if (response.ok) {
                onVerify();
            } else {
                setError(data.message || 'Invalid verification code');
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-gray-800"
            >
                <div className="p-6 border-b border-gray-800">
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">Verify Email Change</h3>
                    <p className="text-gray-400">
                        We've sent a verification code to {email}. Please enter it below.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOTPChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border 
                    border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500/20 
                    focus:border-teal-500"
                            />
                        ))}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-400 justify-center"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || otp.some(digit => !digit)}
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium
                hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors flex items-center gap-2"
                    >
                        {isVerifying ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SettingsPage = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    useEffect(() => {
        document.documentElement.classList.toggle('dark', prefersDark);
    }, [prefersDark]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://anochat.in/v1/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordConfirmation(false);
            } else {
                setError(data.message || 'Failed to update password');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    const handleEmailChange = async () => {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    new_email: newEmail
                })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setShowEmailConfirmation(false);
                setPendingEmail(newEmail);
                setShowOTPVerification(true);
            } else {
                setError(data.message || 'Failed to update email');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };
    
    const handleOTPVerification = async () => {
        setSuccessMessage('Email updated successfully');
        setNewEmail('');
        setShowOTPVerification(false);
        setPendingEmail('');
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch('https://anochat.in/v1/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                localStorage.clear();
                navigate('/auth');
            } else {
                setError('Failed to delete account');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-teal-900/30 rounded-lg">
                        <Settings className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
                        <p className="text-gray-400">Manage your account settings and preferences</p>
                    </div>
                </div>

                <AnimatePresence>
                    {successMessage && (
                        <SuccessNotification
                            message={successMessage}
                            onClose={() => setSuccessMessage('')}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 p-4 bg-red-500/10 text-red-400 rounded-lg"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                            <button
                                onClick={() => setError('')}
                                className="ml-auto hover:bg-red-500/20 p-1 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-teal-900/30 rounded-lg">
                                <Lock className="w-5 h-5 text-teal-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-100">Change Password</h2>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setShowPasswordConfirmation(true);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                      text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                      hover:text-gray-300"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                      text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                      hover:text-gray-300"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                      text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                      hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!currentPassword || !newPassword || !confirmPassword}
                                className="w-full py-3 bg-teal-500 text-white rounded-lg font-medium
                  hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2"
                            >
                                Update Password
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-teal-900/30 rounded-lg">
                                <Mail className="w-5 h-5 text-teal-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-100">Change Email</h2>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setShowEmailConfirmation(true);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    New Email Address
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                    text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    placeholder="Enter new email address"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!newEmail}
                                className="w-full py-3 bg-teal-500 text-white rounded-lg font-medium
                  hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2"
                            >
                                Update Email
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-900/30 rounded-lg">
                                <UserX className="w-5 h-5 text-red-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-100">Delete Account</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-400">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>

                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="w-full py-3 bg-red-500 text-white rounded-lg font-medium
                  hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                Delete Account
                                <UserX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-teal-900/20 rounded-xl p-6 border border-teal-900/20">
                        <div className="flex items-start gap-3">
                            <Shield className="w-6 h-6 text-teal-400 shrink-0 mt-1" />
                            <div>
                                <h3 className="text-teal-300 font-medium mb-2">Security Note</h3>
                                <p className="text-teal-200/70 text-sm">
                                    For your security, we recommend using a strong password and keeping your email address up to date.
                                    Enable two-factor authentication for additional security.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    <ConfirmationDialog
                        isOpen={showPasswordConfirmation}
                        onClose={() => setShowPasswordConfirmation(false)}
                        onConfirm={handlePasswordChange}
                        title="Confirm Password Change"
                        message="Are you sure you want to change your password? You'll need to use the new password next time you log in."
                        confirmText="Update Password"
                    />

                    <ConfirmationDialog
                        isOpen={showEmailConfirmation}
                        onClose={() => setShowEmailConfirmation(false)}
                        onConfirm={handleEmailChange}
                        title="Confirm Email Change"
                        message="Are you sure you want to change your email? You'll need to verify the new email address."
                        confirmText="Update Email"
                    />

                    <ConfirmationDialog
                        isOpen={showDeleteConfirmation}
                        onClose={() => setShowDeleteConfirmation(false)}
                        onConfirm={handleDeleteAccount}
                        title="Delete Account"
                        message="Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
                        confirmText="Delete Account"
                        isDangerous={true}
                    />
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {showOTPVerification && (
                        <EmailOTPDialog
                            onClose={() => setShowOTPVerification(false)}
                            onVerify={handleOTPVerification}
                            email={pendingEmail}
                        />
                    )}
                </AnimatePresence>


            </div>

        </div>
    );
};

export default SettingsPage;