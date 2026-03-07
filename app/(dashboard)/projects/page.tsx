"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import { mockProjects as initialProjects, mockUsers } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { Plus, FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Project } from "@/lib/types";

const PROJECT_COLORS = ["#c27c3e", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#06b6d4"];

/* ── Create/Edit Project Dialog ── */
function ProjectDialog({ open, onOpenChange, project, onSave }: {
    open: boolean; onOpenChange: (o: boolean) => void;
    project?: Project; onSave: (data: { title: string; description: string; color: string }) => void;
}) {
    const [title, setTitle] = useState(project?.title || "");
    const [desc, setDesc] = useState(project?.description || "");
    const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
    const isEdit = !!project;

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({ title: title.trim(), description: desc, color });
        if (!isEdit) { setTitle(""); setDesc(""); setColor(PROJECT_COLORS[0]); }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Proyek" : "Buat Proyek Baru"}</DialogTitle>
                    <DialogDescription>{isEdit ? "Ubah informasi proyek." : "Tentukan nama, deskripsi, dan warna proyek Anda."}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div><Label className="text-xs">Nama Proyek *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth. Website Redesign Q2" className="mt-1.5" autoFocus /></div>
                    <div><Label className="text-xs">Deskripsi</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Jelaskan tujuan proyek ini..." rows={3} className="mt-1.5 resize-none" /></div>
                    <div>
                        <Label className="text-xs">Warna</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {PROJECT_COLORS.map((c) => (
                                <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full transition-all duration-150" style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : "2px solid transparent", outlineOffset: "3px" }} />
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                    <Button onClick={handleSave} disabled={!title.trim()} style={!isEdit ? { backgroundColor: color } : undefined}>
                        {isEdit ? "Simpan" : "Buat Proyek"}
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
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Hapus Proyek</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus proyek <strong>{projectTitle}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                    <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>Hapus Proyek</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [showCreate, setShowCreate] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [deleteProject, setDeleteProject] = useState<Project | null>(null);

    const handleCreate = (data: { title: string; description: string; color: string }) => {
        const newProj: Project = {
            id: `p_${Date.now()}`, title: data.title, description: data.description, color: data.color,
            members: ["u1"], taskCount: 0, completedCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        setProjects((prev) => [...prev, newProj]);
    };

    const handleEdit = (data: { title: string; description: string; color: string }) => {
        if (!editProject) return;
        setProjects((prev) => prev.map((p) => p.id === editProject.id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
        setEditProject(null);
    };

    const handleDelete = () => {
        if (!deleteProject) return;
        setProjects((prev) => prev.filter((p) => p.id !== deleteProject.id));
        setDeleteProject(null);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header breadcrumb={[{ label: "Proyek" }]} />
            <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Proyek</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{projects.length} proyek aktif</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="gap-1.5 shadow-sm"><Plus size={14} /> Proyek Baru</Button>
                </div>

                <div className="p-6">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">Nama</TableHead>
                                        <TableHead className="text-xs hidden md:table-cell">Deskripsi</TableHead>
                                        <TableHead className="text-xs">Progress</TableHead>
                                        <TableHead className="text-xs hidden sm:table-cell">Anggota</TableHead>
                                        <TableHead className="text-xs text-right">Tugas</TableHead>
                                        <TableHead className="w-8"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((proj) => {
                                        const pct = proj.taskCount > 0 ? Math.round((proj.completedCount / proj.taskCount) * 100) : 0;
                                        const members = mockUsers.filter((u) => proj.members.includes(u.id));
                                        return (
                                            <TableRow key={proj.id} className="cursor-pointer group">
                                                <TableCell>
                                                    <Link href={`/board/${proj.id}`} className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
                                                            <FolderOpen size={14} style={{ color: proj.color }} />
                                                        </div>
                                                        <span className="text-sm font-medium">{proj.title}</span>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">{proj.description}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3 min-w-[120px]">
                                                        <Progress value={pct} className="h-1.5 w-16 sm:w-20 flex-shrink-0" />
                                                        <span className="text-sm font-semibold mono" style={{ color: proj.color }}>{pct}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="flex -space-x-1.5">
                                                        {members.slice(0, 5).map((u) => (
                                                            <Avatar key={u.id} className="h-6 w-6 ring-2 ring-card">
                                                                <AvatarFallback className="text-[9px] text-white font-semibold" style={{ backgroundColor: u.color }}>{getInitials(u.name)}</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {members.length > 5 && (
                                                            <Avatar className="h-6 w-6 ring-2 ring-card"><AvatarFallback className="text-[9px]">+{members.length - 5}</AvatarFallback></Avatar>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-sm mono">{proj.completedCount}<span className="text-muted-foreground">/{proj.taskCount}</span></span>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal size={14} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setEditProject(proj)} className="gap-2">
                                                                <Pencil size={13} /> Edit Proyek
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setDeleteProject(proj)} className="gap-2 text-destructive focus:text-destructive">
                                                                <Trash2 size={13} /> Hapus Proyek
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create dialog */}
            <ProjectDialog open={showCreate} onOpenChange={setShowCreate} onSave={handleCreate} />

            {/* Edit dialog */}
            {editProject && (
                <ProjectDialog open={!!editProject} onOpenChange={(o) => !o && setEditProject(null)} project={editProject} onSave={handleEdit} />
            )}

            {/* Delete confirmation */}
            {deleteProject && (
                <DeleteDialog open={!!deleteProject} onOpenChange={(o) => !o && setDeleteProject(null)} projectTitle={deleteProject.title} onConfirm={handleDelete} />
            )}
        </div>
    );
}
