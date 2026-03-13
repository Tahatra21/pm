"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Briefcase, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Animated particle canvas for the left panel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = [];
        const colors = ["#3B82F6", "#2563EB", "#F97316", "#EA580C", "#60A5FA", "#FB923C"];

        for (let i = 0; i < 55; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.5 + 0.1,
            });
        }

        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });

            // Draw connecting lines
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach((b) => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = "#ffffff";
                        ctx.globalAlpha = (1 - dist / 100) * 0.05;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            ctx.globalAlpha = 1;
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    }, [isMounted]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !pwd) { setError("Email and password are required."); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password: pwd }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }
            window.location.href = "/";
        } catch {
            setError("Network error occurred.");
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen w-full flex overflow-hidden font-sans bg-[#F0F2F5]">
            {/* ─── LEFT HERO PANEL ─── */}
            <div className="hidden lg:flex relative w-[48%] xl:w-[52%] flex-col justify-between overflow-hidden bg-[#080E1C]">
                {/* Animated Canvas Background */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Left Gradient Glow — Blue (Work) */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-70" />
                {/* Right Gradient Glow — Orange (Action) */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-50" />

                {/* Blue Orb */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
                {/* Orange Orb */}
                <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[120px] pointer-events-none" />

                {/* Top brand mark */}
                <div className="relative z-15 p-15 flex items-center gap-3">
                    <img src="/worktion-logo2.png" alt="Worktion" className="h-15 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>

                {/* Center content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center px-12 xl:px-16">
                    <div className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 w-fit backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">Enterprise Workspace</span>
                    </div>

                    <h1 className="text-[52px] xl:text-[60px] font-black leading-[1.08] tracking-tight text-white mb-6">
                        Where <br />
                        <span className="relative">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Work</span>
                        </span>
                        {" "}Meets{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Action.</span>
                    </h1>

                    <p className="text-[16px] text-slate-400 leading-relaxed font-medium max-w-[420px] mb-12">
                        Platform manajemen proyek dan kolaborasi tim yang memadukan kerja terstruktur dengan tindakan yang cepat dan adaptif.
                    </p>

                    <div className="space-y-5">
                        {[
                            {
                                icon: <Briefcase size={18} className="text-blue-400" />,
                                bg: "bg-blue-500/10 border-blue-500/20",
                                title: "Structured Work",
                                desc: "Kelola proyek, KPI, dan timeline tim dalam satu platform.",
                            },
                            {
                                icon: <Zap size={18} className="text-orange-400" />,
                                bg: "bg-orange-500/10 border-orange-500/20",
                                title: "Dynamic Action",
                                desc: "Kolaborasi real-time dan respon cepat terhadap perubahan.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm transition-all duration-300 cursor-default">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-white/90">{item.title}</p>
                                    <p className="text-[12px] text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <div className="relative z-10 p-12 pt-0">
                    <div className="flex items-center gap-3 pt-8 border-t border-white/[0.06]">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span className="text-[12px] text-slate-500 font-medium">Aman & Terenkripsi — Powered oleh PLN ICONPLUS</span>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT FORM PANEL ─── */}
            <div className="flex-1 flex flex-col justify-center items-center relative p-8 bg-[#F0F2F5]">
                <div className="w-full max-w-[400px]">

                    {/* Logo row */}
                    <div className="flex items-center gap-4 mb-12">
                        <img
                            src="/pln-icon-plus.png"
                            alt="PLN Icon Plus"
                            className="h-14 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="h-10 w-[1.5px] bg-slate-300 rounded-full" />
                        <img
                            src="/worktion-logo.png"
                            alt="Worktion"
                            className="h-14 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>

                    {/* Heading */}
                    <div className="mb-10">
                        <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight mb-2">
                            Sign in to your workspace
                        </h2>
                        <p className="text-[14px] text-slate-500 font-medium">
                            Masuk untuk mengakses platform kolaborasi tim Anda.
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-[13px] font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className={`bg-white rounded-2xl border-2 transition-all duration-200 ${focusedField === "email" ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]" : "border-transparent shadow-sm"}`}>
                            <div className="px-5 pt-3.5 pb-1">
                                <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${focusedField === "email" ? "text-blue-500" : "text-slate-400"}`}>
                                    Corporate Email
                                </label>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="name@iconpln.co.id"
                                className="w-full px-5 pb-4 pt-1 text-[15px] font-semibold text-slate-900 placeholder:text-slate-300 bg-transparent outline-none"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className={`bg-white rounded-2xl border-2 transition-all duration-200 ${focusedField === "password" ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]" : "border-transparent shadow-sm"}`}>
                            <div className="flex items-center justify-between px-5 pt-3.5 pb-1">
                                <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${focusedField === "password" ? "text-blue-500" : "text-slate-400"}`}>
                                    Password
                                </label>
                                <button type="button" className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors">
                                    Lupa password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••••••"
                                    className="w-full px-5 pb-4 pt-1 pr-14 text-[15px] font-semibold text-slate-900 placeholder:text-slate-300 bg-transparent outline-none tracking-wider"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full h-[60px] mt-6 rounded-2xl font-black text-[15px] tracking-wide text-white overflow-hidden group disabled:opacity-80 transition-all duration-300"
                            style={{ background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center justify-center gap-2.5 text-white">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Masuk ke Dashboard
                                        <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                    <p className="text-[12px] font-bold text-slate-900">Aplikasi Worktion V1.1</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Powered by Solution Architect PLN 1</p>
                </div>
            </div>
        </div>
    );
}
