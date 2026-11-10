import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Bell,
  Stethoscope,
  FileText,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  ZoomIn,
  RefreshCw
} from 'lucide-react';

interface EPharmacyAndMedicsProps {
  onNavigate?: (tab: any) => void;
  addToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const EPharmacyAndMedics: React.FC<EPharmacyAndMedicsProps> = ({
  onNavigate = () => {},
  addToast = () => {}
}) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [reminderSet, setReminderSet] = useState<boolean>(false);
  const [photoMode, setPhotoMode] = useState<'content' | 'full'>('content');

  const handleAddToCart = (item: string, price: string) => {
    setCartCount(prev => prev + 1);
    addToast(`${item} added to cart (${price})!`, 'success');
  };

  const handleSetReminder = () => {
    setReminderSet(true);
    addToast('Medication reminder scheduled: Take Paracetamol at 8:00 PM today via WhatsApp/SMS.', 'success');
  };

  return (
    <div className="flex-1 bg-[#f0f4f9] text-slate-800 min-h-screen flex flex-col font-sans">
      {/* Top Floating Control Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
            title="Return to Main Clinical Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clinical Dashboard</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>E-Pharmacy &amp; Medics (Official Uganda Portal)</span>
          </div>
        </div>

        {/* View Mode Toggle & Cart Counter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhotoMode(photoMode === 'content' ? 'full' : 'content')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            title="Toggle between cropped content view and complete full layout photo"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{photoMode === 'content' ? 'Show Full Photo' : 'Show Clean Content'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Cart: {cartCount} items</span>
          </div>
        </div>
      </div>

      {/* Main Pharmacy Page Container Displaying the Exact Photo with Interactive Hotspots */}
      <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
          
          {/* The Exact Photo as Requested */}
          <img
            src={photoMode === 'content' ? '/pharmacy_content.jpg' : '/pharmacy_photo.jpg'}
            alt="Doctorian E-Pharmacy & Medics"
            className="w-full h-auto object-cover select-none pointer-events-none block"
            loading="eager"
          />

          {/* Interactive Clickable Overlay Hotspots (Active when in 'content' mode) */}
          {photoMode === 'content' && (
            <div className="absolute inset-0 pointer-events-auto">
              {/* 1. Hero 'Shop Medicines >' Button (top left banner) */}
              <button
                type="button"
                onClick={() => addToast('Opening verified Uganda essential medications catalog...', 'info')}
                className="absolute left-[4%] top-[19%] w-[20%] h-[6%] rounded-2xl opacity-0 hover:opacity-20 hover:bg-blue-600 transition-opacity cursor-pointer border-2 border-blue-400"
                title="Shop Medicines"
              />

              {/* 2. Four Feature Cards */}
              {/* Online Pharmacy */}
              <button
                type="button"
                onClick={() => addToast('Opening Online Pharmacy: Order genuine medicines from anywhere in Uganda.', 'info')}
                className="absolute left-[1.5%] top-[39%] w-[23%] h-[23%] rounded-2xl opacity-0 hover:opacity-15 hover:bg-blue-600 transition-opacity cursor-pointer"
                title="Online Pharmacy"
              />

              {/* Consult a Doctor */}
              <button
                type="button"
                onClick={() => {
                  addToast('Launching Telemedicine Consultation with licensed physician...', 'info');
                  onNavigate('consult');
                }}
                className="absolute left-[26%] top-[39%] w-[23%] h-[23%] rounded-2xl opacity-0 hover:opacity-15 hover:bg-emerald-600 transition-opacity cursor-pointer"
                title="Consult a Doctor"
              />

              {/* Your Prescriptions */}
              <button
                type="button"
                onClick={() => {
                  addToast('Opening Prescriptions & Digital Dispensary manager...', 'info');
                  onNavigate('prescriptions');
                }}
                className="absolute left-[50.5%] top-[39%] w-[23%] h-[23%] rounded-2xl opacity-0 hover:opacity-15 hover:bg-amber-600 transition-opacity cursor-pointer"
                title="Your Prescriptions"
              />

              {/* Health Safety */}
              <button
                type="button"
                onClick={() => addToast('Drug Safety & Uganda Clinical Guidelines interactions active.', 'info')}
                className="absolute left-[75%] top-[39%] w-[23.5%] h-[23%] rounded-2xl opacity-0 hover:opacity-15 hover:bg-purple-600 transition-opacity cursor-pointer"
                title="Health Safety"
              />

              {/* 3. Popular Medicines - 'Add to Cart' buttons */}
              {/* Paracetamol Add to Cart */}
              <button
                type="button"
                onClick={() => handleAddToCart('Paracetamol 500mg', 'UGX 2,000')}
                className="absolute left-[3.2%] top-[90.5%] w-[11%] h-[4.5%] rounded-xl opacity-0 hover:opacity-30 hover:bg-blue-600 transition-opacity cursor-pointer"
                title="Add Paracetamol to Cart (UGX 2,000)"
              />

              {/* Amoxicillin Add to Cart */}
              <button
                type="button"
                onClick={() => handleAddToCart('Amoxicillin 500mg', 'UGX 5,000')}
                className="absolute left-[16.5%] top-[90.5%] w-[11%] h-[4.5%] rounded-xl opacity-0 hover:opacity-30 hover:bg-blue-600 transition-opacity cursor-pointer"
                title="Add Amoxicillin to Cart (UGX 5,000)"
              />

              {/* Vitamin C Add to Cart */}
              <button
                type="button"
                onClick={() => handleAddToCart('Vitamin C 1000mg', 'UGX 7,000')}
                className="absolute left-[29.5%] top-[90.5%] w-[11%] h-[4.5%] rounded-xl opacity-0 hover:opacity-30 hover:bg-blue-600 transition-opacity cursor-pointer"
                title="Add Vitamin C to Cart (UGX 7,000)"
              />

              {/* 4. Health Reminder - 'Set Reminder' button */}
              <button
                type="button"
                onClick={handleSetReminder}
                className="absolute left-[44%] top-[89.5%] w-[24.5%] h-[6%] rounded-2xl opacity-0 hover:opacity-30 hover:bg-blue-600 transition-opacity cursor-pointer"
                title="Set Medication Reminder"
              />

              {/* 5. Healthy Community Banner */}
              <button
                type="button"
                onClick={() => addToast('Healthy Community, Healthy Nation! Together for a Healthier Uganda 🇺🇬', 'success')}
                className="absolute left-[70.5%] top-[65%] w-[28%] h-[32%] rounded-2xl opacity-0 hover:opacity-10 hover:bg-blue-600 transition-opacity cursor-pointer"
                title="Healthy Community Initiative"
              />
            </div>
          )}
        </div>

        {/* Quick action bar below image */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 w-full px-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Quick Actions:</span>
            <button
              onClick={() => handleAddToCart('Paracetamol 500mg', 'UGX 2,000')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 rounded-lg border border-slate-200 font-bold transition-colors cursor-pointer"
            >
              + Paracetamol (UGX 2,000)
            </button>
            <button
              onClick={() => handleAddToCart('Amoxicillin 500mg', 'UGX 5,000')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 rounded-lg border border-slate-200 font-bold transition-colors cursor-pointer"
            >
              + Amoxicillin (UGX 5,000)
            </button>
            <button
              onClick={() => handleAddToCart('Vitamin C 1000mg', 'UGX 7,000')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 rounded-lg border border-slate-200 font-bold transition-colors cursor-pointer"
            >
              + Vitamin C (UGX 7,000)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSetReminder}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{reminderSet ? 'Reminder Set for 8:00 PM' : 'Set 8:00 PM Paracetamol Reminder'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EPharmacyAndMedics;
