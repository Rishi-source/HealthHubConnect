import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, Hospital, Sun, Moon, Menu, X,
  Heart, Settings, FileText, Activity, LogOut
} from 'lucide-react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';


import DashboardHome from './DashboardHome';
import EditProfile from './EditProfile';
import NearbyHospital from './Nearbyhospitals';
import AppointmentsPageWithTheme from './AppointmentsPage';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const MenuItems = [
    { id: 'dashboard', path: '/dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'profile', path: '/dashboard/profile/edit', icon: User, label: 'Edit Profile' },
    { id: 'appointments', path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
    { id: 'hospitals', path: '/dashboard/hospitals', icon: Hospital, label: 'Hospitals' },
  ];

  const handleLogout = () => {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');


    localStorage.removeItem('healthProfile');
    localStorage.removeItem('darkMode');


    window.location.href = '/auth';
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const normalizedPath = currentPath.replace(/\/$/, '');

    const currentTab = MenuItems.find(item => {
      if (item.id === 'dashboard') {
        return normalizedPath === '/dashboard' || normalizedPath === '/dashboard/';
      }
      return normalizedPath.includes(item.path);
    });

    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname]);

  const handleMenuClick = (itemId) => {
    const menuItem = MenuItems.find(item => item.id === itemId);
    if (menuItem) {
      setActiveTab(itemId);
      navigate(menuItem.path);
    }
  };

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const newMode = !isDarkMode;

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

    setTimeout(() => {
      root.classList.remove('transitioning-theme');
    }, 300);
  };

  useEffect(() => {
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

  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '5rem' }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        { }
        <motion.aside
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`
            fixed top-0 left-0 h-full z-30 flex flex-col
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

          { }
          <nav className="mt-8 flex-1">
            {MenuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMenuClick(item.id)}
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

          { }
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 
                dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-6 h-6" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.aside>

        { }
        <motion.main
          animate={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="transition-all duration-300"
        >
          { }
          <div className="sticky top-0 z-20 p-4 bg-white dark:bg-gray-800 
            border-b dark:border-gray-700 border-gray-200
            backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90"
          >
            <div className="flex items-center justify-end gap-4">
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
            </div>
          </div>

          { }
          <div className="p-6">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/hospitals" element={<NearbyHospital />} />
              <Route path="/appointments" element={<AppointmentsPageWithTheme />} />
            </Routes>
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

export default DashboardLayout;