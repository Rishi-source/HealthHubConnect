import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, X, Calendar, AlertCircle } from 'lucide-react';

const InputField = memo(({ 
  label, 
  value = '', 
  onChange, 
  error, 
  touched,
  required = false,
  placeholder,
  onFocus,
  onBlur,
  isFocused,
  type = "text"
}) => (
  <div className="group min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`
          w-full px-4 py-3 rounded-xl border-2
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
      
      <div className="h-6 mt-1">
        <AnimatePresence>
          {error && touched && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-red-500 text-sm absolute w-full"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
));

const DateInput = memo(({ 
  label, 
  value = '', 
  onChange,
  error,
  touched,
  onFocus,
  onBlur,
  isFocused
}) => (
  <div className="group min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        max={new Date().toISOString().split('T')[0]}
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
    </div>
  </div>
));

const AllergyCard = memo(({ 
  allergy, 
  index, 
  onRemove,
  onChange,
  onFocus,
  onBlur,
  errors,
  touched,
  focusedField,
  SEVERITY_LEVELS,
  COMMON_REACTIONS,
  handleReactionToggle
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
      onClick={() => onRemove(index)}
      className="absolute -top-2 -right-2 bg-red-100 p-2 rounded-full text-red-500
        opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
        transition-all duration-300 hover:bg-red-200"
    >
      <X className="w-4 h-4" />
    </motion.button>

    <div className="flex items-center gap-2 text-gray-600 mb-4">
      <AlertTriangle className="w-5 h-5 text-amber-500" />
      <span className="font-medium">Allergy {index + 1}</span>
    </div>

    <InputField
      label="Allergen"
      value={allergy.allergen}
      onChange={(value) => onChange(index, 'allergen', value)}
      error={errors[`allergy${index}_allergen`]}
      touched={touched[`allergy${index}_allergen`]}
      isFocused={focusedField === `${index}_allergen`}
      onFocus={() => onFocus(`${index}_allergen`)}
      onBlur={() => onBlur(`${index}_allergen`)}
      required
      placeholder="Enter allergen name"
    />

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Severity Level <span className="text-red-400">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {SEVERITY_LEVELS.map((level) => (
          <motion.button
            key={level}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(index, 'severity', level)}
            className={`
              px-4 py-2 rounded-xl border-2 transition-all duration-300
              ${allergy.severity === level 
                ? 'border-teal-500 bg-teal-50 text-teal-600'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {level}
          </motion.button>
        ))}
      </div>
      {errors[`allergy${index}_severity`] && touched[`allergy${index}_severity`] && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-500 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{errors[`allergy${index}_severity`]}</span>
        </motion.div>
      )}
    </div>

    <DateInput
      label="Date of Diagnosis"
      value={allergy.diagnosedDate}
      onChange={(value) => onChange(index, 'diagnosedDate', value)}
      onFocus={() => onFocus(`${index}_diagnosedDate`)}
      onBlur={() => onBlur(`${index}_diagnosedDate`)}
      isFocused={focusedField === `${index}_diagnosedDate`}
    />

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Reactions <span className="text-red-400">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {COMMON_REACTIONS.map((reaction) => (
          <motion.button
            key={reaction}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReactionToggle(index, reaction)}
            className={`
              px-4 py-2 rounded-xl border-2 transition-all duration-300
              ${allergy.reactions?.includes(reaction)
                ? 'border-teal-500 bg-teal-50 text-teal-600'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {reaction}
          </motion.button>
        ))}
      </div>
      {errors[`allergy${index}_reactions`] && touched[`allergy${index}_reactions`] && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-500 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{errors[`allergy${index}_reactions`]}</span>
        </motion.div>
      )}
    </div>
  </motion.div>
));

const AllergiesStep = ({ 
  data = { allergies: [] }, 
  onChange, 
  onValidationChange 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const SEVERITY_LEVELS = ['Mild', 'Moderate', 'Severe', 'Life-Threatening'];
  const COMMON_REACTIONS = [
    'Rash', 'Hives', 'Swelling', 'Difficulty Breathing', 
    'Nausea', 'Anaphylaxis', 'Itching', 'Dizziness'
  ];

  const validateAllergy = (allergy, index) => {
    const newErrors = {};

    if (!allergy.allergen?.trim()) {
      newErrors[`allergy${index}_allergen`] = 'Allergen name is required';
    }
    
    if (!allergy.severity) {
      newErrors[`allergy${index}_severity`] = 'Severity level is required';
    }
    
    if (!allergy.reactions?.length) {
      newErrors[`allergy${index}_reactions`] = 'Select at least one reaction';
    }

    return newErrors;
  };

  const handleAddAllergy = () => {
    const allergies = [...(data.allergies || [])];
    allergies.push({
      allergen: '',
      severity: '',
      diagnosedDate: '',
      reactions: []
    });
    
    const updatedData = { ...data, allergies };
    onChange(updatedData);
    validateAllergies(allergies);
  };

  const handleRemoveAllergy = (index) => {
    const allergies = data.allergies.filter((_, i) => i !== index);
    const updatedData = { ...data, allergies };
    onChange(updatedData);
    validateAllergies(allergies);
  };

  const handleAllergyChange = (index, field, value) => {
    const allergies = [...(data.allergies || [])];
    if (!allergies[index]) {
      allergies[index] = { 
        allergen: '', 
        severity: '', 
        diagnosedDate: '', 
        reactions: [] 
      };
    }
    
    allergies[index] = { 
      ...allergies[index], 
      [field]: value 
    };
    
    const updatedData = { ...data, allergies };
    onChange(updatedData);
    
    setTouched(prev => ({
      ...prev,
      [`allergy${index}_${field}`]: true
    }));
    
    validateAllergies(allergies);
  };

  const handleReactionToggle = (index, reaction) => {
    const allergies = [...(data.allergies || [])];
    if (!allergies[index]) {
      allergies[index] = { 
        allergen: '', 
        severity: '', 
        diagnosedDate: '', 
        reactions: [] 
      };
    }
    
    const currentReactions = allergies[index].reactions || [];
    allergies[index] = {
      ...allergies[index],
      reactions: currentReactions.includes(reaction)
        ? currentReactions.filter(r => r !== reaction)
        : [...currentReactions, reaction]
    };
    
    const updatedData = { ...data, allergies };
    onChange(updatedData);
    
    setTouched(prev => ({
      ...prev,
      [`allergy${index}_reactions`]: true
    }));
    
    validateAllergies(allergies);
  };

  const validateAllergies = (allergies = []) => {
    let newErrors = {};
    
    allergies.forEach((allergy, index) => {
      newErrors = {
        ...newErrors,
        ...validateAllergy(allergy, index)
      };
    });

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  };

  const handleFocus = (fieldId) => {
    setFocusedField(fieldId);
  };

  const handleBlur = (fieldId) => {
    setFocusedField(null);
    setTouched(prev => ({
      ...prev,
      [`allergy${fieldId}`]: true
    }));
  };

  useEffect(() => {
    validateAllergies(data.allergies);
  }, []);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="popLayout">
        {data.allergies?.map((allergy, index) => (
          <AllergyCard
            key={index}
            allergy={allergy}
            index={index}
            onRemove={handleRemoveAllergy}
            onChange={handleAllergyChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            focusedField={focusedField}
            SEVERITY_LEVELS={SEVERITY_LEVELS}
            COMMON_REACTIONS={COMMON_REACTIONS}
            handleReactionToggle={handleReactionToggle}
          />
        ))}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddAllergy}
        className="w-full p-6 border-2 border-dashed border-gray-200 rounded-2xl
          text-gray-500 hover:text-teal-500 hover:border-teal-500
          transition-all duration-300 flex items-center justify-center gap-2
          group hover:bg-teal-50/50 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
      >
        <Plus className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
        {data.allergies?.length ? 'Add Another Allergy' : 'Add Allergy'}
      </motion.button>

      {data.allergies?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-500 text-sm animate-fadeIn bg-gray-50 p-4 rounded-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="font-medium">No Allergies Added</span>
          </div>
          <p>Add any known allergies to maintain a complete health profile.</p>
        </motion.div>
      )}

      {/* Mobile responsiveness styles */}
      <style jsx global>{`
        @media (max-width: 640px) {
          input[type="date"] {
            min-height: 44px;
          }
          
          button {
            min-height: 44px;
            font-size: 16px;
          }
          
          .group label {
            font-size: 14px;
          }
          
          .group input {
            font-size: 16px;
            padding: 12px 16px;
            padding-left: 40px;
          }
          
          .group .reaction-buttons {
            gap: 8px;
          }
          
          .group .reaction-button {
            width: calc(50% - 4px);
            padding: 10px;
            font-size: 14px;
          }
        }
        
        /* Custom animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        /* Focus and hover improvements */
        input:focus-visible,
        button:focus-visible {
          outline: none;
          ring: 2px;
          ring-offset: 2px;
          ring-teal-500;
        }
        
        /* Better touch targets on mobile */
        @media (max-width: 640px) {
          input, button, select {
            min-height: 44px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default memo(AllergiesStep);