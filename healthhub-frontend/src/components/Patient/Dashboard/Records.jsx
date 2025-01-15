import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Calendar, Filter,
  ChevronDown, Download, Eye, AlertCircle,
  Clock, User, Building, Pill, Plus,
  ArrowRight, Link, Activity
} from 'lucide-react';
import PrescriptionDetailModal from '/root/HealthHubConnect/healthhub-frontend/src/components/Prescription.jsx';
const MOCK_RECORDS = [
  {
    id: 1,
    date: "2025-01-10",
    type: "Regular Checkup",
    doctorName: "Dr. Sarah Wilson",
    hospital: "City General Hospital",
    symptoms: ["Fever", "Cough", "Fatigue"],
    diagnosis: "Upper Respiratory Infection",
    vitals: {
      bloodPressure: "120/80",
      temperature: "99.2°F",
      heartRate: "78 bpm",
      oxygenSaturation: "98%"
    },
    prescription: {
      medications: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "3 times daily",
          duration: "7 days",
          instructions: "Take with meals"
        },
        {
          name: "Acetaminophen",
          dosage: "650mg",
          frequency: "As needed",
          duration: "5 days",
          instructions: "Take for fever or pain"
        }
      ],
      notes: "Take complete rest for 3 days. Increase fluid intake.",
      additionalInstructions: "Avoid cold beverages. Use warm water gargle."
    },
    followUpDate: "2025-01-17",
    documents: [],
    status: "completed"
  },
  {
    id: 2,
    date: "2024-12-15",
    type: "Specialist Consultation",
    doctorName: "Dr. Michael Chen",
    hospital: "Heart Care Center",
    symptoms: ["Chest Pain", "Shortness of Breath"],
    diagnosis: "Anxiety-induced Chest Pain",
    vitals: {
      bloodPressure: "130/85",
      temperature: "98.6°F",
      heartRate: "88 bpm",
      oxygenSaturation: "97%"
    },
    prescription: {
      medications: [
        {
          name: "Propranolol",
          dosage: "20mg",
          frequency: "Twice daily",
          duration: "30 days",
          instructions: "Take before meals"
        }
      ],
      notes: "Practice relaxation techniques. Avoid caffeine.",
      additionalInstructions: "Maintain stress diary. Practice deep breathing exercises."
    },
    followUpDate: "2025-01-15",
    documents: [],
    status: "completed"
  }
];

