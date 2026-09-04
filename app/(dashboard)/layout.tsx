import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
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
import { ensureLogoCopied } from '@/app/api/copy-logo/route';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ensureLogoCopied();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

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
    ...(user.role === 'ADMIN'
      ? [{ label: 'Users', href: '/users', icon: UserCheck }]
      : []),
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return <DashboardShell user={user} navItems={navItems}>{children}</DashboardShell>;
}
