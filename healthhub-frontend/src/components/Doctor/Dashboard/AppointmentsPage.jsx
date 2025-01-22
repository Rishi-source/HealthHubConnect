import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, Phone, Mail,
  MessageSquare, X, Search, Filter,
  ChevronDown, ChevronRight, MoreVertical,
  Check, AlertCircle, Video, ExternalLink,
  FileText, Plus, Stethoscope, Pill, Save,
  DollarSign
} from 'lucide-react';

const API_BASE_URL = 'https://anochat.in/v1';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData);
  }
  return response.json();
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);

  const fetchAppointments = async (view = 'upcoming') => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/appointments/doctor/${view}`);
      if (response.success) {
        setAppointments(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}/${action}`, {
        method: 'PUT'
      });
      
      fetchAppointments();
    } catch (err) {
      setError(err.message);
      console.error(`Failed to ${action} appointment:`, err);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      
      fetchAppointments();
    } catch (err) {
      setError(err.message);
      console.error('Failed to update appointment status:', err);
    }
  };

  const handleGenerateBill = async (appointment) => {
    try {
      const billData = {
        items: [
          {
            description: "Consultation Fee",
            category: "Consultation",
            quantity: 1,
            unit_price: 500.00,
            tax_rate: 18.0
          }
        ],
        payment_method: "UPI",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: "Regular consultation fees",
        tax_rate: 18.0
      };

      const response = await fetchWithAuth(
        `${API_BASE_URL}/doctor/appointments/${appointment.id}/bill`,
        {
          method: 'POST',
          body: JSON.stringify(billData)
        }
      );

      if (response.success) {
        console.log('Bill generated successfully:', response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to generate bill:', err);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
        method: 'PUT'
      });
      fetchAppointments();
    } catch (err) {
      setError(err.message);
      console.error('Failed to complete appointment:', err);
    }
  };

  const handleNoShow = async (appointmentId) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}/no-show`, {
        method: 'PUT'
      });
      fetchAppointments();
    } catch (err) {
      setError(err.message);
      console.error('Failed to mark as no-show:', err);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSavePrescription = async (prescriptionData) => {
    setPrescriptions(prev => [prescriptionData, ...prev]);
    
    setActiveConsultation(null);
  };

  const statsData = {
    totalAppointments: appointments.length,
    videoConsultations: appointments.filter(apt => apt.type === 'ONLINE').length,
    inPersonVisits: appointments.filter(apt => apt.type === 'OFFLINE').length,
    prescriptionsGiven: prescriptions.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
              <p className="text-gray-500">Manage your appointments and consultations</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
              transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            New Appointment
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-teal-500
                focus:ring-4 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-teal-500
                focus:ring-4 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Appointments",
              value: statsData.totalAppointments,
              color: "bg-blue-50 text-blue-600",
              icon: Calendar
            },
            {
              label: "Video Consultations",
              value: statsData.videoConsultations,
              color: "bg-purple-50 text-purple-600",
              icon: Video
            },
            {
              label: "In-Person Visits",
              value: statsData.inPersonVisits,
              color: "bg-green-50 text-green-600",
              icon: User
            },
            {
              label: "Prescriptions Given",
              value: statsData.prescriptionsGiven,
              color: "bg-yellow-50 text-yellow-600",
              icon: FileText
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl ${stat.color.split(' ')[0]}`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.color.split(' ')[1]}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map(appointment => (
            <motion.div
              key={appointment.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 hover:border-teal-100 
                hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.color.split(' ')[1]}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments
            .filter(apt => {
              const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
              return matchesSearch && matchesStatus;
            })
            .map(appointment => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 hover:border-teal-100 
                  hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        {appointment.mode === 'video' && <VideoCallBadge />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-500">
                          {appointment.appointmentType}
                          {appointment.mode === 'video' && ' (Video)'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'upcoming'
                        ? 'bg-blue-50 text-blue-600'
                        : appointment.status === 'confirmed'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAppointment(appointment)}
                    className="flex-1 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg
                      hover:bg-teal-100 transition-colors text-sm font-medium"
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg
                      hover:bg-teal-600 transition-colors text-sm font-medium"
                  >
                    Start Consultation
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}


          {appointments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
              <p className="text-gray-500">You don't have any appointments scheduled.</p>
            </div>
          )}
        </div>
      </div>

<AnimatePresence>
        {selectedAppointment && (
          <QuickViewModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onStartConsultation={(appointment) => {
              setSelectedAppointment(null);
              setActiveConsultation(appointment);
            }}
          />
        )}
        {activeConsultation && (
          <ActiveConsultation
            appointment={activeConsultation}
            onClose={() => setActiveConsultation(null)}
            onSavePrescription={handleSavePrescription}
            onGenerateBill={() => handleGenerateBill(activeConsultation)}
            onComplete={() => handleComplete(activeConsultation.id)}
            onNoShow={() => handleNoShow(activeConsultation.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentsPage;