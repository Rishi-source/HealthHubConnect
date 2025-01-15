import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Brain, Award, Star, FileText, 
  Link, Plus, Trash2, X, Clock, DollarSign, 
  Microscope, Sparkles, AlertCircle 
} from 'lucide-react';

const InputField = memo(({
  label,
  value,
  onChange,
  error,
  touched,
  required = false,
  className = '',
  Icon = null,
  multiline = false,
  ...props
}) => {
  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <InputComponent
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 ${Icon ? 'pl-12' : ''}
            rounded-xl border-2 transition-colors duration-300
            ${error && touched
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
            }
            bg-white text-gray-900
            ${className}
          `}
          placeholder={props.placeholder}
          rows={multiline ? 4 : undefined}
          {...props}
        />
        {Icon && (
          <Icon className={`
            absolute left-4 ${multiline ? 'top-4' : 'top-1/2 transform -translate-y-1/2'}
            text-gray-400
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
  );
});

const SpecializationCard = memo(({
  specialization,
  index,
  onUpdate,
  onRemove,
  errors = {},
  touched = {},
  isFirst = false
}) => {
  const handleFileUpload = (file, type) => {
    onUpdate(index, {
      ...specialization,
      [type]: file.name
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-white rounded-xl shadow-sm space-y-6 relative group"
    >
      {!isFirst && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(index)}
          className="absolute -top-2 -right-2 p-2 bg-red-100
            rounded-full text-red-500
            opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
            transition-all duration-300 hover:bg-red-200"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          icon={Stethoscope}
          label="Area of Specialization"
          value={specialization.name}
          onChange={(e) => onUpdate(index, { ...specialization, name: e.target.value })}
          error={errors.name}
          touched={touched.name}
          required={isFirst}
          placeholder="e.g., Cardiology, Neurology"
        />

        <InputField
          icon={Brain}
          label="Sub-specialization"
          value={specialization.subspecialty}
          onChange={(e) => onUpdate(index, { ...specialization, subspecialty: e.target.value })}
          error={errors.subspecialty}
          touched={touched.subspecialty}
          placeholder="e.g., Interventional Cardiology"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          icon={Award}
          label="Years of Experience"
          type="number"
          value={specialization.experience}
          onChange={(e) => onUpdate(index, { ...specialization, experience: e.target.value })}
          error={errors.experience}
          touched={touched.experience}
          required={isFirst}
          min="0"
          max="70"
          placeholder="Years practicing in this field"
        />

        <InputField
          icon={Star}
          label="Expertise Level"
          value={specialization.expertiseLevel}
          onChange={(e) => onUpdate(index, { ...specialization, expertiseLevel: e.target.value })}
          error={errors.expertiseLevel}
          touched={touched.expertiseLevel}
          required={isFirst}
          placeholder="e.g., Expert, Advanced, Intermediate"
        />
      </div>

      <InputField
        icon={FileText}
        label="Description"
        value={specialization.description}
        onChange={(e) => onUpdate(index, { ...specialization, description: e.target.value })}
        error={errors.description}
        touched={touched.description}
        required={isFirst}
        multiline
        placeholder="Describe your expertise and experience in this specialization..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Certification Evidence
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e.target.files[0], 'certification')}
              className="hidden"
              id={`cert-upload-${index}`}
            />
            <label
              htmlFor={`cert-upload-${index}`}
              className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-200
                text-gray-500
                hover:border-teal-500 hover:text-teal-500
                transition-colors duration-300 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload Certificate
            </label>
            {specialization.certification && (
              <span className="text-sm text-gray-500">
                {specialization.certification}
              </span>
            )}
          </div>
        </div>

        <InputField
          icon={Link}
          label="Professional Profile/Research Link"
          value={specialization.profileLink}
          onChange={(e) => onUpdate(index, { ...specialization, profileLink: e.target.value })}
          error={errors.profileLink}
          touched={touched.profileLink}
          placeholder="Link to research papers or professional profile"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-gray-400" />
            Key Procedures & Services
          </h4>
          <button
            type="button"
            onClick={() => {
              const newProcedures = [...(specialization.procedures || []), {
                name: '',
                description: '',
                duration: '',
                cost: ''
              }];
              onUpdate(index, { ...specialization, procedures: newProcedures });
            }}
            className="text-teal-600 hover:text-teal-700
              flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Procedure
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {specialization.procedures?.map((procedure, procIndex) => (
            <motion.div
              key={procIndex}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-gray-50 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <InputField
                  value={procedure.name}
                  onChange={(e) => {
                    const newProcedures = [...specialization.procedures];
                    newProcedures[procIndex] = {
                      ...procedure,
                      name: e.target.value
                    };
                    onUpdate(index, { ...specialization, procedures: newProcedures });
                  }}
                  error={errors?.[`procedures.${procIndex}.name`]}
                  touched={touched?.[`procedures.${procIndex}.name`]}
                  placeholder="Procedure Name"
                  className="flex-1"
                />
                
                <button
                  type="button"
                  onClick={() => {
                    const newProcedures = specialization.procedures.filter((_, i) => i !== procIndex);
                    onUpdate(index, { ...specialization, procedures: newProcedures });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50
                    rounded-lg ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={Clock}
                  value={procedure.duration}
                  onChange={(e) => {
                    const newProcedures = [...specialization.procedures];
                    newProcedures[procIndex] = {
                      ...procedure,
                      duration: e.target.value
                    };
                    onUpdate(index, { ...specialization, procedures: newProcedures });
                  }}
                  error={errors?.[`procedures.${procIndex}.duration`]}
                  touched={touched?.[`procedures.${procIndex}.duration`]}
                  placeholder="Duration (e.g., 1 hour)"
                />

                <InputField
                  icon={DollarSign}
                  value={procedure.cost}
                  onChange={(e) => {
                    const newProcedures = [...specialization.procedures];
                    newProcedures[procIndex] = {
                      ...procedure,
                      cost: e.target.value
                    };
                    onUpdate(index, { ...specialization, procedures: newProcedures });
                  }}
                  error={errors?.[`procedures.${procIndex}.cost`]}
                  touched={touched?.[`procedures.${procIndex}.cost`]}
                  placeholder="Cost (optional)"
                />
              </div>

              <InputField
                multiline
                value={procedure.description}
                onChange={(e) => {
                  const newProcedures = [...specialization.procedures];
                  newProcedures[procIndex] = {
                    ...procedure,
                    description: e.target.value
                  };
                  onUpdate(index, { ...specialization, procedures: newProcedures });
                }}
                error={errors?.[`procedures.${procIndex}.description`]}
                touched={touched?.[`procedures.${procIndex}.description`]}
                placeholder="Brief description of the procedure..."
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

const SpecializationsStep = ({
    data,
    onChange = () => { },
    onValidationChange = () => { }
  }) => {
    // Initialize with default data if none provided
    const defaultSpecialization = {
      name: '',
      subspecialty: '',
      experience: '',
      expertiseLevel: '',
      description: '',
      certification: '',
      profileLink: '',
      procedures: []
    };
  
    const [formData, setFormData] = useState(() => ({
      specializations: data?.specializations?.length > 0 
        ? data.specializations 
        : [defaultSpecialization]
    }));
  
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [validationMessage, setValidationMessage] = useState(null);
    
// Prepare data for API payload
const preparePayload = (specializations) => {
    return {
      specializations: specializations.map(spec => ({
        name: spec.name?.trim(),
        subspecialty: spec.subspecialty?.trim() || null,
        experience: parseInt(spec.experience) || 0,
        expertiseLevel: spec.expertiseLevel?.trim(),
        description: spec.description?.trim(),
        certification: spec.certification || null,
        profileLink: spec.profileLink?.trim() || null,
        procedures: (spec.procedures || []).map(proc => ({
          name: proc.name?.trim(),
          description: proc.description?.trim(),
          duration: proc.duration?.trim(),
          cost: proc.cost?.trim() || null
        })).filter(proc => proc.name) // Only include procedures with names
      }))
    };
  };

  const handleSpecializationUpdate = (index, updatedSpecialization) => {
    const newSpecializations = [...formData.specializations];
    newSpecializations[index] = updatedSpecialization;

    const newData = {
        ...formData,
        specializations: newSpecializations
    };

    setFormData(newData);
    
    // Mark fields as touched
    setTouched(prev => ({
        ...prev,
        [index]: true,
        name: true,
        experience: true,
        expertiseLevel: true,
        description: true
    }));

    // Validate and prepare payload
    const isValid = validateForm(newSpecializations);
    const payload = preparePayload(newSpecializations);

    console.log('Specialization Update:', { 
        raw: newData,
        payload,
        isValid
    });

    // Send structured data to parent
    onChange({
        raw: newData,
        payload,
        isValid
    });
};
  
  const validateSpecialization = (specialization, index, isPrimary = false) => {
    const errors = {};
    
    if (isPrimary) {
      if (!specialization.name?.trim()) {
        errors.name = 'Specialization name is required';
      }
      if (!specialization.experience) {
        errors.experience = 'Years of experience is required';
      } else {
        const exp = parseInt(specialization.experience);
        if (isNaN(exp) || exp < 0 || exp > 70) {
          errors.experience = 'Invalid years of experience (0-70)';
        }
      }
      if (!specialization.expertiseLevel?.trim()) {
        errors.expertiseLevel = 'Expertise level is required';
      }
      if (!specialization.description?.trim()) {
        errors.description = 'Description is required';
      }
    }

    // Validate procedures if any exist
    specialization.procedures?.forEach((procedure, procIndex) => {
      if (procedure.name?.trim()) {
        if (!procedure.duration?.trim()) {
          errors[`procedures.${procIndex}.duration`] = 'Duration is required';
        }
        if (!procedure.description?.trim()) {
          errors[`procedures.${procIndex}.description`] = 'Description is required';
        }
      }
    });

    // Validate URL if provided
    if (specialization.profileLink?.trim()) {
      try {
        new URL(specialization.profileLink);
      } catch (_) {
        errors.profileLink = 'Please enter a valid URL';
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const validateForm = (specializations) => {
    if (!Array.isArray(specializations) || specializations.length === 0) {
      return false;
    }

    const newErrors = {};
    let hasErrors = false;

    specializations.forEach((specialization, index) => {
      const specializationErrors = validateSpecialization(
        specialization,
        index,
        index === 0 // Primary specialization
      );

      if (specializationErrors) {
        newErrors[index] = specializationErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    
    if (hasErrors) {
      setValidationMessage('Please complete all required fields');
      onValidationChange(false);
      return false;
    }

    setValidationMessage(null);
    onValidationChange(true);
    return true;
  };

  const handleSpecializationRemove = (index) => {
    if (index === 0) return; // Don't remove primary specialization

    const newSpecializations = formData.specializations.filter((_, i) => i !== index);
    const newData = {
      specializations: newSpecializations
    };

    setFormData(newData);
    const isValid = validateForm(newSpecializations);
    onChange(newData, isValid);
  };

  // Initialize validation on mount and when data changes
  useEffect(() => {
    if (formData?.specializations?.length > 0) {
      validateForm(formData.specializations);
    }
  }, [formData]);

const calculateTotalProcedures = () => {
  if (!Array.isArray(formData?.specializations)) return 0;
  return formData.specializations.reduce((total, spec) => {
    return total + (Array.isArray(spec?.procedures) ? spec.procedures.length : 0);
  }, 0);
};

return (
  <div className="space-y-8">
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-teal-500" />
        Medical Specializations & Services
      </h3>
      <p className="text-gray-500">
        Detail your areas of expertise, certifications, and specialized procedures.
      </p>
    </div>

    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {Array.isArray(formData?.specializations) && formData.specializations.map((specialization, index) => (
          <SpecializationCard
            key={index}
            specialization={specialization}
            index={index}
            onUpdate={handleSpecializationUpdate}
            onRemove={handleSpecializationRemove}
            errors={errors[index] || {}}
            touched={touched}
            isFirst={index === 0}
          />
        ))}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          const newSpecializations = [
            ...formData.specializations,
            {
              name: '',
              subspecialty: '',
              experience: '',
              expertiseLevel: '',
              description: '',
              certification: '',
              profileLink: '',
              procedures: []
            }
          ];
          const newFormData = {
            ...formData,
            specializations: newSpecializations
          };
          setFormData(newFormData);
          onChange(newFormData);
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200
          text-gray-500
          hover:text-teal-500 hover:border-teal-500
          transition-all duration-300 flex items-center justify-center gap-2
          group"
      >
        <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
        Add Another Specialization
      </motion.button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Brain className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Areas of Expertise
            </h3>
            <p className="text-sm text-gray-500">
              {formData.specializations?.length || 0} specialization(s)
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Microscope className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Available Procedures
            </h3>
            <p className="text-sm text-gray-500">
              {calculateTotalProcedures()} procedure(s) listed
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Award className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Primary Experience
            </h3>
            <p className="text-sm text-gray-500">
              {formData.specializations[0]?.experience || 0} years in {formData.specializations[0]?.name || 'practice'}
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
          className="flex items-center gap-2 text-amber-600 bg-amber-50 
            p-4 rounded-xl shadow-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="bg-white">
      <h4 className="font-medium flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" />
        Expertise Summary
      </h4>

      <div className="space-y-4">
      {Array.isArray(formData?.specializations) && formData.specializations.map((spec, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 rounded-lg space-y-2"
        >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {index === 0 && (
                  <div className="p-1 bg-teal-100 rounded">
                    <Star className="w-4 h-4 text-teal-500" />
                  </div>
                )}
                <h5 className="font-medium text-gray-900">
                  {spec.name || 'Specialization Name'}
                </h5>
              </div>
              <span className="text-sm text-gray-500">
                {spec.expertiseLevel || 'Expertise Level'}
              </span>
            </div>

            {spec.procedures?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {spec.procedures.map((proc, procIndex) => (
                  <span
                    key={procIndex}
                    className="px-3 py-1 bg-teal-50 
                      text-teal-600 rounded-full text-sm"
                  >
                    {proc.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <style jsx global>{`
      @media (max-width: 640px) {
        input[type="text"],
        input[type="number"],
        input[type="url"],
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

export default SpecializationsStep;