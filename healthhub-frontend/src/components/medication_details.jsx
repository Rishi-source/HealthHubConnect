import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, ChevronLeft, Activity, Heart,
  Phone, MapPin, AlertCircle, Calendar, Clock,
  Plus, Minus, Check, ArrowRight, Sparkles, X,
  House,
  Building
} from 'lucide-react';

import BasicInfoStep from './basic_information';
import ContactDetailsStep from './contact_detail';
import EmergencyContactStep from './emergency_contact';
import VitalStatsStep from './vital_stats';
import AllergiesStep from './Allergies';
import MedicationsStep from './Medications';
import ReviewStep from './review';

export const FORM_STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    subtitle: 'Let\'s start with your basic details',
    icon: User,
    required: true,
    component: BasicInfoStep,
    validateStep: (data) => {
      return Boolean(
        data.dateOfBirth &&
        data.gender &&
        data.bloodType
      );
    }
  },
  {
    id: 'contact',
    title: 'Adderess Details',
    subtitle: 'How can we reach you?',
    icon: Building,
    required: true,
    component: ContactDetailsStep,
    validateStep: (data) => {
      return Boolean(
        data.address?.street?.trim() &&
        data.address?.city?.trim() &&
        data.address?.country?.trim()
      );
    }
  },
  {
    id: 'emergency-contact',
    title: 'Emergency Contact',
    subtitle: 'Someone we can contact if needed',
    icon: AlertCircle,
    required: false,
    component: EmergencyContactStep,
    validateStep: (data) => {
      const primaryContact = data.emergencyContacts?.[0];
      return Boolean(
        primaryContact?.name?.trim() &&
        primaryContact?.relationship?.trim() &&
        primaryContact?.phone?.trim()
      );
    }
  },
  {
    id: 'vital-stats',
    title: 'Vital Statistics',
    subtitle: 'Your basic health metrics',
    icon: Activity,
    required: false,
    component: VitalStatsStep
  },
  {
    id: 'allergies',
    title: 'Allergies',
    subtitle: 'Any allergies we should know about?',
    icon: AlertCircle,
    required: false,
    component: AllergiesStep
  },
  {
    id: 'current-medications',
    title: 'Current Medications',
    subtitle: 'Medications you\'re currently taking',
    icon: Heart,
    required: false,
    component: MedicationsStep
  },
  {
    id: 'review',
    title: 'Review Profile',
    subtitle: 'Review and confirm your information',
    icon: Check,
    required: true,
    component: ReviewStep
  }
];

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 w-screen h-2 bg-gray-200 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
        initial={{ width: 0 }}
        animate={{
          width: `${(currentStep / (totalSteps - 1)) * 100}%`,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

const StepIndicator = ({ currentStep, step, index, completedSteps, skippedSteps }) => {
  const isActive = currentStep === index;
  const isPassed = currentStep > index;
  const isSkipped = skippedSteps.has(index);
  const isCompleted = completedSteps.has(index);
  const StepIcon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        flex items-center gap-2 py-2 px-4 rounded-lg
        ${isActive ? 'bg-teal-50 text-teal-600' : ''}
        ${isCompleted ? 'text-green-500' : ''}
        ${isSkipped ? 'text-gray-400' : ''}
        ${!isActive && !isCompleted && !isSkipped ? 'text-gray-500' : ''}
        transition-all duration-300 transform hover:scale-105
      `}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`
          w-16 h-8 rounded-full flex items-center justify-center
          ${isActive ? 'bg-teal-500 text-white' : ''}
          ${isCompleted ? 'bg-green-500 text-white' : ''}
          ${isSkipped ? 'bg-gray-200 text-gray-400' : ''}
          ${!isActive && !isCompleted && !isSkipped ? 'bg-gray-100' : ''}
          transition-all duration-300
        `}
      >
        {(isCompleted || (isPassed && !isSkipped)) ? (
          <Check className="w-5 h-5" />
        ) : (
          <StepIcon className="w-5 h-5" />
        )}
      </motion.div>
      <span className="font-medium whitespace-nowrap">{step.title}</span>
    </motion.div>
  );
};

const HealthProfileForm = ({ initialData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('healthProfile');
    return savedData ? JSON.parse(savedData) : {};
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [skippedSteps, setSkippedSteps] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepValidation, setStepValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('healthProfile', JSON.stringify(formData));
  }, [formData]);

  const validateStep = useCallback((stepIndex, data) => {
    const step = FORM_STEPS[stepIndex];
    if (!step.required) return true;
    if (step.validateStep) {
      return step.validateStep(data);
    }
    return true;
  }, []);

  const handleDataChange = useCallback((newData) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      const isValid = validateStep(currentStep, updated);
      setStepValidation(prev => ({ ...prev, [FORM_STEPS[currentStep].id]: isValid }));
      return updated;
    });
  }, [currentStep, validateStep]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      localStorage.setItem('healthProfile', JSON.stringify(formData));

      setSubmitSuccess(true);
      setAlertMessage('Profile created successfully!');
      setShowAlert(true);

      if (typeof onComplete === 'function') {
        await onComplete(formData);
      }

      setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return {
        success: true,
        message: 'Profile created successfully',
        data: formData
      };
    } catch (error) {
      console.error('Error submitting form:', error);
      setAlertMessage(error.message || 'Error submitting form. Please try again.');
      setShowAlert(true);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleNext = () => {
    if (currentStep === FORM_STEPS.length - 1) {
      handleSubmit();
      return;
    }

    const currentStepData = FORM_STEPS[currentStep];
    if (currentStepData.required && !validateStep(currentStep, formData)) {
      setAlertMessage('Please complete all required fields');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => prev + 1);
    setShowAlert(false);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowAlert(false);
    }
  };

  const handleSkip = () => {
    if (!FORM_STEPS[currentStep].required) {
      setSkippedSteps(prev => new Set([...prev, currentStep]));
      handleNext();
    } else {
      setAlertMessage('This step is required and cannot be skipped');
      setShowAlert(true);
    }
  };

  const CurrentStepIcon = FORM_STEPS[currentStep].icon;
  const CurrentStepComponent = FORM_STEPS[currentStep].component;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen min-w-full bg-gradient-to-br from-blue-50 via-teal-50 to-white"
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={FORM_STEPS.length}
      />

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`
              p-4 rounded-xl flex items-center gap-3
              ${submitSuccess
                ? 'bg-green-50 border-2 border-green-300 text-green-600'
                : 'bg-red-50 border-2 border-red-300 text-red-600'}
            `}>
              {submitSuccess
                ? <Check className="w-6 h-6" />
                : <AlertCircle className="w-6 h-6" />
              }
              <span>{alertMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 min-w-max px-4 mx-auto">
          {FORM_STEPS.map((step, index) => (
            <StepIndicator
              key={step.id}
              currentStep={currentStep}
              step={step}
              index={index}
              completedSteps={completedSteps}
              skippedSteps={skippedSteps}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="overflow-x-auto pb-4 mb-8 hide-scrollbar">
          </div>

          <motion.div
            ref={formRef}
            className="bg-white rounded-3xl shadow-xl p-8"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-teal-50 rounded-xl">
                <CurrentStepIcon className="w-8 h-8 text-teal-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {FORM_STEPS[currentStep].title}
                </h2>
                <p className="text-gray-600">
                  {FORM_STEPS[currentStep].subtitle}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CurrentStepComponent
                data={formData}
                onChange={handleDataChange}
                onComplete={handleSubmit} 
                isSubmitting={isSubmitting}
                onEditSection={(sectionId) => {
                  const stepIndex = FORM_STEPS.findIndex(step => step.id === sectionId);
                  if (stepIndex !== -1) {
                    setCurrentStep(stepIndex);
                  }
                }}
                onValidationChange={(isValid) =>
                  setStepValidation(prev => ({
                    ...prev,
                    [FORM_STEPS[currentStep].id]: isValid
                  }))
                }
              />
            </motion.div>

            <motion.div
              className="flex justify-between mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentStep !== FORM_STEPS.length - 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`
        flex items-center gap-2 px-6 py-3 rounded-xl
        ${currentStep === 0
                        ? 'opacity-50 cursor-not-allowed text-gray-400'
                        : 'text-gray-600 hover:bg-gray-50'}
        transition-all duration-300
      `}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </motion.button>

                  <div className="flex gap-4">
                    {!FORM_STEPS[currentStep].required && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSkip}
                        className="px-6 py-3 text-gray-500 hover:bg-gray-50 rounded-xl 
            transition-all duration-300 transform"
                      >
                        Skip for now
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      disabled={FORM_STEPS[currentStep].required && !stepValidation[FORM_STEPS[currentStep].id]}
                      className={`
          flex items-center gap-2 px-6 py-3 rounded-xl
          bg-gradient-to-r from-teal-500 to-blue-500 text-white
          ${(FORM_STEPS[currentStep].required && !stepValidation[FORM_STEPS[currentStep].id])
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-lg transform hover:scale-105'
                        }
        `}
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
@media (max-width: 640px) {
.hide-scrollbar::-webkit-scrollbar {
display: none;
}
.hide-scrollbar {
-ms-overflow-style: none;
scrollbar-width: none;
}
}
`}</style>
    </motion.div>
  );
};

export default HealthProfileForm;