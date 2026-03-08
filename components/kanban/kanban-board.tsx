"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getInitials, isOverdue } from "@/lib/utils";
import { Plus, X, Calendar, Link2, ChevronUp, ChevronDown, Minus, Circle, MessageSquare, CheckSquare, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";


const COLS: { id: TaskStatus; label: string; color: string }[] = [
    { id: "todo", label: "To Do", color: "text-muted-foreground" },
    { id: "in-progress", label: "In Progress", color: "text-primary" },
    { id: "review", label: "Review", color: "text-amber-400" },
    { id: "done", label: "Done", color: "text-emerald-400" },
];
const COL_DOT: Record<string, string> = {
    todo: "#6b7280", "in-progress": "#3b82f6", review: "#f59e0b", done: "#10b981",
};
const PRIORITY_ICON: Record<string, React.ReactNode> = {
    urgent: <ChevronUp size={12} className="text-destructive" />,
    high: <ChevronUp size={12} className="text-orange-500" />,
    medium: <Minus size={12} className="text-yellow-500" />,
    low: <ChevronDown size={12} className="text-muted-foreground" />,
};
const PRIORITY_LABEL: Record<string, string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL: Record<string, string> = { todo: "To Do", "in-progress": "In Progress", review: "Review", done: "Done" };

/* ── Task Card ── */
function TaskCard({ task, index, onClick, users }: { task: Task; index: number; onClick: (t: Task) => void; users: any[] }) {
    const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
    const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";
    const tags = typeof task.tags === "string" ? JSON.parse(task.tags) : (Array.isArray(task.tags) ? task.tags : []);

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task)}
                    className={`
            bg-card border rounded-lg p-3.5 mb-2 cursor-pointer
            hover:shadow-md hover:border-primary/20 transition-all duration-150 ease-out
            ${snapshot.isDragging ? "shadow-xl rotate-1 scale-[1.02] border-primary/30 ring-1 ring-primary/20" : "shadow-xs"}
          `}
                >
                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                            {tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <p className="text-[13px] leading-snug mb-3 font-medium">{task.title}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                        <div className="flex items-center gap-3">
                            <span title={PRIORITY_LABEL[task.priority]}>{PRIORITY_ICON[task.priority]}</span>
                            {task.dueDate && (
                                <span className={`flex items-center gap-1 text-[11px] font-medium ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                                    <Calendar size={11} /> {formatDate(task.dueDate)}
                                </span>
                            )}
                            
                            {/* Data Density Indicators */}
                            <div className="flex items-center gap-2.5 text-muted-foreground">
                                <span className="flex items-center gap-0.5 text-[10px] font-mono"><CheckSquare size={10} /> 0/0</span>
                                <span className="flex items-center gap-0.5 text-[10px] font-mono"><MessageSquare size={10} /> 0</span>
                                {task.gitLink && <span className="flex items-center gap-0.5 text-[10px] font-mono text-primary"><Link2 size={10} /></span>}
                                {/* Placeholder for Attachments if any */}
                                {/* <span className="flex items-center gap-0.5 text-[10px] font-mono"><Paperclip size={10} /> 0</span> */}
                            </div>
                        </div>
                        {assignee && (
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[9px] text-primary-foreground font-semibold" style={{ backgroundColor: assignee.color }}>
                                    {getInitials(assignee.name)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}

/* ── Add Task Dialog ── */
function AddTaskDialog({ status, projectId, open, onOpenChange, onAdd, users }: {
    status: TaskStatus; projectId: string; open: boolean; onOpenChange: (o: boolean) => void;
    onAdd: (t: any) => void; users: any[];
}) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [gitLink, setGitLink] = useState("");

    const handleAdd = async () => {
        if (!title.trim()) return;
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId,
                title: title.trim(),
                description: desc,
                status,
                priority: priority as Task["priority"],
                assigneeId: assigneeId || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                gitLink: gitLink || undefined,
            })
        });
        if (res.ok) {
            const newTask = await res.json();
            onAdd(newTask);
            setTitle(""); setDesc(""); setAssigneeId(""); setPriority("medium"); setDueDate(""); setGitLink("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Tambah Tugas
                        <Badge variant="outline" className="text-[10px] font-normal">{STATUS_LABEL[status]}</Badge>
                    </DialogTitle>
                    <DialogDescription>Buat tugas baru untuk kolom {STATUS_LABEL[status]}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div><Label className="text-xs">Judul *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Apa yang perlu diselesaikan?" className="mt-1.5" autoFocus onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></div>
                    <div><Label className="text-xs">Deskripsi</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detail atau konteks..." rows={2} className="mt-1.5 resize-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Assignee</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Prioritas</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label className="text-xs">Tenggat</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1.5" /></div>
                        <div><Label className="text-xs">Git Link</Label><Input value={gitLink} onChange={(e) => setGitLink(e.target.value)} placeholder="https://..." className="mt-1.5" /></div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                    <Button onClick={handleAdd} disabled={!title.trim()}>Tambah Tugas</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ── Task Detail Slide-over (Sheet) ── */
function TaskDetailSheet({ task, open, onOpenChange, currentUserId, users }: { task: Task | null; open: boolean; onOpenChange: (o: boolean) => void; currentUserId?: string; users: any[] }) {
    const [comment, setComment] = useState("");
    const [messages, setMessages] = useState<Array<{ id: string; type: string; content: string; userName: string; userColor: string; createdAt: string }>>([]);
    const [subtaskList, setSubtaskList] = useState<Array<{ id: string; title: string; completed: boolean; sortOrder: number }>>([]);
    const [newSubtask, setNewSubtask] = useState("");
    const [loadingSub, setLoadingSub] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    // Fetch subtasks when task changes
    useEffect(() => {
        if (!task) return;
        setLoadingSub(true);
        fetch(`/api/subtasks?taskId=${task.id}`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setSubtaskList(data); })
            .catch(() => {})
            .finally(() => setLoadingSub(false));
    }, [task?.id]);

    // Fetch comments when task changes
    useEffect(() => {
        if (!task) return;
        setLoadingComments(true);
        fetch(`/api/comments?taskId=${task.id}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data.map((c: Record<string, string>) => ({
                        id: c.id,
                        type: c.type || "comment",
                        content: c.content,
                        userName: c.userName || "Unknown",
                        userColor: c.userColor || "#6366f1",
                        createdAt: c.createdAt,
                    })));
                }
            })
            .catch(() => {})
            .finally(() => setLoadingComments(false));
    }, [task?.id]);

    const handleAddSubtask = async () => {
        if (!newSubtask.trim() || !task) return;
        const res = await fetch("/api/subtasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: task.id, title: newSubtask.trim() }),
        });
        if (res.ok) {
            const item = await res.json();
            setSubtaskList(prev => [...prev, item]);
            setNewSubtask("");
        }
    };

    const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
        const res = await fetch(`/api/subtasks/${subtaskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentCompleted }),
        });
        if (res.ok) {
            setSubtaskList(prev => prev.map(s => s.id === subtaskId ? { ...s, completed: !currentCompleted } : s));
        }
    };

    const handleDeleteSubtask = async (subtaskId: string) => {
        const res = await fetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" });
        if (res.ok) {
            setSubtaskList(prev => prev.filter(s => s.id !== subtaskId));
        }
    };

    const handleSend = async () => {
        if (!comment.trim() || !task || !currentUserId) return;
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: task.id, userId: currentUserId, content: comment.trim(), type: "comment" }),
        });
        if (res.ok) {
            const c = await res.json();
            setMessages(prev => [...prev, {
                id: c.id, type: "comment", content: c.content,
                userName: c.userName, userColor: c.userColor, createdAt: c.createdAt,
            }]);
            setComment("");
        }
    };

    if (!task) return null;
    const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
    const col = COLS.find((c) => c.id === task.status);
    const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";

    const completedCount = subtaskList.filter(s => s.completed).length;
    const totalCount = subtaskList.length;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl md:w-[600px] p-0 border-l overflow-y-auto flex flex-col bg-background shadow-2xl">
                {/* Header Area */}
                <div className="px-6 pt-8 pb-4 shrink-0">
                    <div className="flex gap-2 flex-wrap mb-4">
                        {(typeof task.tags === "string" ? JSON.parse(task.tags) : (Array.isArray(task.tags) ? task.tags : [])).map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 bg-muted/50 text-muted-foreground border-transparent">#{t}</Badge>
                        ))}
                    </div>
                    <SheetTitle className="text-xl md:text-2xl font-semibold leading-tight tracking-tight text-foreground">{task.title}</SheetTitle>
                    <SheetDescription className="hidden" />
                </div>

                <div className="px-6"><Separator className="opacity-50" /></div>

                <Tabs defaultValue="details" className="w-full flex-1 flex flex-col">
                    <div className="px-6 pt-4 shrink-0">
                        <TabsList className="h-9 w-full grid grid-cols-3 bg-muted/30 p-1 rounded-lg">
                            <TabsTrigger value="details" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Detail</TabsTrigger>
                            <TabsTrigger value="subtasks" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                                Subtasks {totalCount > 0 && <span className="ml-1 text-[10px] text-muted-foreground">({completedCount}/{totalCount})</span>}
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Aktivitas</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        <TabsContent value="details" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/30">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COL_DOT[task.status] }} />{col?.label}
                                    </div>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/30">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Prioritas</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">{PRIORITY_ICON[task.priority]} {PRIORITY_LABEL[task.priority]}</div>
                                </div>
                                {assignee && (
                                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/30">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Assignee</p>
                                        <div className="flex items-center gap-2.5 text-sm font-medium">
                                            <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] text-primary-foreground font-semibold flex items-center justify-center p-0 m-0 leading-none pb-[1px]" style={{ backgroundColor: assignee.color }}>{getInitials(assignee.name)}</AvatarFallback></Avatar>
                                            <span className="truncate">{assignee.name}</span>
                                        </div>
                                    </div>
                                )}
                                {task.dueDate && (
                                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/30">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Tenggat</p>
                                        <p className={`text-sm font-medium ${overdue ? "text-destructive" : ""}`}>{formatDate(task.dueDate)}{overdue && " · Terlambat"}</p>
                                    </div>
                                )}
                            </div>

                            <Separator className="opacity-50" />

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/90"><span className="w-1 h-4 bg-primary rounded-full"></span>Deskripsi</h4>
                                <p className="text-[13px] text-foreground/70 leading-relaxed whitespace-pre-wrap pl-3">{task.description || "Tidak direkam."}</p>
                            </div>

                            {task.gitLink && (
                                <div className="flex items-center gap-3 p-3.5 bg-muted/20 border border-muted/50 rounded-xl mt-4 transition-colors hover:bg-muted/40">
                                    <div className="p-1.5 bg-background rounded-md shadow-sm border"><Link2 size={14} className="text-muted-foreground" /></div>
                                    <a href={task.gitLink} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary hover:underline hover:text-primary/80 truncate font-medium">{task.gitLink}</a>
                                </div>
                            )}
                        </TabsContent>

                        {/* ── SUBTASKS TAB (REAL DATA) ── */}
                        <TabsContent value="subtasks" className="m-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {loadingSub ? (
                                <p className="text-xs text-muted-foreground py-4 text-center">Memuat subtask...</p>
                            ) : (
                                <div className="space-y-2">
                                    {subtaskList.map((s) => (
                                        <label key={s.id} className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border/50 group">
                                            <div
                                                onClick={(e) => { e.preventDefault(); handleToggleSubtask(s.id, s.completed); }}
                                                className={`mt-0.5 w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center transition-all cursor-pointer ${s.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}
                                            >
                                                {s.completed && <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>}
                                            </div>
                                            <span className={`text-[13px] font-medium leading-tight flex-1 ${s.completed ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>
                                                {s.title}
                                            </span>
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleDeleteSubtask(s.id); }}
                                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </label>
                                    ))}
                                    {subtaskList.length === 0 && (
                                        <p className="text-xs text-muted-foreground py-4 text-center">Belum ada checklist. Tambahkan di bawah.</p>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            value={newSubtask}
                                            onChange={(e) => setNewSubtask(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                                            placeholder="Tulis checklist baru..."
                                            className="text-xs h-9"
                                        />
                                        <Button variant="outline" size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()} className="h-9 px-3 text-xs shrink-0">
                                            <Plus size={14} className="mr-1" /> Tambah
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* ── ACTIVITY TAB (REAL DATA) ── */}
                        <TabsContent value="activity" className="m-0 flex flex-col h-[calc(100vh-280px)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                                {loadingComments ? (
                                    <p className="text-xs text-muted-foreground py-4 text-center">Memuat aktivitas...</p>
                                ) : messages.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-4 text-center">Belum ada aktivitas. Tulis komentar pertama!</p>
                                ) : (
                                    messages.map((m) => {
                                        const initial = m.userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                                        const timeStr = new Date(m.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

                                        if (m.type === "system") {
                                            return (
                                                <div key={m.id} className="flex gap-3 items-start opacity-80">
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: "#9CA3AF", color: "#fff" }}>S</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="bg-muted/20 rounded-xl p-3">
                                                            <p className="text-xs text-muted-foreground">
                                                                <span className="font-medium text-foreground/70">{m.userName}</span> {m.content}
                                                            </p>
                                                            <span className="text-[10px] text-muted-foreground/50 mt-1">{timeStr}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={m.id} className="flex gap-3">
                                                <Avatar className="h-8 w-8 shrink-0 shadow-sm">
                                                    <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: m.userColor || "#6366f1", color: "#fff" }}>
                                                        {initial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-semibold text-[13px] text-foreground/90">{m.userName}</span>
                                                        <span className="text-[10px] text-muted-foreground/60 uppercase font-medium tracking-wider">{timeStr}</span>
                                                    </div>
                                                    <div className="bg-muted/30 border border-muted/50 rounded-2xl rounded-tl-sm p-3.5 text-[13px] shadow-sm">
                                                        <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="pt-4 mt-auto border-t shrink-0">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <div className="relative border border-muted rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-background">
                                            <Textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                                placeholder="Tulis komentar..."
                                                className="min-h-[70px] w-full resize-none text-[13px] bg-transparent border-0 focus-visible:ring-0 p-3 pb-10"
                                            />
                                            <div className="absolute bottom-2 left-3 right-2 flex justify-end items-center bg-background pt-1">
                                                <Button size="sm" onClick={handleSend} disabled={!comment.trim()} className="h-7 px-4 text-xs font-semibold rounded-full shadow-sm">
                                                    Kirim
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}

/* ── Kanban Board ── */
interface KanbanBoardProps { tasks: Task[]; projectId: string; onRefresh?: () => void }

export default function KanbanBoard({ tasks: initial, projectId, onRefresh }: KanbanBoardProps) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>(initial);
    const [users, setUsers] = useState<any[]>([]);
    const [addCol, setAddCol] = useState<TaskStatus | null>(null);
    const [selected, setSelected] = useState<Task | null>(null);

    useEffect(() => {
        setTasks(initial);
    }, [initial]);

    useEffect(() => {
        fetch("/api/users")
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setUsers(data); })
            .catch(() => {});
    }, []);

    const byCol = (s: TaskStatus) => tasks.filter((t) => t.status === s);

    const onDragEnd = async (result: DropResult) => {
        const { destination, draggableId } = result;
        if (!destination) return;
        const newStatus = destination.droppableId as TaskStatus;
        const task = tasks.find(t => t.id === draggableId);
        if (!task || task.status === newStatus) return;

        // Optimistic update
        setTasks((prev) => prev.map((t) => t.id === draggableId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));

        // Persist to DB
        try {
            const res = await fetch(`/api/tasks/${draggableId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error();
            if (onRefresh) onRefresh(); // Trigger parent refresh for percentages
            window.dispatchEvent(new CustomEvent("refresh-projects")); // Sync Sidebar
        } catch (error) {
            // Revert on error
            setTasks(initial);
        }
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 h-full overflow-x-auto pb-2">
                    {COLS.map((col) => {
                        const colTasks = byCol(col.id);
                        return (
                            <div key={col.id} className="flex-shrink-0 w-[280px] flex flex-col bg-muted/30 border rounded-xl overflow-hidden">
                                {/* Column header */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COL_DOT[col.id] }} />
                                        <span className="text-sm font-semibold">{col.label}</span>
                                        <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{colTasks.length}</Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAddCol(col.id)}>
                                        <Plus size={14} />
                                    </Button>
                                </div>
                                <Separator />

                                {/* Droppable */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto p-2.5 transition-colors ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                                        >
                                            {colTasks.map((t, i) => <TaskCard key={t.id} task={t} index={i} onClick={setSelected} users={users} />)}
                                            {provided.placeholder}
                                            {colTasks.length === 0 && !snapshot.isDraggingOver && (
                                                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                                                    <Circle size={20} className="opacity-30" />
                                                    <p className="text-xs">Kosong</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>

                                {/* Add task footer */}
                                <div className="p-2.5 pt-0">
                                    <Button variant="outline" size="sm" className="w-full text-xs text-muted-foreground border-dashed gap-1.5 justify-start" onClick={() => setAddCol(col.id)}>
                                        <Plus size={12} /> Tambah tugas
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            <AddTaskDialog status={addCol!} projectId={projectId} open={!!addCol} onOpenChange={(o) => !o && setAddCol(null)} onAdd={(t) => { setTasks((p) => [t, ...p]); if (onRefresh) onRefresh(); window.dispatchEvent(new CustomEvent("refresh-projects")); }} users={users} />
            <TaskDetailSheet task={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} currentUserId={user?.id} users={users} />
        </>
    );
}
