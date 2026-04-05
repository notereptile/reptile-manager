'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const SPECIES_OPTIONS = ['크레스티드 게코', '레오파드 게코', '펫테일 게코', '기타 게코', '통합 파충류', '양서류'];
const MORPH_OPTIONS: { [key: string]: string[] } = {
  '크레스티드 게코': ['노말', '루왁', '릴리화이트', '하이포', '아잔틱', '초초', '카푸치노', '파이드', '프라푸치노', '100%헷아잔틱', '100%헷초초', '바이', '트라이', '패턴리스', '팬텀', '달마시안', '드리피', '벅스킨', '브린들', '솔리드백', '슈퍼스트라이프', '엠티백', '익스트림할리퀸', '플레임', '쿼드', '풀핀', '핀스트라이프', '할리퀸', '화이트스팟', '화이트크라운', '화이트포트홀', '화이트핀', '다크', '레드', '블랙', '스트로베리', '옐로우', '챠콜', '크림', '크림시클', '타이거', '텐저린', '할로윈', '화이트'],
  '레오파드 게코': ['갤럭시', '고스트', '그린', '노멀', '다크', '데빌', '디아블로블랑코', '라벤더', '랩터', '레드', '만다린', '머피 패턴리스', '벨', '볼드', '블랙나이트', '블러드', '블레이징블리자드', '블리자드', '사이퍼', '선라이즈', '선셋', '슈퍼스노우', '슈퍼하이포', '스노우', '스트라이프', '썬글로우', '아토믹', '알비노', '옐로우', '이클립스', '인페르노', '일렉트릭', '자이언트', '정글', '캐롯', '텐저린', '트램퍼알비노', '할로윈', '화이트', 'GG', 'GT', 'W&Y'],
  '펫테일 게코': ['고스트', '노멀', '슈퍼 제로', '스팅어', '아멜라니스틱', '오레오', '제로', '줄루', '카라멜', '패턴리스', '헷 고스트', '헷 아멜라니스틱', '헷 오레오', '헷 줄루', '헷 카라멜', '헷 패턴리스', '화이트아웃']
};
const GENDER_OPTIONS = ['미구분', '암컷', '수컷'];
const SIZE_OPTIONS = ['베이비', '아성체', '성체'];

export default function SearchPage() {
  const [reptiles, setReptiles] = useState<any[]>([]);
  const [filteredReptiles, setFilteredReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedMorphs, setSelectedMorphs] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase.from('reptiles').select('*').order('created_at', { ascending: false });
      setReptiles(data || []);
      setFilteredReptiles(data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let result = reptiles;
    if (selectedSpecies) result = result.filter(r => r.species === selectedSpecies);
    if (selectedMorphs.length > 0) result = result.filter(r => selectedMorphs.includes(r.morph));
    if (selectedGenders.length > 0) result = result.filter(r => selectedGenders.includes(r.gender));
    if (selectedSizes.length > 0) result = result.filter(r => selectedSizes.includes(r.size));
    setFilteredReptiles(result);
  }, [selectedSpecies, selectedMorphs, selectedGenders, selectedSizes, reptiles]);

  const toggleMulti = (list: string[], setList: any, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  if (loading) return <div className="p-10 text-center font-bold text-black">검색 시스템 준비 중...</div>;

  return (
    <div className="p-6 text-black">
      <h1 className="text-3xl font-black mb-8 italic text-blue-600">SEARCH & FILTER 🔍</h1>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10 flex flex-col gap-8">
        <div>
          <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Species</p>
          <div className="flex flex-wrap gap-2">
            {SPECIES_OPTIONS.map(s => (
              <button key={s} onClick={() => { setSelectedSpecies(selectedSpecies === s ? '' : s); setSelectedMorphs([]); }} 
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedSpecies === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {selectedSpecies && MORPH_OPTIONS[selectedSpecies] && (
          <div className="animate-in fade-in duration-500">
            <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Morphs</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-3xl">
              {MORPH_OPTIONS[selectedSpecies].map(m => (
                <button key={m} onClick={() => toggleMulti(selectedMorphs, setSelectedMorphs, m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMorphs.includes(m) ? 'bg-blue-500 text-white' : 'bg-white text-blue-400 border border-blue-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Gender</p>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map(g => (
                <button key={g} onClick={() => toggleMulti(selectedGenders, setSelectedGenders, g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold ${selectedGenders.includes(g) ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Size</p>
            <div className="flex gap-2">
              {SIZE_OPTIONS.map(sz => (
                <button key={sz} onClick={() => toggleMulti(selectedSizes, setSelectedSizes, sz)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold ${selectedSizes.includes(sz) ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReptiles.map((r) => (
          <div key={r.id} onClick={() => router.push(`/reptile/${r.id}`)} className="bg-white p-4 rounded-[30px] shadow-sm border border-gray-50 cursor-pointer hover:shadow-lg transition-all">
            <div className="h-44 bg-gray-50 rounded-[20px] mb-4 overflow-hidden">
              {r.image_url ? <img src={r.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🦎</div>}
            </div>
            <h3 className="text-xl font-black mb-1">{r.name}</h3>
            <p className="text-blue-600 text-[10px] font-bold uppercase">{r.species} · {r.morph}</p>
          </div>
        ))}
      </div>
    </div>
  );
}