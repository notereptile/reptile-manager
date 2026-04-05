'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // public.profiles라고 명시적으로 호출 시도
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // single() 대신 maybeSingle() 사용으로 에러 방지

    if (data) {
      setDisplayName(data.display_name || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '');
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      let newAvatarUrl = avatarUrl;
      if (imageFile) {
        const fileName = `avatars/${user.id}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('REPTILE-IMAGES')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        newAvatarUrl = supabase.storage.from('REPTILE-IMAGES').getPublicUrl(fileName).data.publicUrl;
      }

      // 데이터 삽입/업데이트 (upsert)
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName,
        bio: bio,
        avatar_url: newAvatarUrl,
        updated_at: new Date(),
      }, { onConflict: 'id' }); // id가 겹치면 업데이트하도록 명시

      if (error) throw error;
      alert('프로필이 저장되었습니다! ✨');
      router.push('/'); // 저장 후 홈으로 이동
    } catch (err: any) {
      alert('오류 발생: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-gray-200 italic tracking-tighter">Connecting to Database...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto text-black">
      <h1 className="text-4xl font-black italic mb-10 text-green-700 uppercase tracking-tighter">My Profile</h1>
      <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-gray-50 overflow-hidden border border-gray-100 shadow-inner">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
          </div>
          <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-[10px] font-bold text-gray-300" />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-300 mb-2 block uppercase">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="닉네임" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-300 mb-2 block uppercase">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="소개글" className="w-full p-6 bg-gray-50 rounded-[30px] h-32 font-medium outline-none resize-none" />
        </div>
        <button type="submit" disabled={updating} className="w-full p-5 bg-black text-white rounded-3xl font-black text-lg">
          {updating ? 'SAVING...' : 'SAVE PROFILE ✨'}
        </button>
      </form>
    </div>
  );
}