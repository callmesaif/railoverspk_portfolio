import Link from 'next/link';
import PostForm from '@/components/admin/PostForm';

export const metadata = { title: 'New Post — Admin' };

export default function NewPostPage() {
  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Blog Posts</div>
          <h1 style={HEADING}>New Post</h1>
        </div>
        <Link href="/admin/posts" style={BACK}>← Back to Posts</Link>
      </div>
      <PostForm />
    </main>
  );
}

const PAGE    = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER  = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const BACK    = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' };
