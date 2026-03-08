"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/layout/header";
import { Briefcase, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StreamData {
    stream: {
        id: string;
        name: string;
        description: string;
        code: string;
        createdAt: string;
    };
    projects: Array<{
        id: string;
        title: string;
        description: string;
        color: string;
    }>;
}

export default function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<StreamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/streams/${id}/projects`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load stream details");
                return res.json();
            })
            .then(resData => {
                setData(resData);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-background">
                <Header breadcrumb={[{ label: "Stream Overview" }]} />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col h-full bg-background">
                <Header breadcrumb={[{ label: "Stream Overview" }]} />
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <p className="text-muted-foreground text-sm font-medium">{error || "Stream not found"}</p>
                    <Button variant="outline" size="sm" onClick={() => router.push('/')}>Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <Header breadcrumb={[{ label: "Stream Overview", href: "/" }, { label: data.stream.name }]} />

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="max-w-[1200px] mx-auto space-y-4">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="flex flex-col gap-1.5 pl-2">
                            <div className="flex gap-2 items-center mb-1">
                                <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-6 w-6 rounded hover:bg-muted text-muted-foreground shrink-0">
                                    <ArrowLeft size={14} />
                                </Button>
                                <div className="text-label-small font-medium uppercase tracking-[0.05em] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 w-fit tabular-nums">
                                    {data.stream.code}
                                </div>
                            </div>
                            <h1 className="text-headline-small text-foreground leading-none">
                                {data.stream.name}
                            </h1>
                            <p className="text-body-medium text-muted-foreground/60 leading-snug max-w-2xl">
                                {data.stream.description || "No description provided."}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em]">
                                    Created {format(new Date(data.stream.createdAt), "MMM d, yyyy")}
                                </span>
                                <div className="h-3 w-px bg-border/60"></div>
                                <div className="flex items-center gap-1.5 text-label-small font-medium text-muted-foreground/40 uppercase tracking-[0.05em]">
                                    <Briefcase size={12} className="text-primary" />
                                    {data.projects.length} Active {data.projects.length === 1 ? 'Project' : 'Projects'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Associated Projects Section */}
                    <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-title-small font-medium text-foreground flex items-center gap-2">
                                <Briefcase className="text-muted-foreground/30" size={16} />
                                Projects under stream
                            </h2>
                        </div>

                        {data.projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {data.projects.map((project) => (
                                    <Link key={project.id} href={`/board/${project.id}`}>
                                        <div className="group flex flex-col p-4 rounded-lg border border-border hover:border-muted-foreground/30 bg-card hover:bg-muted/50 transition-all cursor-pointer h-full">
                                            <div className="flex items-start gap-3 mb-2">
                                                <div 
                                                    className="w-8 h-8 rounded shrink-0" 
                                                    style={{ backgroundColor: `${project.color}` }}
                                                />
                                                 <div className="flex flex-col min-w-0">
                                                    <span className="text-body-medium font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                        {project.title}
                                                    </span>
                                                    <p className="text-body-small text-muted-foreground/60 line-clamp-1 mt-0.5">
                                                        {project.description || "No description provided."}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-auto pt-3">
                                                 <div className="text-label-small font-medium text-muted-foreground/40 flex items-center gap-1">
                                                     Kanban Board
                                                 </div>
                                                <span className="text-muted-foreground/60 group-hover:text-primary transition-colors">
                                                    <ArrowRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                                <Briefcase size={20} className="text-muted-foreground/60 mb-2" />
                                <h3 className="text-sm font-semibold text-foreground mb-0.5">No Projects Found</h3>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    There are currently no projects running under this stream.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

