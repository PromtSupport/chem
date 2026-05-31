import React, { useState } from 'react';
import { useStore } from '../store';
import { FolderOpen, Play, ClipboardList, GraduationCap } from 'lucide-react';

export default function Catalog({ onLaunch }: { onLaunch: (topicId: string) => void }) {
  const { catalog } = useStore();

  const grouped = catalog.reduce((acc, topic) => {
    const cls = topic.className || 'Другое';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(topic);
    return acc;
  }, {} as Record<string, typeof catalog>);

  return (
    <div className="space-y-8">
      <div className="max-w-4xl glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blueAccent/10 rounded-full blur-[60px] pointer-events-none"></div>
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-2 flex items-center gap-3 drop-shadow-sm">
          <FolderOpen className="text-emeraldAccent" size={32} /> Каталог модулей
        </h2>
        <p className="text-slate-400 max-w-xl">Выберите нужный класс и интересующую вас тему обучения ниже для запуска интерактивного раунда.</p>
      </div>

      {catalog.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <p className="text-slate-400">Каталог пуст. Учитель еще не создал ни одной темы.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([className, topics]) => (
            <div key={className} className="space-y-6">
              <h3 className="text-xl font-display font-medium text-white border-b border-white/10 pb-3 flex items-center gap-2 drop-shadow-sm">
                <GraduationCap className="text-emeraldAccent" size={24} /> {className}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map(topic => (
                  <div key={topic.id} className="glass-card p-6 rounded-3xl flex flex-col justify-between premium-hover-item">
                    <div className="space-y-3">
                      <h4 className="text-lg font-display font-medium uppercase tracking-widest text-emeraldAccent drop-shadow-sm">{topic.topicName}</h4>
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-black/40 inline-flex px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                        <ClipboardList size={14} /> {topic.questions.length} вопросов
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mt-2 font-medium">
                        Интерактивный тренажер по теме «{topic.topicName}» для закрепления учебного материала.
                      </p>
                    </div>
                    <button 
                      onClick={() => onLaunch(topic.id)}
                      disabled={topic.questions.length === 0}
                      className="w-full mt-8 bg-white text-black font-bold py-3.5 text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Запустить тренажер <Play size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
