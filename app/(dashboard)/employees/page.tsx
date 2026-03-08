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
                            <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 !text-white gap-2 font-medium text-label-large px-4 shadow-sm">
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
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Project</TableHead>
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Status</TableHead>
                                    <TableHead className="text-label-medium text-muted-foreground/60 uppercase tracking-[0.1em] h-11">Permission</TableHead>
                                    <TableHead className="w-[50px] h-11"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length > 0 ? filteredEmployees.map((e) => (
                                    <TableRow key={e.id} className="border-border hover:bg-muted/30 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 rounded-xl border border-border ring-2 ring-white">
                                                    <AvatarFallback className="bg-secondary text-primary-foreground font-bold text-xs">
                                                        {getInitials(e.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-body-medium font-medium text-foreground leading-tight">{e.name}</span>
                                                    <span className="text-body-small text-muted-foreground/60 mt-0.5">{e.role}</span>
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
                                            {e.projectTitle ? (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-label-small font-medium h-5 rounded-md shadow-none">{e.projectTitle}</Badge>
                                            ) : (
                                                <span className="text-label-small text-muted-foreground/40 italic">No Project</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-full px-2 py-0.5 text-label-small font-medium uppercase tracking-[0.05em] border-none shadow-none",
                                                e.status === 'active' ? "bg-primary/20 text-primary" : "bg-muted/80 text-muted-foreground"
                                            )}>
                                                {e.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground/60">
                                                <Shield size={14} className="opacity-40" />
                                                <span className="text-label-small font-medium">Full Access</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/80 hover:text-foreground"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-border">
                                                    <DropdownMenuItem className="text-xs font-medium cursor-pointer">Edit Profile</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-medium cursor-pointer">Change Role</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive/90">Deactivate</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <p className="text-sm text-muted-foreground/80 font-medium">No team members found</p>
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
