import React, { useState } from 'react';
import { SERVICES, ServiceDefinition } from '../types';
import Icon from './Icon';
import { Compass, LayoutDashboard, UserCog, Sparkles, ChevronDown, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'profile' | string;
  onViewChange: (view: 'dashboard' | 'profile' | string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    career: true,
    academic: true,
    technical: true,
    business: true,
  });

  const categories = [
    { id: 'career', name: 'Career & Employment', color: 'text-emerald-500 bg-emerald-50' },
    { id: 'academic', name: 'Academic & Studies', color: 'text-blue-500 bg-blue-50' },
    { id: 'technical', name: 'Coding & Engineering', color: 'text-purple-500 bg-purple-50' },
    { id: 'business', name: 'Innovation & Startup', color: 'text-amber-500 bg-amber-50' },
  ];

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside className="w-64 bg-zinc-950 text-slate-200 flex flex-col h-screen flex-shrink-0 border-r border-zinc-800/80">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-800/80">
        <span className="text-2xl font-black tracking-tighter text-white font-sans uppercase block">
          Mentorix<span className="text-blue-500"> AI</span>
        </span>
      </div>

      {/* Navigation Scroll Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin">
        
        {/* Main Application Area */}
        <div className="space-y-1.5">
          <span className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block mb-2">
            Main Portal
          </span>
          
          <button
            id="sidebar_dashboard_btn"
            onClick={() => onViewChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs uppercase tracking-widest font-extrabold transition ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            id="sidebar_profile_btn"
            onClick={() => onViewChange('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs uppercase tracking-widest font-extrabold transition ${
              currentView === 'profile'
                ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <UserCog size={16} />
            <span>Profile</span>
          </button>
        </div>

        {/* AI Services List */}
        <div className="space-y-4">
          <span className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block">
            AI Services (16)
          </span>

          {categories.map((cat) => {
            const catServices = SERVICES.filter(s => s.category === cat.id);
            const isOpen = openCategories[cat.id];

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-none text-[11px] font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      cat.id === 'career' ? 'bg-emerald-500' :
                      cat.id === 'academic' ? 'bg-blue-500' :
                      cat.id === 'technical' ? 'bg-purple-500' : 'bg-amber-500'
                    }`} />
                    <span>{cat.name}</span>
                  </div>
                  <ChevronDown
                    size={13}
                    className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="space-y-1 pl-2 border-l border-zinc-800 ml-3.5">
                    {catServices.map((service) => {
                      const isActive = currentView === service.id;
                      return (
                        <button
                          key={service.id}
                          id={`sidebar_service_${service.id}_btn`}
                          onClick={() => onViewChange(service.id)}
                          title={service.description}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none text-xs transition text-left ${
                            isActive
                              ? 'bg-zinc-900 text-white font-extrabold border-l-2 border-blue-500'
                              : 'hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Icon name={service.iconName} size={13} className="flex-shrink-0 text-zinc-500" />
                          <span className="truncate">{service.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Powered tag in footer */}
      <div className="p-6 border-t border-zinc-900 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
        <Sparkles size={12} className="text-blue-500" />
        <span>Context Engine</span>
      </div>
    </aside>
  );
}
