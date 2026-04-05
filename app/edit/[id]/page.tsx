'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

const SPECIES_OPTIONS = ['크레스티드 게코', '레오파드 게코', '펫테일 게코', '기타 게코', '통합 파충류', '양서류'];
const DAY_OPTIONS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '매일'];
const MORPH_OPTIONS: { [key: string]: string[] } = {
  '크레스티드 게코': ['노말', '루왁', '릴리화이트', '하이포', '아잔틱', '초초', '카푸치노', '파이드', '프라푸치노', '바이', '트라이', '패턴리스', '팬텀', '달마시안', '익스트림할리퀸', '플레임', '핀스트라이프', '할리퀸'],
  '레오파드 게코': ['갤럭시', '노멀', '다크', '데빌', '디아블로블랑코', '라벤더', '랩터', '만다린', '블랙나이트', '슈퍼스노우', '알비노', '이클립스', '텐저린'],
  '펫테일 게코': ['고스트', '노멀', '슈퍼 제로', '아멜라니스틱', '오레오', '제로', '줄루', '화이트아웃']
};

export default function EditReptilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [morph, setMorph] = useState('');
  const [gender, setGender] = useState('미구분');
  const [size, setSize] = useState('베이비');
  const [weight, setWeight] = useState('');
  const [hatchingDate, setHatchingDate] = useState('');
  const [feedingDays, setFeedingDays] = useState<string[]>([]); // 중복 선택을 위해 배열로 변경
  const [foodType, setFoodType] = useState('');
  const [fatherMorph, setFatherMorph] = useState('');
  const [motherMorph, setMotherMorph] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    const fetchReptile = async () => {
      const { data, error } = await supabase.from('reptiles').select('*').eq('id', id).single();
      if (data && !error) {
        setName(data.name || '');
        setSpecies(data.species || '');
        setMorph(data.morph || '');
        setGender(data.gender || '미구분');
        setSize(data.size || '베이비');
        setWeight(data.weight?.toString() || '');
        setHatchingDate(data.hatching_date || '');
        // 기존 데이터가 문자열이면 배열로 변환해서 가져옴
        setFeedingDays(data.feeding_day ? data.feeding_day.split(', ') : []);
        setFoodType(data.food_type || '');
        setFatherMorph(data.father_morph || '');
        setMotherMorph(data.mother_morph || '');
        setMemo(data.memo || '');
      }
      setLoading(false);
    };
    fetchReptile();
  }, [id]);

  // 요일 중복 선택 처리 함수
  const toggleDay = (day: string) => {
    if (day === '매일') {
      setFeedingDays(['매일']);
      return;
    }
    const newDays = feedingDays.includes(day)
      ? feedingDays.filter(d => d !== day)
      : [...feedingDays.filter(d => d !== '매일'), day];
    setFeedingDays(newDays);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase.from('reptiles').update({
        name, species, morph, gender, size,
        weight: Number(weight),
        hatching_date: hatchingDate,
        feeding_day: feedingDays.join(', '), // 배열을 다시 문자열로 합쳐서 저장
        food_type: foodType,
        father_morph: fatherMorph,
        mother_morph: motherMorph,
        memo
      }).eq('id', id);

      if (error) throw error;
      alert('성공적으로 수정되었습니다! 🦎✨');
      router.push('/my-reptiles');
    } catch (err: any) {
      alert('수정 실패: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-gray-300 italic">LOADING DATA...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto text-black">
      <h1 className="text-3xl font-black mb-10 italic text-blue-600 uppercase tracking-tighter">Edit Profile</h1>
      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-8">
        
        <div className="grid grid-cols-2 gap-6">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="이름" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
          <input type="date" value={hatchingDate} onChange={(e) => setHatchingDate(e.target.value)} className="p-4 bg-gray-50 rounded-2xl font-bold outline-none text-gray-400" />
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-300 mb-2 block uppercase">Species</label>
          <div className="flex flex-wrap gap-2">
            {SPECIES_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => { setSpecies(s); setMorph(''); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${species === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* 모프 선택창 - 종을 선택해야 나타납니다 */}
        {species && MORPH_OPTIONS[species] && (
          <div>
            <label className="text-[10px] font-black text-gray-300 mb-2 block uppercase">Morph</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-3xl border border-gray-100">
              {MORPH_OPTIONS[species].map(m => (
                <button key={m} type="button" onClick={() => setMorph(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${morph === m ? 'bg-black text-white' : 'bg-white text-blue-400 border border-blue-100'}`}>{m}</button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-black text-blue-400 mb-2 block uppercase">Feeding Days (중복 선택 가능)</label>
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map(d => (
              <button key={d} type="button" onClick={() => toggleDay(d)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${feedingDays.includes(d) ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-300'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <input value={foodType} onChange={(e) => setFoodType(e.target.value)} placeholder="주요 먹이" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="몸무게 (g)" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <input value={fatherMorph} onChange={(e) => setFatherMorph(e.target.value)} placeholder="아빠 모프" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
          <input value={motherMorph} onChange={(e) => setMotherMorph(e.target.value)} placeholder="엄마 모프" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
        </div>

        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모" className="w-full p-6 bg-gray-50 rounded-[30px] h-32 font-medium outline-none" />

        <button type="submit" disabled={updating} className="w-full p-5 bg-black text-white rounded-3xl font-black text-lg hover:bg-blue-600 transition-all shadow-lg">
          {updating ? 'SAVING...' : 'UPDATE COMPLETE ✨'}
        </button>
      </form>
    </div>
  );
}