'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/'); 
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Note Reptile</h1>
          <p className="text-gray-500 mt-2">기록으로 완성되는 브리딩 매니저</p>
        </div>

        <div className="space-y-6">
          <input 
            type="email" placeholder="이메일" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <input 
            type="password" placeholder="비밀번호" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <button 
            onClick={handleLogin} disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-gray-800"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-sm text-gray-500">
            아직 회원이 아니신가요? {' '}
            <Link href="/signup" className="text-green-600 hover:underline font-semibold">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}