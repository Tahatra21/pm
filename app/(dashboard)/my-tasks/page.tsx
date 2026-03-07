"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { formatDate, isOverdue } from "@/lib/utils";
import { Calendar, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    todo: { label: "To Do", variant: "outline" },
    "in-progress": { label: "In Progress", variant: "default" },
    review: { label: "Review", variant: "secondary" },
    done: { label: "Done", variant: "outline" },
};
const PRIORITY_COLOR: Record<string, string> = { low: "#6b7280", medium: "#eab308", high: "#f97316", urgent: "#ef4444" };

export default function MyTasksPage() {
    const { user } = useAuth();
    const [filter, setFilter] = useState("all");
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/tasks").then(r => r.json()).then(data => { if (Array.isArray(data)) setAllTasks(data); }).catch(() => {});
        fetch("/api/projects").then(r => r.json()).then(data => { if (Array.isArray(data)) setProjects(data); }).catch(() => {});
    }, []);

    const myTasks = allTasks.filter((t) => t.assigneeId === user?.id);
    const pending = myTasks.filter((t) => t.status !== "done");
    const done = myTasks.filter((t) => t.status === "done");

    const displayTasks = myTasks.filter((t) => {
        if (filter === "incomplete") return t.status !== "done";
        if (filter === "completed") return t.status === "done";
        return true;
    });

    const stats = [
        { label: "Total", value: myTasks.length, icon: Clock, color: "text-primary" },
        { label: "Dikerjakan", value: pending.length, icon: AlertTriangle, color: "text-amber-500" },
        { label: "Selesai", value: done.length, icon: CheckCircle2, color: "text-emerald-500" },
    ];

    const handleMarkDone = async (taskId: string) => {
        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "done" }),
        });
        if (res.ok) {
            setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "done" } : t));
            setSelectedTask((prev: any) => prev ? { ...prev, status: "done" } : null);
            window.dispatchEvent(new CustomEvent("refresh-projects"));
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Tugas Saya" }]} />
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <Card key={label} className="border-0 shadow-sm rounded-2xl bg-white transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3.5 rounded-xl bg-slate-50"><Icon size={24} className={color} /></div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
                                    <p className={`text-3xl font-extrabold mt-1 tracking-tight mono ${color}`}>{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tasks table */}
                <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="pb-4 pt-6 px-6 flex-row items-center justify-between">
                        <CardTitle className="text-sm">Semua Tugas Saya</CardTitle>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Semua Tugas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tugas</SelectItem>
                                <SelectItem value="incomplete">Incomplete</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs w-1"></TableHead>
                                <TableHead className="text-xs">Tugas</TableHead>
                                <TableHead className="text-xs">Proyek</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Tenggat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayTasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <CheckCircle2 className="mx-auto mb-2 text-muted-foreground" size={28} />
                                        <p className="text-sm text-muted-foreground">Tidak ada tugas yang sesuai</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayTasks.map((task) => {
                                    const project = projects.find((p: any) => p.id === task.projectId);
                                    const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";
                                    return (
                                        <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTask(task)}>
                                            <TableCell className="w-1 pr-0">
                                                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }} />
                                            </TableCell>
                                            <TableCell>
                                                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                                                {task.tags && task.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {(typeof task.tags === "string" ? JSON.parse(task.tags) : task.tags).slice(0, 2).map((tag: string) => (
                                                            <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0 h-3.5 font-normal">#{tag}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {project && (
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                                        {project.title}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={STATUS_MAP[task.status]?.variant || "outline"} className="text-[11px]">
                                                    {STATUS_MAP[task.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {task.dueDate && (
                                                    <span className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                                        <Calendar size={11} /> {formatDate(task.dueDate)}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Task Detail Sheet */}
            <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <SheetContent className="w-[400px] sm:w-[500px]">
                    <SheetHeader>
                        <SheetTitle>Task Detail</SheetTitle>
                        <SheetDescription>Detail dan status tugas ini.</SheetDescription>
                    </SheetHeader>
                    {selectedTask && (
                        <div className="py-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900">{selectedTask.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {selectedTask.description || "Tidak ada deskripsi rinci untuk tugas ini."}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <span className="text-muted-foreground block mb-1.5 text-xs font-semibold uppercase tracking-widest">Status</span>
                                    <Badge variant={STATUS_MAP[selectedTask.status]?.variant || "outline"}>
                                        {STATUS_MAP[selectedTask.status]?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1.5 text-xs font-semibold uppercase tracking-widest">Tenggat Waktu</span>
                                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                                        <Calendar size={13} className="text-slate-400" />
                                        {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : "-"}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-4 mt-8 flex flex-col gap-3">
                                <Button
                                    className="w-full h-11"
                                    variant={selectedTask.status === "done" ? "secondary" : "default"}
                                    disabled={selectedTask.status === "done"}
                                    onClick={() => handleMarkDone(selectedTask.id)}
                                >
                                    <CheckCircle2 size={16} className="mr-2" />
                                    {selectedTask.status === "done" ? "Tugas Sudah Selesai" : "Selesai (Mark complete)"}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
