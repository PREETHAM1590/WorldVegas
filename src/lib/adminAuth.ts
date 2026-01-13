import { cookies } from 'next/headers';

export interface AdminSession {
  adminId: string;
  address: string;
  role: string;
  exp: number;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: AdminSession = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    );

    if (!session.adminId || !session.exp || session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
