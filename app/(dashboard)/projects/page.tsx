"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import { getInitials } from "@/lib/utils";
import { Plus, FolderOpen, MoreHorizontal, Pencil, Trash2, Ship, Zap, Filter, X } from "lucide-react";
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
            <DialogContent className="sm:max-w-lg rounded-[32px] p-0 overflow-hidden border-slate-200 shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-slate-50/50 border-b border-slate-100">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">{isEdit ? "Edit Proyek" : "Buat Proyek Baru"}</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">Isi detail informasi proyek di bawah ini.</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Proyek *</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth. Website Redesign Q2" className="rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-blue-500 text-sm h-11" autoFocus />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stream *</Label>
                            <Select value={streamId} onValueChange={setStreamId}>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-blue-500 text-sm h-11">
                                    <SelectValue placeholder="Pilih Stream" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {streams.filter(s => s.isActive === "true" || s.id === project?.streamId).map(s => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-lg font-bold text-slate-600 focus:bg-slate-50">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Warna</Label>
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
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tags (Optional)</Label>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-200 min-h-[44px]">
                            {tags.filter(t => t.isActive === "true" || project?.tags?.includes(t.id)).map(t => (
                                <Badge 
                                    key={t.id} 
                                    variant={selectedTags.includes(t.id) ? "default" : "outline"}
                                    onClick={() => toggleTag(t.id)}
                                    className={cn(
                                        "cursor-pointer rounded-lg px-2 py-0.5 text-[9px] font-bold tracking-wider transition-all",
                                        selectedTags.includes(t.id) ? "bg-slate-900 text-white border-transparent" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {t.name}
                                </Badge>
                            ))}
                            {tags.length === 0 && <span className="text-[10px] text-slate-400 font-medium italic">Belum ada tag tersedia</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deskripsi</Label>
                        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Jelaskan tujuan proyek ini..." rows={3} className="rounded-xl border-slate-200 bg-slate-50/50 font-medium focus:ring-blue-500 text-sm resize-none py-3" />
                    </div>
                </div>
                <DialogFooter className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100">
                    <DialogClose asChild><Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-200">Batal</Button></DialogClose>
                    <Button onClick={handleSave} disabled={!title.trim() || !streamId} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 px-6">
                        {isEdit ? "Simpan Perubahan" : "Buat Proyek"}
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
            <DialogContent className="sm:max-w-sm rounded-[32px] p-8 border-slate-200 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">Hapus Proyek</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                        Apakah Anda yakin ingin menghapus proyek <strong className="text-slate-900">{projectTitle}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 gap-2">
                    <DialogClose asChild><Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:text-slate-900 flex-1">Batal</Button></DialogClose>
                    <Button variant="destructive" className="rounded-xl font-bold flex-1 shadow-lg shadow-red-100" onClick={() => { onConfirm(); onOpenChange(false); }}>Hapus</Button>
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

    const fetchAll = async () => {
        try {
            const [pRes, uRes, sRes, tRes] = await Promise.all([
                fetch("/api/projects"),
                fetch("/api/users"),
                fetch("/api/admin/streams"),
                fetch("/api/admin/tags")
            ]);
            const [p, u, s, t] = await Promise.all([pRes.json(), uRes.json(), sRes.json(), tRes.json()]);
            if (Array.isArray(p)) setProjects(p);
            if (Array.isArray(u)) setUsers(u);
            if (Array.isArray(s)) setStreams(s);
            if (Array.isArray(t)) setTags(t);
        } catch (error) {}
    };

    useEffect(() => { fetchAll(); }, []);

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
        return projects.filter(p => {
            const matchesStream = filterStream === "all" || p.streamId === filterStream;
            const matchesTag = filterTag === "all" || p.tags?.includes(filterTag);
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                p.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStream && matchesTag && matchesSearch;
        });
    }, [projects, filterStream, filterTag, searchQuery]);

    const resetFilters = () => {
        setFilterStream("all");
        setFilterTag("all");
        setSearchQuery("");
    };

    const isFiltered = filterStream !== "all" || filterTag !== "all" || searchQuery !== "";

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
                <Header breadcrumb={[{ label: "Proyek" }]} />
                
                <div className="flex-1 overflow-y-auto px-8 py-8">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        {/* Header Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Proyek</h1>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">{filteredProjects.length} proyek ditemukan</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-500 transition-colors" size={14} />
                                    <Input 
                                        placeholder="Cari proyek..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-[240px] rounded-xl border-slate-200 bg-slate-50/50 font-medium focus:ring-blue-500 text-sm h-10 transition-all focus:bg-white" 
                                    />
                                </div>
                                
                                <Select value={filterStream} onValueChange={setFilterStream}>
                                    <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-slate-50/50 font-bold text-sm h-10">
                                        <SelectValue placeholder="Stream" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        <SelectItem value="all" className="rounded-lg font-bold text-slate-600">Semua Stream</SelectItem>
                                        {streams.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="rounded-lg font-bold text-slate-600">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filterTag} onValueChange={setFilterTag}>
                                    <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-slate-50/50 font-bold text-sm h-10">
                                        <SelectValue placeholder="Tag" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        <SelectItem value="all" className="rounded-lg font-bold text-slate-600">Semua Tag</SelectItem>
                                        {tags.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="rounded-lg font-bold text-slate-600">{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {isFiltered && (
                                    <Button variant="ghost" size="icon" onClick={resetFilters} className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 shrink-0">
                                        <X size={16} />
                                    </Button>
                                )}

                                <Separator orientation="vertical" className="h-8 mx-2 hidden md:block" />

                                <Button onClick={() => setShowCreate(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 rounded-xl px-5 h-10">
                                    <Plus size={16} strokeWidth={3} />
                                    <span className="font-bold">Proyek Baru</span>
                                </Button>
                            </div>
                        </div>

                        {/* Project Table Card */}
                        <Card className="rounded-[40px] border-slate-200/60 shadow-sm overflow-hidden bg-white">
                            <div className="overflow-x-auto custom-scrollbar">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 h-14 w-[350px]">Nama Proyek</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-14">Stream</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-14">Tags</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-14">Progress</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-14 hidden sm:table-cell">Team</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-14 text-right">Tasks</TableHead>
                                            <TableHead className="w-12 px-8"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProjects.map((proj) => {
                                            const pct = (proj as any).progress ?? 0;
                                            const members = users.filter((u: any) => proj.members?.includes(u.id));
                                            const stream = streams.find(s => s.id === proj.streamId);
                                            const projectTagsStrings = tags.filter(t => proj.tags?.includes(t.id));

                                            return (
                                                <TableRow key={proj.id} className="group border-slate-50 hover:bg-slate-50/30 transition-all duration-200 cursor-default">
                                                    <TableCell className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border border-slate-100 transition-transform group-hover:scale-105" style={{ backgroundColor: `${proj.color}10` }}>
                                                                <FolderOpen size={18} style={{ color: proj.color }} strokeWidth={2.5} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <Link href={`/board/${proj.id}`} className="text-[14px] font-black text-slate-900 tracking-tight hover:text-blue-600 transition-colors truncate">
                                                                    {proj.title}
                                                                </Link>
                                                                <span className="text-[11px] font-medium text-slate-400 truncate max-w-[200px]">{proj.description || "Tanpa deskripsi"}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        {stream ? (
                                                            <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 whitespace-nowrap">
                                                                <Ship size={10} className="mr-1 inline-block" />
                                                                {stream.name}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-300 italic">No Stream</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                            {projectTagsStrings.map(t => (
                                                                <Badge key={t.id} variant="outline" className="rounded-lg bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black uppercase tracking-widest px-1.5 py-0 whitespace-nowrap">
                                                                    {t.name}
                                                                </Badge>
                                                            ))}
                                                            {projectTagsStrings.length === 0 && <span className="text-[10px] font-bold text-slate-300 italic">-</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                                                <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${pct}%`, backgroundColor: proj.color }} />
                                                            </div>
                                                            <span className="text-[12px] font-black tracking-tighter w-8" style={{ color: proj.color }}>{pct}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 hidden sm:table-cell">
                                                        <div className="flex -space-x-2">
                                                            {members.slice(0, 4).map((u: any) => (
                                                                <Tooltip key={u.id} delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm hover:-translate-y-0.5 transition-transform shrink-0">
                                                                            <AvatarFallback className="text-[9px] text-white font-black" style={{ backgroundColor: u.color }}>{getInitials(u.name)}</AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="text-[10px] font-bold p-1 px-2 mb-1">{u.name}</TooltipContent>
                                                                </Tooltip>
                                                            ))}
                                                            {members.length > 4 && (
                                                                <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm bg-slate-100 shrink-0">
                                                                    <AvatarFallback className="text-[9px] font-black text-slate-500">+{members.length - 4}</AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                            {members.length === 0 && <span className="text-[10px] font-bold text-slate-300 italic">Empty</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-5 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[13px] font-black text-slate-900 tracking-tighter leading-none">{proj.completedCount}<span className="text-slate-300 mx-0.5">/</span>{proj.taskCount}</span>
                                                            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-0.5">Tugas</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-5 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                                    <MoreHorizontal size={14} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl p-1.5 w-44">
                                                                <DropdownMenuItem onClick={() => setEditProject(proj)} className="rounded-lg gap-3 text-sm font-bold text-slate-600 focus:bg-slate-50 px-3 py-2">
                                                                    <Pencil size={15} className="text-blue-500" /> Edit Proyek
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setDeleteProject(proj)} className="rounded-lg gap-3 text-sm font-bold text-red-500 focus:bg-red-50 px-3 py-2">
                                                                    <Trash2 size={15} /> Hapus Proyek
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
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                            <FolderOpen size={32} className="text-slate-200" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-slate-900">Tidak ada proyek ditemukan</p>
                                                            <p className="text-xs font-medium text-slate-400">Coba ubah filter atau lakukan pencarian lain.</p>
                                                        </div>
                                                        <Button variant="outline" onClick={resetFilters} className="rounded-xl font-bold h-9 px-4 text-xs mt-2 border-slate-200">Reset Search</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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
