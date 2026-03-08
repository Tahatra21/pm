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
        <div className="flex flex-col h-full overflow-hidden bg-muted/50">
            <Header breadcrumb={[{ label: "Contacts" }]} />
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Contact Management</h1>
                            <p className="text-sm text-muted-foreground mt-1">Keep track of your clients, partners, and collaborators.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-[280px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                                <Input 
                                    placeholder="Search contacts..." 
                                    className="pl-10 h-10 bg-card border-border rounded-xl" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 font-bold px-4 shadow-sm">
                                <Plus size={16} /> Add Contact
                            </Button>
                        </div>
                    </div>

                    {/* Contacts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                            <Card key={c.id} className="group border-border hover:shadow-md transition-all duration-300 bg-card overflow-hidden p-0 flex flex-col">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <Avatar className="w-12 h-12 rounded-2xl border-2 border-background shadow-sm shrink-0">
                                            <AvatarFallback className="bg-muted/80 text-foreground/80 font-bold text-sm">
                                                {getInitials(c.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Star size={16} />
                                        </Button>
                                    </div>
                                    
                                    <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">{c.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                        <Building2 size={12} className="text-muted-foreground/80" />
                                        <span className="truncate">{c.company || "No Company"}</span>
                                    </div>

                                    {c.projectTitle && (
                                        <div className="mb-4">
                                            <Badge variant="outline" className="text-[9px] h-4 bg-primary/10 border-primary/20 text-primary font-bold uppercase tracking-tighter">
                                                Proj: {c.projectTitle}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-foreground/80 truncate">
                                            <Mail size={12} className="text-muted-foreground/80 shrink-0" />
                                            <span className="truncate">{c.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-foreground/80">
                                            <Phone size={12} className="text-muted-foreground/80 shrink-0" />
                                            <span>{c.phone || "No Phone"}</span>
                                        </div>
                                    </div>

                                    {c.notes && (
                                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                            <p className="text-[10px] text-muted-foreground italic leading-relaxed line-clamp-2">"{c.notes}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 py-3 bg-muted/50 border-t border-border flex items-center justify-between">
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-background" />
                                        <div className="w-5 h-5 rounded-full bg-muted/60 border-2 border-background" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/80 hover:text-primary"><MessageSquare size={14} /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/80 hover:text-primary"><MoreVertical size={14} /></Button>
                                    </div>
                                </div>
                            </Card>
                        )) : !loading && (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="text-muted-foreground/60" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No contacts yet</h3>
                                <p className="text-sm text-muted-foreground/80 mt-1">Start by adding your first contact.</p>
                                <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold px-6">
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
