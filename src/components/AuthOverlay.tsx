import React, { useState } from 'react';
import { User } from '../types';
import { FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthOverlayProps {
  onLogin: (user: User) => void;
}

export default function AuthOverlay({ onLogin }: AuthOverlayProps) {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, введите имя и фамилию');
      return;
    }
    if (!school.trim() || !studentClass.trim()) {
      setError('Пожалуйста, заполните школу и класс');
      return;
    }
    onLogin({ role: 'student', name: name.trim(), school: school.trim(), studentClass: studentClass.trim() });
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Яна_Горюнова' || password === 'chemteacher' || password === '1234') {
      onLogin({ role: 'teacher', name: 'Учитель' });
    } else {
      setError('Неверный пароль!');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl overflow-hidden p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-[420px] glass-panel rounded-[40px] p-8 text-center relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blueAccent/20 rounded-full -mr-16 -mt-16 blur-[50px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emeraldAccent/10 rounded-full -ml-20 -mb-20 blur-[60px] pointer-events-none"></div>
        
        <div className="text-center mb-6 relative z-10 flex flex-col items-center">
          {/* Bigger Animated Squirrel representation */}
          <div className="relative flex mb-8 justify-center items-center">
            {/* Glowing backdrop circle to integrate with design */}
            <div className="absolute w-48 h-48 bg-blueAccent/25 rounded-full blur-[50px]"></div>
            <div className="w-48 h-48 md:w-56 md:h-56 relative flex items-center justify-center z-10">
              <img 
                src="https://i.ibb.co/Gv1kRfxk/2026-05-31-152138911.png" 
                alt="Милая белка" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:scale-110 hover:-rotate-2 transition-transform duration-500 ease-out"
              />
            </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold mb-2 uppercase tracking-tight text-white drop-shadow-md">Chem<span className="text-blueAccent">Studio</span></h2>
          <p className="text-slate-400 text-sm px-4 font-medium">Добро пожаловать в химическую лабораторию. Выберите вашу роль.</p>
        </div>

        {/* Roles Toggle */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-2xl mb-6 relative z-10 border border-white/5 shadow-inner">
          <button 
            type="button" 
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all duration-200 ${role === 'student' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ученик
          </button>
          <button 
            type="button" 
            onClick={() => { setRole('teacher'); setError(''); }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all duration-200 ${role === 'teacher' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Учитель
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 text-xs font-bold text-dangerAccent text-center bg-dangerAccent/10 border border-dangerAccent/20 py-2.5 rounded-xl relative z-10 uppercase tracking-wide"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {role === 'student' ? (
          <motion.form 
            key="student-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleStudentLogin} 
            className="space-y-3 relative z-10"
          >
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium shadow-inner" 
                placeholder="Имя и фамилия" 
                autoComplete="off"
              />
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-2/3 bg-black/20 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium shadow-inner" 
                placeholder="Школа (напр. СОШ №1)" 
                autoComplete="off"
              />
              <input 
                type="text" 
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-1/3 bg-black/20 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium text-center shadow-inner" 
                placeholder="Класс" 
                autoComplete="off"
              />
            </div>
            <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-4 hover:bg-slate-200 transition-all">
              Войти в лабораторию
            </button>
          </motion.form>
        ) : (
          <motion.form 
            key="teacher-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleTeacherLogin} 
            className="space-y-4 relative z-10"
          >
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all font-medium shadow-inner" 
                placeholder="Секретный пароль учителя" 
              />
            </div>
            <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2 hover:bg-slate-200 transition-all">
              Войти в лабораторию
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
