"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, MailOpen, Trash2, Reply, Star, MoreVertical, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    id: string;
    subject: string;
    message: string;
    status: "unread" | "read";
    createdAt: string;
    senderName: string;
    senderId: string;
    senderAvatar?: string;
    receiverId?: string;
}

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [history, setHistory] = useState<Message[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/inbox?userId=u1");
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                if (data.length > 0 && !selectedId) {
                    setSelectedId(data[0].id);
                    fetchHistory(data[0]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const selectedMessage = messages.find(m => m.id === selectedId);

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/inbox", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "read" }),
            });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read" } : m));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHistory = async (msg: Message) => {
        setHistoryLoading(true);
        try {
            // Determine the other person in the conversation
            const contactId = msg.senderId === "u1" ? msg.receiverId : msg.senderId;
            if (!contactId) return;

            const res = await fetch(`/api/inbox?userId=u1&contactId=${contactId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setHistory(data);
                // Scroll to bottom after history loads
                setTimeout(() => {
                    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                }, 100);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
        const msg = messages.find(m => m.id === id);
        if (msg) {
            fetchHistory(msg);
            if (msg.status === "unread") {
                markAsDone(id);
            }
        }
    };

    const markAsDone = async (id: string) => {
        // Simple mock for mark as read
         setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read" } : m));
         // Actually call API
         await fetch("/api/inbox", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "read" }),
        });
    }

    const filteredMessages = messages.filter(m => 
        m.subject.toLowerCase().includes(search.toLowerCase()) || 
        m.senderName.toLowerCase().includes(search.toLowerCase())
    );

    const [replyText, setReplyText] = useState("");

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedMessage) return;
        
        try {
            const res = await fetch("/api/inbox", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: "u1",
                    receiverId: selectedMessage.senderId === "u1" ? selectedMessage.receiverId : selectedMessage.senderId,
                    subject: `Re: ${selectedMessage.subject}`,
                    message: replyText
                }),
            });
            
            if (res.ok) {
                const newMsg = await res.json();
                setHistory(prev => [...prev, {
                    ...newMsg,
                    senderName: "Me", // Simple for UI
                }]);
                setReplyText("");
                // Scroll to bottom after sending
                setTimeout(() => {
                    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                }, 100);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            const res = await fetch(`/api/inbox?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== id));
                if (selectedId === id) setSelectedId(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleStar = (id: string) => {
        setStarredIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-muted/50">
            <Header breadcrumb={[{ label: "Inbox" }]} />
            
            <div className="flex-1 flex overflow-hidden p-4 pt-0 gap-4">
                {/* List Pane */}
                <Card className="w-full max-w-md flex flex-col overflow-hidden border-border">
                    <div className="p-4 border-b space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Messages</h2>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-wider text-[10px]">
                                {messages.filter(m => m.status === "unread").length} New
                            </Badge>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                            <Input 
                                placeholder="Search messages..." 
                                className="pl-10 h-10 bg-muted/50 border-border" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-slate-100">
                            {filteredMessages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    onClick={() => handleSelect(msg.id)}
                                    className={cn(
                                        "p-4 cursor-pointer transition-colors hover:bg-muted relative",
                                        selectedId === msg.id ? "bg-primary/10/50" : "bg-card",
                                        msg.status === "unread" && "font-semibold"
                                    )}
                                >
                                    {msg.status === "unread" && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm text-foreground truncate pr-2">{msg.senderName}</span>
                                        <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                                    </div>
                                    <h3 className="text-xs text-foreground/80 truncate mb-1">{msg.subject}</h3>
                                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                            {filteredMessages.length === 0 && !loading && (
                                <div className="p-12 text-center">
                                    <Mail className="mx-auto text-muted-foreground/60 mb-2" size={32} />
                                    <p className="text-sm text-muted-foreground/80 font-medium">No messages found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Detail Pane */}
                <Card className="flex-1 flex flex-col overflow-hidden border-border bg-white/40 backdrop-blur-3xl shadow-2xl relative">
                    {selectedMessage ? (
                        <>
                            {/* Header Toolbar */}
                            <div className="h-16 shrink-0 border-b border-border/40 px-6 flex items-center justify-between bg-white/60 backdrop-blur-md z-20">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-black text-foreground truncate max-w-[300px] leading-tight">
                                            {selectedMessage.subject}
                                        </h2>
                                        <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tight">
                                            Conversation with {selectedMessage.senderName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={cn(
                                            "w-9 h-9 transition-all rounded-full",
                                            starredIds.has(selectedMessage.id) ? "text-yellow-500 bg-yellow-50" : "text-muted-foreground/60 hover:bg-muted"
                                        )}
                                        onClick={() => handleToggleStar(selectedMessage.id)}
                                    >
                                        <Star size={18} fill={starredIds.has(selectedMessage.id) ? "currentColor" : "none"} />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="w-9 h-9 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    <div className="w-px h-6 bg-border/40 mx-1" />
                                    <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground/60 rounded-full hover:bg-muted"><MoreVertical size={18} /></Button>
                                </div>
                            </div>
                            
                            {/* Chat History Area */}
                            <div className="flex-1 overflow-hidden relative flex flex-col">
                                <ScrollArea className="flex-1">
                                    <div className="p-8 pb-32 max-w-4xl mx-auto space-y-12">
                                        {/* Original Message / Context Header if no history */}
                                        {history.length === 0 && !historyLoading && (
                                            <div className="flex flex-col items-center py-12 text-center">
                                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                                    <MailOpen size={24} className="text-primary/40" />
                                                </div>
                                                <p className="text-xs text-muted-foreground/60 font-medium">Initial message received on {formatDate(selectedMessage.createdAt)}</p>
                                            </div>
                                        )}

                                        <div className="space-y-10">
                                            {history.map((msg, index) => {
                                                const isMe = msg.senderId === "u1";
                                                return (
                                                    <div key={msg.id} className={cn(
                                                        "group flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both",
                                                        isMe ? "items-end" : "items-start"
                                                    )} style={{ animationDelay: `${index * 50}ms` }}>
                                                        <div className={cn(
                                                            "flex items-end gap-3 max-w-[80%]",
                                                            isMe ? "flex-row-reverse" : "flex-row"
                                                        )}>
                                                            {!isMe && (
                                                                <Avatar className="w-9 h-9 ring-4 ring-white/50 shadow-sm shrink-0 mb-1 active:scale-90 transition-transform">
                                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-black text-[10px] uppercase">
                                                                        {getInitials(msg.senderName)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                            
                                                            <div className={cn(
                                                                "flex flex-col gap-1.5",
                                                                isMe ? "items-end" : "items-start"
                                                            )}>
                                                                <div className={cn(
                                                                    "flex items-center gap-2 px-2",
                                                                    isMe ? "flex-row-reverse" : "flex-row"
                                                                )}>
                                                                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                                                        {isMe ? "You" : msg.senderName}
                                                                    </span>
                                                                    <span className="text-[9px] text-muted-foreground/30 font-bold">
                                                                        {formatDate(msg.createdAt)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className={cn(
                                                                    "relative p-4 text-[13px] leading-relaxed shadow-sm transition-all group-hover:shadow-md",
                                                                    isMe 
                                                                        ? "bg-primary text-white font-medium rounded-2xl rounded-tr-none border border-primary/20" 
                                                                        : "bg-white text-foreground/90 font-medium rounded-2xl rounded-tl-none border border-border/50"
                                                                )}>
                                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                                    {/* Subtle indicator for sent/received */}
                                                                    <div className={cn(
                                                                        "absolute bottom-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity",
                                                                        isMe ? "text-white" : "text-primary"
                                                                    )}>
                                                                        {isMe ? <Send size={10} /> : <Badge className="w-1 h-1 p-0 bg-primary rounded-full" />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={scrollRef} className="h-4" />
                                        </div>
                                    </div>
                                </ScrollArea>

                                {/* Floating Premium Input Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-30 pointer-events-none">
                                    <div className="max-w-3xl mx-auto pointer-events-auto">
                                        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 p-1.5 rounded-[32px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] flex items-end gap-2 transition-all focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20">
                                            <div className="flex-1 relative">
                                                <textarea 
                                                    className="w-full bg-transparent border-0 focus:ring-0 text-sm resize-none py-3 px-5 max-h-[200px] font-medium placeholder:text-muted-foreground/30 scrollbar-hide" 
                                                    placeholder="Message to your colleague..."
                                                    rows={1}
                                                    value={replyText}
                                                    onChange={(e) => {
                                                        setReplyText(e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendReply();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Button 
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim() || historyLoading}
                                                className={cn(
                                                    "rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 text-white shadow-lg transition-all active:scale-90 shrink-0",
                                                    !replyText.trim() && "opacity-20 scale-90 grayscale"
                                                )}
                                            >
                                                <Send size={18} className={cn("transition-transform", replyText.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-12" : "")} />
                                            </Button>
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">Press Enter to send</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 rounded-[40px] bg-white shadow-xl flex items-center justify-center mb-6 animate-pulse">
                                <MailOpen className="text-primary/20" size={40} />
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Your Inbox is Ready</h3>
                            <p className="text-sm text-muted-foreground/60 mt-2 max-w-[280px] font-medium leading-relaxed">Select a thread to start a professional conversation with your team.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
