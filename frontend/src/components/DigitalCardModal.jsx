// frontend/src/components/DigitalCardModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Download, Share2, Phone, Mail, Building, CheckCircle, X, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DigitalCardModal({
  isOpen,
  onClose,
  user = null,
}) {
  if (!isOpen) return null;

  const bdaName = user?.name || 'Alex Johnson';
  const bdaRole = user?.role === 'Manager' ? 'Sales Director' : user?.role === 'TeamLead' ? 'Team Lead - BDA' : 'Business Development Associate';
  const bdaEmail = user?.email || 'alex.bda@mfg.com';
  const bdaPhone = user?.phone || '+91 98450 77123';
  const company = 'Manufacturing Enterprise Consortium';

  // Generate vCard data URI for 1-click download
  const handleDownloadVCard = () => {
    const vcard =
      `BEGIN:VCARD\n` +
      `VERSION:3.0\n` +
      `FN:${bdaName}\n` +
      `ORG:${company}\n` +
      `TITLE:${bdaRole}\n` +
      `TEL;TYPE=WORK,VOICE:${bdaPhone}\n` +
      `EMAIL;TYPE=PREF,INTERNET:${bdaEmail}\n` +
      `URL:https://bda-team-module.vercel.app\n` +
      `REV:${new Date().toISOString()}\n` +
      `END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${bdaName.replace(/\s+/g, '_')}_BDA_Contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('vCard downloaded to your device!');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! This is ${bdaName} (${bdaRole}) from ${company}.\n\n` +
      `📞 Phone: ${bdaPhone}\n` +
      `✉️ Email: ${bdaEmail}\n` +
      `🌐 Portal: https://bda-team-module.vercel.app\n\n` +
      `Let's connect regarding your manufacturing procurement needs!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // SVG QR Code representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `BEGIN:VCARD\nFN:${bdaName}\nORG:${company}\nTEL:${bdaPhone}\nEMAIL:${bdaEmail}\nEND:VCARD`
  )}&bgcolor=0f172a&color=38bdf8`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-start sm:items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white my-auto">
        
        {/* Top Header Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition"
        >
          <X size={16} />
        </button>

        {/* Business Card Preview Box */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 text-white font-black text-2xl mb-3">
            {bdaName.charAt(0).toUpperCase()}
          </div>

          <h3 className="text-xl font-extrabold text-white">{bdaName}</h3>
          <p className="text-xs font-semibold text-cyan-400 mt-0.5">{bdaRole}</p>
          <p className="text-[11px] text-slate-400 mt-1">{company}</p>

          {/* Dynamic QR Code Card */}
          <div className="my-5 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
            <img
              src={qrSvgUrl}
              alt="BDA QR Contact"
              className="w-40 h-40 rounded-xl border border-cyan-500/30 p-1 bg-slate-900"
              onError={(e) => {
                // If offline / image fails, show fallback icon
                e.target.style.display = 'none';
              }}
            />
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              SCAN TO SAVE CONTACT IN PHONE
            </p>
          </div>

          {/* Contact Details List */}
          <div className="space-y-2 text-left bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone size={14} className="text-cyan-400" />
              <span>{bdaPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail size={14} className="text-blue-400" />
              <span className="truncate">{bdaEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Building size={14} className="text-indigo-400" />
              <span>Industrial Sector 4, BDA Hub</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={handleDownloadVCard}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Download size={14} />
              <span>Save vCard</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
