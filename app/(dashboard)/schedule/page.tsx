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
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            <Header breadcrumb={[{ label: "Schedule" }]} />
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* Calendar Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-slate-900">{monthName} {currentDate.getFullYear()}</h1>
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg outline-none focus:ring-0"><ChevronLeft size={16} /></Button>
                                <Button variant="ghost" className="h-8 px-3 text-xs font-bold outline-none focus:ring-0" onClick={() => setCurrentDate(new Date())}>Today</Button>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg outline-none focus:ring-0"><ChevronRight size={16} /></Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white border-slate-200">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    <SelectItem value="p1">Website Redesign</SelectItem>
                                    <SelectItem value="p2">Mobile App v2.0</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-4 shadow-sm">
                                <Plus size={16} /> New Event
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Calendar Grid */}
                        <Card className="lg:col-span-3 overflow-hidden border-slate-200 shadow-sm">
                            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
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
                                                "border-r border-b border-slate-100 p-2 transition-colors hover:bg-slate-50/50",
                                                !day && "bg-slate-50/30"
                                            )}
                                        >
                                            {day && (
                                                <>
                                                    <span className={cn(
                                                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg mb-1",
                                                        isToday ? "bg-blue-600 text-white" : "text-slate-600"
                                                    )}>
                                                        {day}
                                                    </span>
                                                    <div className="space-y-1">
                                                        {schedules
                                                            .filter(s => new Date(s.startTime).getDate() === day && new Date(s.startTime).getMonth() === currentDate.getMonth())
                                                            .map(s => (
                                                                <div key={s.id} className="bg-blue-50 border-l-2 border-blue-500 p-1 rounded-sm">
                                                                    <p className="text-[9px] font-bold text-blue-700 truncate">{s.title}</p>
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
                            <Card className="p-5 border-slate-200 shadow-sm bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-900">Upcoming Today</h3>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreHorizontal size={16} /></Button>
                                </div>
                                <div className="space-y-4">
                                    {schedules.length > 0 ? schedules.map(s => (
                                        <div key={s.id} className="group relative pl-4 border-l-2 border-blue-100 hover:border-blue-500 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <Badge variant="outline" className="text-[9px] h-4 bg-slate-50 border-slate-100 text-slate-500">{s.projectTitle}</Badge>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{s.title}</h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Clock size={10} /> {s.assignedName}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 text-center py-8">No events scheduled</p>
                                    )}
                                </div>
                                <Button variant="outline" className="w-full mt-6 h-10 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                                    View Full Timeline
                                </Button>
                            </Card>

                            <Card className="p-5 border-slate-200 shadow-sm bg-blue-600 text-white overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                                        <CalendarIcon size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight mb-2">Sync with Google Calendar</h3>
                                    <p className="text-white/80 text-xs leading-relaxed mb-4">
                                        Connect your calendar to automatically sync all project deadlines and meetings.
                                    </p>
                                    <Button className="w-full bg-white text-blue-600 hover:bg-white/90 rounded-xl font-bold h-10 text-xs">
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
