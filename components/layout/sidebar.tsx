"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, UserCheck, Calendar, Contact, Inbox, ChevronDown, Zap, PanelLeftClose, PanelLeftOpen, LogOut, User, Layout, Briefcase, Ship, Clock, HelpCircle, Settings, Crown, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MENU_MAIN = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/inbox", icon: Inbox, label: "Inbox", badge: 5 },
];

const MENU_PROJECT = [
    { href: "/projects", icon: Briefcase, label: "Project" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
];

const MENU_OTHERS = [
    { href: "/employees", icon: UserCheck, label: "Employee" },
    { href: "/contact", icon: Contact, label: "Contact" },
    { href: "/help", icon: HelpCircle, label: "Help Center" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

const MENU_ADMIN = [
    { href: "/admin/streams", icon: Ship, label: "Master Stream" },
    { href: "/admin/tags", icon: Zap, label: "Master Tag" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [projOpen, setProjOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [projects, setProjects] = useState<Array<{ id: string; title: string; color: string; taskCount: number; completedCount: number }>>([]);

    useEffect(() => {
        const fetchProjects = () => {
            fetch("/api/projects")
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setProjects(data); })
                .catch(() => { });
        };

        fetchProjects();

        // 1. Polling every 10 seconds
        const interval = setInterval(fetchProjects, 10000);

        // 2. Custom event listener for immediate refresh
        window.addEventListener("refresh-projects", fetchProjects);

        return () => {
            clearInterval(interval);
            window.removeEventListener("refresh-projects", fetchProjects);
        };
    }, []);

    return (
        <aside className={cn(
            "flex flex-col h-full flex-shrink-0 bg-card border-r border-border transition-all duration-300 ease-in-out shadow-sm relative",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header & Toggle */}
            <div className={cn("flex items-center h-16 px-4 transition-all", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                            <Layout size={14} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-lg font-bold text-slate-900 tracking-tight block truncate">Worktion</span>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                        <Layout size={14} className="text-white" />
                    </div>
                )}

                {/* Toggle Floating Button if Not Collapsed, inline if collapsed */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isCollapsed ? "absolute -right-4 top-5 bg-background border shadow-sm rounded-full z-10" : "shrink-0"
                    )}
                >
                    {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={18} />}
                </Button>
            </div>

            <Separator className="bg-border" />

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1.5 px-3 custom-scrollbar">
                {/* Main Menu Section */}
                {!isCollapsed && (
                    <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-2 mb-1">Main Menu</span>
                )}
                <div className="space-y-1">
                    {MENU_MAIN.map(({ href, icon: Icon, label, badge }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        const NavLinkComponent = (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center rounded-lg text-[13px] font-medium transition-all duration-200",
                                    isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                    active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                                {!isCollapsed && (
                                    <>
                                        <span className="truncate flex-1">{label}</span>
                                        {badge && <span className="ml-auto bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md min-w-[17px] text-center">{badge}</span>}
                                    </>
                                )}
                            </Link>
                        );
                        return isCollapsed ? (
                            <Tooltip key={href} delayDuration={0}>
                                <TooltipTrigger asChild>{NavLinkComponent}</TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                            </Tooltip>
                        ) : NavLinkComponent;
                    })}
                </div>

                {/* Project Section */}
                <div className="pt-4">
                    {!isCollapsed && (
                        <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Project</span>
                    )}
                    <div className="space-y-1">
                        {MENU_PROJECT.map(({ href, icon: Icon, label }) => {
                            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                            const NavLinkComponent = (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center rounded-lg text-[13px] font-medium transition-all duration-200",
                                        isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                        active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                                    {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                                </Link>
                            );
                            return isCollapsed ? (
                                <Tooltip key={href} delayDuration={0}>
                                    <TooltipTrigger asChild>{NavLinkComponent}</TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                                </Tooltip>
                            ) : NavLinkComponent;
                        })}
                        
                        {!isCollapsed && (
                            <div className="pt-2 space-y-1 ml-3 border-l border-slate-100 pl-2">
                                {projects.map((proj) => (
                                    <Link 
                                        key={proj.id} 
                                        href={`/board/${proj.id}`}
                                        className={cn(
                                            "flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg group transition-colors",
                                            pathname.startsWith(`/board/${proj.id}`) && "bg-slate-50 shadow-sm"
                                        )}
                                    >
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                                        <span className={cn(
                                            "text-[12px] font-medium group-hover:text-slate-900 flex-1 truncate",
                                            pathname.startsWith(`/board/${proj.id}`) ? "text-slate-900 font-bold" : "text-slate-500"
                                        )}>
                                            {proj.title}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 group-hover:text-slate-400">
                                            {proj.taskCount}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {isCollapsed && (
                            <div className="pt-2 space-y-2 flex flex-col items-center">
                                {projects.map((proj) => (
                                    <Tooltip key={proj.id} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link href={`/board/${proj.id}`}>
                                                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: proj.color }} />
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="font-medium">{proj.title}</TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Others Section */}
                <div className="pt-4">
                    {!isCollapsed && (
                        <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Others</span>
                    )}
                    <div className="space-y-1">
                        {MENU_OTHERS.map(({ href, icon: Icon, label }) => {
                            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                            const NavLinkComponent = (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center rounded-lg text-[13px] font-medium transition-all duration-200",
                                        isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                        active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                                    {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                                </Link>
                            );
                            return isCollapsed ? (
                                <Tooltip key={href} delayDuration={0}>
                                    <TooltipTrigger asChild>{NavLinkComponent}</TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                                </Tooltip>
                            ) : NavLinkComponent;
                        })}
                    </div>
                </div>

                {/* Admin Section */}
                {user?.role === "admin" && (
                    <div className="pt-4">
                        {!isCollapsed && (
                            <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Admin</span>
                        )}
                        <div className="space-y-1">
                            {MENU_ADMIN.map(({ href, icon: Icon, label }) => {
                                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                                const NavLinkComponent = (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            "flex items-center rounded-lg text-[13px] font-medium transition-all duration-200",
                                            isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                            active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                                        {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                                    </Link>
                                );
                                return isCollapsed ? (
                                    <Tooltip key={href} delayDuration={0}>
                                        <TooltipTrigger asChild>{NavLinkComponent}</TooltipTrigger>
                                        <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                                    </Tooltip>
                                ) : NavLinkComponent;
                            })}
                        </div>
                    </div>
                )}
            </nav>

            <Separator className="bg-muted" />

            {/* User Dropdown */}
            <div className={cn("p-3", isCollapsed && "flex justify-center")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "flex items-center rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isCollapsed ? "justify-center p-1.5" : "w-full p-2 gap-3 text-left"
                        )}>
                            <Avatar className={cn("shrink-0 shadow-sm", isCollapsed ? "h-9 w-9" : "h-9 w-9")}>
                                <AvatarFallback
                                    className="text-xs font-bold text-white bg-slate-800"
                                >
                                    {user ? getInitials(user.name) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                                        {user?.name || "Loading..."}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-medium truncate capitalize mt-0.5">
                                        {user?.role || ""}
                                    </p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={8} className="w-56 rounded-xl shadow-lg border-border p-1.5 origin-bottom-left">
                        <DropdownMenuLabel className="font-semibold text-foreground">Akun Saya</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem className="cursor-pointer rounded-lg font-medium text-foreground focus:bg-muted focus:text-foreground" onClick={() => setPrefsOpen(true)}>
                            <User className="mr-2.5 h-4 w-4 text-muted-foreground" /> Preferences
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg font-medium text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => setLogoutOpen(true)}>
                            <LogOut className="mr-2.5 h-4 w-4 text-red-500" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* -- Logout Modal -- */}
            <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
                    <div className="p-6 pt-8 pb-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                            <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">Konfirmasi Keluar</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-[15px] leading-relaxed">
                            Apakah Anda yakin ingin keluar dari sesi saat ini? Anda harus masuk kembali untuk mengakses Dashboard KPI.
                        </DialogDescription>
                    </div>
                    <div className="bg-muted/50 p-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                        <Button variant="outline" className="w-full sm:w-auto font-semibold bg-card border-border text-foreground hover:bg-muted" onClick={() => setLogoutOpen(false)}>Batal</Button>
                        <Button variant="destructive" className="w-full sm:w-auto font-semibold bg-red-600 hover:bg-red-700 shadow-sm" onClick={async () => {
                            await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
                            setLogoutOpen(false);
                            router.push("/login");
                        }}>Ya, Keluar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* -- Preferences Modal -- */}
            <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl gap-0 p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <Settings className="w-5 h-5 text-muted-foreground" /> User Preferences
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1.5">
                            Atur preferensi akun dan personalisasi Dashboard KPI Anda di sini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6 bg-muted/50/50">
                        {/* Profile Sec */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Profil Singkat</h4>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-foreground font-medium">Nama Lengkap</Label>
                                    <Input defaultValue={user?.name || ""} className="bg-card border-border shadow-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-foreground font-medium">Email</Label>
                                    <Input defaultValue={user?.email || ""} disabled className="bg-muted border-border text-muted-foreground shadow-none cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-200" />

                        {/* Region & Formats */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Regional & Format</h4>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-foreground font-medium">Zona Waktu</Label>
                                    <Select defaultValue="wib">
                                        <SelectTrigger className="bg-card border-border shadow-sm">
                                            <SelectValue placeholder="Pilih Zona Waktu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="wib">Waktu Indonesia Barat (WIB)</SelectItem>
                                            <SelectItem value="wita">Waktu Indonesia Tengah (WITA)</SelectItem>
                                            <SelectItem value="wit">Waktu Indonesia Timur (WIT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t border-border bg-card">
                        <Button className="w-full sm:w-auto font-semibold bg-primary hover:bg-emerald-700 shadow-sm" onClick={() => setPrefsOpen(false)}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
