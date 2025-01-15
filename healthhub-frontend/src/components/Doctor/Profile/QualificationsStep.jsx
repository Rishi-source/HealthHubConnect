import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Award, FileText, Plus, X, Book,
  Building, Calendar, AlertCircle, Sparkles
} from 'lucide-react';

const DynamicInput = memo(({
  icon: Icon,
  label,
  items = [],
  onAdd,
  onRemove,
  onUpdate,
  error,
  touched,
  required = false,
  addButtonText = "Add Another",
  renderFields
}) => (
    
  <div className="space-y-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>

    <AnimatePresence mode="popLayout">
      {items.map((item, index) => (
        <motion.div
          key={index}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative p-6 bg-gray-50 rounded-xl space-y-4 group"
        >
          {index > 0 && (
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
          
          {renderFields(item, index)}
        </motion.div>
      ))}
    </AnimatePresence>

    <motion.button
      type="button"
      onClick={onAdd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200
        text-gray-500 hover:text-teal-500 hover:border-teal-500
        transition-all duration-300 flex items-center justify-center gap-2
        group hover:bg-teal-50/50"
    >
      <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
      {addButtonText}
    </motion.button>

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

const InputField = memo(({
  value = '',
  onChange,
  placeholder,
  type = 'text',
  className = '',
  ...props
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`
      w-full px-4 py-3 rounded-xl border-2 border-gray-200
      focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20
      transition-all duration-300
      ${className}
    `}
    placeholder={placeholder}
    {...props}
  />
));

const QualificationsStep = ({
    data = {
      degrees: [],
      certifications: [],
      specializations: [],
      trainings: []
    },
    onChange = () => { },
    onValidationChange = () => { }
  }) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [validationMessage, setValidationMessage] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);
  
    const getDefaultDegree = () => ({
      name: '',
      university: '',
      year: '',
      country: ''
    });
  
    const getDefaultCertification = () => ({
      name: '',
      issuingBody: '',
      year: '',
      expiryYear: '',
      certificationNumber: ''
    });
  
    const getDefaultSpecialization = () => ({
      area: '',
      institution: '',
      year: '',
      duration: ''
    });
  
    const getDefaultTraining = () => ({
      title: '',
      organization: '',
      year: '',
      duration: '',
      description: ''
    });
  
    useEffect(() => {
        if (!data.degrees || data.degrees.length === 0) {
          handleChange('degrees', [getDefaultDegree()]);
        }
        validateForm(data);
      }, []);
      
      const handleSectionAddition = (sectionKey, defaultItemGenerator) => {
        const currentItems = data[sectionKey] || [];
        const newItems = [...currentItems, defaultItemGenerator()];
        handleChange(sectionKey, newItems);
      };
    
  const validateField = (type, items) => {
    if (!Array.isArray(items)) {
      return 'Invalid data format';
    }

    // Primary degree is mandatory
    if (type === 'degrees') {
      if (items.length === 0) {
        return 'At least one degree is required';
      }

      const primaryDegree = items[0];
      if (!primaryDegree.name?.trim()) {
        return 'Degree name is required';
      }
      if (!primaryDegree.university?.trim()) {
        return 'University is required';
      }
      if (!primaryDegree.year) {
        return 'Year of completion is required';
      }
      if (!primaryDegree.country?.trim()) {
        return 'Country is required';
      }

      const year = parseInt(primaryDegree.year);
      if (isNaN(year) || year < 1950 || year > new Date().getFullYear()) {
        return 'Invalid year of completion';
      }
    }

    // Validate all items in the array
    for (const item of items) {
      if (type === 'certifications' && item.name) {
        if (!item.issuingBody?.trim()) {
          return 'Issuing body is required for certifications';
        }
        if (item.expiryYear && parseInt(item.expiryYear) <= new Date().getFullYear()) {
          return 'Expiry year must be in the future';
        }
      }

      if (type === 'specializations' && item.area) {
        if (!item.institution?.trim()) {
          return 'Institution is required for specializations';
        }
        if (!item.duration?.trim()) {
          return 'Duration is required for specializations';
        }
      }

      if (type === 'trainings' && item.title) {
        if (!item.organization?.trim()) {
          return 'Organization is required for trainings';
        }
        if (!item.duration?.trim()) {
          return 'Duration is required for trainings';
        }
      }

      // Validate year field for all types
      if (item.year) {
        const year = parseInt(item.year);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
          return 'Invalid year';
        }
      }
    }

    return null;
  };

  const handleChange = (field, value) => {
    // Ensure value is an array and clean the data
    const cleanedValue = Array.isArray(value) ? value.map(item => {
      const cleaned = {};
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'string') {
          cleaned[key] = item[key].trim();
        } else {
          cleaned[key] = item[key];
        }
      });
      return cleaned;
    }) : [];

    const newData = {
      ...data,
      [field]: cleanedValue
    };

    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    onChange(newData);
    validateForm(newData);
  };



  const validateForm = (formData) => {
    const newErrors = {};
    let hasErrors = false;

    // Validate each section
    ['degrees', 'certifications', 'specializations', 'trainings'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    const valid = !hasErrors;
    setIsFormValid(valid);
    onValidationChange(valid);

    setValidationMessage(
      hasErrors ? 'Please complete all required fields correctly' : null
    );

    return valid;
  };
  
  const preparePayload = () => {
    return {
      degrees: data.degrees.map(degree => ({
        name: degree.name.trim(),
        university: degree.university.trim(),
        year: parseInt(degree.year),
        country: degree.country.trim()
      })),
      certifications: data.certifications.map(cert => ({
        name: cert.name.trim(),
        issuingBody: cert.issuingBody.trim(),
        year: parseInt(cert.year),
        expiryYear: cert.expiryYear ? parseInt(cert.expiryYear) : null,
        certificationNumber: cert.certificationNumber.trim()
      })),
      specializations: data.specializations.map(spec => ({
        area: spec.area.trim(),
        institution: spec.institution.trim(),
        year: parseInt(spec.year),
        duration: spec.duration.trim()
      })),
      trainings: data.trainings.map(training => ({
        title: training.title.trim(),
        organization: training.organization.trim(),
        year: parseInt(training.year),
        duration: training.duration.trim(),
        description: training.description.trim()
      }))
    };
  };

  return (
    <div className="space-y-8">
      <DynamicInput
        label="Educational Degrees"
        items={data.degrees}
        onAdd={() => handleSectionAddition('degrees', getDefaultDegree)}
        onRemove={(index) => {
          // Prevent removing the first degree
          if (data.degrees.length > 1) {
            const newDegrees = data.degrees.filter((_, i) => i !== index);
            handleChange('degrees', newDegrees);
          }
        }}
        error={errors.degrees}
        touched={touched.degrees}
        required
        addButtonText="Add Another Degree"
        renderFields={(degree, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              value={degree.name}
              onChange={(e) => {
                const newDegrees = [...data.degrees];
                newDegrees[index] = { ...degree, name: e.target.value };
                handleChange('degrees', newDegrees);
              }}
              placeholder="Degree Name (e.g. MBBS, MD)"
            />
            <InputField
              value={degree.university}
              onChange={(e) => {
                const newDegrees = [...data.degrees];
                newDegrees[index] = { ...degree, university: e.target.value };
                handleChange('degrees', newDegrees);
              }}
              placeholder="University/Institution"
            />
            <InputField
              type="number"
              value={degree.year}
              onChange={(e) => {
                const newDegrees = [...data.degrees];
                newDegrees[index] = { ...degree, year: e.target.value };
                handleChange('degrees', newDegrees);
              }}
              placeholder="Year of Completion"
              min="1950"
              max={new Date().getFullYear()}
            />
            <InputField
              value={degree.country}
              onChange={(e) => {
                const newDegrees = [...data.degrees];
                newDegrees[index] = { ...degree, country: e.target.value };
                handleChange('degrees', newDegrees);
              }}
              placeholder="Country"
            />
          </div>
        )}
      />

<DynamicInput
        label="Professional Certifications"
        items={data.certifications}
        onAdd={() => handleSectionAddition('certifications', getDefaultCertification)}
        onRemove={(index) => {
          const newCerts = data.certifications.filter((_, i) => i !== index);
          handleChange('certifications', newCerts);
        }}
        error={errors.certifications}
        touched={touched.certifications}
        addButtonText="Add Another Certification"
        renderFields={(cert, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              value={cert.name}
              onChange={(e) => {
                const newCerts = [...data.certifications];
                newCerts[index] = { ...cert, name: e.target.value };
                handleChange('certifications', newCerts);
              }}
              placeholder="Certification Name"
            />
            <InputField
              value={cert.issuingBody}
              onChange={(e) => {
                const newCerts = [...data.certifications];
                newCerts[index] = { ...cert, issuingBody: e.target.value };
                handleChange('certifications', newCerts);
              }}
              placeholder="Issuing Organization"
            />
            <InputField
              value={cert.certificationNumber}
              onChange={(e) => {
                const newCerts = [...data.certifications];
                newCerts[index] = { ...cert, certificationNumber: e.target.value };
                handleChange('certifications', newCerts);
              }}
              placeholder="Certification Number"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                type="number"
                value={cert.year}
                onChange={(e) => {
                  const newCerts = [...data.certifications];
                  newCerts[index] = { ...cert, year: e.target.value };
                  handleChange('certifications', newCerts);
                }}
                placeholder="Issue Year"
                min="1950"
                max={new Date().getFullYear()}
              />
              <InputField
                type="number"
                value={cert.expiryYear}
                onChange={(e) => {
                  const newCerts = [...data.certifications];
                  newCerts[index] = { ...cert, expiryYear: e.target.value };
                  handleChange('certifications', newCerts);
                }}
                placeholder="Expiry Year"
                min={new Date().getFullYear()}
              />
            </div>
          </div>
        )}
      />

<DynamicInput
        label="Specialized Training"
        items={data.specializations}
        onAdd={() => handleSectionAddition('specializations', getDefaultSpecialization)}
        onRemove={(index) => {
          const newSpecs = data.specializations.filter((_, i) => i !== index);
          handleChange('specializations', newSpecs);
        }}
        error={errors.specializations}
        touched={touched.specializations}
        addButtonText="Add Another Specialization"
        renderFields={(spec, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              value={spec.area}
              onChange={(e) => {
                const newSpecs = [...data.specializations];
                newSpecs[index] = { ...spec, area: e.target.value };
                handleChange('specializations', newSpecs);
              }}
              placeholder="Area of Specialization"
            />
            <InputField
              value={spec.institution}
              onChange={(e) => {
                const newSpecs = [...data.specializations];
                newSpecs[index] = { ...spec, institution: e.target.value };
                handleChange('specializations', newSpecs);
              }}
              placeholder="Training Institution"
            />
            <InputField
              type="number"
              value={spec.year}
              onChange={(e) => {
                const newSpecs = [...data.specializations];
                newSpecs[index] = { ...spec, year: e.target.value };
                handleChange('specializations', newSpecs);
              }}
              placeholder="Year Completed"
              min="1950"
              max={new Date().getFullYear()}
            />
            <InputField
              value={spec.duration}
              onChange={(e) => {
                const newSpecs = [...data.specializations];
                newSpecs[index] = { ...spec, duration: e.target.value };
                handleChange('specializations', newSpecs);
              }}
              placeholder="Duration (e.g. 2 years)"
            />
          </div>
        )}
      />

<DynamicInput
        label="Additional Training & Workshops"
        items={data.trainings}
        onAdd={() => handleSectionAddition('trainings', getDefaultTraining)}
        onRemove={(index) => {
          const newTrainings = data.trainings.filter((_, i) => i !== index);
          handleChange('trainings', newTrainings);
        }}
        error={errors.trainings}
        touched={touched.trainings}
        addButtonText="Add Another Training"
        renderFields={(training, index) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                value={training.title}
                onChange={(e) => {
                  const newTrainings = [...data.trainings];
                  newTrainings[index] = { ...training, title: e.target.value };
                  handleChange('trainings', newTrainings);
                }}
                placeholder="Training Title"
              />
              <InputField
                value={training.organization}
                onChange={(e) => {
                  const newTrainings = [...data.trainings];
                  newTrainings[index] = { ...training, organization: e.target.value };
                  handleChange('trainings', newTrainings);
                }}
                placeholder="Organization"
              />
              <InputField
                type="number"
                value={training.year}
                onChange={(e) => {
                  const newTrainings = [...data.trainings];
                  newTrainings[index] = { ...training, year: e.target.value };
                  handleChange('trainings', newTrainings);
                }}
                placeholder="Year"
                min="1950"
                max={new Date().getFullYear()}
              />
              <InputField
                value={training.duration}
                onChange={(e) => {
                  const newTrainings = [...data.trainings];
                  newTrainings[index] = { ...training, duration: e.target.value };
                  handleChange('trainings', newTrainings);
                }}
                placeholder="Duration (e.g. 6 months)"
              />
            </div>
            <textarea
              value={training.description}
              onChange={(e) => {
                const newTrainings = [...data.trainings];
                newTrainings[index] = { ...training, description: e.target.value };
                handleChange('trainings', newTrainings);
              }}
              placeholder="Brief description of the training..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20
                transition-all duration-300"
            />
          </div>
        )}
      />

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

      {/* Card showing completion status */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${Object.keys(errors).length === 0
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-200 text-gray-500'
            }`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Qualifications Summary</h3>
              <p className="text-sm text-gray-500">
                {Object.keys(errors).length === 0
                  ? 'All required information completed'
                  : 'Some required information is missing'}
              </p>
            </div>
          </div>
          {Object.keys(errors).length === 0 && (
            <Sparkles className="w-5 h-5 text-green-500" />
          )}
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

export default QualificationsStep;