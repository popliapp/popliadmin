import React, { useState } from 'react';
import { 
  Check, 
  Search, 
  AlertTriangle, 
  UserMinus, 
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface FlaggedChat {
  id: string;
  senderName: string;
  senderUsername: string;
  receiverName: string;
  receiverUsername: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  lastMessage: string;
  linkDetected?: string;
  messages: Array<{ sender: string; text: string; date: string; flagged: boolean }>;
}

const mockFlaggedChats: FlaggedChat[] = [
  {
    id: 'chat_1',
    senderName: 'Deepak Patel',
    senderUsername: 'deepak_patel_38',
    receiverName: 'Diya Nair',
    receiverUsername: 'diya_nair_19',
    reason: 'Suspicious crypto-monetization/scam links',
    severity: 'high',
    lastMessage: 'Check this link to earn 5000 free coins instantly: http://popli-free-coins-scam.in',
    linkDetected: 'http://popli-free-coins-scam.in',
    messages: [
      { sender: 'deepak_patel_38', text: 'Hey Diya, saw your trending comedy dance video!', date: '10:14 AM', flagged: false },
      { sender: 'diya_nair_19', text: 'Thank you so much! Really glad you liked it! 😊', date: '10:15 AM', flagged: false },
      { sender: 'deepak_patel_38', text: 'Check this link to earn 5000 free coins instantly: http://popli-free-coins-scam.in', date: '10:16 AM', flagged: true },
      { sender: 'deepak_patel_38', text: 'Just login with your POPLI credentials and claim rewards.', date: '10:16 AM', flagged: true }
    ]
  },
  {
    id: 'chat_2',
    senderName: 'Rohan Sen',
    senderUsername: 'rohan_sen_44',
    receiverName: 'Priya Iyer',
    receiverUsername: 'priya_iyer_72',
    reason: 'Abuse, personal harassment trigger words',
    severity: 'high',
    lastMessage: 'Your content is garbage! Stop uploading or else...',
    messages: [
      { sender: 'rohan_sen_44', text: 'Hey why are you not replying to my comments?', date: 'Yesterday', flagged: false },
      { sender: 'rohan_sen_44', text: 'Your content is garbage! Stop uploading or else...', date: 'Yesterday', flagged: true },
      { sender: 'rohan_sen_44', text: 'Stupid videos, get lost.', date: 'Yesterday', flagged: true }
    ]
  },
  {
    id: 'chat_3',
    senderName: 'Amit Mishra',
    senderUsername: 'amit_mishra_99',
    receiverName: 'Riya Sharma',
    receiverUsername: 'riya_sharma_12',
    reason: 'Suspicious link sharing (Unknown domain)',
    severity: 'medium',
    lastMessage: 'Visit my private blog page: http://mysuspicioussite.xyz/files',
    linkDetected: 'http://mysuspicioussite.xyz/files',
    messages: [
      { sender: 'riya_sharma_12', text: 'Hi, do you need help with collaboration?', date: '2 days ago', flagged: false },
      { sender: 'amit_mishra_99', text: 'Yes, visit my private blog page: http://mysuspicioussite.xyz/files', date: '2 days ago', flagged: true }
    ]
  }
];

export const MessagingPage: React.FC = () => {
  const [chats, setChats] = useState<FlaggedChat[]>(mockFlaggedChats);
  const [selectedChat, setSelectedChat] = useState<FlaggedChat | null>(mockFlaggedChats[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAction = (chatId: string, action: 'ban' | 'warn' | 'dismiss') => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    
    if (action === 'ban') {
      toast.error("INCIDENT TERMINATED: Harassing operator account suspended immediately.", {
        icon: '🚫'
      });
    } else if (action === 'warn') {
      toast.success("SYSTEM WARNING INJECTED: Sender warned for link safety violation.");
    } else {
      toast.success("Incident dismissed. Log archived.");
    }

    setSelectedChat(null);
  };

  const filteredChats = chats.filter(c => 
    c.senderUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.receiverUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono relative text-[10px] text-slate-600 uppercase select-none font-bold">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#BAE6FD] pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wider text-[#0C4A6E]">Messaging & Chat Moderation</h1>
          <p className="text-slate-500 text-[10px] uppercase mt-1">POPLI private chats supervisor panel and scam link tracking workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list panel */}
        <div className="bg-[#FFFFFF] border border-[#BAE6FD] p-5 rounded-[2px] lg:col-span-1 space-y-4 flex flex-col h-[480px]">
          <span className="text-xs font-extrabold uppercase tracking-widest block text-[#0C4A6E] select-none">FLAGGED OPERATOR CHATS</span>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH CHAT FLAGGED LOGS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[2px] pl-9 pr-4 text-[9px] placeholder-slate-400 uppercase text-[#0C4A6E] outline-none focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
            {filteredChats.length > 0 ? (
              filteredChats.map((c) => (
                <div key={c.id} className={cn(
                  "p-3 bg-[#F0F9FF] border rounded-[1px] flex flex-col gap-2 cursor-pointer hover:border-gray-600 transition-colors",
                  selectedChat?.id === c.id ? "border-[#0ea5e9] shadow-md shadow-[#0ea5e9]/5" : "border-[#BAE6FD]"
                )} onClick={() => setSelectedChat(c)}>
                  <div className="flex justify-between items-start">
                    <span className="text-[#0C4A6E] text-xs truncate leading-none">@{c.senderUsername}</span>
                    <span className={cn(
                      "text-[6px] font-black px-1.5 py-0.5 rounded-[1px]",
                      c.severity === 'high' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    )}>{c.severity}</span>
                  </div>
                  <p className="text-slate-500 text-[8px] font-normal leading-normal">{c.reason}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 space-y-2">
                <span className="text-2xl">🛡️</span>
                <span className="font-bold">Zero active chat flags</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Chat preview window panel */}
        <div className="bg-[#FFFFFF] border border-[#BAE6FD] p-5 rounded-[2px] lg:col-span-2 flex flex-col justify-between h-[480px]">
          {selectedChat ? (
            <div className="flex-1 flex flex-col justify-between h-full">
              {/* Chat header */}
              <div className="border-b border-[#BAE6FD] pb-3 mb-3 flex justify-between items-center select-none">
                <div>
                  <span className="font-extrabold text-[#0ea5e9] uppercase text-xs tracking-widest leading-none block">
                    CHAT MONITOR: @{selectedChat.senderUsername} ➔ @{selectedChat.receiverUsername}
                  </span>
                  <span className="text-slate-400 text-[8px] font-normal block mt-1 uppercase">REASON: {selectedChat.reason}</span>
                </div>
              </div>

              {/* Message loop history */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#F0F9FF]/40 border border-[#BAE6FD] rounded-[1px] mb-4 custom-scrollbar text-[9px]">
                {selectedChat.messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "p-2.5 rounded-[1px] max-w-sm space-y-1",
                    msg.sender === selectedChat.senderUsername
                      ? (msg.flagged ? "bg-red-50/20 border border-red-200 mr-auto text-red-300" : "bg-[#F0F9FF] border border-[#BAE6FD] mr-auto text-[#0C4A6E]")
                      : "bg-[#252830] ml-auto text-[#0C4A6E]"
                  )}>
                    <div className="flex justify-between items-center font-bold text-[8px]">
                      <span>@{msg.sender}</span>
                      <span className="text-slate-500 font-normal">{msg.date}</span>
                    </div>
                    <p className="font-normal normal-case leading-normal">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Anti-Scam link diagnostic indicator */}
              {selectedChat.linkDetected && (
                <div className="p-3 bg-red-50/20 border border-red-500/35 rounded-[2px] mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-red-600 font-extrabold text-[9px] block uppercase tracking-wider">MALICIOUS SCAM LINK BINDING DETECTED</span>
                    <span className="text-[#0C4A6E] text-[8px] block font-normal lowercase mt-1 select-all font-mono">{selectedChat.linkDetected}</span>
                  </div>
                  <a href="#" className="p-1.5 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0ea5e9] rounded-[1px] hover:border-gray-500 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Moderation overrides */}
              <div className="flex gap-2 border-t border-[#BAE6FD] pt-4 font-mono text-[9px] font-bold">
                <button
                  onClick={() => handleAction(selectedChat.id, 'dismiss')}
                  className="h-10 px-3 bg-[#E0F2FE] text-[#0ea5e9] hover:bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-[1px] transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-95 flex-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>DISMISS FLAG</span>
                </button>
                <button
                  onClick={() => handleAction(selectedChat.id, 'warn')}
                  className="h-10 px-3 bg-[#E0F2FE] text-amber-700 hover:bg-amber-500/10 border border-amber-200 rounded-[1px] transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-95 flex-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>WARN SENDER</span>
                </button>
                <button
                  onClick={() => handleAction(selectedChat.id, 'ban')}
                  className="h-10 px-3 bg-red-50 text-red-600 hover:bg-red-900 border border-red-200 rounded-[1px] transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-95 flex-1"
                >
                  <UserMinus className="w-3.5 h-3.5 shrink-0" />
                  <span>BAN OPERATOR</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 space-y-2">
              <span className="text-2xl">🖥️</span>
              <span className="font-bold">Select message session for audit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
