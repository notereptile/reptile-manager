'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [newReptiles, setNewReptiles] = useState<any[]>([]);
  const [popularReptiles, setPopularReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 현재 보고 있는 카테고리 상태 (null이면 홈, 'popular'나 'new'면 전체보기)
  const [viewCategory, setViewCategory] = useState<null | 'popular' | 'new'>(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data: allData } = await supabase
          .from('reptiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (allData) {
          const userIds = Array.from(new Set(allData.map(r => r.user_id).filter(id => id)));
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          const combined = allData.map(r => ({
            ...r,
            profiles: profileData?.find(p => p.id === r.user_id) || null
          }));

          setNewReptiles(combined); // 전체를 New 순으로 저장
          setPopularReptiles([...combined].sort((a, b) => b.weight - a.weight)); // 무게순으로 정렬해서 Popular 저장
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <div className="p-20 text-center font-black italic text-green-700 animate-pulse uppercase">Syncing...</div>;

  // 개체 카드 컴포넌트
  const ReptileCard = ({ r }: { r: any }) => (
    <div 
      onClick={() => router.push(`/reptile/${r.id}`)}
      className="group bg-white border border-gray-100 rounded-[50px] shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="h-64 bg-gray-50 overflow-hidden relative">
        {r.image_url ? (
          <img src={r.image_url} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-10 grayscale">🦎</div>
        )}
      </div>
      <div className="p-8">
        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{r.species}</p>
        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-green-700 transition-colors">{r.name}</h3>
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
              {r.profiles?.avatar_url && <img src={r.profiles.avatar_url} className="w-full h-full object-cover" />}
            </div>
            <span className="text-[10px] font-bold text-gray-500 italic">{r.profiles?.display_name || "Anonymous"}</span>
          </div>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{r.weight}g</span>
        </div>
      </div>
    </div>
  );

  // --- 1. 전체보기 모드 (카테고리 클릭 시) ---
  if (viewCategory) {
    const list = viewCategory === 'popular' ? popularReptiles : newReptiles;
    const title = viewCategory === 'popular' ? '🏆 Popular Collection' : '✨ All New Arrivals';

    return (
      <div className="p-8 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">{title}</h2>
          <button 
            onClick={() => setViewCategory(null)}
            className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all"
          >
            ← Back to Home
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {list.map(r => <ReptileCard key={r.id} r={r} />)}
        </div>
      </div>
    );
  }

  // --- 2. 일반 홈 화면 모드 ---
  return (
    <div className="p-8 max-w-7xl mx-auto text-black animate-in fade-in duration-700">
      
      {/* Popular 섹션 */}
      <section className="mb-24">
        <div 
          onClick={() => setViewCategory('popular')} // 클릭 시 카테고리 보기로 전환
          className="flex items-center gap-4 mb-10 cursor-pointer group"
        >
          <h2 className="text-5xl font-black italic uppercase tracking-tighter group-hover:text-green-700 transition-colors">
            🏆 Popular
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black transition-all">View All →</span>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {popularReptiles.slice(0, 3).map(r => <ReptileCard key={r.id} r={r} />)}
        </div>
      </section>

      {/* New Arrivals 섹션 */}
      <section className="mb-20">
        <div 
          onClick={() => setViewCategory('new')} // 클릭 시 카테고리 보기로 전환
          className="flex items-center gap-4 mb-10 cursor-pointer group"
        >
          <h2 className="text-5xl font-black italic uppercase tracking-tighter group-hover:text-green-700 transition-colors">
            ✨ New Arrivals
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black transition-all">View All →</span>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newReptiles.slice(0, 6).map(r => <ReptileCard key={r.id} r={r} />)}
        </div>
      </section>

    </div>
  );
}