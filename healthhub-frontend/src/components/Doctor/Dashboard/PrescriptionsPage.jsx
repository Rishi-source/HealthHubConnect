import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Plus, Calendar, User, Pill,
  Clock, AlertCircle, X, Trash2, Edit2, Save,
  Filter, ChevronDown, Check, MoreVertical, Download,
  Eye, Printer, Activity, Heart, Thermometer, Stethoscope,
  UserCheck, Building2, Scale, Mail, Phone
} from 'lucide-react';

const MOCK_PRESCRIPTIONS = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    patientAge: 32,
    patientGender: "Female",
    date: "2025-01-13",
    diagnosis: "Hypertension, Type 2 Diabetes",
    vitals: {
      bloodPressure: "130/85",
      temperature: "98.6°F",
      heartRate: "76 bpm",
      spO2: "98%",
      weight: "68 kg",
      height: "165 cm",
      bmi: "25.0"
    },
    contact: {
      email: "sarah.j@email.com",
      phone: "+1 234-567-8900"
    },
    medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "3 months",
        instructions: "Take with meals"
      },
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "3 months",
        instructions: "Take in the morning"
      }
    ],
    notes: "Monitor blood pressure regularly. Follow-up in 3 months.",
    nextAppointment: "2025-04-13",
    status: "active",
    doctorName: "Dr. Emily White",
    hospital: "City Medical Center",
    department: "Internal Medicine",
    lastVisit: "2024-12-15"
  },
  {
    id: 2,
    patientName: "Michael Chen",
    patientAge: 45,
    patientGender: "Male",
    date: "2025-01-12",
    diagnosis: "Acute Bronchitis",
    vitals: {
      bloodPressure: "120/80",
      temperature: "99.2°F",
      heartRate: "82 bpm",
      spO2: "97%",
      weight: "75 kg",
      height: "175 cm",
      bmi: "24.5"
    },
    contact: {
      email: "michael.c@email.com",
      phone: "+1 234-567-8901"  
    },
    medications: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        duration: "7 days",
        instructions: "Complete full course"
      }
    ],
    notes: "Rest advised. Increase fluid intake.",
    nextAppointment: "2025-01-19",
    status: "active",
    doctorName: "Dr. Emily White",
    hospital: "City Medical Center",
    department: "General Medicine",
    lastVisit: "2024-12-01"
  }
];

const VitalSignInput = ({ label, value, unit, onChange }) => (
  <div className="p-3 border border-gray-200 rounded-lg">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 border border-gray-200 rounded 
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      />
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
  </div>
);

