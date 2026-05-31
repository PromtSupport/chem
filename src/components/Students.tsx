import React, { useState } from 'react';
import { useStore } from '../store';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Students() {
  const { studentResults } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-panel border-t border-white/10 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-display font-medium mb-2 uppercase tracking-tight drop-shadow-sm text-white">Результаты учеников</h2>
        <p className="text-slate-400 text-sm mb-6">Здесь отображаются тесты, пройденные учениками.</p>

        {studentResults && studentResults.length > 0 ? (
          <div className="space-y-4">
            {studentResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(result => (
              <div key={result.id} className="glass-card rounded-2xl overflow-hidden shadow-lg transition-all">
                <div 
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-white/5 transition-colors gap-4"
                  onClick={() => toggleExpand(result.id)}
                >
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <span className="font-display font-medium text-lg text-white drop-shadow-sm">{result.studentName}</span>
                      {result.school && (
                          <span className="px-2 py-0.5 bg-blueAccent/10 border border-blueAccent/20 text-blueAccent text-[10px] font-bold uppercase tracking-widest rounded-full">{result.school}</span>
                      )}
                      {result.studentClass && (
                          <span className="px-2 py-0.5 bg-emeraldAccent/10 border border-emeraldAccent/20 text-emeraldAccent text-[10px] font-bold uppercase tracking-widest rounded-full">{result.studentClass}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-400">
                      Тема: <span className="text-slate-200">{result.topicName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 min-w-[200px]">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-end">
                        <Clock size={12} /> {formatDate(result.date)}
                      </div>
                      <div className="font-display font-medium text-2xl drop-shadow-sm">
                         <span className="text-emeraldAccent">{result.score}</span> <span className="text-slate-600">/ {result.total}</span>
                      </div>
                    </div>
                    <div className="text-slate-500">
                      {expandedId === result.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === result.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20 backdrop-blur-md"
                    >
                      <div className="p-6 space-y-4">
                        {result.details.map((detail, idx) => (
                          <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <div className="text-sm font-medium text-slate-200 mb-4 block">Вопрос {idx + 1}: {detail.q}</div>
                            <div className="flex flex-col sm:flex-row gap-5">
                              <div className="flex-1 flex gap-3 items-start">
                                {detail.correct ? (
                                  <CheckCircle2 className="text-emerald-400 mt-0.5 shrink-0 drop-shadow-sm" size={18} />
                                ) : (
                                  <XCircle className="text-rose-400 mt-0.5 shrink-0 drop-shadow-sm" size={18} />
                                )}
                                <div>
                                  <span className="text-[10px] block text-slate-500 font-bold uppercase tracking-widest mb-1">Ответ ученика</span>
                                  <span className={`text-sm font-medium ${detail.correct ? 'text-emerald-400' : 'text-rose-400'}`}>{detail.studentAnswer || 'Не ответил'}</span>
                                </div>
                              </div>
                              {!detail.correct && (
                                <div className="flex-1 flex gap-3 items-start">
                                  <CheckCircle2 className="text-emerald-400/50 mt-0.5 shrink-0 drop-shadow-sm" size={18} />
                                  <div>
                                    <span className="text-[10px] block text-slate-500 font-bold uppercase tracking-widest mb-1">Правильный ответ</span>
                                    <span className="text-sm font-medium text-emerald-400">{detail.correctAnswer}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-3xl">
            <div className="text-5xl mb-4 drop-shadow-md">📝</div>
            <h3 className="text-xl font-display font-medium text-white mb-2 uppercase tracking-wide drop-shadow-sm">Пока нет результатов</h3>
            <p className="text-slate-400 text-sm">Ученики еще не отправляли результаты тестов.</p>
          </div>
        )}
      </div>
    </div>
  );
}
