import React from 'react';
import Layout from '../components/Layout';
import Guestbook from '../components/Guestbook';
import FortuneCookie from '../components/FortuneCookie';
import { UserProfile } from '../types';
import { Instagram, Mail } from 'lucide-react';
import { User } from 'firebase/auth';

interface PageProps {
  user: User | null;
}

const Home: React.FC<PageProps> = ({ user }) => {
  // Static profile data for this demo
  const profile: UserProfile = {
    name: "Choi Yoon Ha",
    birthday: "2007.06.12",
    zodiac: "쌍둥이자리",
    chineseZodiac: "돼지띠",
    bloodType: "A형",
    mbti: "ISFP",
    motto: "꿈은 크게 가져라, 그래야 포기할 때 덜 아깝다.",
    instagram: "@c.y.h_0612",
    email: "chcii1234@naver.com"
  };

  return (
    <Layout title="메인">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Profile (Card Style) */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-2 border-dashed border-cy-orange">
              <img src="https://i.postimg.cc/0Nqz1gbM/1.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold font-pixel mb-1">{profile.name}</h2>
            <p className="text-md font-hand text-gray-600">최윤하 (崔允河)</p>
            <p className="text-sm text-gray-500 mb-4 mt-2 break-keep leading-snug px-2">"{profile.motto}"</p>
            
            <div className="text-left text-sm space-y-1.5 bg-gray-50 p-3 rounded mb-4 border border-gray-100">
              <p className="flex items-center gap-2"><span className="w-4 text-center">🎂</span> {profile.birthday}</p>
              <p className="flex items-center gap-2"><span className="w-4 text-center">♊</span> {profile.zodiac}</p>
              <p className="flex items-center gap-2"><span className="w-4 text-center">🐷</span> {profile.chineseZodiac}</p>
              <p className="flex items-center gap-2"><span className="w-4 text-center">🩸</span> {profile.bloodType}</p>
              <p className="flex items-center gap-2"><span className="w-4 text-center">🧠</span> {profile.mbti}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-pink-600 hover:text-pink-500 transition-colors">
                <Instagram size={18} /> 
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="font-pixel text-sm hover:underline">
                  {profile.instagram}
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600 hover:text-green-500 transition-colors">
                <Mail size={18} /> 
                <a href={`mailto:${profile.email}`} className="font-pixel text-sm hover:underline">
                  {profile.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Fun & Guestbook */}
        <div className="md:col-span-2">
          <FortuneCookie />
          <Guestbook isAdmin={!!user} />
        </div>
        
      </div>
    </Layout>
  );
};

export default Home;