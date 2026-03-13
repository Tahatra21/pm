"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import { getInitials } from "@/lib/utils";
import {
    Plus, FolderOpen, MoreHorizontal, Pencil, Trash2, Ship, Zap, Filter, Search,
    X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROJECT_COLORS = ["#c27c3e", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#06b6d4"];

interface Stream { id: string; name: string; code: string; isActive: string; }
interface Tag { id: string; name: string; code: string; category: string; isActive: string; }

/* ── Create/Edit Project Dialog ── */
function ProjectDialog({ open, onOpenChange, project, onSave, streams, tags }: {
    open: boolean; onOpenChange: (o: boolean) => void;
    project?: Project; onSave: (data: any) => void;
    streams: Stream[]; tags: Tag[];
}) {
    const [title, setTitle] = useState(project?.title || "");
    const [desc, setDesc] = useState(project?.description || "");
    const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
    const [streamId, setStreamId] = useState(project?.streamId || "");
    const [selectedTags, setSelectedTags] = useState<string[]>(project?.tags || []);
    const isEdit = !!project;

    useEffect(() => {
        if (open) {
            setTitle(project?.title || "");
            setDesc(project?.description || "");
            setColor(project?.color || PROJECT_COLORS[0]);
            setStreamId(project?.streamId || "");
            setSelectedTags(project?.tags || []);
        }
    }, [open, project]);

    const handleSave = () => {
        if (!title.trim() || !streamId) return;
        onSave({ title: title.trim(), description: desc, color, streamId, tags: selectedTags });
        onOpenChange(false);
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-[32px] p-0 overflow-hidden border-border shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-muted/50 border-b border-border">
                    <DialogTitle className="text-title-large text-foreground">{isEdit ? "Edit Project" : "Create New Project"}</DialogTitle>
                    <DialogDescription className="text-body-medium text-muted-foreground">Fill in the project details below.</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Project Name *</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth. Website Redesign Q2" className="rounded-xl border-border bg-muted/50 font-medium focus:ring-blue-500 text-body-medium h-11" autoFocus />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Stream *</Label>
                            <Select value={streamId} onValueChange={setStreamId}>
                                <SelectTrigger className="rounded-xl border-border bg-muted/50 font-medium focus:ring-blue-500 text-body-medium h-11">
                                    <SelectValue placeholder="Select Stream" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border shadow-xl">
                                    {streams.filter(s => s.isActive === "true" || s.id === project?.streamId).map(s => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-lg font-medium text-foreground text-sm focus:bg-muted">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Color</Label>
                            <div className="flex gap-1.5 h-11 items-center px-1">
                                {PROJECT_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "w-6 h-6 rounded-full transition-all duration-150 shrink-0",
                                            color === c ? "ring-2 ring-offset-2" : ""
                                        )}
                                        style={{
                                            backgroundColor: c,
                                            border: color === c ? "2px solid white" : "none"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-label-xs text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Tags (Optional)</Label>
                        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-xl border border-border min-h-[44px]">
                            {tags.filter(t => t.isActive === "true" || project?.tags?.includes(t.id)).map(t => (
                                <Badge
                                    key={t.id}
                                    variant={selectedTags.includes(t.id) ? "default" : "outline"}
                                    onClick={() => toggleTag(t.id)}
                                    className={cn(
                                        "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                                        selectedTags.includes(t.id) ? "bg-primary text-primary-foreground border-transparent" : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                                    )}
                                >
                                    {t.name}
                                </Badge>
                            ))}
                            {tags.length === 0 && <span className="text-xs text-muted-foreground/60 font-medium italic">No tags available</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Description</Label>
                        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe project purpose..." rows={3} className="rounded-xl border-border bg-muted/50 font-normal focus:ring-blue-500 text-body-medium resize-none py-3" />
                    </div>
                </div>
                <DialogFooter className="p-8 pt-4 bg-muted/50 border-t border-border">
                    <DialogClose asChild><Button variant="ghost" className="rounded-xl font-medium text-label-large text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/60">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={!title.trim() || !streamId} className="rounded-xl bg-primary hover:bg-primary/90 font-medium text-label-large shadow-lg shadow-primary/20 text-white px-6">
                        {isEdit ? "Save Changes" : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ── Delete Confirmation Dialog ── */
function DeleteDialog({ open, onOpenChange, projectTitle, onConfirm }: {
    open: boolean; onOpenChange: (o: boolean) => void; projectTitle: string; onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm rounded-[32px] p-8 border-border shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-title-medium text-foreground">Delete Project</DialogTitle>
                    <DialogDescription className="text-body-medium text-muted-foreground mt-2">
                        Are you sure you want to delete proyek <strong className="text-foreground font-medium">{projectTitle}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 gap-2">
                    <DialogClose asChild><Button variant="ghost" className="rounded-xl font-medium text-label-large text-muted-foreground hover:text-foreground flex-1">Cancel</Button></DialogClose>
                    <Button variant="destructive" className="rounded-xl font-medium text-label-large flex-1 shadow-lg shadow-red-100" onClick={() => { onConfirm(); onOpenChange(false); }}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [deleteProject, setDeleteProject] = useState<Project | null>(null);

    // Filter states
    const [filterStream, setFilterStream] = useState<string>("all");
    const [filterTag, setFilterTag] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"title" | "progress" | "createdAt">("title");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchAll = async () => {
        try {
            const [pRes, uRes, sRes, tRes] = await Promise.all([
                fetch("/api/projects"),
                fetch("/api/users"),
                fetch("/api/admin/streams?limit=100"),
                fetch("/api/admin/tags?limit=100")
            ]);
            const [p, u, s, t] = await Promise.all([pRes.json(), uRes.json(), sRes.json(), tRes.json()]);
            if (Array.isArray(p)) setProjects(p);
            if (Array.isArray(u)) setUsers(u);
            if (s.data && Array.isArray(s.data)) setStreams(s.data);
            else if (Array.isArray(s)) setStreams(s);
            if (t.data && Array.isArray(t.data)) setTags(t.data);
            else if (Array.isArray(t)) setTags(t);
        } catch (error) { }
    };

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStream, filterTag, searchQuery]);

    const handleCreate = async (data: any) => {
        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) fetchAll();
    };

    const handleEdit = async (data: any) => {
        if (!editProject) return;
        const res = await fetch(`/api/projects/${editProject.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) fetchAll();
        setEditProject(null);
    };

    const handleDelete = async () => {
        if (!deleteProject) return;
        const res = await fetch(`/api/projects/${deleteProject.id}`, { method: "DELETE" });
        if (res.ok) fetchAll();
        setDeleteProject(null);
    };

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => {
                const matchesStream = filterStream === "all" || p.streamId === filterStream;
                const matchesTag = filterTag === "all" || p.tags?.includes(filterTag);
                const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesStream && matchesTag && matchesSearch;
            })
            .sort((a, b) => {
                if (sortField === "title") return a.title.localeCompare(b.title);
                if (sortField === "progress") return (b as any).progress - (a as any).progress;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [projects, filterStream, filterTag, searchQuery, sortField]);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProjects.slice(start, start + itemsPerPage);
    }, [filteredProjects, currentPage]);

    const resetFilters = () => {
        setFilterStream("all");
        setFilterTag("all");
        setSearchQuery("");
    };

    const isFiltered = filterStream !== "all" || filterTag !== "all" || searchQuery !== "";

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full overflow-hidden bg-muted/50">
                <Header breadcrumb={[{ label: "Projects" }]} />

                <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
                    <div className="max-w-[1400px] mx-auto space-y-4">
                        {/* Header Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 lg:p-6 rounded-[32px] border border-border/60 shadow-sm">
                            <div className="flex flex-col">
                                <h1 className="text-headline-medium text-foreground">Projects</h1>
                                <p className="text-body-medium text-muted-foreground/60">{filteredProjects.length} projects found</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary transition-colors" size={14} />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-[240px] rounded-xl border-border bg-muted/50 font-normal text-label-medium h-9 transition-all focus:bg-card"
                                    />
                                </div>

                                <Select value={filterStream} onValueChange={setFilterStream}>
                                    <SelectTrigger className="w-[160px] rounded-xl border-border bg-muted/50 font-medium text-label-medium h-9">
                                        <SelectValue placeholder="Select Stream" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        <SelectItem value="all" className="rounded-lg font-medium text-body-medium">All Streams</SelectItem>
                                        {streams.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="rounded-lg font-medium text-body-medium">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filterTag} onValueChange={setFilterTag}>
                                    <SelectTrigger className="w-[140px] rounded-xl border-border bg-muted/50 font-medium text-label-medium h-9">
                                        <SelectValue placeholder="Tag" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        <SelectItem value="all" className="rounded-lg font-medium text-body-medium">All Tags</SelectItem>
                                        {tags.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="rounded-lg font-medium text-body-medium">{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortField} onValueChange={(val: any) => setSortField(val)}>
                                    <SelectTrigger className="w-[120px] rounded-xl border-border bg-muted/50 font-medium text-label-medium h-9">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        <SelectItem value="title" className="rounded-lg font-medium text-body-medium text-foreground">Name</SelectItem>
                                        <SelectItem value="progress" className="rounded-lg font-medium text-body-medium text-foreground">Progress</SelectItem>
                                        <SelectItem value="createdAt" className="rounded-lg font-medium text-body-medium text-foreground">Newest</SelectItem>
                                    </SelectContent>
                                </Select>

                                {isFiltered && (
                                    <Button variant="ghost" size="icon" onClick={resetFilters} className="rounded-xl text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 h-10 w-10 shrink-0">
                                        <X size={16} />
                                    </Button>
                                )}

                                <Separator orientation="vertical" className="h-8 mx-2 hidden md:block" />

                                <Button onClick={() => setShowCreate(true)} className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 text-white rounded-xl px-4 h-9">
                                    <Plus size={14} strokeWidth={3} />
                                    <span className="font-medium text-label-large text-white">New Project</span>
                                </Button>
                            </div>
                        </div>

                        {/* Project Table Card */}
                        <Card className="rounded-[40px] border-border/60 shadow-sm overflow-hidden bg-card">
                            <div className="overflow-x-auto custom-scrollbar">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] px-4 h-12 w-[280px]">Project Name</TableHead>
                                            <TableHead className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] px-3 h-12">Stream</TableHead>
                                            <TableHead className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] px-3 h-12">Tags</TableHead>
                                            <TableHead className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] px-3 h-12">Progress</TableHead>
                                            <TableHead className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] px-3 h-12 hidden sm:table-cell">Team</TableHead>
                                            <TableHead className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] px-3 h-12 text-right">Tasks</TableHead>
                                            <TableHead className="w-12 px-4"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedProjects.map((proj) => {
                                            const pct = (proj as any).progress ?? 0;
                                            const members: Array<{ id: string; name: string; color: string }> =
                                                (proj as any).memberDetails?.length
                                                    ? (proj as any).memberDetails
                                                    : users.filter((u: any) => proj.members?.includes(u.id));
                                            const stream = streams.find(s => s.id === proj.streamId);
                                            const projectTagsStrings = tags.filter(t => proj.tags?.includes(t.id));

                                            return (
                                                <TableRow key={proj.id} className="group border-border hover:bg-muted/30 transition-all duration-200 cursor-default">
                                                    <TableCell className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 border border-border transition-transform group-hover:scale-105" style={{ backgroundColor: `${proj.color}10` }}>
                                                                <FolderOpen size={16} style={{ color: proj.color }} strokeWidth={2.5} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <Link href={`/board/${proj.id}`} className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors truncate">
                                                                    {proj.title}
                                                                </Link>
                                                                <span className="text-[11px] text-muted-foreground/70 truncate max-w-[200px]">{proj.description || "Tanpa deskripsi"}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        {stream ? (
                                                            <Badge variant="outline" className="rounded-md bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap hidden lg:inline-flex">
                                                                <Ship size={10} className="mr-1 inline-block" />
                                                                {stream.name}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground/40 italic">No Stream</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                                                            {projectTagsStrings.map(t => (
                                                                <Badge key={t.id} variant="outline" className="rounded-md bg-muted text-muted-foreground border-transparent text-[10px] font-semibold px-1.5 py-0 whitespace-nowrap">
                                                                    {t.name}
                                                                </Badge>
                                                            ))}
                                                            {projectTagsStrings.length === 0 && <span className="text-[10px] text-muted-foreground/40 italic">-</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-12 bg-muted/80 rounded-full overflow-hidden shrink-0">
                                                                <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${pct}%`, backgroundColor: proj.color }} />
                                                            </div>
                                                            <span className="text-xs font-semibold tabular-nums" style={{ color: proj.color }}>{pct}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 hidden sm:table-cell">
                                                        <div className="flex -space-x-1.5">
                                                            {members.slice(0, 4).map((u: any) => (
                                                                <Tooltip key={u.id} delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Avatar className="h-6 w-6 ring-2 ring-white shadow-sm hover:-translate-y-0.5 transition-transform shrink-0">
                                                                            <AvatarFallback className="text-[9px] text-primary-foreground font-semibold" style={{ backgroundColor: u.color }}>{getInitials(u.name)}</AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="text-xs font-semibold p-1 px-2 mb-1">{u.name}</TooltipContent>
                                                                </Tooltip>
                                                            ))}
                                                            {members.length > 4 && (
                                                                <Avatar className="h-6 w-6 ring-2 ring-white shadow-sm bg-muted/80 shrink-0">
                                                                    <AvatarFallback className="text-[8px] font-black text-muted-foreground">+{members.length - 4}</AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                            {members.length === 0 && <span className="text-[9px] font-black text-muted-foreground/60 italic">Empty</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs font-semibold text-foreground leading-none tabular-nums">{proj.completedCount}<span className="text-muted-foreground/40 mx-0.5">/</span>{proj.taskCount}</span>
                                                            <span className="text-[9px] text-muted-foreground/70 uppercase tracking-[0.05em] mt-0.5">Tasks</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/80 hover:text-foreground hover:bg-muted/80 rounded-lg transition-all">
                                                                    <MoreHorizontal size={14} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl p-1.5 w-44">
                                                                <DropdownMenuItem onClick={() => setEditProject(proj)} className="rounded-lg gap-3 text-sm font-bold text-foreground/80 focus:bg-muted px-3 py-2">
                                                                    <Pencil size={15} className="text-primary" /> Edit Project
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setDeleteProject(proj)} className="rounded-lg gap-3 text-sm font-bold text-destructive focus:bg-destructive/10 px-3 py-2">
                                                                    <Trash2 size={15} /> Delete Project
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {filteredProjects.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                            <FolderOpen size={32} className="text-slate-200" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-foreground">No projects found</p>
                                                            <p className="text-xs font-normal text-muted-foreground/60">Try changing filters or your search query.</p>
                                                        </div>
                                                        <Button variant="outline" onClick={resetFilters} className="rounded-xl font-medium h-8 px-4 text-xs mt-2 border-border">Reset Search</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination UI */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-8 py-5 bg-muted/30 border-t border-border/60">
                                    <div className="flex items-center gap-2">
                                        <p className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em]">
                                            Page <span className="text-foreground font-medium">{currentPage}</span> of <span className="text-foreground font-medium">{totalPages}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                                        >
                                            <ChevronsLeft size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                                        >
                                            <ChevronLeft size={14} />
                                        </Button>

                                        <div className="flex items-center gap-1 px-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                                // Show only near current page if many pages
                                                if (totalPages > 7) {
                                                    if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                                            return <span key={page} className="text-muted-foreground/40 text-[10px]">...</span>;
                                                        }
                                                        return null;
                                                    }
                                                }

                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            "h-8 min-w-[32px] rounded-lg text-label-medium font-medium transition-all duration-200",
                                                            currentPage === page
                                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                                                                : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                                        >
                                            <ChevronRight size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                                        >
                                            <ChevronsRight size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Create dialog */}
                <ProjectDialog
                    open={showCreate}
                    onOpenChange={setShowCreate}
                    onSave={handleCreate}
                    streams={streams}
                    tags={tags}
                />

                {/* Edit dialog */}
                {editProject && (
                    <ProjectDialog
                        open={!!editProject}
                        onOpenChange={(o) => !o && setEditProject(null)}
                        project={editProject}
                        onSave={handleEdit}
                        streams={streams}
                        tags={tags}
                    />
                )}

                {/* Delete confirmation */}
                {deleteProject && (
                    <DeleteDialog
                        open={!!deleteProject}
                        onOpenChange={(o) => !o && setDeleteProject(null)}
                        projectTitle={deleteProject.title}
                        onConfirm={handleDelete}
                    />
                )}
            </div>
        </TooltipProvider>
    );
}
