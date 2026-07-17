/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveCall, User, Language, Theme } from '../types';
import { translations } from '../data/translations';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  PhoneCall, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Clock,
  Lock
} from 'lucide-react';

interface VoiceCallOverlayProps {
  activeCall: ActiveCall;
  partnerUser: User;
  currentUser: User;
  language: Language;
  theme: Theme;
  onEndCall: () => void;
  onAnswerCall: () => void;
  onDeclineCall: () => void;
  onToggleMute: () => void;
}

export default function VoiceCallOverlay({
  activeCall,
  partnerUser,
  currentUser,
  language,
  theme,
  onEndCall,
  onAnswerCall,
  onDeclineCall,
  onToggleMute
}: VoiceCallOverlayProps) {
  const t = translations[language];
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  // Timer for active call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall.status === 'connected') {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall.status]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate a mock verification code based on the users' IDs
  const getVerificationWords = () => {
    const words = [
      ['Cyber', 'Securing', 'Diffie', 'Quantum', 'Terminal', 'Matrix'],
      ['سایبر', 'امنیت', 'دیفی', 'کوانتوم', 'ترمینال', 'ماتریکس']
    ];
    const wordsPool = language === 'fa' ? words[1] : words[0];
    const index1 = (partnerUser.id.charCodeAt(0) + currentUser.id.charCodeAt(0)) % wordsPool.length;
    const index2 = (partnerUser.displayName.charCodeAt(0) + currentUser.displayName.charCodeAt(0)) % wordsPool.length;
    return `${wordsPool[index1]} - ${wordsPool[index2]} - E2E`;
  };

  const isRtl = language === 'fa';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-zinc-950/95 text-zinc-100' 
        : 'bg-zinc-900/90 text-white'
    }`}>
      
      {/* Encryption Banner */}
      <div className="absolute top-8 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <ShieldCheck size={14} className="animate-pulse" />
        <span>AES-GCM 256B ENCRYPTED STREAM</span>
      </div>

      {/* Profile Details */}
      <div className="flex flex-col items-center mt-12 mb-8">
        <div className="relative">
          <div 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl font-bold uppercase ring-4 ring-emerald-500/30 animate-pulse"
            style={{ backgroundColor: partnerUser.color }}
          >
            {partnerUser.displayName.charAt(0)}
          </div>
          {activeCall.status === 'connected' && (
            <span className="absolute bottom-1 right-1 bg-emerald-500 p-2 rounded-full text-white shadow-lg">
              <Lock size={16} />
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mt-6 tracking-tight">{partnerUser.displayName}</h2>
        <p className="text-xs text-zinc-400 mt-1.5">{partnerUser.bio}</p>

        {/* Status */}
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
          {activeCall.status === 'ringing' ? (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>{t.callStatusRinging}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-mono">
              <Clock size={14} />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Visualizer Waves (If call connected) */}
      {activeCall.status === 'connected' ? (
        <div className="w-full max-w-sm h-16 flex items-center justify-center gap-1.5 px-4 mb-8">
          {[...Array(15)].map((_, i) => {
            // Simulated random wave animation height
            const delays = [0.1, 0.4, 0.2, 0.5, 0.3, 0.6, 0.15, 0.45, 0.25, 0.55, 0.35, 0.65, 0.2, 0.5, 0.1];
            return (
              <div 
                key={i} 
                className="w-1 bg-emerald-400/80 rounded-full animate-bounce"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 40}%`,
                  animationDuration: `${1 + delays[i]}s`,
                  animationDelay: `${delays[i]}s`
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-16 mb-8 flex items-center justify-center">
          <PhoneCall size={28} className="text-zinc-500 animate-bounce" />
        </div>
      )}

      {/* Cryptographic Code Verification Section */}
      {activeCall.status === 'connected' && (
        <div className="w-full max-w-md mx-auto p-4 mb-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2 flex items-center justify-center gap-1">
            <Lock size={12} className="text-emerald-500" />
            <span>{t.e2eeKeyVerification}</span>
          </p>
          <p className="text-sm font-bold tracking-wider font-mono text-emerald-400">
            {getVerificationWords()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-2 font-serif">
            {t.voiceVerificationText}
          </p>
        </div>
      )}

      {/* INCOMING CALL CONTROLS */}
      {!activeCall.isOutgoing && activeCall.status === 'ringing' ? (
        <div className="flex items-center gap-8 mt-auto mb-6">
          {/* Decline Button */}
          <button
            onClick={onDeclineCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg group-hover:rotate-12 duration-200">
              <PhoneOff size={24} className="text-white" />
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-white transition-all">{t.decline}</span>
          </button>

          {/* Answer Button */}
          <button
            onClick={onAnswerCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-all transform hover:scale-110 shadow-lg animate-pulse">
              <PhoneCall size={26} className="text-white" />
            </div>
            <span className="text-xs text-zinc-300 group-hover:text-white font-semibold transition-all">{t.answer}</span>
          </button>
        </div>
      ) : (
        /* OUTGOING OR ACTIVE CALL CONTROLS */
        <div className="flex items-center gap-6 mt-auto mb-6">
          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            className={`p-4 rounded-full transition-all border ${
              activeCall.isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-500'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700'
            }`}
            title={t.mute}
          >
            {activeCall.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Speaker toggle */}
          <button
            onClick={() => setSpeakerEnabled(!speakerEnabled)}
            className={`p-4 rounded-full transition-all border ${
              !speakerEnabled
                ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
            title={t.mute}
          >
            {speakerEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transform hover:scale-105 hover:rotate-12 duration-200"
            title={t.endCall}
          >
            <PhoneOff size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
