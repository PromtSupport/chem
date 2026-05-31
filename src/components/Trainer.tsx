import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Play, CirclePlay, CircleCheck, CircleX, ChevronRight, RotateCcw, Share2, Send, CheckCircle2 } from 'lucide-react';
import { Question, Topic, StudentResultDetails } from '../types';

export default function Trainer({ topicId }: { topicId: string }) {
  const { catalog, submitResult } = useStore();
  const topic = catalog.find(t => t.id === topicId);
  const userRole = localStorage.getItem('chem_user_role');
  const userName = localStorage.getItem('chem_user_name');
  const userSchool = localStorage.getItem('chem_user_school') || undefined;
  const userClass = localStorage.getItem('chem_user_class') || undefined;

  const [state, setState] = useState<'start' | 'active' | 'results'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [details, setDetails] = useState<StudentResultDetails[]>([]);
  const [resultSent, setResultSent] = useState(false);

  useEffect(() => {
    if (state === 'start') {
      setCurrentIndex(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
      setDetails([]);
      setResultSent(false);
    }
  }, [state]);

  const startQuiz = () => {
    if (!topic || topic.questions.length === 0) return;
    const shuffled = [...topic.questions].sort(() => Math.random() - 0.5).map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));
    setQuestions(shuffled);
    setState('active');
    
    // Update attempts stat
    const attempts = parseInt(localStorage.getItem('chem_attempts') || '0', 10);
    localStorage.setItem('chem_attempts', (attempts + 1).toString());
  };

  const currentQ = questions[currentIndex];

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);

    const totalQuestions = parseInt(localStorage.getItem('chem_total_questions') || '0', 10);
    localStorage.setItem('chem_total_questions', (totalQuestions + 1).toString());

    const isCorrect = option === currentQ.a;
    if (isCorrect) {
      setScore(s => s + 1);
      const totalCorrect = parseInt(localStorage.getItem('chem_total_correct') || '0', 10);
      localStorage.setItem('chem_total_correct', (totalCorrect + 1).toString());
    }

    setDetails(prev => [...prev, {
      q: currentQ.q,
      correct: isCorrect,
      studentAnswer: option,
      correctAnswer: currentQ.a
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(idx => idx + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setState('results');
    const best = parseInt(localStorage.getItem('chem_best_score') || '0', 10);
    if (score > best) {
      localStorage.setItem('chem_best_score', score.toString());
    }
  };

  const sendToTeacher = async () => {
    if (!topic || !userName || userRole !== 'student') return;
    
    await submitResult({
      id: Date.now().toString(),
      studentName: userName,
      school: userSchool,
      studentClass: userClass,
      topicName: topic.topicName,
      score,
      total: questions.length,
      details,
      date: new Date().toISOString()
    });
    
    setResultSent(true);
  };

  const shareResults = () => {
    const label = userRole === 'student' ? `Ученик: ${userName}` : 'Учитель';
    const textToCopy = `🔬 Результат в ChemStudio [${label}]\nКласс: ${topic?.className}\nТема: ${topic?.topicName}\nНабрано баллов: ${score} из ${questions.length}\nПройти тренажер: ${window.location.origin}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Детальный отчет скопирован в буфер обмена!");
    }).catch(() => {
      alert("Не удалось скопировать.");
    });
  };

  if (!topic) return <div className="text-white text-center p-12">Тема не найдена</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {state === 'start' && (
        <div className="glass-panel rounded-[40px] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emeraldAccent/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="inline-flex items-center justify-center p-6 bg-white/5 border border-white/10 text-emeraldAccent rounded-full mb-8 shadow-inner">
            <CirclePlay size={48} />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-4 drop-shadow-sm">{topic.topicName}</h2>
          <p className="text-white max-w-xl mx-auto mb-10 leading-relaxed text-sm md:text-base">
            Вас ждет проверочный тест по теме «{topic.topicName}» ({topic.className}). Вопросы перемешиваются случайным образом.
          </p>
          <button 
            onClick={startQuiz}
            className="bg-emerald-600 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-2xl hover:bg-emerald-500 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] inline-flex items-center gap-2"
          >
            Начать раунд <Play size={20} />
          </button>
        </div>
      )}

      {state === 'active' && currentQ && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-4">
            <div>
              <span className="text-emeraldAccent text-[10px] font-bold tracking-widest uppercase block mb-1 drop-shadow-sm">{topic.topicName}</span>
              <h3 className="text-xl md:text-2xl font-display font-medium text-white drop-shadow-sm">Вопрос {currentIndex + 1} из {questions.length}</h3>
            </div>
            <div className="bg-white/5 border border-white/10 text-slate-100 font-bold px-6 py-2.5 rounded-2xl shadow-inner text-sm backdrop-blur-md">
              Очки: <span className="text-emeraldAccent drop-shadow-sm">{score}</span>
            </div>
          </div>

          <div className="bg-black/20 rounded-full h-1 overflow-hidden border border-white/5 shadow-inner">
            <div 
              className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out" 
              style={{ width: `${(currentIndex / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 h-full">
              <div className="glass-panel border-t border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden h-full">
                <div className="flex justify-between items-start w-full absolute top-6 left-6 pr-12">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">LAB STATUS</h4>
                  <div className="w-2 h-2 rounded-full bg-emeraldAccent animate-pulse mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                </div>

                <div className="flex flex-col items-center justify-center mt-6">
                  <div className="w-24 h-32 border border-white/20 shadow-inner relative rounded-b-3xl rounded-t-sm mb-6 bg-black/10 backdrop-blur-sm">
                     <div className="absolute bottom-0 w-full h-[60%] bg-emeraldAccent/10 rounded-b-3xl overflow-hidden border-t border-emeraldAccent/10">
                       <circle className="bubble w-1.5 h-1.5 absolute left-4 top-4 bg-white/40 rounded-full animate-[float-up_3s_infinite_ease-in-out_0.2s] shadow-[0_0_5px_rgba(255,255,255,0.5)]"></circle>
                       <circle className="bubble w-2 h-2 absolute left-10 top-8 bg-white/40 rounded-full animate-[float-up_3.2s_infinite_ease-in-out_0.8s] shadow-[0_0_5px_rgba(255,255,255,0.5)]"></circle>
                       <circle className="bubble w-1.5 h-1.5 absolute left-16 top-2 bg-white/40 rounded-full animate-[float-up_2.8s_infinite_ease-in-out_1.5s] shadow-[0_0_5px_rgba(255,255,255,0.5)]"></circle>
                     </div>
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emeraldAccent uppercase tracking-widest drop-shadow-sm">Синтез активен</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1.5">Анализ данных...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col gap-6">
              <div className="glass-card rounded-3xl p-8 min-h-[160px] flex items-center justify-center text-center relative overflow-hidden">
                <div className="text-lg md:text-xl font-display font-medium text-slate-100 leading-relaxed z-10 drop-shadow-sm">{currentQ.q}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map(opt => {
                  const isCorrect = opt === currentQ.a;
                  const isSelected = selectedOption === opt;
                  let btnClass = "bg-white/5 border border-white/10 rounded-2xl px-6 py-5 font-bold text-slate-300 flex justify-between items-center text-xs md:text-sm uppercase tracking-wide premium-hover-item cursor-pointer shadow-inner backdrop-blur-md";
                  
                  if (isAnswered) {
                    if (isCorrect) {
                       btnClass = "bg-emeraldAccent/10 border-emeraldAccent text-emerald-400 rounded-2xl px-6 py-5 font-bold flex justify-between items-center text-xs md:text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.15)] border backdrop-blur-md";
                    } else if (isSelected && !isCorrect) {
                       btnClass = "bg-dangerAccent/10 border-dangerAccent text-rose-400 rounded-2xl px-6 py-5 font-bold flex justify-between items-center text-xs md:text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(244,63,94,0.15)] border backdrop-blur-md";
                    } else {
                       btnClass = "bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-slate-500 font-bold opacity-50 flex justify-between items-center text-xs md:text-sm uppercase tracking-wide cursor-not-allowed";
                    }
                  }

                  return (
                    <div key={opt} onClick={() => handleOptionClick(opt)} className={btnClass}>
                      {opt}
                      {isAnswered && isCorrect && <CircleCheck className="text-emerald-400 drop-shadow-sm" size={18} />}
                      {isAnswered && isSelected && !isCorrect && <CircleX className="text-rose-400 drop-shadow-sm" size={18} />}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end h-16 items-center">
                {isAnswered && (
                  <button 
                    onClick={nextQuestion}
                    className="border border-white/10 text-white font-bold uppercase tracking-widest text-xs md:text-sm hover:border-white/30 hover:bg-white/10 px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-2 backdrop-blur-md"
                  >
                    {currentIndex + 1 < questions.length ? 'Следующий вопрос' : 'Завершить раунд'} <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {state === 'results' && (
        <div className="glass-panel rounded-[40px] p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-emeraldAccent/10 to-transparent pointer-events-none opacity-50"></div>
          
          <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/10 shadow-inner"></div>
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 origin-center drop-shadow-lg">
                <circle 
                  cx="96" cy="96" r="90" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="6" 
                  fill="transparent" 
                />
                <circle 
                  cx="96" cy="96" r="90" 
                  stroke="var(--color-blueAccent)" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray="565.48" 
                  strokeDashoffset={565.48 - (565.48 * (score / questions.length))} 
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  strokeLinecap="round"
                />
            </svg>
            <div className="text-5xl font-display font-medium text-white drop-shadow-sm">{score} <span className="text-slate-500 text-3xl">/ {questions.length}</span></div>
          </div>
          
          <h2 className="text-3xl font-display font-medium tracking-tight text-white mb-3 drop-shadow-sm">
            {score / questions.length > 0.8 ? 'Замечательно!' : (score / questions.length > 0.4 ? 'Хороший результат!' : 'Попробуй еще раз!')}
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-10 font-medium text-sm">
            {score / questions.length > 0.8 ? 'Вы показали отличный уровень знаний. Продолжайте в том же духе!' : 'Изучите ошибки и попробуйте пройти еще раз, чтобы закрепить материал.'}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto relative z-10 w-full">
              <button 
                onClick={() => setState('start')}
                className="bg-white text-black font-bold uppercase text-xs sm:text-sm tracking-wide px-6 py-4 rounded-2xl hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 flex-1"
              >
                  Пройти снова <RotateCcw size={16} />
              </button>
              {userRole === 'student' && !resultSent && (
                <button 
                  onClick={sendToTeacher}
                  className="bg-white/10 border border-white/20 text-white font-bold uppercase text-xs sm:text-sm tracking-wide px-6 py-4 rounded-2xl hover:bg-white/20 transition-all shadow-lg flex items-center justify-center gap-2 flex-1 backdrop-blur-md"
                >
                    Отправить учителю <Send size={16} />
                </button>
              )}
              {userRole === 'student' && resultSent && (
                <div className="bg-emeraldAccent/10 border border-emeraldAccent/30 text-emerald-400 font-bold uppercase text-xs sm:text-sm tracking-wide px-6 py-4 rounded-2xl flex items-center justify-center gap-2 flex-1 cursor-default backdrop-blur-md">
                    Отправлено <CheckCircle2 size={16} />
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
