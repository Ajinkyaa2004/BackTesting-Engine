"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    LineChart,
    FlaskConical,
    Settings,
    LogOut,
    TrendingUp,
    Activity,
    Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview & Analytics"
    },
    {
        title: "Strategies",
        href: "/strategies",
        icon: FlaskConical,
        description: "Create & Manage"
    },
    {
        title: "Backtests",
        href: "/backtests",
        icon: LineChart,
        description: "Results & History"
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Get user info from token or API
        const token = localStorage.getItem("token");
        if (token) {
            // You could decode the JWT or fetch user info
            setUser({ name: "User", email: "user@example.com" });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <div className={cn(
            "flex h-screen flex-col justify-between border-r border-[var(--color-border)] bg-gradient-to-b from-white to-gray-50 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between h-16 border-b border-[var(--color-border)] px-4">
                    <div className={cn(
                        "flex items-center gap-3 transition-all duration-300",
                        isCollapsed && "justify-center"
                    )}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-fade-in">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                    Backtesting Platform
                                </h1>
                                <p className="text-xs text-[var(--color-muted)] -mt-1">Pro Edition</p>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <Activity className="h-4 w-4 text-[var(--color-muted)]" />
                        </button>
                    )}
                    {isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="absolute left-16 top-4 p-1 rounded-md bg-white shadow-md hover:shadow-lg transition-all"
                        >
                            <Activity className="h-4 w-4 text-[var(--color-muted)]" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 p-3">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 animate-slide-in",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                                        : "text-[var(--color-secondary-text)] hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[var(--color-primary-text)] hover:shadow-sm"
                                )}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                                    isActive 
                                        ? "bg-white/20" 
                                        : "group-hover:bg-white group-hover:shadow-sm"
                                )}>
                                    <Icon className={cn(
                                        "h-4 w-4 transition-all duration-200",
                                        isActive ? "text-white" : "text-[var(--color-muted)] group-hover:text-[var(--color-primary)]"
                                    )} />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col animate-fade-in">
                                        <span>{item.title}</span>
                                        <span className={cn(
                                            "text-xs transition-colors duration-200",
                                            isActive ? "text-white/80" : "text-[var(--color-muted)] group-hover:text-[var(--color-secondary-text)]"
                                        )}>
                                            {item.description}
                                        </span>
                                    </div>
                                )}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                        {item.title}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Indicator */}
                {!isCollapsed && (
                    <div className="mx-3 mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fade-in">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">System Online</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">All services running</p>
                    </div>
                )}
            </div>

            {/* User Section & Logout */}
            <div className="border-t border-[var(--color-border)] bg-gradient-to-r from-gray-50 to-white">
                {!isCollapsed && user && (
                    <div className="p-4 animate-fade-in">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--color-primary-text)] truncate">
                                    {user.name || 'User'}
                                </p>
                                <p className="text-xs text-[var(--color-muted)] truncate">
                                    {user.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-3">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group",
                            "text-[var(--color-trading-loss)] hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-sm"
                        )}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                            <LogOut className="h-4 w-4" />
                        </div>
                        {!isCollapsed && <span>Logout</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
