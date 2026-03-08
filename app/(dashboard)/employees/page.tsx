"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, MoreVertical, Filter, UserPlus, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Employee {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
    projectTitle?: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch("/api/employees");
                const data = await res.json();
                if (Array.isArray(data)) setEmployees(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) || 
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            <Header breadcrumb={[{ label: "Employees" }]} />
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* Header Sec */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your team members and their roles.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-[280px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <Input 
                                    placeholder="Search employees..." 
                                    className="pl-10 h-10 bg-white border-slate-200 rounded-xl" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 gap-2 font-bold px-4">
                                <Filter size={16} /> Filter
                            </Button>
                            <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-4 shadow-sm">
                                <UserPlus size={16} /> Add Employee
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Card className="p-4 border-slate-200 shadow-sm bg-white">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Members</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-slate-900">{employees.length}</h3>
                                <Badge className="bg-blue-50 text-blue-600 border-none rounded-md px-1.5 py-0.5 text-[10px] font-bold">Active Only</Badge>
                            </div>
                        </Card>
                        <Card className="p-4 border-slate-200 shadow-sm bg-white">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
                            <h3 className="text-2xl font-bold text-slate-900">{employees.filter(e => e.status === 'active').length}</h3>
                        </Card>
                        <Card className="p-4 border-slate-200 shadow-sm bg-white">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">New Hires (30d)</p>
                            <h3 className="text-2xl font-bold text-slate-900">2</h3>
                        </Card>
                    </div>

                    {/* Table View */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest h-11">Name & Role</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest h-11">Contacts</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest h-11">Project</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest h-11">Status</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest h-11">Permission</TableHead>
                                    <TableHead className="w-[50px] h-11"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length > 0 ? filteredEmployees.map((e) => (
                                    <TableRow key={e.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 rounded-xl border border-slate-100 ring-2 ring-white">
                                                    <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
                                                        {getInitials(e.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-slate-900 leading-tight">{e.name}</span>
                                                    <span className="text-[11px] font-medium text-slate-500 mt-0.5">{e.role}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
                                                    <Mail size={12} />
                                                    <span className="text-[11px] font-medium">{e.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Phone size={12} />
                                                    <span className="text-[11px] font-medium">{e.phone || "-"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {e.projectTitle ? (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none text-[10px] h-5">{e.projectTitle}</Badge>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">No Project</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border-none",
                                                e.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {e.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Shield size={14} className="text-slate-400" />
                                                <span className="text-[11px] font-medium">Full Access</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200">
                                                    <DropdownMenuItem className="text-xs font-medium cursor-pointer">Edit Profile</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-medium cursor-pointer">Change Role</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-medium cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">Deactivate</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <p className="text-sm text-slate-400 font-medium">No team members found</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}
