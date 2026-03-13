"use client";

import { useState, useEffect } from "react";
import { Task, User, Project } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatDate, cn, isOverdue } from "@/lib/utils";
import { Calendar, Clock, AlertCircle, MoreHorizontal, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListViewProps {
    tasks: Task[];
    users: User[];
    projects?: Project[];
    onTaskClick: (task: Task) => void;
    showProject?: boolean;
}

const PRIORITY_COLORS = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

const STATUS_COLORS = {
    todo: "bg-slate-500/10 text-slate-500",
    "in-progress": "bg-primary/10 text-primary",
    review: "bg-yellow-500/10 text-yellow-500",
    done: "bg-green-500/10 text-green-500",
};

export default function TaskListView({ tasks, users, projects = [], onTaskClick, showProject = false }: TaskListViewProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const getAssignee = (id?: string) => users.find(u => u.id === id);
    const getProject = (id: string) => projects.find(p => p.id === id);

    const columnCount = 6 + (showProject ? 1 : 0);

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="w-[350px] font-bold text-xs uppercase tracking-wider">Task Title</TableHead>
                        {showProject && <TableHead className="font-bold text-xs uppercase tracking-wider">Project</TableHead>}
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Priority</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Assignee</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Due Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columnCount} className="h-32 text-center text-muted-foreground italic">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => {
                            const assignee = getAssignee(task.assigneeId);
                            const project = getProject(task.projectId);
                            const overdue = mounted && task.dueDate && isOverdue(task.dueDate) && task.status !== "done";

                            return (
                                <TableRow 
                                    key={task.id} 
                                    className="cursor-pointer hover:bg-muted/40 transition-colors border-border group"
                                    onClick={() => onTaskClick(task)}
                                >
                                    <TableCell className="py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                {task.title}
                                            </span>
                                            {task.tags && (
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(task.tags) ? task.tags : JSON.parse(task.tags as any || "[]")).map((tag: string, i: number) => (
                                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium border border-border">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    {showProject && (
                                        <TableCell>
                                            {project ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">{project.title}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/40">-</span>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Badge variant="secondary" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0", STATUS_COLORS[task.status as keyof typeof STATUS_COLORS])}>
                                            {task.status.replace("-", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS])}>
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {assignee ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 border border-background shadow-sm">
                                                    <AvatarFallback className="text-[10px] font-bold" style={{ backgroundColor: assignee.color + "20", color: assignee.color }}>
                                                        {getInitials(assignee.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-muted-foreground">{assignee.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/40 italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? (
                                            <div className={cn("flex items-center gap-1.5 text-xs font-medium", overdue ? "text-red-500" : "text-muted-foreground")}>
                                                <Calendar size={12} className={cn(overdue ? "text-red-500" : "text-muted-foreground/60")} />
                                                {formatDate(task.dueDate)}
                                                {overdue && <AlertCircle size={12} className="ml-1" />}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/40">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={14} className="text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
