"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";

export function Layout({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      {/*
        defaultOpen=true  → sidebar starts expanded on desktop
        On mobile the SidebarProvider automatically handles it as an overlay drawer
      */}
      <SidebarProvider defaultOpen={true}>
        <Sidebar />
        <SidebarInset className="min-h-screen flex flex-col">
          <Header />
          <main
            className={cn(
              "@container/main",
              "flex-1",
              "w-full",
              "mx-auto",
              "relative",
              // Responsive padding
              "p-3 sm:p-4 md:p-5 lg:p-6",
              // Max width for very wide screens
              "max-w-screen-2xl"
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

Layout.displayName = "Layout";
