import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, Plus, X, AlertCircle,
  Coffee, Settings, Wand2, Eye, Check,
  Users
} from 'lucide-react';

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday'
];

const DEFAULT_BREAKS = {
  lunchBreak: { enabled: true, start: '13:00', end: '14:00', name: 'Lunch Break' },
  teaBreak: { enabled: true, start: '16:00', end: '16:30', name: 'Tea Break' }
};

const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const isTimeInBreak = (time, breaks) => {
  return Object.values(breaks)
    .filter(b => b.enabled)
    .some(b => time >= b.start && time < b.end);
};

const BreakTime = ({ breakData, onChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{breakData.name}</span>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={breakData.enabled}
            onChange={(e) => onChange({ ...breakData, enabled: e.target.checked })}
            className="rounded text-teal-500 focus:ring-teal-500"
          />
          <span className="text-sm text-gray-500">Enable</span>
        </label>
      </div>
      
      {breakData.enabled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Start Time</label>
            <input
              type="time"
              value={breakData.start}
              onChange={(e) => onChange({ ...breakData, start: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
                focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">End Time</label>
            <input
              type="time"
              value={breakData.end}
              onChange={(e) => onChange({ ...breakData, end: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
                focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
// Simplified Quick Schedule Builder
const QuickScheduleBuilder = ({ onApply }) => {
    const [template, setTemplate] = useState({
      workingHours: { start: '09:00', end: '17:00' },
      timePerPatient: '30',
      breaks: { ...DEFAULT_BREAKS },
      applyTo: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    });
  
    const generateSlots = (workingHours, timePerPatient, breaks) => {
      const slots = [];
      let currentTime = workingHours.start;
  
      while (currentTime < workingHours.end) {
        if (!isTimeInBreak(currentTime, breaks)) {
          const endTime = addMinutes(currentTime, parseInt(timePerPatient));
          if (!isTimeInBreak(endTime, breaks) && endTime <= workingHours.end) {
            slots.push({
              start: currentTime,
              end: endTime,
              duration: timePerPatient,
              capacity: '1'
            });
          }
        }
        currentTime = addMinutes(currentTime, parseInt(timePerPatient));
      }
  
      return slots;
    };
  
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Wand2 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Quick Schedule Builder</h3>
            <p className="text-sm text-gray-500">Quickly set up your consultation schedule</p>
          </div>
        </div>
  
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  value={template.workingHours.start}
                  onChange={(e) => setTemplate({
                    ...template,
                    workingHours: { ...template.workingHours, start: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <input
                  type="time"
                  value={template.workingHours.end}
                  onChange={(e) => setTemplate({
                    ...template,
                    workingHours: { ...template.workingHours, end: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time per Patient</label>
              <input
                type="number"
                value={template.timePerPatient}
                onChange={(e) => setTemplate({
                  ...template,
                  timePerPatient: e.target.value
                })}
                min="5"
                max="120"
                step="5"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
                  focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              <span className="text-sm text-gray-500 mt-1">minutes per consultation</span>
            </div>
          </div>
  
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Breaks</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(template.breaks).map(([key, breakData]) => (
                <BreakTime
                  key={key}
                  breakData={breakData}
                  onChange={(updatedBreak) => setTemplate({
                    ...template,
                    breaks: { ...template.breaks, [key]: updatedBreak }
                  })}
                />
              ))}
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply To Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => {
                    const newDays = new Set(template.applyTo);
                    if (newDays.has(day)) {
                      newDays.delete(day);
                    } else {
                      newDays.add(day);
                    }
                    setTemplate({ ...template, applyTo: newDays });
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all
                    ${template.applyTo.has(day)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
  
          <button
            onClick={() => {
              const slots = generateSlots(
                template.workingHours,
                template.timePerPatient,
                template.breaks
              );
              onApply({ ...template, slots });
            }}
            className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600
              transition-colors flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Generate Schedule
          </button>
        </div>
      </div>
    );
  };
  
  // Enhanced time slot component
  const EnhancedTimeSlot = ({ slot, index, onChange, onRemove }) => {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm group">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <input
            type="time"
            value={slot.start}
            onChange={(e) => onChange(index, { ...slot, start: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 
              focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          <input
            type="time"
            value={slot.end}
            onChange={(e) => onChange(index, { ...slot, end: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
              focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          <input
            type="number"
            value={slot.duration}
            onChange={(e) => onChange(index, { ...slot, duration: e.target.value })}
            min="5"
            max="120"
            placeholder="Minutes per patient"
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200
              focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg
            opacity-0 group-hover:opacity-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  };
const ScheduleReview = ({ schedules }) => {
    const activeDays = Object.entries(schedules)
      .filter(([_, schedule]) => schedule.enabled);
  
    const totalSlots = activeDays.reduce((sum, [_, schedule]) => 
      sum + schedule.slots.length, 0
    );
  
    return (
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Eye className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Schedule Review</h3>
              <p className="text-sm text-gray-500">Current schedule configuration</p>
            </div>
          </div>
  
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="font-medium text-gray-900">{activeDays.length} Days</p>
                    <p className="text-sm text-gray-500">Active consultation days</p>
                  </div>
                </div>
              </div>
  
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                  <p className="font-medium text-gray-900">{totalSlots} Slots</p>
                  <p className="text-sm text-gray-500">Total time slots</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {totalSlots * 1} Patients
                  </p>
                  <p className="text-sm text-gray-500">Maximum daily capacity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Daily Schedules</h4>
            <div className="space-y-4">
              {activeDays.map(([day, schedule]) => (
                <div key={day} className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">{day}</h5>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                      <div>Working Hours</div>
                      <div>Slots</div>
                      <div>Breaks</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        {schedule.slots[0]?.start} - {schedule.slots[schedule.slots.length - 1]?.end}
                      </div>
                      <div>{schedule.slots.length} time slots</div>
                      <div>
                        {Object.values(schedule.breaks || {})
                          .filter(b => b.enabled)
                          .map(b => b.name)
                          .join(', ') || 'No breaks'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleManager = ({ data, onChange, onValidationChange }) => {
    const [schedules, setSchedules] = useState(() => {
      const initialSchedules = {};
      DAYS.forEach(day => {
        initialSchedules[day] = {
          enabled: false,
          slots: [{ start: '09:00', end: '17:00', duration: '30' }],
          breaks: { ...DEFAULT_BREAKS }
        };
      });
      return initialSchedules;
    });
  
    const [showBuilder, setShowBuilder] = useState(false);
    const [message, setMessage] = useState(null);
    const validateAndPreparePayload = () => {
        const enabledDays = Object.values(schedules).filter(s => s.enabled).length;
        if (enabledDays === 0) {
          setMessage('Please enable at least one day for appointments');
          onValidationChange?.(false);
          return false;
        }
        
        let hasInvalidSlots = false;
        Object.values(schedules).forEach(schedule => {
          if (schedule.enabled) {
            schedule.slots.forEach(slot => {
              if (!slot.start || !slot.end || !slot.duration) {
                hasInvalidSlots = true;
              }
            });
          }
        });
    
        if (hasInvalidSlots) {
          setMessage('Please fill in all slot details for enabled days');
          onValidationChange?.(false);
          return false;
        }
    
        setMessage(null);
        const payload = {
            raw: schedules,
            payload: {
              defaultSettings: {
                timePerPatient: schedules[Object.keys(schedules)[0]]?.slots[0]?.duration || 30
              },
              days: {}
            }
          };
      
          Object.entries(schedules)
            .filter(([_, schedule]) => schedule.enabled)
            .forEach(([day, schedule]) => {
              payload.payload.days[day] = {
                enabled: true,
                workingHours: {
                  start: schedule.slots[0]?.start,
                  end: schedule.slots[schedule.slots.length - 1]?.end
                },
                slots: schedule.slots.map(slot => ({
                  start: slot.start,
                  end: slot.end,
                  duration: parseInt(slot.duration)
                })),
                breaks: Object.values(schedule.breaks || {})
                  .filter(breakData => breakData.enabled)
                  .map(breakData => ({
                    name: breakData.name,
                    start: breakData.start,
                    end: breakData.end
                  }))
              };
            });
      
          onChange?.(payload);
          onValidationChange?.(true);
          return true;
        };
        useEffect(() => {
            validateAndPreparePayload();
          }, [schedules]);
        
          // Update schedules when data prop changes
          useEffect(() => {
            if (data?.raw && Object.keys(data.raw).length > 0) {
              setSchedules(data.raw);
            }
          }, [data]);
        
          const handleScheduleChange = (day, updatedSchedule) => {
            const newSchedules = {
              ...schedules,
              [day]: updatedSchedule
            };
            setSchedules(newSchedules);
          };
        
          const handleTemplateApply = (template) => {
            const newSchedules = { ...schedules };
            template.applyTo.forEach(day => {
              newSchedules[day] = {
                enabled: true,
                slots: template.slots,
                breaks: template.breaks
              };
            });
            setSchedules(newSchedules);
            setShowBuilder(false);
          };
        
  const validateSchedules = () => {
    const enabledDays = Object.values(schedules).filter(s => s.enabled).length;
    if (enabledDays === 0) {
      setMessage('Please enable at least one day for appointments');
      return false;
    }
    
    let hasInvalidSlots = false;
    Object.values(schedules).forEach(schedule => {
      if (schedule.enabled) {
        schedule.slots.forEach(slot => {
          if (!slot.start || !slot.end || !slot.duration) {
            hasInvalidSlots = true;
          }
        });
      }
    });

    if (hasInvalidSlots) {
      setMessage('Please fill in all slot details for enabled days');
      return false;
    }

    setMessage(null);
    return true;
  };

  const handleSubmit = () => {
    if (validateSchedules()) {
      const payload = {
        schedule: {
          defaultSettings: {
            timePerPatient: schedules[Object.keys(schedules)[0]]?.slots[0]?.duration || 30
          },
          days: {}
        }
      };

      Object.entries(schedules)
        .filter(([_, schedule]) => schedule.enabled)
        .forEach(([day, schedule]) => {
          payload.schedule.days[day] = {
            enabled: true,
            workingHours: {
              start: schedule.slots[0]?.start,
              end: schedule.slots[schedule.slots.length - 1]?.end
            },
            slots: schedule.slots.map(slot => ({
              start: slot.start,
              end: slot.end,
              duration: parseInt(slot.duration)
            })),
            breaks: Object.values(schedule.breaks || {})
              .filter(breakData => breakData.enabled)
              .map(breakData => ({
                name: breakData.name,
                start: breakData.start,
                end: breakData.end
              }))
          };
        });

      onComplete(payload);
    }
  };

  // Enhanced day schedule component
  const EnhancedDaySchedule = ({ day, schedule, onChange }) => {
    const [isEnabled, setIsEnabled] = useState(schedule.enabled);
  
    const handleToggle = () => {
      setIsEnabled(!isEnabled);
      onChange({
        ...schedule,
        enabled: !isEnabled
      });
    };
  
    const addTimeSlot = () => {
      const newSlots = [
        ...schedule.slots,
        { start: '', end: '', duration: '30' }
      ];
      onChange({ ...schedule, slots: newSlots });
    };
  
    const updateTimeSlot = (index, updatedSlot) => {
      const newSlots = [...schedule.slots];
      newSlots[index] = updatedSlot;
      onChange({ ...schedule, slots: newSlots });
    };
  
    const removeTimeSlot = (index) => {
      const newSlots = schedule.slots.filter((_, i) => i !== index);
      onChange({ ...schedule, slots: newSlots });
    };
  
    const updateBreak = (key, breakData) => {
      const newBreaks = {
        ...schedule.breaks,
        [key]: breakData
      };
      onChange({ ...schedule, breaks: newBreaks });
    };
  
    return (
      <div className={`p-6 rounded-xl border-2 transition-all
        ${isEnabled ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-teal-100' : 'bg-gray-100'}`}>
              <Calendar className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{day}</h3>
              <p className="text-sm text-gray-500">
                {isEnabled ? 'Available for appointments' : 'Not available'}
              </p>
            </div>
          </div>
  
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer
              rounded-full border-2 border-transparent transition-colors
              ${isEnabled ? 'bg-teal-500' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full
              bg-white shadow transition-transform
              ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
  
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Time Slots
                </h4>
                <button
                  onClick={addTimeSlot}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>
  
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 px-4">
                <div>Start Time</div>
                <div>End Time</div>
                <div>Duration (min)</div>
              </div>
  
              <div className="space-y-3">
                {schedule.slots.map((slot, index) => (
                  <EnhancedTimeSlot
                    key={index}
                    slot={slot}
                    index={index}
                    onChange={updateTimeSlot}
                    onRemove={removeTimeSlot}
                  />
                ))}
              </div>
            </div>
  
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-gray-400" />
                Breaks
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(schedule.breaks || {}).map(([key, breakData]) => (
                  <BreakTime
                    key={key}
                    breakData={breakData}
                    onChange={(updatedBreak) => updateBreak(key, updatedBreak)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-2 px-4 py-2 text-teal-600 
            hover:bg-teal-50 rounded-lg transition-colors"
        >
          <Wand2 className="w-5 h-5" />
          {showBuilder ? 'Hide' : 'Show'} Quick Builder
        </button>
      </div>

      {showBuilder && (
        <QuickScheduleBuilder onApply={handleTemplateApply} />
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Schedule Management</h3>
            <p className="text-sm text-gray-500">Set your weekly availability</p>
          </div>
        </div>

        <div className="space-y-6">
          {DAYS.map(day => (
            <EnhancedDaySchedule
              key={day}
              day={day}
              schedule={schedules[day]}
              onChange={(schedule) => handleScheduleChange(day, schedule)}
            />
          ))}
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-600 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <ScheduleReview schedules={schedules} />
    </div>
  );
};

export default ScheduleManager;