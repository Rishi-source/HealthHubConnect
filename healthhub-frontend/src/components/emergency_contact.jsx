import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, UserPlus, AlertCircle, X, Heart, UserCheck } from 'lucide-react';

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
  contactIndex,
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
        onChange={(e) => onChange(contactIndex, name, e.target.value)}
        onFocus={() => onFocus(`${contactIndex}_${name}`)}
        onBlur={() => onBlur(`${contactIndex}_${name}`)}
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

const EmergencyContactCard = memo(({ 
  contact, 
  index, 
  onRemove, 
  onChange,
  onFocus,
  onBlur,
  errors,
  touched,
  focusedField,
  isFirst,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-gray-50 rounded-2xl p-6 space-y-6 relative group"
  >
    {!isFirst && (
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
    )}

    <div className="flex items-center gap-3 mb-4">
      {isFirst ? (
        <div className="p-2 bg-teal-50 rounded-lg">
          <Heart className="w-5 h-5 text-teal-500" />
        </div>
      ) : (
        <div className="p-2 bg-gray-100 rounded-lg">
          <UserCheck className="w-5 h-5 text-gray-500" />
        </div>
      )}
      <span className="font-medium text-gray-700">
        {isFirst ? 'Primary Emergency Contact' : `Additional Contact ${index}`}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        icon={User}
        label="Full Name"
        name="name"
        value={contact.name}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        error={errors[`${index}_name`]}
        touched={touched[`${index}_name`]}
        isFocused={focusedField === `${index}_name`}
        placeholder="Contact's full name"
        required={isFirst}
        contactIndex={index}
      />

      <InputField
        icon={User}
        label="Relationship"
        name="relationship"
        value={contact.relationship}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        error={errors[`${index}_relationship`]}
        touched={touched[`${index}_relationship`]}
        isFocused={focusedField === `${index}_relationship`}
        placeholder="e.g., Spouse, Parent"
        required={isFirst}
        contactIndex={index}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        icon={Phone}
        label="Phone Number"
        name="phone"
        type="tel"
        value={contact.phone}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        error={errors[`${index}_phone`]}
        touched={touched[`${index}_phone`]}
        isFocused={focusedField === `${index}_phone`}
        placeholder="Contact's phone number"
        required={isFirst}
        contactIndex={index}
      />

      <InputField
        icon={Mail}
        label="Email Address"
        name="email"
        type="email"
        value={contact.email}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        error={errors[`${index}_email`]}
        touched={touched[`${index}_email`]}
        isFocused={focusedField === `${index}_email`}
        placeholder="Contact's email address"
        contactIndex={index}
      />
    </div>
  </motion.div>
));

const EmergencyContactStep = ({ 
  data = { emergencyContacts: [] }, 
  onChange = () => {}, 
  onValidationChange = () => {} 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!data.emergencyContacts?.length) {
      onChange({
        ...data,
        emergencyContacts: [{
          name: '',
          relationship: '',
          phone: '',
          email: ''
        }]
      });
    }
  }, []);

  const isPrimaryContactValid = (contact) => {
    return contact?.name?.trim() && 
           contact?.relationship?.trim() && 
           contact?.phone?.trim();
  };

  const handleChange = (contactIndex, field, value) => {
    const newContacts = [...(data.emergencyContacts || [])];
    if (!newContacts[contactIndex]) {
      newContacts[contactIndex] = { name: '', relationship: '', phone: '', email: '' };
    }
    newContacts[contactIndex] = { ...newContacts[contactIndex], [field]: value };
    
    onChange({ ...data, emergencyContacts: newContacts });

    const isPrimaryValid = isPrimaryContactValid(newContacts[0]);
    onValidationChange(isPrimaryValid);

    setTouched(prev => ({
      ...prev,
      [`${contactIndex}_${field}`]: true
    }));
  };

  const handleAddContact = () => {
    const newContacts = [...(data.emergencyContacts || [])];
    newContacts.push({
      name: '',
      relationship: '',
      phone: '',
      email: ''
    });
    onChange({ ...data, emergencyContacts: newContacts });
  };

  const handleRemoveContact = (index) => {
    if (index === 0) return; 
    const newContacts = [...(data.emergencyContacts || [])].filter((_, i) => i !== index);
    onChange({ ...data, emergencyContacts: newContacts });
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
    if (data.emergencyContacts?.length) {
      const isPrimaryValid = isPrimaryContactValid(data.emergencyContacts[0]);
      onValidationChange(isPrimaryValid);
    }
  }, [data.emergencyContacts]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {data.emergencyContacts?.map((contact, index) => (
          <EmergencyContactCard
            key={index}
            contact={contact}
            index={index}
            onRemove={handleRemoveContact}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            focusedField={focusedField}
            isFirst={index === 0}
          />
        ))}
      </AnimatePresence>

      {data.emergencyContacts?.length < 3 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleAddContact}
          className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 
            text-gray-500 hover:text-teal-500 hover:border-teal-500
            transition-all duration-300 flex items-center justify-center gap-2
            group hover:bg-teal-50/50"
        >
          <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          Add Another Emergency Contact
        </motion.button>
      )}
    </div>
  );
};

export default EmergencyContactStep;