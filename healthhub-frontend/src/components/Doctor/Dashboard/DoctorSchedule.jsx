import React, { useState, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, X, Check,
  Calendar as CalendarIcon, Clock, User, Video, Ban,
  AlertCircle, Lock, Eye, Coffee, Calendar as CalIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Days of the week
const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'
];

// Initial schedule data structure
const INITIAL_SCHEDULE = {
  raw: {
    Monday: {
      enabled: true,
      slots: [
        { start: "09:00", end: "09:30", duration: "30", capacity: "1" },
        { start: "09:30", end: "10:00", duration: "30", capacity: "1" },
        { start: "10:00", end: "10:30", duration: "30", capacity: "1" },
        { start: "10:30", end: "11:00", duration: "30", capacity: "1" },
        { start: "11:00", end: "11:30", duration: "30", capacity: "1" },
        { start: "11:30", end: "12:00", duration: "30", capacity: "1" },
        { start: "12:00", end: "12:30", duration: "30", capacity: "1" },
        { start: "14:00", end: "14:30", duration: "30", capacity: "1" },
        { start: "14:30", end: "15:00", duration: "30", capacity: "1" },
        { start: "15:00", end: "15:30", duration: "30", capacity: "1" },
        { start: "15:30", end: "16:00", duration: "30", capacity: "1" },
        { start: "16:30", end: "17:00", duration: "30", capacity: "1" }
      ],
      breaks: {
        lunchBreak: { enabled: true, start: "13:00", end: "14:00", name: "Lunch Break" },
        teaBreak: { enabled: true, start: "16:00", end: "16:30", name: "Tea Break" }
      }
    },
    Tuesday: {
      enabled: true,
      slots: [
        { start: "09:00", end: "09:30", duration: "30", capacity: "1" },
        { start: "09:30", end: "10:00", duration: "30", capacity: "1" },
        { start: "10:00", end: "10:30", duration: "30", capacity: "1" },
        { start: "10:30", end: "11:00", duration: "30", capacity: "1" },
        { start: "11:00", end: "11:30", duration: "30", capacity: "1" },
        { start: "11:30", end: "12:00", duration: "30", capacity: "1" },
        { start: "12:00", end: "12:30", duration: "30", capacity: "1" },
        { start: "14:00", end: "14:30", duration: "30", capacity: "1" },
        { start: "14:30", end: "15:00", duration: "30", capacity: "1" },
        { start: "15:00", end: "15:30", duration: "30", capacity: "1" },
        { start: "15:30", end: "16:00", duration: "30", capacity: "1" },
        { start: "16:30", end: "17:00", duration: "30", capacity: "1" }
      ],
      breaks: {
        lunchBreak: { enabled: true, start: "13:00", end: "14:00", name: "Lunch Break" },
        teaBreak: { enabled: true, start: "16:00", end: "16:30", name: "Tea Break" }
      }
    }
  },
  payload: {
    defaultSettings: {
      timePerPatient: "30"
    },
    days: {
      Monday: {
        enabled: true,
        workingHours: { start: "09:00", end: "17:00" },
        slots: [
          { start: "09:00", end: "09:30", duration: 30 },
          { start: "09:30", end: "10:00", duration: 30 },
          { start: "10:00", end: "10:30", duration: 30 },
          { start: "10:30", end: "11:00", duration: 30 },
          { start: "11:00", end: "11:30", duration: 30 },
          { start: "11:30", end: "12:00", duration: 30 },
          { start: "12:00", end: "12:30", duration: 30 },
          { start: "14:00", end: "14:30", duration: 30 },
          { start: "14:30", end: "15:00", duration: 30 },
          { start: "15:00", end: "15:30", duration: 30 },
          { start: "15:30", end: "16:00", duration: 30 },
          { start: "16:30", end: "17:00", duration: 30 }
        ],
        breaks: [
          { name: "Lunch Break", start: "13:00", end: "14:00" },
          { name: "Tea Break", start: "16:00", end: "16:30" }
        ]
      }
    }
  }
};

