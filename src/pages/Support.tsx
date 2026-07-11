import React, { useState } from 'react';
import { usePlatformStore, SupportTicket } from '../store/usePlatformStore';
import { Check, Search, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const SupportPage: React.FC = () => {
  const { tickets, sendSupportReply } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0]);
  const [replyMessage, setReplyMessage] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage) return;

    sendSupportReply(selectedTicket.id, replyMessage);
    toast.success('Response dispatched to creator inbox!');

    setSelectedTicket(prev => prev ? {
      ...prev,
      status: 'in_progress',
      chatHistory: [...prev.chatHistory, { sender: 'support', message: replyMessage, timestamp: new Date().toISOString() }]
    } : null);
    setReplyMessage('');
  };

  const handleResolveTicket = (ticketId: string) => {
    toast.success(`Ticket #${ticketId} archived as resolved.`, { icon: '✅' });
    setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
  };

  const filteredTickets = tickets.filter(t => {
    return (
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const priorityBadge: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Platform Customer Support</h1>
        <p className="text-muted-foreground text-sm mt-1">POPLI creator complaints desk and verification assistant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets sidebar */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[520px] shadow-sm space-y-4">
          <span className="text-sm font-semibold text-foreground">Complaints Desk Queue</span>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-muted/40 border border-border rounded-xl pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={cn(
                    "p-3 bg-muted/40 border rounded-xl flex flex-col gap-2 cursor-pointer transition-all duration-200",
                    selectedTicket?.id === t.id
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                      @{t.userUsername}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-lg border uppercase tracking-wide",
                      priorityBadge[t.priority] || 'bg-muted text-muted-foreground border-border'
                    )}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed truncate">{t.subject}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-2">
                <span className="text-2xl">🤝</span>
                <span className="font-semibold text-sm">Zero active tickets</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket chat view */}
        <div className="bg-card border border-border rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between h-[520px] shadow-sm">
          {selectedTicket ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Ticket header */}
              <div className="border-b border-border pb-4 mb-4 flex justify-between items-start gap-3">
                <div>
                  <span className="text-sm font-semibold text-foreground block">{selectedTicket.subject}</span>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {selectedTicket.userName} (@{selectedTicket.userUsername}) · {selectedTicket.category.replace('_', ' ')}
                  </span>
                </div>
                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                    className="h-8 px-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-[0.97] shrink-0"
                  >
                    <Check className="w-3 h-3" />
                    Resolve
                  </button>
                )}
              </div>

              {/* Chat thread */}
              <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-muted/30 border border-border rounded-xl mb-4">
                {selectedTicket.chatHistory.map((chat, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-sm p-3 rounded-xl space-y-1",
                      chat.sender === 'user'
                        ? "bg-card border border-border mr-auto"
                        : "bg-primary/10 border border-primary/20 ml-auto"
                    )}
                  >
                    <div className="flex justify-between items-center text-[10px] font-semibold gap-4">
                      <span className={chat.sender === 'user' ? 'text-foreground' : 'text-primary'}>
                        {chat.sender === 'user' ? `@${selectedTicket.userUsername}` : 'POPLI Support'}
                      </span>
                      <span className="text-muted-foreground font-normal">
                        {new Date(chat.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{chat.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              {selectedTicket.status !== 'resolved' ? (
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type response message…"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 h-10 bg-muted/40 border border-border rounded-xl px-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="submit"
                    className="w-24 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all text-sm flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm rounded-xl text-center">
                  ✅ This support ticket has been resolved and archived.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-3">
              <MessageCircle className="w-10 h-10 opacity-20" />
              <span className="font-semibold text-sm">Select a ticket to open chat</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
