import React, { useState, useRef } from 'react';
import { 
  Mail, Calendar, Clock, MapPin, Phone, User, 
  Printer, Download, Eye, Sparkles, PartyPopper,
  Crown, Star, Zap, Heart, Gift, Music,
  ChevronLeft, ChevronRight, Check, Info
} from 'lucide-react';

export interface InvitationData {
  childName: string;
  childAge: string;
  partyDate: string;
  partyTime: string;
  partyEndTime: string;
  location: string;
  locationAddress: string;
  rsvpPhone: string;
  rsvpEmail: string;
  rsvpByDate: string;
  specialInstructions: string;
  hostName: string;
}

export type InvitationStyle = 'classic-poop' | 'rainbow-splash' | 'golden-throne' | 'neon-party' | 'cute-kawaii';

interface InvitationTemplate {
  id: InvitationStyle;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  icon: React.ReactNode;
}

const invitationTemplates: InvitationTemplate[] = [
  {
    id: 'classic-poop',
    name: 'Classic Poop Party',
    description: 'The original poop emoji theme',
    primaryColor: '#92400e',
    secondaryColor: '#d97706',
    accentColor: '#fbbf24',
    bgGradient: 'from-amber-100 via-yellow-50 to-amber-100',
    icon: <span className="text-2xl">💩</span>
  },
  {
    id: 'rainbow-splash',
    name: 'Rainbow Splash',
    description: 'Colorful unicorn poop vibes',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    bgGradient: 'from-pink-100 via-purple-50 to-cyan-100',
    icon: <span className="text-2xl">🌈</span>
  },
  {
    id: 'golden-throne',
    name: 'Golden Throne',
    description: 'Royal and fancy party style',
    primaryColor: '#b45309',
    secondaryColor: '#ca8a04',
    accentColor: '#fcd34d',
    bgGradient: 'from-yellow-100 via-amber-50 to-yellow-100',
    icon: <Crown className="w-6 h-6 text-yellow-600" />
  },
  {
    id: 'neon-party',
    name: 'Neon Party',
    description: 'Bright and electric vibes',
    primaryColor: '#10b981',
    secondaryColor: '#3b82f6',
    accentColor: '#f43f5e',
    bgGradient: 'from-emerald-100 via-blue-50 to-rose-100',
    icon: <Zap className="w-6 h-6 text-emerald-500" />
  },
  {
    id: 'cute-kawaii',
    name: 'Cute Kawaii',
    description: 'Adorable Japanese style',
    primaryColor: '#f472b6',
    secondaryColor: '#c084fc',
    accentColor: '#fda4af',
    bgGradient: 'from-pink-100 via-fuchsia-50 to-rose-100',
    icon: <Heart className="w-6 h-6 text-pink-500" />
  }
];

