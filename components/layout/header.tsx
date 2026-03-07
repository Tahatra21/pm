"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, Plus, Command } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

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

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        setTaskError("");
        if (!taskTitle.trim()) {
            setTaskError("Title is required");
            return;
        }
        // Mock task creation
        setTaskOpen(false);
        setTaskTitle("");
    };

    const notifications = [
        { id: 1, msg: "Budi menyelesaikan 'Implementasi Header'", time: "5m lalu", unread: true },
        { id: 2, msg: "Tenggat 'Push Notification' 2 hari lagi", time: "1j lalu", unread: true },
        { id: 3, msg: "Citra meminta review PR #55", time: "3j lalu", unread: false },
    ];
    const unread = notifications.filter((n) => n.unread).length;

    return (
        <header className="flex items-center justify-between h-14 px-6 border-b bg-card flex-shrink-0">
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
            <div className="flex items-center gap-2">
                {actions}

                {/* Search */}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground font-normal h-9"
                    onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
                >
                    <Search size={14} />
                    <span className="hidden sm:block">Cari...</span>
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground ml-4">
                        <Command size={10} />K
                    </kbd>
                </Button>

                {/* New task */}
                <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5 h-9 shadow-sm">
                            <Plus size={14} /> Tugas Baru
                        </Button>
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
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </Button>

                    {showNotif && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                            <div className="absolute right-0 top-11 w-80 bg-popover border rounded-xl shadow-xl z-50 overflow-hidden anim-scale-in">
                                <div className="px-4 py-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-popover-foreground">Notifikasi</p>
                                        <Badge variant="secondary" className="text-[10px]">{unread} baru</Badge>
                                    </div>
                                </div>
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "px-4 py-3 border-b last:border-0 hover:bg-accent cursor-pointer transition-colors flex gap-3",
                                            n.unread && "bg-primary/5"
                                        )}
                                    >
                                        {n.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                                        <div className={cn(!n.unread && "ml-5")}>
                                            <p className="text-[13px] text-popover-foreground leading-snug">{n.msg}</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <AvatarFallback
                        className="text-[11px] font-semibold text-white"
                        style={{ backgroundColor: user?.color || "#6366f1" }}
                    >
                        {user ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
