import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CalendarDays, Clock, TrendingUp, ChevronRight, User, 
  Wallet, ArrowUp, ArrowDown, Calendar, AlertCircle, FileText,
  MessageSquare, Video, Building, Star, Stethoscope, Shield,
  Phone, Mail, Info, Plus, CheckCircle, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer } from 'recharts';

const emptyWeeklyData = [
  { day: 'Mon', online: 0, inPerson: 0 },
  { day: 'Tue', online: 0, inPerson: 0 },
  { day: 'Wed', online: 0, inPerson: 0 },
  { day: 'Thu', online: 0, inPerson: 0 },
  { day: 'Fri', online: 0, inPerson: 0 },
];

const emptyConsultationData = [
  { name: 'Mon', hours: 8 },
  { name: 'Tue', hours: 8 },
  { name: 'Wed', hours: 8 },
  { name: 'Thu', hours: 8 },
  { name: 'Fri', hours: 8 },
];

const StatCard = ({ title, value = 0, icon: Icon, trend, trendValue, color = "red" }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`relative overflow-hidden p-6 bg-white rounded-xl border border-gray-100
      hover:shadow-lg hover:border-${color}-100 transition-all duration-300`}
  >
    <div className="relative z-10 flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-600">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1.5">
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-50 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
    </div>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50/20 
      rounded-full -translate-y-16 translate-x-16 blur-2xl`} />
  </motion.div>
);

const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    {action}
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
      <Icon className="w-10 h-10 text-gray-400" />
    </div>
    <p className="text-lg text-gray-500 font-medium">{message}</p>
  </div>
);

const ProfileInfoItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`p-3 bg-${color}-50 rounded-lg`}>
      <Icon className={`w-6 h-6 text-${color}-500`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ConsultationHoursItem = ({ day, time }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-base font-semibold text-gray-900 capitalize">{day}</span>
    <span className="text-sm font-medium text-gray-600">{time}</span>
  </div>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [schedule, setSchedule] = useState(null);

  const formatDoctorName = (name) => {
    return name ? `Dr. ${name}` : 'Doctor';
  };

  const formatSpecializations = (specs) => {
    if (!specs || !specs.length) return 'Not specified';
    return specs.map(spec => 
      spec.split(/(?=[A-Z])/).join(' ')
    ).join(', ');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token found');

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [profileRes, upcomingRes, todayRes, weekRes, scheduleRes] = await Promise.all([
          fetch('https://anochat.in/v1/doctor/profile', { headers }),
          fetch('https://anochat.in/v1/appointments/doctor/upcoming', { headers }),
          fetch('https://anochat.in/v1/appointments/doctor/today', { headers }),
          fetch('https://anochat.in/v1/appointments/doctor/week', { headers }),
          fetch('https://anochat.in/v1/doctor/schedule', { headers })
        ]);

        const [profile, upcoming, today, week, schedule] = await Promise.all([
          profileRes.json(),
          upcomingRes.json(),
          todayRes.json(),
          weekRes.json(),
          scheduleRes.json()
        ]);

        if (profile.success) setDoctorProfile(profile.data);
        if (upcoming.success) setUpcomingAppointments(upcoming.data || []);
        if (today.success) setTodayAppointments(today.data || []);
        if (week.success) setWeeklyAppointments(week.data || []);
        if (schedule.success) setSchedule(schedule.data);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-xl font-medium text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalPatients = upcomingAppointments.length + todayAppointments.length;
  const onlineAppointments = [...upcomingAppointments, ...todayAppointments]
    .filter(apt => apt.type === 'ONLINE').length;
  const confirmedAppointments = [...upcomingAppointments, ...todayAppointments]
    .filter(apt => apt.status === 'CONFIRMED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {formatDoctorName(doctorProfile?.basicInfo?.fullName)}
            </h1>
            <p className="text-lg font-medium text-gray-600 mt-2">
              {formatSpecializations(doctorProfile?.basicInfo?.specializations)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Appointments"
            value={todayAppointments.length}
            icon={Calendar}
            trend="up"
            trendValue="3 more than yesterday"
            color="red"
          />
          <StatCard
            title="Online Consultations"
            value={onlineAppointments}
            icon={Video}
            trend="up"
            trendValue="20% increase"
            color="blue"
          />
          <StatCard
            title="Confirmed Appointments"
            value={confirmedAppointments}
            icon={CheckCircle}
            trend="up"
            trendValue="85% confirmation rate"
            color="green"
          />
          <StatCard
            title="Total Patients"
            value={totalPatients}
            icon={Users}
            trend="up"
            trendValue="12 new this week"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden min-h-[800px]">
              <div className="p-6 border-b border-gray-100">
                <SectionHeader
                  title="Today's Schedule"
                  action={
                    <button
                      onClick={() => navigate('/doctor/dashboard/appointments')}
                      className="inline-flex items-center text-red-500 hover:text-red-600 
                        text-base font-semibold gap-1"
                    >
                      View All
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  }
                />
              </div>
              <div className="p-6 h-full flex items-center justify-center">
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4 w-full">
                    {todayAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-[600px]">
                    <div className="text-center">
                      <div className="w-20 h-20 mb-6 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Appointments Today
                      </h3>
                      <p className="text-gray-500 text-base">
                        Your schedule is clear for the day
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <SectionHeader
                title="Weekly Overview"
                action={
                  <div className="flex items-center gap-6 text-base">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full" />
                      <span className="text-gray-700 font-medium">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full" />
                      <span className="text-gray-700 font-medium">In-Person</span>
                    </div>
                  </div>
                }
              />
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={weeklyAppointments.length > 0 ? 
                      weeklyAppointments.map(apt => ({
                        date: new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        online: apt.type === 'ONLINE' ? 1 : 0,
                        inPerson: apt.type === 'OFFLINE' ? 1 : 0
                      })) : emptyWeeklyData
                    }
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="online"
                      stackId="a" 
                      fill="#EF4444" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="inPerson" 
                      stackId="a" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <SectionHeader
                title="Profile Overview"
                action={
                  <button
                    onClick={() => navigate('/doctor/dashboard/settings')}
                    className="text-base text-red-500 hover:text-red-600 font-semibold"
                  >
                    Edit Profile
                  </button>
                }
              />
              <div className="space-y-4">
                <ProfileInfoItem
                  icon={Building}
                  label="Primary Hospital"
                  value={doctorProfile?.practiceDetails?.affiliations?.[0]?.name || 'Not specified'}
                  color="red"
                />
                <ProfileInfoItem
                  icon={Star}
                  label="Experience"
                  value={`${doctorProfile?.basicInfo?.experience || 0} years`}
                  color="blue"
                />
                <ProfileInfoItem
                  icon={Shield}
                  label="License Number"
                  value={doctorProfile?.basicInfo?.medicalLicenseNumber || 'Not specified'}
                  color="green"
                />
                <ProfileInfoItem
                  icon={Stethoscope}
                  label="Specializations"
                  value={formatSpecializations(doctorProfile?.basicInfo?.specializations)}
                  color="purple"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <SectionHeader
                title="Consultation Hours"
                action={
                  <button
                    onClick={() => navigate('/doctor/dashboard/schedule')}
                    className="text-base text-red-500 hover:text-red-600 font-semibold"
                  >
                    Manage Hours
                  </button>
                }
              />
              <div className="space-y-2">
                {schedule?.schedule?.days && Object.entries(schedule.schedule.days)
                  .filter(([_, data]) => data.enabled)
                  .map(([day, data]) => (
                    <ConsultationHoursItem
                      key={day}
                      day={day}
                      time={`${data.workingHours.start} - ${data.workingHours.end}`}
                    />
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <SectionHeader title="Weekly Hours" />
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Object.entries(schedule?.schedule?.days || {}).length > 0 
                      ? Object.entries(schedule.schedule.days).map(([day, data]) => ({
                          name: day.substring(0, 3),
                          hours: data.enabled ? 8 : 0
                        }))
                      : emptyConsultationData
                    }
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#EF4444" }}
                      activeDot={{ r: 6, fill: "#EF4444" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
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
          className="p-4 bg-white text-red-500 rounded-xl shadow-lg hover:shadow-xl
            border border-gray-100 hover:border-red-100 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
        <motion.button
          onClick={() => navigate('/doctor/dashboard/schedule')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 bg-red-500 text-white rounded-xl shadow-lg hover:shadow-xl
            hover:bg-red-600 transition-all duration-300"
        >
          <Calendar className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  );
};

const AppointmentCard = ({ appointment }) => {
  const [expanded, setExpanded] = useState(false);
  const patientName = appointment?.patient?.name || 'Unknown Patient';
  const appointmentTime = new Date(appointment.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const appointmentType = appointment.type === 'ONLINE' ? 'Video Consultation' : 'In-Person Visit';
  const status = appointment.status;

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-xl border border-gray-100 hover:border-red-100 
        hover:shadow-sm transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              appointment.type === 'ONLINE' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {appointment.type === 'ONLINE' ? (
                <Video className={`w-6 h-6 ${
                  appointment.type === 'ONLINE' ? 'text-blue-500' : 'text-red-500'
                }`} />
              ) : (
                <User className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{patientName}</h3>
              <p className="text-base text-gray-600">{appointmentTime} - {appointmentType}</p>
            </div>
          </div>
          <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
            status === 'CONFIRMED' 
              ? 'bg-green-50 text-green-600' 
              : 'bg-yellow-50 text-yellow-600'
          }`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 pt-5 border-t border-gray-100 space-y-4"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-base">{appointment.patient?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-base">{appointment.patient?.phone}</span>
              </div>
              {appointment.description && (
                <div className="flex items-start gap-3 text-gray-700">
                  <Info className="w-5 h-5 text-gray-500 mt-1" />
                  <span className="text-base">{appointment.description}</span>
                </div>
              )}
              {appointment.type === 'ONLINE' && appointment.meet_link && (
                <a
                  href={appointment.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5
                    bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 
                    transition-colors text-base font-semibold"
                >
                  <Video className="w-5 h-5" />
                  Join Video Call
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;