import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();

    // Clear all session cookies
    cookieStore.delete('siwe_nonce');
    cookieStore.delete('session');
    cookieStore.delete('session_address'); // Legacy, keep for cleanup

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
