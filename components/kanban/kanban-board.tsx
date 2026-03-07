"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@/lib/types";
import { mockUsers, currentUser } from "@/lib/mock-data";
import { formatDate, getInitials, isOverdue } from "@/lib/utils";
import { Plus, X, Calendar, Link2, ChevronUp, ChevronDown, Minus, Circle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

const COLS: { id: TaskStatus; label: string; color: string }[] = [
    { id: "todo", label: "To Do", color: "text-muted-foreground" },
    { id: "in-progress", label: "In Progress", color: "text-blue-400" },
    { id: "review", label: "Review", color: "text-amber-400" },
    { id: "done", label: "Done", color: "text-emerald-400" },
];
const COL_DOT: Record<string, string> = {
    todo: "#6b7280", "in-progress": "#3b82f6", review: "#f59e0b", done: "#10b981",
};
const PRIORITY_ICON: Record<string, React.ReactNode> = {
    urgent: <ChevronUp size={12} className="text-red-500" />,
    high: <ChevronUp size={12} className="text-orange-500" />,
    medium: <Minus size={12} className="text-yellow-500" />,
    low: <ChevronDown size={12} className="text-muted-foreground" />,
};
const PRIORITY_LABEL: Record<string, string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL: Record<string, string> = { todo: "To Do", "in-progress": "In Progress", review: "Review", done: "Done" };

/* ── Task Card ── */
function TaskCard({ task, index, onClick }: { task: Task; index: number; onClick: (t: Task) => void }) {
    const assignee = task.assigneeId ? mockUsers.find((u) => u.id === task.assigneeId) : null;
    const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";

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
            hover:shadow-md hover:border-primary/20 transition-all duration-150
            ${snapshot.isDragging ? "shadow-xl rotate-1 scale-[1.02] border-primary/30" : "shadow-xs"}
          `}
                >
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                            {task.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <p className="text-[13px] leading-snug mb-3 font-medium">{task.title}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span title={PRIORITY_LABEL[task.priority]}>{PRIORITY_ICON[task.priority]}</span>
                            {task.dueDate && (
                                <span className={`flex items-center gap-1 text-[11px] ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                                    <Calendar size={10} /> {formatDate(task.dueDate)}
                                </span>
                            )}
                            {task.gitLink && <Link2 size={11} className="text-muted-foreground" />}
                        </div>
                        {assignee && (
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[9px] text-white font-semibold" style={{ backgroundColor: assignee.color }}>
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
function AddTaskDialog({ status, projectId, open, onOpenChange, onAdd }: {
    status: TaskStatus; projectId: string; open: boolean; onOpenChange: (o: boolean) => void;
    onAdd: (t: Task) => void;
}) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [gitLink, setGitLink] = useState("");

    const handleAdd = () => {
        if (!title.trim()) return;
        onAdd({
            id: `t_${Date.now()}`, projectId, title: title.trim(), description: desc, status, priority: priority as Task["priority"],
            assigneeId: assigneeId || undefined, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            gitLink: gitLink || undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        setTitle(""); setDesc(""); setAssigneeId(""); setPriority("medium"); setDueDate(""); setGitLink("");
        onOpenChange(false);
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
                                <SelectContent>{mockUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
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
function TaskDetailSheet({ task, open, onOpenChange }: { task: Task | null; open: boolean; onOpenChange: (o: boolean) => void }) {
    const [comment, setComment] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "system",
            content: "mengubah status menjadi **In Progress**",
            user: { name: "Andi Pratama", color: "bg-primary", initial: "A" },
            time: "2 jam lalu",
        },
        {
            id: 2,
            type: "user",
            content: "Mohon update API endpoint ya karena flow login sudah fix. Jangan lupa sinkronisasi dengan *frontend*.",
            user: { name: "Budi Setiawan", color: "bg-primary text-primary-foreground", initial: "B" },
            time: "Kemarin, 14:30",
        }
    ]);

    const handleSend = () => {
        if (!comment.trim()) return;
        setMessages([
            ...messages,
            {
                id: Date.now(),
                type: "user",
                content: comment,
                user: { name: currentUser.name, color: "bg-indigo-500 text-white", initial: getInitials(currentUser.name) },
                time: "Baru saja",
            }
        ]);
        setComment("");
    };

    if (!task) return null;
    const assignee = task.assigneeId ? mockUsers.find((u) => u.id === task.assigneeId) : null;
    const col = COLS.find((c) => c.id === task.status);
    const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "done";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl md:w-[600px] p-0 border-l overflow-y-auto flex flex-col bg-background shadow-2xl">
                {/* Header Area */}
                <div className="px-6 pt-8 pb-4 shrink-0">
                    <div className="flex gap-2 flex-wrap mb-4">
                        {task.tags?.map((t) => <Badge key={t} variant="secondary" className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 bg-muted/50 text-muted-foreground border-transparent">#{t}</Badge>)}
                    </div>
                    <SheetTitle className="text-xl md:text-2xl font-semibold leading-tight tracking-tight text-foreground">{task.title}</SheetTitle>
                    <SheetDescription className="hidden" />
                </div>

                <div className="px-6"><Separator className="opacity-50" /></div>

                <Tabs defaultValue="details" className="w-full flex-1 flex flex-col">
                    <div className="px-6 pt-4 shrink-0">
                        <TabsList className="h-9 w-full grid grid-cols-3 bg-muted/30 p-1 rounded-lg">
                            <TabsTrigger value="details" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Detail</TabsTrigger>
                            <TabsTrigger value="subtasks" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Subtasks</TabsTrigger>
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
                                            <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] text-white font-semibold flex items-center justify-center p-0 m-0 leading-none pb-[1px]" style={{ backgroundColor: assignee.color }}>{getInitials(assignee.name)}</AvatarFallback></Avatar>
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

                        <TabsContent value="subtasks" className="m-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <label key={i} className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border/50">
                                        <Checkbox id={`subtask-${i}`} defaultChecked={i === 1} className="mt-0.5 hidden" />
                                        <div className={`mt-0.5 w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center transition-all ${i === 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                                            {i === 1 && <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>}
                                        </div>
                                        <span className={`text-[13px] font-medium leading-tight ${i === 1 ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>
                                            Contoh Subtask {i}: Implementasi fungsionalitas komponen antarmuka
                                        </span>
                                    </label>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground/80 mt-2 border border-dashed border-muted-foreground/30 hover:bg-muted/40 hover:text-foreground h-9 px-3 text-xs"><Plus size={14} className="mr-2" /> Tambah checklist baru</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="m-0 flex flex-col h-[calc(100vh-280px)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                                {messages.map((m) => {
                                    if (m.type === "system") {
                                        return (
                                            <div key={m.id} className="flex gap-3 items-center opacity-80">
                                                <div className="w-8 flex justify-center shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                                </div>
                                                <div className="flex-1 flex flex-wrap items-center gap-x-1.5">
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground/70">{m.user.name}</span> {m.content.replace(/\*\*(.*?)\*\*/g, "").trim()}
                                                    </p>
                                                    <span className="font-semibold text-foreground px-1.5 py-0.5 rounded bg-muted/50 text-[10px] uppercase tracking-wider">
                                                        {m.content.match(/\*\*(.*?)\*\*/)?.[1] || ""}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/50 ml-1">{m.time}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={m.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8 shrink-0 shadow-sm">
                                                <AvatarFallback className="text-[10px] font-bold" style={m.user.color.startsWith('bg-') ? {} : { backgroundColor: m.user.color, color: "#fff" }}>
                                                    {m.user.initial}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold text-[13px] text-foreground/90">{m.user.name}</span>
                                                    <span className="text-[10px] text-muted-foreground/60 uppercase font-medium tracking-wider">{m.time}</span>
                                                </div>
                                                <div className="bg-muted/30 border border-muted/50 rounded-2xl rounded-tl-sm p-3.5 text-[13px] shadow-sm">
                                                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-4 mt-auto border-t shrink-0">
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 shrink-0 shadow-sm">
                                        <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: currentUser.color || "#6366f1", color: "#fff" }}>
                                            {getInitials(currentUser.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="relative border border-muted rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-background">
                                            <Textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                                placeholder="Tulis komentar atau ketik @ untuk mention..."
                                                className="min-h-[90px] w-full resize-none text-[13px] bg-transparent border-0 focus-visible:ring-0 p-3 pb-12"
                                            />
                                            <div className="absolute bottom-2 left-3 right-2 flex justify-between items-center bg-background pt-1">
                                                <span className="text-[10px] text-muted-foreground/70 font-medium">✨ Markdown didukung</span>
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
interface KanbanBoardProps { tasks: Task[]; projectId: string; }

export default function KanbanBoard({ tasks: initial, projectId }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initial);
    const [addCol, setAddCol] = useState<TaskStatus | null>(null);
    const [selected, setSelected] = useState<Task | null>(null);

    const byCol = (s: TaskStatus) => tasks.filter((t) => t.status === s);

    const onDragEnd = (result: DropResult) => {
        const { destination, draggableId } = result;
        if (!destination) return;
        setTasks((prev) => prev.map((t) => t.id === draggableId ? { ...t, status: destination.droppableId as TaskStatus, updatedAt: new Date().toISOString() } : t));
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
                                            {colTasks.map((t, i) => <TaskCard key={t.id} task={t} index={i} onClick={setSelected} />)}
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

            <AddTaskDialog status={addCol!} projectId={projectId} open={!!addCol} onOpenChange={(o) => !o && setAddCol(null)} onAdd={(t) => setTasks((p) => [t, ...p])} />
            <TaskDetailSheet task={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
        </>
    );
}
