import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, Phone, Mail, 
  MessageSquare, X, Search, Filter,
  ChevronDown, ChevronRight, MoreVertical,
  Check, AlertCircle, Video, ExternalLink,
  FileText, Plus, Stethoscope, Pill, Save
} from 'lucide-react';

// Mock Data Hook
const useAppointmentsData = () => {
  const [appointments] = useState([
    {
      id: 1,
      patientName: "Sarah Johnson",
      appointmentType: "Follow-up",
      date: "2025-01-14",
      time: "10:00 AM",
      status: "upcoming",
      mode: "in-person",
      phone: "+1 234-567-8900",
      email: "sarah.j@email.com",
      age: 32,
      lastVisit: "2024-12-20",
      symptoms: "Persistent headache, mild fever",
      notes: "Previous visit: High blood pressure",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 2,
      patientName: "Michael Chen",
      appointmentType: "New Patient",
      date: "2025-01-14",
      time: "11:30 AM",
      status: "confirmed",
      mode: "video",
      meetLink: "https://meet.google.com/abc-defg-hij",
      phone: "+1 234-567-8901",
      email: "michael.c@email.com",
      age: 45,
      symptoms: "Lower back pain",
      notes: "First consultation",
      avatar: "/api/placeholder/32/32"
    }
  ]);

  return { appointments, loading: false };
};

// VideoCallBadge Component
const VideoCallBadge = () => (
  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-100 
    rounded-full flex items-center justify-center">
    <Video className="w-3 h-3 text-blue-600" />
  </div>
);

// StartCallButton Component
const StartCallButton = ({ meetLink }) => (
  <motion.a
    href={meetLink}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg
      hover:bg-blue-600 transition-colors text-sm font-medium
      flex items-center justify-center gap-2"
  >
    <Video className="w-4 h-4" />
    Start Call
    <ExternalLink className="w-3 h-3" />
  </motion.a>
);

// First, let's create a comprehensive prescription data structure with vitals
const initialVitals = {
  bloodPressure: { label: 'Blood Pressure', value: '', unit: 'mmHg', required: true },
  temperature: { label: 'Temperature', value: '', unit: '°F', required: true },
  heartRate: { label: 'Heart Rate', value: '', unit: 'bpm', required: true },
  spO2: { label: 'SpO2', value: '', unit: '%', required: true },
  weight: { label: 'Weight', value: '', unit: 'kg', required: true },
  height: { label: 'Height', value: '', unit: 'cm', required: true }
};

