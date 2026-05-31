import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { GraduationCap, Plus, Save, X, ImageIcon, Loader2 } from 'lucide-react';
import { ReferenceItem, User } from '../types';
import ChemicalStructure from './ChemicalStructure';

export default function Reference({ user }: { user?: User }) {
  const { referenceData, fetchState, updateReferenceData } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  
  const [newItem, setNewItem] = useState<Partial<ReferenceItem>>({
    name: '',
    formula: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleGenerateImage = async () => {
    if (!newItem.name) return;
    setIsGeneratingImg(true);
    try {
      const resp = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItem.name })
      });
      const data = await resp.json();
      if (data.imageUrl) {
        setNewItem(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingImg(false);
  };

  const handleSave = async () => {
    if (newItem.name && newItem.formula && newItem.description) {
      const itemToSave: ReferenceItem = {
        id: Date.now().toString(),
        name: newItem.name,
        formula: newItem.formula,
        description: newItem.description,
        imageUrl: newItem.imageUrl || undefined
      };
      await updateReferenceData([...referenceData, itemToSave]);
      setNewItem({ name: '', formula: '', description: '', imageUrl: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="max-w-4xl glass-panel p-8 rounded-3xl relative overflow-hidden flex justify-between items-center">
        <div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emeraldAccent/10 rounded-full blur-[60px] pointer-events-none"></div>
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-2 flex items-center gap-3 drop-shadow-sm">
            <GraduationCap className="text-emeraldAccent" size={32} /> Химический навигатор
          </h2>
          <p className="text-slate-400">Быстрый доступ к шпаргалке по основным классам соединений и органическим полимерам.</p>
        </div>
        {user?.role === 'teacher' && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="hidden md:flex items-center gap-2 bg-emeraldAccent/20 text-emeraldAccent hover:bg-emeraldAccent/30 px-6 py-3 rounded-2xl transition-all border border-emeraldAccent/10 font-bold tracking-wide uppercase text-sm"
          >
            <Plus size={18} /> Добавить
          </button>
        )}
      </div>
      
      {/* Mobile Add Button */}
      {user?.role === 'teacher' && !isAdding && (
         <button 
           onClick={() => setIsAdding(true)}
           className="w-full md:hidden flex items-center justify-center gap-2 bg-emeraldAccent/20 text-emeraldAccent hover:bg-emeraldAccent/30 px-6 py-3 rounded-2xl transition-all border border-emeraldAccent/10 font-bold tracking-wide uppercase text-sm"
         >
           <Plus size={18} /> Добавить материал
         </button>
      )}

      {isAdding && (
        <div className="glass-panel p-8 rounded-3xl relative border border-emeraldAccent/20">
          <button 
            onClick={() => setIsAdding(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h3 className="text-xl font-display text-white mb-6 uppercase tracking-widest font-medium">Новый материал</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Название вещества</label>
                <input 
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emeraldAccent/50 transition-colors"
                  placeholder="Например: Сахароза"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Химическая формула</label>
                <input 
                  type="text"
                  value={newItem.formula}
                  onChange={e => setNewItem({...newItem, formula: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emeraldAccent/50 transition-colors font-mono"
                  placeholder="C12H22O11"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Описание</label>
                <textarea 
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emeraldAccent/50 transition-colors resize-none h-24"
                  placeholder="Краткое описание вещества..."
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-4 relative">
               <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Иллюстрация (URL или Генерация)</label>
               <div className="flex-grow bg-black/30 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                 {newItem.imageUrl ? (
                   <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                 ) : (
                   <div className="text-center p-6 flex flex-col items-center">
                     <ImageIcon className="text-slate-500 mb-3" size={32} />
                     <p className="text-sm text-slate-500">Изображение не загружено</p>
                   </div>
                 )}
               </div>
               
               <div className="flex gap-3">
                 <input 
                   type="text"
                   value={newItem.imageUrl}
                   onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                   className="flex-grow bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emeraldAccent/50 transition-colors text-sm"
                   placeholder="https://... (URL изображения)"
                 />
                 <button 
                   onClick={handleGenerateImage}
                   disabled={isGeneratingImg || !newItem.name}
                   className="bg-blueAccent/20 text-blueAccent hover:bg-blueAccent/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-xl transition-all border border-blueAccent/20 flex flex-col items-center justify-center min-w-[120px]"
                 >
                   {isGeneratingImg ? <Loader2 size={18} className="animate-spin" /> : <span className="text-[10px] font-bold uppercase tracking-widest">Сгенерировать</span>}
                 </button>
               </div>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!newItem.name || !newItem.formula || !newItem.description}
            className="bg-emeraldAccent text-black hover:bg-emeraldAccent/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all font-bold tracking-wide uppercase text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Save size={18} /> Сохранить материал
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referenceData.map((item: ReferenceItem, idx) => (
          <div key={item.id} className="glass-card p-6 rounded-3xl flex flex-col justify-between premium-hover-item group relative">
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
              style={{
                background: 'linear-gradient(to bottom right, rgba(16,185,129,0.5), transparent, rgba(56,189,248,0.5))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: '1px'
              }}
            ></div>
            <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-inner relative z-10 flex items-center justify-center bg-black/30 h-[240px]">
              <ChemicalStructure name={item.name} formula={item.formula} imageUrl={item.imageUrl} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-display font-medium uppercase tracking-widest text-white mb-3 drop-shadow-sm">{item.name}</h3>
              <div className="text-emeraldAccent font-mono font-bold bg-black/40 inline-block px-4 py-2 rounded-xl text-xs tracking-wider mb-4 border border-emeraldAccent/20 shadow-inner">
                {item.formula}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.description}</p>
            </div>
          </div>
        ))}

        {referenceData.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-3xl">
            Справочник в данный момент пуст.
          </div>
        )}
      </div>
    </div>
  );
}
