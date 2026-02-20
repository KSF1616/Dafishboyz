import React from 'react';
import { PartyPackTheme } from '@/types/partyPack';
import { PartyPopper, MapPin, Clock, Phone, Mail, Calendar } from 'lucide-react';

interface PrintableInvitationProps {
  theme: PartyPackTheme;
  childName: string;
  partyDate: string;
  partyTime: string;
  location: string;
  rsvpPhone: string;
  rsvpEmail: string;
  specialInstructions: string;
}

const PrintableInvitation: React.FC<PrintableInvitationProps> = ({
  theme,
  childName,
  partyDate,
  partyTime,
  location,
  rsvpPhone,
  rsvpEmail,
  specialInstructions
}) => {
  return (
    <div 
      className="w-[5in] h-[7in] p-6 rounded-lg border-4 print:border-2 relative overflow-hidden bg-white"
      style={{ borderColor: theme.primaryColor }}
    >
      {/* Decorative corners */}
      <div 
        className="absolute top-0 left-0 w-24 h-24 -translate-x-8 -translate-y-8 rounded-full opacity-30"
        style={{ backgroundColor: theme.primaryColor }}
      />
      <div 
        className="absolute top-0 right-0 w-20 h-20 translate-x-6 -translate-y-6 rounded-full opacity-30"
        style={{ backgroundColor: theme.secondaryColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-20 h-20 -translate-x-6 translate-y-6 rounded-full opacity-30"
        style={{ backgroundColor: theme.secondaryColor }}
      />
      <div 
        className="absolute bottom-0 right-0 w-24 h-24 translate-x-8 translate-y-8 rounded-full opacity-30"
        style={{ backgroundColor: theme.primaryColor }}
      />

      {/* Header */}
      <div className="text-center mb-4 relative z-10">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <PartyPopper className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wide" style={{ color: theme.primaryColor }}>
          You're Invited!
        </h1>
      </div>

      {/* Party Title */}
      <div 
        className="text-center py-4 px-6 rounded-2xl mb-4"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` 
        }}
      >
        <p className="text-white text-sm font-medium mb-1">Join us for</p>
        <h2 className="text-3xl font-black text-white">
          {childName || "[Child's Name]"}'s
        </h2>
        <p className="text-white text-xl font-bold">
          Drop A Deuce Party!
        </p>

      </div>

      {/* Mascot */}
      <div className="flex justify-center mb-4">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765399642855_9cc0e6d2.jpg"
          alt="Party Mascot"
          className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
        />
      </div>

      {/* Party Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${theme.primaryColor}15` }}>
          <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: theme.primaryColor }} />
          <div>
            <p className="text-xs text-gray-500 font-medium">DATE</p>
            <p className="font-bold text-gray-800">{partyDate || "Saturday, January 1st"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${theme.secondaryColor}15` }}>
          <Clock className="w-5 h-5 flex-shrink-0" style={{ color: theme.secondaryColor }} />
          <div>
            <p className="text-xs text-gray-500 font-medium">TIME</p>
            <p className="font-bold text-gray-800">{partyTime || "2:00 PM - 5:00 PM"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${theme.accentColor}15` }}>
          <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: theme.accentColor }} />
          <div>
            <p className="text-xs text-gray-500 font-medium">LOCATION</p>
            <p className="font-bold text-gray-800 text-sm">{location || "123 Party Street, Fun City"}</p>
          </div>
        </div>
      </div>

      {/* RSVP Section */}
      <div 
        className="p-3 rounded-xl text-center"
        style={{ backgroundColor: `${theme.primaryColor}10`, borderColor: theme.primaryColor, borderWidth: 2 }}
      >
        <p className="font-bold text-sm mb-2" style={{ color: theme.primaryColor }}>Please RSVP by:</p>
        <div className="flex justify-center gap-4 text-sm">
          {rsvpPhone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span className="text-gray-700">{rsvpPhone}</span>
            </div>
          )}
          {rsvpEmail && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span className="text-gray-700 text-xs">{rsvpEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Special Instructions */}
      {specialInstructions && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 italic">{specialInstructions}</p>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <p className="text-xs font-bold" style={{ color: theme.primaryColor }}>
          Get ready to DROP some FUN!
        </p>
      </div>
    </div>
  );
};

export default PrintableInvitation;
