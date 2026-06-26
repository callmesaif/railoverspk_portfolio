import '../globals.css';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin — RaiLoversPK',
};

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#050508' }}>
        <AdminSidebar />
        <div style={{ flex: 1, overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </AdminAuthProvider>
  );
}
