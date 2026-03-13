"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, Plus, Command, Download, PlusCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
    breadcrumb?: { label: string; href?: string }[];
    actions?: React.ReactNode;
}

export default function Header({ breadcrumb, actions }: HeaderProps) {
    const { user } = useAuth();
    const [showNotif, setShowNotif] = useState(false);
    const [taskOpen, setTaskOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskError, setTaskError] = useState("");
    const [availableProjects, setAvailableProjects] = useState<{ id: string, title: string }[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (taskOpen) {
            fetch("/api/projects")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAvailableProjects(data);
                        if (data.length > 0 && !selectedProjectId) {
                            setSelectedProjectId(data[0].id);
                        }
                    }
                })
                .catch(console.error);
        }
    }, [taskOpen]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setTaskError("");
        if (!taskTitle.trim() || !selectedProjectId) {
            setTaskError("Both Title and Project are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    title: taskTitle.trim(),
                    status: "todo",
                    priority: "medium"
                }),
            });
            if (res.ok) {
                setTaskOpen(false);
                setTaskTitle("");
                // Optional: trigger a refresh of tasks on the current page if any
                window.location.reload();
            } else {
                setTaskError("Failed to create task");
            }
        } catch (error) {
            setTaskError("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const notifications = [
        { id: 1, msg: "Budi completed 'Header Implementation'", time: "5m ago", unread: true },
        { id: 2, msg: "'Push Notification' deadline in 2 days", time: "1h ago", unread: true },
        { id: 3, msg: "Citra requested review on PR #55", time: "3h ago", unread: false },
    ];
    const unread = notifications.filter((n) => n.unread).length;

    return (
        <header className="flex items-center justify-between h-16 px-8 border-b border-border bg-background flex-shrink-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                {breadcrumb?.map((item, i) => (
                    <span key={i} className="flex items-center gap-2">
                        {i > 0 && <span className="text-muted-foreground/40">/</span>}
                        {item.href ? (
                            <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">{item.label}</span>
                        )}
                    </span>
                ))}
            </div>

            {/* Actions right */}
            <div className="flex items-center gap-3">
                {actions}

                <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground font-semibold border-border hover:bg-muted">
                    <Download size={15} />
                    <span className="hidden md:inline">Export</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 shadow-sm">
                            <PlusCircle size={15} />
                            <span className="hidden md:inline">Add new</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 border-border">
                        <DropdownMenuItem onClick={() => setTaskOpen(true)} className="gap-2 cursor-pointer font-medium">
                            <CheckCircle2 size={14} className="text-primary" /> New Task
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="gap-2 cursor-pointer font-medium">
                            <Link href="/projects" className="flex items-center">
                                <PlusCircle size={14} className="text-primary" /> New Project
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                    <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-border shadow-2xl">
                        <DialogHeader className="p-8 pb-4 bg-muted/50 border-b border-border text-left">
                            <DialogTitle className="text-title-large text-foreground">Quick Task Creation</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask}>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Project *</Label>
                                    <select
                                        className="w-full rounded-xl border-border bg-muted/50 font-medium h-11 px-3 text-sm focus:ring-primary outline-none"
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Choose a project</option>
                                        {availableProjects.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Task Title *</Label>
                                    <Input
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="What needs to be done?"
                                        className="rounded-xl border-border bg-muted/50 font-medium h-11"
                                        autoFocus
                                    />
                                    {taskError && <p className="text-[10px] text-destructive font-bold px-1">{taskError}</p>}
                                </div>
                            </div>
                            <DialogFooter className="p-8 pt-4 bg-muted/50 border-t border-border">
                                <Button type="button" variant="ghost" onClick={() => setTaskOpen(false)} className="rounded-xl font-medium text-muted-foreground">Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary hover:bg-primary/90 text-white px-6">
                                    {isSubmitting ? "Creating..." : "Create Task"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                <ThemeToggle />

                {/* Search */}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground font-normal h-9"
                    onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
                >
                    <Search size={14} />
                    <span className="hidden sm:block">Search...</span>
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground ml-4">
                        <Command size={10} />K
                    </kbd>
                </Button>

                {/* Notifications */}
                <div className="relative">
                    <Button
                        variant="outline"
                        size="icon"
                        className="relative h-9 w-9"
                        onClick={() => setShowNotif(!showNotif)}
                    >
                        <Bell size={15} />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </Button>

                    {showNotif && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                            <div className="absolute right-0 top-11 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden anim-scale-in">
                                <div className="px-4 py-3 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-popover-foreground">Notifications</p>
                                        <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">{unread} new</Badge>
                                    </div>
                                </div>
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "px-4 py-3 border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors flex gap-3",
                                            n.unread && "bg-primary/5"
                                        )}
                                    >
                                        {n.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                                        <div className={cn(!n.unread && "ml-5")}>
                                            <p className="text-sm text-popover-foreground leading-snug">{n.msg}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Avatar */}
                <Link href="/settings">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                        <AvatarFallback
                            className="text-xs font-semibold text-primary-foreground bg-primary"
                        >
                            {user ? getInitials(user.name) : "?"}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </div>
        </header>
    );
}
