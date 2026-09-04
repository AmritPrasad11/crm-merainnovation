import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
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

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
