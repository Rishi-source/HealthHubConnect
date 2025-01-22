import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  User, GraduationCap, Building, Stethoscope, Clock, ShieldCheck, 
  Save, Check, ChevronRight, ChevronLeft, Lock, Settings, AlertCircle,
  Shield, Bell, Camera, Zap, KeySquare, UserCog, ChevronDown
} from 'lucide-react';

import DoctorBasicInfoStep from '../Profile/DoctorBasicInfoStep';
import QualificationsStep from '../Profile/QualificationsStep';
import PracticeDetailsStep from '../Profile/PracticeDetailsStep';
import SpecializationsStep from '../Profile/SpecializationsStep';
import ScheduleManager from '../Profile/TimeSlot';
import PatientPoliciesStep from '../Profile/PatientPoliciesStep';

const BlurredBackground = () => (
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
    <div className="absolute top-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
  </div>
);

const ProgressRing = ({ progress }) => (
  <div className="relative h-20 w-20">
    <svg className="transform -rotate-90 w-20 h-20">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        className="text-gray-200"
      />
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        strokeDasharray={`${2 * Math.PI * 36}`}
        strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress)}`}
        className="text-teal-500 transition-all duration-1000 ease-out"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-xl font-bold text-gray-700">{Math.round(progress * 100)}%</span>
    </div>
  </div>
);

const steps = [
  {
    id: 'basicInfo',
    title: 'Basic Information',
    icon: User,
    component: DoctorBasicInfoStep,
    description: 'Personal and contact details'
  },
  {
    id: 'qualifications',
    title: 'Qualifications',
    icon: GraduationCap,
    component: QualificationsStep,
    description: 'Educational background and certifications'
  },
  {
    id: 'practiceDetails',
    title: 'Practice Details',
    icon: Building,
    component: PracticeDetailsStep,
    description: 'Clinic and practice information'
  },
  {
    id: 'specializations',
    title: 'Specializations',
    icon: Stethoscope,
    component: SpecializationsStep,
    description: 'Areas of expertise and services'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    icon: Clock,
    component: ScheduleManager,
    description: 'Availability and working hours'
  },
  {
    id: 'policies',
    title: 'Patient Policies',
    icon: ShieldCheck,
    component: PatientPoliciesStep,
    description: 'Terms and guidelines for patients'
  }
];

const EditProfile = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = {
          basicInfo: {
            fullName: 'Dr. John Smith',
            email: 'john.smith@example.com',
            phone: '1234567890',
          },
        };
        setFormData(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setFormError('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleStepChange = (data) => {
    setFormData(prev => ({
      ...prev,
      [steps[currentStep].id]: data
    }));
  };

  const handleStepValidation = (isValid) => {
    setStepValidation(prev => ({
      ...prev,
      [steps[currentStep].id]: isValid
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setFormError(null);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setFormError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const completionProgress = Object.values(stepValidation).filter(Boolean).length / steps.length;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center relative">
        <BlurredBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center z-10"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-ring rounded-full" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto" />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            Loading your profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50/50 relative"
    >
      <BlurredBackground />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-teal-50 rounded-xl"
              >
                <UserCog className="w-8 h-8 text-teal-600" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="text-3xl font-bold text-gray-800"
                >
                  Profile Settings
                </motion.h1>
                <p className="text-gray-500 mt-1">Manage your professional profile and settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ProgressRing progress={completionProgress} />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-teal-500 text-white rounded-xl
                  shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30
                  transition-all duration-300 flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>

        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-80 space-y-4"
          >
            <LayoutGroup>
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = stepValidation[step.id];
                
                return (
                  <motion.div
                    key={step.id}
                    layout
                    onClick={() => setCurrentStep(index)}
                    className={`
                      cursor-pointer rounded-xl border transition-all duration-300
                      ${isActive 
                        ? 'bg-white border-teal-200 shadow-lg shadow-teal-500/10' 
                        : 'bg-white border-gray-200 hover:border-teal-200'
                      }
                    `}
                  >
                    <motion.div 
                      layout
                      className="p-4 flex items-start gap-4"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`
                          p-2 rounded-lg shrink-0
                          ${isActive ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}
                          ${isCompleted && !isActive ? 'bg-green-500 text-white' : ''}
                        `}
                      >
                        {isCompleted && !isActive ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${isActive ? 'text-teal-600' : 'text-gray-700'}`}>
                            {step.title}
                          </p>
                          <ChevronRight className={`w-5 h-5 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </LayoutGroup>

            <motion.div
              layout
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeySquare className="w-5 h-5" />
                  <h3 className="font-medium">Account Security</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenSection(openSection === 'security' ? null : 'security')}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSection === 'security' ? 'rotate-180' : ''
                    }`} 
                  />
                </motion.button>
              </div>

              <AnimatePresence>
                {openSection === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {[
                      { text: 'Change Password', icon: Lock },
                      { text: 'Two-Factor Authentication', icon: Shield },
                      { text: 'Login History', icon: Clock }
                    ].map((item, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: 4 }}
                        className="w-full py-2 px-3 flex items-center gap-3 text-sm
                          bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.text}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div
              layout
              className="bg-white rounded-2xl shadow-lg border border-gray-200"
            >
              <motion.div 
                className="p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {React.createElement(steps[currentStep].component, {
                      data: formData[steps[currentStep].id],
                      onChange: handleStepChange,
                      onValidationChange: handleStepValidation
                    })}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <motion.div 
                layout
                className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-2xl"
              >
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className={`
                    px-6 py-3 rounded-xl flex items-center gap-2 font-medium
                    transition-all duration-300
                    ${currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }
                  `}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {currentStep < steps.length - 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl
                      hover:bg-teal-600 shadow-lg shadow-teal-500/20
                      hover:shadow-xl hover:shadow-teal-500/30
                      transition-all duration-300 flex items-center gap-2"
                  >
                    Next Step
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl
                      hover:bg-teal-600 shadow-lg shadow-teal-500/20
                      hover:shadow-xl hover:shadow-teal-500/30
                      transition-all duration-300 flex items-center gap-2
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save All Changes
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600
                    border border-red-100 shadow-lg shadow-red-500/5"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </motion.div>
              )}
              {showSaveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 p-4 bg-green-50 rounded-xl flex items-center gap-3 text-green-600
                    border border-green-100 shadow-lg shadow-green-500/5"
                >
                  <Check className="w-5 h-5 shrink-0" />
                  <span>Changes saved successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.1); }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @media (max-width: 640px) {
          .max-w-7xl {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default EditProfile;