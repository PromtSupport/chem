import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AuthOverlay from './AuthOverlay';
import MoleculeCanvas from './MoleculeCanvas';
import { User } from '../types';
import { useStore } from '../store';
import { PieChart, FileDown, ArrowRight } from 'lucide-react';

export default function Dashboard({ user, onNavigate }: { user: User, onNavigate: (tab: string) => void }) {
  const { catalog, fetchState } = useStore();
  
  const [bestScore, setBestScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    fetchState();
    
    // Load local stats
    const best = parseInt(localStorage.getItem('chem_best_score') || '0', 10);
    const played = parseInt(localStorage.getItem('chem_attempts') || '0', 10);
    const totalCorrect = parseInt(localStorage.getItem('chem_total_correct') || '0', 10);
    const totalClicks = parseInt(localStorage.getItem('chem_total_questions') || '0', 10);
    
    setBestScore(best);
    setAttempts(played);
    if (totalClicks > 0) {
      setAccuracy(Math.round((totalCorrect / totalClicks) * 100));
    }
  }, [fetchState]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 flex flex-col gap-8">
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emeraldAccent/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blueAccent/10 rounded-full blur-[60px] pointer-events-none"></div>
          <p className="text-emeraldAccent text-[10px] font-bold tracking-widest uppercase mb-3">Химическая среда</p>
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-4 drop-shadow-sm">
            {user.role === 'teacher' ? 'Кабинет Учителя' : `С возвращением, ${user.name}`}
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8 max-w-xl">
            Платформа для глубокого изучения химии. Решайте задачи, изучайте справочные материалы и улучшайте свои навыки.
          </p>
          <button 
            onClick={() => onNavigate('catalog')}
            className="bg-white text-black font-bold text-sm uppercase tracking-wide px-6 py-3.5 rounded-2xl hover:bg-slate-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] inline-flex items-center gap-2 relative z-10"
          >
            Открыть каталог <ArrowRight size={16} />
          </button>
        </div>

        {user.role === 'student' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Личный рекорд</span>
                <div className="flex items-end justify-between mt-4">
                  <span className="text-4xl font-display font-medium text-emeraldAccent drop-shadow-md">{bestScore}</span>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Попытки</span>
                <div className="flex items-end justify-between mt-4">
                  <span className="text-4xl font-display font-medium drop-shadow-md">{attempts}</span>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Точность</span>
                <div className="flex items-end justify-between mt-4">
                  <span className="text-4xl font-display font-medium text-blueAccent drop-shadow-md">{accuracy}%</span>
                  <div className="w-16 h-1 bg-black/40 rounded-full overflow-hidden mb-2 shadow-inner">
                    <div className="bg-blueAccent h-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" style={{ width: `${accuracy}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-panel border-t border-white/10 rounded-3xl p-8">
               <h3 className="text-base font-display font-medium uppercase tracking-widest text-white mb-6 flex items-center gap-2">Достижения</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`bg-black/20 border border-white/5 p-4 rounded-3xl flex items-center gap-4 transition-all ${attempts > 0 ? 'border-emeraldAccent/20' : 'opacity-60 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${attempts > 0 ? 'bg-emeraldAccent/10 text-emeraldAccent' : 'bg-white/5'}`}>
                      {attempts > 0 ? '🔬' : '🔒'}
                    </div>
                    <div>
                      <div className={`font-medium ${attempts > 0 ? 'text-white' : 'text-slate-500'}`}>Первый шаг</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Пройти 1 тест</div>
                    </div>
                  </div>
                  <div className={`bg-black/20 border border-white/5 p-4 rounded-3xl flex items-center gap-4 transition-all ${accuracy >= 80 && attempts > 0 ? 'border-blueAccent/20' : 'opacity-60 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${accuracy >= 80 && attempts > 0 ? 'bg-blueAccent/10 text-blueAccent' : 'bg-white/5'}`}>
                      {accuracy >= 80 && attempts > 0 ? '🔥' : '🔒'}
                    </div>
                    <div>
                      <div className={`font-medium ${accuracy >= 80 && attempts > 0 ? 'text-white' : 'text-slate-500'}`}>Отличник</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Точность &gt;80%</div>
                    </div>
                  </div>
                  <div className={`bg-black/20 border border-white/5 p-4 rounded-3xl flex items-center gap-4 transition-all ${attempts >= 5 ? 'border-amber-500/20' : 'opacity-60 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${attempts >= 5 ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5'}`}>
                      {attempts >= 5 ? '🎓' : '🔒'}
                    </div>
                    <div>
                      <div className={`font-medium ${attempts >= 5 ? 'text-white' : 'text-slate-500'}`}>Упорный химик</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Пройти 5 тестов</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col h-full min-h-[400px]">
        <div className="glass-panel border-t border-white/10 rounded-3xl relative overflow-hidden flex flex-col h-full">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="text-base font-display font-medium uppercase tracking-widest text-white">Интерактивная молекула</h3>
              <p className="text-[11px] font-bold tracking-widest text-slate-400 mt-1 uppercase">Симуляция связей</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 hidden sm:flex">
                <div className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.8)]"></div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">C</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 hidden sm:flex">
                <div className="w-2 h-2 rounded-full bg-blueAccent shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">H</span>
              </div>
            </div>
          </div>
          <div className="flex-grow w-full h-full min-h-[400px] relative">
            <MoleculeCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}
