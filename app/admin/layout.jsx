import '../globals.css';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin — RaiLoversPK' };

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="rl-admin-layout">
        <AdminSidebar />
        <div className="rl-admin-content">
          {children}
        </div>
      </div>
    </AdminAuthProvider>
  );
}
