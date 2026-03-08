"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, MoreVertical, Building2, UserPlus, ExternalLink, MessageSquare, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";

interface Contact {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
    projectTitle?: string;
}

export default function ContactPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await fetch("/api/contacts");
                const data = await res.json();
                if (Array.isArray(data)) setContacts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            <Header breadcrumb={[{ label: "Contacts" }]} />
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Contact Management</h1>
                            <p className="text-sm text-slate-500 mt-1">Keep track of your clients, partners, and collaborators.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-[280px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input 
                                    placeholder="Search contacts..." 
                                    className="pl-10 h-10 bg-white border-slate-200 rounded-xl" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-4 shadow-sm">
                                <Plus size={16} /> Add Contact
                            </Button>
                        </div>
                    </div>

                    {/* Contacts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                            <Card key={c.id} className="group border-slate-200 hover:shadow-md transition-all duration-300 bg-white overflow-hidden p-0 flex flex-col">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <Avatar className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm shrink-0">
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-sm">
                                                {getInitials(c.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Star size={16} />
                                        </Button>
                                    </div>
                                    
                                    <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                        <Building2 size={12} className="text-slate-400" />
                                        <span className="truncate">{c.company || "No Company"}</span>
                                    </div>

                                    {c.projectTitle && (
                                        <div className="mb-4">
                                            <Badge variant="outline" className="text-[9px] h-4 bg-blue-50 border-blue-100 text-blue-600 font-bold uppercase tracking-tighter">
                                                Proj: {c.projectTitle}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
                                            <Mail size={12} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{c.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Phone size={12} className="text-slate-400 shrink-0" />
                                            <span>{c.phone || "No Phone"}</span>
                                        </div>
                                    </div>

                                    {c.notes && (
                                        <div className="mt-4 p-3 bg-slate-50/50 rounded-lg">
                                            <p className="text-[10px] text-slate-500 italic leading-relaxed line-clamp-2">"{c.notes}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white" />
                                        <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"><MessageSquare size={14} /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"><MoreVertical size={14} /></Button>
                                    </div>
                                </div>
                            </Card>
                        )) : !loading && (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="text-slate-300" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No contacts yet</h3>
                                <p className="text-sm text-slate-400 mt-1">Start by adding your first contact.</p>
                                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-6">
                                    <Plus size={16} /> Add Contact
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
