"use client";

import { useState, useEffect } from "react";
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
    senderAvatar?: string;
}

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/inbox?userId=u1");
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                if (data.length > 0 && !selectedId) {
                    setSelectedId(data[0].id);
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

    const handleSelect = (id: string) => {
        setSelectedId(id);
        const msg = messages.find(m => m.id === id);
        if (msg && msg.status === "unread") {
            markAsDone(id); // Using the markAsRead logic
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

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        // Mock sending reply
        alert("Reply sent successfully to " + selectedMessage?.senderName);
        setReplyText("");
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            <Header breadcrumb={[{ label: "Inbox" }]} />
            
            <div className="flex-1 flex overflow-hidden p-4 pt-0 gap-4">
                {/* List Pane */}
                <Card className="w-full max-w-md flex flex-col overflow-hidden border-slate-200">
                    <div className="p-4 border-b space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Messages</h2>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-wider text-[10px]">
                                {messages.filter(m => m.status === "unread").length} New
                            </Badge>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input 
                                placeholder="Search messages..." 
                                className="pl-10 h-10 bg-slate-50/50 border-slate-200" 
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
                                        "p-4 cursor-pointer transition-colors hover:bg-slate-50 relative",
                                        selectedId === msg.id ? "bg-blue-50/50" : "bg-white",
                                        msg.status === "unread" && "font-semibold"
                                    )}
                                >
                                    {msg.status === "unread" && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm text-slate-900 truncate pr-2">{msg.senderName}</span>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                                    </div>
                                    <h3 className="text-xs text-slate-600 truncate mb-1">{msg.subject}</h3>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                            {filteredMessages.length === 0 && !loading && (
                                <div className="p-12 text-center">
                                    <Mail className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-sm text-slate-400 font-medium">No messages found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Detail Pane */}
                <Card className="flex-1 flex flex-col overflow-hidden border-slate-200">
                    {selectedMessage ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="text-slate-400"><Trash2 size={18} /></Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400"><Star size={18} /></Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400"><Reply size={18} /></Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical size={18} /></Button>
                                </div>
                            </div>
                            
                            <ScrollArea className="flex-1">
                                <div className="p-8 max-w-3xl mx-auto">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                                    {getInitials(selectedMessage.senderName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h2 className="font-bold text-slate-900">{selectedMessage.senderName}</h2>
                                                <p className="text-xs text-slate-400 mt-0.5">to: me</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-slate-400">{formatDate(selectedMessage.createdAt)}</span>
                                        </div>
                                    </div>
                                    
                                    <h1 className="text-2xl font-bold text-slate-900 mb-6">{selectedMessage.subject}</h1>
                                    
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
                                    </div>

                                    <div className="mt-12 pt-8 border-t">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Reply size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-900">Reply to {selectedMessage.senderName}</span>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                            <textarea 
                                                className="w-full bg-transparent border-0 focus:ring-0 text-sm resize-none min-h-[120px]" 
                                                placeholder="Write your response here..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <div className="flex justify-end mt-2">
                                                <Button 
                                                    onClick={handleSendReply}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold h-10 px-6"
                                                >
                                                    <Send size={16} /> Send Reply
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4">
                                <MailOpen className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Select a message</h3>
                            <p className="text-sm text-slate-400 mt-1">Choose a message from the list to view its contents.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
