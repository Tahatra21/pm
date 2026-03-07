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
import { mockProjects, mockTasks } from "@/lib/mock-data";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

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
            <CommandInput placeholder="Ketik perintah atau cari..." />
            <CommandList>
                <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

                <CommandGroup heading="Navigasi">
                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/my-tasks"))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Tugas Saya</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span>Proyek</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Aksi Cepat">
                    <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span>Buat Proyek Baru</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Proyek Aktif">
                    {mockProjects.slice(0, 4).map((p) => (
                        <CommandItem key={p.id} onSelect={() => runCommand(() => router.push(`/board/${p.id}`))}>
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
                            <span>{p.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Tugas Terbaru">
                    {mockTasks.slice(0, 5).map((t) => (
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
