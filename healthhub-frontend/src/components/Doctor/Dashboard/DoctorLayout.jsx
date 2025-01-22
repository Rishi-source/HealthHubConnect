import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Stethoscope, Home, Users, Calendar, FileText, Clock,
  Settings, LogOut, Menu, MessageCircle, Activity, 
  CreditCard, Bell, ChevronRight,UserCog
} from 'lucide-react';

const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/doctor/dashboard' },
    { id: 'appointments', icon: Calendar, label: 'Appointments', path: '/doctor/dashboard/appointments' },
    { id: 'schedule', icon: Clock, label: 'Schedule', path: '/doctor/dashboard/schedule' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/doctor/dashboard/chat' },
    { id: 'prescriptions', icon: FileText, label: 'Prescriptions', path: '/doctor/dashboard/prescriptions' },
    { id: 'analytics', icon: Activity, label: 'Analytics', path: '/doctor/dashboard/analytics' },
    { id: 'billing', icon: CreditCard, label: 'Billing', path: '/doctor/dashboard/billing' },
];

    
const DoctorLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

  
  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    if (currentMenuItem) {
      setActiveItem(currentMenuItem.id);
    } else if (currentPath.includes('/settings')) {
      setActiveItem('settings');
    }
  }, [location.pathname]);
  
  
  const handleNavigation = (item) => {
    navigate(item.path);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('doctor_access_token');
    localStorage.removeItem('doctor_refresh_token');
    navigate('/doctor'); 
};

const handleSettings = () => {
    setActiveItem('settings');
    navigate('/doctor/dashboard/settings'); 
};

const handleLogoClick = () => {
    setActiveItem('dashboard');
    navigate('/doctor/dashboard'); 
};

  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? '256px' : '80px',
        }}
        className="fixed left-0 top-0 h-full bg-white z-30 border-r border-gray-100 shadow-sm"
      >
        <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100">
        {isSidebarOpen ? (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/doctor/dashboard')}>
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-teal-500" />
              </div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-semibold text-gray-800 whitespace-nowrap"
              >
                DocConnect
              </motion.span>
              </div>
) : (
    <div className="cursor-pointer" onClick={() => navigate('/doctor/dashboard')}>
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-teal-500" />
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group relative
                    ${activeItem === item.id
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {activeItem === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-lg"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={handleSettings}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors ${activeItem === 'edit_profile'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
  <UserCog className="w-5 h-5 shrink-0" /> 
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">Edit Profile</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">Logout</span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </motion.aside>

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0">
          <h1 className="text-xl font-semibold text-gray-800">
          </h1>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3">
              <div className="text-right">
              </div>
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorLayout;