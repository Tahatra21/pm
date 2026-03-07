"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";


export default function LoginPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !pwd) {
            setError("Email dan password wajib diisi.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password: pwd }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Gagal masuk.");
                setLoading(false);
                return;
            }

            window.location.href = "/";
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left branding panel */}
            <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 p-10 border-r bg-card">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                        <Zap size={14} className="text-primary-foreground" />
                    </div>
                    <span className="text-base font-semibold tracking-tight">ProjectFlow</span>
                </div>

                {/* Quote */}
                <div className="space-y-4">
                    <blockquote className="text-xl font-semibold leading-snug tracking-tight">
                        "Kolaborasi tim yang lebih cepat, lebih terstruktur, tanpa bergantung layanan eksternal."
                    </blockquote>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Didesain untuk tim internal yang menghargai privasi data dan kinerja tinggi.
                    </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                    {["Kanban board dengan drag-and-drop", "Timeline / Gantt view terintegrasi", "Integrasi Git otomatis", "Backup database harian via Cron"].map((f) => (
                        <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {f}
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground">ProjectFlow © 2026 · Internal Infrastructure</p>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-[380px]">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Zap size={12} className="text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold">ProjectFlow</span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight mb-1">Masuk ke akun Anda</h1>
                    <p className="text-sm text-muted-foreground mb-8">Gunakan kredensial perusahaan atau SSO internal.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* SSO */}
                    <Button variant="outline" className="w-full justify-center gap-2.5 h-10 mb-5" type="button">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[9px] font-bold">ID</span>
                        </div>
                        Masuk dengan SSO Perusahaan
                    </Button>

                    <div className="flex items-center gap-4 mb-5">
                        <Separator className="flex-1" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">atau</span>
                        <Separator className="flex-1" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Email</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Password</Label>
                                <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">Lupa password?</button>
                            </div>
                            <div className="relative">
                                <Input type={showPwd ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className="pr-10" required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-10 gap-2 shadow-sm">
                            {loading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <>Masuk <ArrowRight size={14} /></>}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Belum punya akun?{" "}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">Daftar sekarang</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
