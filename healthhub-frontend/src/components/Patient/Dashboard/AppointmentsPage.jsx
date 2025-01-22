import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Building, User, Phone,
  Mail, MessageSquare, Video, Stethoscope, ArrowRight,
  Check, AlertCircle, X, Plus, Search, FileText, 
  CreditCard, Shield, Loader2, ChevronLeft, ChevronRight,
  Filter, Activity, Star, DollarSign, Camera, Info,
  CheckCircle, XCircle, ChevronDown, Send, Menu
} from 'lucide-react';

const API_BASE_URL = 'https://anochat.in/v1';

const api = {
  headers: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }),

  handleError: (error) => {
    console.error('API Error:', error);
    if (error.response) {
      return error.response.data.message || 'An error occurred';
    }
    return error.message || 'Network error occurred';
  },

  get: async (endpoint, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: api.headers(token)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw api.handleError(error);
    }
  },

  post: async (endpoint, token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: api.headers(token),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw api.handleError(error);
    }
  },

  put: async (endpoint, token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: api.headers(token),
        body: data ? JSON.stringify(data) : undefined
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw api.handleError(error);
    }
  }
};

const apiService = {
  getDoctors: (token) => api.get('/doctors', token),
  getDoctorDetails: (token, id) => api.get(`/doctors/${id}`, token),
  getUpcomingAppointments: (token) => api.get('/appointments/my/upcoming', token),
  getPastAppointments: (token) => api.get('/appointments/my/past', token),
  getDoctorSlots: (token, doctorId, date) => api.get(`/appointments/doctor/${doctorId}/slots?date=${date}`, token),
  createAppointment: (token, data) => api.post('/appointments', token, data),
  cancelAppointment: (token, id) => api.put(`/appointments/${id}/cancel`, token),
  getAppointmentStatus: (token, id) => api.get(`/appointments/${id}/status`, token),
  getAppointmentBill: (token, id) => api.get(`/doctor/appointments/${id}/bill`, token),
  updateAppointmentBill: (token, id, data) => api.put(`/doctor/appointments/${id}/bill`, token, data),
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
    <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-3 bg-teal-500 text-white rounded-xl
          font-medium hover:bg-teal-600 transition-colors
          inline-flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        {action.text}
      </button>
    )}
  </div>
);

const LoadingSpinner = ({ size = 'default' }) => (
  <div className={`animate-spin rounded-full border-2 border-teal-500 border-t-transparent
    ${size === 'small' ? 'h-4 w-4' : 'h-8 w-8'}`}
  />
);