// Poop SVG Icon Component
const PoopIcon: React.FC<{ className?: string; color?: string }> = ({ className = "w-8 h-8", color = "#92400e" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4C28 4 24 8 24 12C24 14 25 16 27 17C23 18 20 22 20 26C20 28 21 30 23 32C18 33 14 38 14 44C14 52 22 58 32 58C42 58 50 52 50 44C50 38 46 33 41 32C43 30 44 28 44 26C44 22 41 18 37 17C39 16 40 14 40 12C40 8 36 4 32 4Z" fill={color}/>
    <ellipse cx="24" cy="42" rx="4" ry="5" fill="white"/>
    <ellipse cx="40" cy="42" rx="4" ry="5" fill="white"/>
    <circle cx="24" cy="43" r="2" fill="#1f2937"/>
    <circle cx="40" cy="43" r="2" fill="#1f2937"/>
    <path d="M28 50C28 50 32 54 36 50" stroke="#1f2937" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="20" cy="38" rx="2" ry="2" fill="#fca5a5"/>
    <ellipse cx="44" cy="38" rx="2" ry="2" fill="#fca5a5"/>
  </svg>
);

// Toilet SVG Icon
const ToiletIcon: React.FC<{ className?: string; color?: string }> = ({ className = "w-8 h-8", color = "#e5e7eb" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="8" width="32" height="12" rx="2" fill={color}/>
    <rect x="20" y="12" width="24" height="4" rx="1" fill="#9ca3af"/>
    <ellipse cx="32" cy="38" rx="18" ry="16" fill={color}/>
    <ellipse cx="32" cy="36" rx="14" ry="12" fill="#60a5fa"/>
    <rect x="14" y="50" width="36" height="8" rx="2" fill={color}/>
  </svg>
);

const DropADeuceInvitationGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationStyle>('classic-poop');
  const [invitationData, setInvitationData] = useState<InvitationData>({
    childName: '',
    childAge: '',
    partyDate: '',
    partyTime: '',
    partyEndTime: '',
    location: '',
    locationAddress: '',
    rsvpPhone: '',
    rsvpEmail: '',
    rsvpByDate: '',
    specialInstructions: '',
    hostName: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const template = invitationTemplates.find(t => t.id === selectedTemplate) || invitationTemplates[0];

  const handlePrint = () => {
    window.print();
  };

  const updateField = (field: keyof InvitationData, value: string) => {
    setInvitationData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { num: 1, title: 'Choose Style', icon: Sparkles },
    { num: 2, title: 'Party Details', icon: PartyPopper },
    { num: 3, title: 'RSVP Info', icon: Mail },
    { num: 4, title: 'Preview & Print', icon: Printer }
  ];

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.num}>
              <button
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  currentStep === step.num 
                    ? 'scale-110' 
                    : currentStep > step.num 
                      ? 'opacity-60' 
                      : 'opacity-40'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep === step.num 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                    : currentStep > step.num 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.num ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-xs font-bold hidden sm:block ${
                  currentStep === step.num ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Choose Style */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Choose Your Invitation Style
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitationTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`relative p-6 rounded-2xl border-4 transition-all text-left ${
                  selectedTemplate === tmpl.id 
                    ? 'border-amber-500 shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {selectedTemplate === tmpl.id && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tmpl.bgGradient} flex items-center justify-center mb-4`}>
                  {tmpl.icon}
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{tmpl.name}</h4>
                <p className="text-sm text-gray-500">{tmpl.description}</p>
                <div className="flex gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: tmpl.primaryColor }} />
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: tmpl.secondaryColor }} />
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: tmpl.accentColor }} />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Next: Party Details
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Party Details */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <PartyPopper className="w-6 h-6 text-pink-500" />
            Party Details
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Birthday Child Info */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Birthday Child
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Child's Name *</label>
                <input
                  type="text"
                  value={invitationData.childName}
                  onChange={(e) => updateField('childName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Enter child's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age (Turning)</label>
                <input
                  type="text"
                  value={invitationData.childAge}
                  onChange={(e) => updateField('childAge', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g., 7"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Date & Time
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Party Date *</label>
                <input
                  type="text"
                  value={invitationData.partyDate}
                  onChange={(e) => updateField('partyDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Saturday, January 15th, 2025"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Time *</label>
                  <input
                    type="text"
                    value={invitationData.partyTime}
                    onChange={(e) => updateField('partyTime', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="2:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                  <input
                    type="text"
                    value={invitationData.partyEndTime}
                    onChange={(e) => updateField('partyEndTime', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="5:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Location
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Venue Name *</label>
                  <input
                    type="text"
                    value={invitationData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="The Smith's House"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={invitationData.locationAddress}
                    onChange={(e) => updateField('locationAddress', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="123 Party Street, Fun City, ST 12345"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Next: RSVP Info
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: RSVP Info */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Mail className="w-6 h-6 text-green-500" />
            RSVP Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Host Name</label>
              <input
                type="text"
                value={invitationData.hostName}
                onChange={(e) => updateField('hostName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="Mom or Dad's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RSVP By Date</label>
              <input
                type="text"
                value={invitationData.rsvpByDate}
                onChange={(e) => updateField('rsvpByDate', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="January 10th"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RSVP Phone</label>
              <input
                type="text"
                value={invitationData.rsvpPhone}
                onChange={(e) => updateField('rsvpPhone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RSVP Email</label>
              <input
                type="text"
                value={invitationData.rsvpEmail}
                onChange={(e) => updateField('rsvpEmail', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="parent@email.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Special Instructions</label>
              <textarea
                value={invitationData.specialInstructions}
                onChange={(e) => updateField('specialInstructions', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none"
                rows={3}
                placeholder="Wear comfy clothes for games! No gifts please, just your presence!"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Preview Invitation
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Print */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-800">Your Invitation is Ready!</h3>
                <p className="text-gray-600">Preview below and print when you're happy with it.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Edit
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  <Printer className="w-5 h-5" />
                  Print Invitations
                </button>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-800">Printing Tips</h4>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• Print on white cardstock for best results</li>
                <li>• Select "Fit to page" in your print settings</li>
                <li>• Print 2 invitations per page to save paper</li>
                <li>• Use a paper cutter for clean edges</li>
              </ul>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-100 rounded-2xl p-8 flex justify-center overflow-auto">
            <div ref={printRef} className="print-area">
              <InvitationPreview 
                template={template} 
                data={invitationData} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Invitation Preview Component
interface InvitationPreviewProps {
  template: InvitationTemplate;
  data: InvitationData;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({ template, data }) => {
  const renderPoopDecorations = () => {
    const positions = [
      { top: '5%', left: '5%', rotate: '-15deg', size: 'w-10 h-10' },
      { top: '5%', right: '5%', rotate: '15deg', size: 'w-8 h-8' },
      { bottom: '5%', left: '8%', rotate: '10deg', size: 'w-8 h-8' },
      { bottom: '5%', right: '8%', rotate: '-10deg', size: 'w-10 h-10' },
    ];

    return positions.map((pos, i) => (
      <div
        key={i}
        className={`absolute ${pos.size} opacity-20`}
        style={{
          top: pos.top,
          left: pos.left,
          right: pos.right,
          bottom: pos.bottom,
          transform: `rotate(${pos.rotate})`
        }}
      >
        <PoopIcon className="w-full h-full" color={template.primaryColor} />
      </div>
    ));
  };

  return (
    <div 
      className={`w-[5in] h-[7in] rounded-2xl border-4 relative overflow-hidden bg-gradient-to-br ${template.bgGradient} shadow-2xl`}
      style={{ borderColor: template.primaryColor }}
    >
      {/* Decorative Poop Icons */}
      {renderPoopDecorations()}

      {/* Top Banner */}
      <div 
        className="py-3 text-center relative"
        style={{ backgroundColor: template.primaryColor }}
      >
        <div className="flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-white" />
          <span className="text-white font-black text-sm tracking-wider uppercase">
            You're Invited!
          </span>
          <Star className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 relative z-10">
        {/* Mascot */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
            style={{ backgroundColor: `${template.primaryColor}20` }}
          >
            <PoopIcon className="w-16 h-16" color={template.primaryColor} />
          </div>
        </div>

        {/* Party Title */}
        <div className="text-center mb-4">
          <p className="text-gray-600 font-medium text-sm mb-1">Join us for</p>
          <h1 
            className="text-3xl font-black mb-1"
            style={{ color: template.primaryColor }}
          >
            {data.childName || "[Child's Name]"}'s
          </h1>
          {data.childAge && (
            <div 
              className="inline-block px-4 py-1 rounded-full text-white font-bold text-sm mb-2"
              style={{ backgroundColor: template.secondaryColor }}
            >
              {data.childAge}th Birthday!
            </div>
          )}
          <h2 
            className="text-xl font-black uppercase tracking-wide"
            style={{ color: template.secondaryColor }}
          >
            Drop A Deuce Party!
          </h2>
        </div>

        {/* Party Details Card */}
        <div 
          className="rounded-xl p-4 mb-4 space-y-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
        >
          {/* Date */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${template.primaryColor}20` }}
            >
              <Calendar className="w-5 h-5" style={{ color: template.primaryColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Date</p>
              <p className="font-bold text-gray-800">{data.partyDate || "Saturday, January 15th"}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${template.secondaryColor}20` }}
            >
              <Clock className="w-5 h-5" style={{ color: template.secondaryColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Time</p>
              <p className="font-bold text-gray-800">
                {data.partyTime || "2:00 PM"} {data.partyEndTime && `- ${data.partyEndTime}`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${template.accentColor}20` }}
            >
              <MapPin className="w-5 h-5" style={{ color: template.accentColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
              <p className="font-bold text-gray-800">{data.location || "Party Venue"}</p>
              {data.locationAddress && (
                <p className="text-xs text-gray-600">{data.locationAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* RSVP Section */}
        <div 
          className="rounded-xl p-4 text-center"
          style={{ 
            backgroundColor: template.primaryColor,
            color: 'white'
          }}
        >
          <p className="font-bold text-sm mb-2">
            Please RSVP {data.rsvpByDate && `by ${data.rsvpByDate}`}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {data.rsvpPhone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{data.rsvpPhone}</span>
              </div>
            )}
            {data.rsvpEmail && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs">{data.rsvpEmail}</span>
              </div>
            )}
          </div>
          {data.hostName && (
            <p className="text-xs mt-2 opacity-80">Contact: {data.hostName}</p>
          )}
        </div>

        {/* Special Instructions */}
        {data.specialInstructions && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-600 italic">{data.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Bottom Banner */}
      <div 
        className="absolute bottom-0 left-0 right-0 py-2 text-center"
        style={{ backgroundColor: template.secondaryColor }}
      >
        <p className="text-white text-xs font-bold flex items-center justify-center gap-2">
          <PartyPopper className="w-4 h-4" />
          Get Ready to DROP Some FUN!
          <PartyPopper className="w-4 h-4" />
        </p>
      </div>
    </div>
  );
};

export default DropADeuceInvitationGenerator;
