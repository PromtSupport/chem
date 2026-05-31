import React, { useState } from 'react';
import { useStore } from '../store';
import { Wrench, FolderPlus, ListChecks, FileSignature, Database, Trash2, PlusCircle, Share2, Wand2 } from 'lucide-react';

export default function Constructor() {
  const { catalog, updateCatalog } = useStore();

  const [topicName, setTopicName] = useState('');
  const [topicClass, setTopicClass] = useState('9 класс');
  
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [qText, setQText] = useState('');
  const [ans, setAns] = useState('');
  const [w1, setW1] = useState('');
  const [w2, setW2] = useState('');
  const [w3, setW3] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    
    const newTopic = {
      id: 'topic-' + Date.now(),
      className: topicClass,
      topicName: topicName.trim(),
      questions: []
    };
    updateCatalog([...catalog, newTopic]);
    setTopicName('');
    if (!selectedTopicId) setSelectedTopicId(newTopic.id);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !qText || !ans || !w1 || !w2 || !w3) return;

    const topicIdx = catalog.findIndex(t => t.id === selectedTopicId);
    if (topicIdx === -1) return;

    const newQ = { id: Date.now().toString(), q: qText, a: ans, options: [ans, w1, w2, w3] };
    const newCatalog = [...catalog];
    newCatalog[topicIdx] = { ...newCatalog[topicIdx], questions: [...newCatalog[topicIdx].questions, newQ] };
    
    updateCatalog(newCatalog);
    setQText(''); setAns(''); setW1(''); setW2(''); setW3('');
  };

  const handleDeleteTopic = (id: string) => {
    updateCatalog(catalog.filter(t => t.id !== id));
    if (selectedTopicId === id) setSelectedTopicId('');
  };

  const handleDeleteQuestion = (topicId: string, qId: string | number) => {
    const newCatalog = catalog.map(t => {
      if (t.id === topicId) return { ...t, questions: t.questions.filter(q => q.id !== qId) };
      return t;
    });
    updateCatalog(newCatalog);
  };
  
  const generateHintsWithAI = async () => {
    if (!selectedTopicId) return alert("Выберите тему сначала");
    const t = catalog.find(t => t.id === selectedTopicId);
    if (!t) return;

    let useClientSide = true;

    setIsGenerating(true);
    try {
      let questions = [];
      const res = await fetch('/api/generate-hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: t.topicName })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        questions = data.questions;
      } else {
        // Fallback or explicit mode for GitHub pages (no server)
        const userKey = prompt(
          "Сервер недоступен (GitHub Pages режим). Для использования нейросети введите свой Gemini API ключ. Он не будет сохранен:"
        );
        if (!userKey) {
          setIsGenerating(false);
          return;
        }

        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: userKey.trim() });

        const promptText = `Ты — эксперт по органической химии. Составь 3 тестовых вопроса (загадки) для школьников по теме "${t.topicName}". 
Ответь ТОЛЬКО в формате JSON-массива объектов. Без markdown-обрамления.
Формат каждого объекта:
{
  "q": "Текст загадки или вопроса",
  "a": "Правильный химический термин/вещество",
  "options": ["Правильный ответ", "Неправильный 1", "Неправильный 2", "Неправильный 3"]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: promptText }] }],
        });

        let text = response.text || "[]";
        text = text.replace(/^```json/g, "").replace(/^```/g, "").replace(/```$/g, "").trim();
        
        const parsed = JSON.parse(text);
        questions = parsed.map((q: any) => ({
          ...q,
          id: Date.now() + Math.random()
        }));
      }

      if (questions && questions.length > 0) {
        const newCatalog = [...catalog];
        const topicIdx = newCatalog.findIndex(x => x.id === selectedTopicId);
        newCatalog[topicIdx] = {
           ...newCatalog[topicIdx],
           questions: [...newCatalog[topicIdx].questions, ...questions]
        };
        updateCatalog(newCatalog);
        alert(`Сгенерировано ${questions.length} вопросов нейросетью.`);
      }
    } catch (e: any) {
      alert("Сбой при вызове Gemini API: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeTopic = catalog.find(t => t.id === selectedTopicId);

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 pt-4">
            <div>
                <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-2 flex items-center gap-3 drop-shadow-sm">
                    <Wrench className="text-emeraldAccent" size={32} /> Химический конструктор
                </h2>
                <p className="text-slate-400 text-sm">Управляйте материалами, загадками и пополняйте общую базу для учеников.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel rounded-3xl p-8">
                <h3 className="text-xl font-display font-medium uppercase tracking-widest text-white mb-6 flex items-center gap-3 drop-shadow-sm">
                    <FolderPlus className="text-emeraldAccent" size={24} /> Шаг 1: Создать тему
                </h3>
                <form onSubmit={handleAddTopic} className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Название темы</label>
                        <input type="text" value={topicName} onChange={e => setTopicName(e.target.value)} required placeholder="Например: Спирты и фенолы" className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium text-sm shadow-inner"/>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Класс</label>
                        <select value={topicClass} onChange={e => setTopicClass(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium text-sm shadow-inner overflow-hidden appearance-none">
                            <option value="9 класс" className="bg-gray-900">9 класс</option>
                            <option value="10 класс" className="bg-gray-900">10 класс</option>
                            <option value="11 класс" className="bg-gray-900">11 класс</option>
                            <option value="Другое" className="bg-gray-900">Другое</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-wider py-4 px-6 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] mt-4 text-xs">
                        Создать тему <PlusCircle size={18}/>
                    </button>
                </form>
            </div>

            <div className="glass-panel rounded-3xl p-8 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-display font-medium uppercase tracking-widest text-white flex items-center gap-3 drop-shadow-sm">
                        <ListChecks className="text-blueAccent" size={24} /> Список разделов
                    </h3>
                </div>
                <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {catalog.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 font-medium">Темы пока не созданы</div>
                    ) : (
                        catalog.map(t => (
                            <div key={t.id} className="border border-white/5 bg-white/5 backdrop-blur-sm p-5 rounded-2xl flex justify-between items-center premium-hover-item shadow-inner">
                                <div>
                                    <div className="text-emeraldAccent text-[9px] font-bold uppercase tracking-widest mb-1.5 bg-black/40 px-2 py-0.5 rounded-full inline-block">{t.className}</div>
                                    <div className="text-white font-medium text-sm tracking-wide drop-shadow-sm">{t.topicName}</div>
                                    <div className="text-slate-400 text-xs mt-1.5 font-medium">Вопросов: {t.questions.length}</div>
                                </div>
                                <button onClick={() => handleDeleteTopic(t.id)} className="text-rose-400 hover:bg-rose-400/20 p-2.5 rounded-xl transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel rounded-3xl p-8 relative">
                <h3 className="text-xl font-display font-medium uppercase tracking-widest text-white mb-6 flex items-center gap-3 drop-shadow-sm">
                    <FileSignature className="text-emeraldAccent" size={24} /> Шаг 2: Вопросы
                </h3>
                
                {catalog.length === 0 && <div className="absolute inset-0 bg-black/40 backdrop-blur-md block z-10 flex items-center justify-center rounded-3xl text-slate-300 font-semibold p-8 text-center border border-dashed border-white/10 uppercase tracking-widest text-sm shadow-inner">Создайте сначала тему</div>}

                <form onSubmit={handleAddQuestion} className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Целевая тема</label>
                        <select value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium text-sm mb-4 appearance-none shadow-inner">
                            <option value="" className="bg-gray-900">-- Выберите тему --</option>
                            {catalog.map(t => <option key={t.id} value={t.id} className="bg-gray-900">{t.className} — {t.topicName}</option>)}
                        </select>
                    </div>

                    {selectedTopicId && (
                        <div className="mb-6">
                          <button type="button" onClick={generateHintsWithAI} disabled={isGenerating} className="w-full bg-blueAccent/10 text-blueAccent border border-blueAccent/30 font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl hover:bg-blueAccent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-inner">
                             <Wand2 size={16}/> {isGenerating ? 'Нейросеть генерирует...' : 'Сгенерировать AI (Gemini)'}
                          </button>
                          <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-4 text-center font-bold">или добавьте вручную ниже</div>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Загадка или вопрос</label>
                        <textarea value={qText} onChange={e => setQText(e.target.value)} rows={3} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium text-sm shadow-inner" placeholder="Введите текст..."/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-emeraldAccent text-[10px] font-bold uppercase tracking-widest mb-2">Правильный ответ</label>
                            <input value={ans} onChange={e => setAns(e.target.value)} type="text" className="w-full bg-black/20 border border-emeraldAccent/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emeraldAccent focus:bg-emeraldAccent/5 transition-all font-medium text-sm shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-2">Неправильный 1</label>
                            <input value={w1} onChange={e => setW1(e.target.value)} type="text" className="w-full bg-black/20 border border-rose-400/30 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-400 focus:bg-rose-400/5 transition-all font-medium text-sm shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-2">Неправильный 2</label>
                            <input value={w2} onChange={e => setW2(e.target.value)} type="text" className="w-full bg-black/20 border border-rose-400/30 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-400 focus:bg-rose-400/5 transition-all font-medium text-sm shadow-inner" />
                        </div>
                        <div>
                            <label className="block text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-2">Неправильный 3</label>
                            <input value={w3} onChange={e => setW3(e.target.value)} type="text" className="w-full bg-black/20 border border-rose-400/30 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-400 focus:bg-rose-400/5 transition-all font-medium text-sm shadow-inner" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 mt-6 text-xs shadow-inner backdrop-blur-sm">
                        Добавить вручную
                    </button>
                </form>
            </div>

            <div className="glass-panel rounded-3xl p-8 flex flex-col h-[600px] lg:h-auto">
                <h3 className="text-xl font-display font-medium uppercase tracking-widest text-white mb-6 flex items-center gap-3 drop-shadow-sm">
                    <Database className="text-blueAccent" size={24} /> База {activeTopic ? <span className="text-emeraldAccent text-sm drop-shadow-sm">({activeTopic.topicName})</span> : ''}
                </h3>
                <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {!activeTopic ? (
                        <div className="text-center text-slate-500 py-10 font-medium">Выберите тему слева</div>
                    ) : activeTopic.questions.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 font-medium text-sm uppercase tracking-wider">В теме нет вопросов</div>
                    ) : (
                        activeTopic.questions.map(q => (
                            <div key={q.id} className="border border-white/5 bg-white/5 backdrop-blur-sm p-5 rounded-2xl flex flex-col gap-3 relative group premium-hover-item shadow-inner">
                                <div className="text-sm text-slate-200 font-medium pr-8">{q.q}</div>
                                <div className="text-[10px] text-emeraldAccent font-bold uppercase tracking-widest bg-emeraldAccent/10 self-start px-3 py-1 rounded-full border border-emeraldAccent/20">Ответ: {q.a}</div>
                                <button onClick={() => handleDeleteQuestion(activeTopic.id, q.id)} className="absolute top-5 right-5 text-slate-500 hover:text-rose-400 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
