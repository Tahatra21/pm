"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { 
    Clock, CheckCircle2, Briefcase, DollarSign, Calendar, 
    MoreHorizontal, ChevronRight, TrendingUp, Users, 
    Filter, Layout, Info, AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

// Types for API data
interface Stream { id: string; name: string; }

interface DashboardStats {
    totalWorkHours: number;
    tasksCompleted: number;
    activeProjects: number;
    budgetUtilization: number;
}

interface ProductivityDay {
    day: string;
    date: string;
    hours: number;
    percentage: number;
    utilization: number;
}

interface TimelineTask {
    id: string;
    title: string;
    startDate: string;
    dueDate: string;
    status: string;
}

interface ScheduleData {
    meetings: any[];
    tasks: any[];
}

const RoundedCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [productivity, setProductivity] = useState<{ chart: ProductivityDay[], stats: any }>({ chart: [], stats: null });
    const [timeline, setTimeline] = useState<TimelineTask[]>([]);
    const [schedules, setSchedules] = useState<ScheduleData>({ meetings: [], tasks: [] });
    const [summary, setSummary] = useState<any>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [selectedStream, setSelectedStream] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    const fetchData = async (streamId: string) => {
        setLoading(true);
        try {
            const query = streamId !== "all" ? `?streamId=${streamId}` : "";
            const [statsRes, prodRes, timelineRes, schedRes, summaryRes] = await Promise.all([
                fetch(`/api/dashboard/stats${query}`).then(r => r.json()),
                fetch(`/api/dashboard/productivity${query}`).then(r => r.json()),
                fetch(`/api/dashboard/timeline${query}`).then(r => r.json()),
                fetch(`/api/dashboard/schedules${query}`).then(r => r.json()),
                fetch(`/api/dashboard/summary${query}`).then(r => r.json()),
            ]);
            setStats(statsRes || null);
            setProductivity(prodRes || { chart: [], stats: null });
            setTimeline(Array.isArray(timelineRes) ? timelineRes : []);
            setSchedules(schedRes || { meetings: [], tasks: [] });
            setSummary(summaryRes || null);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        
        async function init() {
            try {
                const sRes = await fetch("/api/admin/streams");
                const sData = await sRes.json();
                if (Array.isArray(sData)) setStreams(sData);
            } catch (e) {}
            fetchData("all");
        }

        init();
        return () => clearInterval(timer);
    }, []);

    const handleStreamChange = (val: string) => {
        setSelectedStream(val);
        fetchData(val);
    };

    const greeting = currentTime.getHours() < 12 ? "Good Morning" : "Good Afternoon";

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#FBFBFE]">
            <Header breadcrumb={[{ label: "Dashboard" }]} />

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Main Content Area */}
                    <div className="xl:col-span-9 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                    {greeting}, {user?.name === "Administrator" ? "Jaiden" : (user?.name?.split(" ")[0] || "Jaiden")}!
                                </h1>
                                <p className="text-slate-400 font-medium">Here's what's happening with your projects today.</p>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Filter Stream</span>
                                <Select value={selectedStream} onValueChange={handleStreamChange}>
                                    <SelectTrigger className="w-[180px] h-9 border-0 bg-slate-50 font-bold text-xs rounded-xl focus:ring-0">
                                        <SelectValue placeholder="All Streams" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        <SelectItem value="all" className="rounded-lg font-bold text-slate-600">All Streams</SelectItem>
                                        {streams.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="rounded-lg font-bold text-slate-600">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Top KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Total Work Hour", value: (stats?.totalWorkHours ?? 0).toFixed(1), unit: "hours", sub: "Live data", icon: Clock },
                                { title: "Tasks Completed", value: stats?.tasksCompleted ?? "0", unit: "task", sub: "Live data", icon: CheckCircle2 },
                                { title: "Total Active Projects", value: stats?.activeProjects ?? "0", unit: "project", sub: "Live data", icon: Briefcase },
                                { title: "Budget Utilization", value: `${stats?.budgetUtilization ?? 0}%`, sub: "Calculated", icon: DollarSign },
                            ].map((card, i) => (
                                <RoundedCard key={i} className="relative group hover:border-blue-100 transition-all cursor-default">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-500 mb-1">{card.title}</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                                                {card.unit && <span className="text-xs font-medium text-slate-400">{card.unit}</span>}
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <card.icon size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                        <span className="font-semibold text-slate-500">{card.sub}</span>
                                    </div>
                                    {i === 0 && (
                                        <div className="absolute right-6 bottom-6 w-12 h-6 flex items-end gap-0.5">
                                            <div className="w-1.5 h-[40%] bg-blue-100 rounded-full" />
                                            <div className="w-1.5 h-[60%] bg-blue-200 rounded-full" />
                                            <div className="w-1.5 h-[100%] bg-blue-500 rounded-full" />
                                            <div className="w-1.5 h-[80%] bg-blue-300 rounded-full" />
                                        </div>
                                    )}
                                </RoundedCard>
                            ))}
                        </div>

                        {/* Reminder & Productivity Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Reminder Card */}
                            <RoundedCard className="lg:col-span-4 bg-white border-2 border-blue-50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-900">Reminder</h3>
                                    <MoreHorizontal size={16} className="text-slate-400 cursor-pointer" />
                                </div>
                                <div className="space-y-4">
                                    {(schedules?.meetings?.length ?? 0) > 0 ? (
                                        <>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 mb-1">{schedules?.meetings?.[0]?.title}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed truncate">
                                                    {schedules?.meetings?.[0]?.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex -space-x-2">
                                                    {JSON.parse(schedules?.meetings?.[0]?.attendees || "[]").map((att: string, i: number) => (
                                                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                                                            <AvatarFallback className="bg-slate-200 text-[10px] font-bold">{att}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400">Upcoming</span>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50">Reschedule</Button>
                                                <Button 
                                                    className="flex-1 h-10 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                    onClick={() => schedules?.meetings?.[0]?.location && window.open(schedules.meetings[0].location, '_blank')}
                                                >
                                                    Join Now
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-slate-400 font-medium">No upcoming meetings</p>
                                        </div>
                                    )}
                                </div>
                            </RoundedCard>

                            {/* Daily Productivity Bar Chart */}
                            <RoundedCard className="lg:col-span-8 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-bold text-slate-900 px-2">Daily Productivity</h3>
                                    <div className="flex gap-2">
                                        <select className="text-xs font-bold text-slate-500 bg-slate-50 border-0 rounded-lg px-3 py-1.5 focus:ring-0">
                                            <option>Weekly</option>
                                        </select>
                                        <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-slate-900">
                                            <Filter size={14} className="mr-2" /> Filter
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    <div className="md:col-span-4 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-slate-900 tracking-tight">{(productivity?.stats?.totalWeeklyHours ?? 0).toFixed(1)}</span>
                                                <span className="text-xl font-bold text-slate-400">h</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Hours Logged</span>
                                                <span className="text-[11px] font-bold text-emerald-500">Active week</span>
                                            </div>
                                        </div>

                                        <div className="space-y-5 mt-6">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Workload Balance</span>
                                                {productivity?.stats ? (
                                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                                        {productivity.stats.workloadBalance.overloaded} members overloaded ({'>'}90%), {productivity.stats.workloadBalance.underutilized} members underutilized ({'<'}70%).
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">Calculating workload balance...</p>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Peak Day</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-bold text-slate-900">{productivity?.stats?.peakDay?.day || "N/A"}</span>
                                                        <span className="text-slate-300">---</span>
                                                        <span className="text-[11px] font-bold text-blue-600">{productivity?.stats?.peakDay?.utilization || 0}%</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lowest Day</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-bold text-slate-900">{productivity?.stats?.lowestDay?.day || "N/A"}</span>
                                                        <span className="text-slate-300">---</span>
                                                        <span className="text-[11px] font-bold text-slate-500">{productivity?.stats?.lowestDay?.utilization || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-slate-400">Attendance</span>
                                                    <span className="text-[11px] font-black text-slate-900">92%</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-slate-400">Completion</span>
                                                    <span className="text-[11px] font-black text-slate-900">86%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart area */}
                                    <div className="md:col-span-8 relative h-[220px] flex items-end justify-between px-4 pb-12 border-l border-slate-100 pl-16">
                                        <div className="absolute left-6 top-0 bottom-12 flex flex-col justify-between text-[9px] font-black text-slate-300 pointer-events-none uppercase tracking-widest py-1">
                                            <span>Max</span>
                                            <span className="opacity-50">50%</span>
                                            <span>0</span>
                                        </div>
                                        {productivity?.chart?.length > 0 ? productivity.chart.map((day, i) => (
                                            <div key={i} className="flex flex-col items-center gap-3 flex-1">
                                                <div className="w-10 bg-slate-50 rounded-full relative group cursor-pointer h-[140px] flex items-end overflow-hidden shadow-inner">
                                                    <div 
                                                        className={cn(
                                                            "w-full rounded-full transition-all duration-700 delay-[200ms]",
                                                            day.hours > 6 ? "bg-blue-600" : "bg-blue-400"
                                                        )}
                                                        style={{ height: `${day.percentage}%` }}
                                                    />
                                                    <div className="absolute opacity-0 group-hover:opacity-100 -top-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl transition-all z-10 -translate-y-full left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                        {day.hours}h ({day.utilization}%)
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400 w-full text-center uppercase tracking-tighter">{day.day}</span>
                                            </div>
                                        )) : (
                                            <div className="flex-1 h-full flex items-center justify-center text-slate-300 font-medium italic text-xs">
                                                No productivity data available for this week.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </RoundedCard>
                        </div>

                        {/* Project Timeline Gantt View */}
                        <RoundedCard>
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="font-bold text-slate-900 px-2">Project Timeline</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200">
                                        <Calendar size={14} className="mr-2 text-slate-400" /> Aug 19, 2025
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-slate-900">
                                        <Filter size={14} className="mr-2" /> Filter
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="relative min-h-[300px]">
                                {/* Horizontal Time Markers */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    {['09:00 am', '11:00 am', '01:00 pm', '03:00 pm', '06:00 pm'].map(time => (
                                        <div key={time} className="flex items-center gap-6 w-full group">
                                            <span className="text-[10px] font-bold text-slate-300 w-16 uppercase">{time}</span>
                                            <div className="flex-1 h-px bg-slate-50 group-last:bg-transparent" />
                                        </div>
                                    ))}
                                </div>

                                {/* Gantt Bars Area */}
                                <div className="ml-24 relative pt-4 space-y-12 pb-16 min-h-[200px]">
                                    {timeline.length > 0 ? timeline.slice(0, 3).map((task, i) => (
                                        <div key={task.id} className={cn(
                                            "relative h-14 rounded-2xl border p-3 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all",
                                            task.status === 'done' ? "bg-green-50 border-green-100" : 
                                            task.status === 'in-progress' ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"
                                        )} style={{ width: '60%', marginLeft: `${i * 10}%` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                    {task.title.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900">{task.title}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                        {formatDate(task.startDate)} - {formatDate(task.dueDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex items-center justify-center h-32 text-slate-400 font-medium italic">No tasks with timelines found.</div>
                                    )}
                                </div>

                                {/* Weekday labels at bottom */}
                                <div className="ml-24 pt-8 flex justify-between px-6 border-t border-slate-50">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <span key={day} className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest",
                                            day === 'Tue' ? "text-blue-600" : "text-slate-300"
                                        )}>{day}</span>
                                    ))}
                                </div>
                            </div>
                        </RoundedCard>
                    </div>

                    {/* Right Sidebar - Analytics & Calendar */}
                    <div className="xl:col-span-3 space-y-8">
                        
                        {/* Calendar Widget */}
                        <RoundedCard className="bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-slate-900">Calendar</h4>
                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 rounded-lg px-2 py-1">
                                    <Calendar size={14} />
                                    <span className="text-xs font-bold">{format(currentTime, "MMMM")}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-4">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center">
                                {(() => {
                                    const start = new Date(currentTime);
                                    const day = start.getDay();
                                    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                                    const monday = new Date(start.setDate(diff));
                                    
                                    return Array.from({ length: 7 }).map((_, i) => {
                                        const d = new Date(monday);
                                        d.setDate(monday.getDate() + i);
                                        const isToday = d.toDateString() === currentTime.toDateString();
                                        return (
                                            <div key={i} className={cn(
                                                "h-8 flex flex-col items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-colors",
                                                isToday ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-50"
                                            )}>
                                                <span>{d.getDate()}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </RoundedCard>

                        {/* Upcoming Schedules */}
                        <RoundedCard>
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-slate-900">Upcoming Schedules</h4>
                                <MoreHorizontal size={14} className="text-slate-400" />
                            </div>
                            <div className="space-y-6">
                                {(schedules?.meetings || []).concat((schedules?.tasks || []).map(t => ({ ...t, type: 'task' }))).slice(0, 4).map((item, i) => (
                                    <div key={i} className="flex gap-4 group cursor-pointer">
                                        <div className={cn(
                                            "w-1 h-12 rounded-full shrink-0", 
                                            item.type === 'task' ? "bg-emerald-500" : "bg-blue-500"
                                        )} />
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <h5 className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h5>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <Clock size={12} />
                                                <span>{item.startTime ? format(new Date(item.startTime), "hh:mm a") : (item.dueDate ? `Due ${format(new Date(item.dueDate), "MMM dd")}` : "")}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(schedules?.meetings?.length ?? 0) === 0 && (schedules?.tasks?.length ?? 0) === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-4">No upcoming items</p>
                                )}
                            </div>
                        </RoundedCard>

                        {/* Project Summary Gauge Card */}
                        <RoundedCard>
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-bold text-slate-900">Project Summary</h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300">
                                    <Info size={14} />
                                </Button>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-4">Last update 1 day ago</span>
                            
                            {/* Semi-Circle Gauge */}
                            <div className="relative flex justify-center py-6">
                                <svg viewBox="0 0 100 55" className="w-52 transform transition-all duration-1000 ease-out">
                                    {/* Definitions for gradients if needed, but we'll stick to solid for now to match the user's request for "perfect curve" */}
                                    <defs>
                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                                            <feOffset dx="0" dy="1" result="offsetblur" />
                                            <feComponentTransfer>
                                                <feFuncA type="linear" slope="0.1" />
                                            </feComponentTransfer>
                                            <feMerge>
                                                <feMergeNode />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Background Track */}
                                    <path 
                                        d="M 12 48 A 38 38 0 0 1 88 48" 
                                        fill="none" 
                                        stroke="#f1f5f9" 
                                        strokeWidth="10" 
                                        strokeLinecap="round" 
                                    />

                                    {/* Data Segments - Calculated for perfect continuity without overlapping round caps */}
                                    {(() => {
                                        const radius = 38;
                                        const circumference = Math.PI * radius;
                                        
                                        const pTodo = summary?.percentages?.todo || 0;
                                        const pReview = summary?.percentages?.review || 0;
                                        const pProgress = summary?.percentages?.progress || 0;
                                        const pDone = summary?.percentages?.done || 0;
                                        
                                        const lTodo = (pTodo / 100) * circumference;
                                        const lReview = (pReview / 100) * circumference;
                                        const lProgress = (pProgress / 100) * circumference;
                                        const lDone = (pDone / 100) * circumference;

                                        return (
                                            <>
                                                {/* To do */}
                                                <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#f87171" strokeWidth="10" strokeDasharray={`${lTodo} ${circumference}`} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
                                                {/* Review */}
                                                <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#fbbf24" strokeWidth="10" strokeDasharray={`${lReview} ${circumference}`} strokeDashoffset={-lTodo} className="transition-all duration-1000 ease-out" />
                                                {/* Progress */}
                                                <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray={`${lProgress} ${circumference}`} strokeDashoffset={-(lTodo + lReview)} className="transition-all duration-1000 ease-out" />
                                                {/* Done */}
                                                <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#4ade80" strokeWidth="10" strokeDasharray={`${lDone} ${circumference}`} strokeDashoffset={-(lTodo + lReview + lProgress)} className="transition-all duration-1000 ease-out" />
                                                
                                                {/* Overlay rounded cap background to hide seams at ends only */}
                                                <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#FFFFFF" strokeWidth="10.5" strokeDasharray="1.5 500" strokeDashoffset="0.5" />
                                                <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#FFFFFF" strokeWidth="10.5" strokeDasharray="1.5 500" strokeDashoffset={-circumference + 1} />
                                            </>
                                        );
                                    })()}
                                </svg>
                                <div className="absolute bottom-8 flex flex-col items-center">
                                    <span className="text-4xl font-black text-slate-900 leading-none">{summary?.total || 0}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 translate-x-[0.1em]">Total Task</span>
                                </div>
                            </div>

                             <div className="flex flex-col gap-5 mt-8 border-t border-slate-50 pt-6">
                                {[
                                    { l: "To do", v: `${summary?.percentages?.todo || 0}%`, c: "bg-red-400", sub: `Total - ${summary?.counts?.todo || 0}` },
                                    { l: "In Review", v: `${summary?.percentages?.review || 0}%`, c: "bg-yellow-400", sub: `Total - ${summary?.counts?.review || 0}` },
                                    { l: "On Progress", v: `${summary?.percentages?.progress || 0}%`, c: "bg-blue-500", sub: `Total - ${summary?.counts?.["in-progress"] || 0}` },
                                    { l: "Completed", v: `${summary?.percentages?.done || 0}%`, c: "bg-emerald-400", sub: `Total - ${summary?.counts?.done || 0}` }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", item.c)} />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-600">{item.l}</span>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{item.sub}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">{item.v}</span>
                                    </div>
                                ))}
                            </div>
                        </RoundedCard>

                    </div>
                </div>
            </div>
        </div>
    );
}
