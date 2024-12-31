import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, AlertCircle, Home, Building, Globe } from 'lucide-react';

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
  required = false,
  ...props 
}) => (
  <div className="group min-h-[90px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
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
          disabled:bg-gray-50 disabled:text-gray-500
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

const ContactDetailsStep = ({ 
  data = {
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  }, 
  onChange = () => {}, 
  onValidationChange = () => {} 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^\+?[\d\s-]{10,}$/;
  const POSTAL_CODE_PATTERN = /^[A-Z\d]{3,10}$/i;

  const validateField = (name, value) => {
    if (!value?.trim()) {
      if (name === 'email' || 
          name === 'phone' || 
          name === 'address.street' || 
          name === 'address.city' || 
          name === 'address.country') {
        return `${name.split('.').pop().charAt(0).toUpperCase() + name.split('.').pop().slice(1)} is required`;
      }
    }

    switch (name) {
      case 'email':
        if (!EMAIL_PATTERN.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!PHONE_PATTERN.test(value)) {
          return 'Please enter a valid phone number';
        }
        break;
      case 'address.postalCode':
        if (value && !POSTAL_CODE_PATTERN.test(value)) {
          return 'Please enter a valid postal code';
        }
        break;
      default:
        if (value && value.length > 100) {
          return 'Input is too long';
        }
        break;
    }
    return null;
  };

  const handleChange = (name, value) => {
    const newData = { ...data };
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      newData.address = {
        ...newData.address,
        [addressField]: value
      };
    } else {
      newData[name] = value;
    }
    
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
    const value = name.includes('address.') 
      ? data.address[name.split('.')[1]]
      : data[name];
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (formData) => {
    const newErrors = {};
    let hasErrors = false;

    ['email', 'phone'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    ['street', 'city', 'state', 'postalCode', 'country'].forEach(field => {
      const error = validateField(`address.${field}`, formData.address?.[field]);
      if (error) {
        newErrors[`address.${field}`] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    const validationMsg = hasErrors ? 'Please complete all required fields marked with an asterisk (*)' : null;
    setValidationMessage(validationMsg);
    onValidationChange?.(!hasErrors);
  };

  useEffect(() => {
    validateForm(data);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-6">
          <InputField
            icon={Mail}
            label="Email Address"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            isFocused={focusedField === 'email'}
            placeholder="Enter your email address"
            required
          />

          <InputField
            icon={Phone}
            label="Phone Number"
            name="phone"
            type="tel"
            value={data.phone}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
            isFocused={focusedField === 'phone'}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-xl space-y-6">
          <div className="flex items-center gap-2 text-gray-700 mb-4">
            <Home className="w-5 h-5" />
            <h3 className="text-lg font-medium">Address Information</h3>
          </div>

          <InputField
            icon={Building}
            label="Street Address"
            name="address.street"
            value={data.address?.street || ''}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            error={errors['address.street']}
            touched={touched['address.street']}
            isFocused={focusedField === 'address.street'}
            placeholder="Enter your street address"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={Building}
              label="City"
              name="address.city"
              value={data.address?.city || ''}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors['address.city']}
              touched={touched['address.city']}
              isFocused={focusedField === 'address.city'}
              placeholder="Enter your city"
              required
            />

            <InputField
              icon={MapPin}
              label="State/Province"
              name="address.state"
              value={data.address?.state || ''}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors['address.state']}
              touched={touched['address.state']}
              isFocused={focusedField === 'address.state'}
              placeholder="Enter your state/province"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={MapPin}
              label="Postal Code"
              name="address.postalCode"
              value={data.address?.postalCode || ''}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors['address.postalCode']}
              touched={touched['address.postalCode']}
              isFocused={focusedField === 'address.postalCode'}
              placeholder="Enter your postal code"
            />

            <InputField
              icon={Globe}
              label="Country"
              name="address.country"
              value={data.address?.country || ''}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors['address.country']}
              touched={touched['address.country']}
              isFocused={focusedField === 'address.country'}
              placeholder="Enter your country"
              required
            />
          </div>
        </div>
      </motion.div>

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

export default ContactDetailsStep;