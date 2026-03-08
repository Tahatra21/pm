"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Plus, MoreHorizontal, Calendar, MessageSquare, 
    GripVertical, Search, CheckCircle2, ArrowRight
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    assigneeId: string | null;
    dueDate: string | null;
    tags: string | null;
}

interface Project {
    id: string;
    title: string;
    color: string;
}

const COLUMNS = [
    { id: "todo", label: "To Do", color: "bg-slate-500" },
    { id: "in-progress", label: "In Progress", color: "bg-blue-500" },
    { id: "review", label: "In Review", color: "bg-yellow-500" },
    { id: "done", label: "Done", color: "bg-emerald-500" },
];

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                const [pRes, tRes] = await Promise.all([
                    fetch(`/api/projects/${projectId}`),
                    fetch(`/api/tasks?projectId=${projectId}`)
                ]);
                const pData = await pRes.json();
                const tData = await tRes.json();
                
                setProject(pData);
                if (Array.isArray(tData)) setTasks(tData);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBoardData();
    }, [projectId]);

    const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== taskId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addTask = async () => {
        const title = prompt("Enter task title:");
        if (!title) return;
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    projectId, 
                    title,
                    status: "todo",
                    priority: "medium"
                }),
            });
            if (res.ok) {
                const newTask = await res.json();
                setTasks(prev => [...prev, newTask]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "urgent": return "bg-red-50 text-red-600 border-red-100";
            case "high": return "bg-orange-50 text-orange-600 border-orange-100";
            case "medium": return "bg-blue-50 text-blue-600 border-blue-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            <Header breadcrumb={[
                { label: "Projects", href: "/projects" },
                { label: project?.title || "Board" }
            ]} />
            
            <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
                {/* Board Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: project?.color || "#6366f1" }}>
                            <GripVertical size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{project?.title || "Loading..."}</h1>
                            <p className="text-sm text-slate-500 font-medium">Kanban Board View</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input 
                                placeholder="Search tasks..." 
                                className="pl-10 h-10 bg-white border-slate-200 rounded-xl" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-10 rounded-xl border-slate-200 gap-2 font-bold px-4">
                            Sort
                        </Button>
                        <Button 
                            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-4 shadow-sm"
                            onClick={addTask}
                        >
                            <Plus size={16} /> New Task
                        </Button>
                    </div>
                </div>

                {/* Kanban Grid */}
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 h-full min-w-max">
                        {COLUMNS.map(col => (
                            <div key={col.id} className="w-80 flex flex-col gap-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", col.color)} />
                                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{col.label}</h3>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold border-none text-[10px] h-5">
                                            {filteredTasks.filter(t => t.status === col.id).length}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400"><Plus size={14} /></Button>
                                </div>
                                
                                <ScrollArea className="flex-1 bg-slate-100/50 rounded-2xl p-2 border border-slate-200/50">
                                    <div className="flex flex-col gap-3 pr-2">
                                        {filteredTasks.filter(t => t.status === col.id).map(task => (
                                            <Card key={task.id} className="p-4 border-slate-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <Badge className={cn("text-[9px] h-4 font-bold border-none", getPriorityColor(task.priority))}>
                                                        {task.priority}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 group-hover:text-slate-500 transition-colors">
                                                                <MoreHorizontal size={14} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 border-slate-200">
                                                            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Move to</div>
                                                            {COLUMNS.filter(c => c.id !== task.status).map(col => (
                                                                <DropdownMenuItem 
                                                                    key={col.id}
                                                                    onClick={() => updateTaskStatus(task.id, col.id as any)}
                                                                    className="text-xs font-bold gap-2 cursor-pointer"
                                                                >
                                                                    <ArrowRight size={12} className="text-slate-400" />
                                                                    {col.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                            <div className="h-px bg-slate-100 my-1" />
                                                            <DropdownMenuItem 
                                                                onClick={() => deleteTask(task.id)}
                                                                className="text-xs font-bold text-red-600 gap-2 cursor-pointer"
                                                            >
                                                                Delete Task
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                
                                                <h4 className="text-[13px] font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                                
                                                {task.description && (
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                                                )}
                                                
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-3">
                                                        {task.dueDate && (
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                                <Calendar size={12} />
                                                                <span>{formatDate(task.dueDate)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <MessageSquare size={12} />
                                                            <span>2</span>
                                                        </div>
                                                    </div>
                                                    <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                                                        <AvatarFallback className="bg-slate-800 text-white text-[8px] font-bold">JD</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
