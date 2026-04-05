'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyReptilesPage() {
  const [myReptiles, setMyReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputWeight, setInputWeight] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  // 데이터 불러오기 함수
  const fetchMyData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('reptiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMyReptiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMyData(); }, []);

  // 피딩 체크
  const handleFeedingCheck = async (e: React.MouseEvent, reptileId: number, name: string) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('feeding_logs')
      .insert([{ reptile_id: reptileId, food_type: '기본 급여' }]);

    if (error) alert("기록 실패: " + error.message);
    else alert(`${name} 피딩 완료! 🦗`);
  };

  // 몸무게 로그 추가
  const handleWeightSubmit = async (e: React.MouseEvent, reptileId: number) => {
    e.stopPropagation();
    const weight = inputWeight[reptileId];
    if (!weight || isNaN(Number(weight))) return alert("숫자를 입력하세요.");

    const { error } = await supabase
      .from('weight_logs')
      .insert([{ reptile_id: reptileId, weight: Number(weight) }]);

    if (error) alert("기록 실패: " + error.message);
    else {
      await supabase.from('reptiles').update({ weight: Number(weight) }).eq('id', reptileId);
      alert("몸무게 업데이트 완료!");
      setInputWeight({ ...inputWeight, [reptileId]: '' });
      fetchMyData(); 
    }
  };

  // 삭제 기능
  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (confirm(`'${name}' 정보를 삭제하시겠습니까?`)) {
      const { error } = await supabase.from('reptiles').delete().eq('id', id);
      if (error) alert("삭제 실패: " + error.message);
      else fetchMyData();
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-black italic text-green-700 animate-pulse uppercase">
      Loading My Collection...
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-black animate-in fade-in duration-700">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">My Collection</h1>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Total: {myReptiles.length} Reptiles</p>
        </div>
        <button 
          onClick={() => router.push('/add-reptile')}
          className="bg-black text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-700 transition-all shadow-xl"
        >
          + Add New
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {myReptiles.map((r) => (
          <div 
            key={r.id}
            onClick={() => router.push(`/reptile/${r.id}`)}
            className="group bg-white border border-gray-100 rounded-[50px] shadow-sm hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden flex flex-col"
          >
            {/* 개체 사진 (상단) */}
            <div className="h-80 bg-gray-50 overflow-hidden relative border-b border-gray-50">
              {r.image_url ? (
                <img src={r.image_url} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-10 grayscale">🦎</div>
              )}
              
              {/* 호버 시 나타나는 수정/삭제 버튼 */}
              <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/edit/${r.id}`); }}
                  className="w-11 h-11 bg-white/90 backdrop-blur shadow-xl rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-black/5"
                >
                  ✏️
                </button>
                <button 
                  onClick={(e) => handleDelete(e, r.id, r.name)}
                  className="w-11 h-11 bg-white/90 backdrop-blur shadow-xl rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-black/5"
                >
                  🗑️
                </button>
              </div>
              
              <div className="absolute top-6 left-6 bg-black/80 backdrop-blur text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                {r.gender || 'Unknown'}
              </div>
            </div>

            {/* 개체 정보 & 기록 버튼 (하단) */}
            <div className="p-8 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{r.species}</p>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter group-hover:text-green-700 transition-colors">
                    {r.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Weight</p>
                  <p className="text-2xl font-black italic text-gray-800">{r.weight}g</p>
                </div>
              </div>

              {/* 실시간 기록 미니 버튼 섹션 */}
              <div className="mt-auto pt-6 border-t border-gray-100 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                {/* 몸무게 입력 */}
                <div className="flex items-center bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100 focus-within:ring-1 ring-gray-200 transition-all">
                  <input 
                    type="number" 
                    placeholder="NEW G"
                    value={inputWeight[r.id] || ''}
                    onChange={(e) => setInputWeight({...inputWeight, [r.id]: e.target.value})}
                    className="w-full bg-transparent border-none text-[10px] font-black outline-none p-1 placeholder:text-gray-300"
                  />
                  <button 
                    onClick={(e) => handleWeightSubmit(e, r.id)}
                    className="bg-black text-white w-7 h-7 rounded-full text-[8px] font-black flex items-center justify-center hover:bg-green-700 shrink-0"
                  >
                    LOG
                  </button>
                </div>

                {/* 피딩 체크 */}
                <button 
                  onClick={(e) => handleFeedingCheck(e, r.id, r.name)}
                  className="bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-green-100"
                >
                  FEEDING 🦗
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}