import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Building, User, Phone,
  Mail, MessageSquare, Video, Stethoscope, ArrowRight,
  Check, AlertCircle, X, Plus, Search, FileText, 
  CreditCard, Shield
} from 'lucide-react';

const ThemeContext = React.createContext({
  isDark: true,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); 

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
};


const AppointmentStatus = ({ status }) => {
  const statusColors = {
    upcoming: 'bg-blue-900 text-blue-200',
    completed: 'bg-green-900 text-green-200',
    cancelled: 'bg-red-900 text-red-200',
    pending: 'bg-yellow-900 text-yellow-200'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};


const DoctorCard = ({ doctor, onBook }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-20 h-20 rounded-xl object-cover bg-gray-700"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {doctor.name}
            </h3>
            <p className="text-gray-400">{doctor.specialty}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium text-gray-300">{doctor.rating}</span>
                <span className="text-gray-500">({doctor.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{doctor.hospital}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-300">
            <CreditCard className="w-5 h-5 text-teal-500" />
            <span>Consultation Fee: ₹{doctor.fee}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {doctor.availableModes.includes('online') && (
              <button
                onClick={() => onBook(doctor, 'online')}
                className="py-3 rounded-lg font-medium border-2 border-teal-500
                  bg-teal-900/20 text-teal-300 hover:bg-teal-900/40 
                  transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Online
              </button>
            )}

            {doctor.availableModes.includes('inPerson') && (
              <button
                onClick={() => onBook(doctor, 'inPerson')}
                className="py-3 rounded-lg font-medium border-2 border-blue-500
                  bg-blue-900/20 text-blue-300 hover:bg-blue-900/40
                  transition-colors flex items-center justify-center gap-2"
              >
                <Building className="w-5 h-5" />
                In-Person
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const TimeSlotSelector = ({ availableSlots, selectedDate, selectedSlot, onDateSelect, onSlotSelect }) => {
  const dates = Object.keys(availableSlots || {});
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => onDateSelect(date)}
            className={`p-2 text-sm rounded-lg border transition-all 
              ${selectedDate === date 
                ? 'border-teal-500 bg-teal-900/50 text-teal-200' 
                : 'border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
          >
            {new Date(date).toLocaleDateString()}
          </button>
        ))}
      </div>
      
      {selectedDate && availableSlots[selectedDate] && (
        <div className="grid grid-cols-3 gap-2">
          {availableSlots[selectedDate].map((slot, index) => (
            <button
              key={index}
              onClick={() => onSlotSelect(slot)}
              className={`p-2 text-sm rounded-lg border transition-all 
                ${selectedSlot === slot 
                  ? 'border-teal-500 bg-teal-900/50 text-teal-200' 
                  : 'border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const PaymentDetails = ({ fee, onProceed, processing }) => (
  <div className="space-y-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
    <div className="space-y-2">
      <div className="flex justify-between text-gray-300">
        <span>Consultation Fee</span>
        <span>₹{fee}</span>
      </div>
      <div className="flex justify-between text-gray-300">
        <span>Platform Fee</span>
        <span>₹100</span>
      </div>
      <div className="flex justify-between text-lg font-medium text-white pt-2 border-t border-gray-700">
        <span>Total Amount</span>
        <span>₹{fee + 100}</span>
      </div>
    </div>

    <button
      onClick={onProceed}
      disabled={processing}
      className="w-full py-3 bg-teal-500 text-white rounded-xl
        flex items-center justify-center gap-2 font-medium
        hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300"
    >
      {processing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Proceed to Payment
        </>
      )}
    </button>

    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
      <Shield className="w-4 h-4" />
      <span>Secure Payment Gateway</span>
    </div>
  </div>
);

const BookingModal = ({ doctor, isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStepChange = (nextStep) => {
    if (nextStep === 2 && !symptoms.trim()) return;
    if (nextStep === 3 && !selectedSlot) return;
    setStep(nextStep);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-xl border border-gray-800"
          >
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-900/50 rounded-lg">
                    <Calendar className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Book Appointment
                    </h2>
                    <p className="text-gray-400 text-sm">{doctor?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${step >= stepNumber ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-24 h-1 mx-2
                        ${step > stepNumber ? 'bg-teal-500' : 'bg-gray-800'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        Describe Your Symptoms
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Please provide detailed information about your symptoms or reason for consultation
                      </p>
                    </div>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Enter your symptoms or concerns..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700
                        bg-gray-800 text-white placeholder-gray-500
                        focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                      required
                    />
                    <button
                      onClick={() => handleStepChange(2)}
                      disabled={!symptoms.trim()}
                      className="w-full py-3 bg-teal-500 text-white rounded-xl
                        flex items-center justify-center gap-2 font-medium
                        hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-300"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        Select Date & Time
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Choose your preferred appointment slot
                      </p>
                    </div>
                    
                    <TimeSlotSelector
                      availableSlots={doctor?.availableSlots}
                      selectedDate={selectedDate}
                      selectedSlot={selectedSlot}
                      onDateSelect={setSelectedDate}
                      onSlotSelect={setSelectedSlot}
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-gray-700 text-gray-300
                          rounded-xl flex items-center justify-center gap-2
                          hover:bg-gray-800 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleStepChange(3)}
                        disabled={!selectedSlot}
                        className="flex-1 py-3 bg-teal-500 text-white rounded-xl
                          flex items-center justify-center gap-2 font-medium
                          hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        Complete Payment
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Review and confirm your appointment
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={doctor?.image} 
                          alt={doctor?.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="text-white font-medium">{doctor?.name}</h4>
                          <p className="text-gray-400 text-sm">{doctor?.specialty}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-400">Date</p>
                          <p className="text-white">
                            {selectedDate && new Date(selectedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-400">Time</p>
                          <p className="text-white">{selectedSlot}</p>
                        </div>
                      </div>
                    </div>

                    <PaymentDetails
                      fee={doctor?.fee}
                      onProceed={handlePayment}
                      processing={isProcessing}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const OTPVerificationModal = ({ isOpen, onClose, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onVerify();
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800"
          >
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-900/50 rounded-lg">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
                  <p className="text-gray-400 text-sm">Enter the code sent to your phone</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-2">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const newOtp = otp.split('');
                      newOtp[index] = value;
                      setOtp(newOtp.join(''));
                      setError('');
                      
                      if (value && index < 5) {
                        const nextInput = document.getElementById(`otp-${index + 1}`);
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    id={`otp-${index}`}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg
                      border border-gray-700 bg-gray-800 text-white
                      focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full py-3 bg-teal-500 text-white rounded-xl
                  flex items-center justify-center gap-2 font-medium
                  hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cancel Verification
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


const AppointmentCard = ({ appointment, onJoinCall }) => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-lg border dark:border-gray-700 border-gray-200
      bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-all duration-200"
  >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={appointment.doctorImage}
              alt={appointment.doctorName}
              className="w-16 h-16 rounded-full object-cover bg-gray-800"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {appointment.doctorName}
              </h3>
              <p className="text-gray-400">{appointment.specialty}</p>
            </div>
          </div>
          <AppointmentStatus status={appointment.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span>{new Date(appointment.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-5 h-5 text-teal-500" />
            <span>{appointment.time}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            {appointment.type === 'online' ? (
              <Video className="w-5 h-5 text-teal-500" />
            ) : (
              <Building className="w-5 h-5 text-teal-500" />
            )}
            <span>{appointment.type}</span>
          </div>

          {appointment.type === 'online' && appointment.status === 'upcoming' && (
            <div className="col-span-2 mt-2">
              <button
                onClick={() => {
                  if (!isVerified) {
                    setShowOTPModal(true);
                  } else {
                    onJoinCall(appointment);
                  }
                }}
                className="w-full py-3 bg-teal-500 text-white rounded-xl
                  flex items-center justify-center gap-2 font-medium
                  hover:bg-teal-600 transition-colors"
              >
                <Video className="w-5 h-5" />
                {isVerified ? 'Join Video Call' : 'Verify OTP to Join Call'}
              </button>
            </div>
          )}
        </div>
      </div>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={() => {
          setIsVerified(true);
          setShowOTPModal(false);
        }}
      />
    </motion.div>
  );
};

const SearchFilters = ({ searchQuery, onSearchChange, selectedSpecialty, onSpecialtyChange }) => {
  const specialties = [
    'All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'General Medicine'
  ];

  return (
    <div className="sticky top-4 space-y-6 bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search doctors by name or specialty..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700
            bg-gray-800 text-white placeholder-gray-500
            focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-white">Specialties</h3>
        <div className="space-y-2">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => onSpecialtyChange(specialty)}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors
                ${selectedSpecialty === specialty
                  ? 'bg-teal-900/50 text-teal-300'
                  : 'text-gray-300 hover:bg-gray-800'
                }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


const AppointmentsPage = () => {
  const [activeView, setActiveView] = useState('upcoming');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      specialty: "Cardiology",
      hospital: "City General Hospital",
      image: "/api/placeholder/400/400",
      rating: 4.8,
      reviews: 128,
      fee: 1500,
      availableModes: ['online', 'inPerson'],
      availableSlots: {
        "2024-01-15": ["9:00 AM", "10:00 AM", "11:00 AM"],
        "2024-01-16": ["2:00 PM", "3:00 PM", "4:00 PM"],
        "2024-01-17": ["10:00 AM", "11:00 AM", "3:00 PM"]
      }
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Dermatology",
      hospital: "Central Medical Center",
      image: "/api/placeholder/400/400",
      rating: 4.9,
      reviews: 156,
      fee: 1200,
      availableModes: ['online'],
      availableSlots: {
        "2024-01-15": ["9:30 AM", "10:30 AM", "2:30 PM"],
        "2024-01-16": ["1:30 PM", "2:30 PM", "4:30 PM"]
      }
    },
    {
      id: 3,
      name: "Dr. Emily Brown",
      specialty: "Pediatrics",
      hospital: "Children's Medical Center",
      image: "/api/placeholder/400/400",
      rating: 4.7,
      reviews: 98,
      fee: 1000,
      availableModes: ['online', 'inPerson'],
      availableSlots: {
        "2024-01-15": ["10:00 AM", "11:00 AM", "2:00 PM"],
        "2024-01-16": ["3:00 PM", "4:00 PM", "5:00 PM"]
      }
    }
  ];

  
  const appointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Wilson",
      doctorImage: "/api/placeholder/400/400",
      specialty: "Cardiology",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "online",
      status: "upcoming"
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      doctorImage: "/api/placeholder/400/400",
      specialty: "Dermatology",
      date: "2024-01-16",
      time: "2:30 PM",
      type: "online",
      status: "pending"
    }
  ];

  
  const filteredDoctors = doctors.filter(doctor =>
    (selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty) &&
    (doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
     doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  
  const handleJoinCall = (appointment) => {
    window.open('https://meet.google.com', '_blank');
    };

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {activeView === 'upcoming' ? 'My Appointments' : 'Book Appointment'}
            </h1>
            <p className="text-gray-400">
              {activeView === 'upcoming'
                ? 'View and manage your upcoming appointments'
                : 'Find and book appointments with top doctors'
              }
            </p>
          </div>

          <button
            onClick={() => setActiveView(activeView === 'upcoming' ? 'book' : 'upcoming')}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white
              rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            {activeView === 'upcoming' ? (
              <>
                <Plus className="w-5 h-5" />
                Book Appointment
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                View Appointments
              </>
            )}
          </button>
        </div>

        
        {activeView === 'upcoming' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onJoinCall={handleJoinCall}
              />
            ))}

            {appointments.length === 0 && (
              <div className="col-span-full bg-gray-900 rounded-xl border border-gray-800 
                p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Appointments
                </h3>
                <p className="text-gray-400 mb-4">
                  You don't have any appointments scheduled yet.
                </p>
                <button
                  onClick={() => setActiveView('book')}
                  className="px-6 py-3 bg-teal-500 text-white rounded-xl
                    font-medium hover:bg-teal-600 transition-colors
                    inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64">
              <SearchFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSpecialty={selectedSpecialty}
                onSpecialtyChange={setSelectedSpecialty}
              />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredDoctors.map(doctor => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onBook={(doctor, mode) => {
                      setSelectedDoctor({...doctor, mode});
                      setShowBookingModal(true);
                    }}
                  />
                ))}

                {filteredDoctors.length === 0 && (
                  <div className="col-span-full bg-gray-900 rounded-xl border border-gray-800 
                    p-8 text-center">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Doctors Found
                    </h3>
                    <p className="text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      
      <BookingModal
        doctor={selectedDoctor}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
};


export default function AppointmentsPageWithTheme() {
  return (
    <ThemeProvider>
      <AppointmentsPage />
    </ThemeProvider>
  );
}