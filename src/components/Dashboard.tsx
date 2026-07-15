import React, { useState } from 'react';
import { ProgressTracker, StudentProfile, FavoriteItem, CourseProgress, RoadmapNodeProgress } from '../types';
import Icon from './Icon';
import { 
  Flame, Award, Clock, BookOpen, CheckSquare, Sparkles, FolderHeart, Trash, PlayCircle, Eye, X, BookCheck, Sliders, ArrowUpRight 
} from 'lucide-react';

interface DashboardProps {
  progress: ProgressTracker;
  profile: StudentProfile;
  favorites: FavoriteItem[];
  onCourseUpdate: (id: string, progress: number, status: 'Not Started' | 'In Progress' | 'Completed') => Promise<void>;
  onRoadmapNodeUpdate: (roadmapId: string, nodeId: string, status: 'locked' | 'active' | 'completed') => Promise<void>;
  onStudyHoursUpdate: (hours: number) => Promise<void>;
  onFavoriteDelete: (id: string) => Promise<void>;
  onRouteToService: (id: string) => void;
  onRouteToProfile: () => void;
}

export default function Dashboard({
  progress,
  profile,
  favorites,
  onCourseUpdate,
  onRoadmapNodeUpdate,
  onStudyHoursUpdate,
  onFavoriteDelete,
  onRouteToService,
  onRouteToProfile
}: DashboardProps) {
  const [selectedFav, setSelectedFav] = useState<FavoriteItem | null>(null);
  const [courseSliders, setCourseSliders] = useState<Record<string, number>>(
    progress.courses.reduce((acc, c) => ({ ...acc, [c.id]: c.progress }), {})
  );

  const handleSliderChange = (courseId: string, value: number) => {
    setCourseSliders(prev => ({ ...prev, [courseId]: value }));
  };

  const handleCourseSave = async (courseId: string) => {
    const value = courseSliders[courseId];
    const status = value === 100 ? 'Completed' : value === 0 ? 'Not Started' : 'In Progress';
    await onCourseUpdate(courseId, value, status);
  };

  const handleIncrementHours = async () => {
    await onStudyHoursUpdate(progress.studyHoursThisWeek + 1);
  };

  const handleDecrementHours = async () => {
    if (progress.studyHoursThisWeek > 0) {
      await onStudyHoursUpdate(progress.studyHoursThisWeek - 1);
    }
  };

  const jobReadyPercentage = Math.min(
    65 + progress.completedServicesCount * 2 + (progress.courses.reduce((acc, c) => acc + c.progress, 0) / (progress.courses.length || 1)) * 0.1,
    100
  ).toFixed(0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* 1. Welcoming Context Card (Stark brutalist typography display) */}
      <div className="bg-[#050505] border border-zinc-800/80 p-8 rounded-none flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="text-blue-500 font-black tracking-widest text-xs uppercase mb-4 flex items-center gap-2">
            <Sparkles size={14} />
            <span>Personalized Growth Engine &bull; {profile.fullName}</span>
          </div>
          <h1 className="hero-text">
            {jobReadyPercentage}% JOB<br />READY.
          </h1>
          <p className="sub-hero text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed mt-4 font-sans">
            Your AI Mentor has designed customized paths to bridge skill gaps for a career in <strong className="text-white font-extrabold">{profile.targetCareer}</strong>. Engage with active services to complete core milestones.
          </p>
        </div>
        
        <button
          id="synopsis_edit_profile_btn"
          onClick={onRouteToProfile}
          className="bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-widest px-6 py-4.5 rounded-none shadow-lg transition duration-150 shrink-0 border border-white"
        >
          Customize Student Profile
        </button>
      </div>

      {/* 2. Bento Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: AI Services Consulted */}
        <div className="bg-zinc-950 border-l-4 border-l-blue-500 border border-zinc-900 p-6 rounded-none shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center rounded-none">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Services Used</div>
            <div className="text-2xl font-black text-white font-sans mt-0.5">{progress.completedServicesCount} / 16</div>
          </div>
        </div>

        {/* Stat 2: Streak Days */}
        <div className="bg-zinc-950 border-l-4 border-l-orange-500 border border-zinc-900 p-6 rounded-none shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-orange-400 flex items-center justify-center rounded-none">
            <Flame size={18} className="fill-orange-500" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Study Streak</div>
            <div className="text-2xl font-black text-white font-sans mt-0.5">{progress.streakDays} Days</div>
          </div>
        </div>

        {/* Stat 3: Milestones Completed */}
        <div className="bg-zinc-950 border-l-4 border-l-emerald-500 border border-zinc-900 p-6 rounded-none shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center rounded-none">
            <Award size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Completed Tasks</div>
            <div className="text-2xl font-black text-white font-sans mt-0.5">{progress.completedTasksCount}</div>
          </div>
        </div>

        {/* Stat 4: Weekly Hours Tracker */}
        <div className="bg-zinc-950 border-l-4 border-l-purple-500 border border-zinc-900 p-6 rounded-none shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 text-purple-400 flex items-center justify-center rounded-none">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Weekly Study</div>
              <div className="text-2xl font-black text-white font-sans mt-0.5">{progress.studyHoursThisWeek} hrs</div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleIncrementHours}
              className="px-2.5 py-1 text-white hover:bg-zinc-800 bg-zinc-900 transition text-[10px] font-black border border-zinc-800 rounded-none cursor-pointer"
            >
              +1
            </button>
            <button
              onClick={handleDecrementHours}
              className="px-2.5 py-1 text-zinc-400 hover:bg-zinc-800 bg-zinc-900 transition text-[10px] font-black border border-zinc-800 rounded-none cursor-pointer"
            >
              -1
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Tracked Learning Roadmaps */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/85 p-6 rounded-none space-y-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-3 border-b border-zinc-900">
            <CheckSquare size={16} className="text-blue-500" />
            <span>Tracked Learning Roadmaps</span>
          </h3>

          {progress.activeRoadmaps.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-4 bg-zinc-900/40 rounded-none p-6 border border-zinc-800/40">
              <BookOpen size={32} className="mx-auto text-zinc-600" />
              <div className="text-xs uppercase tracking-widest font-black text-zinc-300">No active roadmap tracked.</div>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Use the <strong className="text-blue-500 hover:underline cursor-pointer font-bold" onClick={() => onRouteToService('learning_roadmap')}>Personalized Learning Roadmap</strong> service and click <strong>"Track this Roadmap on Dashboard"</strong> to activate!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {progress.activeRoadmaps.map((rm) => {
                const totalNodes = rm.nodes.length;
                const completedNodes = rm.nodes.filter(n => n.status === 'completed').length;
                const completionPercentage = Math.round((completedNodes / totalNodes) * 100) || 0;

                return (
                  <div key={rm.id} className="border border-zinc-900 bg-zinc-900/30 rounded-none p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <h4 className="font-black text-white text-sm uppercase tracking-wide">{rm.title}</h4>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Milestone Checklist</span>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-black text-blue-500 uppercase tracking-widest block">{completionPercentage}% Completed</span>
                        <div className="text-[10px] text-zinc-400 font-bold">{completedNodes}/{totalNodes} Completed</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 rounded-none h-2 overflow-hidden border border-zinc-700/30">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-500" 
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>

                    {/* Node List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {rm.nodes.map((node) => {
                        const isCompleted = node.status === 'completed';
                        const isActive = node.status === 'active';
                        const isLocked = node.status === 'locked';

                        return (
                          <div 
                            key={node.nodeId}
                            className={`flex items-center justify-between p-3.5 rounded-none border text-xs transition ${
                              isCompleted 
                                ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300' 
                                : isActive
                                ? 'bg-blue-950/30 border-blue-800/80 text-blue-300 font-bold'
                                : 'bg-zinc-900/40 border-zinc-900/40 text-zinc-500 opacity-60'
                            }`}
                          >
                            <span className="truncate pr-2 font-medium">{node.title}</span>
                            {isCompleted ? (
                              <button
                                onClick={() => onRoadmapNodeUpdate(rm.id, node.nodeId, 'active')}
                                className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:underline bg-emerald-900/30 border border-emerald-800 px-2 py-0.5 rounded-none"
                              >
                                Completed ✓
                              </button>
                            ) : isActive ? (
                              <button
                                onClick={() => onRoadmapNodeUpdate(rm.id, node.nodeId, 'completed')}
                                className="text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-0.5 rounded-none transition"
                              >
                                Done
                              </button>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-none">Locked</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Core Courses Tracker */}
        <div className="bg-zinc-950 border border-zinc-800/85 p-6 rounded-none space-y-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-3 border-b border-zinc-900">
            <BookOpen size={16} className="text-blue-500" />
            <span>Course Enrollment Tracker</span>
          </h3>

          <div className="space-y-5">
            {progress.courses.map((course) => (
              <div key={course.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-none space-y-3">
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <h4 className="font-extrabold text-white text-xs leading-snug">{course.title}</h4>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block mt-0.5">{course.provider}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none ${
                    course.status === 'Completed' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' :
                    course.status === 'In Progress' ? 'bg-blue-950 border border-blue-800 text-blue-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {course.status}
                  </span>
                </div>

                {/* Slider bar for custom tracking */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Progress</span>
                    <span>{courseSliders[course.id] ?? course.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={courseSliders[course.id] ?? course.progress}
                    onChange={(e) => handleSliderChange(course.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Save course progress action */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleCourseSave(course.id)}
                    className="text-[9px] font-black uppercase tracking-widest text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-none transition"
                  >
                    Sync Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Saved Advice & Favorite Recommendations */}
      <div className="bg-zinc-950 border border-zinc-800/85 p-6 rounded-none space-y-6">
        <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-3 border-b border-zinc-900">
          <FolderHeart size={16} className="text-blue-500" />
          <span>Saved Mentor Recommendations</span>
        </h3>

        {favorites.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 bg-zinc-900/40 rounded-none p-6 border border-zinc-800/40 max-w-md mx-auto space-y-3">
            <FolderHeart size={32} className="mx-auto text-zinc-700" />
            <div className="text-xs uppercase tracking-widest font-black text-zinc-300">Bookmarked advice is empty.</div>
            <p className="text-[11px] text-zinc-500">
              When conversing with any of the 16 AI services, click "Save to Favorites" on recommendations to pin them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((fav) => (
              <div 
                key={fav.id}
                className="bg-zinc-900/40 border border-zinc-900 hover:border-zinc-700 rounded-none p-5 transition space-y-3 flex flex-col justify-between border-l-4 border-l-blue-500"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-blue-400">
                    <Sparkles size={11} />
                    <span>{fav.serviceName}</span>
                  </div>
                  <h4 className="font-extrabold text-white text-xs mt-2 leading-snug uppercase tracking-wide">{fav.title}</h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed mt-1.5 line-clamp-3">
                    {fav.content.replace(/[#*`_-]/g, '')}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-zinc-900/80 mt-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    Saved {new Date(fav.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onFavoriteDelete(fav.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-none hover:bg-red-950/20 border border-zinc-800 transition"
                      title="Delete Saved advice"
                    >
                      <Trash size={12} />
                    </button>
                    <button
                      onClick={() => setSelectedFav(fav)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white text-[9px] font-black uppercase tracking-widest rounded-none transition"
                    >
                      <Eye size={11} />
                      View Advice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Favorite Modal */}
      {selectedFav && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-none border border-zinc-800 max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            <button
              onClick={() => setSelectedFav(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-none transition border border-zinc-850"
            >
              <X size={15} />
            </button>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <span className="text-[9px] uppercase font-black text-blue-400 tracking-widest bg-blue-950/40 border border-blue-900/60 px-2.5 py-1 rounded-none inline-block">
                  {selectedFav.serviceName}
                </span>
                <h3 className="text-base font-black text-white tracking-tight mt-3 uppercase">{selectedFav.title}</h3>
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider mt-1">Saved Advice on {new Date(selectedFav.createdAt).toLocaleString()}</span>
              </div>

              <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans bg-zinc-900/60 p-5 border border-zinc-850/80 rounded-none max-h-[50vh] overflow-y-auto scrollbar-thin">
                {selectedFav.content}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-end gap-3">
              <button
                onClick={() => {
                  onRouteToService(selectedFav.serviceId);
                  setSelectedFav(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-none transition"
              >
                <span>Navigate to Service</span>
                <ArrowUpRight size={12} />
              </button>
              <button
                onClick={() => setSelectedFav(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-none transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
