"use client";

import Header from "@/components/layout/header";
import { currentUser } from "@/lib/mock-data";
import { User, Bell, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingsGroups = [
    {
        label: "Profil", icon: User,
        items: [
            { label: "Nama Lengkap", value: currentUser.name },
            { label: "Email", value: currentUser.email },
            { label: "Role", value: currentUser.role },
        ],
    },
    {
        label: "Notifikasi", icon: Bell,
        items: [
            { label: "Email Tugas Baru", value: "Aktif" },
            { label: "Pengingat Tenggat", value: "Aktif" },
            { label: "Update Status", value: "Nonaktif" },
        ],
    },
    {
        label: "Keamanan", icon: Shield,
        items: [
            { label: "Autentikasi", value: "Email/Password" },
            { label: "SSO Internal", value: "Terhubung" },
            { label: "Sesi Aktif", value: "1 perangkat" },
        ],
    },
];

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Pengaturan" }]} />
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
                <h1 className="text-xl font-semibold tracking-tight mb-1">Pengaturan</h1>
                <p className="text-sm text-muted-foreground mb-6">Kelola profil, notifikasi, dan keamanan akun Anda.</p>
                <div className="space-y-4">
                    {settingsGroups.map((group) => (
                        <Card key={group.label}>
                            <CardHeader className="flex-row items-center gap-2 pb-0">
                                <group.icon size={15} className="text-primary" />
                                <CardTitle className="text-sm">{group.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-3">
                                <div className="divide-y">
                                    {group.items.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between px-6 py-3 hover:bg-accent/50 cursor-pointer transition-colors">
                                            <span className="text-sm">{item.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">{item.value}</span>
                                                <ChevronRight size={14} className="text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
