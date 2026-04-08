/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Pill, 
  User, 
  Phone, 
  Hash, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  Loader2,
  Clock,
  ChevronRight,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface ShortageEntry {
  id: string;
  customerName: string;
  phoneNumber: string;
  medicineName: string;
  quantity: number;
  urgency: 'Low' | 'Medium' | 'High';
  timestamp: Date;
}

// --- Mock Medicine List for Auto-suggest ---
const MEDICINE_SUGGESTIONS = [
  "Amoxicillin 500mg",
  "Atorvastatin 20mg",
  "Metformin 500mg",
  "Lisinopril 10mg",
  "Levothyroxine 50mcg",
  "Amlodipine 5mg",
  "Gabapentin 300mg",
  "Omeprazole 20mg",
  "Losartan 50mg",
  "Sertraline 50mg",
  "Montelukast 10mg",
  "Hydrochlorothiazide 25mg",
  "Pantoprazole 40mg",
  "Furosemide 40mg",
  "Fluticasone Nasal Spray"
];

export default function App() {
  const [entries, setEntries] = useState<ShortageEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    medicineName: '',
    quantity: 1,
    urgency: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  // Auto-suggest state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Handle outside click for suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMedicineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, medicineName: value });
    
    if (value.length > 1) {
      const filtered = MEDICINE_SUGGESTIONS.filter(m => 
        m.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setFormData({ ...formData, medicineName: name });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxcjyEd2-rZTQBD4fvVa4aCQIaxsNQY3Z3HlKMbBRX2r4craQPVjlcrJIeP58pWbXIV/exec';
    
    try {
      // Use URLSearchParams for better compatibility with GAS 'no-cors' mode
      const params = new URLSearchParams();
      params.append('customerName', formData.customerName);
      params.append('phoneNumber', formData.phoneNumber);
      params.append('medicineName', formData.medicineName);
      params.append('quantity', formData.quantity.toString());
      params.append('urgency', formData.urgency);

      await fetch(GAS_URL, {
        method: 'POST',
        body: params,
        mode: 'no-cors'
      });

      const newEntry: ShortageEntry = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        timestamp: new Date()
      };

      setEntries(prev => [newEntry, ...prev].slice(0, 3));
      setShowSuccess(true);
      setFormData({
        customerName: '',
        phoneNumber: '',
        medicineName: '',
        quantity: 1,
        urgency: 'Medium'
      });

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-primary rounded-2xl mb-4 shadow-lg shadow-medical-primary/20">
          <Pill className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Medicine Shortage Tracker</h1>
        <p className="text-slate-500 mt-2">Log customer requests for out-of-stock items</p>
      </header>

      {/* Main Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 mb-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-medical-primary" />
                Customer Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-primary focus:border-transparent outline-none transition-all"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone size={16} className="text-medical-primary" />
                Phone Number
              </label>
              <input
                required
                type="tel"
                placeholder="e.g. +1 234 567 890"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-primary focus:border-transparent outline-none transition-all"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Medicine Name with Auto-suggest */}
          <div className="space-y-2 relative" ref={suggestionRef}>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Search size={16} className="text-medical-primary" />
              Medicine Name
            </label>
            <input
              required
              type="text"
              placeholder="Start typing medicine name..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-primary focus:border-transparent outline-none transition-all"
              value={formData.medicineName}
              onChange={handleMedicineChange}
              onFocus={() => formData.medicineName.length > 1 && setShowSuggestions(true)}
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                >
                  {suggestions.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-medical-bg transition-colors flex items-center gap-2 text-slate-700"
                      onClick={() => selectSuggestion(name)}
                    >
                      <Pill size={14} className="text-medical-accent" />
                      {name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Hash size={16} className="text-medical-primary" />
                Quantity
              </label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-primary focus:border-transparent outline-none transition-all"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-medical-primary" />
                Urgency Level
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
                value={formData.urgency}
                onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={isSaving}
            type="submit"
            className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-medical-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving to Database...
              </>
            ) : (
              <>
                <Send size={20} />
                Log Shortage Request
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50"
          >
            <CheckCircle2 size={20} />
            <span className="font-medium">Request logged successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-medical-secondary" />
            Recent Entries
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
            Last 3 Entries
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {entries.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                No entries logged yet.
              </div>
            ) : (
              entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      entry.urgency === 'High' ? 'bg-rose-100 text-rose-500' :
                      entry.urgency === 'Medium' ? 'bg-amber-100 text-amber-500' :
                      'bg-emerald-100 text-emerald-500'
                    }`}>
                      <Pill size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{entry.medicineName}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        {entry.customerName} • {entry.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      entry.urgency === 'High' ? 'bg-rose-50 text-rose-600' :
                      entry.urgency === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {entry.urgency}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>© 2026 Pharmacy Management System</p>
        <p className="mt-1">Connected to Google Sheets via Apps Script</p>
      </footer>
    </div>
  );
}
