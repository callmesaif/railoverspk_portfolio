import '../globals.css';
import './glass.css';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin | RaiLoversPK' };

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}