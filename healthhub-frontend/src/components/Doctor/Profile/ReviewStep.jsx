import React from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Stethoscope, GraduationCap, Clock,
  Award, Building, Calendar, DollarSign, FileText, Wallet,
  Edit2, Check, AlertCircle, ArrowRight, ShieldCheck, 
  Globe, BookOpen, Star
} from 'lucide-react';


const DEFAULT_DATA = {
  basicInfo: {
    fullName: '',
    email: '',
    phone: '',
    medicalLicenseNumber: '',
    yearOfRegistration: '',
    experience: '',
    specializations: [],
    languages: []
  },
  qualifications: {
    degrees: [],
    certifications: []
  },
  practiceDetails: {
    affiliations: [],
    consultationTypes: {
      online: { enabled: false },
      inPerson: { enabled: false }
    }
  },
  schedule: {
    days: {}
  },
  policies: {
    cancellation: { policy: '', timeframe: '', fee: '' },
    noShow: { policy: '', fee: '' },
    paymentMethods: [],
    insuranceProviders: []
  },
  specializations: {
    specializations: []
  }
};

const SectionCard = ({ title, icon: Icon, children, onEdit, isComplete = true }) => (
  <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          isComplete ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {onEdit && (
        <button onClick={onEdit} 
          className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50 transition-colors">
          <Edit2 className="w-5 h-5" />
        </button>
      )}
    </div>
    <div className="divide-y divide-gray-100 space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 text-gray-600 py-1">
    {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
    <span className="font-medium min-w-[120px] text-gray-500">{label}:</span>
    <span className="text-gray-900">{value || 'Not provided'}</span>
  </div>
);

const ReviewStep = ({ data = DEFAULT_DATA, onEditSection = () => {}, validationStatus = {} }) => {
  
  const safeData = React.useMemo(() => {
    
    const merged = {
      ...DEFAULT_DATA,
      ...data,
      basicInfo: { ...DEFAULT_DATA.basicInfo, ...(data?.basicInfo || {}) },
      qualifications: { ...DEFAULT_DATA.qualifications, ...(data?.qualifications || {}) },
      practiceDetails: { ...DEFAULT_DATA.practiceDetails, ...(data?.practiceDetails || {}) },
      schedule: { ...DEFAULT_DATA.schedule, ...(data?.schedule?.payload || {}) },
      policies: { ...DEFAULT_DATA.policies, ...(data?.policies || {}) }
    };
  
    
    const specializationsData = data?.specializations?.payload?.specializations || 
                              data?.specializations?.specializations ||
                              DEFAULT_DATA.specializations.specializations;
  
    merged.specializations = {
      specializations: Array.isArray(specializationsData) ? specializationsData : []
    };
  
    console.log('Safe Data:', merged); 
    return merged;
  }, [data]);
  
  const renderTags = (items = []) => (
    <div className="flex flex-wrap gap-2">
      {(items || []).map((item, index) => (
        <span key={index} className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-sm">
          {item}
        </span>
      ))}
    </div>
  );

  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <SectionCard
        title="Basic Information"
        icon={User}
        onEdit={() => onEditSection('basicInfo')}
        isComplete={validationStatus.basicInfo}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Full Name" value={safeData.basicInfo?.fullName} icon={User} />
          <InfoRow label="Email" value={safeData.basicInfo?.email} icon={Mail} />
          <InfoRow label="Phone" value={safeData.basicInfo?.phone} icon={Phone} />
          <InfoRow label="License Number" value={safeData.basicInfo?.medicalLicenseNumber} icon={Award} />
          <InfoRow label="Experience" value={`${safeData.basicInfo?.experience || 0} years`} icon={Award} />
          <InfoRow label="Registration Year" value={safeData.basicInfo?.yearOfRegistration} icon={Calendar} />
        </div>
        
        <div className="space-y-4 pt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
            {renderTags(safeData.basicInfo?.specializations)}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
            {renderTags(safeData.basicInfo?.languages)}
          </div>
        </div>
      </SectionCard>

      
      <SectionCard
        title="Qualifications"
        icon={GraduationCap}
        onEdit={() => onEditSection('qualifications')}
        isComplete={validationStatus.qualifications}
      >
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Degrees</h4>
          <div className="space-y-3">
            {(safeData.qualifications?.degrees || []).map((degree, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="font-medium text-gray-900">{degree.name}</div>
                <div className="text-sm text-gray-600">
                  {degree.university}, {degree.country} ({degree.year})
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Certifications</h4>
          <div className="space-y-3">
            {(safeData.qualifications?.certifications || []).map((cert, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="font-medium text-gray-900">{cert.name}</div>
                <div className="text-sm text-gray-600">
                  {cert.issuingBody} ({cert.year})
                  {cert.expiryYear && ` - Expires: ${cert.expiryYear}`}
                </div>
                {cert.certificationNumber && (
                  <div className="text-sm text-gray-500">
                    Certificate #: {cert.certificationNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>


<SectionCard
  title="Medical Specializations"
  icon={Stethoscope}
  onEdit={() => onEditSection('specializations')}
  isComplete={validationStatus.specializations}
>
  <div className="space-y-6">
    {(safeData.specializations?.specializations || []).map((spec, index) => (
      <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {index === 0 && (
              <div className="p-1 bg-teal-100 rounded">
                <Star className="w-4 h-4 text-teal-500" />
              </div>
            )}
            <h5 className="font-medium text-gray-900">{spec.name || 'Unnamed Specialization'}</h5>
          </div>
          <span className="text-sm px-2 py-1 bg-teal-50 text-teal-600 rounded-full">
            {spec.expertiseLevel || 'No level specified'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <InfoRow label="Experience" value={`${spec.experience || 0} years`} icon={Clock} />
          {spec.subspecialty && (
            <InfoRow label="Sub-specialty" value={spec.subspecialty} icon={BookOpen} />
          )}
          <InfoRow label="Description" value={spec.description} icon={FileText} />
          {spec.profileLink && (
            <InfoRow label="Profile Link" value={spec.profileLink} icon={Globe} />
          )}
          {spec.certification && (
            <InfoRow label="Certification" value={spec.certification} icon={Award} />
          )}
        </div>

        {spec.procedures && spec.procedures.length > 0 && (
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-2">Procedures & Services</h6>
            <div className="space-y-2">
              {spec.procedures.map((proc, procIndex) => (
                <div key={procIndex} className="p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{proc.name}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {proc.duration && <span>{proc.duration}</span>}
                      {proc.cost && <span>|</span>}
                      {proc.cost && <span>{formatCurrency(proc.cost)}</span>}
                    </div>
                  </div>
                  {proc.description && (
                    <p className="text-sm text-gray-600">{proc.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</SectionCard>
      
      <SectionCard
        title="Practice Details"
        icon={Building}
        onEdit={() => onEditSection('practiceDetails')}
        isComplete={validationStatus.practiceDetails}
      >
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hospital Affiliations</h4>
          {(safeData.practiceDetails?.affiliations || []).map((aff, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="font-medium text-gray-900">{aff.name}</div>
              <InfoRow label="Address" value={aff.address} />
              <InfoRow label="City" value={aff.city} />
              <InfoRow label="State" value={aff.state} />
              <InfoRow label="Country" value={aff.country} />
              <InfoRow label="Phone" value={aff.phone} />
              <InfoRow label="Working Hours" value={aff.workingHours} />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Consultation Types</h4>
          {safeData.practiceDetails?.consultationTypes?.online?.enabled && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2 mb-3">
              <div className="font-medium text-gray-900">Online Consultation</div>
              <InfoRow label="Fee" value={formatCurrency(safeData.practiceDetails?.consultationTypes?.online?.fee)} />
              <InfoRow label="Duration" value={`${safeData.practiceDetails?.consultationTypes?.online?.duration || 0} minutes`} />
              <InfoRow label="Follow-up Fee" value={formatCurrency(safeData.practiceDetails?.consultationTypes?.online?.followupFee)} />
              <InfoRow label="Follow-up Window" value={`${safeData.practiceDetails?.consultationTypes?.online?.followupWindow || 0} days`} />
            </div>
          )}

          {safeData.practiceDetails?.consultationTypes?.inPerson?.enabled && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="font-medium text-gray-900">In-Person Consultation</div>
              <InfoRow label="Fee" value={formatCurrency(safeData.practiceDetails?.consultationTypes?.inPerson?.fee)} />
              <InfoRow label="Duration" value={`${safeData.practiceDetails?.consultationTypes?.inPerson?.duration || 0} minutes`} />
              <InfoRow label="Follow-up Fee" value={formatCurrency(safeData.practiceDetails?.consultationTypes?.inPerson?.followupFee)} />
              <InfoRow label="Follow-up Window" value={`${safeData.practiceDetails?.consultationTypes?.inPerson?.followupWindow || 0} days`} />
            </div>
          )}
        </div>
      </SectionCard>

      
      <SectionCard
        title="Schedule"
        icon={Clock}
        onEdit={() => onEditSection('schedule')}
        isComplete={validationStatus.schedule}
      >
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(safeData.schedule?.days || {}).map(([day, schedule], index) => (
            <div
              key={day}
              className={`p-3 rounded-lg text-center ${
                schedule.enabled
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-gray-50 text-gray-500'
              }`}
            >
              <div className="text-sm font-medium">{day.slice(0, 3)}</div>
              {schedule.enabled ? (
                <>
                  <div className="text-xs mt-1">
                    {schedule.workingHours?.start} - {schedule.workingHours?.end}
                  </div>
                  <div className="text-xs mt-1">
                    {schedule.slots?.length || 0} slots
                  </div>
                  <div className="text-xs mt-1">
                    {schedule.breaks?.length || 0} breaks
                  </div>
                </>
              ) : (
                <div className="text-xs mt-1">Off</div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      
      <SectionCard
        title="Patient Policies"
        icon={ShieldCheck}
        onEdit={() => onEditSection('policies')}
        isComplete={validationStatus.policies}
      >
        <div className="space-y-6">
        <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cancellation & No-Show Policies</h4>
            <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
  <div className="font-medium text-gray-900">Cancellation Policy</div>
  <InfoRow label="Policy" value={safeData.policies?.cancellationPolicy} />
  <InfoRow label="Timeframe" value={safeData.policies?.cancellationTimeframe} />
  <InfoRow label="Fee" value={formatCurrency(safeData.policies?.cancellationFee)} />
</div>

<div className="p-3 bg-gray-50 rounded-lg space-y-2">
  <div className="font-medium text-gray-900">No-Show Policy</div>
  <InfoRow label="Policy" value={safeData.policies?.noShowPolicy} />
  <InfoRow label="Fee" value={formatCurrency(safeData.policies?.noShowFee)} />
</div>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h4>
            {renderTags(safeData.policies?.paymentMethods)}
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h4>
            <div className="space-y-4">
              <InfoRow label="Consultation Prep" value={safeData.policies?.consultationPrep} />
              <InfoRow label="Required Documents" value={safeData.policies?.documentationRequired} />
              <InfoRow label="Follow-up Policy" value={safeData.policies?.followUpPolicy} />
              <InfoRow label="Emergency Policy" value={safeData.policies?.emergencyPolicy} />
            </div>
          </div>

          {(safeData.policies?.insuranceProviders || []).length > 0 && (
            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Insurance Providers</h4>
              <div className="space-y-3">
                {safeData.policies.insuranceProviders.map((provider, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="font-medium text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-600">
                      Accepted Plans: {provider.planTypes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      
      {Object.values(validationStatus).some(status => !status) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-amber-600 font-medium">
              Some sections require your attention
            </p>
            <div className="space-y-1">
              {Object.entries(validationStatus).map(([section, isValid]) => !isValid && (
                <div key={section} className="flex items-center gap-2 text-sm text-amber-600">
                  <ArrowRight className="w-4 h-4" />
                  <span>{section.replace(/([A-Z])/g, ' $1').trim()} section needs completion</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <Check className={`w-5 h-5 ${
            Object.values(validationStatus).every(status => status)
              ? 'text-green-500'
              : 'text-amber-500'
          }`} />
          <span className="font-medium text-gray-900">
            Profile Completion Status
          </span>
        </div>
        <span className="text-sm">
          {Object.values(validationStatus).filter(status => status).length} of {
            Object.values(validationStatus).length
          } sections complete
        </span>
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .grid-cols-7 {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewStep;