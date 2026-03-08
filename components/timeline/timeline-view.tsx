import { Task } from "@/lib/types";
import { getInitials, STATUS_WEIGHTS, formatDateShort } from "@/lib/utils";
import { addDays, startOfWeek, format, differenceInDays, parseISO, isToday, startOfDay, addWeeks, addMonths, addYears, startOfMonth, startOfYear, isSameDay, getWeek, getQuarter } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays as CalendarIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STATUS_COLORS: Record<string, string> = {
    todo: "#6b7280", "in-progress": "#3b82f6", review: "#f59e0b", done: "#10b981",
};
const STATUS_LABELS: Record<string, string> = {
    todo: "To Do", "in-progress": "In Progress", review: "Review", done: "Done",
};

type ZoomLevel = "day" | "week" | "month" | "year";

interface TimelineViewProps { tasks: Task[]; }

export default function TimelineView({ tasks }: TimelineViewProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [zoom, setZoom] = useState<ZoomLevel>("day");
    const [startDate, setStartDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

    useEffect(() => {
        fetch("/api/users")
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setUsers(data); })
            .catch(() => {});
    }, []);

    const zoomConfig = useMemo(() => {
        switch (zoom) {
            case "day": return { dayWidth: 40, totalUnits: 30, unit: "day" as const };
            case "week": return { dayWidth: 10, totalUnits: 16, unit: "week" as const };
            case "month": return { dayWidth: 6, totalUnits: 12, unit: "week" as const }; // Operational: Month > Week
            case "year": return { dayWidth: 2, totalUnits: 52, unit: "week" as const }; // Strategic: Year > Quarter > Week groups
            default: return { dayWidth: 40, totalUnits: 30, unit: "day" as const };
        }
    }, [zoom]);

    const { dayWidth, totalUnits, unit } = zoomConfig;

    const displayGrid = useMemo(() => {
        const items = [];
        let curr = startDate;
        for (let i = 0; i < totalUnits; i++) {
            items.push(curr);
            if (unit === "day") curr = addDays(curr, 1);
            else if (unit === "week") curr = addWeeks(curr, 1);
        }
        return items;
    }, [startDate, totalUnits, unit]);

    const endDate = useMemo(() => {
        const last = displayGrid[displayGrid.length - 1];
        if (unit === "day") return addDays(last, 1);
        return addWeeks(last, 1);
    }, [displayGrid, unit]);

    const totalDays = differenceInDays(endDate, startDate);
    const totalWidth = totalDays * dayWidth;

    const goBack = () => {
        if (zoom === "day") setStartDate(d => addDays(d, -7));
        else if (zoom === "week" || zoom === "month") setStartDate(d => addWeeks(d, -4));
        else setStartDate(d => addYears(d, -1));
    };
    const goForward = () => {
        if (zoom === "day") setStartDate(d => addDays(d, 7));
        else if (zoom === "week" || zoom === "month") setStartDate(d => addWeeks(d, 4));
        else setStartDate(d => addYears(d, 1));
    };
    const goToday = () => {
        if (zoom === "day" || zoom === "week" || zoom === "month") setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
        else setStartDate(startOfYear(new Date()));
    };

    const getTaskBar = (task: Task) => {
        const start = task.startDate ? parseISO(task.startDate) : task.dueDate ? parseISO(task.dueDate) : null;
        let end = task.dueDate ? parseISO(task.dueDate) : start;
        if (!start || !end) return null;
        if (isSameDay(start, end)) end = addDays(end, 1);

        const startOff = differenceInDays(startOfDay(start), startOfDay(startDate));
        const endOff = differenceInDays(startOfDay(end), startOfDay(startDate));

        if (endOff < 0 || startOff >= totalDays) return null;

        const clampedStart = Math.max(startOff, 0);
        const clampedEnd = Math.min(endOff, totalDays);
        const duration = clampedEnd - clampedStart;

        return { 
            left: clampedStart * dayWidth, 
            width: Math.max(duration * dayWidth, 4), 
            color: STATUS_COLORS[task.status] 
        };
    };

    const timelineTasks = tasks.filter((t) => t.startDate || t.dueDate);

    // Compute dynamic headers
    const headerLevels = useMemo(() => {
        const levels: { label: string; width: number; isNewGroup: boolean }[][] = [[], [], []];
        
        displayGrid.forEach((date, i) => {
            const width = (unit === "day" ? 1 : 7) * dayWidth;
            const prevDate = i > 0 ? displayGrid[i - 1] : null;
            
            if (zoom === "day") {
                levels[0].push({ label: format(date, "MMMM yyyy", { locale: id }), width, isNewGroup: i === 0 || date.getDate() === 1 });
                levels[1].push({ label: format(date, "EEE", { locale: id }).slice(0, 2), width, isNewGroup: true });
                levels[2].push({ label: format(date, "d"), width, isNewGroup: true });
            } else if (zoom === "week") {
                levels[0].push({ label: format(date, "MMMM yyyy", { locale: id }), width: width * 1, isNewGroup: i === 0 || date.getDate() <= 7 });
                levels[1].push({ label: `W${getWeek(date)}`, width, isNewGroup: true });
            } else if (zoom === "month") {
                const width = (unit === "day" ? 1 : 7) * dayWidth;
                levels[0].push({ label: format(date, "MMMM yyyy", { locale: id }), width, isNewGroup: i === 0 || date.getDate() <= 7 });
                levels[1].push({ label: `W${Math.ceil(date.getDate() / 7)}`, width, isNewGroup: true });
            } else if (zoom === "year") {
                const q = getQuarter(date);

                // Level 0: Year
                levels[0].push({ 
                    label: format(date, "yyyy"), 
                    width, 
                    isNewGroup: !prevDate || date.getFullYear() !== prevDate.getFullYear() 
                });
                
                // Level 1: Quarter
                levels[1].push({ 
                    label: `Q${q}`, 
                    width, 
                    isNewGroup: !prevDate || q !== getQuarter(prevDate) 
                });
                
                // Level 2: Month
                levels[2].push({ 
                    label: format(date, "MMM", { locale: id }), 
                    width, 
                    isNewGroup: !prevDate || date.getMonth() !== prevDate.getMonth() 
                });
            }
        });

        // Filter out consecutive identical labels to show only group starts
        return levels.map(level => {
            const filtered: typeof level = [];
            let currentGroupWidth = 0;
            let currentLabel = "";
            
            level.forEach((item, i) => {
                if (item.isNewGroup || (i > 0 && item.label !== level[i - 1].label)) {
                    if (filtered.length > 0) filtered[filtered.length - 1].width = currentGroupWidth;
                    filtered.push({ ...item });
                    currentGroupWidth = item.width;
                    currentLabel = item.label;
                } else {
                    currentGroupWidth += item.width;
                }
                if (i === level.length - 1 && filtered.length > 0) {
                    filtered[filtered.length - 1].width = currentGroupWidth;
                }
            });
            return filtered;
        });
    }, [displayGrid, zoom, unit, dayWidth]);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full">
                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={goBack}><ChevronLeft size={14} /></Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={goToday}>Hari ini</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={goForward}><ChevronRight size={14} /></Button>
                    </div>

                    <div className="flex items-center bg-muted/80 rounded-xl p-1 shadow-sm border border-border/50">
                        {(["day", "week", "month", "year"] as const).map((z) => (
                            <Button
                                key={z}
                                variant={zoom === z ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-8 px-4 text-[11px] font-bold transition-all rounded-lg",
                                    zoom === z ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => {
                                    setZoom(z);
                                    if (z === "day") setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
                                    else if (z === "week") setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
                                    else if (z === "month") setStartDate(startOfMonth(new Date()));
                                    else setStartDate(startOfYear(new Date()));
                                }}
                            >
                                {z === "day" ? "Harian" : z === "week" ? "Mingguan" : z === "month" ? "Bulanan" : "Tahunan"}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-auto rounded-2xl border border-border bg-card shadow-sm">
                    <div style={{ minWidth: `${240 + totalWidth}px` }}>
                        {/* Multi-level Headers */}
                        {headerLevels.map((level, lIndex) => level.length > 0 && (
                            <div key={lIndex} className={cn("flex border-b border-border sticky z-20", lIndex === 0 ? "bg-muted/80 top-0" : "bg-card", lIndex === 1 ? "top-[33px]" : lIndex === 2 ? "top-[66px]" : "")} style={{ paddingLeft: "240px" }}>
                                {level.map((item, i) => (
                                    <div key={i} className="border-r border-border/50 py-2 px-1 flex-shrink-0 text-center flex flex-col justify-center overflow-hidden" style={{ width: `${item.width}px` }}>
                                        <span className={cn(
                                            "truncate px-1",
                                            lIndex === 0 ? "text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest" : 
                                            lIndex === 1 ? "text-[9px] font-bold text-muted-foreground uppercase" : 
                                            "text-[10px] font-extrabold text-foreground/90"
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Task rows */}
                        <div className="relative divide-y divide-slate-100">
                            {timelineTasks.map((task) => {
                                const bar = getTaskBar(task);
                                const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
                                const progress = STATUS_WEIGHTS[task.status] || 0;

                                return (
                                    <div key={task.id} className="flex items-center group hover:bg-muted/50 transition-colors" style={{ height: "52px" }}>
                                        <div className="flex items-center gap-3 px-6 flex-shrink-0 h-full border-r border-border sticky left-0 z-10 bg-card group-hover:bg-muted/50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" style={{ width: "240px" }}>
                                            {assignee ? (
                                                <Avatar className="h-6 w-6 ring-2 ring-white shadow-sm flex-shrink-0">
                                                    <AvatarFallback className="text-[9px] text-primary-foreground font-black" style={{ backgroundColor: assignee.color }}>
                                                        {getInitials(assignee.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="w-6 h-6 rounded-lg bg-muted/80 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-[10px] text-muted-foreground/80 font-bold">?</span>
                                                </div>
                                            )}
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[12px] font-semibold text-foreground/90 truncate" title={task.title}>{task.title}</span>
                                                <span className="text-[10px] text-muted-foreground/80 font-medium capitalize">{STATUS_LABELS[task.status]}</span>
                                            </div>
                                        </div>
                                        <div className="relative h-full" style={{ width: `${totalWidth}px`, flexShrink: 0 }}>
                                            {/* Today line */}
                                            {zoom === "day" && (
                                                <div className="absolute top-0 bottom-0 w-px bg-primary/40 z-10" style={{ left: `${differenceInDays(new Date(), startDate) * dayWidth + dayWidth / 2}px` }} />
                                            )}
                                            {bar && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div 
                                                            className="absolute top-1/2 -translate-y-1/2 h-9 rounded-xl flex items-center px-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md border border-white/20 group/bar overflow-hidden" 
                                                            style={{ 
                                                                left: `${bar.left}px`, 
                                                                width: `${bar.width}px`, 
                                                                backgroundColor: bar.color, 
                                                                opacity: task.status === "done" ? 0.6 : 1 
                                                            }} 
                                                        >
                                                            {/* Progress highlight */}
                                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                                                                <div className="h-full bg-card/40" style={{ width: `${progress}%` }} />
                                                            </div>
                                                            <span className="text-primary-foreground text-[11px] font-bold truncate drop-shadow-sm pointer-events-none relative z-10">
                                                                {bar.width > 120 ? task.title : ""}
                                                            </span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" sideOffset={8} className="p-3 bg-card border border-border shadow-xl rounded-xl text-foreground min-w-[200px] z-50">
                                                        <div className="flex flex-col gap-2.5">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-[13px] font-bold text-foreground leading-tight">{task.title}</span>
                                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-primary-foreground shadow-sm" style={{ backgroundColor: bar.color }}>
                                                                    {STATUS_LABELS[task.status]}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden shadow-inner">
                                                                <div className="h-full rounded-full shadow-sm" style={{ width: `${progress}%`, backgroundColor: bar.color }} />
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                <span>Progress</span>
                                                                <span className="text-foreground">{progress}%</span>
                                                            </div>
                                                            <div className="pt-2 border-t border-border flex items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] text-muted-foreground/80 uppercase font-bold">Mulai</span>
                                                                    <span className="text-[10px] font-bold text-foreground/90">{task.startDate ? formatDateShort(task.startDate) : "-"}</span>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[8px] text-muted-foreground/80 uppercase font-bold">Tenggat</span>
                                                                    <span className="text-[10px] font-bold text-foreground/90">{task.dueDate ? formatDateShort(task.dueDate) : "-"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {timelineTasks.length === 0 && (
                                <div className="py-20 text-center flex flex-col items-center justify-center bg-muted/30">
                                    <CalendarIcon className="text-slate-200 mb-3" size={40} />
                                    <p className="text-sm font-bold text-muted-foreground/80">Tidak ada jadwal aktif</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Tambahkan tanggal mulai/tenggat pada tugas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Legend */}
                <div className="flex items-center justify-between mt-4 px-2">
                    <div className="flex items-center gap-6">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: STATUS_COLORS[key] }} />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/80/50 rounded-lg border border-border/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-bold text-foreground/80 uppercase tracking-widest leading-none">Sinkronisasi Aktif</span>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
