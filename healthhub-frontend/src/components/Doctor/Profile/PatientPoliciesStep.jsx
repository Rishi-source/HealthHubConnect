import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Clock, AlertCircle, FileText, Plus, X,
  ShieldCheck, DollarSign, Calendar, Wallet, Building
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-xl text-red-600">
          <h1>Something went wrong.</h1>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
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

const InsuranceProviderCard = memo(({
  provider,
  index,
  onUpdate,
  onRemove,
  errors = {},
  touched = {}
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-6 bg-gray-50 rounded-xl space-y-4 relative group"
  >
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        icon={Building}
        name="name"
        label="Insurance Provider"
        value={provider.name}
        onChange={(_, value) => onUpdate(index, { ...provider, name: value })}
        error={errors?.name}
        touched={touched?.name}
        placeholder="Provider name"
        required
      />

      <InputField
        icon={DollarSign}
        name="planTypes"
        label="Accepted Plans"
        value={provider.planTypes}
        onChange={(_, value) => onUpdate(index, { ...provider, planTypes: value })}
        error={errors?.planTypes}
        touched={touched?.planTypes}
        placeholder="e.g., PPO, HMO"
        required
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        icon={CreditCard}
        name="verificationProcess"
        label="Verification Process"
        value={provider.verificationProcess}
        onChange={(_, value) => onUpdate(index, { ...provider, verificationProcess: value })}
        error={errors?.verificationProcess}
        touched={touched?.verificationProcess}
        placeholder="How to verify coverage"
      />

      <InputField
        icon={Clock}
        name="processingTime"
        label="Processing Time"
        value={provider.processingTime}
        onChange={(_, value) => onUpdate(index, { ...provider, processingTime: value })}
        error={errors?.processingTime}
        touched={touched?.processingTime}
        placeholder="e.g., 2-3 business days"
      />
    </div>
  </motion.div>
));

const PatientPoliciesStep = ({
  data = {
    cancellationPolicy: '',
    cancellationTimeframe: '24h',
    cancellationFee: '0',
    noShowPolicy: '',
    noShowFee: '0',
    insuranceProviders: [],
    paymentMethods: [],
    consultationPrep: '',
    documentationRequired: '',
    followUpPolicy: '',
    emergencyPolicy: ''
  },
  onChange = () => { },
  onValidationChange = () => { }
}) => {
  console.log('PatientPoliciesStep rendered with data:', data);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [providerErrors, setProviderErrors] = useState({});


  const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_wallet', label: 'Mobile Wallet' },
    { value: 'insurance', label: 'Insurance' }
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'cancellationPolicy':
        return !value?.trim() ? 'Cancellation policy is required' : null;
      case 'cancellationTimeframe':
        if (!value?.trim()) return 'Cancellation timeframe is required';
        if (!value.endsWith('h')) return 'Timeframe must be in hours format (e.g., 24h)';
        const hours = parseInt(value);
        if (isNaN(hours) || hours <= 0) return 'Invalid timeframe';
        return null;
      case 'cancellationFee':
        if (!value?.trim()) return 'Cancellation fee is required';
        if (isNaN(value) || parseFloat(value) < 0) return 'Invalid fee amount';
        return null;
      case 'noShowPolicy':
        return !value?.trim() ? 'No-show policy is required' : null;
      case 'noShowFee':
        if (!value?.trim()) return 'No-show fee is required';
        if (isNaN(value) || parseFloat(value) < 0) return 'Invalid fee amount';
        return null;
      case 'paymentMethods':
        return !value?.length ? 'Select at least one payment method' : null;
      case 'consultationPrep':
        return !value?.trim() ? 'Consultation preparation instructions are required' : null;
      case 'documentationRequired':
        return !value?.trim() ? 'Required documentation list is required' : null;
      default:
        return null;
    }
  };
  const formatTimeframe = (value) => {
    if (!value) return value;
    const numericValue = value.replace(/[^\d]/g, '');
    return `${numericValue}h`;
  };

  const handleChange = (name, value) => {
    console.log('handleChange called with:', { name, value });
    try {
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
    } catch (err) {
      console.error('Error in handleChange:', err);
    }
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
    try {
    console.log('validateForm called with:', formData);
    const newErrors = {};
    let hasErrors = false;

    ['cancellationPolicy', 'cancellationTimeframe', 'cancellationFee',
      'noShowPolicy', 'noShowFee', 'paymentMethods', 'consultationPrep',
      'documentationRequired'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          hasErrors = true;
        }
      });

    if (formData.insuranceProviders?.length > 0) {
      const newProviderErrors = {};
      formData.insuranceProviders.forEach((provider, index) => {
        const errors = validateInsuranceProvider(provider);
        if (errors) {
          newProviderErrors[index] = errors;
          hasErrors = true;
        }
      });
      setProviderErrors(newProviderErrors);
    }

    setErrors(newErrors);
    const message = hasErrors
      ? 'Please complete all required fields marked with an asterisk (*)'
      : null;
    setValidationMessage(message);
    onValidationChange?.(!hasErrors);

    return !hasErrors;} catch (err) {
      console.error('Error in validateForm:', err);
      return false;
    }
  };
  useEffect(() => {
    console.log('PatientPoliciesStep mounted');
    return () => {
      console.log('PatientPoliciesStep unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('Data changed:', data);
  }, [data]);


  const validateInsuranceProvider = (provider) => {
    const errors = {};
    if (!provider.name?.trim()) errors.name = 'Provider name is required';
    if (!provider.planTypes?.trim()) errors.planTypes = 'Plan types are required';
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const defaultInsuranceProvider = {
    name: '',
    planTypes: '',
    verificationProcess: 'Online verification',  
    processingTime: '2-3 business days'  
  };


  useEffect(() => {
    validateForm(data);
  }, [data]); 

  return (
    <div className="space-y-8">
      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          Cancellation & No-Show Policy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InputField
              icon={FileText}
              label="Cancellation Policy"
              name="cancellationPolicy"
              value={data.cancellationPolicy}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors.cancellationPolicy}
              touched={touched.cancellationPolicy}
              isFocused={focusedField === 'cancellationPolicy'}
              placeholder="Describe your cancellation policy"
              required
            />

            <InputField
              icon={Clock}
              label="Cancellation Timeframe"
              name="cancellationTimeframe"
              value={data.cancellationTimeframe}
              onChange={(name, value) => handleChange(name, formatTimeframe(value))}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors.cancellationTimeframe}
              touched={touched.cancellationTimeframe}
              isFocused={focusedField === 'cancellationTimeframe'}
              placeholder="e.g., 24h"
              required
            />

            <InputField
              icon={DollarSign}
              label="Cancellation Fee"
              name="cancellationFee"
              type="number"
              value={data.cancellationFee}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors.cancellationFee}
              touched={touched.cancellationFee}
              isFocused={focusedField === 'cancellationFee'}
              placeholder="Fee amount"
              min="0"
              required
            />
          </div>

          <div className="space-y-6">
            <InputField
              icon={FileText}
              label="No-Show Policy"
              name="noShowPolicy"
              value={data.noShowPolicy}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors.noShowPolicy}
              touched={touched.noShowPolicy}
              isFocused={focusedField === 'noShowPolicy'}
              placeholder="Describe your no-show policy"
              required
            />

            <InputField
              icon={DollarSign}
              label="No-Show Fee"
              name="noShowFee"
              type="number"
              value={data.noShowFee}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              error={errors.noShowFee}
              touched={touched.noShowFee}
              isFocused={focusedField === 'noShowFee'}
              placeholder="Fee amount"
              min="0"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-500" />
          Insurance & Payment Methods
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Insurance Providers
            </label>
            <button
              type="button"
              onClick={() => {
                const newProviders = [
                  ...(data.insuranceProviders || []),
                  { ...defaultInsuranceProvider }
                ];
                handleChange('insuranceProviders', newProviders);
              }}
              className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {data.insuranceProviders?.map((provider, index) => (
              <InsuranceProviderCard
                key={index}
                provider={provider}
                index={index}
                onUpdate={(index, updatedProvider) => {
                  const newProviders = [...data.insuranceProviders];
                  newProviders[index] = updatedProvider;
                  handleChange('insuranceProviders', newProviders);
                }}
                onRemove={(index) => {
                  const newProviders = data.insuranceProviders.filter((_, i) => i !== index);
                  handleChange('insuranceProviders', newProviders);
                }}
                errors={providerErrors[index] || {}}
                touched={touched[`insuranceProviders.${index}`] || {}}
              />))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Payment Methods <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
  {PAYMENT_METHODS.map((method) => (
    <motion.button
      key={method.value}
      type="button"
      onClick={() => {
        try {
          const methods = Array.isArray(data.paymentMethods) ? data.paymentMethods : [];
          const newMethods = methods.includes(method.value)
            ? methods.filter(m => m !== method.value)
            : [...methods, method.value];
          handleChange('paymentMethods', newMethods);
        } catch (err) {
          console.error('Error in payment method click:', err);
        }
      }}
      className={`
        px-4 py-2 rounded-xl border-2 transition-all duration-300
        ${Array.isArray(data.paymentMethods) && data.paymentMethods.includes(method.value)
          ? 'border-teal-500 bg-teal-50 text-teal-600'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {method.label}
    </motion.button>
  ))}
</div>

          {errors.paymentMethods && touched.paymentMethods && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{errors.paymentMethods}</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gray-500" />
          Patient Instructions & Documentation
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Preparation <span className="text-red-400">*</span>
            </label>
            <textarea
              value={data.consultationPrep}
              onChange={(e) => handleChange('consultationPrep', e.target.value)}
              onFocus={() => handleFocus('consultationPrep')}
              onBlur={() => handleBlur('consultationPrep')}
              rows={4}
              className={`
                w-full px-4 py-3 rounded-xl border-2
                transition-colors duration-300
                ${errors.consultationPrep && touched.consultationPrep
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                }
              `}
              placeholder="Instructions for patients before consultation"
            />
            {errors.consultationPrep && touched.consultationPrep && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-500 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{errors.consultationPrep}</span>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Documentation <span className="text-red-400">*</span>
            </label>
            <textarea
              value={data.documentationRequired}
              onChange={(e) => handleChange('documentationRequired', e.target.value)}
              onFocus={() => handleFocus('documentationRequired')}
              onBlur={() => handleBlur('documentationRequired')}
              rows={4}
              className={`
                w-full px-4 py-3 rounded-xl border-2
                transition-colors duration-300
                ${errors.documentationRequired && touched.documentationRequired
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                }
              `}
              placeholder="List of documents patients need to bring"
            />
            {errors.documentationRequired && touched.documentationRequired && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-500 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{errors.documentationRequired}</span>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Policy
            </label>
            <textarea
              value={data.followUpPolicy}
              onChange={(e) => handleChange('followUpPolicy', e.target.value)}
              onFocus={() => handleFocus('followUpPolicy')}
              onBlur={() => handleBlur('followUpPolicy')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20
                transition-colors duration-300"
              placeholder="Describe your follow-up consultation policy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Policy
            </label>
            <textarea
              value={data.emergencyPolicy}
              onChange={(e) => handleChange('emergencyPolicy', e.target.value)}
              onFocus={() => handleFocus('emergencyPolicy')}
              onBlur={() => handleBlur('emergencyPolicy')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20
                transition-colors duration-300"
              placeholder="Instructions for emergency situations"
            />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${errors.cancellationPolicy || errors.noShowPolicy
                ? 'bg-gray-200 text-gray-500'
                : 'bg-green-100 text-green-600'
              }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Cancellation Policy</h3>
              <p className="text-sm text-gray-500">
                {errors.cancellationPolicy || errors.noShowPolicy
                  ? 'Incomplete'
                  : 'Completed'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${errors.paymentMethods
                ? 'bg-gray-200 text-gray-500'
                : 'bg-green-100 text-green-600'
              }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-500">
                {data.paymentMethods?.length || 0} method(s) selected
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${errors.consultationPrep || errors.documentationRequired
                ? 'bg-gray-200 text-gray-500'
                : 'bg-green-100 text-green-600'
              }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Patient Instructions</h3>
              <p className="text-sm text-gray-500">
                {errors.consultationPrep || errors.documentationRequired
                  ? 'Incomplete'
                  : 'Completed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          input[type="text"],
          input[type="number"],
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
      `}</style>
    </div>
  );
};

export default PatientPoliciesStep;