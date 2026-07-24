import React, { useState, useCallback } from 'react';
import { useRegisterRefresh } from '../hooks/useRegisterRefresh';
import { usePlatformStore } from '../store/usePlatformStore';
import { Check, Search, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

export const SupportPage: React.FC = () => {
  const { sendSupportReply } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);

const refresh = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/support/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(res.data);
    } catch {}
  }, []);

  useRegisterRefresh(refresh);

  React.useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/support/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTickets(res.data);
      } catch {} finally {
        setTicketsLoading(false);
      }
    };
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = React.useCallback(async (ticketId: string, silent = false) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/support/${ticketId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const incoming = res.data as any[];
      setChatMessages(prev => {
        const tempMsgs = prev.filter(m => m.id.startsWith('temp-'));
        return [...incoming, ...tempMsgs];
      });
      if (!silent) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!selectedTicket) return;
    fetchMessages(selectedTicket.id);

    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    const socket = io(`${baseUrl}/support`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join_ticket', selectedTicket.id);

    socket.on('new_message', (msg: any) => {
      setUserTyping(false);
      setChatMessages(prev => {
        const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
        const alreadyExists = withoutTemp.find(m => m.id === msg.id);
        if (alreadyExists) return prev;
        return [...withoutTemp, msg];
      });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    socket.on('typing_start', ({ role }: { role: string }) => {
      if (role === 'USER') setUserTyping(true);
    });

    socket.on('typing_stop', ({ role }: { role: string }) => {
      if (role === 'USER') setUserTyping(false);
    });

    return () => {
      socket.emit('leave_ticket', selectedTicket.id);
      socket.disconnect();
      setUserTyping(false);
    };
  }, [selectedTicket?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage) return;

    const text = replyMessage;
    const optimistic = {
      id: `temp-${Date.now()}`,
      message: text,
      senderRole: 'ADMIN',
      createdAt: new Date().toISOString(),
      sender: { id: 'admin', name: 'Support', username: 'support' },
    };
    setChatMessages(prev => [...prev, optimistic]);
    setReplyMessage('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/support/${selectedTicket.id}/message`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages(selectedTicket.id);
    } catch {
      setChatMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setReplyMessage(text);
      toast.error('Failed to send reply');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/support/${ticketId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ticket resolved.');
      setSelectedTicket((prev: any) => prev ? { ...prev, status: 'resolved' } : null);
    } catch {
      toast.error('Failed to resolve ticket');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const name = t.creator?.name || '';
    const username = t.creator?.username || '';
    const subject = t.subject || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const statusBadge: Record<string, string> = {
    OPEN: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    CLOSED: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-foreground tracking-tight">Platform Customer Support</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">POPLI creator complaints desk and verification assistant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col h-[580px] space-y-4">
          <h2 className="text-[15px] font-semibold text-foreground">Complaints Desk Queue</h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-muted border border-border rounded-lg pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {ticketsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 bg-muted border border-border rounded-xl flex flex-col gap-2 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
                    <div className="h-3 w-10 bg-muted-foreground/20 rounded" />
                  </div>
                  <div className="h-2.5 w-full bg-muted-foreground/20 rounded" />
                  <div className="h-2 w-16 bg-muted-foreground/20 rounded" />
                </div>
              ))
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={cn(
                    'p-3 border rounded-xl flex flex-col gap-1.5 cursor-pointer transition-all duration-150 select-none',
                    selectedTicket?.id === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/40 hover:border-primary/40'
                  )}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[13px] font-semibold text-foreground truncate">
                      @{t.creator?.username}
                    </span>
                    <span className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider flex-shrink-0',
                      statusBadge[(t.status || '').toUpperCase()] || 'bg-muted text-muted-foreground border-border'
                    )}>
                      {t.status || 'open'}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">{t.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-2">
                <MessageCircle className="w-8 h-8 opacity-20" />
                <span className="text-[13px] font-semibold text-foreground">Zero active tickets</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 flex flex-col h-[580px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              <div className="border-b border-border pb-4 mb-4 flex justify-between items-start gap-3">
                <div>
                  <span className="text-[15px] font-semibold text-foreground block">{selectedTicket.subject}</span>
                  <span className="text-[12px] text-muted-foreground mt-0.5 block">
                    {selectedTicket.creator?.name} (@{selectedTicket.creator?.username})
                  </span>
                </div>
                {(selectedTicket.status || '').toUpperCase() !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                    className="h-8 px-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-all text-[12px] font-semibold flex items-center gap-1.5 active:scale-[0.97] flex-shrink-0"
                  >
                    <Check className="w-3 h-3" />
                    Resolve
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-muted/30 border border-border rounded-lg mb-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                    <MessageCircle className="w-8 h-8 opacity-20" />
                    <span className="text-[12px]">No messages yet</span>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isAdmin = msg.senderRole === 'ADMIN';
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'max-w-sm p-3 rounded-lg space-y-1',
                          isAdmin
                            ? 'bg-primary/10 border border-primary/20 ml-auto'
                            : 'bg-card border border-border mr-auto'
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px] font-semibold gap-4">
                          <span className={isAdmin ? 'text-primary' : 'text-foreground'}>
                            {isAdmin ? 'POPLI Support' : `@${selectedTicket.creator?.username}`}
                          </span>
                          <span className="text-muted-foreground font-normal">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[12px] text-foreground leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {userTyping && (
                <div className="flex items-center gap-2 px-1 mb-2">
                  <span className="text-[11px] text-muted-foreground">@{selectedTicket.creator?.username} is typing</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {(selectedTicket.status || '').toUpperCase() !== 'RESOLVED' ? (
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type response message…"
                    value={replyMessage}
                    onChange={(e) => {
                      setReplyMessage(e.target.value);
                      if (!selectedTicket || !socketRef.current) return;
                      socketRef.current.emit('typing_start', { ticketId: selectedTicket.id, role: 'ADMIN' });
                      clearTimeout((socketRef.current as any)._typingTimer);
                      (socketRef.current as any)._typingTimer = setTimeout(() => {
                        socketRef.current?.emit('typing_stop', { ticketId: selectedTicket.id, role: 'ADMIN' });
                      }, 1500);
                    }}
                    className="flex-1 h-9 bg-muted border border-border rounded-lg px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
                  />
                  <button
                    type="submit"
                    className="h-9 px-4 bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] font-semibold rounded-lg text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  This support ticket has been resolved and archived.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
              <MessageCircle className="w-10 h-10 opacity-20" />
              <span className="text-[13px] font-semibold text-foreground">Select a ticket to open chat</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};