import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogIn, UserPlus, Eye, EyeOff, Mail, Lock,
    User, ArrowRight, Check, Shield, Sparkles,
    Phone, Stethoscope, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeartbeatLine = ({ top, opacity = 1 }) => (
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

const PulseCircle = ({ size = "lg", delay = 0 }) => {
    const sizes = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16"
    };

    return (
        <div className="absolute">
            <div
                className={`${sizes[size]} rounded-full bg-white/10 animate-pulse-ring`}
                style={{ animationDelay: `${delay}ms` }}
            />
            <div
                className={`${sizes[size]} rounded-full bg-white/20 animate-pulse-ring-delay`}
                style={{ animationDelay: `${delay + 400}ms` }}
            />
        </div>
    );
};

const DoctorAuthPage = ({ onLoginComplete, onSignupComplete }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formComplete, setFormComplete] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: ''
    });

    useEffect(() => {
        console.log('DoctorAuthPage mounted');
        return () => console.log('DoctorAuthPage unmounted');
    }, []);

    const validateForm = () => {
        if (isLogin) {
            return formData.email && formData.password;
        }

        return (
            formData.email &&
            formData.password &&
            formData.confirmPassword === formData.password &&
            formData.fullName &&
            formData.phoneNumber &&
            formData.password.length >= 8
        );
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
        return /^\d{10}$/.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm() || isLoading) return;
    
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }
    
        if (!isLogin && !validatePhone(formData.phoneNumber)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
    
        setIsLoading(true);
        setError('');
    
        try {
            const email = formData.email.toLowerCase().trim();
    
            if (isLogin) {
                const loginResponse = await fetch('https://anochat.in/v1/doctor/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: formData.password
                    })
                });
    
                const loginData = await loginResponse.json();
    
                if (loginResponse.ok && loginData.success) {
                    localStorage.setItem('access_token', loginData.data.tokens.access_token);
                    localStorage.setItem('refresh_token', loginData.data.tokens.refresh_token);
                    localStorage.setItem('user', JSON.stringify(loginData.data.user));
                    setFormComplete(true);
                    onLoginComplete?.(loginData);
                } else {
                    throw new Error(loginData.data?.message || 'Login failed');
                }
            } else {
                const signupResponse = await fetch('https://anochat.in/v1/doctor/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: formData.password,
                        name: formData.fullName.trim(),
                        phone: parseInt(formData.phoneNumber)
                    })
                });
    
                const signupData = await signupResponse.json();
    
                if (signupResponse.ok && signupData.success) {
                    const loginResponse = await fetch('https://anochat.in/v1/doctor/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            password: formData.password
                        })
                    });
    
                    const loginData = await loginResponse.json();
    
                    if (loginResponse.ok && loginData.success) {
                        localStorage.setItem('access_token', loginData.data.tokens.access_token);
                        localStorage.setItem('refresh_token', loginData.data.tokens.refresh_token);
                        localStorage.setItem('user', JSON.stringify(loginData.data.user));
                    }
    
                    localStorage.setItem('doctor_signup_email', email);
                    localStorage.setItem('doctor_signup_password', formData.password);
                    setFormComplete(true);
                    onSignupComplete?.({ success: true, email: email });
                } else {
                    throw new Error(signupData.data?.message || 'Signup failed');
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    
    
    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden p-12 flex-col justify-between">
                <div className="absolute inset-0 bg-black/10" />

                <HeartbeatLine top="20%" />
                <HeartbeatLine top="40%" />
                <HeartbeatLine top="60%" />

                <PulseCircle delay={0} size="lg" />
                <PulseCircle delay={500} size="md" />
                <PulseCircle delay={1000} size="sm" />

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
                                {isLogin ? 'Welcome Back, Doctor' : 'Join Our Medical Network'}
                            </h2>
                            <p className="text-xl text-white/90">
                                {isLogin
                                    ? 'Access your patient records and appointments'
                                    : 'Connect with patients and grow your practice'
                                }
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: Shield,
                                    text: "Secure Medical Platform",
                                    bgColor: "bg-white/10"
                                },
                                {
                                    icon: Stethoscope,
                                    text: "Smart Practice Management",
                                    bgColor: "bg-white/10"
                                },
                                {
                                    icon: User,
                                    text: "Patient Engagement Tools",
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
            </div>

            <div className="w-full lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                            {isLogin ? 'Doctor Login' : 'Doctor Registration'}
                        </h2>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setFormData({
                                    fullName: '',
                                    phoneNumber: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                });
                            }}
                            className="text-red-600 hover:text-red-700 font-medium transform hover:scale-105 transition-all"
                        >
                            {isLogin ? 'Need to register?' : 'Already registered?'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <>

                                <div className={`transform transition-all duration-300 ${activeField === 'fullName' ? 'scale-105' : ''}`}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            onFocus={() => setActiveField('name')}
                                            onBlur={() => setActiveField(null)}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                        focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                        transition-all duration-300"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div className={`transform transition-all duration-300 ${activeField === 'name' ? 'scale-105' : ''}`}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            onFocus={() => setActiveField('phone')}
                                            onBlur={() => setActiveField(null)}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                        focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                        transition-all duration-300"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={`transform transition-all duration-300 ${activeField === 'email' ? 'scale-105' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setActiveField('email')}
                                    onBlur={() => setActiveField(null)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                    focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                    transition-all duration-300"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className={`transform transition-all duration-300 ${activeField === 'password' ? 'scale-105' : ''}`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onFocus={() => setActiveField('password')}
                                        onBlur={() => setActiveField(null)}
                                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl
                      focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                      transition-all duration-300"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400
                      hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <>
                                    <div className={`transform transition-all duration-300 ${activeField === 'confirmPassword' ? 'scale-105' : ''}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                onFocus={() => setActiveField('confirmPassword')}
                                                onBlur={() => setActiveField(null)}
                                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl
                          focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                          transition-all duration-300"
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400
                          hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-500 space-y-2">
                                        <p>Password requirements:</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full transition-colors duration-300
                        ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full transition-colors duration-300
                        ${formData.password === formData.confirmPassword && formData.password
                                                    ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>Passwords match</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={!validateForm() || isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                w-full py-4 rounded-xl font-semibold
                flex items-center justify-center gap-2
                transition-all duration-300
                ${validateForm() && !isLoading
                                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
              `}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    <span>Processing...</span>
                                </div>
                            ) : formComplete ? (
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5" />
                                    <span>Success!</span>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            ) : (
                                <>
                                    {isLogin ? (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Create Account
                                        </>
                                    )}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>

                        {isLogin && (
                            <button
                                type="button"
                                onClick={() => navigate('/doctor/forgot-password')}
                                className="w-full text-center text-red-600 hover:text-red-700 
                  font-medium mt-4 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        )}
                    </form>

                    <div className="mt-8 text-center">
                        <div className="flex justify-center gap-8 text-sm text-gray-500">
                            {['Verified Doctors', 'HIPAA Compliant', 'Secure Platform'].map((text, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    <Shield className="w-4 h-4 text-red-500" />
                                    {text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        @keyframes pulse-ring-delay {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-ring-delay {
          animation: pulse-ring-delay 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (max-width: 640px) {
          input, button {
            font-size: 16px;
            min-height: 44px;
          }
        }
      `}</style>
        </div>
    );
};

export default DoctorAuthPage;                  