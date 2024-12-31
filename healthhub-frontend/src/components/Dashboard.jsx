import React, { useState } from 'react';
import { 
  User, Calendar, Hospital, Sun, Moon, Menu, X, 
  MapPin, Clock, Bell, ChevronRight, Settings,
  FileText, Heart, Activity, Plus
} from 'lucide-react';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const MenuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'Edit Profile' },
    { id: 'appointments', icon: Calendar, label: 'Manage Appointments' },
    { id: 'hospitals', icon: Hospital, label: 'Nearby Hospitals' },
    { id: 'records', icon: FileText, label: 'Health Records' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <aside 
        className={`
          fixed top-0 left-0 h-full transition-all duration-300 z-30
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
          border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
          shadow-lg
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <Heart className={`w-8 h-8 ${isDarkMode ? 'text-teal-400' : 'text-teal-500'}`} />
            <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              HealthHub
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {isSidebarOpen ? 
              <X className={isDarkMode ? 'text-white' : 'text-gray-600'} /> : 
              <Menu className={isDarkMode ? 'text-white' : 'text-gray-600'} />
            }
          </button>
        </div>

        <nav className="mt-8">
          {MenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full p-4 flex items-center gap-4 transition-colors duration-200
                ${activeTab === item.id ? 
                  (isDarkMode ? 'bg-gray-700 text-teal-400' : 'bg-teal-50 text-teal-600') :
                  (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
                }
              `}
            >
              <item.icon className="w-6 h-6" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className={`
          sticky top-0 z-20 p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Welcome, John
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isDarkMode ? 
                  <Sun className="text-yellow-400" /> : 
                  <Moon className="text-gray-600" />
                }
              </button>
              <button className={`p-2 rounded-lg relative ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Bell className={isDarkMode ? 'text-white' : 'text-gray-600'} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Upcoming Appointments', value: '3', icon: Calendar, color: 'blue' },
              { label: 'Nearby Hospitals', value: '8', icon: Hospital, color: 'teal' },
              { label: 'Recent Records', value: '12', icon: FileText, color: 'purple' },
              { label: 'Notifications', value: '5', icon: Bell, color: 'pink' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`
                  p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                  border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                  hover:shadow-lg transition-all duration-300
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.label}
                    </p>
                    <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-500`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`
              p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
              border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Upcoming Appointments
                </h2>
                <button className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  ${isDarkMode ? 'bg-teal-500 hover:bg-teal-600' : 'bg-teal-100 hover:bg-teal-200'}
                  text-teal-700 transition-colors duration-200
                `}>
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`
                      p-4 rounded-lg border
                      ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}
                      transition-colors duration-200
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {appointment.doctor}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {appointment.type}
                        </p>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-sm
                        ${appointment.status === 'upcoming' ? 
                          (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') :
                          (isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600')
                        }
                      `}>
                        {appointment.status}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {appointment.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`
              p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
              border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Nearby Hospitals
                </h2>
                <button className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}
                  hover:opacity-80 transition-opacity duration-200
                `}>
                  <MapPin className="w-4 h-4" />
                  <span>View Map</span>
                </button>
              </div>

              <div className="space-y-4">
                {hospitals.map(hospital => (
                  <div
                    key={hospital.id}
                    className={`
                      p-4 rounded-lg border
                      ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}
                      transition-colors duration-200
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {hospital.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {hospital.distance} away
                        </p>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-sm
                        ${hospital.availability === 'Open' ? 
                          (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600') :
                          (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600')
                        }
                      `}>
                        {hospital.availability}
                      </div>
                    </div>
                    <button className={`
                      mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2
                      ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                      transition-colors duration-200
                    `}>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`
            mt-6 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
            border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Health Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`
                p-4 rounded-lg border
                ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Latest Vitals
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Blood Pressure', value: '120/80 mmHg' },
                    { label: 'Heart Rate', value: '72 bpm' },
                    { label: 'Temperature', value: '98.6°F' },
                    { label: 'Blood Sugar', value: '95 mg/dL' }
                  ].map((vital, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {vital.label}
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {vital.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`
                p-4 rounded-lg border
                ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Current Medications
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily' },
                    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
                    { name: 'Metformin', dosage: '850mg', frequency: 'With meals' }
                  ].map((med, index) => (
                    <div key={index} className={`
                      p-2 rounded-lg
                      ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
                    `}>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {med.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {med.dosage} - {med.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`
                p-4 rounded-lg border
                ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Upcoming Tests
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Blood Work', date: '2024-01-20', time: '9:00 AM' },
                    { name: 'X-Ray', date: '2024-01-25', time: '2:30 PM' },
                    { name: 'ECG', date: '2024-02-01', time: '11:15 AM' }
                  ].map((test, index) => (
                    <div key={index} className={`
                      p-2 rounded-lg
                      ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
                    `}>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {test.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {test.date} at {test.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;