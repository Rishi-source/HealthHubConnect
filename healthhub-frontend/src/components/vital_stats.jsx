import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Thermometer, Droplets, Clock, AlertCircle } from 'lucide-react';

const VitalInput = memo(({
  icon: Icon,
  label,
  type,
  field,
  value,
  unit,
  error,
  min,
  max,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  isFocused,
  touched
}) => (
  <div className="group animate-fadeIn min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(type, field, e.target.value)}
        onFocus={() => onFocus(`${type}_${field}`)}
        onBlur={() => onBlur(`${type}_${field}`)}
        min={min}
        max={max}
        className={`
          w-full px-4 py-3 pl-12 rounded-xl border-2
          transition-colors duration-300 focus:outline-none
          ${error && touched
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
          }
          ${isFocused ? 'ring-4 ring-teal-500/20' : ''}
          group-hover:border-gray-300
        `}
        placeholder={placeholder}
      />
      <Icon className={`
        absolute left-4 top-1/3 transform -translate-y-1/2
        transition-colors duration-300
        ${error && touched
          ? 'text-red-400'
          : isFocused
            ? 'text-teal-500'
            : 'text-gray-400 group-hover:text-teal-500'
        }
      `} />
      {unit && (
        <span className="absolute right-10 top-1/3 transform -translate-y-1/2 text-gray-400 font-medium">
          {unit}
        </span>
      )}

      <div className="h-6 mt-1">
        <AnimatePresence>
          {error && touched && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-red-500 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
));

const VitalStatsStep = ({
  data = {
    vitalSigns: {
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      oxygenSaturation: []
    }
  },
  onChange,
  onValidationChange
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const validateReading = (value, min, max, field) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `Please enter a valid number for ${field}`;
    }
    if (num < min || num > max) {
      return `${field} should be between ${min} and ${max}`;
    }
    return null;
  };

  const handleVitalChange = (type, field, value) => {
    const newData = {
      ...data,
      vitalSigns: {
        ...(data.vitalSigns || {}),
        [type]: [
          {
            ...(data.vitalSigns?.[type]?.[0] || {}),
            [field]: value,
            timestamp: new Date().toISOString()
          }
        ]
      }
    };

    const newErrors = { ...errors };
    let error = null;

    switch (type) {
      case 'bloodPressure':
        if (field === 'systolic') {
          error = validateReading(value, 70, 190, 'Systolic pressure');
        } else if (field === 'diastolic') {
          error = validateReading(value, 40, 100, 'Diastolic pressure');
        }
        break;
      case 'heartRate':
        if (field === 'beatsPerMinute') {
          error = validateReading(value, 40, 200, 'Heart rate');
        }
        break;
      case 'temperature':
        if (field === 'value') {
          error = validateReading(value, 35, 42, 'Temperature');
        }
        break;
      case 'oxygenSaturation':
        if (field === 'percentage') {
          error = validateReading(value, 80, 100, 'Oxygen saturation');
        }
        break;
    }

    if (error) {
      newErrors[`${type}_${field}`] = error;
    } else {
      delete newErrors[`${type}_${field}`];
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
    onChange(newData);

    setTouched(prev => ({
      ...prev,
      [`${type}_${field}`]: true
    }));
  };

  const handleFocus = (fieldId) => {
    setFocusedField(fieldId);
  };

  const handleBlur = (fieldId) => {
    setFocusedField(null);
    const [type, field] = fieldId.split('_');
    const value = data.vitalSigns?.[type]?.[0]?.[field];

    setTouched(prev => ({
      ...prev,
      [fieldId]: true
    }));

    const error = validateReading(
      value,
      field === 'systolic' ? 70 : field === 'diastolic' ? 40 :
        field === 'beatsPerMinute' ? 40 : field === 'value' ? 35 : 80,
      field === 'systolic' ? 190 : field === 'diastolic' ? 100 :
        field === 'beatsPerMinute' ? 200 : field === 'value' ? 42 : 100,
      `${type} ${field}`
    );

    if (error) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: error
      }));
    }
  };

  const currentVitals = {
    bloodPressure: data.vitalSigns?.bloodPressure?.[0] || {},
    heartRate: data.vitalSigns?.heartRate?.[0] || {},
    temperature: data.vitalSigns?.temperature?.[0] || {},
    oxygenSaturation: data.vitalSigns?.oxygenSaturation?.[0] || {},
  };

  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error);
    onValidationChange(!hasErrors);
  }, []);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-4">
          <VitalInput
            icon={Activity}
            label="Systolic Blood Pressure"
            type="bloodPressure"
            field="systolic"
            value={currentVitals.bloodPressure.systolic}
            unit="mmHg"
            error={errors.bloodPressure_systolic}
            touched={touched.bloodPressure_systolic}
            min={70}
            max={190}
            placeholder="Enter systolic pressure"
            onChange={handleVitalChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            isFocused={focusedField === 'bloodPressure_systolic'}
          />
          <VitalInput
            icon={Activity}
            label="Diastolic Blood Pressure"
            type="bloodPressure"
            field="diastolic"
            value={currentVitals.bloodPressure.diastolic}
            unit="mmHg"
            error={errors.bloodPressure_diastolic}
            touched={touched.bloodPressure_diastolic}
            min={40}
            max={100}
            placeholder="Enter diastolic pressure"
            onChange={handleVitalChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            isFocused={focusedField === 'bloodPressure_diastolic'}
          />
        </div>

        <VitalInput
          icon={Heart}
          label="Heart Rate"
          type="heartRate"
          field="beatsPerMinute"
          value={currentVitals.heartRate.beatsPerMinute}
          unit="bpm"
          error={errors.heartRate_beatsPerMinute}
          touched={touched.heartRate_beatsPerMinute}
          min={40}
          max={200}
          placeholder="Enter heart rate"
          onChange={handleVitalChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          isFocused={focusedField === 'heartRate_beatsPerMinute'}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <VitalInput
          icon={Thermometer}
          label="Temperature"
          type="temperature"
          field="value"
          value={currentVitals.temperature.value}
          unit="°C"
          error={errors.temperature_value}
          touched={touched.temperature_value}
          min={35}
          max={42}
          placeholder="Enter temperature"
          onChange={handleVitalChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          isFocused={focusedField === 'temperature_value'}
        />

        <VitalInput
          icon={Droplets}
          label="Oxygen Saturation"
          type="oxygenSaturation"
          field="percentage"
          value={currentVitals.oxygenSaturation.percentage}
          unit="%"
          error={errors.oxygenSaturation_percentage}
          touched={touched.oxygenSaturation_percentage}
          min={80}
          max={100}
          placeholder="Enter oxygen saturation"
          onChange={handleVitalChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          isFocused={focusedField === 'oxygenSaturation_percentage'}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl"
      >
        <Clock className="w-4 h-4" />
        <span>All measurements are recorded with current timestamp</span>
      </motion.div>
    </motion.div>
  );
};

export default memo(VitalStatsStep);