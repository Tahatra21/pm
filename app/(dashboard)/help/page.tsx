"use client";

import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { 
    HelpCircle, Book, Rocket, Shield, 
    MessageSquare, Zap, Ship, LayoutDashboard,
    ArrowRight, ChevronRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const HELP_SECTIONS = [
    {
        title: "Getting Started",
        icon: Rocket,
        items: [
            { q: "What is a Stream?", a: "Streams are high-level project categories like EP & Pembangkit or Distribusi. Every project must belong to one stream for global reporting." },
            { q: "How to use Tags?", a: "Tags are granular classifications used for filtering. You can add multiple tags to a single project." },
            { q: "Dashboard Filtering", a: "Use the Stream Filter at the top of the Dashboard to instantly update all KPI widgets and timelines." }
        ]
    },
    {
        title: "Project Management",
        icon: Book,
        items: [
            { q: "Kanban Board", a: "The Board view allows you to see tasks in columns (To Do, Progress, Review, Done). Move tasks to update their status." },
            { q: "Project List", a: "View all projects and filter them by Stream or Tag using the advanced search bar." }
        ]
    },
    {
        title: "Admin & Security",
        icon: Shield,
        items: [
            { q: "Managing Master Data", a: "Admins can manage Streams and Tags via the Admin menu. You can deactivate items but not hard-delete them if used by projects." },
            { q: "User Roles", a: "There are three roles: Admin (Full control), Member (Project access), and Viewer (Read-only)." }
        ]
    }
];

export default function HelpPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-muted/50">
            <Header breadcrumb={[{ label: "Help Center" }]} />
            
            <ScrollArea className="flex-1">
                <div className="max-w-5xl mx-auto p-12">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                            <HelpCircle size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">How can we help you?</h1>
                        <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
                            Everything you need to know about the new Stream Module and Project Management features.
                        </p>
                    </div>

                    {/* Quick Link Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <Card className="p-6 border-border hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-bold text-foreground mb-2">The Stream Module</h3>
                            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">Learn how to organize your projects into professional streams.</p>
                            <Button 
                                variant="ghost" 
                                className="p-0 text-primary font-bold hover:bg-transparent flex items-center gap-2"
                                onClick={() => document.getElementById('faq-getting-started')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Read Guide <ArrowRight size={14} />
                            </Button>
                        </Card>
                        <Card className="p-6 border-border hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Ship size={24} />
                            </div>
                            <h3 className="font-bold text-foreground mb-2">Master Data</h3>
                            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">How to manage streams and tags from the administrative panel.</p>
                            <Button 
                                variant="ghost" 
                                className="p-0 text-primary font-bold hover:bg-transparent flex items-center gap-2"
                                onClick={() => window.location.href = '/admin/streams'}
                            >
                                Manage Data <ArrowRight size={14} />
                            </Button>
                        </Card>
                        <Card className="p-6 border-border hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard size={24} />
                            </div>
                            <h3 className="font-bold text-foreground mb-2">Smart Dashboard</h3>
                            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">Mastering global filters and automated KPI reporting.</p>
                            <Button 
                                variant="ghost" 
                                className="p-0 text-primary font-bold hover:bg-transparent flex items-center gap-2"
                                onClick={() => window.location.href = '/'}
                            >
                                Learn More <ArrowRight size={14} />
                            </Button>
                        </Card>
                    </div>

                    {/* FAQ Sections */}
                    <div className="space-y-12">
                        {HELP_SECTIONS.map((section, idx) => (
                            <div key={idx}>
                                <div className="flex items-center gap-3 mb-8" id={`faq-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                    <div className="w-10 h-10 rounded-xl bg-secondary/90 text-primary-foreground flex items-center justify-center">
                                        <section.icon size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground uppercase tracking-widest">{section.title}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {section.items.map((item, i) => (
                                        <Card key={i} className="p-6 border-border bg-card hover:border-primary/20 transition-colors">
                                            <h4 className="font-bold text-foreground mb-3 flex items-start gap-2">
                                                <ChevronRight size={16} className="text-primary mt-0.5 shrink-0" />
                                                {item.q}
                                            </h4>
                                            <p className="text-[13px] text-muted-foreground leading-relaxed pl-6">
                                                {item.a}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Contact */}
                    <div className="mt-24 p-12 bg-secondary/90 rounded-[32px] text-center text-primary-foreground relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-4">Still have questions?</h2>
                            <p className="text-muted-foreground/80 mb-8 max-w-lg mx-auto">
                                Our support team is always here to help you get the most out of Worktion.
                            </p>
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold gap-2">
                                <MessageSquare size={18} /> Chat with us
                            </Button>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
