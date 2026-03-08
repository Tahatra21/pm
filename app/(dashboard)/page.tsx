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
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Types for API data
interface Stream { id: string; name: string; }

interface DashboardStats {
    totalWorkHours: number;
    tasksCompleted: number;
    activeProjects: number;
    budgetUtilization: number;
    attendanceRate: number;
    completionRate: number;
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
    projectId: string;
}

interface ScheduleData {
    meetings: any[];
    tasks: any[];
}

const RoundedCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-card rounded-[24px] border border-border shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [productivity, setProductivity] = useState<{ chart: ProductivityDay[], stats: any }>({ chart: [], stats: null });
    const [timeline, setTimeline] = useState<TimelineTask[]>([]);
    const [schedules, setSchedules] = useState<ScheduleData>({ meetings: [], tasks: [] });
    const [summary, setSummary] = useState<any>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [selectedStream, setSelectedStream] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("weekly"); // weekly, monthly, yearly
    const [selectedTimelineStatus, setSelectedTimelineStatus] = useState<string>("all");
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
    const [scheduleFilter, setScheduleFilter] = useState<"all" | "meeting" | "task">("all");
    const [showGoal, setShowGoal] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHasMounted(true);
        // Keep currentTime updated every minute
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async (streamId: string, period: string) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (streamId !== "all") queryParams.append("streamId", streamId);
            queryParams.append("period", period);
            const query = `?${queryParams.toString()}`;

            const timelineQueryParams = new URLSearchParams();
            if (streamId !== "all") timelineQueryParams.append("streamId", streamId);
            if (selectedTimelineStatus !== "all") timelineQueryParams.append("status", selectedTimelineStatus);

            const [statsRes, prodRes, timelineRes, schedRes, summaryRes] = await Promise.all([
                fetch(`/api/dashboard/stats${query}`).then(r => r.json()),
                fetch(`/api/dashboard/productivity${query}`).then(r => r.json()),
                fetch(`/api/dashboard/timeline?${timelineQueryParams.toString()}`).then(r => r.json()),
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
            } catch (e) { }
            fetchData(selectedStream, selectedPeriod);
        }

        init();
        return () => clearInterval(timer);
    }, []);

    const handleStreamChange = (val: string) => {
        setSelectedStream(val);
        fetchData(val, selectedPeriod);
    };

    const handlePeriodChange = (val: string) => {
        setSelectedPeriod(val);
        fetchData(selectedStream, val);
    };

    const handleTimelineStatusChange = async (val: string) => {
        setSelectedTimelineStatus(val);
        // Special case: just fetch timeline
        try {
            const queryParams = new URLSearchParams();
            if (selectedStream !== "all") queryParams.append("streamId", selectedStream);
            if (val !== "all") queryParams.append("status", val);
            const res = await fetch(`/api/dashboard/timeline?${queryParams.toString()}`);
            const data = await res.json();
            setTimeline(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const greeting = hasMounted ? (currentTime.getHours() < 12 ? "Good Morning" : "Good Afternoon") : "Welcome back";

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <Header breadcrumb={[{ label: "Dashboard" }]} />

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Main Content Area */}
                    <div className="xl:col-span-9 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-headline-large text-foreground mb-1">
                                    {greeting}, {user?.name?.split(" ")[0] || "User"}!
                                </h1>
                                <p className="text-body-large text-muted-foreground/80">Here's what's happening with your projects today.</p>
                            </div>

                            <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
                                <span className="text-label-small text-muted-foreground/60 uppercase tracking-[0.08em] pl-2">Filter Stream</span>
                                <Select value={selectedStream} onValueChange={handleStreamChange}>
                                    <SelectTrigger className="w-[180px] h-9 border-0 bg-muted font-medium text-label-medium rounded-xl focus:ring-0">
                                        <SelectValue placeholder="All Streams" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        <SelectItem value="all" className="rounded-lg font-medium text-body-medium">All Streams</SelectItem>
                                        {streams.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="rounded-lg font-medium text-body-medium">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Top KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-9">
                            {[
                                { title: "Total Work Hour", value: hasMounted ? (stats?.totalWorkHours ?? 0).toFixed(1) : "0.0", unit: "hours", sub: "Live data", icon: Clock },
                                { title: "Tasks Completed", value: hasMounted ? (stats?.tasksCompleted ?? "0") : "0", unit: "task", sub: "Live data", icon: CheckCircle2 },
                                { title: "Total Active Projects", value: hasMounted ? (stats?.activeProjects ?? "0") : "0", unit: "project", sub: "Live data", icon: Briefcase },
                                { title: "Budget Utilization", value: hasMounted ? `${stats?.budgetUtilization ?? 0}%` : "0%", sub: "Calculated", icon: DollarSign },
                            ].map((card, i) => (
                                <RoundedCard key={i} className="relative group hover:border-primary/20 transition-all cursor-default">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-label-large text-muted-foreground mb-1">{card.title}</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-headline-small font-medium text-foreground">{card.value}</span>
                                                {card.unit && <span className="text-label-medium text-muted-foreground/60">{card.unit}</span>}
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <card.icon size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                                        <span className="font-normal text-muted-foreground">{card.sub}</span>
                                    </div>
                                    {i === 0 && (
                                        <div className="absolute right-6 bottom-6 w-12 h-6 flex items-end gap-0.5">
                                            <div className="w-1.5 h-[40%] bg-primary/20 rounded-full" />
                                            <div className="w-1.5 h-[60%] bg-primary/30 rounded-full" />
                                            <div className="w-1.5 h-[100%] bg-primary rounded-full" />
                                            <div className="w-1.5 h-[80%] bg-primary/40 rounded-full" />
                                        </div>
                                    )}
                                </RoundedCard>
                            ))}
                        </div>

                        {/* Reminder & Productivity Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Reminder Card */}
                            <RoundedCard className="lg:col-span-4 bg-card border-2 border-primary/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-medium text-foreground">Reminder</h3>
                                    <MoreHorizontal size={16} className="text-muted-foreground/80 cursor-pointer" />
                                </div>
                                <div className="space-y-4">
                                    {hasMounted && (schedules?.meetings?.length ?? 0) > 0 ? (
                                        <>
                                            <div>
                                                <h4 className="text-sm font-medium text-foreground mb-1">{schedules?.meetings?.[0]?.title}</h4>
                                                <p className="text-xs font-normal text-muted-foreground leading-relaxed truncate">
                                                    {schedules?.meetings?.[0]?.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex -space-x-2">
                                                    {JSON.parse(schedules?.meetings?.[0]?.attendees || "[]").map((att: string, i: number) => (
                                                        <Avatar key={i} className="w-8 h-8 border-2 border-background">
                                                            <AvatarFallback className="bg-muted/60 text-label-small">{att}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-label-small text-muted-foreground/60">Upcoming</span>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs font-bold border-border hover:bg-muted">Reschedule</Button>
                                                <Button
                                                    className="flex-1 h-10 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-sm"
                                                    onClick={() => schedules?.meetings?.[0]?.location && window.open(schedules.meetings[0].location, '_blank')}
                                                >
                                                    Join Now
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <p className="text-label-medium text-muted-foreground/60">{hasMounted ? "No upcoming meetings" : "..."}</p>
                                        </div>
                                    )}
                                </div>
                            </RoundedCard>

                            {/* Daily Productivity Bar Chart */}
                            <RoundedCard className="lg:col-span-8 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-title-large text-foreground px-2">Daily Productivity</h3>
                                    <div className="flex gap-2">
                                        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                                            <SelectTrigger className="w-[120px] h-9 border-0 bg-muted font-bold text-xs rounded-xl focus:ring-0 shadow-none">
                                                <SelectValue placeholder="Period" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border shadow-2xl">
                                                <SelectItem value="weekly" className="text-xs font-bold rounded-lg">Weekly</SelectItem>
                                                <SelectItem value="monthly" className="text-xs font-bold rounded-lg">Monthly</SelectItem>
                                                <SelectItem value="yearly" className="text-xs font-bold rounded-lg">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 text-label-medium text-muted-foreground/60 hover:text-foreground">
                                                    <Filter size={14} className="mr-2" /> Filter
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 border-border shadow-2xl rounded-xl">
                                                <div className="px-2 py-1.5 text-label-small font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">Chart Options</div>
                                                <div className="flex items-center justify-between px-2 py-2">
                                                    <Label className="text-label-medium text-foreground/80 cursor-pointer" htmlFor="show-goal">Show Goal Line</Label>
                                                    <Checkbox id="show-goal" checked={showGoal} onCheckedChange={(val) => setShowGoal(!!val)} className="rounded-md border-border" />
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    <div className="md:col-span-4 flex flex-col gap-8">
                                        <div className="space-y-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-headline-small font-medium text-foreground">{hasMounted ? (productivity?.stats?.totalWeeklyHours ?? 0).toFixed(1) : "0.0"}</span>
                                                <span className="text-title-small text-muted-foreground/60">h</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">Weekly Hours Log</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-0">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/20 bg-primary/5 text-primary">Team Health</Badge>
                                                </div>
                                                {hasMounted && productivity?.stats ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-[11px] font-bold">
                                                                <span className="text-muted-foreground">Overloaded ({'>'}90%)</span>
                                                                <span className="text-orange-500">{productivity.stats.workloadBalance.overloaded} members</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-orange-500 transition-all duration-500"
                                                                    style={{ width: `${(productivity.stats.workloadBalance.overloaded / 10) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-[11px] font-bold">
                                                                <span className="text-muted-foreground">Underutilized ({'<'}70%)</span>
                                                                <span className="text-blue-500">{productivity.stats.workloadBalance.underutilized} members</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-400 transition-all duration-500"
                                                                    style={{ width: `${(productivity.stats.workloadBalance.underutilized / 10) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">{hasMounted ? "Calculating statistics..." : "..."}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart & Stats Area */}
                                    <div className="md:col-span-8 flex flex-col gap-6">
                                        <div className="relative h-[220px] flex items-end justify-between px-4 pb-12 border-l border-border pl-16">
                                            {/* Target Goal Line */}
                                            {showGoal && (
                                                <div className="absolute left-16 right-4 border-t border-dashed border-primary/40 z-0 bottom-[80px]" title="Target Goal: 80%">
                                                    <span className="absolute -top-4 right-0 text-label-small text-primary/60 uppercase tracking-[0.08em]">Target 80%</span>
                                                </div>
                                            )}
                                            <div className="absolute left-6 top-0 bottom-12 flex flex-col justify-between text-label-small text-muted-foreground/40 pointer-events-none uppercase tracking-tighter py-1">
                                                <span>Max</span>
                                                <span className="opacity-50">50%</span>
                                                <span>0</span>
                                            </div>
                                            {hasMounted && productivity?.chart?.length > 0 ? (
                                                productivity.chart.map((day, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-3 flex-1">
                                                        <div className="w-7 bg-muted rounded-full relative group cursor-pointer h-[140px] flex items-end overflow-hidden shadow-inner" title={`${day.day}: ${day.hours}h`}>
                                                            <div
                                                                className={cn(
                                                                    "w-full rounded-full transition-all duration-700 delay-[200ms]",
                                                                    day.hours > 6 ? "bg-primary" : "bg-primary"
                                                                )}
                                                                style={{ height: `${day.percentage}%` }}
                                                            />
                                                            <div className="absolute opacity-0 group-hover:opacity-100 -top-1 bg-secondary/90 text-primary-foreground text-label-small px-2 py-1 rounded shadow-xl transition-all z-10 -translate-y-full left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                                {day.hours}h ({day.utilization}%)
                                                            </div>
                                                        </div>
                                                        <span className="text-label-small text-muted-foreground/50 w-full text-center uppercase tracking-tighter">{day.day}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex-1 h-full flex items-center justify-center text-muted-foreground/60 font-medium italic text-xs">
                                                    {hasMounted ? "No productivity data available for this week." : "..."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </RoundedCard>
                        </div>
                    </div>

                    {/* Right Sidebar - Analytics & Calendar */}
                    <div className="xl:col-span-3 space-y-8">

                        {/* Calendar Widget */}
                        <RoundedCard className="bg-card">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-foreground">Calendar</h4>
                                <div className="flex items-center gap-2 text-muted-foreground/80 bg-muted rounded-lg px-2 py-1">
                                    <Calendar size={14} />
                                    <span className="text-xs font-bold">{hasMounted ? format(currentTime, "MMMM") : "Month"}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tighter mb-4">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center">
                                {hasMounted && (() => {
                                    const start = new Date(currentTime);
                                    const day = start.getDay();
                                    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                                    const monday = new Date(start.setDate(diff));

                                    return Array.from({ length: 7 }).map((_, i) => {
                                        const d = new Date(monday);
                                        d.setDate(monday.getDate() + i);
                                        const isToday = d.toDateString() === currentTime.toDateString();
                                        const isSelected = d.toDateString() === selectedCalendarDate.toDateString();

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedCalendarDate(d)}
                                                className={cn(
                                                    "h-8 flex flex-col items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-muted",
                                                    isSelected ? "bg-primary text-white shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background" :
                                                        isToday ? "border-2 border-primary/30 text-primary" : "text-foreground/80"
                                                )}
                                            >
                                                <span>{d.getDate()}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </RoundedCard>

                        {/* Project Summary Gauge Card */}
                        <RoundedCard>
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-title-medium text-foreground">Project Summary</h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground/40">
                                    <Info size={14} />
                                </Button>
                            </div>
                            <span className="text-label-small text-muted-foreground/60 block mb-4">Last update 1 day ago</span>

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
                                                {hasMounted && (
                                                    <>
                                                        {/* To do */}
                                                        <path
                                                            d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="oklch(0.6368 0.2078 25.3313)" strokeWidth="10"
                                                            strokeDasharray={`${lTodo} ${circumference}`} strokeDashoffset="0"
                                                            className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[12] hover:opacity-80"
                                                        >
                                                            <title>To do: {pTodo}%</title>
                                                        </path>
                                                        {/* Review */}
                                                        <path
                                                            d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="oklch(0.7859 0.1342 83.6986)" strokeWidth="10"
                                                            strokeDasharray={`${lReview} ${circumference}`} strokeDashoffset={-lTodo}
                                                            className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[12] hover:opacity-80"
                                                        >
                                                            <title>In Review: {pReview}%</title>
                                                        </path>
                                                        {/* Progress */}
                                                        <path
                                                            d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="oklch(0.6420 0.1691 38.5815)" strokeWidth="10"
                                                            strokeDasharray={`${lProgress} ${circumference}`} strokeDashoffset={-(lTodo + lReview)}
                                                            className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[12] hover:opacity-80"
                                                        >
                                                            <title>On Progress: {pProgress}%</title>
                                                        </path>
                                                        {/* Done */}
                                                        <path
                                                            d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="oklch(0.4227 0.0732 267.3899)" strokeWidth="10"
                                                            strokeDasharray={`${lDone} ${circumference}`} strokeDashoffset={-(lTodo + lReview + lProgress)}
                                                            className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[12] hover:opacity-80"
                                                        >
                                                            <title>Completed: {pDone}%</title>
                                                        </path>

                                                        {/* Overlay rounded cap background to hide seams at ends only */}
                                                        <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#FFFFFF" strokeWidth="10.5" strokeDasharray="1.5 500" strokeDashoffset="0.5" />
                                                        <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#FFFFFF" strokeWidth="10.5" strokeDasharray="1.5 500" strokeDashoffset={-circumference + 1} />
                                                    </>
                                                )}
                                            </>
                                        );
                                    })()}
                                </svg>
                                <div className="absolute bottom-9 flex flex-col items-center">
                                    <span className="text-[25px] font-bold text-foreground leading-none">{hasMounted ? (summary?.total || 0) : 0}</span>
                                    <span className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mt-2">Total Task</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-1 border-t border-border pt-3 px-2">
                                {hasMounted && [
                                    { l: "To do", v: `${summary?.percentages?.todo || 0}%`, c: "bg-destructive", sub: `TOTAL - ${summary?.counts?.todo || 0}` },
                                    { l: "In Review", v: `${summary?.percentages?.review || 0}%`, c: "bg-chart-4", sub: `TOTAL - ${summary?.counts?.review || 0}` },
                                    { l: "On Progress", v: `${summary?.percentages?.progress || 0}%`, c: "bg-primary", sub: `TOTAL - ${summary?.counts?.["in-progress"] || 0}` },
                                    { l: "Completed", v: `${summary?.percentages?.done || 0}%`, c: "bg-chart-5", sub: `TOTAL - ${summary?.counts?.done || 0}` }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-xl transition-all"
                                        onClick={() => router.push('/my-tasks')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-110 transition-transform", item.c)} />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[12px] font-bold text-foreground group-hover:text-primary transition-colors leading-none">{item.l}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none">{item.sub}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-bold text-foreground tracking-tight">{item.v}</span>
                                            <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                        </div>
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
