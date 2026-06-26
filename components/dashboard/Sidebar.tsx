"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/companias", label: "Compañías",  icon: Building2 },
  { href: "/conceptos", label: "Conceptos",  icon: FileText },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-white">SPN</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">SPN Ingresos</p>
          <p className="text-xs text-muted-foreground">Gestión de Nómina</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Módulos
        </p>
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? path === "/" : path.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={14} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4">
        <p className="text-xs text-muted-foreground">v1.0.0 · SPN © 2026</p>
      </div>
    </aside>
  );
}
