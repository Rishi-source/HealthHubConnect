import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, BookOpen, Users, Star, GraduationCap, Link,
  Plus, X, AlertCircle, FileText, Globe, Calendar,
  Building, Edit2, Trash2, Medal, Sparkles, Book
} from 'lucide-react';


const InputField = memo(({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  touched,
  required = false,
  placeholder,
  multiline = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const InputComponent = multiline ? 'textarea' : 'input';
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <InputComponent
          type={type}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 ${Icon ? 'pl-12' : ''}
            rounded-xl border-2 transition-colors duration-300
            ${error && touched
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
            }
            dark:bg-gray-800 dark:text-white
            ${multiline ? 'min-h-[100px]' : ''}
            ${className}
          `}
          placeholder={placeholder}
          rows={multiline ? 4 : undefined}
          {...props}
        />
        {Icon && (
          <Icon className={`
            absolute left-4 ${multiline ? 'top-4' : 'top-1/3 transform -translate-y-1/2'}
            text-gray-400 dark:text-gray-500
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


const PublicationCard = memo(({
  publication,
  index,
  onUpdate,
  onRemove,
  errors = {},
  touched = {}
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-6 relative group"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onRemove(index)}
      className="absolute -top-2 -right-2 p-2 bg-red-100 dark:bg-red-900/50
        rounded-full text-red-500 dark:text-red-400
        opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
        transition-all duration-300 hover:bg-red-200 dark:hover:bg-red-900"
    >
      <Trash2 className="w-4 h-4" />
    </motion.button>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        icon={BookOpen}
        label="Publication Title"
        value={publication.title}
        onChange={(e) => onUpdate(index, { ...publication, title: e.target.value })}
        error={errors.title}
        touched={touched.title}
        required
        placeholder="Title of your research paper or publication"
      />

      <InputField
        icon={Building}
        label="Journal/Publication"
        value={publication.journal}
        onChange={(e) => onUpdate(index, { ...publication, journal: e.target.value })}
        error={errors.journal}
        touched={touched.journal}
        required
        placeholder="Name of the journal or publication venue"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField
        icon={Calendar}
        label="Year"
        type="number"
        value={publication.year}
        onChange={(e) => onUpdate(index, { ...publication, year: e.target.value })}
        error={errors.year}
        touched={touched.year}
        required
        min="1950"
        max={new Date().getFullYear()}
        placeholder="Publication year"
      />

      <InputField
        icon={Globe}
        label="DOI/URL"
        value={publication.url}
        onChange={(e) => onUpdate(index, { ...publication, url: e.target.value })}
        error={errors.url}
        touched={touched.url}
        placeholder="Digital Object Identifier or URL"
      />

      <InputField
        icon={Users}
        label="Co-authors"
        value={publication.coauthors}
        onChange={(e) => onUpdate(index, { ...publication, coauthors: e.target.value })}
        error={errors.coauthors}
        touched={touched.coauthors}
        placeholder="List of co-authors (optional)"
      />
    </div>

    <InputField
      icon={FileText}
      label="Abstract/Summary"
      value={publication.abstract}
      onChange={(e) => onUpdate(index, { ...publication, abstract: e.target.value })}
      error={errors.abstract}
      touched={touched.abstract}
      multiline
      placeholder="Brief summary of the publication..."
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Citations:</span>
        <input
          type="number"
          value={publication.citations || ''}
          onChange={(e) => onUpdate(index, { ...publication, citations: e.target.value })}
          className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700
            dark:bg-gray-800"
          min="0"
          placeholder="0"
        />
      </div>

      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-blue-500" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Impact Factor:</span>
        <input
          type="number"
          step="0.01"
          value={publication.impactFactor || ''}
          onChange={(e) => onUpdate(index, { ...publication, impactFactor: e.target.value })}
          className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700
            dark:bg-gray-800"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center gap-2">
        <Book className="w-4 h-4 text-purple-500" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
        <select
          value={publication.type || 'article'}
          onChange={(e) => onUpdate(index, { ...publication, type: e.target.value })}
          className="flex-1 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700
            dark:bg-gray-800"
        >
          <option value="article">Journal Article</option>
          <option value="conference">Conference Paper</option>
          <option value="book">Book Chapter</option>
          <option value="review">Review Article</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  </motion.div>
));


const AwardCard = memo(({
  award,
  index,
  onUpdate,
  onRemove,
  errors = {},
  touched = {}
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-6 relative group"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onRemove(index)}
      className="absolute -top-2 -right-2 p-2 bg-red-100 dark:bg-red-900/50
        rounded-full text-red-500 dark:text-red-400
        opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
        transition-all duration-300 hover:bg-red-200 dark:hover:bg-red-900"
    >
      <Trash2 className="w-4 h-4" />
    </motion.button>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        icon={Award}
        label="Award Name"
        value={award.name}
        onChange={(e) => onUpdate(index, { ...award, name: e.target.value })}
        error={errors.name}
        touched={touched.name}
        required
        placeholder="Name of the award or recognition"
      />

      <InputField
        icon={Building}
        label="Awarding Organization"
        value={award.organization}
        onChange={(e) => onUpdate(index, { ...award, organization: e.target.value })}
        error={errors.organization}
        touched={touched.organization}
        required
        placeholder="Organization that presented the award"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        icon={Calendar}
        label="Year"
        type="number"
        value={award.year}
        onChange={(e) => onUpdate(index, { ...award, year: e.target.value })}
        error={errors.year}
        touched={touched.year}
        required
        min="1950"
        max={new Date().getFullYear()}
        placeholder="Year received"
      />

      <InputField
        icon={Medal}
        label="Category/Field"
        value={award.category}
        onChange={(e) => onUpdate(index, { ...award, category: e.target.value })}
        error={errors.category}
        touched={touched.category}
        placeholder="Field or category of achievement"
      />
    </div>

    <InputField
      icon={FileText}
      label="Description"
      value={award.description}
      onChange={(e) => onUpdate(index, { ...award, description: e.target.value })}
      error={errors.description}
      touched={touched.description}
      multiline
      placeholder="Description of the award and achievement..."
    />

    
    <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          
          
          if (e.target.files?.[0]) {
            onUpdate(index, { ...award, certificate: e.target.files[0].name });
          }
        }}
        className="hidden"
        id={`award-cert-${index}`}
      />
      <label
        htmlFor={`award-cert-${index}`}
        className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-200
          dark:border-gray-700 text-gray-500 dark:text-gray-400
          hover:border-teal-500 hover:text-teal-500
          dark:hover:border-teal-400 dark:hover:text-teal-400
          transition-colors duration-300 cursor-pointer flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Upload Certificate
      </label>
      {award.certificate && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {award.certificate}
        </span>
      )}
    </div>
  </motion.div>
));


const MembershipCard = memo(({
  membership,
  index,
  onUpdate,
  onRemove,
  errors = {},
  touched = {}
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-6 relative group"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onRemove(index)}
      className="absolute -top-2 -right-2 p-2 bg-red-100 dark:bg-red-900/50
        rounded-full text-red-500 dark:text-red-400
        opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100
        transition-all duration-300 hover:bg-red-200 dark:hover:bg-red-900"
    >
      <Trash2 className="w-4 h-4" />
    </motion.button>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        icon={Users}
        label="Organization"
        value={membership.organization}
        onChange={(e) => onUpdate(index, { ...membership, organization: e.target.value })}
        error={errors.organization}
        touched={touched.organization}
        required
        placeholder="Name of the professional organization"
      />

      <InputField
        icon={Award}
        label="Membership Level"
        value={membership.membershipLevel}
        onChange={(e) => onUpdate(index, { ...membership, membershipLevel: e.target.value })}
        error={errors.membershipLevel}
        touched={touched.membershipLevel}
        placeholder="e.g., Fellow, Member, Associate"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField
        icon={Calendar}
        label="Join Year"
        type="number"
        value={membership.joinYear}
        onChange={(e) => onUpdate(index, { ...membership, joinYear: e.target.value })}
        error={errors.joinYear}
        touched={touched.joinYear}
        required
        min="1950"
        max={new Date().getFullYear()}
        placeholder="Year joined"
      />

      <InputField
        icon={Calendar}
        label="Renewal Date"
        type="date"
        value={membership.renewalDate}
        onChange={(e) => onUpdate(index, { ...membership, renewalDate: e.target.value })}
        error={errors.renewalDate}
        touched={touched.renewalDate}
        min={new Date().toISOString().split('T')[0]}
        placeholder="Next renewal date"
      />

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={membership.isActive}
            onChange={(e) => onUpdate(index, { ...membership, isActive: e.target.checked })}
            className="rounded text-teal-500 focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Active Membership
          </span>
        </label>
      </div>
    </div>

    <InputField
      icon={FileText}
      label="Role & Contributions"
      value={membership.contributions}
      onChange={(e) => onUpdate(index, { ...membership, contributions: e.target.value })}
      error={errors.contributions}
      touched={touched.contributions}
      multiline
      placeholder="Describe your role and contributions within the organization..."
    />

    
    <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUpdate(index, { ...membership, certificate: e.target.files[0].name });
          }
        }}
        className="hidden"
        id={`membership-cert-${index}`}
      />
      <label
        htmlFor={`membership-cert-${index}`}
        className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-200
          dark:border-gray-700 text-gray-500 dark:text-gray-400
          hover:border-teal-500 hover:text-teal-500
          dark:hover:border-teal-400 dark:hover:text-teal-400
          transition-colors duration-300 cursor-pointer flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Upload Membership Certificate
      </label>
      {membership.certificate && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {membership.certificate}
        </span>
      )}
    </div>
  </motion.div>
));


