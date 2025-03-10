import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, ArrowRight, ArrowLeft, Shield, Stethoscope,
    Building, Activity, AlertCircle
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

const DoctorEmailStep = ({ onSubmit, onBack, isLoading }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [activeField, setActiveField] = useState(null);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        onSubmit(email);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-rose-50 to-white overflow-hidden">
            <div className="min-h-screen flex flex-col lg:flex-row">
                <div className="lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-10 left-10">
                            <PulseCircle size="lg" delay={0} />
                        </div>
                        <div className="absolute top-20 right-16">
                            <PulseCircle size="md" delay={300} />
                        </div>
                        <div className="absolute top-1/2 left-1/4">
                            <PulseCircle size="sm" delay={150} />
                        </div>
                        <div className="absolute top-1/2 right-1/4">
                            <PulseCircle size="md" delay={450} />
                        </div>
                        <HeartbeatLine top="25%" opacity={2} />
                        <HeartbeatLine top="50%" opacity={2} />
                        <HeartbeatLine top="75%" opacity={2} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-12 group">
                            <div className="relative">
                                <Stethoscope className="h-14 w-14 text-white group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-white/20 rounded-full blur group-hover:blur-lg transition-all" />
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-white">
                                DocConnect
                            </h1>
                        </div>

                        <div className="space-y-12 mb-20">
                            <div className="transform hover:translate-x-2 transition-all duration-300">
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                                    Reset Your Password
                                </h2>
                                <p className="text-xl text-white/90">
                                    Let's help you regain access to your doctor portal
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: Shield,
                                        text: "Secure Doctor Portal",
                                        bgColor: "bg-white/10"
                                    },
                                    {
                                        icon: Building,
                                        text: "Hospital Management Tools",
                                        bgColor: "bg-white/10"
                                    },
                                    {
                                        icon: Activity,
                                        text: "Patient Care Platform",
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

                    <div className="relative pt-8 border-t border-white/20">
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-4">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="relative w-12 h-12 rounded-full bg-white/10 overflow-hidden hover:translate-y-1 transition-transform"
                                    >
                                        <img
                                            src="/api/placeholder/48/48"
                                            alt="Doctor avatar"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 animate-pulse-soft" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="text-lg text-white font-medium">
                                    Join 5,000+ doctors
                                </div>
                                <div className="text-sm text-white/80">
                                    Transform your medical practice today
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-lg">
                    <div className="max-w-md mx-auto w-full">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            <div className="p-8 bg-gradient-to-r from-red-500 to-rose-500">
                                <div className="flex items-center gap-4">
                                    <Mail className="w-8 h-8 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                                </div>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className={`transform transition-all duration-300 ${activeField === 'email' ? 'scale-105' : ''}`}>
                                        <label className="block text-base font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setError('');
                                                }}
                                                onFocus={() => setActiveField('email')}
                                                onBlur={() => setActiveField(null)}
                                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl
                                                    focus:ring-4 focus:ring-red-500/20 focus:border-red-500
                                                    transition-all duration-300"
                                                placeholder="Enter your doctor email"
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center gap-2 mt-2 p-3 bg-red-50 text-red-500 text-sm rounded-lg"
                                                >
                                                    <AlertCircle className="h-4 w-4" />
                                                    {error}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full bg-gradient-to-r from-red-500 to-rose-500 
                                            text-white py-4 rounded-2xl font-medium
                                            flex items-center justify-center gap-2
                                            transition-all duration-300 hover:shadow-lg
                                            ${(!email || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="w-6 h-6" />
                                            </>
                                        )}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={onBack}
                                        disabled={isLoading}
                                        className="w-full py-4 text-gray-500 hover:text-gray-700
                                            flex items-center justify-center gap-2 transition-colors
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back to Login
                                    </button>
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

export default DoctorEmailStep;