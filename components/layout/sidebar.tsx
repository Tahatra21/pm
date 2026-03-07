"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, CheckSquare, Settings, ChevronDown, Zap, PanelLeftClose, PanelLeftOpen, LogOut, User } from "lucide-react";
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

const NAV = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/projects", icon: FolderOpen, label: "Proyek" },
    { href: "/my-tasks", icon: CheckSquare, label: "Tugas Saya" },
    { href: "/settings", icon: Settings, label: "Pengaturan" },
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
                .catch(() => {});
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
            "flex flex-col h-full flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm relative",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header & Toggle */}
            <div className={cn("flex items-center h-16 px-4 transition-all", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                            <Zap size={14} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-bold text-slate-900 tracking-tight block truncate">KPI Dashboard</span>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                        <Zap size={14} className="text-white" />
                    </div>
                )}

                {/* Toggle Floating Button if Not Collapsed, inline if collapsed */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                        isCollapsed ? "absolute -right-4 top-5 bg-white border shadow-sm rounded-full z-10" : "shrink-0"
                    )}
                >
                    {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={18} />}
                </Button>
            </div>

            <Separator className="bg-slate-100" />

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1.5 px-3 custom-scrollbar">
                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));

                    const NavLink = (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                                isCollapsed ? "justify-center px-0 py-2.5 h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
                                active
                                    ? "bg-slate-100 text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon
                                size={isCollapsed ? 20 : 18}
                                className={cn("shrink-0 transition-colors", active ? "text-emerald-600" : "text-slate-500")}
                            />
                            {!isCollapsed && <span className="truncate">{label}</span>}
                        </Link>
                    );

                    if (isCollapsed) {
                        return (
                            <Tooltip key={href} delayDuration={0}>
                                <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                            </Tooltip>
                        );
                    }
                    return NavLink;
                })}

                {/* Projects section */}
                <div className="pt-6">
                    {!isCollapsed ? (
                        <button
                            onClick={() => setProjOpen((v) => !v)}
                            className="flex items-center justify-between w-full px-3 py-1.5 mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            <span>Proyek Aktif</span>
                            <ChevronDown
                                size={14}
                                className={cn("transition-transform duration-200", !projOpen && "-rotate-90")}
                            />
                        </button>
                    ) : (
                        <div className="flex justify-center mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROYEK</span>
                        </div>
                    )}

                    {(projOpen || isCollapsed) && (
                        <div className="space-y-1">
                            {projects.map((proj) => {
                                const active = pathname.includes(proj.id);
                                const pct = (proj as any).progress ?? 0;

                                const ProjLink = (
                                    <Link
                                        key={proj.id}
                                        href={`/board/${proj.id}`}
                                        className={cn(
                                            "flex items-center rounded-lg text-[13px] transition-all duration-200",
                                            isCollapsed ? "justify-center px-0 py-2 h-11 w-11 mx-auto" : "gap-3 px-3 py-2",
                                            active
                                                ? "bg-slate-100 text-slate-900 font-semibold"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                        )}
                                    >
                                        <div className="relative shrink-0 flex items-center justify-center w-5 h-5">
                                            <span
                                                className={cn("rounded-full flex-shrink-0 transition-all", isCollapsed && active ? "w-3 h-3 ring-2 ring-emerald-500/20" : "w-2.5 h-2.5")}
                                                style={{ backgroundColor: proj.color }}
                                            />
                                        </div>

                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 truncate">{proj.title}</span>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono bg-white text-slate-600 border-slate-200 shadow-sm">
                                                    {pct}%
                                                </Badge>
                                            </>
                                        )}
                                    </Link>
                                );

                                if (isCollapsed) {
                                    return (
                                        <Tooltip key={proj.id} delayDuration={0}>
                                            <TooltipTrigger asChild>{ProjLink}</TooltipTrigger>
                                            <TooltipContent side="right">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold">{proj.title}</span>
                                                    <span className="text-xs text-muted-foreground">{pct}% Selesai</span>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return ProjLink;
                            })}
                        </div>
                    )}
                </div>
            </nav>

            <Separator className="bg-slate-100" />

            {/* User Dropdown */}
            <div className={cn("p-3", isCollapsed && "flex justify-center")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "flex items-center rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
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
                                    <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                                        {user?.name || "Loading..."}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate capitalize mt-0.5">
                                        {user?.role || ""}
                                    </p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={8} className="w-56 rounded-xl shadow-lg border-slate-200 p-1.5 origin-bottom-left">
                        <DropdownMenuLabel className="font-semibold text-slate-900">Akun Saya</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem className="cursor-pointer rounded-lg font-medium text-slate-700 focus:bg-slate-100 focus:text-slate-900" onClick={() => setPrefsOpen(true)}>
                            <User className="mr-2.5 h-4 w-4 text-slate-500" /> Preferences
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
                        <DialogTitle className="text-xl font-bold text-slate-900">Konfirmasi Keluar</DialogTitle>
                        <DialogDescription className="text-slate-500 text-[15px] leading-relaxed">
                            Apakah Anda yakin ingin keluar dari sesi saat ini? Anda harus masuk kembali untuk mengakses Dashboard KPI.
                        </DialogDescription>
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                        <Button variant="outline" className="w-full sm:w-auto font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-100" onClick={() => setLogoutOpen(false)}>Batal</Button>
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
                    <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-white">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                            <Settings className="w-5 h-5 text-slate-500" /> User Preferences
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 mt-1.5">
                            Atur preferensi akun dan personalisasi Dashboard KPI Anda di sini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6 bg-slate-50/50">
                        {/* Profile Sec */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Profil Singkat</h4>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-medium">Nama Lengkap</Label>
                                    <Input defaultValue={user?.name || ""} className="bg-white border-slate-200 shadow-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-medium">Email</Label>
                                    <Input defaultValue={user?.email || ""} disabled className="bg-slate-100 border-slate-200 text-slate-500 shadow-none cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-200" />

                        {/* Region & Formats */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Regional & Format</h4>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-medium">Zona Waktu</Label>
                                    <Select defaultValue="wib">
                                        <SelectTrigger className="bg-white border-slate-200 shadow-sm">
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

                    <DialogFooter className="p-4 border-t border-slate-100 bg-white">
                        <Button className="w-full sm:w-auto font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-sm" onClick={() => setPrefsOpen(false)}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
