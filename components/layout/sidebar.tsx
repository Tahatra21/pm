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

// Menu constants moved into component or handled dynamically
const MENU_PROJECT = [
    { href: "/projects", icon: Briefcase, label: "Projects" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
];

const MENU_OTHERS = [
    { href: "/employees", icon: UserCheck, label: "Employees" },
    { href: "/contact", icon: Contact, label: "Contacts" },
    { href: "/help", icon: HelpCircle, label: "Help Center" },
];

const MENU_ADMIN = [
    { href: "/admin/streams", icon: Ship, label: "Master Stream" },
    { href: "/admin/tags", icon: Zap, label: "Master Tag" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, settings } = useAuth();
    const [projOpen, setProjOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [streams, setStreams] = useState<Array<{ id: string; name: string; projectCount?: number }>>([]);
    const [showAllStreams, setShowAllStreams] = useState(false);

    useEffect(() => {
        const fetchStreams = () => {
            fetch("/api/admin/streams?limit=100")
                .then(r => r.json())
                .then(json => {
                    if (json.data && Array.isArray(json.data)) setStreams(json.data);
                    else if (Array.isArray(json)) setStreams(json);
                })
                .catch(err => { console.error("SIDEBAR: fetch error", err); });
        };

        const fetchInboxCount = () => {
            fetch("/api/inbox/unread-count")
                .then(r => r.json())
                .then(data => { if (typeof data.count === "number") setUnreadCount(data.count); })
                .catch(err => console.error("Inbox count error", err));
        };

        fetchStreams();
        fetchInboxCount();

        const interval = setInterval(() => {
            fetchStreams();
            fetchInboxCount();
        }, 10000);

        window.addEventListener("refresh-streams", fetchStreams);

        return () => {
            clearInterval(interval);
            window.removeEventListener("refresh-streams", fetchStreams);
        };
    }, []);

    // Generate consistent colors for streams based on ID
    const getStreamColor = (id: string) => {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'];
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <aside className={cn(
            "flex flex-col h-full flex-shrink-0 bg-card border-r border-border transition-all duration-300 ease-in-out shadow-sm relative",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header & Toggle */}
            <div className={cn("flex items-center h-16 px-4 transition-all", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 overflow-hidden w-full pl-1">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                            ) : (
                                <Layout size={18} className="text-primary" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-foreground tracking-tight block truncate uppercase">
                                {settings.companyName || "Worktion"}
                            </span>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
                        <Layout size={14} className="text-primary-foreground" />
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
                    <span className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] block mt-2 mb-1">Main Menu</span>
                )}
                <div className="space-y-1">
                    {[
                        { href: "/", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/inbox", icon: Inbox, label: "Inbox", badge: unreadCount > 0 ? unreadCount : undefined },
                    ].map(({ href, icon: Icon, label, badge }: any) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        const NavLinkComponent = (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center rounded-lg text-xs font-medium transition-all duration-200",
                                    isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                    active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground/80")} />
                                {!isCollapsed && (
                                    <>
                                        <span className="truncate flex-1">{label}</span>
                                        {badge && <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[17px] text-center">
                                            {badge}
                                        </span>}
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
                        <span className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] block mb-1">Project</span>
                    )}
                    <div className="space-y-1">
                        {MENU_PROJECT.map(({ href, icon: Icon, label }) => {
                            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                            const NavLinkComponent = (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center rounded-lg text-xs font-medium transition-all duration-200",
                                        isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                        active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground/80")} />
                                    {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                                </Link>
                            );

                            return (
                                <div key={href} className="flex flex-col space-y-1">
                                    {isCollapsed ? (
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>{NavLinkComponent}</TooltipTrigger>
                                            <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
                                        </Tooltip>
                                    ) : NavLinkComponent}

                                    {/* Sub-menu rendering only for Project */}
                                    {label === "Projects" && (
                                        <>
                                            {!isCollapsed && (
                                                <div className="pt-1.5 pb-1 space-y-1 ml-[20px] border-l border-border pl-3 mt-1 mb-1">
                                                    {(() => {
                                                        const priorityNames = [
                                                            "EP & Pembangkitan",
                                                            "Transmisi",
                                                            "Stransmisi", // accommodate typo in DB/screenshot
                                                            "Distribusi",
                                                            "Korporat",
                                                            "Pelayanan Pelanggan"
                                                        ];
                                                        
                                                        const sortedStreams = [...streams].sort((a, b) => {
                                                            const aIndex = priorityNames.findIndex(p => a.name.includes(p));
                                                            const bIndex = priorityNames.findIndex(p => b.name.includes(p));
                                                            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                                            if (aIndex !== -1) return -1;
                                                            if (bIndex !== -1) return 1;
                                                            return a.name.localeCompare(b.name);
                                                        });

                                                        const visibleStreams = showAllStreams ? sortedStreams : sortedStreams.slice(0, 5);

                                                        return (
                                                            <>
                                                                {visibleStreams.map((stream) => (
                                                                    <Link
                                                                        key={stream.id}
                                                                        href={`/stream/${stream.id}`}
                                                                        className={cn(
                                                                            "flex items-center gap-3 px-2 py-1.5 hover:bg-muted/50 rounded-lg group transition-colors",
                                                                            pathname.startsWith(`/stream/${stream.id}`) && "bg-muted/50 shadow-sm"
                                                                        )}
                                                                    >
                                                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getStreamColor(stream.id) }} />
                                                                        <span className={cn(
                                                                            "text-xs font-medium group-hover:text-foreground flex-1 truncate",
                                                                            pathname.startsWith(`/stream/${stream.id}`) ? "text-foreground font-bold" : "text-muted-foreground"
                                                                        )}>
                                                                            {stream.name}
                                                                        </span>
                                                                        {stream.projectCount !== undefined && (
                                                                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full ml-auto">
                                                                                {stream.projectCount}
                                                                            </span>
                                                                        )}
                                                                    </Link>
                                                                ))}
                                                                {streams.length > 5 && (
                                                                    <button 
                                                                        onClick={() => setShowAllStreams(!showAllStreams)}
                                                                        className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors mt-1 uppercase tracking-wider"
                                                                    >
                                                                        {showAllStreams ? (
                                                                            <>Show Less <ChevronDown className="rotate-180" size={10} /></>
                                                                        ) : (
                                                                            <>See {streams.length - 5} More <ChevronDown size={10} /></>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            {isCollapsed && (
                                                <div className="pt-2 pb-2 space-y-3 flex flex-col items-center border-b border-border/50 mb-1">
                                                    {(() => {
                                                        const priorityNames = ["EP & Pembangkitan", "Transmisi", "Stransmisi", "Distribusi", "Korporat", "Pelayanan Pelanggan"];
                                                        const sortedStreams = [...streams].sort((a, b) => {
                                                            const aIndex = priorityNames.findIndex(p => a.name.includes(p));
                                                            const bIndex = priorityNames.findIndex(p => b.name.includes(p));
                                                            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                                            if (aIndex !== -1) return -1;
                                                            if (bIndex !== -1) return 1;
                                                            return a.name.localeCompare(b.name);
                                                        });
                                                        return sortedStreams.slice(0, 5).map((stream) => (
                                                            <Tooltip key={stream.id} delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/stream/${stream.id}`}>
                                                                        <div className="w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: getStreamColor(stream.id) }} />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="font-medium">{stream.name}</TooltipContent>
                                                            </Tooltip>
                                                        ));
                                                    })()}
                                                    {streams.length > 5 && (
                                                        <Tooltip delayDuration={0}>
                                                            <TooltipTrigger asChild>
                                                                <div className="text-[9px] font-black text-muted-foreground/40 cursor-help">+{streams.length - 5}</div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right" className="font-medium">Expand to see {streams.length - 5} more streams</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Others Section */}
                <div className="pt-4">
                    {!isCollapsed && (
                        <span className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] block mb-1">Others</span>
                    )}
                    <div className="space-y-1">
                        {MENU_OTHERS.map(({ href, icon: Icon, label }) => {
                            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                            const NavLinkComponent = (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center rounded-lg text-xs font-medium transition-all duration-200",
                                        isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                        active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground/80")} />
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
                            <span className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] block mb-1">Admin</span>
                        )}
                        <div className="space-y-1">
                            {MENU_ADMIN.map(({ href, icon: Icon, label }) => {
                                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                                const NavLinkComponent = (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            "flex items-center rounded-lg text-xs font-medium transition-all duration-200",
                                            isCollapsed ? "justify-center px-0 py-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                                            active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon size={isCollapsed ? 18 : 16} className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground/80")} />
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

            <Separator className="bg-border" />

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
                                    className="text-xs font-bold text-primary-foreground bg-primary"
                                >
                                    {user ? getInitials(user.name) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                                        {user?.name || "Loading..."}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-normal truncate capitalize mt-0.5">
                                        {user?.role || ""}
                                    </p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={8} className="w-56 rounded-xl shadow-lg border-border p-1.5 origin-bottom-left">
                        <DropdownMenuLabel className="font-semibold text-foreground">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem className="cursor-pointer rounded-lg font-medium text-foreground focus:bg-muted focus:text-foreground" onClick={() => setPrefsOpen(true)}>
                            <User className="mr-2.5 h-4 w-4 text-muted-foreground" /> Preferences
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg font-medium text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setLogoutOpen(true)}>
                            <LogOut className="mr-2.5 h-4 w-4 text-destructive" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* -- Logout Modal -- */}
            <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
                    <div className="p-6 pt-8 pb-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                            <LogOut className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">Confirm Logout</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-[15px] leading-relaxed">
                            Are you sure you want to log out of the current session? You must log back in to access the Dashboard.
                        </DialogDescription>
                    </div>
                    <div className="bg-muted/50 p-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                        <Button variant="outline" className="w-full sm:w-auto font-semibold bg-card border-border text-foreground hover:bg-muted" onClick={() => setLogoutOpen(false)}>Cancel</Button>
                        <Button variant="destructive" className="w-full sm:w-auto font-semibold shadow-sm" onClick={async () => {
                            await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
                            setLogoutOpen(false);
                            router.push("/login");
                        }}>Yes, Logout</Button>
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
                            Set your account preferences and personalize your Dashboard here.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6 bg-muted/50">
                        {/* Profile Sec */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em]">Short Profile</h4>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-foreground font-medium">Full Name</Label>
                                    <Input defaultValue={user?.name || ""} className="bg-card border-border shadow-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-foreground font-medium">Email</Label>
                                    <Input defaultValue={user?.email || ""} disabled className="bg-muted border-border text-muted-foreground shadow-none cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border" />

                        {/* Region & Formats */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em]">Regional & Format</h4>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-foreground font-medium">Time Zone</Label>
                                    <Select defaultValue="wib">
                                        <SelectTrigger className="bg-card border-border shadow-sm">
                                            <SelectValue placeholder="Select Time Zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="wib">Western Indonesian Time (WIB)</SelectItem>
                                            <SelectItem value="wita">Central Indonesian Time (WITA)</SelectItem>
                                            <SelectItem value="wit">Eastern Indonesian Time (WIT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t border-border bg-card">
                        <Button
                            className="w-full sm:w-auto font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                            onClick={() => {
                                alert("Settings saved successfully!");
                                setPrefsOpen(false);
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
