import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Activity, Ruler, Weight, AlertCircle } from 'lucide-react';

const InputField = memo(({ 
    icon: Icon, 
    label, 
    name, 
    type = "text", 
    value = '', 
    onChange,
    onFocus,
    onBlur,
    error,
    touched,
    isFocused,
    placeholder,
    ...props 
}) => (
    <div className="group min-h-[90px]">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onFocus={() => onFocus(name)}
          onBlur={() => onBlur(name)}
          className={`
            w-full px-4 py-3 pl-12 rounded-xl border-2
            transition-colors duration-300
            ${error && touched
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
            }
            ${isFocused ? 'ring-4 ring-teal-500/20' : ''}
            group-hover:border-gray-300
          `}
          placeholder={placeholder}
          {...props}
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
        
        <div className="h-6 mt-1">
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
        </div>
      </div>
    </div>
));

const SelectButton = memo(({ options, name, value = '', onChange, error, touched }) => (
    <div className="min-h-[90px]">
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <motion.button
            key={option}
            type="button"
            onClick={() => onChange(name, option)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-4 py-2 rounded-xl border-2 transition-colors duration-300
              ${value === option 
                ? 'border-teal-500 bg-teal-50 text-teal-600'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${error && touched ? 'border-red-300 bg-red-50 text-red-600' : ''}
            `}
          >
            {option}
          </motion.button>
        ))}
      </div>
      
      <div className="h-6 mt-1">
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
      </div>
    </div>
));

const BasicInfoStep = ({ 
    data = {
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        height: '',
        weight: ''
    }, 
    onChange = () => {}, 
    onValidationChange = () => {} 
}) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [focusedField, setFocusedField] = useState(null);
    const [validationMessage, setValidationMessage] = useState(null);

    const validateField = (name, value) => {
        switch (name) {
            case 'dateOfBirth':
                if (!value) return 'Date of birth is required';
                const date = new Date(value);
                const age = new Date().getFullYear() - date.getFullYear();
                if (age < 0 || age > 120) return 'Invalid date';
                return null;
            case 'height':
                if (!value) return 'Height is required';
                const height = parseFloat(value);
                if (isNaN(height) || height < 30 || height > 250) return 'Please enter a valid height';
                return null;
            case 'weight':
                if (!value) return 'Weight is required';
                const weight = parseFloat(value);
                if (isNaN(weight) || weight < 20 || weight > 300) return 'Please enter a valid weight';
                return null;
            case 'gender':
                return !value ? 'Please select a gender' : null;
            case 'bloodType':
                return !value ? 'Please select blood type' : null;
            default:
                return null;
        }
    };

    const handleChange = (name, value) => {
        const newData = { ...data, [name]: value };
        const error = validateField(name, value);
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        onChange(newData);
        validateForm(newData);
    };

    const handleFocus = (name) => {
        setFocusedField(name);
    };

    const handleBlur = (name) => {
        setFocusedField(null);
        const error = validateField(name, data[name]);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = (formData) => {
        const newErrors = {};
        let hasErrors = false;
        
        // Check each required field
        ['dateOfBirth', 'gender', 'bloodType', 'height', 'weight'].forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        setValidationMessage(hasErrors ? 'Please fill in all required fields marked with an asterisk (*)' : null);
        onValidationChange?.(!hasErrors);
    };

    // Run initial validation
    useEffect(() => {
        validateForm(data);
    }, []);

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                <InputField
                    icon={Calendar}
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    error={errors.dateOfBirth}
                    touched={touched.dateOfBirth}
                    isFocused={focusedField === 'dateOfBirth'}
                    max={new Date().toISOString().split('T')[0]}
                />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-400">*</span>
                    </label>
                    <SelectButton
                        options={['Male', 'Female', 'Other']}
                        name="gender"
                        value={data.gender}
                        onChange={handleChange}
                        error={errors.gender}
                        touched={touched.gender}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <InputField
                        icon={Ruler}
                        label="Height"
                        name="height"
                        type="number"
                        value={data.height}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        error={errors.height}
                        touched={touched.height}
                        isFocused={focusedField === 'height'}
                        placeholder="Height in cm"
                        min="30"
                        max="250"
                    />

                    <InputField
                        icon={Weight}
                        label="Weight"
                        name="weight"
                        type="number"
                        value={data.weight}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        error={errors.weight}
                        touched={touched.weight}
                        isFocused={focusedField === 'weight'}
                        placeholder="Weight in kg"
                        min="20"
                        max="300"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Type <span className="text-red-400">*</span>
                    </label>
                    <SelectButton
                        options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                        name="bloodType"
                        value={data.bloodType}
                        onChange={handleChange}
                        error={errors.bloodType}
                        touched={touched.bloodType}
                    />
                </div>
            </div>

            <AnimatePresence>
                {validationMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-xl shadow-sm"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{validationMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BasicInfoStep;