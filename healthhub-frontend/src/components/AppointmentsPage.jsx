
import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Building, User, Phone,
  Mail, MessageSquare, CheckCircle, AlertCircle, X,
  ChevronRight, ChevronLeft, Plus, Filter, Search,
  CalendarClock, Edit, Trash2, MoreHorizontal, FileText,
  Video, Stethoscope, ArrowRight, Heart, Moon, Sun,
  DollarSign, MessageCircle, CreditCard, Shield
} from 'lucide-react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedMode === 'dark' || (!savedMode && prefersDark);
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);


const APPOINTMENTS = [
  {
    id: 1,
    doctor: "Dr. Sarah Wilson",
    specialty: "Cardiologist",
    date: "2024-01-15",
    time: "10:00 AM",
    location: "City General Hospital",
    type: "In-Person",
    status: "upcoming",
    image: "/api/placeholder/400/400",
  },

];

const DOCTORS = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    specialty: "Cardiologist",
    hospital: "City General Hospital",
    image: "/api/placeholder/400/400",
    rating: 4.8,
    reviews: 128,
    nextAvailable: "Tomorrow",
  },

];

const initializeRazorpay = (orderDetails) => {
  const options = {
    key: 'YOUR_RAZORPAY_KEY',
    amount: orderDetails.amount,
    currency: orderDetails.currency,
    name: 'HealthHub',
    description: 'Appointment Booking',
    order_id: orderDetails.id,
    handler: function (response) {

      console.log(response);
    },
    prefill: {
      name: orderDetails.customerName,
      email: orderDetails.customerEmail,
      contact: orderDetails.customerPhone
    },
    theme: {
      color: '#14b8a6'
    }
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.open();
};


const ChatWidget = ({ isOpen, onClose, doctor }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { isDarkMode } = useTheme();

  const sendMessage = (message) => {

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }]);
    setNewMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 w-96 h-[600px] rounded-2xl overflow-hidden shadow-2xl
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border
            ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          { }
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            ${isDarkMode ? 'bg-gray-900' : 'bg-teal-500'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">{doctor.name}</h3>
                  <p className="text-sm text-white/80">{doctor.specialty}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          { }
          <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-xl p-3 ${message.sender === 'user'
                  ? isDarkMode
                    ? 'bg-teal-500 text-white'
                    : 'bg-teal-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user'
                    ? 'text-white/80'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                    }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          { }
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMessage.trim()) {
                  sendMessage(newMessage);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-2 rounded-xl border 
                  ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600
                  transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const PaymentModal = ({ isOpen, onClose, amount, appointmentDetails }) => {
  const { isDarkMode } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {

      const orderDetails = {
        amount: amount * 100,
        currency: 'INR',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890'
      };

      initializeRazorpay(orderDetails);
    } catch (error) {
      console.error('Payment initialization failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
            flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            onClick={e => e.stopPropagation()}
          >
            { }
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  Complete Payment
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg ${isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                    } transition-colors`}
                >
                  <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                </button>
              </div>
            </div>

            { }
            <div className="p-6 space-y-6">
              { }
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  Appointment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Consultation Fee
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      ₹{amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Platform Fee
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      ₹100
                    </span>
                  </div>
                  <div className="pt-2 border-t border-dashed flex justify-between">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Total Amount
                    </span>
                    <span className="font-bold text-teal-500">
                      ₹{amount + 100}
                    </span>
                  </div>
                </div>
              </div>

              { }
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  Payment Method
                </h3>
                <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <div className={`p-4 rounded-xl border-2 ${isDarkMode
                    ? 'border-gray-700 hover:border-teal-500'
                    : 'border-gray-200 hover:border-teal-500'
                    } cursor-pointer transition-colors`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      <span>Credit/Debit Card</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${isDarkMode
                    ? 'border-gray-700 hover:border-teal-500'
                    : 'border-gray-200 hover:border-teal-500'
                    } cursor-pointer transition-colors`}>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-6 h-6" />
                      <span>UPI</span>
                    </div>
                  </div>
                </div>
              </div>

              { }
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>

            { }
            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-500
                  text-white rounded-xl font-medium flex items-center justify-center gap-2
                  hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Pay
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const AppointmentCard = ({ appointment, onCancel, onChat }) => {
  const { isDarkMode } = useTheme();
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border overflow-hidden transition-all duration-300
        ${isDarkMode
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
          : 'bg-white border-gray-200 hover:shadow-lg'
        }`}
    >
      <div className="p-6">
        { }
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="relative">
              <img
                src={appointment.image}
                alt={appointment.doctor}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
                border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'}
                ${appointment.status === 'upcoming' ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
            </div>

            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                {appointment.doctor}
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {appointment.specialty}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.div
              initial={false}
              animate={{ scale: showActions ? 1 : 0.8, opacity: showActions ? 1 : 0 }}
              className="flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors ${isDarkMode
                  ? 'hover:bg-gray-600'
                  : 'hover:bg-gray-100'
                  }`}
                onClick={() => onChat(appointment)}
              >
                <MessageCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors ${isDarkMode
                  ? 'hover:bg-gray-600'
                  : 'hover:bg-gray-100'
                  }`}
              >
                <Edit className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCancel(appointment.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </motion.button>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowActions(!showActions)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode
                ? 'hover:bg-gray-600'
                : 'hover:bg-gray-100'
                }`}
            >
              <MoreHorizontal className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
            </motion.button>
          </div>
        </div>

        { }
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            <Calendar className="w-5 h-5 text-teal-500" />
            <span>{new Date(appointment.date).toLocaleDateString()}</span>
          </div>

          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            <Clock className="w-5 h-5 text-teal-500" />
            <span>{appointment.time}</span>
          </div>

          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            <MapPin className="w-5 h-5 text-teal-500" />
            <span>{appointment.location}</span>
          </div>

          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            {appointment.type === 'Video Call' ? (
              <Video className="w-5 h-5 text-teal-500" />
            ) : (
              <Building className="w-5 h-5 text-teal-500" />
            )}
            <span>{appointment.type}</span>
          </div>
        </div>

        { }
        {appointment.type === 'Video Call' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full py-3 bg-teal-500 text-white rounded-lg
              flex items-center justify-center gap-2 font-medium
              hover:bg-teal-600 transition-colors"
          >
            <Video className="w-5 h-5" />
            Join Video Call
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};


const DoctorCard = ({ doctor, onBook, onChat }) => {
  const { isDarkMode } = useTheme();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`rounded-xl border overflow-hidden transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
            : 'bg-white border-gray-200 hover:shadow-lg'
          }`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-20 h-20 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                {doctor.name}
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {doctor.specialty}
              </p>

              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-yellow-400"
                  >
                    ★
                  </motion.div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {doctor.rating}
                  </span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    ({doctor.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-teal-500">
                  <CalendarClock className="w-4 h-4" />
                  <span>{doctor.nextAvailable}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className={`flex items-center gap-2 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              <Building className="w-5 h-5 text-teal-500" />
              <span>{doctor.hospital}</span>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChat(doctor)}
                className={`flex-1 py-3 rounded-lg font-medium border-2
                  flex items-center justify-center gap-2 transition-all duration-300
                  ${isDarkMode
                    ? 'border-gray-700 hover:bg-gray-700 text-white'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
              >
                <MessageCircle className="w-5 h-5" />
                Chat Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPaymentModal(true)}
                className="flex-[2] py-3 bg-gradient-to-r from-teal-500 to-blue-500
                  text-white rounded-lg flex items-center justify-center gap-2
                  font-medium hover:shadow-lg transition-all duration-300"
              >
                Book Appointment
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            amount={500}
            appointmentDetails={doctor}
          />
        )}
      </AnimatePresence>
    </>
  );
};


const AppointmentsPage = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('upcoming');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatDoctor, setChatDoctor] = useState(null);



  const filteredDoctors = DOCTORS.filter(doctor =>
    (selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty) &&
    (doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCancelAppointment = (id) => {

    console.log('Canceling appointment:', id);
  };
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode
      ? 'bg-gray-900'
      : 'bg-gradient-to-br from-blue-50 via-teal-50 to-white'
      } p-8`}>
      <div className="max-w-7xl mx-auto">
        { }
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              Appointments
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Manage your appointments and schedule new ones
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl border transition-colors ${isDarkMode
                ? 'border-gray-700 hover:bg-gray-800'
                : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(activeView === 'upcoming' ? 'book' : 'upcoming')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl
                bg-gradient-to-r from-teal-500 to-blue-500 text-white
                font-medium hover:shadow-lg transition-all duration-300"
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
            </motion.button>
          </div>
        </div>

        { }
        {activeView === 'upcoming' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {APPOINTMENTS.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancelAppointment}
                  onChat={(doctor) => {
                    setChatDoctor(doctor);
                    setShowChat(true);
                  }}
                />
              ))}

              {APPOINTMENTS.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`col-span-full text-center py-16 rounded-xl border ${isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    No Appointments
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    You don't have any appointments scheduled yet.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('book')}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500
                      text-white rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Book Your First Appointment
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 space-y-6">
                <div className={`rounded-xl border p-6 ${isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
                  }`}>
                  <div className="space-y-4">
                    { }
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredDoctors.map(doctor => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onBook={setSelectedDoctor}
                      onChat={(doctor) => {
                        setChatDoctor(doctor);
                        setShowChat(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      { }
      <AnimatePresence>
        {showChat && chatDoctor && (
          <ChatWidget
            isOpen={showChat}
            onClose={() => {
              setShowChat(false);
              setChatDoctor(null);
            }}
            doctor={chatDoctor}
          />
        )}
      </AnimatePresence>

      { }
      <AnimatePresence>
        {selectedDoctor && (
          <PaymentModal
            isOpen={true}
            onClose={() => setSelectedDoctor(null)}
            amount={500}
            appointmentDetails={selectedDoctor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};


const AppointmentsPageWithTheme = () => (
  <ThemeProvider>
    <AppointmentsPage />
  </ThemeProvider>
);

export default AppointmentsPageWithTheme;