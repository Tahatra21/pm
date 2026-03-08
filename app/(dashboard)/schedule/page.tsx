"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Filter, MoreHorizontal } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    projectId: string;
    projectTitle: string;
    assignedName: string;
}

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const res = await fetch("/api/schedules");
                const data = await res.json();
                if (Array.isArray(data)) setSchedules(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-muted/50">
            <Header breadcrumb={[{ label: "Schedule" }]} />
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* Calendar Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-headline-small text-foreground">{monthName} {currentDate.getFullYear()}</h1>
                            <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg outline-none focus:ring-0 text-muted-foreground/60"><ChevronLeft size={16} /></Button>
                                <Button variant="ghost" className="h-8 px-3 text-label-medium font-medium outline-none focus:ring-0 text-foreground" onClick={() => setCurrentDate(new Date())}>Today</Button>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg outline-none focus:ring-0 text-muted-foreground/60"><ChevronRight size={16} /></Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[160px] h-10 rounded-xl bg-card border-border text-label-medium font-medium">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    <SelectItem value="p1">Website Redesign</SelectItem>
                                    <SelectItem value="p2">Mobile App v2.0</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 !text-white gap-2 font-medium text-label-large px-4 shadow-sm">
                                <Plus size={16} className="text-white" /> New Event
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Calendar Grid */}
                        <Card className="lg:col-span-3 overflow-hidden border-border shadow-sm bg-card">
                            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-3 text-center text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em] leading-none">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 auto-rows-[120px]">
                                {calendarDays.map((day, idx) => {
                                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                                    return (
                                        <div 
                                            key={idx} 
                                            className={cn(
                                                "border-r border-b border-border p-2 transition-colors hover:bg-muted/50",
                                                !day && "bg-muted/10"
                                            )}
                                        >
                                            {day && (
                                                <>
                                                    <span className={cn(
                                                        "text-label-medium font-medium w-6 h-6 flex items-center justify-center rounded-lg mb-1 tabular-nums",
                                                        isToday ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/80"
                                                    )}>
                                                        {day}
                                                    </span>
                                                    <div className="space-y-1">
                                                        {schedules
                                                            .filter(s => new Date(s.startTime).getDate() === day && new Date(s.startTime).getMonth() === currentDate.getMonth())
                                                            .map(s => (
                                                                <div key={s.id} className="bg-primary/10 border-l-2 border-primary p-1 rounded-sm">
                                                                    <p className="text-[10px] font-medium text-primary leading-tight truncate">{s.title}</p>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Side Info */}
                        <div className="space-y-6">
                            <Card className="p-5 border-border shadow-sm bg-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-title-small font-medium text-foreground">Upcoming Today</h3>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40"><MoreHorizontal size={16} /></Button>
                                </div>
                                <div className="space-y-4">
                                    {schedules.length > 0 ? schedules.map(s => (
                                        <div key={s.id} className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-label-small font-medium text-muted-foreground/40 tabular-nums">
                                                    {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <Badge variant="outline" className="text-label-small font-medium h-4 bg-muted border-border text-muted-foreground/60 shadow-none px-1.5">{s.projectTitle}</Badge>
                                            </div>
                                            <h4 className="text-body-small font-medium text-foreground group-hover:text-primary transition-colors">{s.title}</h4>
                                            <p className="text-label-small text-muted-foreground/40 mt-1 flex items-center gap-1">
                                                <Clock size={10} className="text-muted-foreground/20" /> {s.assignedName}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-body-small text-muted-foreground/40 text-center py-8 italic">No events scheduled</p>
                                    )}
                                </div>
                                <Button variant="outline" className="w-full mt-6 h-10 rounded-xl text-label-medium font-medium border-border text-foreground/80 hover:bg-muted shadow-sm transition-all">
                                    View Full Timeline
                                </Button>
                            </Card>

                            <Card className="p-5 border-border shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                                        <CalendarIcon size={20} />
                                    </div>
                                    <h3 className="text-title-large font-medium text-white leading-tight mb-2">Sync with Google Calendar</h3>
                                    <p className="text-primary-foreground/70 text-body-small leading-relaxed mb-4">
                                        Connect your calendar to automatically sync all project deadlines and meetings.
                                    </p>
                                    <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-medium h-10 text-label-medium shadow-lg shadow-black/5">
                                        Connect Now
                                    </Button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
