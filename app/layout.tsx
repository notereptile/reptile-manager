'use client';

import './globals.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  return (
    <html lang="ko">
      <body suppressHydrationWarning={true} className="flex min-h-screen bg-gray-50 text-black">
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 sticky top-0 h-screen">
          <div className="text-2xl font-black italic text-green-700 mb-10 tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
            REPTILE P.
          </div>
          
          <nav className="flex flex-col gap-4 font-bold text-gray-400 flex-1">
            <a href="/" className="hover:text-black transition-colors">홈</a>
            {user && (
              <>
                <a href="/my-reptiles" className="hover:text-black transition-colors">내 개체 관리</a>
                <a href="/add" className="hover:text-black transition-colors">새 개체 등록</a>
                <a href="/profile" className="hover:text-black transition-colors">프로필 설정</a>
              </>
            )}
            <a href="/search" className="hover:text-black transition-colors">전체 검색</a>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-xl">👤</div>}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black truncate w-32">{profile?.display_name || user.email}</span>
                  <button onClick={() => supabase.auth.signOut()} className="text-left text-[10px] font-black text-red-400">LOGOUT</button>
                </div>
              </div>
            ) : (
              <a href="/login" className="text-xs font-black text-blue-500">LOGIN / SIGNUP</a>
            )}
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}