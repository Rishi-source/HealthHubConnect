import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, GraduationCap, Building, Stethoscope,
    Clock, ShieldCheck, ClipboardCheck, AlertCircle,
    ChevronRight, ChevronLeft, Check, Save
} from 'lucide-react';

import DoctorBasicInfoStep from './DoctorBasicInfoStep';
import QualificationsStep from './QualificationsStep';
import PracticeDetailsStep from './PracticeDetailsStep';
import SpecializationsStep from './SpecializationsStep';
import ScheduleManager from './TimeSlot';
import PatientPoliciesStep from './PatientPoliciesStep';
import ReviewStep from './ReviewStep';

const steps = [
    {
        id: 'basicInfo',
        title: 'Basic Information',
        icon: User,
        component: DoctorBasicInfoStep
    },
    {
        id: 'qualifications',
        title: 'Qualifications',
        icon: GraduationCap,
        component: QualificationsStep
    },
    {
        id: 'practiceDetails',
        title: 'Practice Details',
        icon: Building,
        component: PracticeDetailsStep
    },
    {
        id: 'specializations',
        title: 'Specializations',
        icon: Stethoscope,
        component: SpecializationsStep
    },
    {
        id: 'schedule',
        title: 'Schedule',
        icon: Clock,
        component: ScheduleManager
    },
    {
        id: 'policies',
        title: 'Patient Policies',
        icon: ShieldCheck,
        component: PatientPoliciesStep
    },
    {
        id: 'review',
        title: 'Review',
        icon: ClipboardCheck,
        component: ReviewStep
    }
];

const DoctorProfileForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({

        basicInfo: {},
        qualifications: {},
        practiceDetails: {},
        specializations: {},
        schedule: {},
        policies: {}
    });
    const [stepValidation, setStepValidation] = useState({
        basicInfo: false,
        qualifications: false,
        practiceDetails: false,
        specializations: false,
        schedule: false,
        policies: false
    });
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionData, setSubmissionData] = useState({});

    const CurrentStepComponent = steps[currentStep].component;

    const handleStepChange = (data) => {
        const stepId = steps[currentStep].id;
        console.log('Step Change Data:', data); 
    
        if (stepId === 'specializations') {
            if (data.raw) {
                setFormData(prev => ({
                    ...prev,
                    specializations: {
                        specializations: data.raw.specializations || []
                    }
                }));
    
                setSubmissionData(prev => ({
                    ...prev,
                    specializations: {
                        specializations: data.payload?.specializations || []
                    }
                }));
    
                setStepValidation(prev => ({
                    ...prev,
                    specializations: data.isValid
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [stepId]: data
            }));
    
            const isValid = Boolean(
                data && 
                (typeof data === 'object' ? Object.keys(data).length > 0 : true)
            );
            
            setStepValidation(prev => ({
                ...prev,
                [stepId]: isValid
            }));
        }
    
        if (formError) {
            setFormError(null);
        }
    };
    
    
    const validateCurrentStep = () => {
        const currentStepId = steps[currentStep].id;
        return stepValidation[currentStepId];
    };
            
    const goToNext = () => {
        const currentStepId = steps[currentStep].id;
        
        if (!stepValidation[currentStepId] && currentStepId !== 'review') {
            setFormError('Please complete all required fields before proceeding');
            return;
        }

        if (currentStep < steps.length - 1) {
            setFormError(null);
            setCurrentStep(prev => prev + 1);
        }
    };
            
    const goToPrevious = () => {
        if (currentStep > 0) {
            setFormError(null);
            setCurrentStep(prev => prev - 1);
        }
    };

    const goToStep = (index) => {
        if (index >= 0 && index < steps.length) {
            if (index > currentStep && !validateCurrentStep()) {
                setFormError('Please complete current step before proceeding');
                return;
            }
            setCurrentStep(index);
            setFormError(null);
        }
    };

    const preparePayload = () => {
        const specializationsData = submissionData.specializations || formData.specializations;

        return {
            ...formData,
            specializations: specializationsData,
            basicInfo: {
                ...formData.basicInfo,
                email: formData.basicInfo?.email?.toLowerCase().trim(),
                fullName: formData.basicInfo?.fullName?.trim(),
                specializations: formData.basicInfo?.specializations || [],
                languages: formData.basicInfo?.languages || [],
                yearOfRegistration: parseInt(formData.basicInfo?.yearOfRegistration),
                experience: parseInt(formData.basicInfo?.experience)
            },
            qualifications: {
                degrees: (formData.qualifications?.degrees || []).map(degree => ({
                    ...degree,
                    year: parseInt(degree.year)
                })),
                certifications: (formData.qualifications?.certifications || []).map(cert => ({
                    ...cert,
                    year: parseInt(cert.year),
                    expiryYear: cert.expiryYear ? parseInt(cert.expiryYear) : null
                }))
            },
            practiceDetails: {
                ...formData.practiceDetails,
                consultationTypes: {
                    online: {
                        ...formData.practiceDetails?.consultationTypes?.online,
                        fee: parseFloat(formData.practiceDetails?.consultationTypes?.online?.fee || 0),
                        duration: parseInt(formData.practiceDetails?.consultationTypes?.online?.duration || 0)
                    },
                    inPerson: {
                        ...formData.practiceDetails?.consultationTypes?.inPerson,
                        fee: parseFloat(formData.practiceDetails?.consultationTypes?.inPerson?.fee || 0),
                        duration: parseInt(formData.practiceDetails?.consultationTypes?.inPerson?.duration || 0)
                    }
                }
            },
            
            schedule: formData.schedule,
            policies: {
                ...formData.policies,
                cancellationFee: parseFloat(formData.policies?.cancellationFee || 0),
                noShowFee: parseFloat(formData.policies?.noShowFee || 0)
            }
        };
    };

    const handleSubmit = async () => {
        const isValid = Object.values(stepValidation).every(valid => valid);
        if (!isValid) {
            setFormError('Please complete all required steps before submitting');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const payload = preparePayload();
            console.log('Submitting profile data:', payload);

            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save profile');
            }

            const result = await response.json();
            console.log('Profile saved successfully:', result);

            
            alert('Profile saved successfully!');
            
            
            

        } catch (error) {
            console.error('Error saving profile:', error);
            setFormError(error.message || 'An error occurred while saving your profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = stepValidation[step.id];
                        const showLine = index < steps.length - 1;

                        return (
                            <React.Fragment key={step.id}>
                                <button
                                    onClick={() => {
                                        if (isCompleted || index <= currentStep) {
                                            goToStep(index);
                                        }
                                    }}
                                    className={`
                                        relative z-10 flex flex-col items-center gap-2
                                        ${index <= currentStep || isCompleted
                                            ? 'cursor-pointer'
                                            : 'cursor-not-allowed opacity-50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        transition-colors duration-300
                                        ${isActive
                                            ? 'bg-teal-500 text-white'
                                            : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }
                                    `}>
                                        {isCompleted ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <StepIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span className={`
                                        text-sm font-medium whitespace-nowrap
                                        ${isActive ? 'text-teal-600' : 'text-gray-500'}
                                    `}>
                                        {step.title}
                                    </span>
                                </button>
                                {showLine && (
                                    <div className={`
                                        flex-1 h-px mx-4
                                        ${index < currentStep || (index === currentStep && isCompleted)
                                            ? 'bg-green-500'
                                            : 'bg-gray-200'
                                        }
                                    `} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {formError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{formError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

<div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
    <div className="p-6">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                {currentStep === steps.length - 1 ? (
                    <ReviewStep
                        data={{
                            ...formData,
                            specializations: {
                                specializations: submissionData.specializations?.specializations || 
                                               formData.specializations?.specializations || []
                            }
                        }}
                        onEditSection={(sectionId) => {
                            const stepIndex = steps.findIndex(step => step.id === sectionId);
                            if (stepIndex !== -1) {
                                goToStep(stepIndex);
                            }
                        }}
                        validationStatus={stepValidation}
                    />
                ) : (
                    <CurrentStepComponent
                        data={formData[steps[currentStep].id]}
                        onChange={handleStepChange}
                        onValidationChange={(isValid) => {
                            setStepValidation(prev => ({
                                ...prev,
                                [steps[currentStep].id]: isValid
                            }));
                        }}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    </div>
</div> 
            <div className="flex items-center justify-between">
                <button
                    onClick={goToPrevious}
                    disabled={currentStep === 0}
                    className={`
                        px-6 py-3 rounded-xl flex items-center gap-2
                        transition-colors duration-300
                        ${currentStep === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                    `}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                <div className="flex items-center gap-3">
                    {currentStep === steps.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-green-500 text-white rounded-xl
                                hover:bg-green-600 transition-colors duration-300
                                flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={goToNext}
                            className="px-6 py-3 bg-teal-500 text-white rounded-xl
                                hover:bg-teal-600 transition-colors duration-300
                                flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfileForm;