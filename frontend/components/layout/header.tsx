"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Settings, User, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getTitle = () => {
        if (pathname === "/dashboard") return "Dashboard";
        if (pathname === "/strategies") return "Strategies";
        if (pathname === "/backtests") return "Backtests & Results";
        if (pathname.startsWith("/strategies/new")) return "Create New Strategy";
        if (pathname.startsWith("/strategies/")) return "Strategy Details";
        if (pathname.startsWith("/backtests/")) return "Backtest Results";
        return "Backtesting Platform";
    };

    const getSubtitle = () => {
        if (pathname === "/dashboard") return "Monitor your trading performance";
        if (pathname === "/strategies") return "Manage your trading algorithms";
        if (pathname === "/backtests") return "Analyze historical performance";
        if (pathname.startsWith("/strategies/new")) return "Build and test your trading strategy";
        if (pathname.startsWith("/strategies/")) return "Configure and run backtests";
        if (pathname.startsWith("/backtests/")) return "Detailed backtest analysis";
        return "Advanced algorithmic trading backtesting platform";
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 animate-fade-in">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-primary-text)]">
                        {getTitle()}
                    </h1>
                    <p className="text-sm text-[var(--color-muted)] -mt-1">
                        {getSubtitle()}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 animate-fade-in">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
                    <input
                        type="text"
                        placeholder="Search strategies, backtests..."
                        className="pl-10 pr-4 py-2 w-64 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group">
                    <Bell className="h-5 w-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary-text)]" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    </span>
                </button>

                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group">
                    <Settings className="h-5 w-5 text-[var(--color-muted)] group-hover:text-[var(--color-primary-text)]" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <ChevronDown className="h-4 w-4 text-[var(--color-muted)] group-hover:text-[var(--color-primary-text)] transition-transform duration-200" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--color-border)] py-2 animate-scale-in">
                            <div className="px-4 py-2 border-b border-[var(--color-border)]">
                                <p className="text-sm font-medium text-[var(--color-primary-text)]">User Account</p>
                                <p className="text-xs text-[var(--color-muted)]">user@example.com</p>
                            </div>
                            <button className="w-full text-left px-4 py-2 text-sm text-[var(--color-secondary-text)] hover:bg-gray-50 transition-colors">
                                Profile Settings
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-[var(--color-secondary-text)] hover:bg-gray-50 transition-colors">
                                API Keys
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-[var(--color-secondary-text)] hover:bg-gray-50 transition-colors">
                                Preferences
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
