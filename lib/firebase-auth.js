import { getAuth } from 'firebase/auth';
import app from '@/lib/firebase';

// Admin-only. Importing this pulls in the Auth SDK, so never import it from public pages.
export const auth = getAuth(app);
