'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  CalendarClock,
  Send,
  MessageSquare,
  FileText,
  FileCheck,
  LayoutTemplate,
  BarChart3,
  UserCheck,
  Settings,
} from '@/components/Icons';
import UserMenu from '@/components/UserMenu';

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    setMobileMenuOpen((prev) => !prev);
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Schools', href: '/schools', icon: Building2 },
    { label: 'Contacts', href: '/contacts', icon: Users },
    { label: 'Follow-ups', href: '/follow-ups', icon: CalendarClock },
    { label: 'Campaigns', href: '/campaigns', icon: Send },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Proposals', href: '/proposals', icon: FileText },
    { label: 'MOU', href: '/mou', icon: FileCheck },
    { label: 'Templates', href: '/templates', icon: LayoutTemplate },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    ...(user?.role === 'ADMIN'
      ? [{ label: 'Users', href: '/users', icon: UserCheck }]
      : []),
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          {/* Hamburger Toggle Button (Desktop & Mobile) */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-1 bg-white rounded-xl group-hover:scale-105 transition-transform shadow-md">
              <img src="/logo.jpg" alt="Mera Innovation" className="w-8 h-8 object-contain rounded-lg" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                Mera Innovation
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider -mt-1 block">
                School Outreach CRM
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-slate-800/80 rounded-xl border border-slate-700/60 px-3 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            <span>Environment: Production Ready</span>
          </div>

          <UserMenu user={user} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar (Collapsible with Hamburger) */}
        <aside
          className={`bg-slate-900 text-slate-300 border-r border-slate-800 hidden md:flex flex-col justify-between py-4 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <nav className="px-2 space-y-1 overflow-y-auto">
            {sidebarOpen && (
              <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Navigation
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800 hover:text-white'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="px-4 pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs">
                <div className="font-semibold text-white mb-0.5">Mera Innovation</div>
                <p className="text-[11px] text-slate-400">
                  School Sales Pipeline & STEM Outreach
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Backdrop & Drawer */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40"
          />
        )}

        <aside
          className={`md:hidden fixed top-16 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 flex flex-col justify-between py-4 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="px-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs">
              <div className="font-semibold text-white mb-0.5">Mera Innovation</div>
              <p className="text-[11px] text-slate-400">
                School Sales Pipeline & STEM Outreach
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
