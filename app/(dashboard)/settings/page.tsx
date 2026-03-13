"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { 
    Building, Globe, Clock, Upload, Mail, Phone, CalendarDays, Loader2, Save, 
    Database, HardDrive, FileText, Shield, Key, History, Download, Trash2, 
    ChevronRight, AlertCircle, CheckCircle2, Lock, Eye, EyeOff, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AuditLog {
    id: string;
    action: string;
    resource: string;
    details: string;
    createdAt: string;
    users?: { name: string; email: string };
}

const TABS = [
    { id: "general", label: "General", icon: Building },
    { id: "security", label: "Security", icon: Shield },
    { id: "logs", label: "Audit Logs", icon: History },
    { id: "backup", label: "Backup & Data", icon: Database },
];

export default function EnhancedSettingsPage() {
    const { user, loading, refreshSettings } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState<any>({
        companyName: "Worktion Enterprise",
        email: "contact@worktion.com",
        phone: "+62 811 0000 0000",
        address: "Jakarta, Indonesia",
        website: "https://worktion.com",
        timezone: "UTC+07:00",
        dateFormat: "DD/MM/YYYY",
        twoFactorAuth: false,
        sessionTimeout: "24",
        logRetention: "90",
        autoBackup: "daily",
        logoUrl: ""
    });

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [notif, setNotif] = useState<{type: 'success' | 'error', msg: string} | null>(null);

    useEffect(() => {
        if (!loading && user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchSettings();
    }, [user, loading, router]);

    useEffect(() => {
        if (activeTab === "logs") {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                if (Object.keys(data).length > 0) {
                    setSettings((prev: any) => ({ ...prev, ...data }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch settings");
        }
    };

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const res = await fetch("/api/admin/logs?limit=20");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (e) {
            console.error("Failed to fetch logs");
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                showNotif("success", "Settings saved successfully");
                refreshSettings();
            } else {
                showNotif("error", "Failed to save settings");
            }
        } catch (e) {
            showNotif("error", "Connection error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("logo", file);
        formData.append("type", "main");

        try {
            const res = await fetch("/api/admin/settings/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                handleChange("logoUrl", data.url);
                showNotif("success", "Logo uploaded. Save settings to apply.");
            } else {
                showNotif("error", data.error || "Upload failed");
            }
        } catch (err) {
            showNotif("error", "Upload error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleBackup = async () => {
        try {
            showNotif("success", "Generating backup...");
            const res = await fetch("/api/admin/backup");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `worktion-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } catch (e) {
            showNotif("error", "Backup failed");
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm("This will overwrite existing database data. Are you absolutely sure?")) return;

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const content = event.target?.result as string;
                const res = await fetch("/api/admin/restore", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: content
                });
                if (res.ok) {
                    showNotif("success", "System restored successfully!");
                    window.location.reload();
                } else {
                    const d = await res.json();
                    showNotif("error", d.error || "Restore failed");
                }
            };
            reader.readAsText(file);
        } catch (e) {
            showNotif("error", "Restore process failed");
        }
    };

    const handleSyncProductivity = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/productivity/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: new Date().toISOString() }) // Sync for today by default or provide input
            });
            const data = await res.json();
            if (res.ok) {
                showNotif("success", `Synced productivity for ${data.updatedCount} users`);
            } else {
                showNotif("error", data.error || "Sync failed");
            }
        } catch (e) {
            showNotif("error", "Network error during sync");
        } finally {
            setIsSyncing(false);
        }
    };

    const clearLogs = async () => {
        if (!confirm("Are you sure you want to clear all audit logs?")) return;
        try {
            const res = await fetch("/api/admin/logs", { method: "DELETE" });
            if (res.ok) {
                setLogs([]);
                showNotif("success", "Audit logs cleared");
            }
        } catch (e) {
            showNotif("error", "Failed to clear logs");
        }
    };

    const showNotif = (type: 'success' | 'error', msg: string) => {
        setNotif({ type, msg });
        setTimeout(() => setNotif(null), 3000);
    };

    const handleChange = (key: string, value: any) => {
        setSettings({ ...settings, [key]: value });
    };

    if (loading || user?.role !== "admin") {
        return (
            <div className="flex flex-col h-full bg-background items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden">
            <Header breadcrumb={[{ label: "System" }, { label: "Admin Settings" }]} />
            
            {/* Hidden Input for Logo Upload */}
            <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleLogoUpload}
                id="logo-upload-input"
            />

            {/* Hidden Input for Restore */}
            <input 
                type="file" 
                className="hidden" 
                accept=".json"
                onChange={handleRestore}
                id="restore-upload-input"
            />

            {/* Notification Toast */}
            {notif && (
                <div className={cn(
                    "fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    notif.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                    {notif.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="font-bold text-sm tracking-tight">{notif.msg}</span>
                </div>
            )}

            <main className="flex-1 overflow-y-auto px-4 md:px-10 py-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                    
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 shrink-0 space-y-2">
                        <div className="px-3 pb-4">
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Settings</h1>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Control Panel</p>
                        </div>
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
                                    activeTab === tab.id 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon size={18} className={cn(activeTab === tab.id ? "text-white" : "text-primary/60 group-hover:text-primary")} />
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                            </button>
                        ))}
                        
                        <div className="pt-8 px-3">
                            <div className="p-4 rounded-[24px] bg-primary/5 border border-primary/10 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Shield size={80} className="text-primary" />
                                </div>
                                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">System Status</h4>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] font-bold text-emerald-600">DB Connected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[11px] font-bold text-blue-600">v1.2.4 Enterprise</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        {activeTab === "general" && (
                            <section className="space-y-6">
                                <Card className="border-none shadow-xl shadow-black/[0.03] rounded-[32px] overflow-hidden bg-card/50 backdrop-blur-xl">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-xl font-black">Company Identity</CardTitle>
                                        <CardDescription className="text-sm font-medium">Public facing information for your enterprise instance.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 space-y-8">
                                        <div className="flex items-center gap-8">
                                            <div className="relative group">
                                                <div 
                                                    onClick={() => document.getElementById('logo-upload-input')?.click()}
                                                    className="w-24 h-24 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center transition-all group-hover:bg-primary/10 group-hover:border-primary/40 cursor-pointer overflow-hidden"
                                                >
                                                    {isUploading ? (
                                                        <Loader2 className="animate-spin text-primary" size={24} />
                                                    ) : settings.logoUrl ? (
                                                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <Upload size={20} className="text-primary/60 group-hover:text-primary" />
                                                            <span className="text-[10px] font-black uppercase mt-1 text-primary/40 group-hover:text-primary">Logo</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Enterprise Name</Label>
                                                    <Input 
                                                        value={settings.companyName} 
                                                        onChange={(e) => handleChange("companyName", e.target.value)}
                                                        className="h-12 rounded-2xl bg-muted/30 border-none font-bold text-lg px-5 focus-visible:ring-primary/20" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                                    <Input 
                                                        value={settings.email} 
                                                        onChange={(e) => handleChange("email", e.target.value)}
                                                        className="h-11 rounded-2xl bg-muted/40 border-none pl-11 font-semibold" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Support Phone</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                                    <Input 
                                                        value={settings.phone} 
                                                        onChange={(e) => handleChange("phone", e.target.value)}
                                                        className="h-11 rounded-2xl bg-muted/40 border-none pl-11 font-semibold" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Headquarters</Label>
                                            <Textarea 
                                                value={settings.address} 
                                                onChange={(e) => handleChange("address", e.target.value)}
                                                className="min-h-[100px] rounded-2xl bg-muted/40 border-none font-semibold p-4 resize-none" 
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-8 bg-muted/20 flex justify-end gap-3">
                                        <Button variant="ghost" className="rounded-2xl font-bold">Reset</Button>
                                        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-8 font-black gap-2 shadow-lg shadow-primary/20">
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            Update Profile
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-lg rounded-[32px] bg-white dark:bg-slate-900 overflow-hidden">
                                        <CardHeader className="p-6 pb-0 flex flex-row items-center gap-4">
                                            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-black">Regional</CardTitle>
                                                <CardDescription className="text-xs font-bold">Localization settings</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">System Timezone</Label>
                                                <Select value={settings.timezone} onValueChange={(v) => handleChange("timezone", v)}>
                                                    <SelectTrigger className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold px-4">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="UTC+07:00">WIB (UTC+07:00)</SelectItem>
                                                        <SelectItem value="UTC+08:00">WITA (UTC+08:00)</SelectItem>
                                                        <SelectItem value="UTC+00:00">London (UTC+00:00)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Preferred Date Format</Label>
                                                <Select value={settings.dateFormat} onValueChange={(v) => handleChange("dateFormat", v)}>
                                                    <SelectTrigger className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold px-4">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="DD/MM/YYYY">31/12/2026</SelectItem>
                                                        <SelectItem value="YYYY-MM-DD">2026-12-31</SelectItem>
                                                        <SelectItem value="MMMM D, YYYY">December 31, 2026</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </section>
                        )}

                        {activeTab === "security" && (
                            <section className="space-y-6">
                                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                                                <Lock size={20} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black text-red-600 dark:text-red-400">Security Management</CardTitle>
                                                <CardDescription className="font-bold">Enhanced protection for enterprise data.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 space-y-6">
                                        <div className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="space-y-1">
                                                <h4 className="font-black text-sm">Two-Factor Authentication</h4>
                                                <p className="text-[11px] font-medium text-muted-foreground">Add an extra layer of security to all admin accounts.</p>
                                            </div>
                                            <div 
                                                onClick={() => handleChange("twoFactorAuth", !settings.twoFactorAuth)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200",
                                                    settings.twoFactorAuth ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                                    settings.twoFactorAuth ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Session Expiry (Hours)</Label>
                                                <Input 
                                                    type="number"
                                                    value={settings.sessionTimeout} 
                                                    onChange={(e) => handleChange("sessionTimeout", e.target.value)}
                                                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Min Password Length</Label>
                                                <Select defaultValue="12">
                                                    <SelectTrigger className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none">
                                                        <SelectItem value="8">8 Characters</SelectItem>
                                                        <SelectItem value="12">12 Characters (Strong)</SelectItem>
                                                        <SelectItem value="16">16 Characters (Military Grade)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-[24px] border border-orange-500/20 bg-orange-500/[0.03] space-y-4">
                                            <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                                                <AlertCircle size={20} />
                                                <h4 className="font-black text-sm uppercase tracking-tight">Login Policy</h4>
                                            </div>
                                            <p className="text-xs font-medium leading-relaxed opacity-80">
                                                Automatic account lockout after 5 failed attempts. System will notify admins of suspicious IP activity.
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-8 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                                        <Button onClick={handleSave} className="rounded-2xl px-10 font-black h-11 bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20">
                                            Seal Security Policy
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </section>
                        )}

                        {activeTab === "logs" && (
                            <section className="space-y-6">
                                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
                                    <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-black">System Audit Logs</CardTitle>
                                            <CardDescription className="font-bold">Real-time activity tracking for accountability.</CardDescription>
                                        </div>
                                        <Button onClick={clearLogs} variant="outline" size="sm" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold gap-2">
                                            <Trash2 size={14} /> Clear History
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="border-t border-slate-100 dark:border-slate-800">
                                            {isLoadingLogs ? (
                                                <div className="p-20 flex flex-col items-center gap-4">
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <span className="text-sm font-bold opacity-40">Decrypting logs...</span>
                                                </div>
                                            ) : logs.length === 0 ? (
                                                <div className="p-20 flex flex-col items-center gap-4 text-center">
                                                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <History size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black tracking-tight">No Events Recorded</h4>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Silence is golden</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {logs.map((log) => (
                                                        <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-5">
                                                            <div className={cn(
                                                                "p-2.5 rounded-2xl shrink-0 mt-0.5 shadow-sm",
                                                                log.action.includes('DELETE') ? "bg-red-500/10 text-red-500" :
                                                                log.action.includes('CREATE') ? "bg-emerald-500/10 text-emerald-500" :
                                                                log.action.includes('BACKUP') ? "bg-blue-500/10 text-blue-500" :
                                                                "bg-primary/10 text-primary"
                                                            )}>
                                                                <FileText size={18} />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h5 className="font-black text-sm tracking-tight">{log.action.replace(/_/g, ' ')}</h5>
                                                                    <span className="text-[10px] font-black text-muted-foreground/60">{new Date(log.createdAt).toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-muted-foreground leading-relaxed">{log.details}</p>
                                                                <div className="pt-2 flex items-center gap-4">
                                                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                                                        <Mail size={10} className="text-slate-400" />
                                                                        <span className="text-[10px] font-black opacity-80">{log.users?.name || 'System Auto'}</span>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800">
                                                                        {log.resource}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    {logs.length > 0 && (
                                        <CardFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                                            <Button variant="ghost" size="sm" className="text-[11px] font-black uppercase tracking-widest opacity-60">
                                                Load More Events
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            </section>
                        )}

                        {activeTab === "backup" && (
                            <section className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-xl rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <Database size={120} />
                                        </div>
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-2xl font-black">Instant Cloud Backup</CardTitle>
                                            <CardDescription className="text-indigo-100/70 font-bold">Generate a full snapshot of your ecosystem.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <p className="text-sm font-medium leading-relaxed text-indigo-50/80 mb-6">
                                                Everything is exported into a structured JSON format including projects, tasks, employees, and team telemetry.
                                            </p>
                                            <Button 
                                                onClick={handleBackup}
                                                className="w-full h-14 rounded-3xl bg-white text-indigo-600 hover:bg-white/90 font-black text-lg gap-3 transition-all active:scale-95 shadow-2xl shadow-black/20"
                                            >
                                                <Download size={22} /> Download Snapshot
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-xl rounded-[40px] bg-white dark:bg-slate-900 overflow-hidden">
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-xl font-black">Data Retention</CardTitle>
                                            <CardDescription className="font-bold">Lifecycle of system records.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0 space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Auto-Backup Frequency</Label>
                                                <Select value={settings.autoBackup} onValueChange={(v) => handleChange("autoBackup", v)}>
                                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold px-5">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="daily">Every 24 Hours (Recommended)</SelectItem>
                                                        <SelectItem value="weekly">Once a Week</SelectItem>
                                                        <SelectItem value="monthly">Monthly Snapshot</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Log Preservation Period</Label>
                                                <Select value={settings.logRetention} onValueChange={(v) => handleChange("logRetention", v)}>
                                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold px-5">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                        <SelectItem value="30">30 Days (Compliant)</SelectItem>
                                                        <SelectItem value="90">90 Days (Enterprise)</SelectItem>
                                                        <SelectItem value="365">1 Year (Long Term)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-8 pt-0">
                                            <Button onClick={handleSave} className="w-full h-11 rounded-2xl font-black bg-slate-900 border-none">
                                                Confirm Retention Policy
                                            </Button>
                                        </CardFooter>
                                    </Card>

                                    <Card className="border-none shadow-xl rounded-[40px] bg-slate-900 text-white overflow-hidden relative">
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-xl font-black">Productivity Engine</CardTitle>
                                            <CardDescription className="text-slate-400 font-bold">Aggregate telemetry data for analytics.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <p className="text-xs font-medium leading-relaxed opacity-70 mb-6">
                                                Manually trigger the sync engine to update productivity statistics from user time logs. This ensures your dashboard charts are up-to-date.
                                            </p>
                                            <Button 
                                                onClick={handleSyncProductivity}
                                                disabled={isSyncing}
                                                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black gap-2"
                                            >
                                                {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                                                Synchronize Data
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-none shadow-lg rounded-[32px] bg-amber-500/10 border border-amber-500/20">
                                    <CardContent className="p-8 flex items-start gap-4">
                                        <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20 shrink-0">
                                            <AlertCircle size={22} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-amber-800 dark:text-amber-400 font-black text-lg">Disaster Recovery Mode</h4>
                                            <p className="text-sm font-semibold text-amber-900/70 leading-relaxed">
                                                Restoring data from a backup will overwrite existing records. This action cannot be undone and should only be performed by senior system administrators during maintenance windows.
                                            </p>
                                            <div className="pt-2">
                                                <Button 
                                                    onClick={() => document.getElementById('restore-upload-input')?.click()}
                                                    variant="outline" 
                                                    className="rounded-xl border-amber-300 text-amber-700 font-bold hover:bg-amber-100"
                                                >
                                                    Initiate Sequence
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
