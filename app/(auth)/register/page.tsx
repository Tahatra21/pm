"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!name || !email || !pwd || !confirmPwd) {
            setError("Semua field wajib diisi.");
            return;
        }
        if (pwd !== confirmPwd) { setError("Password dan konfirmasi tidak cocok."); return; }
        if (pwd.length < 8) { setError("Password minimal 8 karakter."); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "register", name, email, password: pwd }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Gagal mendaftar.");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left branding panel */}
            <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 p-10 border-r bg-card">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                        <Zap size={14} className="text-primary-foreground" />
                    </div>
                    <span className="text-base font-semibold tracking-tight">ProjectFlow</span>
                </div>

                <div className="space-y-4">
                    <blockquote className="text-xl font-semibold leading-snug tracking-tight">
                        "Bergabunglah dengan tim Anda dan mulai kelola proyek dengan lebih efisien."
                    </blockquote>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Daftarkan akun Anda untuk mengakses semua fitur manajemen proyek internal.
                    </p>
                </div>

                <div className="space-y-3">
                    {["Manajemen tugas terstruktur", "Kolaborasi tim real-time", "Monitoring progres proyek", "Integrasi Git & Calendar"].map((f) => (
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
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Zap size={12} className="text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold">ProjectFlow</span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight mb-1">Buat akun baru</h1>
                    <p className="text-sm text-muted-foreground mb-8">Daftarkan diri Anda ke dalam sistem internal.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
                            Registrasi berhasil! Mengalihkan ke halaman login...
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Nama Lengkap</Label>
                            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" autoFocus />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Email</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Password</Label>
                            <div className="relative">
                                <Input type={showPwd ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Minimal 8 karakter" className="pr-10" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Konfirmasi Password</Label>
                            <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Ulangi password" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-10 gap-2 shadow-sm mt-2">
                            {loading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <>Daftar Sekarang <ArrowRight size={14} /></>}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
