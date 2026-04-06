'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

export default function ReptileDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [reptile, setReptile] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      try {
        // 1. 조회수(views) 1 증가시키기 (RPC 함수 사용 권장되나 없으면 직접 업데이트)
        await supabase.rpc('increment_views', { row_id: Number(id) }) 
        // 만약 위 RPC가 안된다면 아래 주석 해제하여 직접 업데이트 사용:
        // await supabase.from('reptiles').update({ views: (reptile?.views || 0) + 1 }).eq('id', Number(id));

        // 2. 개체 정보 조회
        const { data: reptileData, error: rError } = await supabase
          .from('reptiles')
          .select('*')
          .eq('id', Number(id))
          .single();

        if (rError) throw rError;

        // 3. 작성자 프로필 별도 조회
        let profile = null;
        if (reptileData.user_id) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', reptileData.user_id)
            .single();
          profile = pData;
        }

        // 4. 몸무게 기록 조회
        const { data: weights } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('reptile_id', Number(id))
          .order('date', { ascending: true });

        setReptile({ ...reptileData, profiles: profile });
        setWeightLogs(weights || []);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // 좋아요 버튼 클릭 함수
  const handleLike = async () => {
    if (isLiking || !reptile) return;
    setIsLiking(true);
    try {
      const { data, error } = await supabase
        .from('reptiles')
        .update({ likes: (reptile.likes || 0) + 1 })
        .eq('id', Number(id))
        .select()
        .single();

      if (!error) {
        setReptile({ ...reptile, likes: data.likes });
      }
    } catch (err) {
      console.error("좋아요 실패:", err);
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic text-green-700 animate-pulse">LOADING SYSTEM...</div>;
  if (!reptile) return <div className="p-20 text-center font-black">개체 정보를 가져올 수 없습니다.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-black animate-in fade-in duration-1000">
      {/* 상단 헤더: 뒤로가기 & QR */}
      <div className="flex justify-between items-start mb-10">
        <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">
          ← Back
        </button>
        
        <div className="flex items-center gap-6">
           {/* 조회수 표시 */}
           <div className="text-right">
              <p className="text-[8px] font-black text-gray-400 uppercase">Views</p>
              <p className="text-lg font-black italic">{reptile.views || 0}</p>
           </div>
           <div className="flex flex-col items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
             <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : ''} size={64} />
             <span className="text-[8px] font-black text-gray-400 uppercase">ID TAG QR</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
        {/* 좌측 이미지 섹션 */}
        <div className="lg:col-span-6 space-y-6">
          <div className="aspect-square bg-gray-100 rounded-[60px] overflow-hidden shadow-2xl relative group border border-gray-100">
            {reptile.image_url ? (
              <img src={reptile.image_url} alt={reptile.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">🦎</div>
            )}
            <div className="absolute top-8 left-8 bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              {reptile.gender || '미구분'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Father</p>
                <p className="font-bold text-sm">{reptile.father_morph || '—'}</p>
             </div>
             <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                <p className="text-[9px] font-black text-pink-500 uppercase mb-1">Mother</p>
                <p className="font-bold text-sm">{reptile.mother_morph || '—'}</p>
             </div>
          </div>
        </div>

        {/* 우측 상세 정보 섹션 */}
        <div className="lg:col-span-6 flex flex-col justify-start pt-4">
          <div className="mb-10">
            <p className="text-green-600 font-black text-sm uppercase tracking-[0.3em] mb-3">{reptile.species || 'Crested Gecko'}</p>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none mb-6">{reptile.name}</h1>
            
            {/* 성장 그래프 영역 */}
            <div className="mt-10">
              <h3 className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Weight Growth (g)
              </h3>
              <div className="h-44 w-full bg-gray-50 rounded-[30px] p-4 border border-gray-100">
                {weightLogs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightLogs}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase italic">No records for chart</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-10 gap-x-12 mb-10 border-t border-gray-100 py-10">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Morph</p>
              <p className="text-2xl font-black italic uppercase">{reptile.morph || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Current Weight</p>
              <p className="text-2xl font-black italic">{reptile.weight}g</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Feeding</p>
              <p className="text-xl font-black uppercase text-gray-700">{reptile.feeding_day || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Hatching</p>
              <p className="text-xl font-black text-gray-700">{reptile.hatching_date || '—'}</p>
            </div>
          </div>

          {/* 하단 작성자 카드 + 좋아요 */}
          <div className="flex items-center justify-between bg-black text-white p-6 rounded-[30px] shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                {reptile.profiles?.avatar_url && <img src={reptile.profiles.avatar_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-500 uppercase">Manager</span>
                <span className="text-sm font-black italic">{reptile.profiles?.display_name || "Anonymous"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* 좋아요 버튼 */}
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className="flex flex-col items-center group transition-transform active:scale-90"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
                <span className="text-[10px] font-black italic">{reptile.likes || 0}</span>
              </button>

              <div className="text-right border-l border-gray-800 pl-6">
                <span className="text-[8px] font-black text-gray-500 uppercase block">Registered At</span>
                <span className="text-[10px] font-bold italic">{new Date(reptile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 갤러리 섹션 */}
      <section className="pt-20 border-t border-gray-100">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-200">
          <div className="aspect-square rounded-[40px] border-2 border-dashed border-gray-200 flex items-center justify-center font-black text-xs uppercase cursor-pointer hover:bg-gray-50 transition-colors">
            + Add Photo
          </div>
        </div>
      </section>
    </div>
  );
}