const PrescriptionView = ({ prescription }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between p-3 
          bg-gray-800 rounded-lg text-left group hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-gray-200">
            View Prescription Details
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform
            ${showDetails ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              <div className="space-y-3">
                {prescription.medications.map((med, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-lg flex items-start gap-3"
                  >
                    <Pill className="w-5 h-5 text-teal-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-100">{med.name}</p>
                          <p className="text-sm text-gray-400">{med.dosage}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                          {med.duration}
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-300">
                          Take {med.frequency.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

    
              {prescription.notes && (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h4 className="font-medium text-gray-300">Instructions</h4>
                  </div>
                  <p className="text-sm text-gray-400">{prescription.notes}</p>
                </div>
              )}

         
              <div className="flex items-center justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg
                    hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const RecordCard = ({ record, onViewDetails }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border dark:border-gray-700 border-gray-200
        dark:bg-gray-800/50 hover:shadow-md transition-all duration-200"
    >
      <div className="p-6 space-y-4">
     
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-teal-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-100">{record.type}</h3>
              <p className="text-sm text-gray-400">{record.date}</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full 
            ${record.status === 'completed'
              ? 'bg-green-900/30 text-green-400'
              : 'bg-yellow-900/30 text-yellow-400'}`}
          >
            {record.status}
          </span>
        </div>

     
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="w-4 h-4 text-gray-500" />
              <span>{record.doctorName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Building className="w-4 h-4 text-gray-500" />
              <span>{record.hospital}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Activity className="w-4 h-4 text-gray-500" />
              <span>BP: {record.vitals.bloodPressure}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>HR: {record.vitals.heartRate}</span>
            </div>
          </div>
        </div>

      
        <div className="flex flex-wrap gap-2">
          {record.symptoms.map((symptom, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
            >
              {symptom}
            </span>
          ))}
        </div>

   
        <div className="p-3 bg-gray-900/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-200 mb-2">Diagnosis</h4>
          <p className="text-sm text-gray-300">{record.diagnosis}</p>
        </div>

    
        {record.prescription && <PrescriptionView prescription={record.prescription} />}

   
        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            {record.documents.map((doc, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-900/50 text-gray-300 rounded-full text-sm"
              >
                {doc}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {record.followUpDate && (
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Follow-up: {record.followUpDate}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails(record)}
              className="flex items-center gap-2 text-teal-400 hover:text-teal-300
                transition-colors ml-4"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">View Details</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailModal = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden
          border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Medical Record Details</h2>
                <p className="text-sm text-gray-400">{record.date}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
           
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Appointment Type</h3>
                <p className="text-gray-100">{record.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                <span className={`px-3 py-1 text-sm rounded-full inline-block
                  ${record.status === 'completed'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-yellow-900/30 text-yellow-400'}`}
                >
                  {record.status}
                </span>
              </div>
            </div>

        
            <div className="p-4 bg-gray-800 rounded-xl space-y-4">
              <h3 className="font-medium text-gray-100">Healthcare Provider</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Doctor</p>
                  <p className="font-medium text-gray-100">{record.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Facility</p>
                  <p className="font-medium text-gray-100">{record.hospital}</p>
                </div>
              </div>
            </div>

        
            <div>
              <h3 className="font-medium text-gray-100 mb-4">Vital Signs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(record.vitals).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="font-medium text-gray-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>

         
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-100 mb-3">Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {record.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-100 mb-3">Diagnosis</h3>
                <p className="text-gray-300">{record.diagnosis}</p>
              </div>
            </div>

           
            <div>
              <h3 className="font-medium text-gray-100 mb-4">Prescription</h3>
              <div className="space-y-4">
                {record.prescription.medications.map((med, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-lg flex items-start gap-3"
                  >
                    <Pill className="w-5 h-5 text-teal-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-100">{med.name}</p>
                      <p className="text-sm text-gray-400">
                        {med.dosage} - {med.frequency}
                      </p>
                      <p className="text-sm text-gray-400">Duration: {med.duration}</p>
                    </div>
                  </div>
                ))}
                {record.prescription.notes && (
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                    <p className="text-sm text-gray-300">{record.prescription.notes}</p>
                  </div>
                )}
              </div>
            </div>

           
            {record.documents && record.documents.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-100 mb-4">Related Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {record.documents.map((doc, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center
            justify-between hover:border-teal-500 hover:bg-gray-700
            transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-400" />
                        <span className="text-gray-300">{doc}</span>
                      </div>
                      <Download className="w-4 h-4 text-gray-500 group-hover:text-teal-400" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
        
            {record.followUpDate && (
              <div className="p-4 bg-teal-900/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-sm text-teal-400">Follow-up Appointment</p>
                    <p className="font-medium text-teal-300">{record.followUpDate}</p>
                  </div>
                </div>
                <Link className="w-5 h-5 text-teal-400" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg
              transition-colors flex items-center justify-center gap-2"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Records = () => {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || record.type === filterType;

    if (filterTimeframe === 'all') return matchesSearch && matchesType;

    const recordDate = new Date(record.date);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    switch (filterTimeframe) {
      case '30days':
        return matchesSearch && matchesType && recordDate >= thirtyDaysAgo;
      case '90days':
        return matchesSearch && matchesType && recordDate >= ninetyDaysAgo;
      default:
        return matchesSearch && matchesType;
    }
  });

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleExportRecords = () => {
    
    console.log("Exporting records...");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
     
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Medical Records</h1>
              <p className="text-gray-400">View and manage your medical history</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportRecords}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white 
              rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Records
          </motion.button>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
                text-gray-100 placeholder-gray-500 focus:ring-4 focus:ring-teal-500/20 
                focus:border-teal-500 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
                text-gray-100 appearance-none focus:ring-4 focus:ring-teal-500/20 
                focus:border-teal-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="Regular Checkup">Regular Checkup</option>
              <option value="Specialist Consultation">Specialist Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
                text-gray-100 appearance-none focus:ring-4 focus:ring-teal-500/20 
                focus:border-teal-500 transition-all"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecords.map(record => (
            <RecordCard
              key={record.id}
              record={record}
              onViewDetails={setSelectedRecord}
            />
          ))}

          {filteredRecords.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">No Records Found</h3>
              <p className="text-gray-400 max-w-md">
                We couldn't find any medical records matching your search criteria.
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <DetailModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
        {showPrescriptionModal && selectedPrescription && (
          <PrescriptionDetailModal
            prescription={prescriptionData}
            onClose={() => setShowModal(false)}
            onEdit={(prescription) => {
              setShowModal(false);
              handleEditPrescription(prescription);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Records;
