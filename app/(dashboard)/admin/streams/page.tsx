"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Plus, MoreHorizontal, Pencil, Trash2, Ship, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Stream {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isActive: "true" | "false";
    sortOrder: string;
    createdAt: string;
}

export default function MasterStreamPage() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editor, setEditor] = useState<Partial<Stream> | null>(null);

    const fetchStreams = async () => {
        try {
            const res = await fetch("/api/admin/streams");
            const data = await res.json();
            if (Array.isArray(data)) setStreams(data);
        } catch (error) {} finally { setLoading(false); }
    };

    useEffect(() => { fetchStreams(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = !!editor?.id;
        const url = isEdit ? `/api/admin/streams/${editor.id}` : "/api/admin/streams";
        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editor),
            });
            if (res.ok) {
                fetchStreams();
                setShowModal(false);
                setEditor(null);
            }
        } catch (error) {}
    };

    const toggleActive = async (stream: Stream) => {
        try {
            const res = await fetch(`/api/admin/streams/${stream.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...stream, isActive: stream.isActive === "true" ? "false" : "true" }),
            });
            if (res.ok) fetchStreams();
        } catch (error) {}
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stream? It will be marked as inactive.")) return;
        try {
            const res = await fetch(`/api/admin/streams/${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchStreams();
        } catch (error) {}
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            <Header breadcrumb={[{ label: "Admin" }, { label: "Master Stream" }]} />
            
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Stream</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">Manage project categorization streams</p>
                        </div>
                        <Button onClick={() => { setEditor({ code: "", name: "", description: "", sortOrder: "0" }); setShowModal(true); }} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 rounded-xl px-5">
                            <Plus size={16} strokeWidth={3} />
                            <span className="font-bold">Add Stream</span>
                        </Button>
                    </div>

                    <Card className="rounded-[24px] border-slate-200/60 shadow-sm overflow-hidden bg-white">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12">Code</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12">Name</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12">Status</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12">Order</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {streams.map((s) => (
                                    <TableRow key={s.id} className="group border-slate-50 hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="px-6 py-4 font-bold text-slate-900 text-sm mono tracking-tight">{s.code}</TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                                                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[300px]">{s.description || "No description"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="outline" onClick={() => toggleActive(s)} className={cn(
                                                "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all",
                                                s.isActive === "true" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                            )}>
                                                {s.isActive === "true" ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm font-bold text-slate-500">{s.sortOrder}</TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                                                        <MoreHorizontal size={14} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl p-1.5 w-40">
                                                    <DropdownMenuItem onClick={() => { setEditor(s); setShowModal(true); }} className="rounded-lg gap-2 text-sm font-bold text-slate-600 focus:bg-slate-50">
                                                        <Pencil size={14} /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleActive(s)} className="rounded-lg gap-2 text-sm font-bold text-slate-600 focus:bg-slate-50">
                                                        <Info size={14} /> Toggle Status
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(s.id)} className="rounded-lg gap-2 text-sm font-bold text-red-600 focus:bg-red-50">
                                                        <Trash2 size={14} /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md rounded-[32px] border-slate-200 shadow-2xl p-0 overflow-hidden">
                    <form onSubmit={handleSave}>
                        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
                            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">{editor?.id ? "Edit Stream" : "New Stream"}</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500">Configure master stream data for projects.</DialogDescription>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stream Code *</Label>
                                    <Input 
                                        value={editor?.code || ""} 
                                        onChange={e => setEditor({...editor, code: e.target.value.toUpperCase().replace(/\s/g, "_")})} 
                                        placeholder="EP_PEMBANGKIT" 
                                        className="rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-blue-500 text-sm mono h-11"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sort Order</Label>
                                    <Input 
                                        type="number"
                                        value={editor?.sortOrder || "0"} 
                                        onChange={e => setEditor({...editor, sortOrder: e.target.value})} 
                                        className="rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-blue-500 text-sm h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stream Name *</Label>
                                <Input 
                                    value={editor?.name || ""} 
                                    onChange={e => setEditor({...editor, name: e.target.value})} 
                                    placeholder="EP & Pembangkit" 
                                    className="rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:ring-blue-500 text-sm h-11"
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</Label>
                                <Textarea 
                                    value={editor?.description || ""} 
                                    onChange={e => setEditor({...editor, description: e.target.value})} 
                                    placeholder="Brief explanation of this stream..." 
                                    className="rounded-xl border-slate-200 bg-slate-50/50 font-medium focus:ring-blue-500 text-sm min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost" className="rounded-xl font-bold text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-200">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 px-6">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
