"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, MoreVertical, Filter, UserPlus, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Employee {
    id: string;
    name: string;
    role: string;
    roleId?: number;
    email: string;
    phone: string;
    status: "active" | "inactive";
    projectTitle?: string;
    streams?: Array<{ id: string; name: string; code: string }>;
    hierarchyLevel?: string;
    organizationUnit?: string;
}

interface Stream {
    id: string;
    name: string;
    code: string;
}

interface Role {
    id: number;
    roleCode: string;
    roleName: string;
    hierarchyLevel: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editor, setEditor] = useState<Partial<Employee & { streamIds?: string[] }> | null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchEmployees = async (pageNum = page) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/employees?page=${pageNum}&limit=${limit}`);
            const json = await res.json();
            if (json.data) {
                setEmployees(json.data);
                setMeta(json.meta);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [page, limit]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [streamsRes, rolesRes] = await Promise.all([
                    fetch("/api/admin/streams?limit=100"),
                    fetch("/api/admin/roles")
                ]);
                
                const streamsData = await streamsRes.json();
                if (streamsData.data) setStreams(streamsData.data);
                else if (Array.isArray(streamsData)) setStreams(streamsData);

                const rolesData = await rolesRes.json();
                if (Array.isArray(rolesData)) setRoles(rolesData);
            } catch (e) {}
        };
        fetchMetadata();
    }, []);

    const handleLimitChange = (val: string) => {
        setLimit(parseInt(val));
        setPage(1);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");
        const isEdit = !!editor?.id;
        const url = isEdit ? `/api/employees/${editor.id}` : "/api/employees";
        const method = isEdit ? "PUT" : "POST";
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editor),
            });
            const data = await res.json();
            if (res.ok) {
                fetchEmployees();
                setShowModal(false);
                setEditor(null);
            } else {
                setErrorMsg(data.error || "Failed to save. Please try again.");
            }
        } catch (error) {
            setErrorMsg("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/employees/${deleteTarget.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchEmployees();
                setDeleteTarget(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleStatus = async (emp: Employee) => {
        const newStatus = emp.status === "active" ? "inactive" : "active";
        try {
            await fetch(`/api/employees/${emp.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...emp, status: newStatus, streamIds: emp.streams?.map(s => s.id) || [] }),
            });
            fetchEmployees();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredEmployees = employees.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) || 
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-muted/50">
            <Header breadcrumb={[{ label: "Employees" }]} />
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* Header Sec */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-headline-medium text-foreground">Employee Directory</h1>
                            <p className="text-body-medium text-muted-foreground/60">Manage your team members and their roles.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-[280px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                                <Input 
                                    placeholder="Search employees..." 
                                    className="pl-10 h-10 bg-card border-border rounded-xl text-label-medium font-medium" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-10 rounded-xl border-border gap-2 font-medium text-label-medium px-4">
                                <Filter size={16} /> Filter
                            </Button>
                            <Button 
                                onClick={() => { setEditor({ name: "", roleId: undefined, email: "", phone: "", status: "active", organizationUnit: "" }); setShowModal(true); }}
                                className="h-10 rounded-xl bg-primary hover:bg-primary/90 !text-white gap-2 font-medium text-label-large px-4 shadow-sm"
                            >
                                <UserPlus size={16} className="text-white" /> Add Employee
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Card className="p-4 border-border shadow-sm bg-card">
                            <p className="text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em] mb-1">Total Members</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-headline-small font-medium text-foreground">{employees.length}</h3>
                                <Badge className="bg-primary/10 text-primary border-none rounded-md px-1.5 py-0.5 text-label-small font-medium shadow-none">Active Only</Badge>
                            </div>
                        </Card>
                        <Card className="p-4 border-border shadow-sm bg-card">
                            <p className="text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em] mb-1">Active Now</p>
                            <h3 className="text-headline-small font-medium text-foreground">{employees.filter(e => e.status === 'active').length}</h3>
                        </Card>
                        <Card className="p-4 border-border shadow-sm bg-card">
                            <p className="text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em] mb-1">New Hires (30d)</p>
                            <h3 className="text-headline-small font-medium text-foreground">2</h3>
                        </Card>
                    </div>

                    {/* Table View */}
                    <Card className="border-border shadow-sm overflow-hidden bg-card">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Name & Role</TableHead>
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Contacts</TableHead>
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Hierarchy</TableHead>
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Accessible Streams</TableHead>
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Status</TableHead>
                                    <TableHead className="w-[50px] h-11"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length > 0 ? filteredEmployees.map((e) => (
                                    <TableRow key={e.id} className="border-border hover:bg-muted/30 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 shadow-sm border border-border">
                                                    <AvatarFallback className="bg-secondary text-primary-foreground font-bold text-xs">
                                                        {getInitials(e.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-body-medium font-medium text-foreground leading-tight">{e.name}</span>
                                                    <span className="text-body-small text-muted-foreground/60 mt-0.5">{e.role} {e.organizationUnit ? `• ${e.organizationUnit}` : ""}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                                                    <Mail size={12} className="opacity-40 group-hover:opacity-100" />
                                                    <span className="text-label-small font-medium">{e.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground/50">
                                                    <Phone size={12} className="opacity-30" />
                                                    <span className="text-label-small font-medium">{e.phone || "-"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {e.hierarchyLevel ? (
                                                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                                                    <Shield size={14} className="opacity-40" />
                                                    <span className="text-label-small font-medium">{e.hierarchyLevel}</span>
                                                </div>
                                            ) : (
                                                <span className="text-label-small text-muted-foreground/40 italic">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {e.streams && e.streams.length > 0 ? e.streams.map(s => (
                                                    <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                                                        {s.code || s.name}
                                                    </span>
                                                )) : (
                                                    <span className="text-label-small text-muted-foreground/40 italic">No streams</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold",
                                                e.status === "active"
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                <span className={cn("w-1.5 h-1.5 rounded-full", e.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                                                {e.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/80 hover:text-foreground"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44 rounded-xl border-border">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditor({ ...e, streamIds: e.streams?.map(s => s.id) || [] });
                                                            setShowModal(true);
                                                        }}
                                                        className="text-xs font-medium cursor-pointer"
                                                    >
                                                        ✏️ Edit Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(e)}
                                                        className="text-xs font-medium cursor-pointer"
                                                    >
                                                        {e.status === "active" ? "⏸ Deactivate" : "▶ Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteTarget(e)}
                                                        className="text-xs font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive/90"
                                                    >
                                                        🗑 Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-20 text-center">
                                            <p className="text-sm text-muted-foreground/80 font-medium">No team members found</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                                Showing <span className="text-foreground">{employees.length}</span> of <span className="text-foreground">{meta.total}</span> employees
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Rows per page</span>
                                <Select value={limit.toString()} onValueChange={handleLimitChange}>
                                    <SelectTrigger className="h-8 w-[70px] rounded-lg border-border bg-card text-[11px] font-bold focus:ring-0 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border shadow-xl">
                                        {[5, 10, 20, 50].map(v => (
                                            <SelectItem key={v} value={v.toString()} className="text-[11px] font-bold rounded-lg">{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl border-border bg-card shadow-sm hover:bg-muted"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <div className="bg-card border border-border rounded-xl h-10 px-4 flex items-center justify-center text-xs font-black min-w-[50px] shadow-sm">
                                {page} / {meta.totalPages}
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl border-border bg-card shadow-sm hover:bg-muted"
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md rounded-[32px] border-border shadow-2xl p-0 overflow-hidden">
                    <form onSubmit={handleSave}>
                        <DialogHeader className="p-8 pb-4 bg-muted/50">
                            <DialogTitle className="text-xl font-black text-foreground tracking-tight">{editor?.id ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground">Manage employee details and hierarchy assignment.</DialogDescription>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest pl-1">Full Name *</Label>
                                <Input 
                                    value={editor?.name || ""} 
                                    onChange={e => setEditor({...editor, name: e.target.value})} 
                                    placeholder="John Doe" 
                                    className="rounded-xl border-border bg-muted/50 font-bold focus:ring-blue-500 text-sm h-11"
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest pl-1">Email *</Label>
                                    <Input 
                                        type="email"
                                        value={editor?.email || ""} 
                                        onChange={e => setEditor({...editor, email: e.target.value})} 
                                        placeholder="john@example.com" 
                                        className="rounded-xl border-border bg-muted/50 font-bold focus:ring-blue-500 text-sm h-11"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest pl-1">Phone</Label>
                                    <Input 
                                        value={editor?.phone || ""} 
                                        onChange={e => setEditor({...editor, phone: e.target.value})} 
                                        placeholder="+62..." 
                                        className="rounded-xl border-border bg-muted/50 font-bold focus:ring-blue-500 text-sm h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest pl-1">Role *</Label>
                                    <Select 
                                        value={editor?.roleId?.toString()} 
                                        onValueChange={v => setEditor({...editor, roleId: parseInt(v)})}
                                    >
                                        <SelectTrigger className="rounded-xl border-border bg-muted/50 font-bold text-sm h-11">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border shadow-xl">
                                            {roles.map(r => (
                                                <SelectItem key={r.id} value={r.id.toString()} className="text-sm font-medium">
                                                    {r.roleName} ({r.hierarchyLevel})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest pl-1">Organization Unit</Label>
                                    <Input 
                                        value={editor?.organizationUnit || ""} 
                                        onChange={e => setEditor({...editor, organizationUnit: e.target.value})} 
                                        placeholder="e.g. Finance, Ops" 
                                        className="rounded-xl border-border bg-muted/50 font-bold focus:ring-blue-500 text-sm h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest pl-1">Stream Access Permissions</Label>
                                <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                                    <p className="text-[11px] text-muted-foreground font-medium leading-tight">Select streams this employee is authorized to view:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {streams.map(s => {
                                            const isSelected = (editor?.streamIds || []).includes(s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = editor?.streamIds || [];
                                                        const next = isSelected 
                                                            ? current.filter(id => id !== s.id)
                                                            : [...current, s.id];
                                                        setEditor({ ...editor, streamIds: next });
                                                    }}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                                                        isSelected 
                                                            ? "bg-primary text-white border-primary shadow-sm" 
                                                            : "bg-card text-muted-foreground border-border hover:border-primary/30"
                                                    )}
                                                >
                                                    {s.name}
                                                </button>
                                            );
                                        })}
                                        {streams.length === 0 && <span className="text-xs text-muted-foreground italic">No streams available</span>}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/50 italic">If no streams are selected, the employee will have restricted views.</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-4 bg-muted/50 border-t border-border">
                            {errorMsg && <p className="text-xs text-destructive font-semibold w-full mb-1">{errorMsg}</p>}
                            <DialogClose asChild>
                                <Button type="button" variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:text-foreground">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={saving} className="rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-blue-100 px-6">
                                {saving ? "Saving..." : "Save Employee"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm rounded-[24px] border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-foreground">Delete Employee</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-xl font-bold">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleDelete}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-sm"
                        >
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
