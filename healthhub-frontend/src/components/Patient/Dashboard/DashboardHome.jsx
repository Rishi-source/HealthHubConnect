import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Hospital, Bell, ChevronRight,
  FileText, Heart, Activity, Plus, Search,
  MapPin, Clock, RefreshCcw, AlertCircle,
  Phone
} from 'lucide-react';
import ChatArea from './AIHealthAssistant';

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
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch('https://anochat.in/v1/health/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch health data. Status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log('Fetched data:', jsonData);

      if (jsonData.success) {
        setData(jsonData.data);
        setError(null);
      } else {
        throw new Error(jsonData.message || 'Failed to fetch health data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};


const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full"
  />
);

const StatCard = ({ label, value, icon: Icon, color, animate = true }) => (
  <motion.div
    initial={animate ? { scale: 0.95, opacity: 0 } : false}
    animate={animate ? { scale: 1, opacity: 1 } : false}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
      hover:shadow-lg transition-all duration-300 transform cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
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

const HealthCard = ({ title, icon: Icon, data, isCompact }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-lg border dark:border-gray-700 border-gray-200
      bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-teal-500 dark:text-teal-400" />
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h3>
    </div>

    <div className="space-y-3">
      {data.length > 0 ? (
        data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg bg-white dark:bg-gray-700/50
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
          >
            {isCompact ? (
              <>
                <div className="font-medium text-gray-800 dark:text-white">{item.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.details}</div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-800 dark:text-white">{item.value}</span>
              </div>
            )}
          </motion.div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No Data Available
        </div>
      )}
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const { data: healthData, loading, error, refetch } = useHealthData();
  useEffect(() => {
    console.log('Health Data:', healthData);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [healthData, loading, error]);

  const formatVitalSigns = (vitalSigns = []) => {
    if (!vitalSigns || vitalSigns.length === 0) return [];

    const latestVitals = vitalSigns.reduce((acc, vital) => {
      if (vital.type === 'bloodPressure') {
        acc.bloodPressure = `${vital.systolic}/${vital.diastolic} mmHg`;
      } else {
        acc[vital.type] = vital.value + (
          vital.type === 'heartRate' ? ' bpm' :
            vital.type === 'temperature' ? '°F' :
              vital.type === 'oxygenSaturation' ? '%' : ''
        );
      }
      return acc;
    }, {});

    return [
      { label: 'Blood Pressure', value: latestVitals?.bloodPressure || 'Not recorded' },
      { label: 'Heart Rate', value: latestVitals?.heartRate || 'Not recorded' },
      { label: 'Temperature', value: latestVitals?.temperature || 'Not recorded' },
      { label: 'Oxygen Saturation', value: latestVitals?.oxygenSaturation || 'Not recorded' }
    ];
  };

  const formatMedications = (medications = []) => {
    if (!medications || medications.length === 0) return [];

    return medications.map(med => ({
      name: med.name,
      details: `${med.dosage}${med.dosage_unit} - ${med.frequency}`
    }));
  };

  const formatAllergies = (allergies = []) => {
    if (!allergies || allergies.length === 0) return [];

    return allergies.map(allergy => ({
      name: allergy.allergen,
      details: `${allergy.severity} - ${allergy.reactions}`
    }));
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <div className="space-y-6">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            label="Medications"
            value={loading ? <LoadingSpinner /> :
              healthData?.medications?.length || 'No Data'}
            icon={Heart}
            color="blue"
          />
          <StatCard
            label="Allergies"
            value={loading ? <LoadingSpinner /> :
              healthData?.allergies?.length || 'No Data'}
            icon={AlertCircle}
            color="teal"
          />
          <StatCard
            label="Emergency Contacts"
            value={loading ? <LoadingSpinner /> :
              healthData?.emergency_contacts?.length || 'No Data'}
            icon={Phone}
            color="purple"
          />
          <StatCard
            label="Vital Signs Recorded"
            value={loading ? <LoadingSpinner /> :
              healthData?.vital_signs?.length || 'No Data'}
            icon={Activity}
            color="pink"
          />
        </motion.div>

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
              data={loading ? [] : formatVitalSigns(healthData?.vital_signs)}
            />

            <HealthCard
              title="Current Medications"
              icon={Heart}
              data={loading ? [] : formatMedications(healthData?.medications)}
              isCompact
            />

            <HealthCard
              title="Allergies"
              icon={AlertCircle}
              data={loading ? [] : formatAllergies(healthData?.allergies)}
              isCompact
            />
          </div>

        </motion.div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        )}

      </div>

      {ChatArea && <ChatArea />}

      <style jsx global>{`
        .transitioning-theme * {
          transition: background-color 0.3s ease-in-out,
                      border-color 0.3s ease-in-out,
                      color 0.3s ease-in-out,
                      box-shadow 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default DashboardHome;