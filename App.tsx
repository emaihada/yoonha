import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { subscribeToAuth } from './services/firebase';
import Navigation from './components/Navigation';
import AdminModal from './components/AdminModal';
import Home from './pages/Home';
import About from './pages/About';
import Culture from './pages/Culture';
import Log from './pages/Log';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="animate-bounce font-pixel text-xl text-cy-orange">로딩 중...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="relative w-full max-w-4xl mx-auto">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/about" element={<About user={user} />} />
          <Route path="/taste" element={<Culture user={user} />} />
          <Route path="/log" element={<Log user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AdminModal user={user} />
      </div>
    </HashRouter>
  );
};

export default App;