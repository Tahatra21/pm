"use client";

import { useState, useEffect, use, useMemo } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Plus, MoreHorizontal, Calendar, MessageSquare,
    GripVertical, Search, CheckCircle2, ArrowRight, X,
    Edit3, Save, Trash2, CheckCircle, Send,
    Pencil, Ship, FolderOpen, GanttChart, List, LayoutList
} from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";
import TimelineView from "@/components/timeline/timeline-view";
import TaskListView from "@/components/board/task-list-view";
import { User, Project, Task, Comment, Stream, Tag, TaskStatus, TaskPriority } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/components/ui/dialog";

const COLUMNS = [
    { id: "todo", label: "To Do", color: "bg-slate-500/10 text-slate-500" },
    { id: "in-progress", label: "In Progress", color: "bg-primary" },
    { id: "review", label: "In Review", color: "bg-chart-4" },
    { id: "done", label: "Done", color: "bg-chart-5" },
];

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"priority" | "date" | "name">("priority");
    const [filterPriority, setFilterPriority] = useState<Task["priority"] | "all">("all");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [subtasks, setSubtasks] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [view, setView] = useState<"kanban" | "timeline" | "list">("kanban");
    const [users, setUsers] = useState<User[]>([]);

    // Project Edit/Delete State
    const [showProjectEdit, setShowProjectEdit] = useState(false);
    const [showProjectDelete, setShowProjectDelete] = useState(false);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [createStatus, setCreateStatus] = useState<Task["status"]>("todo");
    const [newTitle, setNewTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const progress = useMemo(() => {
        if (tasks.length === 0) return 0;
        const done = tasks.filter(t => t.status === "done").length;
        return Math.round((done / tasks.length) * 100);
    }, [tasks]);

    const stream = useMemo(() => {
        return streams.find(s => s.id === project?.streamId);
    }, [streams, project]);

    useEffect(() => {
        if (selectedTask) {
            fetchSubtasks(selectedTask.id);
            fetchComments(selectedTask.id);
            setEditTitle(selectedTask.title);
            setEditDesc(selectedTask.description || "");
            setEditPriority(selectedTask.priority);
            setIsEditing(false);
        } else {
            setSubtasks([]);
            setComments([]);
        }
    }, [selectedTask]);

    const fetchSubtasks = async (taskId: string) => {
        try {
            const res = await fetch(`/api/subtasks?taskId=${taskId}`);
            const data = await res.json();
            if (Array.isArray(data)) setSubtasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim() || !selectedTask) return;
        try {
            const res = await fetch("/api/subtasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId: selectedTask.id, title: newSubtaskTitle.trim() }),
            });
            if (res.ok) {
                const newTask = await res.json();
                setSubtasks(prev => [...prev, newTask]);
                setNewSubtaskTitle("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
        try {
            const res = await fetch(`/api/subtasks/${subtaskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !completed }),
            });
            if (res.ok) {
                setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, completed: !completed } : s));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSubtask = async (subtaskId: string) => {
        try {
            const res = await fetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" });
            if (res.ok) {
                setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchComments = async (taskId: string) => {
        setCommentsLoading(true);
        try {
            const res = await fetch(`/api/comments?taskId=${taskId}`);
            const data = await res.json();
            if (Array.isArray(data)) setComments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !selectedTask) return;
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: selectedTask.id,
                    userId: "u1",
                    content: commentText.trim()
                }),
            });
            if (res.ok) {
                const newComment = await res.json();
                setComments(prev => [...prev, newComment]);
                setCommentText("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveTaskEdit = async () => {
        if (!selectedTask || !editTitle.trim()) return;
        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    description: editDesc,
                    priority: editPriority
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                setSelectedTask(updated);
                setIsEditing(false);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                const [pRes, tRes, sRes, tTagsRes, uRes] = await Promise.all([
                    fetch(`/api/projects/${projectId}`),
                    fetch(`/api/tasks?projectId=${projectId}`),
                    fetch("/api/admin/streams"),
                    fetch("/api/admin/tags"),
                    fetch("/api/users")
                ]);
                const pData = await pRes.json();
                const tData = await tRes.json();
                const sData = await sRes.json();
                const ttData = await tTagsRes.json();
                const uData = await uRes.json();

                setProject(pData);
                if (Array.isArray(tData)) setTasks(tData);
                if (Array.isArray(sData)) setStreams(sData);
                if (Array.isArray(ttData)) setTags(ttData);
                if (Array.isArray(uData)) setUsers(uData);
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

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as Task["status"];
        const taskId = draggableId;

        // Optimistic UI update
        const prevTasks = [...tasks];
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                setTasks(prevTasks); // Rollback on error
            }
        } catch (error) {
            console.error(error);
            setTasks(prevTasks); // Rollback on error
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

    const handleUpdateProject = async (data: any) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const updated = await res.json();
                setProject(updated);
                setShowProjectEdit(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
            if (res.ok) {
                import("next/navigation").then(({ useRouter }) => {
                    window.location.href = "/projects";
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addTask = (initialStatus?: Task["status"]) => {
        setCreateStatus(initialStatus || "todo");
        setNewTitle("");
        setCreateOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    title: newTitle.trim(),
                    status: createStatus,
                    priority: "medium"
                }),
            });
            if (res.ok) {
                const newTask = await res.json();
                setTasks(prev => [...prev, newTask]);
                setCreateOpen(false);
                setNewTitle("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const filteredTasks = tasks
        .filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
            const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
            return matchesSearch && matchesPriority;
        })
        .sort((a, b) => {
            if (sortOrder === "priority") {
                const weights = { urgent: 0, high: 1, medium: 2, low: 3 };
                return weights[a.priority] - weights[b.priority];
            }
            if (sortOrder === "date") {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return a.title.localeCompare(b.title);
        });

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "urgent": return "bg-destructive/10 text-destructive border-destructive/20";
            case "high": return "bg-chart-3/20 text-chart-3 border-chart-3/30";
            case "medium": return "bg-primary/10 text-primary border-primary/20";
            default: return "bg-muted text-foreground/80 border-border";
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-muted/50">
            <Header breadcrumb={[
                { label: "Projects", href: "/projects" },
                { label: project?.title || "Board" }
            ]} />

            <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card p-6 rounded-[32px] border border-border shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[22px] flex items-center justify-center text-white shadow-lg shrink-0 transition-transform hover:scale-105" style={{ backgroundColor: project?.color || "#6366f1" }}>
                            <FolderOpen size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-headline-small font-black text-foreground tracking-tight truncate">{project?.title || "Loading..." }</h1>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 rounded-lg">
                                            <MoreHorizontal size={14} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44 border-border shadow-xl rounded-xl p-1.5">
                                        <DropdownMenuItem onClick={() => setShowProjectEdit(true)} className="rounded-lg gap-3 font-bold text-sm text-foreground/80 cursor-pointer">
                                            <Pencil size={15} className="text-primary" /> Edit Project
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setShowProjectDelete(true)} className="rounded-lg gap-3 font-bold text-sm text-destructive cursor-pointer">
                                            <Trash2 size={15} /> Delete Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-3">
                                {stream && (
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black px-2 py-0.5 rounded-lg">
                                        <Ship size={10} className="mr-1.2" /> {stream.name}
                                    </Badge>
                                )}
                                <span className="text-label-small font-bold text-muted-foreground/40 uppercase tracking-widest">
                                    {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Progress Indicator */}
                        <div className="hidden md:flex flex-col gap-2 min-w-[200px]">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">Project Progress</span>
                                <span className="text-xs font-black text-foreground">{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-1000 ease-out rounded-full shadow-sm shadow-primary/20"
                                    style={{ width: `${progress}%`, backgroundColor: project?.color || 'var(--primary)' }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {users.filter(u => project?.members?.includes(u.id)).slice(0, 4).map(u => (
                                    <Avatar key={u.id} className="w-8 h-8 ring-2 ring-background shadow-sm">
                                        <AvatarFallback className="text-[10px] font-black" style={{ backgroundColor: u.color + '20', color: u.color }}>
                                            {getInitials(u.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                {project?.members && project.members.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground ring-2 ring-background">
                                        +{project.members.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Controls Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border shadow-inner">
                            <Button
                                variant={view === "kanban" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("kanban")}
                                className={cn("rounded-lg h-8 px-3 text-xs font-bold gap-2", view === "kanban" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <GripVertical size={14} /> Kanban
                            </Button>
                            <Button
                                variant={view === "timeline" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("timeline")}
                                className={cn("rounded-lg h-8 px-3 text-xs font-bold gap-2", view === "timeline" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <GanttChart size={14} /> Timeline
                            </Button>
                            <Button
                                variant={view === "list" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("list")}
                                className={cn("rounded-lg h-8 px-3 text-xs font-bold gap-2", view === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <LayoutList size={14} /> List
                            </Button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-10 h-10 bg-card border-border rounded-xl text-label-medium font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 rounded-xl border-border gap-2 font-medium text-label-medium px-4">
                                    Sort: {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 border-border p-1 shadow-xl rounded-xl">
                                <DropdownMenuItem onClick={() => setSortOrder("priority")} className="text-body-medium font-medium cursor-pointer rounded-lg">Priority</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOrder("date")} className="text-body-medium font-medium cursor-pointer rounded-lg">Due Date</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortOrder("name")} className="text-body-medium font-medium cursor-pointer rounded-lg">Name</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 rounded-xl border-border gap-2 font-medium text-label-medium px-4">
                                    Filter: {filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 border-border p-1 shadow-xl rounded-xl">
                                <DropdownMenuItem onClick={() => setFilterPriority("all")} className="text-body-medium font-medium cursor-pointer rounded-lg">All Priorities</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterPriority("urgent")} className="text-body-medium font-medium cursor-pointer rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-destructive" /> Urgent
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterPriority("high")} className="text-body-medium font-medium cursor-pointer rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-chart-3" /> High
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterPriority("medium")} className="text-body-medium font-medium cursor-pointer rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" /> Medium
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterPriority("low")} className="text-body-medium font-medium cursor-pointer rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground" /> Low
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            className="h-10 rounded-xl bg-primary hover:bg-primary/90 !text-white gap-2 font-medium text-label-large px-4 shadow-sm"
                            onClick={() => addTask()}
                        >
                            <Plus size={16} className="text-white" /> New Task
                        </Button>
                    </div>
                </div>

                {/* View Content */}
                {view === "kanban" ? (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex-1 overflow-x-auto pb-4">
                            <div className="flex gap-6 h-full min-w-max">
                                {COLUMNS.map(col => (
                                    <div key={col.id} className="w-80 flex flex-col gap-4">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", col.color)} />
                                                <h3 className="text-title-small font-medium text-foreground">{col.label}</h3>
                                                <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium border-none text-label-small h-5 px-1.5 rounded-full">
                                                    {filteredTasks.filter(t => t.status === col.id).length}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/80"
                                                onClick={() => addTask(col.id as any)}
                                            >
                                                <Plus size={14} />
                                            </Button>
                                        </div>

                                        <Droppable droppableId={col.id}>
                                            {(provided, snapshot) => (
                                                <ScrollArea
                                                    className={cn(
                                                        "flex-1 rounded-2xl p-2 border transition-colors",
                                                        snapshot.isDraggingOver ? "bg-muted/90 border-primary/20" : "bg-muted/80/50 border-border/50"
                                                    )}
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                >
                                                    <div className="flex flex-col gap-3 pr-2 min-h-[150px]">
                                                        {filteredTasks.filter(t => t.status === col.id).map((task, index) => (
                                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <Card
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        onClick={() => setSelectedTask(task)}
                                                                        className={cn(
                                                                            "p-4 border-border transition-all group select-none",
                                                                            snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/20 cursor-grabbing bg-card z-50 scale-[1.02]" : "hover:shadow-md cursor-pointer"
                                                                        )}
                                                                    >
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <Badge className={cn("text-label-small h-4 font-medium border-none px-1.5", getPriorityColor(task.priority))}>
                                                                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                                            </Badge>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                                                                                        <MoreHorizontal size={14} />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-40 border-border">
                                                                                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Move to</div>
                                                                                    {COLUMNS.filter(c => c.id !== task.status).map(col => (
                                                                                        <DropdownMenuItem
                                                                                            key={col.id}
                                                                                            onClick={() => updateTaskStatus(task.id, col.id as any)}
                                                                                            className="text-xs font-bold gap-2 cursor-pointer"
                                                                                        >
                                                                                            <ArrowRight size={12} className="text-muted-foreground/80" />
                                                                                            {col.label}
                                                                                        </DropdownMenuItem>
                                                                                    ))}
                                                                                    <div className="h-px bg-muted/80 my-1" />
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => deleteTask(task.id)}
                                                                                        className="text-xs font-bold text-destructive gap-2 cursor-pointer"
                                                                                    >
                                                                                        Delete Task
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>

                                                                        <h4 className="text-body-medium font-medium text-foreground mb-1 leading-snug group-hover:text-primary transition-colors">{task.title}</h4>

                                                                        {task.description && (
                                                                            <p className="text-body-small text-muted-foreground/60 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                                                                        )}

                                                                        <div className="flex items-center justify-between mt-auto">
                                                                            <div className="flex items-center gap-3">
                                                                                {task.dueDate && (
                                                                                    <div className="flex items-center gap-1 text-label-small text-muted-foreground/40 font-medium">
                                                                                        <Calendar size={12} className="text-muted-foreground/20" />
                                                                                        <span className="tabular-nums">{formatDate(task.dueDate)}</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex items-center gap-1 text-label-small text-muted-foreground/40 font-medium">
                                                                                    <MessageSquare size={12} className="text-muted-foreground/20" />
                                                                                    <span className="tabular-nums">2</span>
                                                                                </div>
                                                                            </div>
                                                                            <Avatar className="w-6 h-6 border-[1.5px] border-card shadow-sm">
                                                                                <AvatarFallback className="bg-secondary text-primary-foreground text-label-small font-medium">JD</AvatarFallback>
                                                                            </Avatar>
                                                                        </div>
                                                                    </Card>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                </ScrollArea>
                                            )}
                                        </Droppable>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DragDropContext>
                ) : view === "timeline" ? (
                    <div className="flex-1 overflow-hidden">
                        <TimelineView tasks={filteredTasks as any} users={users} />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <TaskListView 
                            tasks={filteredTasks as any} 
                            users={users} 
                            onTaskClick={setSelectedTask} 
                        />
                    </div>
                )}
            </div>

            {/* Task Detail Sheet */}
            <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l border-border bg-background shadow-2xl flex flex-col">
                    <SheetHeader className="p-8 border-b border-border bg-muted/20 shrink-0 relative">
                        <div className="absolute top-8 right-8 flex gap-2">
                            {!isEditing ? (
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground/60" onClick={() => setIsEditing(true)}>
                                    <Edit3 size={18} />
                                </Button>
                            ) : (
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted text-primary" onClick={handleSaveTaskEdit}>
                                    <Save size={18} />
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            {selectedTask && (
                                <Badge className={cn("text-label-small h-5 font-medium border-none px-2 rounded-lg", getPriorityColor(isEditing ? editPriority : selectedTask.priority))}>
                                    {(isEditing ? editPriority : selectedTask.priority).toUpperCase()}
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-label-small h-5 font-medium border-border text-muted-foreground/60 px-2 rounded-lg">
                                {selectedTask?.status.replace("-", " ").toUpperCase()}
                            </Badge>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 pr-12">
                                <div className="space-y-1.5">
                                    <Label className="text-label-small text-muted-foreground/60 uppercase tracking-wider">Title</Label>
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-title-large font-medium bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/20 h-auto"
                                        placeholder="Task title..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <SheetTitle className="text-display-small text-foreground leading-tight tracking-tight pr-12">
                                    {selectedTask?.title}
                                </SheetTitle>
                                <SheetDescription className="text-body-medium text-muted-foreground/60 mt-2">
                                    Project Task Detail & Information
                                </SheetDescription>
                            </>
                        )}
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {/* Description Section */}
                        <div className="space-y-3">
                            <h4 className="text-title-small font-medium text-foreground flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full" />
                                Description
                            </h4>
                            {isEditing ? (
                                <Textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Add description..."
                                    className="text-body-medium text-muted-foreground/80 leading-relaxed bg-muted/20 border-border rounded-xl min-h-[120px] focus-visible:ring-primary/20"
                                />
                            ) : (
                                <p className="text-body-medium text-muted-foreground/80 leading-relaxed whitespace-pre-wrap pl-3">
                                    {selectedTask?.description || "No detailed description provided."}
                                </p>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-6 bg-muted/30 p-5 rounded-2xl border border-border/50">
                            <div className="space-y-1.5">
                                <span className="text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em]">Assignee</span>
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-6 h-6 border-border border shadow-sm">
                                        <AvatarFallback className="bg-secondary text-primary text-[10px] font-bold">JD</AvatarFallback>
                                    </Avatar>
                                    <span className="text-body-medium font-medium text-foreground">John Doe</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em]">Priority</span>
                                {isEditing ? (
                                    <Select value={editPriority} onValueChange={(v: any) => setEditPriority(v)}>
                                        <SelectTrigger className="h-8 border-none bg-transparent p-0 focus:ring-0 text-body-medium font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-2 text-foreground font-medium text-body-medium">
                                        <div className={cn("w-2 h-2 rounded-full", selectedTask?.priority === 'urgent' ? 'bg-destructive' : selectedTask?.priority === 'high' ? 'bg-chart-3' : 'bg-primary')} />
                                        {selectedTask?.priority.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Checklist Section */}
                        <div className="space-y-4">
                            <h4 className="text-title-small font-medium text-foreground flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-4 bg-primary rounded-full" />
                                    Checklist
                                </div>
                                {subtasks.length > 0 && (
                                    <span className="text-label-small text-muted-foreground/40 font-medium font-mono">
                                        {subtasks.filter(s => s.completed).length}/{subtasks.length}
                                    </span>
                                )}
                            </h4>

                            <div className="space-y-2 pl-3">
                                {subtasks.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:bg-muted/30 transition-colors group">
                                        <button
                                            onClick={() => handleToggleSubtask(sub.id, sub.completed)}
                                            className={cn(
                                                "w-4 h-4 rounded border transition-all flex items-center justify-center",
                                                sub.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"
                                            )}
                                        >
                                            {sub.completed && <CheckCircle size={10} />}
                                        </button>
                                        <span className={cn(
                                            "text-body-medium flex-1",
                                            sub.completed ? "text-muted-foreground/40 line-through" : "text-foreground/80"
                                        )}>
                                            {sub.title}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteSubtask(sub.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/20 hover:text-destructive transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/50 bg-muted/5 mt-4">
                                    <Plus size={16} className="text-muted-foreground/40" />
                                    <Input
                                        placeholder="Add new subtask..."
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                        className="h-6 border-none bg-transparent p-0 focus-visible:ring-0 text-body-medium placeholder:text-muted-foreground/20"
                                    />
                                    {newSubtaskTitle && (
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-primary" onClick={handleAddSubtask}>Add</Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Discussion Section */}
                        <div className="space-y-6 pt-6 border-t border-border/10">
                            <h4 className="text-title-small font-black text-foreground flex items-center gap-2 px-1">
                                <MessageSquare size={16} className="text-primary" />
                                Discussion
                                {comments.length > 0 && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold h-5 px-1.5 ml-1">
                                        {comments.length}
                                    </Badge>
                                )}
                            </h4>

                            <div className="space-y-6 px-1">
                                <div className="space-y-5">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="flex gap-4">
                                            <Avatar className="w-9 h-9 shrink-0 ring-2 ring-background">
                                                <AvatarFallback className="text-[11px] font-black" style={{ backgroundColor: comment.userColor + '20', color: comment.userColor }}>
                                                    {comment.userName?.split(' ').map(n => n[0]).join('') || "??"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-foreground">{comment.userName || "Unknown"}</span>
                                                    <span className="text-[10px] text-muted-foreground/50 font-medium">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <div className="bg-muted/30 rounded-2xl rounded-tl-none p-4 text-sm text-foreground/80 leading-relaxed border border-border/5 shadow-sm">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && !commentsLoading && (
                                        <div className="py-10 text-center bg-muted/5 rounded-3xl border border-dashed border-border/20">
                                            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto mb-3 shadow-inner">
                                                <MessageSquare className="text-muted-foreground/20" size={24} />
                                            </div>
                                            <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">No comments yet</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-card rounded-[28px] p-5 border border-border/40 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all mt-6">
                                    <textarea
                                        className="w-full bg-transparent border-0 focus:ring-0 text-sm resize-none min-h-[100px] font-medium placeholder:text-muted-foreground/30"
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                    />
                                    <div className="flex justify-end mt-3">
                                        <Button
                                            size="sm"
                                            onClick={handleAddComment}
                                            disabled={!commentText.trim()}
                                            className="bg-primary hover:bg-primary/90 !text-white rounded-xl gap-2 font-black h-10 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                        >
                                            <Send size={14} className="text-white" /> Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 p-8 bg-background border-t border-border flex gap-3">
                        <Button className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-medium text-label-large shadow-lg shadow-primary/20 gap-2 transition-all">
                            <CheckCircle2 size={18} />
                            Complete Task
                        </Button>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all" onClick={() => setSelectedTask(null)}>
                            <X size={18} />
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Project Edit Dialog */}
            {/* Create Task Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-border shadow-2xl">
                    <DialogHeader className="p-8 pb-4 bg-muted/50 border-b border-border">
                        <DialogTitle className="text-title-large text-foreground">Create New Task</DialogTitle>
                        <DialogDescription className="text-body-medium text-muted-foreground">
                            Adding to <span className="font-bold text-primary">{COLUMNS.find(c => c.id === createStatus)?.label || createStatus}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Task Title *</Label>
                                <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="rounded-xl border-border bg-muted/50 font-medium h-11"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-4 bg-muted/50 border-t border-border">
                            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="rounded-xl font-medium text-muted-foreground">Cancel</Button>
                            <Button type="submit" disabled={isCreating || !newTitle.trim()} className="rounded-xl bg-primary hover:bg-primary/90 text-white px-6">
                                {isCreating ? "Creating..." : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {project && (
                <ProjectDialog
                    open={showProjectEdit}
                    onOpenChange={setShowProjectEdit}
                    project={project as any}
                    onSave={handleUpdateProject}
                    streams={streams}
                    tags={tags}
                />
            )}

            {/* Project Delete Confirmation */}
            {project && (
                <DeleteProjectDialog
                    open={showProjectDelete}
                    onOpenChange={setShowProjectDelete}
                    projectTitle={project.title}
                    onConfirm={handleDeleteProject}
                />
            )}
        </div>
    );
}

const PROJECT_COLORS = ["#c27c3e", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#06b6d4"];

function ProjectDialog({ open, onOpenChange, project, onSave, streams, tags }: {
    open: boolean; onOpenChange: (o: boolean) => void;
    project?: any; onSave: (data: any) => void;
    streams: Stream[]; tags: Tag[];
}) {
    const [title, setTitle] = useState(project?.title || "");
    const [desc, setDesc] = useState(project?.description || "");
    const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
    const [streamId, setStreamId] = useState(project?.streamId || "");
    const [selectedTags, setSelectedTags] = useState<string[]>(project?.tags || []);

    useEffect(() => {
        if (open && project) {
            setTitle(project.title || "");
            setDesc(project.description || "");
            setColor(project.color || PROJECT_COLORS[0]);
            setStreamId(project.streamId || "");
            setSelectedTags(project.tags || []);
        }
    }, [open, project]);

    const handleSave = () => {
        if (!title.trim() || !streamId) return;
        onSave({ title: title.trim(), description: desc, color, streamId, tags: selectedTags });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-[32px] p-0 overflow-hidden border-border shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-muted/50 border-b border-border">
                    <DialogTitle className="text-title-large text-foreground">Edit Project</DialogTitle>
                    <DialogDescription className="text-body-medium text-muted-foreground">Update this project information.</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Project Name *</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Redesign Q2" className="rounded-xl border-border bg-muted/50 font-medium h-11" />
                        {!title.trim() && <p className="text-[10px] text-destructive font-bold px-1">Project title cannot be empty.</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Stream *</Label>
                            <Select value={streamId} onValueChange={setStreamId}>
                                <SelectTrigger className="rounded-xl border-border bg-muted/50 font-medium h-11">
                                    <SelectValue placeholder="Select Stream" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border shadow-xl">
                                    {streams.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-lg font-medium">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Color</Label>
                            <div className="flex gap-1.5 h-11 items-center px-1">
                                {PROJECT_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn("w-6 h-6 rounded-full transition-all", color === c ? "ring-2 ring-offset-2 scale-110" : "")}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Description</Label>
                        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe project goals..." rows={3} className="rounded-xl border-border bg-muted/50 font-normal resize-none py-3" />
                    </div>
                </div>
                <DialogFooter className="p-8 pt-4 bg-muted/50 border-t border-border">
                    <DialogClose asChild><Button variant="ghost" className="rounded-xl font-medium text-muted-foreground">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={!title.trim() || !streamId} className="rounded-xl bg-primary hover:bg-primary/90 text-white px-6">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteProjectDialog({ open, onOpenChange, projectTitle, onConfirm }: {
    open: boolean; onOpenChange: (o: boolean) => void; projectTitle: string; onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm rounded-[32px] p-8 border-border shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-title-medium text-foreground">Delete Project</DialogTitle>
                    <DialogDescription className="text-body-medium text-muted-foreground mt-2">
                        Are you sure you want to delete <strong className="text-foreground">{projectTitle}</strong>? All tasks within it will also be deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 gap-2">
                    <DialogClose asChild><Button variant="ghost" className="rounded-xl font-medium text-muted-foreground flex-1">Cancel</Button></DialogClose>
                    <Button variant="destructive" className="rounded-xl font-medium flex-1" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
