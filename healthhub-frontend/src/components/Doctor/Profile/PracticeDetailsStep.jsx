import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, MapPin, Globe, Phone, Clock,
  Plus, X, AlertCircle, DollarSign, Video,
  Users, Calendar, Check, Stethoscope
} from 'lucide-react';


const DEFAULT_DATA = {
  affiliations: [{
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    designation: '',
    workingHours: ''
  }],
  consultationTypes: {
    online: {
      enabled: false,
      fee: '',
      duration: '',
      followupFee: '',
      followupWindow: '',
      instructions: ''
    },
    inPerson: {
      enabled: false,
      fee: '',
      duration: '',
      followupFee: '',
      followupWindow: ''
    }
  },
  emergencyAvailable: false,
  emergencyFee: '',
  emergencyHours: '24x7',
  customEmergencyHours: ''
};
  

const InputField = memo(({
  icon: Icon,
  label,
  name,
  type = "text",
  value = '',
  onChange,
  error,
  touched,
  required = false,
  placeholder,
  className = '',
  ...props
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 ${Icon ? 'pl-12' : ''} rounded-xl border-2
          transition-all duration-300
          ${error && touched
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
          }
          group-hover:border-gray-300
          ${className}
        `}
        placeholder={placeholder}
        {...props}
      />
      {Icon && (
        <Icon className={`
          absolute left-4 top-1/2 transform -translate-y-1/2
          ${error && touched ? 'text-red-400' : 'text-gray-400'}
        `} />
      )}
    </div>
    {error && touched && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-red-500 text-sm"
      >
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </motion.div>
    )}
  </div>
));


const HospitalAffiliation = memo(({
  affiliation,
  index,
  onUpdate,
  onRemove,
  isFirst,
  errors,
  touched
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-6 bg-gray-50 rounded-xl space-y-4 relative group"
  >
    {!isFirst && (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 p-2 bg-red-100 rounded-full text-red-500
          opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
          transition-all duration-300 hover:bg-red-200"
      >
        <X className="w-4 h-4" />
      </motion.button>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        icon={Building}
        label="Hospital/Clinic Name"
        value={affiliation.name}
        onChange={(e) => onUpdate(index, 'name', e.target.value)}
        error={errors?.[`affiliations.${index}.name`]}
        touched={touched?.[`affiliations.${index}.name`]}
        required={isFirst}
        placeholder="Enter hospital or clinic name"
      />

      <InputField
        icon={Phone}
        label="Contact Number"
        value={affiliation.phone}
        onChange={(e) => onUpdate(index, 'phone', e.target.value)}
        error={errors?.[`affiliations.${index}.phone`]}
        touched={touched?.[`affiliations.${index}.phone`]}
        required={isFirst}
        placeholder="Hospital contact number"
      />
    </div>

    <InputField
      icon={MapPin}
      label="Address"
      value={affiliation.address}
      onChange={(e) => onUpdate(index, 'address', e.target.value)}
      error={errors?.[`affiliations.${index}.address`]}
      touched={touched?.[`affiliations.${index}.address`]}
      required={isFirst}
      placeholder="Complete address"
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField
        icon={MapPin}
        label="City"
        value={affiliation.city}
        onChange={(e) => onUpdate(index, 'city', e.target.value)}
        error={errors?.[`affiliations.${index}.city`]}
        touched={touched?.[`affiliations.${index}.city`]}
        required={isFirst}
        placeholder="City"
      />

      <InputField
        icon={MapPin}
        label="State/Province"
        value={affiliation.state}
        onChange={(e) => onUpdate(index, 'state', e.target.value)}
        error={errors?.[`affiliations.${index}.state`]}
        touched={touched?.[`affiliations.${index}.state`]}
        placeholder="State"
      />

      <InputField
        icon={Globe}
        label="Country"
        value={affiliation.country}
        onChange={(e) => onUpdate(index, 'country', e.target.value)}
        error={errors?.[`affiliations.${index}.country`]}
        touched={touched?.[`affiliations.${index}.country`]}
        required={isFirst}
        placeholder="Country"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Designation/Role {isFirst && <span className="text-red-400">*</span>}
        </label>
        <select
          value={affiliation.designation}
          onChange={(e) => onUpdate(index, 'designation', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
            focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20
            transition-all duration-300"
        >
          <option value="">Select designation</option>
          <option value="consultant">Consultant</option>
          <option value="visiting">Visiting Doctor</option>
          <option value="resident">Resident Doctor</option>
          <option value="head">Department Head</option>
          <option value="director">Medical Director</option>
        </select>
      </div>

      <InputField
        icon={Clock}
        label="Working Hours"
        value={affiliation.workingHours}
        onChange={(e) => onUpdate(index, 'workingHours', e.target.value)}
        error={errors?.[`affiliations.${index}.workingHours`]}
        touched={touched?.[`affiliations.${index}.workingHours`]}
        placeholder="e.g., Mon-Fri 9AM-5PM"
      />
    </div>
  </motion.div>
));


const ConsultationType = memo(({
  type,
  settings,
  onUpdate,
  errors,
  touched
}) => {
  const [isEnabled, setIsEnabled] = useState(settings.enabled);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    onUpdate({ ...settings, enabled: !isEnabled });
  };

  return (
    <div className={`
      p-6 rounded-xl border-2 transition-all duration-300
      ${isEnabled
        ? 'border-teal-500 bg-teal-50'
        : 'border-gray-200'
      }
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-teal-100' : 'bg-gray-100'}`}>
            {type === 'online' ? (
              <Video className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-gray-400'}`} />
            ) : (
              <Users className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-gray-400'}`} />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {type === 'online' ? 'Online Consultation' : 'In-Person Consultation'}
            </h3>
            <p className="text-sm text-gray-500">
              {type === 'online'
                ? 'Video consultations via telemedicine'
                : 'Physical consultations at your practice'
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200 ease-in-out
            ${isEnabled ? 'bg-teal-500' : 'bg-gray-200'}
          `}
        >
          <span className="sr-only">Toggle consultation type</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={DollarSign}
                label="Consultation Fee"
                type="number"
                value={settings.fee}
                onChange={(e) => onUpdate({ ...settings, fee: e.target.value })}
                error={errors?.[`${type}.fee`]}
                touched={touched?.[`${type}.fee`]}
                required
                min="0"
                placeholder="Regular consultation fee"
              />

              <InputField
                icon={Clock}
                label="Duration (minutes)"
                type="number"
                value={settings.duration}
                onChange={(e) => onUpdate({ ...settings, duration: e.target.value })}
                error={errors?.[`${type}.duration`]}
                touched={touched?.[`${type}.duration`]}
                required
                min="5"
                max="180"
                step="5"
                placeholder="Duration per session"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={DollarSign}
                label="Follow-up Fee"
                type="number"
                value={settings.followupFee}
                onChange={(e) => onUpdate({ ...settings, followupFee: e.target.value })}
                error={errors?.[`${type}.followupFee`]}
                touched={touched?.[`${type}.followupFee`]}
                min="0"
                placeholder="Follow-up consultation fee"
              />

              <InputField
                icon={Calendar}
                label="Follow-up Window (days)"
                type="number"
                value={settings.followupWindow}
                onChange={(e) => onUpdate({ ...settings, followupWindow: e.target.value })}
                error={errors?.[`${type}.followupWindow`]}
                touched={touched?.[`${type}.followupWindow`]}
                min="1"
                max="30"
                placeholder="Days within follow-up rate"
              />
            </div>

            {type === 'online' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Online Consultation Notes</h4>
                <textarea
                  value={settings.instructions}
                  onChange={(e) => onUpdate({ ...settings, instructions: e.target.value })}
                  placeholder="Add any specific instructions for online consultations..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
                    transition-all duration-300"
                  rows={3}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const PracticeDetailsStep = ({
    data = {
      affiliations: [{
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        designation: '',
        workingHours: ''
      }],
      consultationTypes: {
        online: {
          enabled: false,
          fee: '',
          duration: '',
          followupFee: '',
          followupWindow: '',
          instructions: ''
        },
        inPerson: {
          enabled: false,
          fee: '',
          duration: '',
          followupFee: '',
          followupWindow: ''
        }
      },
      emergencyAvailable: false,
      emergencyFee: '',
      emergencyHours: '24x7',
      customEmergencyHours: ''
    },
    onChange = () => { },
    onValidationChange = () => { }
  }) => {
    const [formData, setFormData] = useState(() => {
      
      const defaultData = {
        affiliations: [{
          name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          designation: '',
          workingHours: ''
        }],
        consultationTypes: {
          online: {
            enabled: false,
            fee: '',
            duration: '',
            followupFee: '',
            followupWindow: '',
            instructions: ''
          },
          inPerson: {
            enabled: false,
            fee: '',
            duration: '',
            followupFee: '',
            followupWindow: ''
          }
        },
        emergencyAvailable: false,
        emergencyFee: '',
        emergencyHours: '24x7',
        customEmergencyHours: ''
      };
  
      
      return {
        ...defaultData,
        ...data,
        consultationTypes: {
          online: { ...defaultData.consultationTypes.online, ...(data.consultationTypes?.online || {}) },
          inPerson: { ...defaultData.consultationTypes.inPerson, ...(data.consultationTypes?.inPerson || {}) }
        },
        affiliations: data.affiliations?.length > 0 ? data.affiliations : defaultData.affiliations
      };
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [validationMessage, setValidationMessage] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);
      
    
    
    const handleDataChange = (newData) => {
        setFormData(newData);
        onChange(preparePayload(newData));
        validateForm(newData);
      };
            
          
      const validateAffiliation = (affiliation, index) => {
        const errors = {};
        
        if (index === 0) {
          if (!affiliation.name?.trim()) errors[`affiliations.${index}.name`] = 'Hospital name is required';
          if (!affiliation.phone?.trim()) errors[`affiliations.${index}.phone`] = 'Contact number is required';
          if (!affiliation.address?.trim()) errors[`affiliations.${index}.address`] = 'Address is required';
          if (!affiliation.city?.trim()) errors[`affiliations.${index}.city`] = 'City is required';
          if (!affiliation.country?.trim()) errors[`affiliations.${index}.country`] = 'Country is required';
          if (!affiliation.designation) errors[`affiliations.${index}.designation`] = 'Designation is required';
        }
    
        if (affiliation.phone && !/^\+?[\d\s-]{10,}$/.test(affiliation.phone)) {
          errors[`affiliations.${index}.phone`] = 'Invalid phone number';
        }
    
        return errors;
      };
    
        
      const validateConsultationType = (type, settings) => {
        const errors = {};
        if (settings.enabled) {
          if (!settings.fee) errors[`${type}.fee`] = 'Consultation fee is required';
          if (!settings.duration) {
            errors[`${type}.duration`] = 'Duration is required';
          } else {
            const duration = parseInt(settings.duration);
            if (isNaN(duration) || duration < 5 || duration > 180) {
              errors[`${type}.duration`] = 'Duration should be between 5-180 minutes';
            }
          }
          
          if (type === 'online' && !settings.instructions?.trim()) {
            errors[`${type}.instructions`] = 'Online consultation instructions are required';
          }
        }
        return errors;
      };
      
              
  const validateForm = (formData) => {
    let newErrors = {};

    
    const safeFormData = {
      affiliations: formData.affiliations || [],
      consultationTypes: {
        online: {
          enabled: false,
          fee: '',
          duration: '',
          followupFee: '',
          followupWindow: '',
          instructions: '',
          ...(formData.consultationTypes?.online || {})
        },
        inPerson: {
          enabled: false,
          fee: '',
          duration: '',
          followupFee: '',
          followupWindow: '',
          ...(formData.consultationTypes?.inPerson || {})
        }
      },
      emergencyAvailable: formData.emergencyAvailable || false,
      emergencyFee: formData.emergencyFee || '',
      emergencyHours: formData.emergencyHours || '24x7',
      customEmergencyHours: formData.customEmergencyHours || ''
    };

    
    safeFormData.affiliations.forEach((affiliation, index) => {
        newErrors = { ...newErrors, ...validateAffiliation(affiliation, index) };
      });
    
      
      if (!safeFormData.consultationTypes.online.enabled && !safeFormData.consultationTypes.inPerson.enabled) {
        newErrors.consultationTypes = { general: 'At least one consultation type must be enabled' };
      } else {
        
        if (safeFormData.consultationTypes.online.enabled) {
          newErrors = {
            ...newErrors,
            ...validateConsultationType('online', safeFormData.consultationTypes.online)
          };
        }
        if (safeFormData.consultationTypes.inPerson.enabled) {
          newErrors = {
            ...newErrors,
            ...validateConsultationType('inPerson', safeFormData.consultationTypes.inPerson)
          };
        }
      }
    
      
      if (formData.emergencyAvailable) {
        if (!formData.emergencyFee) {
          newErrors.emergencyFee = 'Emergency consultation fee is required';
        }
      }
    
      const hasErrors = Object.keys(newErrors).length > 0;
      setErrors(newErrors);
      setValidationMessage(hasErrors ? 'Please complete all required fields' : null);
      setIsFormValid(!hasErrors);
      onValidationChange(!hasErrors);
    
      return !hasErrors;
    };
    
    

  
  const handleAffiliationUpdate = (index, field, value) => {
    const newAffiliations = [...formData.affiliations];
    newAffiliations[index] = {
      ...newAffiliations[index],
      [field]: value
    };
    handleDataChange({
      ...formData,
      affiliations: newAffiliations
    });
  };

  const handleAddAffiliation = () => {
    const newAffiliations = [...formData.affiliations, {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      designation: '',
      workingHours: ''
    }];

    handleDataChange({
      ...formData,
      affiliations: newAffiliations
    });
  };

  const handleRemoveAffiliation = (index) => {
    if (index === 0) return;
    
    const newAffiliations = formData.affiliations.filter((_, i) => i !== index);
    handleDataChange({
      ...formData,
      affiliations: newAffiliations
    });
  };

  const handleConsultationUpdate = (type, settings) => {
    const safeSettings = {
      enabled: settings.enabled,
      fee: settings.enabled ? settings.fee : '',
      duration: settings.enabled ? settings.duration : '',
      followupFee: settings.enabled ? settings.followupFee : '',
      followupWindow: settings.enabled ? settings.followupWindow : '',
      instructions: settings.enabled ? settings.instructions : '',
    };
  
    handleDataChange({
      ...formData,
      consultationTypes: {
        ...formData.consultationTypes,
        [type]: safeSettings
      }
    });
  };
  
  
  const preparePayload = (formData) => {
    return {
      affiliations: formData.affiliations.map(affiliation => ({
        name: affiliation.name.trim(),
        phone: affiliation.phone.trim(),
        address: affiliation.address.trim(),
        city: affiliation.city.trim(),
        state: affiliation.state?.trim() || null,
        country: affiliation.country.trim(),
        designation: affiliation.designation,
        workingHours: affiliation.workingHours?.trim() || null
      })),
      consultationTypes: {
        online: {
          enabled: formData.consultationTypes.online.enabled,
          fee: formData.consultationTypes.online.enabled ? parseFloat(formData.consultationTypes.online.fee) : null,
          duration: formData.consultationTypes.online.enabled ? parseInt(formData.consultationTypes.online.duration) : null,
          followupFee: formData.consultationTypes.online.followupFee ? parseFloat(formData.consultationTypes.online.followupFee) : null,
          followupWindow: formData.consultationTypes.online.followupWindow ? parseInt(formData.consultationTypes.online.followupWindow) : null,
          instructions: formData.consultationTypes.online.instructions?.trim() || null
        },
        inPerson: {
          enabled: formData.consultationTypes.inPerson.enabled,
          fee: formData.consultationTypes.inPerson.enabled ? parseFloat(formData.consultationTypes.inPerson.fee) : null,
          duration: formData.consultationTypes.inPerson.enabled ? parseInt(formData.consultationTypes.inPerson.duration) : null,
          followupFee: formData.consultationTypes.inPerson.followupFee ? parseFloat(formData.consultationTypes.inPerson.followupFee) : null,
          followupWindow: formData.consultationTypes.inPerson.followupWindow ? parseInt(formData.consultationTypes.inPerson.followupWindow) : null
        }
      },
      emergency: {
        available: formData.emergencyAvailable,
        fee: formData.emergencyAvailable ? parseFloat(formData.emergencyFee) : null,
        hours: formData.emergencyHours,
        customHours: formData.emergencyHours === 'custom' ? formData.customEmergencyHours?.trim() : null
      }
    };
  };


  useEffect(() => {
    validateForm(formData);
  }, []);

  return (

  <div className="space-y-8">
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
      <Building className="w-5 h-5 text-gray-500" />
      Hospital Affiliations
    </h3>

    <AnimatePresence mode="popLayout">
      {formData.affiliations?.map((affiliation, index) => (
        <HospitalAffiliation
          key={index}
          affiliation={affiliation}
          index={index}
          onUpdate={handleAffiliationUpdate}
          onRemove={handleRemoveAffiliation}
          isFirst={index === 0}
          errors={errors}
          touched={touched}
        />
      ))}
    </AnimatePresence>

    <motion.button
      type="button"
      onClick={handleAddAffiliation}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200
        text-gray-500 hover:text-teal-500 hover:border-teal-500
        transition-all duration-300 flex items-center justify-center gap-2
        group hover:bg-teal-50/50"
    >
      <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
      Add Another Hospital Affiliation
    </motion.button>
  </div>

  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
      <Stethoscope className="w-5 h-5 text-gray-500" />
      Consultation Settings
    </h3>

    <div className="grid grid-cols-1 gap-6">
      <ConsultationType
        type="online"
        settings={formData.consultationTypes.online}
        onUpdate={(settings) => handleConsultationUpdate('online', settings)}
        errors={errors}
        touched={touched}
      />

      <ConsultationType
        type="inPerson"
        settings={formData.consultationTypes.inPerson}
        onUpdate={(settings) => handleConsultationUpdate('inPerson', settings)}
        errors={errors}
        touched={touched}
      />
    </div>

    <div className="p-6 bg-yellow-50 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Emergency Consultations</h3>
            <p className="text-sm text-gray-500">
              Set your availability for emergency cases
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            handleDataChange({
              ...formData,
              emergencyAvailable: !formData.emergencyAvailable
            });
          }}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer
            rounded-full border-2 border-transparent transition-colors
            duration-200 ease-in-out
            ${formData.emergencyAvailable ? 'bg-yellow-500' : 'bg-gray-200'}
          `}
        >
          <span className="sr-only">Toggle emergency availability</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform
              rounded-full bg-white shadow ring-0 transition
              duration-200 ease-in-out
              ${formData.emergencyAvailable ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      <AnimatePresence>
        {formData.emergencyAvailable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <InputField
              icon={DollarSign}
              label="Emergency Consultation Fee"
              type="number"
              value={formData.emergencyFee}
              onChange={(e) => {
                handleDataChange({
                  ...formData,
                  emergencyFee: e.target.value
                });
              }}
              error={errors.emergencyFee}
              touched={touched.emergencyFee}
              required
              min="0"
              placeholder="Fee for emergency consultations"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Available Hours
              </label>
              <select
                value={formData.emergencyHours || '24x7'}
                onChange={(e) => {
                  handleDataChange({
                    ...formData,
                    emergencyHours: e.target.value
                  });
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                  focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20
                  transition-all duration-300"
              >
                <option value="24x7">24x7 Available</option>
                <option value="working">During Working Hours Only</option>
                <option value="custom">Custom Hours</option>
              </select>
            </div>

            {formData.emergencyHours === 'custom' && (
              <div className="col-span-2">
                <InputField
                  icon={Clock}
                  label="Custom Emergency Hours"
                  value={formData.customEmergencyHours || ''}
                  onChange={(e) => {
                    handleDataChange({
                      ...formData,
                      customEmergencyHours: e.target.value
                    });
                  }}
                  placeholder="e.g., Mon-Sat 8AM-10PM"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          Object.keys(errors).some(key => key.startsWith('affiliations'))
            ? 'bg-gray-200 text-gray-500'
            : 'bg-green-100 text-green-600'
        }`}>
          <Building className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Hospital Affiliations</h3>
          <p className="text-sm text-gray-500">
            {formData.affiliations.length} location{formData.affiliations.length !== 1 ? 's' : ''} added
          </p>
        </div>
      </div>
    </div>

    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          Object.keys(errors).some(key => key.startsWith('consultationTypes'))
            ? 'bg-gray-200 text-gray-500'
            : 'bg-green-100 text-green-600'
        }`}>
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Consultation Types</h3>
          <p className="text-sm text-gray-500">
            {(
              (formData?.consultationTypes?.online?.enabled ? 1 : 0) +
              (formData?.consultationTypes?.inPerson?.enabled ? 1 : 0)
            )} type(s) enabled
          </p>
        </div>
      </div>
    </div>

    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          formData.emergencyAvailable && !errors.emergencyFee
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-gray-200 text-gray-500'
        }`}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Emergency Services</h3>
          <p className="text-sm text-gray-500">
            {formData.emergencyAvailable ? 'Available' : 'Not available'}
          </p>
        </div>
      </div>
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

  <style jsx global>{`
    @media (max-width: 640px) {
      input[type="text"],
      input[type="number"],
      input[type="tel"],
      select,
      textarea {
        font-size: 16px;
        min-height: 44px;
      }
      
      button {
        min-height: 44px;
        font-size: 16px;
      }
      
      .group label {
        font-size: 14px;
      }
    }

    .animate-pulse-soft {
      animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}</style>
</div>
  );

};

export default PracticeDetailsStep;