// Block Time Modal Component
const BlockTimeModal = ({ isOpen, onClose, onBlock, selectedDate, selectedSlot }) => {
  const [reason, setReason] = useState('');
  const [blockType, setBlockType] = useState('slot');
  const [timeRange, setTimeRange] = useState({
    start: selectedSlot?.start || '',
    end: selectedSlot?.end || ''
  });

  useEffect(() => {
    if (selectedSlot) {
      setTimeRange({
        start: selectedSlot.start,
        end: selectedSlot.end
      });
    }
  }, [selectedSlot]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
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
              {selectedDate?.toLocaleDateString('default', { 
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
          <div className="flex gap-4">
            <button
              onClick={() => setBlockType('slot')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all
                ${blockType === 'slot'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Clock className="w-5 h-5 text-teal-500 mx-auto mb-2" />
              <span className="block text-sm font-medium">
                Block Time Slot
              </span>
            </button>
            <button
              onClick={() => setBlockType('date')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all
                ${blockType === 'date'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <CalIcon className="w-5 h-5 text-teal-500 mx-auto mb-2" />
              <span className="block text-sm font-medium">
                Block Entire Day
              </span>
            </button>
          </div>

          {blockType === 'slot' && (
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
          )}

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
              onClick={() => {
                onBlock({
                  type: blockType,
                  timeRange: blockType === 'slot' ? timeRange : null,
                  reason,
                  date: selectedDate
                });
                onClose();
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg
                hover:bg-teal-600 flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Block {blockType === 'slot' ? 'Time Slot' : 'Day'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Time Slot Component
const TimeSlot = ({ slot, isBlocked, onBlock }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isBlocked
          ? 'bg-gray-50 border-gray-300'
          : 'bg-white border-gray-200 hover:border-teal-200'
      } group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isBlocked ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`font-medium ${isBlocked ? 'text-gray-500' : 'text-gray-700'}`}>
            {slot.start} - {slot.end}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {slot.duration} min
          </span>
          {!isBlocked && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBlock(slot)}
              className="opacity-0 group-hover:opacity-100 transition-opacity
                p-1 hover:bg-gray-100 rounded-lg"
            >
              <Ban className="w-4 h-4 text-red-500" />
            </motion.button>
          )}
        </div>
      </div>

      {isBlocked && slot.reason && (
        <div className="mt-2 text-sm text-gray-500">
          <span className="text-gray-400">Reason:</span> {slot.reason}
        </div>
      )}

      {isBlocked && (
        <div className="absolute -top-2 -right-2">
          <span className="px-2 py-1 bg-red-100 text-red-600
            rounded-full text-xs font-medium">
            Blocked
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Break Component
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

// Calendar Header Component
const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => (
<div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToday}
          className="px-4 py-2 text-sm font-medium text-teal-600
            hover:bg-teal-50 rounded-lg"
        >
          Today
        </motion.button>
      </div>
    </div>
  </div>
);

// Calendar Grid Component
const CalendarGrid = ({ 
  currentDate, 
  selectedDate, 
  onSelectDate, 
  schedule,
  blockedDates = [],
  onBlockDate
}) => {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isSelected = (date) => selectedDate?.toDateString() === date.toDateString();
  const isBlocked = (date) => blockedDates.some(d => d.toDateString() === date.toDateString());
  const isPast = (date) => date < new Date(new Date().setHours(0, 0, 0, 0));

  const days = [];
  for (let i = 0; i < 42; i++) {
    const dayIndex = i - startDay;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayIndex + 1);
    
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      const dayName = DAYS[date.getDay()];
      const daySchedule = schedule?.raw?.[dayName];
      const blocked = isBlocked(date) || isPast(date);

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
              {daySchedule.slots.length}
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

// Day Schedule Component
const DaySchedule = ({ 
  date, 
  schedule,
  blockedTimes = [],
  onBlockTime,
  onSelectDate 
}) => {
  const dayName = DAYS[date.getDay()];
  const daySchedule = schedule?.raw?.[dayName] || { enabled: false, slots: [], breaks: {} };

  const isTimeBlocked = (slot) => {
    return blockedTimes.some(bt => 
      bt.date.toDateString() === date.toDateString() &&
      bt.timeRange?.start === slot.start &&
      bt.timeRange?.end === slot.end
    );
  };

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
          {daySchedule.slots.map((slot, index) => (
            <TimeSlot
              key={index}
              slot={slot}
              isBlocked={isTimeBlocked(slot)}
              onBlock={() => onBlockTime(slot)}
            />
          ))}

          {Object.values(daySchedule.breaks).map((breakData, index) => (
            breakData.enabled && (
              <Break key={`break-${index}`} breakData={breakData} />
            )
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

// Main Component
const DoctorSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setView('day');
  };

  // Block handlers
  const handleBlock = (blockData) => {
    if (blockData.type === 'date') {
      setBlockedDates([...blockedDates, blockData.date]);
    } else {
      setBlockedTimes([...blockedTimes, {
        date: blockData.date,
        timeRange: blockData.timeRange,
        reason: blockData.reason
      }]);
    }

    // Update schedule data
    const newSchedule = { ...schedule };
    const dayName = DAYS[blockData.date.getDay()];

    if (blockData.type === 'date') {
      // Block entire day
      if (newSchedule.raw[dayName]) {
        newSchedule.raw[dayName].enabled = false;
        if (newSchedule.payload.days[dayName]) {
          newSchedule.payload.days[dayName].enabled = false;
        }
      }
    } else {
      // Block specific time slot
      const updatedSlots = newSchedule.raw[dayName].slots.map(slot => {
        if (slot.start === blockData.timeRange.start && 
            slot.end === blockData.timeRange.end) {
          return {
            ...slot,
            type: 'block-off',
            reason: blockData.reason
          };
        }
        return slot;
      });

      newSchedule.raw[dayName].slots = updatedSlots;
      if (newSchedule.payload.days[dayName]) {
        newSchedule.payload.days[dayName].slots = updatedSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          duration: parseInt(slot.duration),
          ...(slot.type === 'block-off' && { type: 'block-off' })
        }));
      }
    }

    setSchedule(newSchedule);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Schedule Management</h1>
            <p className="text-gray-500">Manage your appointments and availability</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg transition-colors
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
            className={`px-4 py-2 rounded-lg transition-colors
              ${view === 'day'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            Day View
          </motion.button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {view === 'month' ? (
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            schedule={schedule}
            blockedDates={blockedDates}
            onBlockDate={(date) => {
              setSelectedDate(date);
              setIsBlockModalOpen(true);
            }}
          />
        ) : (
          <DaySchedule
            date={selectedDate}
            schedule={schedule}
            blockedTimes={blockedTimes}
            onBlockTime={(slot) => {
              setSelectedSlot(slot);
              setIsBlockModalOpen(true);
            }}
            onSelectDate={setSelectedDate}
          />
        )}

        <AnimatePresence>
          {isBlockModalOpen && (
            <BlockTimeModal
              isOpen={isBlockModalOpen}
              onClose={() => {
                setIsBlockModalOpen(false);
                setSelectedSlot(null);
              }}
              onBlock={handleBlock}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
            />
          )}
        </AnimatePresence>

        {/* Status Cards */}
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
                    {schedule?.raw?.[DAYS[new Date().getDay()]]?.slots.length || 0} slots
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
                    {Object.values(schedule?.raw?.[DAYS[selectedDate.getDay()]]?.breaks || {})
                      .filter(b => b.enabled).length} scheduled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
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

        {/* Help text */}
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

// Helper function to prepare schedule payload
const prepareSchedulePayload = (schedule, blockedTimes, blockedDates) => {
  const payload = {
    raw: {},
    payload: {
      defaultSettings: {
        timePerPatient: "30"
      },
      days: {}
    }
  };

  // Transform the schedule data for each day
  Object.entries(schedule.raw).forEach(([day, dayData]) => {
    const isDateBlocked = blockedDates.some(date => 
      DAYS[date.getDay()] === day
    );

    // Raw data structure
    payload.raw[day] = {
      enabled: !isDateBlocked && dayData.enabled,
      slots: dayData.slots.map(slot => {
        const isTimeBlocked = blockedTimes.some(bt => 
          DAYS[bt.date.getDay()] === day &&
          bt.timeRange?.start === slot.start &&
          bt.timeRange?.end === slot.end
        );

        return {
          start: slot.start,
          end: slot.end,
          duration: slot.duration || "30",
          capacity: slot.capacity || "1",
          ...(isTimeBlocked && { type: "block-off" })
        };
      }),
      breaks: dayData.breaks,
      blockOffs: blockedTimes
        .filter(bt => DAYS[bt.date.getDay()] === day)
        .map(bt => ({
          start: bt.timeRange.start,
          end: bt.timeRange.end,
          reason: bt.reason
        }))
    };

    // Payload data structure
    if (!isDateBlocked && dayData.enabled) {
      payload.payload.days[day] = {
        enabled: true,
        workingHours: {
          start: dayData.slots[0]?.start || "09:00",
          end: dayData.slots[dayData.slots.length - 1]?.end || "17:00"
        },
        slots: dayData.slots
          .filter(slot => {
            const isTimeBlocked = blockedTimes.some(bt => 
              DAYS[bt.date.getDay()] === day &&
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
        breaks: Object.values(dayData.breaks)
          .filter(b => b.enabled)
          .map(b => ({
            name: b.name,
            start: b.start,
            end: b.end
          })),
        blockOffs: blockedTimes
          .filter(bt => DAYS[bt.date.getDay()] === day)
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





                