const StatsCard = ({ icon: Icon, label, value, trend }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
      </div>
      <div className="p-3 bg-gray-700/50 rounded-xl">
        <Icon className="w-6 h-6 text-teal-500" />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-2 mt-4">
        <div className={`p-1 rounded ${
          trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {trend > 0 ? <ArrowRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        <span className="text-sm text-gray-400">
          {trend > 0 ? '+' : ''}{trend}% from last month
        </span>
      </div>
    )}
  </div>
);

const DoctorCard = ({ doctor, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50
        transform hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <motion.div
            className="relative w-20 h-20 rounded-xl bg-gray-700 overflow-hidden"
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {doctor.user?.profile_picture ? (
              <img
                src={doctor.user.profile_picture}
                alt={doctor.basicInfo?.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {doctor.basicInfo?.fullName}
            </h3>
            <p className="text-gray-400">
              {doctor.basicInfo?.specializations?.[0]}
            </p>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Building className="w-4 h-4 text-teal-500" />
                <span className="truncate">
                  {doctor.practiceDetails?.affiliations?.[0]?.name || 'Independent Practice'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Star className="w-4 h-4 text-teal-500" />
                <span>{doctor.basicInfo?.rating || '4.5'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-400">Experience</p>
              <p className="text-lg font-semibold text-white">
                {doctor.basicInfo?.experience}+ Years
              </p>
            </div>
            <div className="p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-400">Patients</p>
              <p className="text-lg font-semibold text-white">
                {doctor.stats?.totalPatients || '1000'}+
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {doctor.practiceDetails?.consultationTypes?.online?.enabled && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(doctor, 'online')}
                className="py-3 rounded-lg font-medium border-2 border-teal-500
                  bg-teal-900/20 text-teal-300 hover:bg-teal-900/40 
                  transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Online ₹{doctor.practiceDetails.consultationTypes.online.fee}
              </motion.button>
            )}

            {doctor.practiceDetails?.consultationTypes?.inPerson?.enabled && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(doctor, 'offline')}
                className="py-3 rounded-lg font-medium border-2 border-blue-500
                  bg-blue-900/20 text-blue-300 hover:bg-blue-900/40
                  transition-colors flex items-center justify-center gap-2"
              >
                <Building className="w-5 h-5" />
                In-Person ₹{doctor.practiceDetails.consultationTypes.inPerson.fee}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AppointmentCard = ({ appointment, onCancel, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                {appointment.doctorImage ? (
                  <img
                    src={appointment.doctorImage}
                    alt={appointment.doctorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-500" />
                )}
              </div>
              {appointment.type === 'online' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5
                  bg-blue-500 rounded-full border-2 border-gray-800
                  flex items-center justify-center"
                >
                  <Video className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-white">{appointment.doctorName}</h3>
              <p className="text-sm text-gray-400">{appointment.specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-5 h-5 text-teal-500" />
            <span>{appointment.time}</span>
          </div>
        </div>

        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700"
            >
              <div className="grid grid-cols-2 gap-2">
                {appointment.type === 'online' && appointment.meetLink && (
                  <motion.a
                    href={appointment.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-2 rounded-lg text-center font-medium text-sm
                      bg-blue-500/20 text-blue-400 hover:bg-blue-500/30
                      transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Join Call
                  </motion.a>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewDetails(appointment)}
                  className="py-2 rounded-lg text-center font-medium text-sm
                    bg-teal-500/20 text-teal-400 hover:bg-teal-500/30
                    transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </motion.button>

                {appointment.status !== 'cancelled' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCancel(appointment)}
                    className="py-2 rounded-lg text-center font-medium text-sm
                      bg-red-500/20 text-red-400 hover:bg-red-500/30
                      transition-colors flex items-center justify-center gap-2
                      col-span-full"
                  >
                    <X className="w-4 h-4" />
                    Cancel Appointment
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SearchAndFilter = ({ searchQuery, onSearchChange, onFilterChange, specializations = [] }) => (
  <div className="sticky top-4 space-y-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search doctors..."
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700
          bg-gray-900 text-white placeholder-gray-500
          focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
      />
    </div>

    <div className="space-y-4">
      <h3 className="font-medium text-white">Specializations</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        {specializations.map((specialty) => (
          <button
            key={specialty}
            onClick={() => onFilterChange(specialty)}
            className="w-full px-4 py-2 rounded-lg text-left text-gray-300 
              hover:bg-gray-700 transition-colors flex items-center justify-between"
          >
            <span>{specialty.charAt(0).toUpperCase() + specialty.slice(1)}</span>
            <span className="text-sm text-gray-500">
              {Math.floor(Math.random() * 20) + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const BookingModal = ({ doctor, onBook, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState('');
  const [appointmentType, setAppointmentType] = useState(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    console.log('Doctor in modal:', doctor); 
  }, [doctor]);

  const fetchAvailableSlots = async (date) => {
    if (!date || !doctor?.id) {
      console.log('Missing required data:', { date, doctorId: doctor?.id });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching slots for:', { date, doctorId: doctor.id });
      const response = await fetch(
        `${API_BASE_URL}/appointments/doctor/${doctor.id}/slots?date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Slots API response:', data);

      if (data.success) {
        setAvailableSlots(data.data.slots || []);
      } else {
        setError(data.data?.message || 'Failed to fetch available slots');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to fetch available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (e) => {
    const selectedValue = e.target.value;
    console.log('Date selected:', selectedValue);

    if (selectedValue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateTime = new Date(selectedValue);

      if (selectedDateTime >= today) {
        setSelectedDate(selectedValue); 
        setSelectedSlot(null);
        await fetchAvailableSlots(selectedValue);
      } else {
        setError('Please select a future date');
      }
    }
  };


  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        const [hours, minutes] = timeString.split(':');
        const today = new Date();
        today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return today.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      console.error('Error formatting time:', err);
      return timeString;
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !appointmentType || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const startTime = selectedSlot.start_time.split('T')[1]?.split('.')[0] || selectedSlot.start_time;
      const endTime = selectedSlot.end_time.split('T')[1]?.split('.')[0] || selectedSlot.end_time;
  
      const appointmentData = {
        doctor_id: doctor.id,
        type: appointmentType.toUpperCase(),
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        description: description.trim(),
        address: doctor?.practiceDetails?.affiliations?.[0]?.address || '',
        latitude: doctor?.practiceDetails?.affiliations?.[0]?.latitude || 0,
        longitude: doctor?.practiceDetails?.affiliations?.[0]?.longitude || 0
      };
  
      console.log('Submitting appointment:', appointmentData);
  
      const response = await apiService.createAppointment(token, appointmentData);
      console.log('Appointment response:', response);
  
      if (response.success) {
        onBook(response.data);
      } else {
        throw new Error(response.data?.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Appointment booking error:', err);
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };  


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden 
          border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white">Book Appointment</h2>
              <p className="text-gray-400">{doctor?.basicInfo?.fullName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  stepNumber <= step ? 'bg-teal-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg 
              text-red-200 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium text-white">Select Consultation Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctor?.practiceDetails?.consultationTypes?.online?.enabled && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAppointmentType('online');
                      setStep(2);
                    }}
                    className="p-6 rounded-xl border-2 border-teal-500 bg-teal-900/20
                      hover:bg-teal-900/30 transition-all duration-300 group"
                  >
                    <Video className="w-10 h-10 mx-auto mb-4 text-teal-500 
                      group-hover:scale-110 transition-transform" />
                    <h4 className="text-lg font-medium text-teal-400 mb-2">
                      Online Consultation
                    </h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Connect with the doctor via video call
                    </p>
                    <div className="text-xl font-bold text-teal-500">
                      ₹{doctor.practiceDetails.consultationTypes.online.fee}
                    </div>
                  </motion.button>
                )}

                {doctor?.practiceDetails?.consultationTypes?.inPerson?.enabled && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAppointmentType('offline');
                      setStep(2);
                    }}
                    className="p-6 rounded-xl border-2 border-blue-500 bg-blue-900/20
                      hover:bg-blue-900/30 transition-all duration-300 group"
                  >
                    <Building className="w-10 h-10 mx-auto mb-4 text-blue-500 
                      group-hover:scale-110 transition-transform" />
                    <h4 className="text-lg font-medium text-blue-400 mb-2">
                      In-Person Visit
                    </h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Visit the doctor at their clinic
                    </p>
                    <div className="text-xl font-bold text-blue-500">
                      ₹{doctor.practiceDetails.consultationTypes.inPerson.fee}
                    </div>
                  </motion.button>
                )}
              </div>

              {appointmentType === 'offline' && doctor?.practiceDetails?.affiliations?.[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-800 rounded-xl mt-6"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-white mb-1">Clinic Location</h4>
                      <p className="text-sm text-gray-400">
                        {doctor.practiceDetails.affiliations[0].address}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium text-white">Select Date & Time</h3>

              <div className="bg-gray-800 rounded-xl p-6">
                <input
    type="date"
    min={new Date().toISOString().split('T')[0]}
    value={selectedDate}
    onChange={handleDateChange}
    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg
      text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
  />

              </div>

              {selectedDate && (
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Available Time Slots</h4>
                  {loading ? (
                    <div className="p-8 flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => {
                        const startTime = new Date(slot.start_time);
                        const isAvailable = slot.available;
                        const timeString = startTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <motion.button
                            key={index}
                            whileHover={{ scale: isAvailable ? 1.02 : 1 }}
                            whileTap={{ scale: isAvailable ? 0.98 : 1 }}
                            onClick={() => isAvailable && setSelectedSlot(slot)}
                            disabled={!isAvailable}
                            className={`
                              p-3 rounded-lg text-sm font-medium transition-all
                              ${selectedSlot === slot
                                ? 'bg-teal-500 text-white'
                                : isAvailable
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                              }
                            `}
                          >
                            {timeString}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedSlot}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg
                    hover:bg-teal-600 transition-colors disabled:opacity-50
                    disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium text-white">Confirm Appointment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Consultation Type</h4>
                  <div className="flex items-center gap-2 text-gray-300">
                    {appointmentType === 'online' ? (
                      <>
                        <Video className="w-5 h-5 text-teal-500" />
                        <span>Online Consultation</span>
                      </>
                    ) : (
                      <>
                        <Building className="w-5 h-5 text-blue-500" />
                        <span>In-Person Visit</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Date & Time</h4>
                  <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
  <Calendar className="w-5 h-5 text-teal-500" />
  <span>
    {selectedDate ? new Date(selectedDate).toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : ''}
  </span>
</div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <span>
                        {new Date(selectedSlot.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your symptoms or reason for consultation..."
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg
                    text-white placeholder-gray-500 focus:border-teal-500 
                    focus:ring-4 focus:ring-teal-500/20 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !description.trim()}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg
                    hover:bg-teal-600 transition-colors disabled:opacity-50
                    disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const AppointmentsPage = () => {
  const [activeView, setActiveView] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (activeView !== 'upcoming' && activeView !== 'past') return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiService[
          activeView === 'upcoming' ? 'getUpcomingAppointments' : 'getPastAppointments'
        ](token);

        if (response.success) {
          setAppointments(response.data.appointments || []);
        } else {
          setError(response.data?.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError('Failed to fetch appointments. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [activeView, token]);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (activeView !== 'book') return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getDoctors(token);

        if (response.success) {
          setDoctors(response.data.doctors || []);
        } else {
          setError(response.data?.message || 'Failed to fetch doctors');
        }
      } catch (err) {
        setError('Failed to fetch doctors. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [activeView, token]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.basicInfo?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        doctor.basicInfo?.specializations?.some(spec =>
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSpecialty = !selectedSpecialty ||
        doctor.basicInfo?.specializations?.includes(selectedSpecialty);

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const specializations = useMemo(() => {
    return Array.from(new Set(doctors.flatMap(doctor => 
      doctor.basicInfo?.specializations || []
    ))).sort();
  }, [doctors]);

  const handleBookAppointment = async (appointmentData) => {
    try {
      const response = await apiService.createAppointment(token, appointmentData);

      if (response.success) {
        setShowBookingModal(false);
        const updatedAppointments = await apiService.getUpcomingAppointments(token);
        if (updatedAppointments.success) {
          setAppointments(updatedAppointments.data.appointments || []);
          setActiveView('upcoming');
        }
      } else {
        setError(response.data?.message || 'Failed to book appointment');
      }
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await apiService.cancelAppointment(token, appointmentId);

      if (response.success) {
        const updatedAppointments = await apiService.getUpcomingAppointments(token);
        if (updatedAppointments.success) {
          setAppointments(updatedAppointments.data.appointments || []);
        }
      } else {
        setError(response.data?.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeView === 'upcoming' ? 'My Appointments' : 'Book Appointment'}
            </h1>
            <p className="text-gray-400">
              {activeView === 'upcoming'
                ? 'View and manage your upcoming appointments'
                : 'Find and book appointments with top doctors'
              }
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {!loading && activeView === 'upcoming' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                icon={Calendar}
                label="Total Appointments"
                value={appointments.length}
                trend={8}
              />
              <StatsCard
                icon={Clock}
                label="Upcoming Appointments"
                value={appointments.filter(apt => apt.status === 'confirmed').length}
                trend={12}
              />
              <StatsCard
                icon={Check}
                label="Completed Appointments"
                value={appointments.filter(apt => apt.status === 'completed').length}
                trend={5}
              />
              <StatsCard
                icon={AlertCircle}
                label="Cancelled Appointments"
                value={appointments.filter(apt => apt.status === 'cancelled').length}
                trend={-2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                  onViewDetails={() => {}}
                />
              ))}

              {appointments.length === 0 && (
                <EmptyState
                  icon={Calendar}
                  title="No Appointments"
                  description="You don't have any upcoming appointments"
                  action={{
                    text: 'Book Your First Appointment',
                    onClick: () => setActiveView('book')
                  }}
                />
              )}
            </div>
          </>
        )}

        {!loading && activeView === 'book' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 shrink-0">
              <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFilterChange={setSelectedSpecialty}
                specializations={specializations}
              />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDoctors.map(doctor => (
                  <DoctorCard
  key={doctor.id}
  doctor={doctor}
  onSelect={(selectedDoctor) => {
    console.log('Selected Doctor:', selectedDoctor);
    setSelectedDoctor({
      ...selectedDoctor,
      id: selectedDoctor.ID 
    });
    setShowBookingModal(true);
  }}
/>              ))}

              {filteredDoctors.length === 0 && (
                <EmptyState
                  icon={Stethoscope}
                  title="No Doctors Found"
                  description={
                    searchQuery || selectedSpecialty
                      ? "No doctors match your search criteria"
                      : "No doctors are available at the moment"
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            doctor={selectedDoctor}
            onBook={handleBookAppointment}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedDoctor(null);
            }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 bg-red-900/90 backdrop-blur-sm text-white rounded-lg
                shadow-lg border border-red-800 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('upcoming')}
          className="p-3 bg-white text-teal-500 rounded-xl shadow-lg hover:shadow-xl
            border border-gray-100 hover:border-teal-100 transition-all duration-300"
        >
          <Calendar className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('book')}
          className="p-3 bg-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl
            hover:bg-teal-600 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  </div>
);
};

export default function AppointmentsPageWrapper() {
const navigate = useNavigate();
const token = localStorage.getItem('access_token');

useEffect(() => {
  if (!token) {
    navigate('/login');
  }
}, [token, navigate]);

if (!token) return null;

return <AppointmentsPage />;
}