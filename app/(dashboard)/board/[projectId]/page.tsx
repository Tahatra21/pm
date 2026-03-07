"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/header";
import KanbanBoard from "@/components/kanban/kanban-board";
import TimelineView from "@/components/timeline/timeline-view";
import { getInitials } from "@/lib/utils";
import { Kanban, GanttChart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type ViewMode = "kanban" | "timeline";

export default function BoardPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [view, setView] = useState<ViewMode>("kanban");
    const [project, setProject] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [pRes, uRes] = await Promise.all([
                fetch(`/api/projects/${projectId}`),
                fetch("/api/users")
            ]);
            if (pRes.ok) setProject(await pRes.json());
            if (uRes.ok) setUsers(await uRes.json());
        } catch (error) {
            console.error("Failed to fetch board data", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header breadcrumb={[{ label: "Proyek", href: "/projects" }, { label: "Memuat..." }]} />
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="animate-spin mr-2" size={18} /> Memuat data proyek...
            </div>
        </div>
    );

    if (!project) return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header breadcrumb={[{ label: "Proyek", href: "/projects" }, { label: "Tidak ditemukan" }]} />
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Proyek tidak ditemukan.</div>
        </div>
    );

    const tasks = project.tasks || [];
    const members = users.filter((u) => project.members?.includes(u.id));
    const pct = project.progress || 0;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header
                breadcrumb={[{ label: "Proyek", href: "/projects" }, { label: project.title }]}
                actions={
                    <div className="flex items-center gap-3">
                        {/* Members */}
                        <div className="flex -space-x-1.5 mr-1">
                            {members.slice(0, 5).map((u) => (
                                <Avatar key={u.id} className="h-6 w-6 ring-2 ring-card">
                                    <AvatarFallback className="text-[9px] text-white font-semibold" style={{ backgroundColor: u.color }}>{getInitials(u.name)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {members.length > 5 && (
                                <Avatar className="h-6 w-6 ring-2 ring-card"><AvatarFallback className="text-[9px]">+{members.length - 5}</AvatarFallback></Avatar>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 w-20" />
                            <Badge variant="secondary" className="text-[10px] font-mono">{pct}%</Badge>
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center bg-muted rounded-lg p-0.5">
                            {([
                                { id: "kanban", label: "Kanban", Icon: Kanban },
                                { id: "timeline", label: "Timeline", Icon: GanttChart },
                            ] as const).map(({ id, label, Icon }) => (
                                <Button
                                    key={id}
                                    variant={view === id ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn("gap-1.5 text-xs h-7", view !== id && "text-muted-foreground hover:text-foreground")}
                                    onClick={() => setView(id)}
                                >
                                    <Icon size={13} /> {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                }
            />
            <div className="flex-1 overflow-hidden p-4">
                {view === "kanban" ? (
                    <KanbanBoard tasks={tasks} projectId={projectId} onRefresh={fetchData} />
                ) : (
                    <TimelineView tasks={tasks} />
                )}
            </div>
        </div>
    );
}