const ProfessionalBackgroundStep = ({
  data = {
    publications: [],
    awards: [],
    memberships: []
  },
  onChange = () => { },
  onValidationChange = () => { }
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationMessage, setValidationMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('publications');

  
  const validatePublication = (publication) => {
    const errors = {};
    
    if (!publication.title?.trim()) {
      errors.title = 'Publication title is required';
    }
    if (!publication.journal?.trim()) {
      errors.journal = 'Journal name is required';
    }
    if (!publication.year) {
      errors.year = 'Publication year is required';
    }
    if (publication.url && !isValidURL(publication.url)) {
      errors.url = 'Please enter a valid URL';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const validateAward = (award) => {
    const errors = {};
    
    if (!award.name?.trim()) {
      errors.name = 'Award name is required';
    }
    if (!award.organization?.trim()) {
      errors.organization = 'Awarding organization is required';
    }
    if (!award.year) {
      errors.year = 'Award year is required';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const validateMembership = (membership) => {
    const errors = {};
    
    if (!membership.organization?.trim()) {
      errors.organization = 'Organization name is required';
    }
    if (!membership.joinYear) {
      errors.joinYear = 'Join year is required';
    }
    if (membership.renewalDate && new Date(membership.renewalDate) < new Date()) {
      errors.renewalDate = 'Renewal date must be in the future';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  
  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  
  const validateForm = (formData) => {
    const newErrors = {
      publications: {},
      awards: {},
      memberships: {}
    };
    let hasErrors = false;

    formData.publications?.forEach((pub, index) => {
      const pubErrors = validatePublication(pub);
      if (pubErrors) {
        newErrors.publications[index] = pubErrors;
        hasErrors = true;
      }
    });

    formData.awards?.forEach((award, index) => {
      const awardErrors = validateAward(award);
      if (awardErrors) {
        newErrors.awards[index] = awardErrors;
        hasErrors = true;
      }
    });

    formData.memberships?.forEach((membership, index) => {
      const membershipErrors = validateMembership(membership);
      if (membershipErrors) {
        newErrors.memberships[index] = membershipErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    const message = hasErrors
      ? 'Please complete all required fields and correct any errors'
      : null;
    setValidationMessage(message);
    onValidationChange(!hasErrors);

    return !hasErrors;
  };

  
  useEffect(() => {
    validateForm(data);
  }, []);

  
  const handlePublicationUpdate = (index, updatedPublication) => {
    const newPublications = [...data.publications];
    newPublications[index] = updatedPublication;

    const newData = {
      ...data,
      publications: newPublications
    };

    onChange(newData);
    validateForm(newData);
  };

  const handlePublicationRemove = (index) => {
    const newPublications = data.publications.filter((_, i) => i !== index);
    const newData = {
      ...data,
      publications: newPublications
    };

    onChange(newData);
    validateForm(newData);
  };

  
  const handleAwardUpdate = (index, updatedAward) => {
    const newAwards = [...data.awards];
    newAwards[index] = updatedAward;

    const newData = {
      ...data,
      awards: newAwards
    };

    onChange(newData);
    validateForm(newData);
  };

  const handleAwardRemove = (index) => {
    const newAwards = data.awards.filter((_, i) => i !== index);
    const newData = {
      ...data,
      awards: newAwards
    };

    onChange(newData);
    validateForm(newData);
  };

  
  const handleMembershipUpdate = (index, updatedMembership) => {
    const newMemberships = [...data.memberships];
    newMemberships[index] = updatedMembership;

    const newData = {
      ...data,
      memberships: newMemberships
    };

    onChange(newData);
    validateForm(newData);
  };

  const handleMembershipRemove = (index) => {
    const newMemberships = data.memberships.filter((_, i) => i !== index);
    const newData = {
      ...data,
      memberships: newMemberships
    };

    onChange(newData);
    validateForm(newData);
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-wrap gap-4">
        {[
          { id: 'publications', icon: BookOpen, label: 'Publications' },
          { id: 'awards', icon: Award, label: 'Awards' },
          { id: 'memberships', icon: Users, label: 'Memberships' }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl
              transition-all duration-300
              ${activeSection === section.id
                ? 'bg-teal-50 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <section.icon className="w-5 h-5" />
            <span>{section.label}</span>
            <span className="ml-2 px-2 py-0.5 text-sm rounded-full bg-white dark:bg-gray-800">
              {data[section.id]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      
      <AnimatePresence mode="wait">
        {activeSection === 'publications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-500" />
                Research Publications
              </h3>
              <button
                onClick={() => {
                  const newData = {
                    ...data,
                    publications: [
                      ...data.publications,
                      {
                        title: '',
                        journal: '',
                        year: '',
                        url: '',
                        coauthors: '',
                        abstract: '',
                        citations: '',
                        impactFactor: '',
                        type: 'article'
                      }
                    ]
                  };
                  onChange(newData);
                }}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700
                  dark:text-teal-400 dark:hover:text-teal-300"
              >
                <Plus className="w-5 h-5" />
                Add Publication
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {data.publications?.map((publication, index) => (
                  <PublicationCard
                    key={index}
                    publication={publication}
                    index={index}
                    onUpdate={handlePublicationUpdate}
                    onRemove={handlePublicationRemove}
                    errors={errors.publications?.[index] || {}}
                    touched={touched}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        
        {activeSection === 'awards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-500" />
                Awards & Recognition
              </h3>
              <button
                onClick={() => {
                  const newData = {
                    ...data,
                    awards: [
                      ...data.awards,
                      {
                        name: '',
                        organization: '',
                        year: '',
                        category: '',
                        description: '',
                        certificate: ''
                      }
                    ]
                  };
                  onChange(newData);
                }}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700
                  dark:text-teal-400 dark:hover:text-teal-300"
              >
                <Plus className="w-5 h-5" />
                Add Award
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {data.awards?.map((award, index) => (
                  <AwardCard
                    key={index}
                    award={award}
                    index={index}
                    onUpdate={handleAwardUpdate}
                    onRemove={handleAwardRemove}
                    errors={errors.awards?.[index] || {}}
                    touched={touched}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        
        {activeSection === 'memberships' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-500" />
                Professional Memberships
              </h3>
              <button
                onClick={() => {
                  const newData = {
                    ...data,
                    memberships: [
                        ...data.memberships,
                        {
                          organization: '',
                          membershipLevel: '',
                          joinYear: '',
                          renewalDate: '',
                          isActive: true,
                          contributions: '',
                          certificate: ''
                        }
                      ]
                    };
                    onChange(newData);
                  }}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700
                    dark:text-teal-400 dark:hover:text-teal-300"
                >
                  <Plus className="w-5 h-5" />
                  Add Membership
                </button>
              </div>
  
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {data.memberships?.map((membership, index) => (
                    <MembershipCard
                      key={index}
                      membership={membership}
                      index={index}
                      onUpdate={handleMembershipUpdate}
                      onRemove={handleMembershipRemove}
                      errors={errors.memberships?.[index] || {}}
                      touched={touched}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            Professional Background Summary
          </h4>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-lg">
                  <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h5 className="font-medium text-teal-900 dark:text-teal-100">
                    Research Publications
                  </h5>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-teal-600 dark:text-teal-300">
                      {data.publications?.length || 0} publications
                    </p>
                    <p className="text-sm text-teal-600 dark:text-teal-300">
                      {calculateTotalCitations(data.publications)} total citations
                    </p>
                  </div>
                </div>
              </div>
  
              {data.publications?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.publications.slice(0, 3).map((pub, index) => (
                    <div key={index} className="text-sm text-teal-700 dark:text-teal-300">
                      {pub.title.length > 50 ? `${pub.title.slice(0, 50)}...` : pub.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-medium text-blue-900 dark:text-blue-100">
                    Awards & Recognition
                  </h5>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {data.awards?.length || 0} awards received
                    </p>
                    {data.awards?.length > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Latest in {getLatestYear(data.awards)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
  
              {data.awards?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.awards.slice(0, 3).map((award, index) => (
                    <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                      {award.name} ({award.year})
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h5 className="font-medium text-purple-900 dark:text-purple-100">
                    Professional Memberships
                  </h5>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-purple-600 dark:text-purple-300">
                      {data.memberships?.filter(m => m.isActive).length || 0} active memberships
                    </p>
                    {data.memberships?.length > 0 && (
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Member since {getEarliestYear(data.memberships)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
  
              {data.memberships?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.memberships
                    .filter(m => m.isActive)
                    .slice(0, 3)
                    .map((membership, index) => (
                      <div key={index} className="text-sm text-purple-700 dark:text-purple-300">
                        {membership.organization}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
  
          
          <AnimatePresence>
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2 text-amber-600 bg-amber-50 
                  dark:bg-amber-900/50 dark:text-amber-400 p-4 rounded-xl shadow-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
  
        
        {(() => {
          
          function calculateTotalCitations(publications) {
            return publications?.reduce((total, pub) => {
              return total + (parseInt(pub.citations) || 0);
            }, 0) || 0;
          }
  
          
          function getLatestYear(items) {
            if (!items?.length) return '';
            return Math.max(...items.map(item => parseInt(item.year) || 0));
          }
  
          
          function getEarliestYear(items) {
            if (!items?.length) return '';
            return Math.min(...items.map(item => parseInt(item.joinYear) || Infinity));
          }
        })()}
  
        <style jsx global>{`
          @media (max-width: 640px) {
            input[type="text"],
            input[type="number"],
            input[type="date"],
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
  
          .animate-pulse-soft {
            animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
  
          @keyframes pulse-soft {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default ProfessionalBackgroundStep;
  