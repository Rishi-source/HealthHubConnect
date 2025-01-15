import React, { useState } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Mail, Camera, ChevronRight, ChevronLeft,
  Activity, Shield, Heart, AlertCircle, Building, FileText,
  ArrowLeft, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import BasicInfoStep from '../Health Profile/basic_information';
import ContactDetailsStep from '../Health Profile/contact_detail';
import EmergencyContactStep from '../Health Profile/emergency_contact';
import VitalStatsStep from '../Health Profile/vital_stats';
import AllergiesStep from '../Health Profile/Allergies';
import MedicationsStep from '../Health Profile/Medications';

const InputField = ({
  icon: Icon,
  label,
  type = "text",
  value = '',
  onChange,
  error,
  required = false,
  ...props
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`
            w-full px-4 py-3 pl-12 rounded-lg border
            transition-colors duration-300 bg-gray-50 dark:bg-gray-800
            ${error ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20
            group-hover:border-gray-300 dark:text-white
          `}
        {...props}
      />
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 
          text-gray-400 group-hover:text-teal-500 transition-colors" />
    </div>
    {error && (
      <p className="text-red-500 text-sm flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const ProfilePhotoUpload = ({ photo, onPhotoChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
      dark:border-gray-700 p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Profile Photo</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose a profile photo to personalize your account
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 
            dark:bg-gray-800 ring-4 ring-white dark:ring-gray-700 shadow-xl mx-auto md:mx-0">
            {photo ? (
              <motion.img
                src={photo}
                alt="Profile"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-teal-500 rounded-full 
            text-white cursor-pointer transform translate-x-2 translate-y-2
            hover:bg-teal-600 transition-all duration-200 shadow-lg
            hover:shadow-teal-500/25">
            <Camera className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </motion.div>
      </div>
    </div>
  );
};

const StepNavigation = ({ steps, currentStep, onChange }) => (
  <div className="space-y-1">
    {steps.map((step, index) => {
      const isActive = currentStep === index;
      const isPassed = currentStep > index;
      const Icon = step.icon;

      return (
        <motion.button
          key={step.id}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(index)}
          className={`
            w-full flex items-center gap-3 p-3 rounded-lg
            transition-all duration-200
            ${isActive
              ? 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/20'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}
          `}
        >
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            transition-colors duration-200
            ${isActive
              ? 'bg-teal-500 text-white'
              : isPassed
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800'}
          `}>
            {isPassed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
          </div>
          <span className="flex-1 text-left font-medium">
            {step.title}
          </span>
          {isActive && (
            <motion.div
              layoutId="activeStep"
              className="w-1.5 h-1.5 rounded-full bg-teal-500"
            />
          )}
        </motion.button>
      );
    })}
  </div>
);

const ProgressBar = ({ progress }) => (
  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full bg-teal-500"
    />
  </div>
);

const STEPS = [
  {
    id: 'personal',
    title: 'Personal Details',
    description: 'Basic information about you',
    icon: User
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Your general information',
    icon: Activity
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'How we can reach you',
    icon: Building
  },
  {
    id: 'emergency',
    title: 'Emergency Contact',
    description: 'Who to contact in emergencies',
    icon: Shield
  },
  {
    id: 'vitals',
    title: 'Vital Statistics',
    description: 'Your health metrics',
    icon: Heart
  },
  {
    id: 'health',
    title: 'Health Information',
    description: 'Your medical history',
    icon: FileText
  }
];

const EditProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }
      await fetchProfileData();
    };

    checkAuthAndFetchData();
  }, [navigate]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/auth');
        return;
      }

      const response = await fetch('https://anochat.in/v1/health/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }

      const data = result.data;

      const transformedData = {
        name: data.user.name || '',
        phone: data.user.phone || '',
        photo: data.photo || '',
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
        gender: data.gender?.charAt(0).toUpperCase() + data.gender?.slice(1) || '',
        bloodType: data.blood_type || '',
        height: data.height?.toString() || '',
        weight: data.weight?.toString() || '',
        address: {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postal_code || '',
          country: data.country || '',
        },
        emergencyContacts: data.emergency_contacts?.map(contact => ({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.primary_phone,
          email: contact.email,
        })) || [],
        allergies: data.allergies?.map(allergy => ({
          allergen: allergy.allergen,
          severity: allergy.severity,
          diagnosedDate: allergy.diagnosed_date ? new Date(allergy.diagnosed_date).toISOString().split('T')[0] : '',
          reactions: allergy.reactions?.split(', ') || [],
        })) || [],
        medications: {
          current: data.medications?.filter(med => med.is_active).map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            startDate: med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : '',
            prescribedBy: med.prescribed_by,
            purpose: med.condition,
            sideEffects: med.side_effects?.split(', ') || [],
          })) || [],
          past: data.medications?.filter(med => !med.is_active).map(med => ({
            name: med.name,
            dosage: med.dosage,
            startDate: med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : '',
            endDate: med.end_date ? new Date(med.end_date).toISOString().split('T')[0] : '',
            reason: med.notes,
          })) || [],
        },
        vitalSigns: {
          bloodPressure: data.vital_signs
            ?.filter(v => v.type === 'bloodPressure')
            .map(v => ({
              systolic: v.systolic,
              diastolic: v.diastolic,
              timestamp: v.timestamp,
            })) || [],
          heartRate: data.vital_signs
            ?.filter(v => v.type === 'heartRate')
            .map(v => ({
              beatsPerMinute: v.value,
              timestamp: v.timestamp,
            })) || [],
          temperature: data.vital_signs
            ?.filter(v => v.type === 'temperature')
            .map(v => ({
              value: v.value,
              timestamp: v.timestamp,
            })) || [],
          oxygenSaturation: data.vital_signs
            ?.filter(v => v.type === 'oxygenSaturation')
            .map(v => ({
              percentage: v.value,
              timestamp: v.timestamp,
            })) || [],
        },
      };

      setProfileData(transformedData);

      localStorage.setItem('healthProfile', JSON.stringify(transformedData));

      return transformedData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const validatePersonalInfo = () => {
    const newErrors = {};
    if (!profileData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!profileData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(profileData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const transformDataForAPI = (formData) => {
    const formatDate = (date) => {
      if (!date) return null;
      try {
        return new Date(date).toISOString();
      } catch (e) {
        console.error('Date formatting error:', e);
        return null;
      }
    };
    let formattedGender = formData.gender?.toLowerCase();
    if (formattedGender === 'female' || formattedGender === 'male') {
      formattedGender = formattedGender;
    }

    const transformedData = {
      date_of_birth: formatDate(formData.dateOfBirth),
      gender: formattedGender,
      blood_type: formData.bloodType,
      height: Number(formData.height) || 0,
      weight: Number(formData.weight) || 0,
      street: formData.address?.street || '',
      city: formData.address?.city || '',
      state: formData.address?.state || '',
      postal_code: formData.address?.postalCode || '',
      country: formData.address?.country || '',
      emergency_contacts: (formData.emergencyContacts || []).map((contact, index) => ({
        name: contact.name || '',
        relationship: contact.relationship || '',
        primary_phone: contact.phone || '',
        email: contact.email || '',
        address: `${formData.address?.street || ''}, ${formData.address?.city || ''}`,
        is_main_contact: index === 0,
        notes: 'Available during working hours'
      })),
      allergies: (formData.allergies || []).map(allergy => ({
        allergen: allergy.allergen || '',
        allergen_type: 'Medication',
        severity: allergy.severity || 'Moderate',
        reactions: Array.isArray(allergy.reactions) ? allergy.reactions.join(', ') : allergy.reactions || '',
        diagnosed_date: formatDate(allergy.diagnosedDate) || new Date().toISOString(),
        diagnosed_by: 'Healthcare Provider',
        is_active: true,
        notes: `Patient has ${allergy.severity?.toLowerCase() || 'moderate'} reactions to ${allergy.allergen}`
      })),
      medications: [
        ...(formData.medications?.current || []).map(med => ({
          name: med.name || '',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          start_date: formatDate(med.startDate),
          condition: med.purpose || '',
          prescribed_by: med.prescribedBy || '',
          is_active: true,
          side_effects: Array.isArray(med.sideEffects) ? med.sideEffects.join(', ') : med.sideEffects || ''
        })),
        ...(formData.medications?.past || []).map(med => ({
          name: med.name || '',
          dosage: med.dosage || '',
          start_date: formatDate(med.startDate),
          end_date: formatDate(med.endDate),
          is_active: false,
          notes: med.reason || ''
        }))
      ],
      vital_signs: [
        ...(formData.vitalSigns?.bloodPressure || []).map(reading => ({
          type: "bloodPressure",
          systolic: reading.systolic?.toString() || '',
          diastolic: reading.diastolic?.toString() || '',
          timestamp: formatDate(reading.timestamp) || new Date().toISOString()
        })),
        ...(formData.vitalSigns?.heartRate || []).map(reading => ({
          type: "heartRate",
          value: reading.beatsPerMinute?.toString() || '',
          timestamp: formatDate(reading.timestamp) || new Date().toISOString()
        })),
        ...(formData.vitalSigns?.temperature || []).map(reading => ({
          type: "temperature",
          value: reading.value?.toString() || '',
          timestamp: formatDate(reading.timestamp) || new Date().toISOString()
        })),
        ...(formData.vitalSigns?.oxygenSaturation || []).map(reading => ({
          type: "oxygenSaturation",
          value: reading.percentage?.toString() || '',
          timestamp: formatDate(reading.timestamp) || new Date().toISOString()
        }))
      ]
    };

    console.log('Transformed Data for API:', transformedData);
    return transformedData;
  };

  const updateProfile = async (profileData) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const transformedData = transformDataForAPI(profileData);

    try {
      console.log('Making API request with data:', transformedData);

      const response = await fetch('https://anochat.in/v1/health/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', result);
        throw new Error(result.data?.message || result.message || `HTTP error! status: ${response.status}`);
      }

      if (!result.data) {
        throw new Error('Invalid response format from server');
      }

      console.log('Profile Update Success:', result);

      await fetchProfileData();

      return result;
    } catch (error) {
      console.error('Profile Update Error:', error);
      throw error;
    }
  };
  useEffect(() => {
    let interval;

    if (profileData) {
      interval = setInterval(async () => {
        await fetchProfileData();
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [profileData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(profileData);

      if (result.success) {
        await fetchProfileData();

        toast.success('Profile updated successfully!');

        await new Promise(resolve => setTimeout(resolve, 1500));

        await fetchProfileData();

        navigate('/dashboard');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error(error.message || 'Failed to update profile');
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));

      await fetchProfileData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const transformAPIResponseToFrontend = (apiData) => {
    return {
      dateOfBirth: apiData.date_of_birth ? new Date(apiData.date_of_birth).toISOString().split('T')[0] : '',
      gender: apiData.gender?.charAt(0).toUpperCase() + apiData.gender?.slice(1) || '',
      bloodType: apiData.blood_type || '',
      height: apiData.height?.toString() || '',
      weight: apiData.weight?.toString() || '',
      address: {
        street: apiData.street || '',
        city: apiData.city || '',
        state: apiData.state || '',
        postalCode: apiData.postal_code || '',
        country: apiData.country || '',
      },
      emergencyContacts: apiData.emergency_contacts?.map(contact => ({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.primary_phone,
        email: contact.email,
      })) || [],
      allergies: apiData.allergies?.map(allergy => ({
        allergen: allergy.allergen,
        severity: allergy.severity,
        diagnosedDate: allergy.diagnosed_date ? new Date(allergy.diagnosed_date).toISOString().split('T')[0] : '',
        reactions: allergy.reactions?.split(', ') || [],
      })) || [],
      medications: {
        current: apiData.medications?.filter(med => med.is_active).map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : '',
          prescribedBy: med.prescribed_by,
          purpose: med.condition,
          sideEffects: med.side_effects?.split(', ') || [],
        })) || [],
        past: apiData.medications?.filter(med => !med.is_active).map(med => ({
          name: med.name,
          dosage: med.dosage,
          startDate: med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : '',
          endDate: med.end_date ? new Date(med.end_date).toISOString().split('T')[0] : '',
          reason: med.notes,
        })) || [],
      },
      vitalSigns: {
        bloodPressure: apiData.vital_signs
          ?.filter(v => v.type === 'bloodPressure')
          .map(v => ({
            systolic: v.systolic,
            diastolic: v.diastolic,
            timestamp: v.timestamp,
          })) || [],
        heartRate: apiData.vital_signs
          ?.filter(v => v.type === 'heartRate')
          .map(v => ({
            beatsPerMinute: v.value,
            timestamp: v.timestamp,
          })) || [],
        temperature: apiData.vital_signs
          ?.filter(v => v.type === 'temperature')
          .map(v => ({
            value: v.value,
            timestamp: v.timestamp,
          })) || [],
        oxygenSaturation: apiData.vital_signs
          ?.filter(v => v.type === 'oxygenSaturation')
          .map(v => ({
            percentage: v.value,
            timestamp: v.timestamp,
          })) || [],
      }
    };
  };
  const handleChange = (field) => (e) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePhotoChange = (photoUrl) => {
    setProfileData(prev => ({
      ...prev,
      photo: photoUrl
    }));
  };

  const handleDataChange = (newData) => {
    setProfileData(prev => {
      const updatedData = {
        ...prev,
        ...newData,
        address: {
          ...prev.address,
          ...(newData.address || {})
        },
        medications: {
          ...prev.medications,
          ...(newData.medications || {})
        },
        vitalSigns: {
          ...prev.vitalSigns,
          ...(newData.vitalSigns || {})
        }
      };

      console.log('Updated Profile Data:', updatedData);
      return updatedData;
    });
  };

  const handleValidationChange = (isValid) => {
    setErrors(prev => ({
      ...prev,
      [STEPS[currentStep].id]: !isValid
    }));
  };

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      handleSubmit();
      return;
    }

    if (currentStep === 0 && !validatePersonalInfo()) {
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const LoadingIndicator = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
        <p className="text-gray-600 dark:text-gray-300">Loading profile data...</p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'personal':
        return (
          <div className="space-y-6">
            <ProfilePhotoUpload
              photo={profileData.photo}
              onPhotoChange={handlePhotoChange}
            />
            <div className="grid gap-6 mt-8">
              <InputField
                icon={User}
                label="Full Name"
                value={profileData.name}
                onChange={handleChange('name')}
                error={errors.name}
                required
                placeholder="Enter your full name"
              />
              <InputField
                icon={Phone}
                label="Phone Number"
                value={profileData.phone}
                onChange={handleChange('phone')}
                error={errors.phone}
                required
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        );
      case 'basic-info':
        return (
          <BasicInfoStep
            data={profileData}
            onChange={handleDataChange}
            onValidationChange={handleValidationChange}
          />
        );
      case 'contact':
        return (
          <ContactDetailsStep
            data={profileData}
            onChange={handleDataChange}
            onValidationChange={handleValidationChange}
          />
        );
      case 'emergency':
        return (
          <EmergencyContactStep
            data={profileData}
            onChange={handleDataChange}
            onValidationChange={handleValidationChange}
          />
        );
      case 'vitals':
        return (
          <VitalStatsStep
            data={profileData}
            onChange={handleDataChange}
            onValidationChange={handleValidationChange}
          />
        );
      case 'health':
        return (
          <div className="grid gap-6">
            <AllergiesStep
              data={profileData}
              onChange={handleDataChange}
              onValidationChange={handleValidationChange}
            />
            <MedicationsStep
              data={profileData}
              onChange={handleDataChange}
              onValidationChange={handleValidationChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <motion.div

          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-8"
        >
          {errors.fetch && <ErrorAlert message={errors.fetch} />}

          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                  transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Edit Profile
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Update your profile information
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-72">
                <div className="lg:sticky lg:top-8 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border 
                    border-gray-200 dark:border-gray-700 p-6">
                    <StepNavigation
                      steps={STEPS}
                      currentStep={currentStep}
                      onChange={setCurrentStep}
                    />
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl border 
                    border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-medium mb-2">Tips</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fill out all required fields marked with an asterisk (*) to complete
                      your profile setup.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Step {currentStep + 1} of {STEPS.length}
                      </p>
                      <h2 className="text-2xl font-semibold mt-1">
                        {STEPS[currentStep].title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {STEPS[currentStep].description}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center 
                      justify-center text-teal-500 border border-teal-500/20">
                      {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                    </div>
                  </div>
                  <ProgressBar progress={((currentStep + 1) / STEPS.length) * 100} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border 
                  border-gray-200 dark:border-gray-700 p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-lg border
                      ${currentStep === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }
                      transition-colors duration-200 text-gray-600 dark:text-gray-300
                    `}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg
                      bg-teal-500 hover:bg-teal-600 text-white
                      transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        {currentStep === STEPS.length - 1 ? 'Save Changes' : 'Continue'}
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EditProfile;