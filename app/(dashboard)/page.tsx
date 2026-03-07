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

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                    {stats.map(({ label, value, sub, icon: Icon, color }) => (
                        <Card key={label} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
                                    <div className="p-3 rounded-xl bg-slate-50">
                                        <Icon size={20} className={color} />
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold tracking-tight text-slate-900 mono">{value}</p>
                                <p className="text-[13px] font-medium text-slate-500 mt-2">{sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Two column */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* My Tasks */}
                    <Card className="lg:col-span-3 border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="flex-row items-center justify-between pb-4 pt-6 px-6">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm">Tugas Aktif Saya</CardTitle>
                                <Badge variant="secondary" className="text-[10px] font-mono">{pendingMyTasks.length}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" asChild>
                                <Link href="/my-tasks">Lihat semua <ArrowRight size={12} /></Link>
                            </Button>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Tugas</TableHead>
                                    <TableHead className="text-xs">Proyek</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="text-xs">Tenggat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingMyTasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                            Tidak ada tugas aktif 🎉
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingMyTasks.map((task) => {
                                        const proj = projects.find((p) => p.id === task.projectId);
                                        const late = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";
                                        return (
                                            <TableRow key={task.id} className="cursor-pointer">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }} />
                                                        <span className="text-sm truncate max-w-[240px]">{task.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {proj && (
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                                                            {proj.title}
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
                                                        <span className={`flex items-center gap-1 text-xs ${late ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                                            <Calendar size={11} />
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
                    </Card>

                    {/* Projects */}
                    <Card className="lg:col-span-2 border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="flex-row items-center justify-between pb-4 pt-6 px-6">
                            <div className="flex items-center gap-2">
                                <BarChart2 size={14} className="text-muted-foreground" />
                                <CardTitle className="text-sm">Progres Proyek</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" asChild>
                                <Link href="/projects">Semua <ArrowRight size={12} /></Link>
                            </Button>
                        </CardHeader>
                        <div className="divide-y">
                            {projects.map((proj) => {
                                const pct = proj.progress ?? 0;
                                const members = users.filter((u: any) => proj.members?.includes(u.id));
                                return (
                                    <Link key={proj.id} href={`/board/${proj.id}`} className="block px-6 py-3.5 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full ring-1 ring-background" style={{ backgroundColor: proj.color }} />
                                                <span className="text-sm font-medium">{proj.title}</span>
                                            </div>
                                            <span className="text-sm font-semibold mono" style={{ color: proj.color }}>{pct}%</span>
                                        </div>
                                        <Progress value={pct} className="h-1.5 mb-2.5" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">{proj.completedCount}/{proj.taskCount} tugas</span>
                                            <div className="flex -space-x-1.5">
                                                {members.slice(0, 3).map((u: any) => (
                                                    <Avatar key={u.id} className="h-5 w-5 ring-2 ring-card">
                                                        <AvatarFallback className="text-[8px] text-white font-semibold" style={{ backgroundColor: u.color }}>
                                                            {getInitials(u.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {members.length > 3 && (
                                                    <Avatar className="h-5 w-5 ring-2 ring-card">
                                                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-semibold">
                                                            +{members.length - 3}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Team Workload */}
                <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="flex-row items-center gap-2 pb-4 pt-6 px-6">
                        <Clock size={14} className="text-muted-foreground" />
                        <CardTitle className="text-sm">Beban Kerja Tim</CardTitle>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Anggota</TableHead>
                                <TableHead className="text-xs">Total</TableHead>
                                <TableHead className="text-xs">Progress</TableHead>
                                <TableHead className="text-xs text-right">Selesai</TableHead>
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
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarFallback className="text-[10px] text-white font-semibold" style={{ backgroundColor: u.color }}>
                                                        {getInitials(u.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{u.name}</p>
                                                    <p className="text-[11px] text-muted-foreground capitalize">{u.role}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground mono">{total} tugas</span>
                                        </TableCell>
                                        <TableCell className="w-52">
                                            <Progress value={pct} className="h-1.5 mb-1" />
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-emerald-500">{doneN} selesai</span>
                                                <span className="text-muted-foreground">·</span>
                                                <span className="text-chart-1">{inPrN} aktif</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`text-sm font-semibold mono ${pct >= 80 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-muted-foreground"}`}>
                                                {pct}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
