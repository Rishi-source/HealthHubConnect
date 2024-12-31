import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, Plus, X, Calendar, AlertCircle, Clock, User, 
  RefreshCcw, ThumbsUp
} from 'lucide-react';

const InputField = memo(({ 
  icon: Icon, 
  label, 
  value = '', 
  onChange, 
  error, 
  required = false,
  placeholder,
  touched,
  onFocus,
  onBlur,
  isFocused
}) => (
  <div className="group min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`
          w-full px-4 py-3 ${Icon ? 'pl-12' : ''}
          rounded-xl border-2
          transition-all duration-300 focus:outline-none
          ${error && touched
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
            : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
          }
          ${isFocused ? 'ring-4 ring-teal-500/20' : ''}
          group-hover:border-gray-300
        `}
        placeholder={placeholder}
      />
      {Icon && (
        <Icon className={`
          absolute left-4 top-1/2 transform -translate-y-1/2
          transition-colors duration-300
          ${error && touched 
            ? 'text-red-400' 
            : 'text-gray-400 group-hover:text-teal-500'
          }
        `} />
      )}
      
      {error && touched && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-500 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  </div>
));

const DateInput = memo(({ 
  label, 
  value = '', 
  onChange,
  min,
  max,
  error,
  required = false,
  touched,
  onFocus,
  onBlur,
  isFocused
}) => (
  <div className="group min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`
          w-full px-4 py-3 pl-12 rounded-xl border-2
          transition-all duration-300 focus:outline-none
          ${error && touched
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
          }
          ${isFocused ? 'ring-4 ring-teal-500/20' : ''}
          group-hover:border-gray-300
        `}
      />
      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 
        text-gray-400 group-hover:text-teal-500 transition-colors duration-300" 
      />
      
      {error && touched && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-500 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  </div>
));

const SelectionGroup = memo(({ 
  label, 
  options, 
  selected = '', 
  onChange,
  error,
  required = false,
  touched
}) => (
  <div className="space-y-2 min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <motion.button
          key={option}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(option)}
          className={`
            px-4 py-2 rounded-xl border-2 transition-all duration-300
            ${selected === option 
              ? 'border-teal-500 bg-teal-50 text-teal-600'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          {option}
        </motion.button>
      ))}
    </div>
    
    {error && touched && (
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mt-2 text-red-500 text-sm"
      >
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </motion.div>
    )}
  </div>
));

