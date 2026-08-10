import TrainForm from '@/components/admin/TrainForm';
import Link from 'next/link';

export const metadata = { title: 'New Train — Admin' };

export default function NewTrainPage() {
  return (
    <main style={{ padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' }}>Train Database</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 }}>New Train</h1>
        </div>
        <Link href="/admin/trains" style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Back</Link>
      </div>
      <TrainForm />
    </main>
  );
}