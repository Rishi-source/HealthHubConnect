import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, GraduationCap, Stethoscope,
    Award, Globe, AlertCircle, Languages
} from 'lucide-react';
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
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => onFocus && onFocus(name)}
                onBlur={() => onBlur && onBlur(name)}
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
                autoComplete="off"
                {...props}
            />
            {Icon && (
                <div className="absolute left-4 top-1/3 -translate-y-1/2 pointer-events-none">
                    <Icon className={`
              w-5 h-5
              transition-colors duration-300
              ${error && touched
                            ? 'text-red-400'
                            : isFocused
                                ? 'text-teal-500'
                                : 'text-gray-400 group-hover:text-teal-500'
                        }
            `} />
                </div>
            )}

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


const SelectionGroup = memo(({
    label,
    options,
    value = [],
    onChange,
    error,
    touched,
    required = false,
}) => (
    <div className="space-y-2 min-h-[90px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                        const isSelected = value.includes(option.value);
                        const newValue = isSelected
                            ? value.filter(v => v !== option.value)
                            : [...value, option.value];
                        onChange(newValue);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
            px-4 py-2 rounded-xl border-2 transition-all duration-300
            ${value.includes(option.value)
                            ? 'border-teal-500 bg-teal-50 text-teal-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }
          `}
                >
                    {option.label}
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

const DoctorBasicInfoStep = ({
    data = {
        fullName: '',
        email: '',
        phone: '',
        specializations: [],
        medicalLicenseNumber: '',
        yearOfRegistration: '',
        languages: [],
        experience: '',
        about: ''
    },
    onChange = () => { },
    onValidationChange = () => { }
}) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [focusedField, setFocusedField] = useState(null);
    const [validationMessage, setValidationMessage] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const specializationOptions = [
        { value: 'generalMedicine', label: 'General Medicine' },
        { value: 'cardiology', label: 'Cardiology' },
        { value: 'dermatology', label: 'Dermatology' },
        { value: 'pediatrics', label: 'Pediatrics' },
        { value: 'orthopedics', label: 'Orthopedics' },
        { value: 'neurology', label: 'Neurology' },
        { value: 'psychiatry', label: 'Psychiatry' },
        { value: 'gynecology', label: 'Gynecology' },
        { value: 'ophthalmology', label: 'Ophthalmology' },
        { value: 'ent', label: 'ENT' }
    ];

    const languageOptions = [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
        { value: 'chinese', label: 'Chinese' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'arabic', label: 'Arabic' }
    ];
    const requiredFields = [
        'fullName',
        'email',
        'phone',
        'medicalLicenseNumber',
        'yearOfRegistration',
        'experience',
        'about'
    ];

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                return !value?.trim() ? 'Full name is required' : null;
            case 'email':
                return !value?.trim()
                    ? 'Email is required'
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? 'Invalid email format'
                        : null;
            case 'phone':
                return !value?.trim()
                    ? 'Phone number is required'
                    : !/^\d{10}$/.test(value)
                        ? 'Invalid phone number'
                        : null;
            case 'specializations':
                return !value?.length ? 'Select at least one specialization' : null;
            case 'medicalLicenseNumber':
                return !value?.trim() ? 'Medical license number is required' : null;
            case 'yearOfRegistration':
                if (!value) return 'Year of registration is required';
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                if (year < 1950 || year > currentYear) {
                    return 'Invalid registration year';
                }
                return null;
            case 'languages':
                return !value?.length ? 'Select at least one language' : null;
            case 'experience':
                if (!value) return 'Years of experience is required';
                const exp = parseInt(value);
                if (exp < 0 || exp > 70) {
                    return 'Invalid years of experience';
                }
                return null;
            case 'about':
                return !value?.trim() ? 'Professional summary is required' : null;
            default:
                return null;
        }
    };

    const validateForm = (formData) => {
        const newErrors = {};
        let hasErrors = false;

        // Validate all fields
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        // Check required fields are filled
        const requiredFieldsFilled = requiredFields.every(field => {
            if (Array.isArray(formData[field])) {
                return formData[field].length > 0;
            }
            return formData[field]?.toString().trim().length > 0;
        });

        setErrors(newErrors);
        setValidationMessage(
            hasErrors
                ? 'Please complete all required fields marked with an asterisk (*)'
                : null
        );

        const isValid = !hasErrors && requiredFieldsFilled;
        setIsFormValid(isValid);
        onValidationChange?.(isValid);

        return isValid;
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
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    // Validate form on mount and when data changes
    useEffect(() => {
        validateForm(data);
    }, [data]);


    useEffect(() => {
        validateForm(data);
    }, []);
    
    const preparePayload = () => {
        return {
            fullName: data.fullName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            specializations: data.specializations,
            medicalLicenseNumber: data.medicalLicenseNumber.trim(),
            yearOfRegistration: parseInt(data.yearOfRegistration),
            languages: data.languages,
            experience: parseInt(data.experience),
            about: data.about.trim()
        };
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    icon={User}
                    label="Full Name"
                    name="fullName"
                    value={data.fullName}
                    onChange={(value) => handleChange('fullName', value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    error={errors.fullName}
                    touched={touched.fullName}
                    isFocused={focusedField === 'fullName'}
                    placeholder="Enter your full name"
                    required
                />


                <InputField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(value) => handleChange('email', value)}
                    onFocus={(e) => handleFocus(e.target.name)}

                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                    isFocused={focusedField === 'email'}
                    placeholder="Enter your email address"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    icon={Phone}
                    label="Phone Number"
                    name="phone"
                    value={data.phone}
                    onChange={(value) => handleChange('phone', value)}
                    onFocus={(e) => handleFocus(e.target.name)}
                    onBlur={handleBlur}
                    error={errors.phone}
                    touched={touched.phone}
                    isFocused={focusedField === 'phone'}
                    placeholder="Enter your phone number"
                    required
                />

                <InputField
                    icon={Award}
                    label="Medical License Number"
                    name="medicalLicenseNumber"
                    value={data.medicalLicenseNumber}
                    onChange={(value) => handleChange('medicalLicenseNumber', value)}
                    onFocus={(e) => handleFocus(e.target.name)}
                    onBlur={handleBlur}
                    error={errors.medicalLicenseNumber}
                    touched={touched.medicalLicenseNumber}
                    isFocused={focusedField === 'medicalLicenseNumber'}
                    placeholder="Enter your license number"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    icon={GraduationCap}
                    label="Year of Registration"
                    name="yearOfRegistration"
                    type="number"
                    value={data.yearOfRegistration}
                    onChange={(value) => handleChange('yearOfRegistration', value)}
                    onFocus={(e) => handleFocus(e.target.name)}
                    onBlur={handleBlur}
                    error={errors.yearOfRegistration}
                    touched={touched.yearOfRegistration}
                    isFocused={focusedField === 'yearOfRegistration'}
                    placeholder="Enter registration year"
                    required
                    min="1950"
                    max={new Date().getFullYear()}
                />

                <InputField
                    icon={Award}
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={data.experience}
                    onChange={(value) => handleChange('experience', value)}
                    onFocus={(e) => handleFocus(e.target.name)}
                    onBlur={handleBlur}
                    error={errors.experience}
                    touched={touched.experience}
                    isFocused={focusedField === 'experience'}
                    placeholder="Enter years of experience"
                    required
                    min="0"
                    max="70"
                />
            </div>

            <SelectionGroup
                label="Specializations"
                options={specializationOptions}
                value={data.specializations}
                onChange={(value) => handleChange('specializations', value)}
                error={errors.specializations}
                touched={touched.specializations}
                required
            />

            <SelectionGroup
                label="Languages Spoken"
                options={languageOptions}
                value={data.languages}
                onChange={(value) => handleChange('languages', value)}
                error={errors.languages}
                touched={touched.languages}
                required
            />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <textarea
                        value={data.about}
                        onChange={(e) => handleChange('about', e.target.value)}
                        onFocus={() => handleFocus('about')}
                        onBlur={() => handleBlur('about')}
                        rows={5}
                        className={`
              w-full px-4 py-3 rounded-xl border-2
              transition-colors duration-300
              ${errors.about && touched.about
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                            }
              ${focusedField === 'about' ? 'ring-4 ring-teal-500/20' : ''}
              group-hover:border-gray-300
            `}
                        placeholder="Write a brief professional summary..."
                    />
                    {errors.about && touched.about && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2 mt-2 text-red-500 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.about}</span>
                        </motion.div>
                    )}
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
        input[type="email"],
        input[type="tel"],
        input[type="number"],
        textarea {
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
        </div>
    );
};

export default DoctorBasicInfoStep;
