import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CalendarDays, Clock, TrendingUp, 
  ChevronRight, User, Wallet, ArrowUp, ArrowDown,
  Calendar, AlertCircle, CheckCircle, XCircle,
  FileText, MessageSquare, BarChart3, BellRing,
  Phone, Mail, Info, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useAppointmentsData = () => ({
  data: {
    upcomingAppointments: [
      { 
        id: 1, 
        patientName: "Sarah Johnson", 
        time: "10:00 AM", 
        type: "Follow-up", 
        status: "confirmed",
        phone: "+1 234-567-8900",
        email: "sarah.j@email.com",
        notes: "Previous visit: High blood pressure"
      },
      { 
        id: 2, 
        patientName: "Michael Chen", 
        time: "11:30 AM", 
        type: "New Patient", 
        status: "pending",
        phone: "+1 234-567-8901",
        email: "michael.c@email.com",
        notes: "First consultation"
      },
      { 
        id: 3, 
        patientName: "Emily Davis", 
        time: "2:00 PM", 
        type: "Check-up", 
        status: "confirmed",
        phone: "+1 234-567-8902",
        email: "emily.d@email.com",
        notes: "Regular checkup"
      }
    ],
    stats: {
      totalPatients: 1248,
      monthlyAppointments: 156,
      averageRating: 4.8,
      revenue: 15840
    },
    weeklyStats: [
      { day: 'Mon', appointments: 12 },
      { day: 'Tue', appointments: 18 },
      { day: 'Wed', appointments: 15 },
      { day: 'Thu', appointments: 20 },
      { day: 'Fri', appointments: 16 },
      { day: 'Sat', appointments: 10 },
      { day: 'Sun', appointments: 5 }
    ],
    notifications: [
      { id: 1, title: "New appointment request", message: "from David Wilson", time: "5 mins ago", type: "request" },
      { id: 2, title: "Patient review submitted", message: "by Maria Garcia", time: "1 hour ago", type: "review" },
      { id: 3, title: "Appointment cancelled", message: "by James Smith", time: "2 hours ago", type: "cancellation" }
    ]
  },
  loading: false
});

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer
      hover:shadow-lg hover:border-teal-100 transition-all duration-300"
  >
    <div className="flex justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-gray-800">{value}</h3>
        {trend && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mt-2"
          >
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendValue}
            </span>
          </motion.div>
        )}
      </div>
      <motion.div 
        whileHover={{ rotate: 15 }}
        className="p-4 bg-teal-50 rounded-xl"
      >
        <Icon className="w-6 h-6 text-teal-500" />
      </motion.div>
    </div>
  </motion.div>
);

const AppointmentCard = ({ appointment, expanded, onToggle }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="overflow-hidden"
  >
    <motion.div 
      onClick={onToggle}
      className="p-4 rounded-xl bg-white border border-gray-100 hover:border-teal-100 
        hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"
          >
            <User className="w-5 h-5 text-teal-600" />
          </motion.div>
          <div>
            <h3 className="font-medium text-gray-800">{appointment.patientName}</h3>
            <p className="text-sm text-gray-500">{appointment.time} - {appointment.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            appointment.status === 'confirmed' 
              ? 'bg-green-50 text-green-600' 
              : 'bg-yellow-50 text-yellow-600'
          }`}>
            {appointment.status}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-gray-50 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{appointment.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{appointment.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                <Info className="w-4 h-4" />
                <span>{appointment.notes}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium
                  hover:bg-teal-100 transition-colors"
              >
                View Details
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium
                  hover:bg-red-100 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </motion.div>
);

const AppointmentList = ({ appointments }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Today's Appointments</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg
            hover:bg-teal-100 transition-colors text-sm font-medium"
        >
          View All <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="space-y-4">
        {appointments.map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            expanded={expandedId === apt.id}
            onToggle={() => setExpandedId(expandedId === apt.id ? null : apt.id)}
          />
        ))}
      </div>
    </div>
  );
};

const WeeklyChart = ({ data }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Overview</h2>
    <div className="flex items-end justify-between h-48">
      {data.map((item, index) => {
        const height = (item.appointments / 20) * 100;
        return (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-2 group"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              className="w-12 bg-teal-100 group-hover:bg-teal-200 rounded-xl relative
                transition-colors duration-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                  bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
              >
                {item.appointments} appointments
              </motion.div>
            </motion.div>
            <span className="text-sm font-medium text-gray-600">{item.day}</span>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const NotificationPanel = ({ notifications }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-800">Recent Notifications</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="text-teal-500 hover:text-teal-600 text-sm font-medium"
      >
        Mark all as read
      </motion.button>
    </div>
    <div className="space-y-4">
      {notifications.map((notif) => (
        <motion.div
          key={notif.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, x: 5 }}
          className="p-4 rounded-xl bg-white border border-gray-100 hover:border-teal-100
            hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex gap-4">
            <motion.div
              whileHover={{ rotate: 15 }}
              className={`p-2 rounded-xl shrink-0 ${
                notif.type === 'request' ? 'bg-blue-50' :
                notif.type === 'review' ? 'bg-green-50' :
                'bg-red-50'
              }`}
            >
              {notif.type === 'request' ? (
                <Calendar className="w-5 h-5 text-blue-500" />
              ) : notif.type === 'review' ? (
                <MessageSquare className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </motion.div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="font-medium text-gray-800">{notif.title}</p>
                <span className="text-xs text-gray-500">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { data, loading } = useAppointmentsData();

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={data.stats.totalPatients}
            icon={Users}
            trend="up"
            trendValue="12% this month"
          />
          <StatCard
            title="Monthly Appointments"
            value={data.stats.monthlyAppointments}
            icon={CalendarDays}
            trend="up"
            trendValue="8% vs last month"
          />
          <StatCard
            title="Average Rating"
            value={data.stats.averageRating}
            icon={TrendingUp}
            trend="up"
            trendValue="0.2 increase"
          />
          <StatCard
            title="Monthly Revenue"
            value={`${data.stats.revenue}`}
            icon={Wallet}
            trend="down"
            trendValue="3% vs last month"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AppointmentList appointments={data.upcomingAppointments} />
          </div>

          <div>
            <NotificationPanel notifications={data.notifications} />
          </div>
        </div>
        <div className="mt-6">
          <WeeklyChart data={data.weeklyStats} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 flex gap-3"
      >
        <motion.button
          onClick={() => navigate('/doctor/dashboard/chat')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-white text-teal-500 rounded-xl shadow-lg hover:shadow-xl
            border border-gray-100 hover:border-teal-100 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
        <motion.button
          onClick={() => navigate('/doctor/dashboard/schedule')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl
            hover:bg-teal-600 transition-all duration-300"
        >
          <Calendar className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DoctorDashboard;