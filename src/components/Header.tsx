import React, { useState } from 'react';
import { Bell, Flame, LogOut, CheckCheck, Compass, Sparkles } from 'lucide-react';
import { NotificationItem, StudentProfile } from '../types';

interface HeaderProps {
  title: string;
  profile: StudentProfile;
  notifications: NotificationItem[];
  streakDays: number;
  onLogout: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function Header({
  title,
  profile,
  notifications,
  streakDays,
  onLogout,
  onMarkRead,
  onMarkAllRead,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-black text-white uppercase tracking-tight font-sans">
          {title}
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none text-blue-400 text-[10px] uppercase tracking-widest font-black">
          <Sparkles size={11} />
          <span>{profile.targetCareer} Goal</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-orange-400 px-3 py-1.5 rounded-none text-[10px] uppercase tracking-widest font-black shadow-sm">
          <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
          <span>{streakDays} Day Streak</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications_bell_btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-none transition relative border border-zinc-800"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-zinc-950 border border-zinc-800 rounded-none shadow-2xl z-50 py-2.5 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
                <span className="font-black text-xs uppercase tracking-widest text-zinc-300">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    id="mark_all_read_btn"
                    onClick={() => {
                      onMarkAllRead();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 uppercase tracking-wider font-black flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-900">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 hover:bg-zinc-900/60 transition cursor-pointer text-xs ${
                        !notif.read ? 'bg-blue-500/5 font-medium border-l-2 border-blue-500' : ''
                      }`}
                      onClick={() => onMarkRead(notif.id)}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className={`font-black uppercase tracking-wider text-[10px] ${
                          notif.type === 'success' ? 'text-emerald-400' :
                          notif.type === 'alert' ? 'text-red-400' :
                          notif.type === 'recommendation' ? 'text-blue-400' : 'text-zinc-200'
                        }`}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mt-1" />
                        )}
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-[11px] mb-1">{notif.message}</p>
                      <span className="text-[9px] text-zinc-500 font-bold">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="hidden md:flex flex-col text-right">
          <span className="font-black text-xs text-white uppercase tracking-wider">{profile.fullName}</span>
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{profile.currentYear} • CS</span>
        </div>

        {/* Logout */}
        <button
          id="logout_btn"
          onClick={onLogout}
          title="Sign Out"
          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-none transition border border-zinc-800 hover:border-red-900/40"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
