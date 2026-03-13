"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Search, FolderOpen, CheckSquare, Settings, User } from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetch("/api/projects").then(r => r.json()).then(data => { if (Array.isArray(data)) setProjects(data); }).catch(() => { });
            fetch("/api/tasks").then(r => r.json()).then(data => { if (Array.isArray(data)) setTasks(data); }).catch(() => { });
        }
    }, [open]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        const customOpen = () => setOpen(true);

        document.addEventListener("keydown", down);
        document.addEventListener("open-command-palette", customOpen);
        return () => {
            document.removeEventListener("keydown", down);
            document.removeEventListener("open-command-palette", customOpen);
        };
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/my-tasks"))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>My Tasks</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span>Projects</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span>Create New Project</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Active Projects">
                    {projects.slice(0, 4).map((p) => (
                        <CommandItem key={p.id} onSelect={() => runCommand(() => router.push(`/board/${p.id}`))}>
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
                            <span>{p.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Recent Tasks">
                    {tasks.slice(0, 5).map((t) => (
                        <CommandItem key={t.id} onSelect={() => runCommand(() => router.push(`/board/${t.projectId}`))}>
                            <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{t.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
