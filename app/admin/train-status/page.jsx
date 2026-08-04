import TrainStatusManager from '@/components/admin/TrainStatusForm';

export const metadata = { title: 'Train Status — Admin' };

export default function TrainStatusPage() {
  return (
    <main style={{ padding: '2.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' }}>
          Live Updates
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1, color: '#fff' }}>
          Train Status
        </h1>
      </div>
      <TrainStatusManager />
    </main>
  );
}