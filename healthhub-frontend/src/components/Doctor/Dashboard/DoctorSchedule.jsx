import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, X, Check,
  Calendar as CalendarIcon, Clock, User, Video, Ban,
  AlertCircle, Lock, Eye, Coffee, Loader2, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://anochat.in/v1/doctor';

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'
];

const formatDate = (date) => date.toISOString().split('T')[0];

const handleApiError = async (response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
  }
  return response.json();
};

const BlockTimeModal = ({ 
  isOpen, 
  onClose, 
  onBlock, 
  selectedDate, 
  selectedSlot 
}) => {
  const [reason, setReason] = useState('');
  const [blockType, setBlockType] = useState('slot');
  const [timeRange, setTimeRange] = useState({
    start: selectedSlot?.start || '',
    end: selectedSlot?.end || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedSlot) {
      setTimeRange({
        start: selectedSlot.start,
        end: selectedSlot.end
      });
    }
  }, [selectedSlot]);

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      await onBlock({
        date: formatDate(selectedDate),
        start_time: timeRange.start,
        end_time: timeRange.end,
        reason
      });
      onClose();
    } catch (error) {
      console.error('Block time failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Block Time</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedDate.toLocaleDateString('default', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={timeRange.start}
                onChange={(e) => setTimeRange(prev => ({
                  ...prev,
                  start: e.target.value
                }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg
                  focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={timeRange.end}
                onChange={(e) => setTimeRange(prev => ({
                  ...prev,
                  end: e.target.value
                }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg
                  focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for blocking..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleBlock}
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg
                hover:bg-teal-600 flex items-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Block Time
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DoctorSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtending, setIsExtending] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [error, setError] = useState(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/schedule`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await handleApiError(response);
      
      if (data.success) {
        setSchedule(data.data.schedule);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch schedule');
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExtendSchedule = async () => {
    try {
      setIsExtending(true);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/schedule/extend`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weeks_to_add: 12 })
      });

      const data = await handleApiError(response);
      
      if (data.success) {
        await fetchSchedule(); 
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to extend schedule');
      }
    } catch (err) {
      console.error('Failed to extend schedule:', err);
      setError(err.message);
    } finally {
      setIsExtending(false);
    }
  };

  const handleBlockTime = async (blockData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const response = await fetch(`${API_BASE_URL}/schedule/block`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blockData)
      });

      const data = await handleApiError(response);
      
      if (data.success) {
        await fetchSchedule(); 
        
        setBlockedTimes(prev => [...prev, {
          date: new Date(blockData.date),
          timeRange: {
            start: blockData.start_time,
            end: blockData.end_time
          },
          reason: blockData.reason
        }]);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to block time');
      }
    } catch (err) {
      console.error('Failed to block time:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setView('day');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-xl font-medium text-gray-600">{error}</p>
          <button
            onClick={fetchSchedule}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg 
              hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Schedule Management
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Manage your appointments and availability
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('month')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors
              ${view === 'month'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            Month View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('day')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors
              ${view === 'day'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            Day View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExtendSchedule}
            disabled={isExtending}
            className="px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-lg text-sm
              hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {isExtending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Extend Schedule
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevMonth}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextMonth}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToday}
                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-teal-600
                  hover:bg-teal-50 rounded-lg"
              >
                Today
              </motion.button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {view === 'month' ? (
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              schedule={schedule}
              onBlockDate={(date) => {
                setSelectedDate(date);
                setIsBlockModalOpen(true);
              }}
            />
          ) : (
            <DaySchedule
              date={selectedDate}
              schedule={schedule}
              onBlockTime={(slot) => {
                setSelectedSlot(slot);
                setIsBlockModalOpen(true);
              }}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>

        <AnimatePresence>
          {isBlockModalOpen && (
            <BlockTimeModal
              isOpen={isBlockModalOpen}
              onClose={() => {
                setIsBlockModalOpen(false);
                setSelectedSlot(null);
              }}
              onBlock={handleBlockTime}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
            />
          )}
        </AnimatePresence>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Today's Schedule</h3>
                  <p className="text-sm text-gray-500">
                    {schedule?.days?.[DAYS[new Date().getDay()].toLowerCase()]?.slots?.length || 0} slots
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Blocked Times</h3>
                  <p className="text-sm text-gray-500">
                    {blockedTimes.length} slots blocked
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Coffee className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Break Times</h3>
                  <p className="text-sm text-gray-500">
                    {schedule?.days?.[DAYS[selectedDate.getDay()].toLowerCase()]?.breaks?.length || 0} scheduled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-600">Break Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm text-gray-600">Past Date</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Click any time slot or day to block it. Blocked times cannot be booked for appointments.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarGrid = ({ 
  currentDate, 
  selectedDate, 
  onSelectDate, 
  schedule,
  onBlockDate
}) => {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isSelected = (date) => selectedDate?.toDateString() === date.toDateString();
  const isPast = (date) => date < new Date(new Date().setHours(0, 0, 0, 0));

  const days = [];
  for (let i = 0; i < 42; i++) {
    const dayIndex = i - startDay;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayIndex + 1);
    
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      const dayName = DAYS[date.getDay()].toLowerCase();
      const daySchedule = schedule?.days?.[dayName];
      const blocked = isPast(date) || !daySchedule?.enabled;

      days.push(
        <motion.div
          key={i}
          className={`relative p-4 rounded-xl transition-all cursor-pointer group
            ${isSelected(date)
              ? 'bg-teal-500 text-white'
              : isToday(date)
                ? 'bg-teal-50 text-teal-600'
                : blocked
                  ? 'bg-red-50 text-red-600'
                  : 'hover:bg-gray-50'
            }`}
          onClick={() => !blocked && onSelectDate(date)}
        >
          <span className="block text-sm mb-1">
            {date.toLocaleString('default', { weekday: 'short' })}
          </span>
          <span className="block text-lg font-semibold">
            {date.getDate()}
          </span>
          
          {daySchedule?.enabled && !blocked && (
            <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full
              text-xs flex items-center justify-center font-medium
              ${isSelected(date)
                ? 'bg-white text-teal-600'
                : 'bg-teal-100 text-teal-600'
              }`}
            >
              {daySchedule.slots?.length || 0}
            </div>
          )}

          {blocked && !isPast(date) && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onBlockDate(date);
              }}
              className="absolute top-1 right-1 p-1 rounded-full
                bg-red-100 text-red-500 opacity-0 group-hover:opacity-100
                transition-opacity"
            >
              <Ban className="w-3 h-3" />
            </motion.button>
          )}
        </motion.div>
      );
    } else {
      days.push(
        <div key={i} className="p-4" />
      );
    }
  }

  return (
    <div className="grid grid-cols-7 gap-2 mb-6">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
          {day}
        </div>
      ))}
      {days}
    </div>
  );
};

const DaySchedule = ({ 
  date, 
  schedule,
  onBlockTime,
  onSelectDate 
}) => {
  const dayName = DAYS[date.getDay()].toLowerCase();
  const daySchedule = schedule?.days?.[dayName] || { enabled: false, slots: [], breaks: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {date.toLocaleString('default', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const prevDay = new Date(date);
                prevDay.setDate(date.getDate() - 1);
                onSelectDate(prevDay);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const nextDay = new Date(date);
                nextDay.setDate(date.getDate() + 1);
                onSelectDate(nextDay);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg text-sm font-medium
            ${daySchedule.enabled
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
            }
          `}
        >
          {daySchedule.enabled ? 'Available' : 'Unavailable'}
        </motion.button>
      </div>

      {daySchedule.enabled ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daySchedule.slots?.map((slot, index) => (
            <TimeSlot
              key={index}
              slot={slot}
              onBlock={() => onBlockTime(slot)}
            />
          ))}

          {daySchedule.breaks?.map((breakData, index) => (
            <Break key={`break-${index}`} breakData={breakData} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No slots available for this day</p>
        </div>
      )}
    </div>
  );
};

const TimeSlot = ({ slot, onBlock }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border-2 border-gray-200 bg-white 
        hover:border-teal-200 group transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="wx-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">
          {slot.start} - {slot.end}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {slot.duration} min
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBlock}
            className="opacity-0 group-hover:opacity-100 transition-opacity
              p-1 hover:bg-gray-100 rounded-lg"
          >
            <Ban className="w-4 h-4 text-red-500" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const Break = ({ breakData }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-amber-50 rounded-lg border border-amber-200"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Coffee className="w-4 h-4 text-amber-600" />
        <span className="font-medium text-amber-700">{breakData.name}</span>
      </div>
      <span className="text-sm text-amber-600">
        {breakData.start} - {breakData.end}
      </span>
    </div>
  </motion.div>
);

const prepareSchedulePayload = (schedule, blockedTimes) => {
  const payload = {
    defaultSettings: {
      timePerPatient: "30"
    },
    days: {}
  };

  Object.entries(schedule.days || {}).forEach(([day, dayData]) => {
    if (dayData.enabled) {
      payload.days[day] = {
        enabled: true,
        workingHours: {
          start: dayData.slots[0]?.start || "09:00",
          end: dayData.slots[dayData.slots.length - 1]?.end || "17:00"
        },
        slots: dayData.slots
          .filter(slot => {
            const isTimeBlocked = blockedTimes.some(bt => 
              bt.date.toLocaleString('default', { weekday: 'long' }).toLowerCase() === day.toLowerCase() &&
              bt.timeRange?.start === slot.start &&
              bt.timeRange?.end === slot.end
            );
            return !isTimeBlocked;
          })
          .map(slot => ({
            start: slot.start,
            end: slot.end,
            duration: parseInt(slot.duration || "30")
          })),
        breaks: dayData.breaks
          ?.filter(b => b.enabled)
          .map(b => ({
            name: b.name,
            start: b.start,
            end: b.end
          })),
        blockOffs: blockedTimes
          .filter(bt => bt.date.toLocaleString('default', { weekday: 'long' }).toLowerCase() === day.toLowerCase())
          .map(bt => ({
            start: bt.timeRange.start,
            end: bt.timeRange.end,
            reason: bt.reason
          }))
      };
    }
  });

  return payload;
};

export default DoctorSchedule;

export {
  prepareSchedulePayload,
  formatDate
};