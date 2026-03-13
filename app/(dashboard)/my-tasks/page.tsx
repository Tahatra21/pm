"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import { Calendar, Clock, CheckCircle2, AlertTriangle, ListFilter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import TaskListView from "@/components/board/task-list-view";
import { Task, Project, User } from "@/lib/types";

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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, pRes, uRes] = await Promise.all([
                    fetch("/api/tasks"),
                    fetch("/api/projects"),
                    fetch("/api/users")
                ]);
                if (tRes.ok) setAllTasks(await tRes.json());
                if (pRes.ok) setProjects(await pRes.json());
                if (uRes.ok) setUsers(await uRes.json());
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
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
        { label: "In Progress", value: pending.length, icon: AlertTriangle, color: "text-chart-4" },
        { label: "Completed", value: done.length, icon: CheckCircle2, color: "text-chart-5" },
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
            <Header breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "My Tasks" }]} />
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <Card key={label} className="border-0 shadow-sm rounded-2xl bg-card transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3.5 rounded-xl bg-muted"><Icon size={24} className={color} /></div>
                                <div>
                                    <p className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em]">{label}</p>
                                    <p className={`text-headline-medium font-medium mt-1 tracking-tight mono ${color}`}>{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tasks table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ListFilter size={18} className="text-muted-foreground" />
                            <h2 className="text-title-medium font-semibold text-foreground">My Task List</h2>
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[160px] h-9 text-label-medium font-medium rounded-xl border-border bg-card shadow-sm">
                                <SelectValue placeholder="All Tasks" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Total Tasks</SelectItem>
                                <SelectItem value="incomplete">Active Tasks</SelectItem>
                                <SelectItem value="completed">Completed Tasks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <TaskListView 
                        tasks={displayTasks}
                        users={users}
                        projects={projects}
                        showProject={true}
                        onTaskClick={setSelectedTask}
                    />
                </div>
            </div>

            {/* Task Detail Sheet */}
            <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <SheetContent className="w-[400px] sm:w-[500px]">
                    <SheetHeader className="p-6 border-b border-border bg-muted/30">
                        <SheetTitle className="text-title-large text-foreground">Task Detail</SheetTitle>
                        <SheetDescription className="text-body-medium text-muted-foreground">Task detail and status.</SheetDescription>
                    </SheetHeader>
                    {selectedTask && (
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-title-medium font-medium text-foreground">{selectedTask.title}</h3>
                                <p className="text-body-medium text-muted-foreground/60 mt-2 leading-relaxed">
                                    {selectedTask.description || "No detailed description for this task."}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-xl border border-border">
                                <div>
                                    <span className="text-label-small font-medium text-muted-foreground/40 block mb-1.5 uppercase tracking-[0.05em]">Status</span>
                                    <Badge variant={STATUS_MAP[selectedTask.status]?.variant || "outline"} className="text-label-small font-medium rounded-lg">
                                        {STATUS_MAP[selectedTask.status]?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-label-small font-medium text-muted-foreground/40 block mb-1.5 uppercase tracking-[0.05em]">Deadline</span>
                                    <span className="flex items-center gap-1.5 font-medium text-foreground text-label-large">
                                        <Calendar size={13} className="text-muted-foreground/30" />
                                        {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : "-"}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-4 mt-8 flex flex-col gap-3">
                                <Button
                                    className="w-full h-11 rounded-xl text-label-large font-medium shadow-md shadow-primary/10"
                                    variant={selectedTask.status === "done" ? "secondary" : "default"}
                                    disabled={selectedTask.status === "done"}
                                    onClick={() => handleMarkDone(selectedTask.id)}
                                >
                                    <CheckCircle2 size={16} className="mr-2" />
                                    {selectedTask.status === "done" ? "Task Completed" : "Completed (Mark complete)"}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
