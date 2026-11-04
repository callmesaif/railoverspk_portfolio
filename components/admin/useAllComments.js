'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Live comments for many parents at once.
 * parents = [{ type: 'posts' | 'reviews', id, title }]
 * Returns { comments, ready } — comments is a flat list tagged with type / parentId / parentTitle.
 */
export default function useAllComments(parents) {
  const [byParent, setByParent] = useState({});
  const key = parents.map(p => `${p.type}/${p.id}`).join('|');

  useEffect(() => {
    const unsubs = parents.map(p => {
      const k = `${p.type}/${p.id}`;
      return onSnapshot(
        collection(db, p.type, p.id, 'comments'),
        snap => setByParent(prev => ({
          ...prev,
          [k]: snap.docs.map(d => ({ id: d.id, type: p.type, parentId: p.id, parentTitle: p.title, ...d.data() })),
        })),
        () => setByParent(prev => ({ ...prev, [k]: [] }))
      );
    });
    return () => unsubs.forEach(u => u());
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const comments = useMemo(
    () => parents.flatMap(p => byParent[`${p.type}/${p.id}`] || []),
    [byParent, key] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const ready = parents.every(p => `${p.type}/${p.id}` in byParent);

  return { comments, ready };
}