const MedicationInput = ({ medication, onChange, onRemove }) => (
  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Pill className="w-5 h-5 text-teal-600" />
        <h4 className="font-medium text-gray-700">Medication Details</h4>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400
          hover:text-red-500 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        placeholder="Medication name"
        value={medication.name}
        onChange={(e) => onChange({ ...medication, name: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      />
      <input
        placeholder="Dosage (e.g., 500mg)"
        value={medication.dosage}
        onChange={(e) => onChange({ ...medication, dosage: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        placeholder="Frequency (e.g., Twice daily)"
        value={medication.frequency}
        onChange={(e) => onChange({ ...medication, frequency: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      />
      <input
        placeholder="Duration (e.g., 7 days)"
        value={medication.duration}
        onChange={(e) => onChange({ ...medication, duration: e.target.value })}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg
          focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      />
    </div>

    <textarea
      placeholder="Special instructions or notes"
      value={medication.instructions}
      onChange={(e) => onChange({ ...medication, instructions: e.target.value })}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg
        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
      rows={2}
    />
  </div>
);

const ContactInput = ({ icon: Icon, label, value, onChange, type = "text" }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="w-4 h-4" />
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg
        focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
    />
  </div>
);

const PrescriptionDetailView = ({ prescription, onClose, onEdit }) => {
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Prescription Details</h2>
                <p className="text-gray-500">{prescription.date}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500
                hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <h3 className="font-medium text-teal-900">Doctor</h3>
                </div>
                <p className="text-teal-800">{prescription.doctorName}</p>
                <p className="text-sm text-teal-600">{prescription.department}</p>
              </div>

              <div className="p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <h3 className="font-medium text-teal-900">Hospital</h3>
                </div>
                <p className="text-teal-800">{prescription.hospital}</p>
              </div>

              <div className="p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="font-medium text-teal-900">Date</h3>
                </div>
                <p className="text-teal-800">{prescription.date}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-700">Patient Details</h4>
                  </div>
                  <p className="text-gray-900">{prescription.patientName}</p>
                  <p className="text-sm text-gray-500">
                    {prescription.patientAge} years, {prescription.patientGender}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {prescription.contact.email}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {prescription.contact.phone}
                    </p>
                  </div>
                </div>

                {prescription.vitals && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-gray-600" />
                        <h4 className="font-medium text-gray-700">Vital Signs</h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          BP: {prescription.vitals.bloodPressure}
                        </p>
                        <p className="text-sm text-gray-600">
                          Heart Rate: {prescription.vitals.heartRate}
                        </p>
                        <p className="text-sm text-gray-600">
                          SpO2: {prescription.vitals.spO2}
                        </p>
                        <p className="text-sm text-gray-600">
                          Temperature: {prescription.vitals.temperature}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-gray-600" />
                        <h4 className="font-medium text-gray-700">Measurements</h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Height: {prescription.vitals.height}
                        </p>
                        <p className="text-sm text-gray-600">
                          Weight: {prescription.vitals.weight}
                        </p>
                        <p className="text-sm text-gray-600">
                          BMI: {prescription.vitals.bmi}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Diagnosis</h3>
              <p className="text-gray-700">{prescription.diagnosis}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Prescribed Medications</h3>
              <div className="space-y-4">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-teal-600 mt-1" />
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{med.name}</h4>
                          <p className="text-gray-600">{med.dosage}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Frequency</p>
                            <p className="text-gray-700">{med.frequency}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-gray-700">{med.duration}</p>
                          </div>
                        </div>
                        {med.instructions && (
                          <div>
                            <p className="text-sm text-gray-500">Special Instructions</p>
                            <p className="text-gray-700">{med.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {prescription.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Notes</h3>
                <p className="text-gray-700">{prescription.notes}</p>
              </div>
            )}

            {prescription.nextAppointment && (
              <div className="p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="font-medium text-teal-900">Follow-up Appointment</h3>
                </div>
                <p className="text-teal-800">{prescription.nextAppointment}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg
                transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg
                transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose();
              onEdit(prescription);
            }}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
              transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Prescription
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PrescriptionForm = ({ initialData = null, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData || {
    patientName: "",
    patientAge: "",
    patientGender: "",
    date: new Date().toISOString().split('T')[0],
    diagnosis: "",
    vitals: {
      bloodPressure: "",
      temperature: "",
      heartRate: "",
      spO2: "",
      weight: "",
      height: "",
      bmi: ""
    },
    contact: {
      email: "",
      phone: ""
    },
    medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    notes: "",
    nextAppointment: "",
    status: "active",
    doctorName: "Dr. Emily White",
    hospital: "City Medical Center",
    department: "General Medicine"
  });

  const updateVitals = (field, value) => {
    setFormData({
      ...formData,
      vitals: { ...formData.vitals, [field]: value }
    });

    // Calculate BMI when weight or height changes
    if (field === 'weight' || field === 'height') {
      const weight = field === 'weight' ? parseFloat(value) : parseFloat(formData.vitals.weight);
      const height = field === 'height' ? parseFloat(value) / 100 : parseFloat(formData.vitals.height) / 100;
      
      if (weight && height) {
        const bmi = (weight / (height * height)).toFixed(1);
        setFormData(prev => ({
          ...prev,
          vitals: { ...prev.vitals, bmi }
        }));
      }
    }
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
        >
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {initialData ? 'Edit Prescription' : 'New Prescription'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg
                      focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Enter patient name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.patientAge}
                    onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg
                      focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.patientGender}
                    onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg
                      focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ContactInput
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(value) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: value }
                  })}
                />
                <ContactInput
                  icon={Phone}
                  label="Phone"
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(value) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: value }
                  })}
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Vital Signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VitalSignInput
                  label="Blood Pressure"
                  value={formData.vitals.bloodPressure}
                  unit="mmHg"
                  onChange={(value) => updateVitals('bloodPressure', value)}
                />
                <VitalSignInput
                  label="Temperature"
                  value={formData.vitals.temperature}
                  unit="°F"
                  onChange={(value) => updateVitals('temperature', value)}
                />
                <VitalSignInput
                  label="Heart Rate"
                  value={formData.vitals.heartRate}
                  unit="bpm"
                  onChange={(value) => updateVitals('heartRate', value)}
                />
                <VitalSignInput
                  label="SpO2"
                  value={formData.vitals.spO2}
                  unit="%"
                  onChange={(value) => updateVitals('spO2', value)}
                />
                <VitalSignInput
                  label="Weight"
                  value={formData.vitals.weight}
                  unit="kg"
                  onChange={(value) => updateVitals('weight', value)}
                />
                <VitalSignInput
                  label="Height"
                  value={formData.vitals.height}
                  unit="cm"
                  onChange={(value) => updateVitals('height', value)}
                />
              </div>

              {formData.vitals.bmi && (
                <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900">
                      BMI: {formData.vitals.bmi}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg
                  focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                rows={3}
                placeholder="Enter diagnosis"
              />
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Medications</h3>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    medications: [
                      ...formData.medications,
                      { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
                    ]
                  })}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>

              {formData.medications.map((med, index) => (
                <MedicationInput
                  key={index}
                  medication={med}
                  onChange={(updatedMed) => {
                    const newMeds = [...formData.medications];
                    newMeds[index] = updatedMed;
                    setFormData({ ...formData, medications: newMeds });
                  }}
                  onRemove={() => {
                    if (formData.medications.length > 1) {
                      setFormData({
                        ...formData,
                        medications: formData.medications.filter((_, i) => i !== index)
                      });
                    }
                  }}
                />
              ))}
            </div>

            {/* Notes and Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  rows={3}
                  placeholder="Additional notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Appointment
                </label>
                <input
                  type="date"
                  value={formData.nextAppointment}
                  onChange={(e) => setFormData({ ...formData, nextAppointment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg
              hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Prescription
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleNewPrescription = (prescriptionData) => {
    const newPrescription = {
      ...prescriptionData,
      id: prescriptions.length + 1,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setPrescriptions([newPrescription, ...prescriptions]);
    setShowNewPrescription(false);
  };

  const handleEditPrescription = (prescriptionData) => {
    const updatedPrescriptions = prescriptions.map(p =>
      p.id === editingPrescription.id ? { ...p, ...prescriptionData } : p
    );
    setPrescriptions(updatedPrescriptions);
    setEditingPrescription(null);
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      prescription.diagnosis.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Prescriptions</h1>
              <p className="text-gray-500">Manage patient prescriptions</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewPrescription(true)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600
              transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            New Prescription
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 
                transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 
              text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Prescriptions",
              value: prescriptions.length,
              icon: FileText,
              color: "bg-blue-50 text-blue-600"
            },
            {
              label: "Active Prescriptions",
              value: prescriptions.filter(p => p.status === 'active').length,
              icon: Clock,
              color: "bg-green-50 text-green-600"
            },
            {
              label: "Completed",
              value: prescriptions.filter(p => p.status === 'completed').length,
              icon: Check,
              color: "bg-teal-50 text-teal-600"
            },
            {
              label: "Follow-ups Required",
              value: prescriptions.filter(p => p.nextAppointment && new Date(p.nextAppointment) > new Date()).length,
              icon: Calendar,
              color: "bg-purple-50 text-purple-600"
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

        {/* Prescriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrescriptions.map((prescription) => (
            <motion.div
              key={prescription.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 
                hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{prescription.patientName}</h3>
                    <p className="text-sm text-gray-500">
                      {prescription.patientAge} years, {prescription.patientGender}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      prescription.status === 'active'
                        ? 'bg-green-50 text-green-600'
                        : prescription.status === 'completed'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-50 text-gray-600'
                    }`}>
                      {prescription.status}
                    </span>
                    <div className="relative group">
                      <button className="p-1 hover:bg-gray-50 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg 
                        shadow-lg border border-gray-200 py-1 w-48 hidden 
                        group-hover:block z-10">
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700
                            hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => setEditingPrescription(prescription)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700
                            hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Prescription
                        </button>
                        <button
                          onClick={() => {/* Handle download */}}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700
                            hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                        <button
                          onClick={() => {
                            setPrescriptions(prescriptions.filter(p => p.id !== prescription.id));
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600
                            hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h4>
                    <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Medications</h4>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Pill className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                          <div className="text-sm">
                            <p className="text-gray-900">{med.name} - {med.dosage}</p>
                            <p className="text-gray-500">{med.frequency}, {med.duration}</p>
                            {med.instructions && (
                              <p className="text-gray-500 italic">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{prescription.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{prescription.date}</span>
                    </div>
                    {prescription.nextAppointment && (
                      <div className="flex items-center gap-2 text-sm text-teal-600">
                        <Clock className="w-4 h-4" />
                        <span>Next: {prescription.nextAppointment}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredPrescriptions.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center 
                justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No prescriptions found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewPrescription && (
          <PrescriptionForm
            onSubmit={handleNewPrescription}
            onClose={() => setShowNewPrescription(false)}
          />
        )}
        {editingPrescription && (
          <PrescriptionForm
            initialData={editingPrescription}
            onSubmit={handleEditPrescription}
            onClose={() => setEditingPrescription(null)}
          />
        )}
        {selectedPrescription && (
          <PrescriptionDetailView
            prescription={selectedPrescription}
            onClose={() => setSelectedPrescription(null)}
            onEdit={(prescription) => {
              setSelectedPrescription(null);
              setEditingPrescription(prescription);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrescriptionsPage;
