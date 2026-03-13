"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CommandPalette } from "@/components/command-palette";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <AuthProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <CommandPalette />
                {/* Desktop sidebar */}
                <div className="hidden md:block"><Sidebar /></div>

                {/* Mobile sidebar via Sheet */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent side="left" className="p-0 w-[240px]">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        <Sidebar />
                    </SheetContent>
                </Sheet>

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile top bar */}
                    <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
                            <Menu size={18} />
                        </Button>
                        <span className="text-sm font-semibold">ProjectFlow</span>
                    </div>
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}