const PrescriptionForm = ({ appointment, onSave, onClose }) => {
  const [prescription, setPrescription] = useState({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    patientInfo: {
      name: appointment.patientName,
      age: appointment.age,
      gender: appointment.gender || '',
      contact: {
        phone: appointment.phone,
        email: appointment.email
      }
    },
    vitals: { ...initialVitals },
    customVitals: [],
    diagnosis: '',
    medications: [{ 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '',
      route: '',
      timing: ''
    }],
    clinicalNotes: '',
    chiefComplaints: appointment.symptoms || '',
    physicalExamination: '',
    investigationsSuggested: [],
    additionalNotes: '',
    followUpDate: '',
    doctorInfo: {
      name: 'Dr. Emily White',
      specialization: 'General Medicine',
      registrationNumber: 'MD12345'
    },
    status: 'active'
  });

  const [showAddVital, setShowAddVital] = useState(false);
  const [newVital, setNewVital] = useState({ 
    name: '', 
    value: '', 
    unit: '', 
    required: false 
  });

  const addCustomVital = () => {
    if (newVital.name && newVital.unit) {
      setPrescription(prev => ({
        ...prev,
        customVitals: [...prev.customVitals, { ...newVital }]
      }));
      setNewVital({ name: '', value: '', unit: '', required: false });
      setShowAddVital(false);
    }
  };

  const updateVital = (vitalKey, value, isCustom = false) => {
    if (isCustom) {
      const updatedCustomVitals = prescription.customVitals.map((vital, index) => {
        if (index === vitalKey) {
          return { ...vital, value };
        }
        return vital;
      });
      setPrescription(prev => ({
        ...prev,
        customVitals: updatedCustomVitals
      }));
    } else {
      setPrescription(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalKey]: { ...prev.vitals[vitalKey], value }
        }
      }));
    }
  };

  const removeCustomVital = (index) => {
    setPrescription(prev => ({
      ...prev,
      customVitals: prev.customVitals.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    setPrescription(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { 
          name: '', 
          dosage: '', 
          frequency: '', 
          duration: '', 
          instructions: '',
          route: '',
          timing: ''
        }
      ]
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleAddInvestigation = (investigation) => {
    setPrescription(prev => ({
      ...prev,
      investigationsSuggested: [...prev.investigationsSuggested, investigation]
    }));
  };

  const handleSave = () => {
    // Create the final prescription payload
    const prescriptionPayload = {
      ...prescription,
      vitals: {
        ...Object.entries(prescription.vitals).reduce((acc, [key, value]) => {
          acc[key] = value.value;
          return acc;
        }, {}),
        custom: prescription.customVitals.reduce((acc, vital) => {
          acc[vital.name] = {
            value: vital.value,
            unit: vital.unit
          };
          return acc;
        }, {})
      }
    };

    onSave(prescriptionPayload);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">New Prescription</h2>
                <p className="text-gray-500">For {appointment.patientName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Vitals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Vital Signs</h3>
                <button
                  onClick={() => setShowAddVital(true)}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Vital
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(prescription.vitals).map(([key, vital]) => (
                  <VitalSignInput
                    key={key}
                    label={vital.label}
                    value={vital.value}
                    unit={vital.unit}
                    required={vital.required}
                    onChange={(value) => updateVital(key, value)}
                  />
                ))}
                
                {prescription.customVitals.map((vital, index) => (
                  <div key={index} className="relative">
                    <VitalSignInput
                      label={vital.name}
                      value={vital.value}
                      unit={vital.unit}
                      onChange={(value) => updateVital(index, value, true)}
                    />
                    <button
                      onClick={() => removeCustomVital(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-50 rounded-full
                        text-red-500 hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Vital Form */}
              {showAddVital && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      placeholder="Vital Name"
                      value={newVital.name}
                      onChange={(e) => setNewVital({...newVital, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <input
                      placeholder="Unit"
                      value={newVital.unit}
                      onChange={(e) => setNewVital({...newVital, unit: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addCustomVital}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg
                          hover:bg-teal-600 transition-colors"
                      >
                        Add Vital
                      </button>
                      <button
                        onClick={() => {
                          setShowAddVital(false);
                          setNewVital({ name: '', value: '', unit: '' });
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chief Complaints & Clinical Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chief Complaints
                </label>
                <textarea
                  value={prescription.chiefComplaints}
                  onChange={(e) => setPrescription({
                    ...prescription,
                    chiefComplaints: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows={3}
                  placeholder="Enter chief complaints"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes
                </label>
                <textarea
                  value={prescription.clinicalNotes}
                  onChange={(e) => setPrescription({
                    ...prescription,
                    clinicalNotes: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows={3}
                  placeholder="Enter clinical notes"
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <textarea
                value={prescription.diagnosis}
                onChange={(e) => setPrescription({
                  ...prescription,
                  diagnosis: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                rows={3}
                placeholder="Enter diagnosis"
              />
            </div>

            {/* Physical Examination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Examination
              </label>
              <textarea
                value={prescription.physicalExamination}
                onChange={(e) => setPrescription({
                  ...prescription,
                  physicalExamination: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                rows={3}
                placeholder="Enter physical examination findings"
              />
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Medications</h3>
                <button
                  onClick={addMedication}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>
              
              {prescription.medications.map((med, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4 relative">
                  {index > 0 && (
                    <button
                      onClick={() => removeMedication(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-50 rounded-full
                        text-red-500 hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="w-full px-4 py-2border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      placeholder="Frequency (e.g., Twice daily)"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <input
                      placeholder="Duration (e.g., 7 days)"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <select
                      value={med.route}
                      onChange={(e) => updateMedication(index, 'route', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="">Select Route</option>
                      <option value="Oral">Oral</option>
                      <option value="Intravenous">Intravenous</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Subcutaneous">Subcutaneous</option>
                      <option value="Topical">Topical</option>
                      <option value="Inhalation">Inhalation</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={med.timing}
                      onChange={(e) => updateMedication(index, 'timing', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="">Select Timing</option>
                      <option value="Before meals">Before meals</option>
                      <option value="After meals">After meals</option>
                      <option value="With meals">With meals</option>
                      <option value="Empty stomach">Empty stomach</option>
                      <option value="Bedtime">Bedtime</option>
                      <option value="As needed">As needed</option>
                    </select>
                    <input
                      placeholder="Special instructions"
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Investigations */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Investigations</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <select
                    onChange={(e) => e.target.value && handleAddInvestigation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg
                      focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    value=""
                  >
                    <option value="">Add Investigation</option>
                    <option value="Complete Blood Count">Complete Blood Count</option>
                    <option value="Blood Sugar">Blood Sugar</option>
                    <option value="Liver Function Test">Liver Function Test</option>
                    <option value="Kidney Function Test">Kidney Function Test</option>
                    <option value="Lipid Profile">Lipid Profile</option>
                    <option value="Thyroid Profile">Thyroid Profile</option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="ECG">ECG</option>
                    <option value="Ultrasound">Ultrasound</option>
                  </select>
                </div>
                
                {prescription.investigationsSuggested.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prescription.investigationsSuggested.map((investigation, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 
                          flex items-center gap-2"
                      >
                        <span>{investigation}</span>
                        <button
                          onClick={() => setPrescription(prev => ({
                            ...prev,
                            investigationsSuggested: prev.investigationsSuggested
                              .filter((_, i) => i !== index)
                          }))}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes & Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={prescription.additionalNotes}
                  onChange={(e) => setPrescription({
                    ...prescription,
                    additionalNotes: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows={3}
                  placeholder="Additional notes or instructions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={prescription.followUpDate}
                  onChange={(e) => setPrescription({
                    ...prescription,
                    followUpDate: e.target.value
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
              flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Prescription
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
      // VitalSignInput Component
const VitalSignInput = ({ label, value, unit, required = false, onChange }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        placeholder={`Enter ${label.toLowerCase()}`}
        required={required}
      />
      {unit && <span className="text-sm text-gray-500">{unit}</span>}
    </div>
  </div>
);                
const ActiveConsultation = ({ appointment, onClose, onSavePrescription }) => {
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Stethoscope className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Active Consultation</h2>
                <p className="text-gray-500">
                  With {appointment.patientName} - {appointment.mode === 'video' ? 'Video Call' : 'In Person'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Age: {appointment.age} years</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last Visit: {appointment.lastVisit || 'First Visit'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{appointment.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{appointment.phone}</span>
                </div>
              </div>
            </div>

            {appointment.symptoms && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Symptoms</h3>
                <p className="text-gray-600">{appointment.symptoms}</p>
              </div>
            )}

            {appointment.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Previous Notes</h3>
                <p className="text-gray-600">{appointment.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {appointment.mode === 'video' ? (
              <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Video Consultation</h3>
                </div>
                <p className="text-blue-600 text-sm">Start the video call to begin consultation.</p>
                <div className="flex flex-col gap-3">
                  <a
                    href={appointment.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg
                      hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-5 h-5" />
                    Join Video Call
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setShowPrescriptionForm(true)}
                    className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg
                      hover:bg-blue-50 transition-colors flex items-center justify-center gap-2
                      border-2 border-blue-200"
                  >
                    <FileText className="w-5 h-5" />
                    Write Prescription
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-teal-50 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <h3 className="font-medium text-teal-900">In-Person Consultation</h3>
                </div>
                <button
                  onClick={() => setShowPrescriptionForm(true)}
                  className="w-full px-4 py-3 bg-white text-teal-600 rounded-lg
                    hover:bg-teal-50 transition-colors flex items-center justify-center gap-2
                    border-2 border-teal-200"
                >
                  <FileText className="w-5 h-5" />
                  Write Prescription
                </button>
              </div>
            )}

            {/* Additional Actions */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100
                  rounded-lg flex items-center gap-2 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100
                  rounded-lg flex items-center gap-2 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPrescriptionForm && (
          <PrescriptionForm
            appointment={appointment}
            onSave={(prescriptionData) => {
              onSavePrescription(prescriptionData);
              setShowPrescriptionForm(false);
            }}
            onClose={() => setShowPrescriptionForm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// QuickViewModal Component
const QuickViewModal = ({ appointment, onClose, onStartConsultation }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal content */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-600" />
                </div>
                {appointment.mode === 'video' && <VideoCallBadge />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {appointment.patientName}
                </h3>
                <p className="text-gray-500">
                  {appointment.appointmentType}
                  {appointment.mode === 'video' && ' (Video Consultation)'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h4>
            <div className="flex items-center gap-2 text-gray-800">
              <Calendar className="w-4 h-4 text-teal-500" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800 mt-1">
              <Clock className="w-4 h-4 text-teal-500" />
              <span>{appointment.time}</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Info</h4>
            <div className="flex items-center gap-2 text-gray-800">
              <Phone className="w-4 h-4 text-teal-500" />
              <span>{appointment.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800 mt-1">
              <Mail className="w-4 h-4 text-teal-500" />
              <span>{appointment.email}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Medical Information</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {appointment.symptoms && (
              <div>
                <span className="text-sm font-medium text-gray-700">Symptoms:</span>
                <p className="text-gray-600">{appointment.symptoms}</p>
              </div>
            )}
            {appointment.notes && (
              <div>
                <span className="text-sm font-medium text-gray-700">Notes:</span>
                <p className="text-gray-600">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {appointment.mode === 'video' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Video Consultation Info</h4>
            <p className="text-blue-600 text-sm mb-2">
              Click the "Start Call" button below at the scheduled time to join the video consultation.
            </p>
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Video className="w-4 h-4" />
              <span>Meeting link: </span>
              <a 
                href={appointment.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-700"
              >
                {appointment.meetLink}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Close
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartConsultation(appointment)}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
            transition-colors flex items-center gap-2"
        >
          <Stethoscope className="w-4 h-4" />
          Start Consultation
        </motion.button>
      </div>
      </motion.div>
    </motion.div>
  );
};

// Main AppointmentsPage Component
const AppointmentsPage = () => {
  const { appointments, loading } = useAppointmentsData();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [prescriptions, setPrescriptions] = useState([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
              <p className="text-gray-500">Manage your appointments and consultations</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
              transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            New Appointment
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-teal-500
                focus:ring-4 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-teal-500
                focus:ring-4 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Appointments",
              value: appointments.length,
              color: "bg-blue-50 text-blue-600",
              icon: Calendar
            },
            {
              label: "Video Consultations",
              value: appointments.filter(apt => apt.mode === 'video').length,
              color: "bg-purple-50 text-purple-600",
              icon: Video
            },
            {
              label: "In-Person Visits",
              value: appointments.filter(apt => apt.mode === 'in-person').length,
              color: "bg-green-50 text-green-600",
              icon: User
            },
            {
              label: "Prescriptions Given",
              value: prescriptions.length,
              color: "bg-yellow-50 text-yellow-600",
              icon: FileText
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl ${stat.color.split(' ')[0]}`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.color.split(' ')[1]}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments
            .filter(apt => {
              const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
              return matchesSearch && matchesStatus;
            })
            .map(appointment => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 hover:border-teal-100 
                  hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  {/* Patient Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        {appointment.mode === 'video' && <VideoCallBadge />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-500">
                          {appointment.appointmentType}
                          {appointment.mode === 'video' && ' (Video)'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'upcoming'
                        ? 'bg-blue-50 text-blue-600'
                        : appointment.status === 'confirmed'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAppointment(appointment)}
                      className="flex-1 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg
                        hover:bg-teal-100 transition-colors text-sm font-medium"
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveConsultation(appointment)}
                      className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg
                        hover:bg-teal-600 transition-colors text-sm font-medium"
                    >
                      Start Consultation
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Empty State */}
          {appointments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
              <p className="text-gray-500">You don't have any appointments scheduled.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
{/* Modals */}
<AnimatePresence>
  {selectedAppointment && (
    <QuickViewModal
      appointment={selectedAppointment}
      onClose={() => setSelectedAppointment(null)}
      onStartConsultation={(appointment) => {
        setSelectedAppointment(null);
        setActiveConsultation(appointment);
      }}
    />
  )}
  {activeConsultation && (
    <ActiveConsultation
      appointment={activeConsultation}
      onClose={() => setActiveConsultation(null)}
      onSavePrescription={(prescriptionData) => {
        setPrescriptions([prescriptionData, ...prescriptions]);
        setActiveConsultation(null);
      }}
    />
  )}
</AnimatePresence>    </div>
  );
};

export default AppointmentsPage;