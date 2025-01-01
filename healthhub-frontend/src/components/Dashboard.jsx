import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, Hospital, Sun, Moon, Menu, X, 
  MapPin, Clock, Bell, ChevronRight, Settings,
  FileText, Heart, Activity, Plus, Search, Filter,
  Loader, RefreshCcw, TrendingUp, ArrowUpRight
} from 'lucide-react';
const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
      teal: 'bg-teal-100 text-teal-500 dark:bg-teal-900/30 dark:text-teal-400',
      purple: 'bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400',
      pink: 'bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return colorMap[color];
  };
  
  
const useHealthData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.example.com/health-data');
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch health data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
  
  
  
const StatCard = ({ label, value, icon: Icon, color, animate = true }) => (
    <motion.div
      initial={animate ? { scale: 0.95, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-6 rounded-xl bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:shadow-lg transition-all duration-300
        transform cursor-pointer
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <motion.h3 
            className="text-2xl font-bold mt-1 text-gray-800 dark:text-white"
            initial={animate ? { y: 10, opacity: 0 } : false}
            animate={animate ? { y: 0, opacity: 1 } : false}
            transition={{ delay: 0.2 }}
          >
            {value}
          </motion.h3>
        </div>
        <motion.div
          whileHover={{ rotate: 15 }}
          className={`p-3 rounded-lg ${getColorClasses(color)}`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );

const SearchBar = () => (
  <div className="relative max-w-md">
    <input
      type="text"
      placeholder="Search..."
      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
        dark:border-gray-700 dark:bg-gray-800 dark:text-white
        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
        transition-all duration-300"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
      text-gray-400 dark:text-gray-500" />
  </div>
);

const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full"
  />
);

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { data: healthData, loading, error, refetch } = useHealthData();

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const newMode = !isDarkMode;
    
    root.classList.add('transitioning-theme');
    
    root.classList.add('transitioning-theme');
    
    if (newMode) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    setIsDarkMode(newMode);
    
    localStorage.setItem('darkMode', newMode ? 'dark' : 'light');
    
    setIsDarkMode(newMode);
    
    localStorage.setItem('darkMode', newMode ? 'dark' : 'light');
    
    setTimeout(() => {
      root.classList.remove('transitioning-theme');
    }, 300);
  };
  
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialMode = savedMode === 'dark' || (!savedMode && prefersDark);
    setIsDarkMode(initialMode);
    
  useEffect(() => {
    // Check saved preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialMode = savedMode === 'dark' || (!savedMode && prefersDark);
    setIsDarkMode(initialMode);
    
    const root = document.documentElement;
    if (initialMode) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, []);
  
  const MenuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'Edit Profile' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'hospitals', icon: Hospital, label: 'Hospitals' },
    { id: 'records', icon: FileText, label: 'Records' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // Mock data - replace with API data in production
  const appointments = [
    { id: 1, doctor: "Dr. Sarah Wilson", type: "General Checkup", date: "2024-01-15", time: "10:00 AM", status: "upcoming" },
    { id: 2, doctor: "Dr. Michael Chen", type: "Dental", date: "2024-01-18", time: "2:30 PM", status: "upcoming" },
    { id: 3, doctor: "Dr. Emily Brown", type: "Cardiology", date: "2024-01-20", time: "11:15 AM", status: "pending" }
  ];

  const hospitals = [
    { id: 1, name: "City General Hospital", distance: "1.2 km", availability: "Open" },
    { id: 2, name: "St. Mary's Medical Center", distance: "2.5 km", availability: "Open" },
    { id: 3, name: "Park View Hospital", distance: "3.8 km", availability: "Closed" }
  ];

  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '5rem' }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
<div className={`min-h-screen ${isDarkMode ? 'light' : ''}`}>
  <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <motion.aside 
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`
            fixed top-0 left-0 h-full z-30
            dark:bg-gray-800 bg-white 
            border-r dark:border-gray-700 border-gray-200
            shadow-lg
          `}
        >
          <div className="p-4 flex items-center justify-between">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3"
                >
                  <Heart className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                  <span className="font-bold text-xl text-gray-800 dark:text-white">
                    HealthHub
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-200"
            >
              {isSidebarOpen ? 
                <X className="text-gray-600 dark:text-white" /> : 
                <Menu className="text-gray-600 dark:text-white" />
              }
            </motion.button>
          </div>
          <nav className="mt-8">
            {MenuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full p-4 flex items-center gap-4 transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-teal-50 dark:bg-gray-700 text-teal-600 dark:text-teal-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                `}
              >
                <item.icon className="w-6 h-6" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        <motion.main
          animate={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="transition-all duration-300"
        >
          <div className="sticky top-0 z-20 p-4 bg-white dark:bg-gray-800 
            border-b dark:border-gray-700 border-gray-200
            backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Welcome, John
                </h1>
                <SearchBar />
              </div>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors duration-200"
                >
                  <AnimatePresence mode="wait">
                    {isDarkMode ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="text-yellow-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="text-gray-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg relative hover:bg-gray-100 
                    dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Bell className="text-gray-600 dark:text-white" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
                  />
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-4 top-16 w-80 bg-white dark:bg-gray-800 
                        rounded-xl shadow-lg border dark:border-gray-700 z-50"
                    >
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

]          <div className="p-6">
          <div className="p-6">
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard
                label="Upcoming Appointments"
                value={loading ? <LoadingSpinner /> : '3'}
                icon={Calendar}
                color="blue"
              />
              <StatCard
                label="Nearby Hospitals"
                value={loading ? <LoadingSpinner /> : '8'}
                icon={Hospital}
                color="teal"
              />
              <StatCard
                label="Recent Records"
                value={loading ? <LoadingSpinner /> : '12'}
                icon={FileText}
                color="purple"
              />
              <StatCard
                label="Notifications"
                value={loading ? <LoadingSpinner /> : '5'}
                icon={Bell}
                color="pink"
              />
                </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 rounded-xl border 
                  dark:border-gray-700 border-gray-200 shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Upcoming Appointments
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg
                        bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400
                        hover:bg-teal-200 dark:hover:bg-teal-500/30
                        transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New</span>
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {appointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className={`
                            p-4 rounded-lg border
                            dark:border-gray-700 border-gray-200
                            hover:shadow-md dark:hover:bg-gray-700/50
                            transition-all duration-200
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white">
                                {appointment.doctor}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {appointment.type}
                              </p>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`
                                px-3 py-1 rounded-full text-sm
                                ${appointment.status === 'upcoming'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                }
                              `}
                            >
                              {appointment.status}
                            </motion.div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl border
                  dark:border-gray-700 border-gray-200 shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Nearby Hospitals
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg
                        bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400
                        hover:bg-blue-100 dark:hover:bg-blue-500/20
                        transition-colors duration-200"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>View Map</span>
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {hospitals.map((hospital, index) => (
                      <motion.div
                        key={hospital.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          p-4 rounded-lg border
                          dark:border-gray-700 border-gray-200
                          hover:shadow-md dark:hover:bg-gray-700/50
                          transition-all duration-200
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-white">
                              {hospital.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {hospital.distance} away
                            </p>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`
                              px-3 py-1 rounded-full text-sm
                              ${hospital.availability === 'Open'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              }
                            `}
                          >
                            {hospital.availability}
                          </motion.div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2
                            bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white
                            hover:bg-gray-100 dark:hover:bg-gray-700
                            transition-colors duration-200"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border
                dark:border-gray-700 border-gray-200 shadow-sm"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                Health Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HealthCard
                  title="Latest Vitals"
                  icon={Activity}
                  data={[
                    { label: 'Blood Pressure', value: '120/80 mmHg' },
                    { label: 'Heart Rate', value: '72 bpm' },
                    { label: 'Temperature', value: '98.6°F' },
                    { label: 'Blood Sugar', value: '95 mg/dL' }
                  ]}
                />

                <HealthCard
                  title="Current Medications"
                  icon={Heart}
                  data={[
                    { name: 'Amoxicillin', details: '500mg - Twice daily' },
                    { name: 'Lisinopril', details: '10mg - Once daily' },
                    { name: 'Metformin', details: '850mg - With meals' }
                  ]}
                  isCompact
                />

                <HealthCard
                  title="Upcoming Tests"
                  icon={FileText}
                  data={[
                    { name: 'Blood Work', details: '2024-01-20 at 9:00 AM' },
                    { name: 'X-Ray', details: '2024-01-25 at 2:30 PM' },
                    { name: 'ECG', details: '2024-02-01 at 11:15 AM' }
                  ]}
                  isCompact
                />
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Health Metrics
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refetch}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    transition-colors duration-200"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Refresh</span>
                </motion.button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48 bg-white
                  dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-48 bg-white
                  dark:bg-gray-800 rounded-xl border dark:border-gray-700
                  text-red-500 dark:text-red-400">
                  {error}
                </div>
              ) : (
                <pre className="bg-white dark:bg-gray-800 rounded-xl p-6 border
                  dark:border-gray-700 overflow-auto">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              )}
            </motion.div>
          </div>
        </motion.main>
      </div>

      <style jsx global>{`
        .transitioning-theme * {
          transition: background-color 0.3s ease-in-out,
                      border-color 0.3s ease-in-out,
                      color 0.3s ease-in-out,
                      box-shadow 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

const HealthCard = ({ title, icon: Icon, data, isCompact }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-lg border dark:border-gray-700 border-gray-200
      bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-teal-500 dark:text-teal-400" />
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">
        {title}
      </h3>
    </div>

    <div className="space-y-3">
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            ${isCompact ? 'p-2' : 'p-3'} 
            rounded-lg bg-white dark:bg-gray-700/50
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors duration-200
          `}
        >
          {isCompact ? (
            <>
              <div className="font-medium text-gray-800 dark:text-white">
                {item.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.details}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {item.value}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default Dashboard;