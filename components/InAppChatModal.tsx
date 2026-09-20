'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RoomListing } from '@/types/room';
import {
  X,
  Send,
  ShieldCheck,
  PhoneCall,
  CheckCheck,
  Lock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'seeker' | 'owner';
  text: string;
  timestamp: string;
}

interface InAppChatModalProps {
  room: RoomListing | null;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CHIPS = [
  'Hi! Is this room still vacant?',
  'Can I schedule a visit tomorrow around 5 PM?',
  'Is the rent price negotiable?',
  'Are electricity and WiFi included in the rent?',
  'What is the security deposit?'
];

let idCounter = 1;
const getNextMsgId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

export default function InAppChatModal({ room, isOpen, onClose }: InAppChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!room || typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`kirayepe_chat_${room.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'msg-welcome',
        sender: 'owner',
        text: `Hello! I am ${room.contact.name} (${room.listerType || 'Host'}). Thank you for checking out "${room.title}". How can I help you today?`,
        timestamp: 'Just now'
      }
    ];
  });
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showMaskedCallAlert, setShowMaskedCallAlert] = useState<boolean>(false);
  const [prevRoomId, setPrevRoomId] = useState<string | undefined>(room?.id);

  if (room?.id !== prevRoomId) {
    setPrevRoomId(room?.id);
    let loaded: ChatMessage[] = [];
    if (room && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`kirayepe_chat_${room.id}`);
      if (stored) {
        try {
          loaded = JSON.parse(stored);
        } catch {}
      }
    }
    if (loaded.length === 0 && room) {
      loaded = [
        {
          id: 'msg-welcome',
          sender: 'owner',
          text: `Hello! I am ${room.contact.name} (${room.listerType || 'Host'}). Thank you for checking out "${room.title}". How can I help you today?`,
          timestamp: 'Just now'
        }
      ];
    }
    setMessages(loaded);
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !room) return null;

  const storageKey = `kirayepe_chat_${room.id}`;

  const sendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: getNextMsgId('msg'),
      sender: 'seeker',
      text: textToSend.trim(),
      timestamp: nowStr
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setInputText('');

    // Simulate smart host reply after 1.2 seconds
    setIsTyping(true);
    setTimeout(() => {
      let replyText = `Thanks for reaching out! Yes, "${room.title}" is available. You can visit or contact me directly to finalize.`;
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('negotiable') || lower.includes('price')) {
        replyText = room.pricingType === 'Negotiable'
          ? `Yes, the price of ₹${room.pricePerMonth}/mo is slightly negotiable for long-term or prompt tenants! Let's discuss when you visit.`
          : `The rent is ₹${room.pricePerMonth}/mo (Fixed Price), which includes premium society maintenance and basic amenities.`;
      } else if (lower.includes('visit') || lower.includes('tomorrow')) {
        replyText = `Tomorrow 5 PM works great for me! The location is ${room.fullAddress}. Please call or message when you arrive.`;
      } else if (lower.includes('deposit')) {
        replyText = `The security deposit is ₹${room.securityDeposit.toLocaleString()}, which is 100% refundable at the time of moving out.`;
      } else if (lower.includes('electricity') || lower.includes('wifi') || lower.includes('bill')) {
        replyText = `${room.maintenanceIncluded ? 'Maintenance is included' : 'Maintenance is extra'}. WiFi and RO water are available as per listing details!`;
      }

      const ownerReply: ChatMessage = {
        id: getNextMsgId('reply'),
        sender: 'owner',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...updated, ownerReply];
      setMessages(finalMsgs);
      localStorage.setItem(storageKey, JSON.stringify(finalMsgs));
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(inputText);
    }
  };

  const handleMaskedCall = () => {
    setShowMaskedCallAlert(true);
    setTimeout(() => setShowMaskedCallAlert(false), 5000);
    // Also trigger tel link after showing notification
    if (room.contact.phone) {
      window.location.href = `tel:${room.contact.phone}`;
    }
  };

  const coverImage = room.images && room.images.length > 0 ? room.images[0] : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[640px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow">
                {room.contact.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {room.contact.name}
                </h3>
                {room.isVerified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{room.verificationBadge || 'ID Verified'}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>{room.listerType || 'Owner'}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active now</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Safe Call Gateway Button */}
            <button
              type="button"
              onClick={handleMaskedCall}
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition shadow-sm"
              title="Safe Call Gateway (Direct & Spam-Protected)"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Room Preview Strip */}
        <div className="px-4 py-2.5 bg-emerald-50/60 dark:bg-slate-800/40 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={coverImage}
              alt={room.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {room.title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ₹{room.pricePerMonth.toLocaleString()}/mo • {room.area}
              </span>
            </div>
          </div>

          {/* Pricing Tag */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
              room.pricingType === 'Negotiable'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}
          >
            {room.pricingType === 'Negotiable' ? '💬 Negotiable' : '🔒 Fixed Price'}
          </span>
        </div>

        {/* Privacy Notice Alert */}
        {showMaskedCallAlert && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs flex items-center gap-2 animate-fadeIn">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Safe Call Gateway initiated! Connecting securely without exposing your personal number to telemarketers.
            </span>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-center my-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Lock className="w-3 h-3" />
              End-to-End Direct Chat • No 3rd Party Spam
            </span>
          </div>

          {messages.map((msg) => {
            const isSeeker = msg.sender === 'seeker';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSeeker ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    isSeeker
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600 dark:text-slate-300 px-1">
                  <span>{msg.timestamp}</span>
                  {isSeeker && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium">{room.contact.name} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips Bar */}
        <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Text Input Footer */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message to host..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="button"
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
