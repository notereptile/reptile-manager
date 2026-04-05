'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const SPECIES_OPTIONS = ['크레스티드 게코', '레오파드 게코', '펫테일 게코', '기타 게코', '통합 파충류', '양서류'];
const DAY_OPTIONS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '매일'];

export default function AddReptilePage() {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [morph, setMorph] = useState('');
  const [gender, setGender] = useState('미구분');
  const [size, setSize] = useState('베이비');
  const [weight, setWeight] = useState('');
  const [hatchingDate, setHatchingDate] = useState('');
  const [feedingDay, setFeedingDay] = useState('');
  const [foodType, setFoodType] = useState('');
  const [fatherMorph, setFatherMorph] = useState('');
  const [motherMorph, setMotherMorph] = useState('');
  const [memo, setMemo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      let imageUrl = '';
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('REPTILE-IMAGES').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from('REPTILE-IMAGES').getPublicUrl(fileName).data.publicUrl;
      }

      const { error: insertError } = await supabase.from('reptiles').insert({
        name, species, morph, gender, size, 
        weight: Number(weight), 
        hatching_date: hatchingDate,
        feeding_day: feedingDay, // 최근 피딩일 대신 요일 저장
        food_type: foodType,
        father_morph: fatherMorph,
        mother_morph: motherMorph,
        memo,
        image_url: imageUrl,
        user_id: user.id
      });

      if (insertError) throw insertError;
      alert('성공적으로 등록되었습니다! ✨');
      router.push('/');
    } catch (err: any) {
      alert('오류 발생: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto text-black">
      <h1 className="text-3xl font-black mb-10 italic text-green-700">NEW REPTILE 🦎</h1>
      <form onSubmit={handleSave} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black text-gray-400 mb-2 block">NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 mb-2 block">HATCHING DATE</label>
            <input type="date" value={hatchingDate} onChange={(e) => setHatchingDate(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-gray-400 mb-2 block">SPECIES</label>
          <div className="flex flex-wrap gap-2">
            {SPECIES_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => setSpecies(s)} className={`px-4 py-2 rounded-xl text-sm font-bold ${species === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-gray-400 mb-2 block">MAIN FEEDING DAY (주요 피딩 요일)</label>
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map(d => (
              <button key={d} type="button" onClick={() => setFeedingDay(d)} className={`px-4 py-2 rounded-xl text-xs font-bold ${feedingDay === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <input value={foodType} onChange={(e) => setFoodType(e.target.value)} placeholder="주요 먹이 (예: 귀뚜라미)" className="p-4 bg-gray-50 rounded-2xl font-bold" />
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="몸무게 (g)" className="p-4 bg-gray-50 rounded-2xl font-bold" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black text-gray-400 mb-2 block">FATHER MORPH</label>
            <input value={fatherMorph} onChange={(e) => setFatherMorph(e.target.value)} placeholder="아빠 모프" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 mb-2 block">MOTHER MORPH</label>
            <input value={motherMorph} onChange={(e) => setMotherMorph(e.target.value)} placeholder="엄마 모프" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
          </div>
        </div>

        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="기타 특징 및 메모" className="w-full p-6 bg-gray-50 rounded-[30px] h-32 font-medium" />

        <div>
          <label className="text-xs font-black text-gray-400 mb-2 block">PHOTO</label>
          <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-xs" />
        </div>

        <button type="submit" disabled={uploading} className="w-full p-5 bg-black text-white rounded-3xl font-black text-lg">
          {uploading ? '등록 중...' : '개체 등록 완료 ✨'}
        </button>
      </form>
    </div>
  );
}