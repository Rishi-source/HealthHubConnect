import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Building, AlertCircle,
  Plus, X, Wallet, QrCode, Check, Edit2, Trash2,
  Shield, DollarSign, Save, RefreshCcw
} from 'lucide-react';

// Mock initial data
const INITIAL_BILLING_DATA = {
  bankAccounts: [
    {
      id: 1,
      accountName: "Dr. John Smith",
      bankName: "HDFC Bank",
      accountNumber: "XXXX-XXXX-4589",
      ifscCode: "HDFC0001234",
      branchName: "Koramangala Branch",
      accountType: "savings",
      isDefault: true
    }
  ],
  upiIds: [
    {
      id: 1,
      upiId: "drsmith@upi",
      isDefault: true
    }
  ],
  paymentPreferences: {
    acceptUPI: true,
    acceptBankTransfer: true,
    acceptCash: true,
    defaultMethod: "upi"
  },
  consultationFees: {
    online: 800,
    inPerson: 1000,
    followUp: 500
  }
};



// Bank Account Form Component
const BankAccountForm = ({ account = {}, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'savings',
    isDefault: false,
    ...account
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accountName.trim()) newErrors.accountName = 'Account name is required';
    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }
    if (!formData.branchName.trim()) newErrors.branchName = 'Branch name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Building className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {account.id ? 'Edit Bank Account' : 'Add Bank Account'}
                </h2>
                <p className="text-gray-500">Enter your bank account details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={e => setFormData({...formData, accountName: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-colors
                  ${errors.accountName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                  }`}
                placeholder="Enter account holder name"
              />
              {errors.accountName && (
                <p className="mt-1 text-sm text-red-500">{errors.accountName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={e => setFormData({...formData, bankName: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-colors
                  ${errors.bankName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                  }`}
                placeholder="Enter bank name"
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-colors
                  ${errors.accountNumber 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                  }`}
                placeholder="Enter account number"
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.accountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-colors
                  ${errors.ifscCode 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                  }`}
                placeholder="Enter IFSC code"
              />
              {errors.ifscCode && (
                <p className="mt-1 text-sm text-red-500">{errors.ifscCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={e => setFormData({...formData, branchName: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-colors
                  ${errors.branchName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                  }`}
                placeholder="Enter branch name"
              />
              {errors.branchName && (
                <p className="mt-1 text-sm text-red-500">{errors.branchName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                value={formData.accountType}
                onChange={e => setFormData({...formData, accountType: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg
                  focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-colors"
              >
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={e => setFormData({...formData, isDefault: e.target.checked})}
              className="rounded text-teal-500 focus:ring-teal-500"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-600">
              Set as default account
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg
                hover:bg-teal-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Account
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// UPI ID Form Component
const UPIForm = ({ upi = {}, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      upiId: '',
      isDefault: false,
      ...upi
    });
    const [errors, setErrors] = useState({});
  
    const validateForm = () => {
      const newErrors = {};
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w\.\-]+@[\w\.\-]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmit(formData);
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
          className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <QrCode className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {upi.id ? 'Edit UPI ID' : 'Add UPI ID'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={e => setFormData({...formData, upiId: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-colors
                  ${errors.upiId 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20'
                  }`}
                placeholder="username@bank"
              />
              {errors.upiId && (
                <p className="mt-1 text-sm text-red-500">{errors.upiId}</p>
              )}
            </div>
  
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefaultUPI"
                checked={formData.isDefault}
                onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                className="rounded text-teal-500 focus:ring-teal-500"
              />
              <label htmlFor="isDefaultUPI" className="ml-2 text-sm text-gray-600">
                Set as default UPI
              </label>
            </div>
  
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg
                  hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save UPI
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };
  
  // Payment Preferences Form Component
  const PaymentPreferencesForm = ({ preferences, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      acceptUPI: true,
      acceptBankTransfer: true,
      acceptCash: true,
      defaultMethod: "upi",
      ...preferences
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
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
          className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Payment Preferences
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Accept UPI Payments
                </label>
                <input
                  type="checkbox"
                  checked={formData.acceptUPI}
                  onChange={e => setFormData({...formData, acceptUPI: e.target.checked})}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Accept Bank Transfer
                </label>
                <input
                  type="checkbox"
                  checked={formData.acceptBankTransfer}
                  onChange={e => setFormData({...formData, acceptBankTransfer: e.target.checked})}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Accept Cash Payments
                </label>
                <input
                  type="checkbox"
                  checked={formData.acceptCash}
                  onChange={e => setFormData({...formData, acceptCash: e.target.checked})}
                  className="rounded text-teal-500 focus:ring-teal-500"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Payment Method
                </label>
                <select
                  value={formData.defaultMethod}
                  onChange={e => setFormData({...formData, defaultMethod: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg
                    focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-colors"
                >
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
  
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg
                  hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };
  
  // Consultation Fees Form Component
  const ConsultationFeesForm = ({ fees, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      online: 800,
      inPerson: 1000,
      followUp: 500,
      ...fees
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
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
          className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Consultation Fees
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Consultation Fee
                </label>
                <input
                  type="number"
                  value={formData.online}
                  onChange={e => setFormData({...formData, online: Number(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg
                    focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-colors"
                  placeholder="Enter online consultation fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  In-Person Consultation Fee
                </label>
                <input
                  type="number"
                  value={formData.inPerson}
                  onChange={e => setFormData({...formData, inPerson: Number(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg
                    focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-colors"
                  placeholder="Enter in-person consultation fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-Up Consultation Fee
                </label>
                <input
                  type="number"
                  value={formData.followUp}
                  onChange={e => setFormData({...formData, followUp: Number(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg
                    focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-colors"
                  placeholder="Enter follow-up consultation fee"
                />
              </div>
            </div>
  
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg
                  hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Fees
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };
  
  // Main Billing Settings Component
  const BillingSettings = () => {
    const [billingData, setBillingData] = useState(INITIAL_BILLING_DATA);
    
    // Modal state management
    const [activeModal, setActiveModal] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
  
    // Bank Account Management
    const handleAddBankAccount = (newAccount) => {
      const updatedAccounts = newAccount.id 
        ? billingData.bankAccounts.map(account => 
            account.id === newAccount.id ? newAccount : account
          )
        : [...billingData.bankAccounts, { ...newAccount, id: Date.now() }];
      
      // If set as default, update other accounts
      if (newAccount.isDefault) {
        updatedAccounts.forEach(account => {
          if (account.id !== newAccount.id) {
            account.isDefault = false;
          }
        });
      }
  
      setBillingData(prev => ({
        ...prev,
        bankAccounts: updatedAccounts
      }));
      setActiveModal(null);
    };
  
    const handleDeleteBankAccount = (accountId) => {
      const updatedAccounts = billingData.bankAccounts.filter(account => account.id !== accountId);
      
      // Ensure at least one account remains as default
      if (!updatedAccounts.some(account => account.isDefault) && updatedAccounts.length > 0) {
        updatedAccounts[0].isDefault = true;
      }
  
      setBillingData(prev => ({
        ...prev,
        bankAccounts: updatedAccounts
      }));
    };
  
    // UPI ID Management
    const handleAddUPI = (newUPI) => {
      const updatedUPIs = newUPI.id
        ? billingData.upiIds.map(upi => 
            upi.id === newUPI.id ? newUPI : upi
          )
        : [...billingData.upiIds, { ...newUPI, id: Date.now() }];
      
      // If set as default, update other UPIs
      if (newUPI.isDefault) {
        updatedUPIs.forEach(upi => {
          if (upi.id !== newUPI.id) {
            upi.isDefault = false;
          }
        });
      }
  
      setBillingData(prev => ({
        ...prev,
        upiIds: updatedUPIs
      }));
      setActiveModal(null);
    };
  
    const handleDeleteUPI = (upiId) => {
      const updatedUPIs = billingData.upiIds.filter(upi => upi.id !== upiId);
      
      // Ensure at least one UPI remains as default
      if (!updatedUPIs.some(upi => upi.isDefault) && updatedUPIs.length > 0) {
        updatedUPIs[0].isDefault = true;
      }
  
      setBillingData(prev => ({
        ...prev,
        upiIds: updatedUPIs
      }));
    };
  
    // Payment Preferences Management
    const handleUpdatePreferences = (newPreferences) => {
      setBillingData(prev => ({
        ...prev,
        paymentPreferences: newPreferences
      }));
      setActiveModal(null);
    };
  
    // Consultation Fees Management
    const handleUpdateConsultationFees = (newFees) => {
      setBillingData(prev => ({
        ...prev,
        consultationFees: newFees
      }));
      setActiveModal(null);
    };
  
    // Render Methods
    const renderBankAccounts = () => {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-teal-600" />
              Bank Accounts
            </h3>
            <button 
              onClick={() => {
                setActiveModal('addBankAccount');
                setEditingItem(null);
              }}
              className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
          {billingData.bankAccounts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No bank accounts added
            </div>
          ) : (
            <div>
              {billingData.bankAccounts.map(account => (
                <div 
                  key={account.id} 
                  className={`p-4 border-b border-gray-100 last:border-b-0 flex justify-between items-center
                    ${account.isDefault ? 'bg-teal-50' : ''}`}
                >
                  <div>
                    <div className="font-semibold text-gray-800">{account.accountName}</div>
                    <div className="text-sm text-gray-600">
                      {account.bankName} - {account.accountNumber}
                    </div>
                    {account.isDefault && (
                      <div className="text-xs text-teal-600 mt-1">
                        Default Account
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setActiveModal('editBankAccount');
                        setEditingItem(account);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    {!account.isDefault && (
                      <button 
                        onClick={() => handleDeleteBankAccount(account.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };
  
    const renderUPIIds = () => {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              UPI IDs
            </h3>
            <button 
              onClick={() => {
                setActiveModal('addUPI');
                setEditingItem(null);
              }}
              className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add UPI
            </button>
          </div>
          {billingData.upiIds.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No UPI IDs added
            </div>
          ) : (
            <div>
              {billingData.upiIds.map(upi => (
                <div 
                  key={upi.id} 
                  className={`p-4 border-b border-gray-100 last:border-b-0 flex justify-between items-center
                    ${upi.isDefault ? 'bg-teal-50' : ''}`}
                >
                  <div>
                    <div className="font-semibold text-gray-800">{upi.upiId}</div>
                    {upi.isDefault && (
                      <div className="text-xs text-teal-600 mt-1">
                        Default UPI
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setActiveModal('editUPI');
                        setEditingItem(upi);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    {!upi.isDefault && (
                      <button 
                        onClick={() => handleDeleteUPI(upi.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };
  
    const renderPaymentPreferences = () => {
        const { paymentPreferences } = billingData;
        const paymentMethodLabels = {
          upi: "UPI",
          bank: "Bank Transfer",
          cash: "Cash"
        };
    
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Payment Preferences
              </h3>
              <button 
                onClick={() => setActiveModal('editPreferences')}
                className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Accept UPI Payments</span>
                <Check 
                  className={`w-5 h-5 ${paymentPreferences.acceptUPI ? 'text-teal-600' : 'text-gray-300'}`} 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Accept Bank Transfer</span>
                <Check 
                  className={`w-5 h-5 ${paymentPreferences.acceptBankTransfer ? 'text-teal-600' : 'text-gray-300'}`} 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Accept Cash Payments</span>
                <Check 
                  className={`w-5 h-5 ${paymentPreferences.acceptCash ? 'text-teal-600' : 'text-gray-300'}`} 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Default Payment Method</span>
                <span className="text-gray-800 font-semibold">
                  {paymentMethodLabels[paymentPreferences.defaultMethod]}
                </span>
              </div>
            </div>
          </div>
        );
      };
    
      const renderConsultationFees = () => {
        const { consultationFees } = billingData;
    
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Consultation Fees
              </h3>
              <button 
                onClick={() => setActiveModal('editFees')}
                className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Online Consultation</span>
                <span className="text-gray-800 font-semibold">
                  ₹{consultationFees.online}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">In-Person Consultation</span>
                <span className="text-gray-800 font-semibold">
                  ₹{consultationFees.inPerson}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Follow-Up Consultation</span>
                <span className="text-gray-800 font-semibold">
                  ₹{consultationFees.followUp}
                </span>
              </div>
            </div>
          </div>
        );
      };
    
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Wallet className="w-6 h-6 text-teal-600" />
              Billing Settings
            </h1>
    
            {renderBankAccounts()}
            {renderUPIIds()}
            {renderPaymentPreferences()}
            {renderConsultationFees()}
    
            <AnimatePresence>
              {activeModal === 'addBankAccount' && (
                <BankAccountForm 
                  onSubmit={handleAddBankAccount}
                  onClose={() => setActiveModal(null)}
                />
              )}
              {activeModal === 'editBankAccount' && (
                <BankAccountForm 
                  account={editingItem}
                  onSubmit={handleAddBankAccount}
                  onClose={() => setActiveModal(null)}
                />
              )}
              {activeModal === 'addUPI' && (
                <UPIForm 
                  onSubmit={handleAddUPI}
                  onClose={() => setActiveModal(null)}
                />
              )}
              {activeModal === 'editUPI' && (
                <UPIForm 
                  upi={editingItem}
                  onSubmit={handleAddUPI}
                  onClose={() => setActiveModal(null)}
                />
              )}
              {activeModal === 'editPreferences' && (
                <PaymentPreferencesForm 
                  preferences={billingData.paymentPreferences}
                  onSubmit={handleUpdatePreferences}
                  onClose={() => setActiveModal(null)}
                />
              )}
              {activeModal === 'editFees' && (
                <ConsultationFeesForm 
                  fees={billingData.consultationFees}
                  onSubmit={handleUpdateConsultationFees}
                  onClose={() => setActiveModal(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    };
    
    export default BillingSettings;
      