const MedicationCard = memo(({ 
  medication, 
  index, 
  type = 'current',
  onRemove,
  onChange,
  onFocus,
  onBlur,
  errors,
  touched,
  focusedField,
  FREQUENCIES,
  COMMON_SIDE_EFFECTS,
  handleSideEffectToggle
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layout
    className="bg-gray-50 rounded-2xl p-6 space-y-6 relative group"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onRemove(index, type)}
      className="absolute -top-2 -right-2 bg-red-100 p-2 rounded-full text-red-500
        opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
        transition-all duration-300 hover:bg-red-200"
    >
      <X className="w-4 h-4" />
    </motion.button>

    <div className="flex items-center gap-2 text-gray-600 mb-4">
      <Pill className="w-5 h-5 text-teal-500" />
      <span className="font-medium">
        {type === 'current' ? 'Current' : 'Past'} Medication {index + 1}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Medication Name"
        value={medication?.name}
        onChange={(value) => onChange(index, 'name', value, type)}
        error={errors[`${type === 'past' ? 'pastMed' : 'med'}${index}_name`]}
        touched={touched[`${type === 'past' ? 'pastMed' : 'med'}${index}_name`]}
        onFocus={() => onFocus(`${type}_${index}_name`)}
        onBlur={() => onBlur(`${type}_${index}_name`)}
        isFocused={focusedField === `${type}_${index}_name`}
        required
      />

      <InputField
        label="Dosage"
        value={medication?.dosage}
        onChange={(value) => onChange(index, 'dosage', value, type)}
        error={errors[`${type === 'past' ? 'pastMed' : 'med'}${index}_dosage`]}
        touched={touched[`${type === 'past' ? 'pastMed' : 'med'}${index}_dosage`]}
        onFocus={() => onFocus(`${type}_${index}_dosage`)}
        onBlur={() => onBlur(`${type}_${index}_dosage`)}
        isFocused={focusedField === `${type}_${index}_dosage`}
        required={type === 'current'}
        placeholder="e.g., 50mg"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DateInput
        label="Start Date"
        value={medication?.startDate}
        onChange={(value) => onChange(index, 'startDate', value, type)}
        error={errors[`${type === 'past' ? 'pastMed' : 'med'}${index}_startDate`]}
        touched={touched[`${type === 'past' ? 'pastMed' : 'med'}${index}_startDate`]}
        onFocus={() => onFocus(`${type}_${index}_startDate`)}
        onBlur={() => onBlur(`${type}_${index}_startDate`)}
        isFocused={focusedField === `${type}_${index}_startDate`}
        max={new Date().toISOString().split('T')[0]}
        required
      />

      {type === 'past' && (
        <DateInput
          label="End Date"
          value={medication?.endDate}
          onChange={(value) => onChange(index, 'endDate', value, type)}
          error={errors[`pastMed${index}_endDate`]}
          touched={touched[`pastMed${index}_endDate`]}
          onFocus={() => onFocus(`${type}_${index}_endDate`)}
          onBlur={() => onBlur(`${type}_${index}_endDate`)}
          isFocused={focusedField === `${type}_${index}_endDate`}
          min={medication?.startDate}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      )}
    </div>

    {type === 'current' && (
      <>
        <SelectionGroup
          label="Frequency"
          options={FREQUENCIES}
          selected={medication?.frequency}
          onChange={(value) => onChange(index, 'frequency', value)}
          error={errors[`med${index}_frequency`]}
          touched={touched[`med${index}_frequency`]}
          required
        />

        <InputField
          icon={User}
          label="Prescribed By"
          value={medication?.prescribedBy}
          onChange={(value) => onChange(index, 'prescribedBy', value)}
          onFocus={() => onFocus(`${type}_${index}_prescribedBy`)}
          onBlur={() => onBlur(`${type}_${index}_prescribedBy`)}
          isFocused={focusedField === `${type}_${index}_prescribedBy`}
          placeholder="Doctor's name"
        />

        <InputField
          label="Purpose"
          value={medication?.purpose}
          onChange={(value) => onChange(index, 'purpose', value)}
          onFocus={() => onFocus(`${type}_${index}_purpose`)}
          onBlur={() => onBlur(`${type}_${index}_purpose`)}
          isFocused={focusedField === `${type}_${index}_purpose`}
          placeholder="What is this medication for?"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Side Effects
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SIDE_EFFECTS.map((effect) => (
              <motion.button
                key={effect}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSideEffectToggle(index, effect)}
                className={`
                  px-4 py-2 rounded-xl border-2 transition-all duration-300
                  ${medication?.sideEffects?.includes(effect)
                    ? 'border-teal-500 bg-teal-50 text-teal-600'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {effect}
              </motion.button>
            ))}
          </div>
        </div>
      </>
    )}

    {type === 'past' && (
      <InputField
        label="Reason for Stopping"
        value={medication?.reason}
        onChange={(value) => onChange(index, 'reason', value, type)}
        onFocus={() => onFocus(`${type}_${index}_reason`)}
        onBlur={() => onBlur(`${type}_${index}_reason`)}
        isFocused={focusedField === `${type}_${index}_reason`}
        placeholder="Why did you stop taking this medication?"
      />
    )}
  </motion.div>
));

const MedicationsStep = memo(({ 
  data = { medications: { current: [], past: [] } }, 
  onChange, 
  onValidationChange 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPastMeds, setShowPastMeds] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const FREQUENCIES = [
    'Once daily', 'Twice daily', 'Three times daily', 
    'Every 12 hours', 'Every 8 hours', 'As needed'
  ];

  const COMMON_SIDE_EFFECTS = [
    'Nausea', 'Drowsiness', 'Dizziness', 'Headache',
    'Fatigue', 'Dry mouth', 'Insomnia', 'Appetite changes'
  ];

  const getDefaultMedication = (type) => ({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    prescribedBy: '',
    purpose: '',
    sideEffects: [],
    ...(type === 'past' ? { endDate: '', reason: '' } : {})
  });

  const validateMedication = (med, index, type) => {
    const newErrors = {};
    
    if (!med.name?.trim()) {
      newErrors[`${type}${index}_name`] = 'Medication name is required';
    }
    if (!med.startDate) {
      newErrors[`${type}${index}_startDate`] = 'Start date is required';
    }

    if (type === 'med') {
      if (!med.dosage?.trim()) {
        newErrors[`${type}${index}_dosage`] = 'Dosage is required';
      }
      if (!med.frequency) {
        newErrors[`${type}${index}_frequency`] = 'Frequency is required';
      }
    }

    if (type === 'pastMed') {
      if (!med.endDate) {
        newErrors[`${type}${index}_endDate`] = 'End date is required';
      } else if (med.startDate && med.endDate && new Date(med.endDate) < new Date(med.startDate)) {
        newErrors[`${type}${index}_endDate`] = 'End date must be after start date';
      }
    }

    return newErrors;
  };

  const validateAllMedications = (medications = {}) => {
    let allErrors = {};
    
    medications.current?.forEach((med, index) => {
      const errors = validateMedication(med, index, 'med');
      allErrors = { ...allErrors, ...errors };
    });
    
    medications.past?.forEach((med, index) => {
      const errors = validateMedication(med, index, 'pastMed');
      allErrors = { ...allErrors, ...errors };
    });

    setErrors(allErrors);
    onValidationChange(Object.keys(allErrors).length === 0);
    return allErrors;
  };

  const handleAddMedication = (type = 'current') => {
    const medications = {
      current: [],
      past: [],
      ...(data.medications || {}),
    };

    medications[type] = [...(medications[type] || []), getDefaultMedication(type)];
    onChange({ ...data, medications });
  };

  const handleRemoveMedication = (index, type = 'current') => {
    const medications = {
      ...data.medications,
      [type]: [...(data.medications[type] || [])]
    };
    medications[type].splice(index, 1);
    onChange({ ...data, medications });
    validateAllMedications(medications);
  };

  const handleMedicationChange = (index, field, value, type = 'current') => {
    const medications = {
      ...data.medications,
      [type]: [...(data.medications[type] || [])]
    };

    if (!medications[type][index]) {
      medications[type][index] = getDefaultMedication(type);
    }

    medications[type][index] = { 
      ...medications[type][index], 
      [field]: value 
    };
    
    onChange({ ...data, medications });
    
    setTouched(prev => ({
      ...prev,
      [`${type === 'past' ? 'pastMed' : 'med'}${index}_${field}`]: true
    }));
    
    validateAllMedications(medications);
  };

  const handleSideEffectToggle = (index, effect) => {
    const medications = {
      ...data.medications,
      current: [...(data.medications.current || [])]
    };

    const currentEffects = medications.current[index].sideEffects || [];
    medications.current[index] = {
      ...medications.current[index],
      sideEffects: currentEffects.includes(effect)
        ? currentEffects.filter(e => e !== effect)
        : [...currentEffects, effect]
    };
    
    onChange({ ...data, medications });
  };

  const handleFocus = (fieldId) => {
    setFocusedField(fieldId);
  };

  const handleBlur = (fieldId) => {
    setFocusedField(null);
    setTouched(prev => ({
      ...prev,
      [fieldId]: true
    }));
  };

  useEffect(() => {
    validateAllMedications(data.medications);
  }, []);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Medications</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPastMeds(!showPastMeds)}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700
            transition-colors duration-300 group focus:outline-none"
        >
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          {showPastMeds ? 'Show Current Medications' : 'Show Past Medications'}
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {showPastMeds ? (
          <motion.div
            key="past"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {(!data.medications?.past || data.medications.past.length === 0) ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddMedication('past')}
                className="w-full p-6 border-2 border-dashed border-gray-200 rounded-2xl
                  text-gray-500 hover:text-teal-500 hover:border-teal-500
                  transition-all duration-300 flex items-center justify-center gap-2
                  group hover:bg-teal-50/50 focus:outline-none"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Add Past Medication
              </motion.button>
            ) : (
              <div className="space-y-4">
                {data.medications.past.map((medication, index) => (
                  <MedicationCard 
                    key={`past_${index}`} 
                    medication={medication} 
                    index={index} 
                    type="past"
                    onRemove={handleRemoveMedication}
                    onChange={handleMedicationChange}
                    errors={errors}
                    touched={touched}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    FREQUENCIES={FREQUENCIES}
                    COMMON_SIDE_EFFECTS={COMMON_SIDE_EFFECTS}
                  />
                ))}
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddMedication('past')}
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-500 
                    hover:bg-teal-50 hover:text-teal-500 transition-all duration-300 
                    flex items-center justify-center gap-2 group focus:outline-none"
                >
                  <Plus className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                  Add Another Past Medication
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="current"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {(!data.medications?.current || data.medications.current.length === 0) ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddMedication('current')}
                className="w-full p-6 border-2 border-dashed border-gray-200 rounded-2xl
                  text-gray-500 hover:text-teal-500 hover:border-teal-500
                  transition-all duration-300 flex items-center justify-center gap-2
                  group hover:bg-teal-50/50 focus:outline-none"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Add Current Medication
              </motion.button>
            ) : (
              <div className="space-y-4">
                {data.medications.current.map((medication, index) => (
                  <MedicationCard 
                    key={`current_${index}`} 
                    medication={medication} 
                    index={index} 
                    type="current"
                    onRemove={handleRemoveMedication}
                    onChange={handleMedicationChange}
                    errors={errors}
                    touched={touched}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    FREQUENCIES={FREQUENCIES}
                    COMMON_SIDE_EFFECTS={COMMON_SIDE_EFFECTS}
                    handleSideEffectToggle={handleSideEffectToggle}
                  />
                ))}
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddMedication('current')}
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-500 
                    hover:bg-teal-50 hover:text-teal-500 transition-all duration-300 
                    flex items-center justify-center gap-2 group focus:outline-none"
                >
                  <Plus className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                  Add Another Current Medication
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl"
      >
        <ThumbsUp className="w-4 h-4 text-teal-500" />
        <span>Keep your medication information up to date for better healthcare</span>
      </motion.div>

      <style jsx global>{`
        @media (max-width: 640px) {
          input[type="text"],
          input[type="date"] {
            font-size: 16px;
            min-height: 44px;
          }
          
          button {
            min-height: 44px;
          }
          
          .group label {
            font-size: 14px;
          }
        }
      `}</style>
    </motion.div>
  );
});

export default MedicationsStep;