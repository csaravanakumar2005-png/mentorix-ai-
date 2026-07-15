import React, { useState, useEffect } from 'react';
import { UserState, StudentProfile, FavoriteItem, ProgressTracker, SERVICES } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProfileEdit from './components/ProfileEdit';
import ChatInterface from './components/ChatInterface';
import AuthPage from './components/AuthPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | string>('dashboard');

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    const savedUserId = localStorage.getItem('mentorix_userId');
    if (!savedUserId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/state', {
        headers: { 'x-user-id': savedUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('mentorix_userId');
      }
    } catch (err) {
      console.error('Session retrieval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData: UserState) => {
    localStorage.setItem('mentorix_userId', userData.id);
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('mentorix_userId');
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleProfileUpdate = async (updatedProfile: StudentProfile) => {
    if (!user) return;
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ profile: updatedProfile })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }

    const savedProfile = await res.json();
    setUser(prev => prev ? { ...prev, profile: savedProfile } : null);
  };

  const handleFavoriteSave = async (fav: Omit<FavoriteItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    const res = await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify(fav)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to bookmark advice');
    }

    const savedFav = await res.json();
    setUser(prev => prev ? { ...prev, favorites: [savedFav, ...prev.favorites] } : null);
  };

  const handleFavoriteDelete = async (favoriteId: string) => {
    if (!user) return;
    const res = await fetch(`/api/user/favorites/${favoriteId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': user.id }
    });

    if (res.ok) {
      setUser(prev => prev ? {
        ...prev,
        favorites: prev.favorites.filter(f => f.id !== favoriteId)
      } : null);
    }
  };

  const handleRoadmapActivate = async (title: string, nodes: string[]) => {
    if (!user) return;
    const res = await fetch('/api/user/progress/roadmaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({
        serviceId: 'learning_roadmap',
        title,
        nodes
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to track learning roadmap');
    }

    const updatedProgress = await res.json();
    setUser(prev => prev ? { ...prev, progress: updatedProgress } : null);
  };

  const handleRoadmapNodeUpdate = async (roadmapId: string, nodeId: string, status: 'locked' | 'active' | 'completed') => {
    if (!user) return;
    const res = await fetch(`/api/user/progress/roadmaps/${roadmapId}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      const updatedProgress = await res.json();
      setUser(prev => prev ? { ...prev, progress: updatedProgress } : null);
    }
  };

  const handleCourseUpdate = async (courseId: string, progress: number, status: 'Not Started' | 'In Progress' | 'Completed') => {
    if (!user) return;
    const res = await fetch(`/api/user/progress/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ progress, status })
    });

    if (res.ok) {
      const updatedProgress = await res.json();
      setUser(prev => prev ? { ...prev, progress: updatedProgress } : null);
      
      // Fetch latest notifications as course updates generate new notifications
      fetchLatestNotifications();
    }
  };

  const handleStudyHoursUpdate = async (hours: number) => {
    if (!user) return;
    const res = await fetch('/api/user/progress/hours', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ hours })
    });

    if (res.ok) {
      const updatedProgress = await res.json();
      setUser(prev => prev ? { ...prev, progress: updatedProgress } : null);
    }
  };

  const fetchLatestNotifications = async () => {
    if (!user) return;
    const res = await fetch('/api/user/notifications', {
      headers: { 'x-user-id': user.id }
    });
    if (res.ok) {
      const notifications = await res.json();
      setUser(prev => prev ? { ...prev, notifications } : null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    if (!user) return;
    const res = await fetch(`/api/user/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: { 'x-user-id': user.id }
    });

    if (res.ok) {
      const notifications = await res.json();
      setUser(prev => prev ? { ...prev, notifications } : null);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    const res = await fetch('/api/user/notifications/read-all', {
      method: 'POST',
      headers: { 'x-user-id': user.id }
    });

    if (res.ok) {
      const notifications = await res.json();
      setUser(prev => prev ? { ...prev, notifications } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={28} />
        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
          Mentorix AI Context Bootloader...
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Determine current active view component
  const activeService = SERVICES.find(s => s.id === currentView);
  const viewTitle = 
    currentView === 'dashboard' ? 'Progress Dashboard' :
    currentView === 'profile' ? 'Personal Profile Configuration' :
    activeService ? activeService.name : 'Mentorix AI Student Desk';

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-sans text-white">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Navigation */}
        <Header 
          title={viewTitle}
          profile={user.profile}
          notifications={user.notifications}
          streakDays={user.progress.streakDays}
          onLogout={handleLogout}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <div className="p-6">
              <Dashboard 
                progress={user.progress}
                profile={user.profile}
                favorites={user.favorites}
                onCourseUpdate={handleCourseUpdate}
                onRoadmapNodeUpdate={handleRoadmapNodeUpdate}
                onStudyHoursUpdate={handleStudyHoursUpdate}
                onFavoriteDelete={handleFavoriteDelete}
                onRouteToService={setCurrentView}
                onRouteToProfile={() => setCurrentView('profile')}
              />
            </div>
          )}

          {currentView === 'profile' && (
            <div className="p-6">
              <ProfileEdit 
                profile={user.profile} 
                onProfileUpdate={handleProfileUpdate} 
              />
            </div>
          )}

          {activeService && (
            <ChatInterface 
              service={activeService}
              userId={user.id}
              favorites={user.favorites}
              onFavoriteSave={handleFavoriteSave}
              onRoadmapActivate={handleRoadmapActivate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
