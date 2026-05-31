import React, { useState, useEffect } from 'react';
import { User } from './types';
import AuthOverlay from './components/AuthOverlay';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import Trainer from './components/Trainer';
import Constructor from './components/Constructor';
import Reference from './components/Reference';
import Students from './components/Students';
import { useStore } from './store';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTrainerTopicId, setActiveTrainerTopicId] = useState<string | null>(null);
  const { fetchState } = useStore();

  useEffect(() => {
    fetchState();
    
    // Check saved user
    const role = localStorage.getItem('chem_user_role') as User['role'];
    const name = localStorage.getItem('chem_user_name');
    const school = localStorage.getItem('chem_user_school');
    const studentClass = localStorage.getItem('chem_user_class');
    if (role && name) {
      setUser({ role, name, school: school || undefined, studentClass: studentClass || undefined });
    }
  }, [fetchState]);

  const handleLogin = (newUser: User) => {
    localStorage.setItem('chem_user_role', newUser.role || '');
    localStorage.setItem('chem_user_name', newUser.name);
    if (newUser.school) localStorage.setItem('chem_user_school', newUser.school);
    if (newUser.studentClass) localStorage.setItem('chem_user_class', newUser.studentClass);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('chem_user_role');
    localStorage.removeItem('chem_user_name');
    localStorage.removeItem('chem_user_school');
    localStorage.removeItem('chem_user_class');
    setUser(null);
    setActiveTab('dashboard');
  };

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
  };

  const launchTrainer = (topicId: string) => {
    setActiveTrainerTopicId(topicId);
    setActiveTab('trainer');
  };

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {!user && <AuthOverlay onLogin={handleLogin} />}
      
      {user && (
        <>
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            activeTab={activeTab} 
            onTabChange={navigateTo} 
          />
          
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8 transition-all duration-300">
            {activeTab === 'dashboard' && <Dashboard user={user} onNavigate={navigateTo} />}
            {activeTab === 'catalog' && <Catalog onLaunch={launchTrainer} />}
            {activeTab === 'trainer' && (
              activeTrainerTopicId ? (
                <Trainer topicId={activeTrainerTopicId} />
              ) : (
                <div className="text-center text-slate-400 mt-20 font-bold uppercase tracking-widest text-sm">
                  Пожалуйста, выберите тему из каталога для запуска тренажера.
                </div>
              )
            )}
            {activeTab === 'constructor' && user.role === 'teacher' && <Constructor />}
            {activeTab === 'students' && user.role === 'teacher' && <Students />}
            {activeTab === 'reference' && <Reference user={user} />}
          </main>
        </>
      )}
    </div>
  );
}
