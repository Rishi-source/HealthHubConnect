import { useState, useEffect } from 'react'
import {
  Heart, LogIn, UserPlus, Eye, EyeOff,
  Mail, Lock, User, ArrowRight, Check,
  Shield, Activity, Calendar, X, Sparkles,
  Phone,Stethoscope
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";

const buildGoogleOAuthURL = () => {
  const params = {
    client_id: '232880583599-2ub31l5n5iuho98avcqr0bbhtu5gesb6.apps.googleusercontent.com',
    redirect_uri: 'https://anochat.in/v1/auth/google/callback',
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    state: 'random-string'
  };

  return 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams(params).toString();
};




const useGoogleAuth = (navigate) => {
  const initiateGoogleLogin = async () => {
    try {
      console.log('Initiating Google login...');
      const response = await fetch('https://anochat.in/v1/auth/google/login');
      const result = await response.json();

      if (result.success && result.code === 200 && result.data.url) {
        console.log('Redirecting to:', result.data.url);
        window.location.href = result.data.url;
      } else {
        throw new Error('Invalid response from Google login endpoint');
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
      throw new Error('Failed to initiate Google login. Please try again.');
    }
  };

  const handleGoogleCallback = async (code, state) => {
    try {
      console.log('Processing Google callback with code:', code);
      const response = await fetch(`https://anochat.in/v1/auth/google/callback?code=${code}&state=${state}`);
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('accessToken', data.tokens.access_token);
        localStorage.setItem('refreshToken', data.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/profile');
        return data;
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Error in Google callback:', error);
      throw error;
    }
  };

  return { initiateGoogleLogin, handleGoogleCallback };
};
const HeartbeatLine = ({ top, opacity = 1 }) => {
  return (
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
  )
}

const PulseCircle = ({ size = "lg", color = "white", delay = 0 }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }

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
  )
}

const AuthPage = ({ onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initiateGoogleLogin, handleGoogleCallback } = useGoogleAuth(navigate);
  const [userType, setUserType] = useState(null); 
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordError, setPasswordError] = useState('');

  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      setGoogleLoading(true);
      handleGoogleCallback(code, state)
        .then(data => {
          if (data.success) {
            setFormComplete(true);
            setTimeout(() => {
              navigate('/profile');
            }, 1000);
          }
        })
        .catch(error => {
          setError(error.message || 'Google authentication failed');
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        })
        .finally(() => {
          setGoogleLoading(false);
        });
    }
  }, [location, handleGoogleCallback, navigate]);

  const handleUserTypeSelection = (type) => {
    if (type === 'doctor') {
      // Directly navigate to doctor auth with replace to prevent back button issues
      navigate('/doctor', { replace: true });
    } else {
      setUserType('patient');
    }
  };
    

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePasswords = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      setPasswordError('Passwords do not match');
    } else if (password.length < 8) {
      setPasswordsMatch(false);
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordsMatch(true);
      setPasswordError('');
    }
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password && validateEmail(formData.email);
    } else {
      return formData.email &&
        formData.password &&
        formData.confirmPassword &&
        passwordsMatch &&
        formData.fullName &&
        validateEmail(formData.email) &&
        validatePhone(formData.phoneNumber);
    }
  };

  const handleGoogleLoginClick = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await initiateGoogleLogin();
    } catch (error) {
      setError(error.message || 'Failed to connect with Google');
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'confirmPassword' || name === 'password') {
      if (!isLogin) {
        validatePasswords(
          name === 'password' ? value : formData.password,
          name === 'confirmPassword' ? value : formData.confirmPassword
        );
      }
    }

    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
  
    setIsLoading(true);
    setError('');
  
    try {
      if (isLogin) {
        console.log('Starting login process...');
        const response = await fetch('https://anochat.in/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          })
        });
  
        const data = await response.json();
        console.log('Login response:', data);
  
        if (response.ok && data.success) {
          setFormComplete(true);
          
          const { access_token, refresh_token } = data.data.tokens;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          
          const storedToken = localStorage.getItem('access_token');
          if (!storedToken) {
            throw new Error('Failed to store authentication data');
          }
          
          navigate('/dashboard');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } else {
        console.log('Starting signup process...');
        try {
          const signupResponse = await fetch('https://anochat.in/v1/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.fullName,
              email: formData.email,
              password: formData.password,
              phone: parseInt(formData.phoneNumber, 10)
            })
          });
  
          const signupData = await signupResponse.json();
          console.log('Signup response:', signupData);
  
          if (signupData.success) {
            setFormComplete(true);
            
            localStorage.setItem('signup_email', formData.email);
            localStorage.setItem('signup_password', formData.password);
            
            if (signupData.data?.user) {
              localStorage.setItem('user', JSON.stringify(signupData.data.user));
            }
  
            if (typeof onComplete === 'function') {
              onComplete(formData.email);
            }
  
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              fullName: '',
              phoneNumber: ''
            });
          } else {
            throw new Error(signupData.message || 'Signup failed');
          }
        } catch (error) {
          console.error('Signup error:', error);
          localStorage.removeItem('signup_email');
          localStorage.removeItem('signup_password');
          throw error;
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-teal-50 to-white overflow-hidden">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-1/2 bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
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
            <div className="absolute bottom-16 left-20">
              <PulseCircle size="md" delay={600} />
            </div>
            <div className="absolute bottom-24 right-12">
              <PulseCircle size="lg" delay={750} />
            </div>

            <HeartbeatLine top="25%" opacity={2} />
            <HeartbeatLine top="50%" opacity={2} />
            <HeartbeatLine top="75%" opacity={2} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12 group">
              <div className="relative">
                <Heart className="h-14 w-14 text-white group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-white/20 rounded-full blur group-hover:blur-lg transition-all" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white">
                HealthHub
              </h1>
            </div>

            <div className="space-y-12 mb-20">
              <div className="transform hover:translate-x-2 transition-all duration-300">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                  Your Health Journey <br />Begins Here
                </h2>
                <p className="text-xl text-white/90">
                  Experience healthcare reimagined for the modern age
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: Shield,
                    text: "Bank-grade security for your data",
                    bgColor: "bg-white/10"
                  },
                  {
                    icon: Activity,
                    text: "Real-time health monitoring",
                    bgColor: "bg-white/10"
                  },
                  {
                    icon: Calendar,
                    text: "Smart appointment scheduling",
                    bgColor: "bg-white/10"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 group hover:translate-x-2 transition-all duration-300"
                  >
                    <div className={`relative p-4 rounded-xl ${feature.bgColor} group-hover:bg-white/20 transition-colors`}>
                      <feature.icon className="h-8 w-8 text-white" />
                      <div className="absolute inset-0 rounded-xl group-hover:animate-pulse-soft" />
                    </div>
                    <span className="text-xl text-white font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pt-8 border-t border-white/20">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  <div
                    key={1}
                    className="relative w-12 h-12 rounded-full bg-white/10 overflow-hidden hover:translate-y-1 transition-transform"
                  >
                    <img
                      src="/image.png"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 animate-pulse-soft" />
                  </div>
                  <div
                    key={2}
                    className="relative w-12 h-12 rounded-full bg-white/10 overflow-hidden hover:translate-y-1 transition-transform"
                  >
                    <img
                      src="/image copy.png"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 animate-pulse-soft" />
                  </div>
                  <div
                    key={3}
                    className="relative w-12 h-12 rounded-full bg-white/10 overflow-hidden hover:translate-y-1 transition-transform"
                  >
                    <img
                      src="/image copy 3.png"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 animate-pulse-soft" />
                  </div>
                  <div
                    key={4}
                    className="relative w-12 h-12 rounded-full bg-white/10 overflow-hidden hover:translate-y-1 transition-transform"
                  >
                    <img
                      src="/image copy 2.png"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 animate-pulse-soft" />
                  </div>

                </div>
                <div>
                  <div className="text-lg text-white font-medium">
                    Join 10,000+ users
                  </div>
                  <div className="text-sm text-white/80">
                    Transform your healthcare experience today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-lg">
        {!userType ? (
  <div className="max-w-md mx-auto w-full">
    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8 text-center">
      Choose Your Role
    </h2>
    
    <div className="grid grid-cols-2 gap-6">
      
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setUserType('patient')}
        className="p-8 rounded-2xl border-2 border-gray-200 hover:border-teal-500 
          bg-white hover:bg-teal-50 transition-all duration-300 group"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-teal-100 text-teal-600 group-hover:bg-teal-200 
            transition-colors duration-300">
            <User className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">I'm a Patient</h3>
            <p className="text-sm text-gray-500">
              Find doctors, book appointments, and manage your health
            </p>
          </div>
        </div>
      </motion.button>

      <motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => handleUserTypeSelection('doctor')}
  className="p-8 rounded-2xl border-2 border-gray-200 hover:border-red-500 
    bg-white hover:bg-red-50 transition-all duration-300 group"
>
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-red-100 text-red-600 group-hover:bg-red-200 
            transition-colors duration-300">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">I'm a Doctor</h3>
            <p className="text-sm text-gray-500">
              Join our network and connect with patients
            </p>
          </div>
        </div>
      </motion.button>
    </div>

    <div className="mt-12 text-center space-y-6">
      <div className="flex justify-center gap-8">
        {['Secure Platform', 'HIPAA Compliant', 'Verified Professionals'].map((text, i) => (
          <span
            key={i}
            className="text-sm text-gray-500 flex items-center gap-2"
          >
            <Shield className="h-4 w-4 text-teal-500" />
            {text}
          </span>
        ))}
      </div>
    </div>
  </div>
) : (

          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setPasswordError('')
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    fullName: '',
                    phoneNumber: ''
                  })
                }}
                className="text-teal-600 hover:text-teal-700 font-medium transform transition-all duration-300 hover:scale-105"
              >
                {isLogin ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>

            {error && (
              <div className="mb-6 text-red-500 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <X className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-8">
              <button
                onClick={handleGoogleLoginClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 
          border-gray-200 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 
          transform hover:scale-102 hover:shadow-lg group disabled:opacity-50 
          disabled:cursor-not-allowed"
              >
                <img
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                  alt="Google"
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                />
                <span className="text-lg text-gray-700">
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </span>
                {googleLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 
            border-gray-500 border-t-transparent"
                  />
                )}
              </button>


              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className={`transform transition-all duration-300 ${activeField === 'name' ? 'scale-105' : ''}`}>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                      placeholder="Enter your full name"
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>
              )}

              <div className={`transform transition-all duration-300 ${activeField === 'email' ? 'scale-105' : ''}`}>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    placeholder="Enter your email"
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className={`transform transition-all duration-300 ${activeField === 'phone' ? 'scale-105' : ''}`}>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                      placeholder="Enter your phone number"
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                  {formData.phoneNumber && !validatePhone(formData.phoneNumber) && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                      <X className="h-4 w-4" />
                      Please enter a valid 10-digit phone number
                    </div>
                  )}
                </div>
              )}

              <div className={`transform transition-all duration-300 ${activeField === 'password' ? 'scale-105' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-base font-medium text-gray-700">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { navigate('/forgot-password'); }}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors duration-300 hover:underline">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    placeholder="Enter your password"
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className={`transform transition-all duration-300 ${activeField === 'confirmPassword' ? 'scale-105' : ''}`}>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-4 border-2 ${passwordError ? 'border-red-300' : 'border-gray-200'} 
                            rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300`}
                      placeholder="Confirm your password"
                      onFocus={() => setActiveField('confirmPassword')}
                      onBlur={() => setActiveField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                      <X className="h-4 w-4" />
                      {passwordError}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-2xl 
                      transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                      flex items-center justify-center gap-3 relative overflow-hidden text-lg font-semibold
                      ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent" />
                ) : formComplete ? (
                  <>
                    <Check className="h-6 w-6" />
                    Success!
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-6 w-6 animate-bounce-x" />
                  </>
                )}
              </button>

              {!isLogin && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    Password must:
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Be at least 8 characters long
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${formData.password === formData.confirmPassword && formData.password !== '' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Passwords must match
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-12 text-center">
              <div className="flex justify-center gap-8 mb-4">
                {['Trusted by', 'HIPAA Compliant', '256-bit Encryption'].map((text, i) => (
                  <span
                    key={i}
                    className="text-sm text-gray-500 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-teal-500" />
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
