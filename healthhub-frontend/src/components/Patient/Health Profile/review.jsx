import React, { useState } from 'react';
import {
  Check, AlertCircle, User, Phone, Heart, Activity,
  Calendar, MapPin, Shield, Pill, Edit2, History
} from 'lucide-react';

const ReviewStep = ({
  data = {
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    address: {},
    emergencyContacts: [],
    allergies: [],
    medications: {
      current: [],
      past: []
    },
    vitalSigns: {
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      oxygenSaturation: []
    }
  },
  onEditSection,
  onComplete,
  isSubmitting = false
}) => {
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const SectionCard = ({ title, icon: Icon, children, sectionId, isComplete }) => (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden
      transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
            <Icon className={`w-5 h-5 ${isComplete ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <button
          onClick={() => onEditSection(sectionId)}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700
            transition-colors duration-300"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>
      <div className="p-6 bg-gray-50">{children}</div>
    </div>
  );

  const DataRow = ({ label, value, className = "" }) => (
    <div className={`flex justify-between py-2 ${className}`}>
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value || 'Not provided'}</span>
    </div>
  );

  const isBasicInfoComplete = Boolean(
    data.dateOfBirth &&
    data.gender &&
    data.bloodType &&
    data.height &&
    data.weight
  );

  const isContactComplete = Boolean(
    data.address?.street &&
    data.address?.city &&
    data.address?.country
  );

  const isEmergencyContactComplete = Boolean(
    data.emergencyContacts &&
    data.emergencyContacts.length > 0 &&
    data.emergencyContacts[0]?.name &&
    data.emergencyContacts[0]?.relationship &&
    data.emergencyContacts[0]?.phone
  );

  const formatVitalSign = (value, unit) => {
    return value ? `${value} ${unit}` : 'Not recorded';
  };

  const formatDataForAPI = (data) => {

    const vitalSigns = [];


    if (data.vitalSigns?.bloodPressure?.[0]) {
      vitalSigns.push({
        type: "bloodPressure",
        systolic: data.vitalSigns.bloodPressure[0].systolic?.toString(),
        diastolic: data.vitalSigns.bloodPressure[0].diastolic?.toString(),
        timestamp: new Date().toISOString()
      });
    }


    if (data.vitalSigns?.heartRate?.[0]) {
      vitalSigns.push({
        type: "heartRate",
        value: data.vitalSigns.heartRate[0].beatsPerMinute?.toString(),
        timestamp: new Date().toISOString()
      });
    }

    if (data.vitalSigns?.temperature?.[0]) {
      vitalSigns.push({
        type: "temperature",
        value: data.vitalSigns.temperature[0].value?.toString(),
        timestamp: new Date().toISOString()
      });
    }

    if (data.vitalSigns?.oxygenSaturation?.[0]) {
      vitalSigns.push({
        type: "oxygenSaturation",
        value: data.vitalSigns.oxygenSaturation[0].percentage?.toString(),
        timestamp: new Date().toISOString()
      });
    }


    const medications = data.medications?.current?.map(med => ({
      name: med.name,
      generic_name: med.name,
      brand_name: med.name,
      dosage: med.dosage?.toString(),
      dosage_unit: "mg",
      frequency: med.frequency,
      route_of_admin: "Oral",
      start_date: med.startDate ? new Date(med.startDate).toISOString() : new Date().toISOString(),
      duration: 365,
      condition: med.purpose || "",
      prescribed_by: med.prescribedBy,
      is_active: true,
      side_effects: med.sideEffects?.join(", ") || "",
      special_instructions: "",
      notes: ""
    })) || [];


    const allergies = data.allergies?.map(allergy => ({
      allergen: allergy.allergen,
      allergen_type: "Unspecified",
      severity: allergy.severity,
      reactions: allergy.reactions?.join(", ") || "",
      diagnosed_date: allergy.diagnosedDate ? new Date(allergy.diagnosedDate).toISOString() : new Date().toISOString(),
      is_active: true,
      notes: ""
    })) || [];


    const emergency_contacts = data.emergencyContacts?.map((contact, index) => ({
      name: contact.name,
      relationship: contact.relationship,
      primary_phone: contact.phone,
      email: contact.email || "",
      is_main_contact: index === 0,
      notes: ""
    })) || [];


    const apiPayload = {
      date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
      gender: data.gender?.toLowerCase(),
      blood_type: data.bloodType,
      height: parseFloat(data.height) || 0,
      weight: parseFloat(data.weight) || 0,
      street: data.address?.street || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      postal_code: data.address?.postalCode || "",
      country: data.address?.country || "",
      version: "1.0",
      emergency_contacts,
      allergies,
      medications,
      vital_signs: vitalSigns
    };

    return apiPayload;
  };

  const handleFormSubmit = async () => {
    try {
      setError(null);

      const vital_signs = [];


      if (data.vitalSigns?.bloodPressure?.[0]) {
        vital_signs.push({
          type: "bloodPressure",
          systolic: data.vitalSigns.bloodPressure[0].systolic?.toString(),
          diastolic: data.vitalSigns.bloodPressure[0].diastolic?.toString(),
          timestamp: new Date().toISOString()
        });
      }


      if (data.vitalSigns?.heartRate?.[0]?.beatsPerMinute) {
        vital_signs.push({
          type: "heartRate",
          value: data.vitalSigns.heartRate[0].beatsPerMinute.toString(),
          timestamp: new Date().toISOString()
        });
      }


      if (data.vitalSigns?.temperature?.[0]?.value) {
        vital_signs.push({
          type: "temperature",
          value: data.vitalSigns.temperature[0].value.toString(),
          timestamp: new Date().toISOString()
        });
      }


      if (data.vitalSigns?.oxygenSaturation?.[0]?.percentage) {
        vital_signs.push({
          type: "oxygenSaturation",
          value: data.vitalSigns.oxygenSaturation[0].percentage.toString(),
          timestamp: new Date().toISOString()
        });
      }

      const cleanData = {
        date_of_birth: new Date(data.dateOfBirth).toISOString(),
        gender: data.gender?.toLowerCase(),
        blood_type: data.bloodType,
        height: Number(data.height),
        weight: Number(data.weight),
        street: data.address?.street,
        city: data.address?.city,
        state: data.address?.state,
        postal_code: data.address?.postal_code || data.address?.postalCode,
        country: data.address?.country,
        version: "1.0",


        emergency_contacts: (data.emergencyContacts || []).map((contact, index) => ({
          name: contact.name,
          relationship: contact.relationship,
          primary_phone: contact.phone,
          secondary_phone: "",
          email: contact.email || "",
          address: `${data.address?.street || ""}, ${data.address?.city || ""}`,
          is_main_contact: index === 0,
          notes: "Available during working hours"
        })),


        allergies: (data.allergies || []).map(allergy => ({
          allergen: allergy.allergen,
          allergen_type: "Medication",
          severity: allergy.severity,
          reactions: Array.isArray(allergy.reactions) ? allergy.reactions.join(", ") : allergy.reactions,
          diagnosed_date: allergy.diagnosedDate ? new Date(allergy.diagnosedDate).toISOString() : new Date().toISOString(),
          diagnosed_by: "Dr. James Mitchell",
          last_reaction_date: new Date().toISOString(),
          treatment_plan: "Avoid exposure, carry emergency medication if prescribed",
          emergency_meds: allergy.severity === "Severe" ? "EpiPen" : "Antihistamine",
          preventive_meds: "None",
          is_active: true,
          notes: `Patient has ${allergy.severity.toLowerCase()} reactions to ${allergy.allergen}`
        })),


        medications: (data.medications?.current || []).map(med => ({
          name: med.name,
          generic_name: med.name,
          brand_name: med.name,
          dosage: med.dosage,
          dosage_unit: "mg",
          frequency: med.frequency,
          route_of_admin: "Oral",
          start_date: med.startDate ? new Date(med.startDate).toISOString() : new Date().toISOString(),
          duration: 365,
          condition: med.purpose || "Ongoing treatment",
          prescribed_by: med.prescribedBy,
          pharmacy: "Local Pharmacy",
          prescription_num: `RX${Math.floor(Math.random() * 1000000)}`,
          last_filled: new Date().toISOString(),
          next_refill_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          remaining_refills: 3,
          is_active: true,
          side_effects: Array.isArray(med.sideEffects) ? med.sideEffects.join(", ") : (med.sideEffects || ""),
          interactions: "None known",
          take_with_food: true,
          special_instructions: med.frequency ? `Take ${med.frequency.toLowerCase()}` : "",
          notes: "Monitor for side effects"
        })),


        vital_signs
      };

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }


      let method = 'POST';
      let endpoint = 'https://anochat.in/v1/health/profile';

      try {
        const checkResponse = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (checkResponse.ok) {

          method = 'PUT';
        }
      } catch (error) {

        console.log('No existing profile found, creating new one');
      }


      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.data?.message || `Failed to ${method === 'POST' ? 'create' : 'update'} health profile`);
      }

      if (typeof onComplete === 'function') {
        await onComplete(cleanData);
      }

      return {
        success: true,
        message: `Health profile ${method === 'POST' ? 'created' : 'updated'} successfully`,
        data: responseData
      };

    } catch (error) {
      console.error('Profile submission error details:', error);
      setError(error.message || 'Failed to submit health profile. Please try again.');
      throw error;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="Basic Information"
        icon={User}
        sectionId="basic-info"
        isComplete={isBasicInfoComplete}
      >
        <div className="space-y-2">
          <DataRow label="Full Name" value={data.fullName} />
          <DataRow label="Date of Birth" value={formatDate(data.dateOfBirth)} />
          <DataRow label="Gender" value={data.gender} />
          <DataRow label="Blood Type" value={data.bloodType} />
          <DataRow label="Height" value={data.height ? `${data.height} cm` : null} />
          <DataRow label="Weight" value={data.weight ? `${data.weight} kg` : null} />
        </div>
      </SectionCard>

      <SectionCard
        title="Contact Information"
        icon={Phone}
        sectionId="contact"
        isComplete={isContactComplete}
      >
        <div className="space-y-2">
          <DataRow label="Email" value={data.email} />
          <DataRow label="Phone" value={data.phone} />
          {data.address && (
            <>
              <DataRow label="Street" value={data.address.street} />
              <DataRow label="City" value={data.address.city} />
              <DataRow label="State" value={data.address.state} />
              <DataRow label="Postal Code" value={data.address.postalCode} />
              <DataRow label="Country" value={data.address.country} />
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Emergency Contacts"
        icon={Shield}
        sectionId="emergency-contact"
        isComplete={isEmergencyContactComplete}
      >
        <div className="space-y-4">
          {data.emergencyContacts?.map((contact, index) => (
            <div key={index} className="p-4 bg-white rounded-xl space-y-2">
              <div className="font-medium text-gray-900 mb-2">
                Contact {index + 1}
              </div>
              <DataRow label="Name" value={contact?.name} />
              <DataRow label="Relationship" value={contact?.relationship} />
              <DataRow label="Phone" value={contact?.phone} />
              <DataRow label="Email" value={contact?.email} />
            </div>
          ))}
          {!data.emergencyContacts?.length && (
            <div className="text-gray-500 text-center py-2">
              No emergency contacts added
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Vital Statistics"
        icon={Activity}
        sectionId="vital-stats"
        isComplete={true}
      >
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl space-y-2">
            <DataRow
              label="Blood Pressure"
              value={data.vitalSigns?.bloodPressure?.[0]?.systolic && data.vitalSigns?.bloodPressure?.[0]?.diastolic
                ? `${data.vitalSigns.bloodPressure[0].systolic}/${data.vitalSigns.bloodPressure[0].diastolic} mmHg`
                : 'Not recorded'}
            />
            <DataRow
              label="Heart Rate"
              value={formatVitalSign(data.vitalSigns?.heartRate?.[0]?.beatsPerMinute, 'bpm')}
            />
            <DataRow
              label="Temperature"
              value={formatVitalSign(data.vitalSigns?.temperature?.[0]?.value, '°C')}
            />
            <DataRow
              label="Oxygen Saturation"
              value={formatVitalSign(data.vitalSigns?.oxygenSaturation?.[0]?.percentage, '%')}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Allergies"
        icon={AlertCircle}
        sectionId="allergies"
        isComplete={true}
      >
        <div className="space-y-4">
          {data.allergies?.map((allergy, index) => (
            <div key={index} className="p-4 bg-white rounded-xl space-y-2">
              <DataRow label="Allergen" value={allergy?.allergen} />
              <DataRow label="Severity" value={allergy?.severity} />
              <DataRow label="Diagnosed Date" value={formatDate(allergy?.diagnosedDate)} />
              <DataRow
                label="Reactions"
                value={allergy?.reactions?.join(', ') || 'None listed'}
              />
            </div>
          ))}
          {!data.allergies?.length && (
            <div className="text-gray-500 text-center py-2">
              No allergies reported
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Current Medications"
        icon={Pill}
        sectionId="current-medications"
        isComplete={true}
      >
        <div className="space-y-4">
          {data.medications?.current?.map((med, index) => (
            <div key={index} className="p-4 bg-white rounded-xl space-y-2">
              <DataRow label="Medication" value={med?.name} />
              <DataRow label="Dosage" value={med?.dosage} />
              <DataRow label="Frequency" value={med?.frequency} />
              <DataRow label="Start Date" value={formatDate(med?.startDate)} />
              <DataRow label="Prescribed By" value={med?.prescribedBy} />
              <DataRow label="Purpose" value={med?.purpose} />
              <DataRow
                label="Side Effects"
                value={med?.sideEffects?.join(', ') || 'None reported'}
              />
            </div>
          ))}
          {!data.medications?.current?.length && (
            <div className="text-gray-500 text-center py-2">
              No current medications listed
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Past Medications"
        icon={History}
        sectionId="past-medications"
        isComplete={true}
      >
        <div className="space-y-4">
          {data.medications?.past?.map((med, index) => (
            <div key={index} className="p-4 bg-white rounded-xl space-y-2">
              <DataRow label="Medication" value={med?.name} />
              <DataRow label="Dosage" value={med?.dosage} />
              <DataRow label="Start Date" value={formatDate(med?.startDate)} />
              <DataRow label="End Date" value={formatDate(med?.endDate)} />
              <DataRow label="Reason for Stopping" value={med?.reason} />
            </div>
          ))}
          {!data.medications?.past?.length && (
            <div className="text-gray-500 text-center py-2">
              No past medications listed
            </div>
          )}
        </div>
      </SectionCard>

      {!isBasicInfoComplete || !isContactComplete || !isEmergencyContactComplete ? (
        <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <span>Please complete all required sections before submitting</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl">
          <Check className="w-5 h-5" />
          <span>All required information has been provided</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={() => {
          try {
            handleFormSubmit();
          } catch (error) {
            console.error('Form submission error:', error);
            setError('Failed to submit profile. Please try again.');
          }
        }}
        disabled={!isBasicInfoComplete || !isContactComplete || !isEmergencyContactComplete || isSubmitting}
        className={`
    w-full py-4 px-6 rounded-xl font-semibold
    transition-all duration-300 transform
    ${isBasicInfoComplete && isContactComplete && isEmergencyContactComplete && !isSubmitting
            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-lg hover:scale-102 active:scale-98'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Complete Profile</span>
            <Check className="w-5 h-5" />
          </div>
        )}
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        
        @media (max-width: 640px) {
          button {
            min-height: 44px;
            font-size: 16px;
          }
          
          .group input {
            min-height: 44px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewStep;