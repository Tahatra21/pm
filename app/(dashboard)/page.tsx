"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getInitials, isOverdue, calculateProgress } from "@/lib/utils";
import { CheckCircle2, Activity, TrendingUp, AlertTriangle, ArrowRight, Calendar, Users, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    todo: { label: "To Do", variant: "outline" },
    "in-progress": { label: "In Progress", variant: "default" },
    review: { label: "Review", variant: "secondary" },
    done: { label: "Done", variant: "outline" },
};

const PRIORITY_COLOR: Record<string, string> = {
    urgent: "#ef4444", high: "#f97316", medium: "#eab308", low: "#6b7280",
};

const RoundedCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-[28px] border border-slate-200/70 shadow-[0_2px_12px_rgb(0,0,0,0.015)] overflow-hidden ${className}`}>
        {children}
    </div>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    
    // View States
    const [greeting, setGreeting] = useState("Selamat datang");
    const [taskOpen, setTaskOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskError, setTaskError] = useState("");

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) {
            setTaskError("Title is required");
            return;
        }
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: taskTitle,
                    projectId: null,
                    priority: "medium",
                    status: "todo",
                }),
            });
            if (!res.ok) throw new Error("Failed to create task");
            setTaskOpen(false);
            setTaskTitle("");
            setTaskError("");
            window.location.reload(); 
        } catch (error: any) {
            setTaskError(error.message);
        }
    };

    useEffect(() => {
        const hour = new Date().getHours();
        setGreeting(hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam");

        fetch("/api/tasks").then(r => r.json()).then(data => { if (Array.isArray(data)) setAllTasks(data); }).catch(() => {});
        fetch("/api/projects").then(r => r.json()).then(data => { if (Array.isArray(data)) setProjects(data); }).catch(() => {});
        fetch("/api/users").then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data); }).catch(() => {});
    }, []);

    const myTasks = allTasks.filter((t) => t.assigneeId === user?.id);
    const inProgress = allTasks.filter((t) => t.status === "in-progress");
    const done = allTasks.filter((t) => t.status === "done");
    const overdue = allTasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && t.status !== "done");
    const pendingMyTasks = myTasks.filter((t) => t.status !== "done").slice(0, 6);
    const complRate = calculateProgress(allTasks);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#F8F9FA] dark:bg-background">
            <Header breadcrumb={[{ label: "Dashboard" }]} />

            <div className="flex-1 overflow-y-auto w-full p-4 lg:p-8">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {greeting}, {user?.name?.split(" ")[0] || "User"}.
                        </h1>
                        <div className="flex items-center gap-3">
                             <div className="hidden sm:flex items-center px-4 py-2 bg-card rounded-full border border-border/40 shadow-sm text-sm text-muted-foreground gap-2 font-medium">
                                <Calendar size={14} />
                                <span>Bulan ini</span>
                             </div>
                             
                             <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                                 <DialogTrigger asChild>
                                     <Button className="rounded-full px-6 shadow-sm font-bold">Buat Tugas</Button>
                                 </DialogTrigger>
                                 <DialogContent>
                                     <DialogHeader>
                                         <DialogTitle>Tugas Baru / Create Task</DialogTitle>
                                     </DialogHeader>
                                     <form onSubmit={handleCreateTask} className="space-y-4 py-4">
                                         {taskError && (
                                             <div className="p-2 text-sm text-destructive bg-destructive/10 rounded-md">
                                                 {taskError}
                                             </div>
                                         )}
                                         <div className="space-y-2">
                                             <Label htmlFor="title">Title / Judul Tugas <span className="text-destructive">*</span></Label>
                                             <Input
                                                 id="title"
                                                 placeholder="Apa yang perlu diselesaikan?"
                                                 value={taskTitle}
                                                 onChange={(e) => setTaskTitle(e.target.value)}
                                                 autoFocus
                                             />
                                         </div>
                                         <DialogFooter>
                                             <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
                                             <Button type="submit">Create</Button>
                                         </DialogFooter>
                                     </form>
                                 </DialogContent>
                             </Dialog>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN */}
                        <div className="xl:col-span-8 flex flex-col gap-6">
                            
                            {/* OVERVIEW SECTION */}
                            <div className="space-y-3">
                                <h2 className="text-[16px] font-bold text-slate-800 tracking-tight ml-1">Overview</h2>
                                <RoundedCard className="p-5">
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-0">
                                        
                                        {/* Stat 1: Tugas Saya */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 text-slate-500 font-semibold text-[13px]">
                                                <CheckCircle2 size={16} className="text-slate-600" />
                                                Tugas Aktiv
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[64px] font-black tracking-[-0.04em] text-slate-900 leading-[0.85]">{myTasks.length}</span>
                                                <Badge variant="secondary" className="bg-red-50 text-red-500 border-0 flex gap-1 items-center px-2 py-0.5 rounded-full text-[10px] font-bold h-6">
                                                    <TrendingUp size={11} className="rotate-180" /> {overdue.length} overdue
                                                </Badge>
                                            </div>
                                            <p className="text-[12px] font-medium text-slate-400 mt-2">
                                                Dari total tugas yang ditugaskan ke Anda
                                            </p>
                                        </div>

                                        {/* Stat 2: Selesai */}
                                        <div className="flex-1 flex flex-col md:pl-8 md:border-l md:border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 font-semibold text-[13px]">
                                                <Activity size={16} className="text-slate-600" />
                                                Tugas Selesai
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[64px] font-black tracking-[-0.04em] text-slate-900 leading-[0.85]">{done.length}</span>
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-0 flex gap-1 items-center px-2 py-0.5 rounded-full text-[10px] font-bold h-6">
                                                    <TrendingUp size={11} /> {complRate}%
                                                </Badge>
                                            </div>
                                            <p className="text-[12px] font-medium text-slate-400 mt-2">
                                                Kecepatan penyelesaian tim (Team Velocity)
                                            </p>
                                        </div>

                                    </div>

                                    {/* Sub-section: Team Avatars */}
                                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[13px] font-bold text-slate-800">
                                                Kolaborator aktif di proyek Anda
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-2.5">
                                                    {users.slice(0, 5).map((u: any) => (
                                                        <Avatar key={u.id} className="h-10 w-10 ring-2 ring-white">
                                                            <AvatarFallback className="text-[11px] text-white font-bold" style={{ backgroundColor: u.color }}>
                                                                {getInitials(u.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-300" asChild>
                                                    <Link href="/projects"><ArrowRight size={16} /></Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </RoundedCard>
                            </div>

                            {/* TASKS LIST SECTION */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">Tugas Aktif Saya</h2>
                                    <Button variant="ghost" size="sm" className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 rounded-full h-8" asChild>
                                        <Link href="/my-tasks">Lihat semua <ArrowRight size={14} className="ml-1" /></Link>
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {pendingMyTasks.length === 0 ? (
                                        <RoundedCard className="p-12 text-center text-sm font-medium text-slate-400">Tidak ada tugas aktif 🎉</RoundedCard>
                                    ) : (
                                        pendingMyTasks.map((task, i) => {
                                            const proj = projects.find((p) => p.id === task.projectId);
                                            return (
                                                <RoundedCard key={task.id} className="p-5 flex items-center justify-between group cursor-pointer hover:border-slate-300 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }} />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="text-[14px] font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{task.title}</p>
                                                            {proj && (
                                                                <span className="text-[12px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.color }} />
                                                                    {proj.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-5">
                                                        {task.dueDate && (
                                                            <span className="hidden sm:flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-xl bg-slate-100/80 text-slate-600 font-semibold border border-transparent">
                                                                <Calendar size={13} className="text-slate-400" />
                                                                {formatDate(task.dueDate)}
                                                            </span>
                                                        )}
                                                        <Badge variant="outline" className="text-[11px] font-bold px-3 py-1 rounded-full border-slate-200 text-slate-700 shadow-none uppercase tracking-tight h-7 flex items-center justify-center">
                                                            {STATUS_MAP[task.status]?.label}
                                                        </Badge>
                                                    </div>
                                                </RoundedCard>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="xl:col-span-4 flex flex-col gap-6">
                            
                            {/* PROJECTS SECTION */}
                            <div className="space-y-3">
                                <h2 className="text-[16px] font-bold text-slate-800 tracking-tight ml-1">Progres Proyek</h2>
                                <RoundedCard className="p-5">
                                    {projects.length === 0 ? (
                                        <div className="p-8 text-center text-sm font-medium text-slate-400">Belum ada proyek</div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {projects.slice(0, 4).map((proj) => {
                                                const pct = proj.progress ?? 0;
                                                return (
                                                    <Link key={proj.id} href={`/board/${proj.id}`} className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-white text-[13px] font-black" style={{ backgroundColor: proj.color }}>
                                                                {getInitials(proj.title).substring(0, 2)}
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[14px] font-bold text-slate-800 group-hover:text-primary transition-colors">{proj.title}</span>
                                                                <span className="text-[11px] font-semibold text-slate-500 flex gap-1.5 items-center">
                                                                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-1">
                                                            <span className="text-[15px] font-black text-slate-800">{pct}%</span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="mt-6 pt-5 border-t border-slate-100">
                                        <Button variant="outline" className="w-full text-[13px] font-bold text-slate-600 hover:text-slate-800 rounded-full h-10 border-slate-200" asChild>
                                            <Link href="/projects">Semua Proyek</Link>
                                        </Button>
                                    </div>
                                </RoundedCard>
                            </div>

                            {/* TEAM WORKLOAD */}
                            <div className="space-y-3">
                                <h2 className="text-[16px] font-bold text-slate-800 tracking-tight ml-1">Beban Kerja Tim</h2>
                                <RoundedCard className="p-5">
                                    <div className="flex flex-col gap-6">
                                        {users.slice(0, 4).map((u: any) => {
                                            const ut = allTasks.filter((t) => t.assigneeId === u.id);
                                            const total = ut.length;
                                            const pct = calculateProgress(ut);
                                            return (
                                                <div key={u.id} className="flex gap-4">
                                                    <Avatar className="h-[42px] w-[42px] mt-0.5 ring-1 ring-slate-200">
                                                        <AvatarFallback className="text-[12px] text-white font-bold" style={{ backgroundColor: u.color }}>
                                                            {getInitials(u.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[14px] font-bold text-slate-800">
                                                                {u.name} 
                                                            </p>
                                                            <span className={`text-[12px] font-black ${pct >= 80 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-slate-500"}`}>
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                        <Progress value={pct} className="h-1.5 bg-slate-100 rounded-full" />
                                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                                            Menangani {total} tugas aktif
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </RoundedCard>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
