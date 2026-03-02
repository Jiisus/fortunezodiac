/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, RefreshCw, Share2, Link as LinkIcon, Instagram, MessageCircle, Heart } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getDailyFortune, FortuneItem } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ZODIAC_ICONS: Record<string, string> = {
  '쥐띠': '🐭',
  '소띠': '🐮',
  '호랑이띠': '🐯',
  '토끼띠': '🐰',
  '용띠': '🐲',
  '뱀띠': '🐍',
  '말띠': '🐴',
  '양띠': '🐑',
  '원숭이띠': '🐵',
  '닭띠': '🐔',
  '개띠': '🐶',
  '돼지띠': '🐷',
};

export default function App() {
  const [fortunes, setFortunes] = useState<FortuneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const today = new Date();
  const dateString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const fetchFortune = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyFortune(dateString);
      setFortunes(data);
    } catch (err) {
      setError('운세를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFortune();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] -z-10 animate-pulse" />

      {/* Header Section */}
      <header className="text-center mb-16 space-y-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/40 text-purple-600 text-xs font-bold uppercase tracking-widest shadow-sm"
        >
          <Calendar size={14} />
          <span>{dateString}</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500"
        >
          오늘의 십이간지 운세
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-purple-400/80 font-semibold max-w-xl mx-auto"
        >
          매일 아침 9시, 오늘의 운세 확인하고 <span className="text-purple-600 font-bold underline decoration-pink-300 underline-offset-4">행운 키워드</span>로 일본어도 공부해요!
        </motion.p>

        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all jelly-shadow active:scale-95"
          >
            <Share2 size={18} />
            공유하기
          </button>
          
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-4 p-2 glass rounded-2xl flex gap-2 z-50 shadow-2xl"
              >
                <button onClick={handleCopyLink} className="p-3 hover:bg-white/60 rounded-xl transition-colors text-purple-600" title="링크 복사">
                  <LinkIcon size={20} />
                </button>
                <button className="p-3 hover:bg-white/60 rounded-xl transition-colors text-yellow-600" title="카카오톡 공유">
                  <MessageCircle size={20} />
                </button>
                <button className="p-3 hover:bg-white/60 rounded-xl transition-colors text-pink-600" title="인스타그램 공유">
                  <Instagram size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="text-pink-400 animate-pulse" size={24} fill="currentColor" />
              </div>
            </div>
            <p className="text-purple-600 font-display font-bold uppercase tracking-[0.3em] text-xs">Reading the Stars...</p>
          </div>
        ) : error ? (
          <div className="glass p-10 rounded-[2.5rem] text-center max-w-md mx-auto">
            <p className="text-purple-900 font-bold mb-6">{error}</p>
            <button 
              onClick={fetchFortune}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all jelly-shadow"
            >
              다시 시도하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {fortunes.map((item, index) => (
                <motion.div
                  key={item.animal}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                  className={cn(
                    "group relative glass p-8 rounded-[2.5rem] transition-all hover:scale-[1.02] hover:bg-white/60",
                    item.rank <= 3 && "ring-2 ring-purple-300/50 bg-white/50"
                  )}
                >
                  <div className="flex flex-col gap-6">
                    {/* Header: Icon + Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl shadow-inner group-hover:animate-float">
                          {ZODIAC_ICONS[item.animal] || '✨'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-display font-black text-purple-900">{item.animal}</h3>
                            <span className="text-sm font-medium text-purple-400">/ {item.animalJapanese}</span>
                          </div>
                          <div className={cn(
                            "inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mt-1",
                            item.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                            item.rank === 2 ? "bg-slate-200 text-slate-600" :
                            item.rank === 3 ? "bg-orange-200 text-orange-700" :
                            "bg-purple-100 text-purple-400"
                          )}>
                            Rank {item.rank}
                          </div>
                        </div>
                      </div>
                      {item.rank === 1 && (
                        <div className="bg-pink-500 text-white p-2 rounded-2xl shadow-lg shadow-pink-200">
                          <Sparkles size={20} />
                        </div>
                      )}
                    </div>

                    {/* Keyword Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-400" />
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Lucky Keyword</span>
                      </div>
                      <div className="bg-white/80 p-4 rounded-2xl border border-purple-100 shadow-sm">
                        <div className="markdown-body text-base font-bold text-purple-700">
                          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {item.luckyKeyword}
                          </Markdown>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[15px] text-purple-900/70 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="mt-24 w-full pt-12 border-t border-purple-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-[0.3em] text-purple-300">
        <p>© 2026 JELLY ZODIAC ARCHIVE</p>
        <div className="flex gap-8 items-center">
          <button onClick={fetchFortune} className="flex items-center gap-2 hover:text-purple-600 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="w-1 h-1 bg-purple-100 rounded-full" />
          <p className="flex items-center gap-1">Made with <Heart size={12} className="text-pink-400" fill="currentColor" /> for you</p>
        </div>
      </footer>
    </div>
  );
}
