"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getInitials, isOverdue, calculateProgress } from "@/lib/utils";
import { CheckCircle2, Activity, TrendingUp, AlertTriangle, ArrowRight, Calendar, BarChart2, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    todo: { label: "To Do", variant: "outline" },
    "in-progress": { label: "In Progress", variant: "default" },
    review: { label: "Review", variant: "secondary" },
    done: { label: "Done", variant: "outline" },
};

const PRIORITY_COLOR: Record<string, string> = {
    urgent: "#ef4444", high: "#f97316", medium: "#eab308", low: "#6b7280",
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/tasks").then(r => r.json()).then(data => { if (Array.isArray(data)) setAllTasks(data); }).catch(() => {});
        fetch("/api/projects").then(r => r.json()).then(data => { if (Array.isArray(data)) setProjects(data); }).catch(() => {});
        fetch("/api/users").then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data); }).catch(() => {});
    }, []);

    const myTasks = allTasks.filter((t) => t.assigneeId === user?.id);
    const inProgress = allTasks.filter((t) => t.status === "in-progress");
    const done = allTasks.filter((t) => t.status === "done");
    const overdue = allTasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && t.status !== "done");
    const pendingMyTasks = myTasks.filter((t) => t.status !== "done").slice(0, 6);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";
    const complRate = calculateProgress(allTasks);

    const stats = [
        { label: "Tugas Saya", value: myTasks.length, sub: `${pendingMyTasks.length} aktif`, icon: CheckCircle2, color: "text-primary" },
        { label: "In Progress", value: inProgress.length, sub: "Sedang dikerjakan", icon: Activity, color: "text-chart-2" },
        { label: "Selesai", value: done.length, sub: `${complRate}% dari total`, icon: TrendingUp, color: "text-emerald-500" },
        { label: "Overdue", value: overdue.length, sub: "Lewat tenggat", icon: AlertTriangle, color: overdue.length > 0 ? "text-destructive" : "text-muted-foreground" },
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header breadcrumb={[{ label: "Dashboard" }]} />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10">
                    {/* Greeting */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {greeting}, {user?.name?.split(" ")[0] || "User"}.
                        </h1>
                        <p className="text-slate-500 text-base mt-2">
                            Ringkasan aktivitas dan progres proyek hari ini.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                        {stats.map(({ label, value, sub, icon: Icon, color }) => (
                            <Card key={label} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                        <div className="p-2.5 rounded-xl bg-slate-50">
                                            <Icon size={18} className={color} />
                                        </div>
                                    </div>
                                    <p className="text-4xl font-extrabold tracking-tight text-slate-900 mono">{value}</p>
                                    <p className="text-[13px] font-medium text-slate-500 mt-2">{sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* My Tasks */}
                        <Card className="xl:col-span-8 border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="flex-row items-center justify-between pb-4 pt-6 px-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-primary rounded-full mr-1" />
                                    <CardTitle className="text-base font-bold">Tugas Aktif Saya</CardTitle>
                                    <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5 rounded-full">{pendingMyTasks.length}</Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-slate-500 hover:text-primary transition-colors" asChild>
                                    <Link href="/my-tasks">Lihat semua <ArrowRight size={14} /></Link>
                                </Button>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Tugas</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Proyek</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Status</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Tenggat</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingMyTasks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                                                    Tidak ada tugas aktif 🎉
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pendingMyTasks.map((task) => {
                                                const proj = projects.find((p) => p.id === task.projectId);
                                                const late = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";
                                                return (
                                                    <TableRow key={task.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors border-slate-50">
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }} />
                                                                <span className="text-sm font-medium text-slate-700 truncate max-w-[280px]">{task.title}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            {proj && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                    <span className="w-2.5 h-2.5 rounded-full ring-1 ring-background" style={{ backgroundColor: proj.color }} />
                                                                    {proj.title}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            <Badge variant={STATUS_MAP[task.status]?.variant || "outline"} className="text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                                {STATUS_MAP[task.status]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            {task.dueDate && (
                                                                <span className={`flex items-center gap-1.5 text-xs ${late ? "text-destructive font-semibold" : "text-slate-400 font-medium"}`}>
                                                                    <Calendar size={13} />
                                                                    {formatDate(task.dueDate)}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {/* Projects Progress */}
                        <Card className="xl:col-span-4 border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="flex-row items-center justify-between pb-4 pt-6 px-6">
                                <div className="flex items-center gap-2">
                                    <BarChart2 size={16} className="text-slate-400" />
                                    <CardTitle className="text-base font-bold">Progres Proyek</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-slate-500 hover:text-primary transition-colors" asChild>
                                    <Link href="/projects">Semua <ArrowRight size={14} /></Link>
                                </Button>
                            </CardHeader>
                            <div className="divide-y divide-slate-50">
                                {projects.length === 0 ? (
                                    <div className="px-6 py-12 text-center text-sm text-slate-400">Belum ada proyek aktif</div>
                                ) : (
                                    projects.slice(0, 5).map((proj) => {
                                        const pct = proj.progress ?? 0;
                                        const members = users.filter((u: any) => proj.members?.includes(u.id));
                                        return (
                                            <Link key={proj.id} href={`/board/${proj.id}`} className="block px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: proj.color }} />
                                                        <span className="text-sm font-semibold text-slate-700">{proj.title}</span>
                                                    </div>
                                                    <span className="text-sm font-bold mono" style={{ color: proj.color }}>{pct}%</span>
                                                </div>
                                                <Progress value={pct} className="h-1.5 mb-3 bg-slate-100" />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-medium text-slate-400">{proj.completedCount}/{proj.taskCount} tugas</span>
                                                    <div className="flex -space-x-2">
                                                        {members.slice(0, 3).map((u: any) => (
                                                            <Avatar key={u.id} className="h-6 w-6 ring-2 ring-white shadow-sm">
                                                                <AvatarFallback className="text-[9px] text-white font-bold" style={{ backgroundColor: u.color }}>
                                                                    {getInitials(u.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {members.length > 3 && (
                                                            <Avatar className="h-6 w-6 ring-2 ring-white shadow-sm">
                                                                <AvatarFallback className="text-[9px] bg-slate-100 text-slate-500 font-bold">
                                                                    +{members.length - 3}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </Card>

                        {/* Team Workload */}
                        <Card className="xl:col-span-12 border-0 shadow-sm rounded-2xl overflow-hidden bg-white mt-2">
                            <CardHeader className="flex-row items-center gap-2 pb-4 pt-6 px-6">
                                <Clock size={16} className="text-slate-400" />
                                <CardTitle className="text-base font-bold">Beban Kerja Tim</CardTitle>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Anggota</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Total Tugas</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6">Progress</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 h-10 px-6 text-right">Efisiensi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((u: any) => {
                                            const ut = allTasks.filter((t) => t.assigneeId === u.id);
                                            const doneN = ut.filter((t) => t.status === "done").length;
                                            const inPrN = ut.filter((t) => t.status === "in-progress").length;
                                            const total = ut.length;
                                            const pct = calculateProgress(ut);
                                            return (
                                                <TableRow key={u.id} className="hover:bg-slate-50/30 border-slate-50">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 ring-1 ring-slate-100">
                                                                <AvatarFallback className="text-[11px] text-white font-bold" style={{ backgroundColor: u.color }}>
                                                                    {getInitials(u.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700">{u.name}</p>
                                                                <p className="text-[11px] text-slate-400 font-medium capitalize">{u.role}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-slate-600 mono">{total}</span>
                                                            <span className="text-[11px] text-slate-400 font-medium">tugas</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 w-[360px]">
                                                        <div className="space-y-1.5">
                                                            <Progress value={pct} className="h-1.5 bg-slate-100" />
                                                            <div className="flex gap-3 text-[10px] font-bold">
                                                                <span className="text-emerald-500 uppercase tracking-tighter">{doneN} SELESAI</span>
                                                                <span className="text-slate-300">|</span>
                                                                <span className="text-sky-500 uppercase tracking-tighter">{inPrN} AKTIF</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right">
                                                        <div className={`text-sm font-black mono ${pct >= 80 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-slate-400"}`}>
                                                            {pct}%
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
