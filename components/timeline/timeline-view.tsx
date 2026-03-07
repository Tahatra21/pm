"use client";

import { Task } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { addDays, startOfWeek, format, differenceInDays, parseISO, isToday, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
    todo: "#6b7280", "in-progress": "#3b82f6", review: "#f59e0b", done: "#10b981",
};
const STATUS_LABELS: Record<string, string> = {
    todo: "To Do", "in-progress": "In Progress", review: "Review", done: "Done",
};

interface TimelineViewProps { tasks: Task[]; }

export default function TimelineView({ tasks }: TimelineViewProps) {
    const [startDate, setStartDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [zoomDays, setZoomDays] = useState(28);

    const DAY_WIDTH = 36;
    const dates = Array.from({ length: zoomDays }, (_, i) => addDays(startDate, i));
    const timelineTasks = tasks.filter((t) => t.startDate || t.dueDate);

    const goBack = () => setStartDate((d) => addDays(d, -7));
    const goForward = () => setStartDate((d) => addDays(d, 7));
    const goToday = () => setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const getTaskBar = (task: Task) => {
        const start = task.startDate ? parseISO(task.startDate) : task.dueDate ? parseISO(task.dueDate) : null;
        const end = task.dueDate ? parseISO(task.dueDate) : start;
        if (!start || !end) return null;
        const startOff = differenceInDays(startOfDay(start), startOfDay(startDate));
        const endOff = differenceInDays(startOfDay(end), startOfDay(startDate));
        if (endOff < 0 || startOff >= zoomDays) return null;
        const clampedStart = Math.max(startOff, 0);
        const clampedEnd = Math.min(endOff, zoomDays - 1);
        const clampedDuration = clampedEnd - clampedStart + 1;
        return { leftOffset: clampedStart * DAY_WIDTH, width: clampedDuration * DAY_WIDTH - 4, color: STATUS_COLORS[task.status] };
    };

    const monthGroups: { label: string; span: number }[] = [];
    dates.forEach((d) => {
        const label = format(d, "MMMM yyyy", { locale: id });
        const last = monthGroups[monthGroups.length - 1];
        if (last && last.label === label) last.span++;
        else monthGroups.push({ label, span: 1 });
    });

    const todayOffset = differenceInDays(startOfDay(new Date()), startOfDay(startDate));
    const showTodayLine = todayOffset >= 0 && todayOffset < zoomDays;

    return (
        <div className="flex flex-col h-full">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goBack}><ChevronLeft size={14} /></Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>Hari ini</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goForward}><ChevronRight size={14} /></Button>
                </div>
                <div className="flex items-center bg-muted rounded-lg p-0.5">
                    {[14, 28, 42].map((d) => (
                        <Button
                            key={d}
                            variant={zoomDays === d ? "secondary" : "ghost"}
                            size="sm"
                            className={cn("h-7 text-xs", zoomDays !== d && "text-muted-foreground")}
                            onClick={() => setZoomDays(d)}
                        >
                            {d === 14 ? "2 minggu" : d === 28 ? "4 minggu" : "6 minggu"}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-auto rounded-lg border bg-card">
                <div style={{ minWidth: `${220 + zoomDays * DAY_WIDTH}px` }}>
                    {/* Month header */}
                    <div className="flex border-b" style={{ marginLeft: "220px" }}>
                        {monthGroups.map((mg, i) => (
                            <div key={i} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2 text-center" style={{ width: `${mg.span * DAY_WIDTH}px`, flexShrink: 0 }}>
                                {mg.label}
                            </div>
                        ))}
                    </div>

                    {/* Day header */}
                    <div className="flex border-b" style={{ marginLeft: "220px" }}>
                        {dates.map((d, i) => {
                            const today = isToday(d);
                            return (
                                <div key={i} className={cn("text-center py-1.5 flex-shrink-0", today ? "text-primary font-bold" : "text-muted-foreground")} style={{ width: `${DAY_WIDTH}px`, fontSize: "10px" }}>
                                    <div>{format(d, "EEE", { locale: id }).slice(0, 2)}</div>
                                    <div className={cn("text-[10px] mt-0.5", today && "w-5 h-5 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center")}>
                                        {format(d, "d")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Task rows */}
                    <div className="relative">
                        {timelineTasks.map((task) => {
                            const bar = getTaskBar(task);
                            const assignee = task.assigneeId ? mockUsers.find((u) => u.id === task.assigneeId) : null;
                            return (
                                <div key={task.id} className="flex items-center border-b hover:bg-accent/30 transition-colors" style={{ height: "44px" }}>
                                    <div className="flex items-center gap-2 px-3 flex-shrink-0 h-full border-r" style={{ width: "220px" }}>
                                        {assignee && (
                                            <Avatar className="h-5 w-5 flex-shrink-0">
                                                <AvatarFallback className="text-[8px] text-white font-bold" style={{ backgroundColor: assignee.color }}>
                                                    {getInitials(assignee.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <span className="text-xs text-muted-foreground truncate" title={task.title}>{task.title}</span>
                                    </div>
                                    <div className="relative h-full" style={{ width: `${zoomDays * DAY_WIDTH}px`, flexShrink: 0 }}>
                                        {showTodayLine && (
                                            <div className="absolute top-0 bottom-0 w-px bg-destructive z-10 opacity-50" style={{ left: `${todayOffset * DAY_WIDTH + DAY_WIDTH / 2}px` }} />
                                        )}
                                        {bar && (
                                            <div className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center px-2 cursor-pointer hover:brightness-110 transition-all" style={{ left: `${bar.leftOffset + 2}px`, width: `${bar.width}px`, backgroundColor: bar.color, opacity: task.status === "done" ? 0.6 : 1 }} title={`${task.title} — ${STATUS_LABELS[task.status]}`}>
                                                <span className="text-white text-[10px] font-medium truncate">{bar.width > 60 ? task.title : ""}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {timelineTasks.length === 0 && (
                            <div className="py-12 text-center text-sm text-muted-foreground">Tidak ada tugas dengan tanggal mulai/tenggat.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-3 mt-2 flex-wrap">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] }} />
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <span className="w-px h-3 bg-destructive" />
                    <span className="text-[10px] text-muted-foreground">Hari ini</span>
                </div>
            </div>
        </div>
    );
}
