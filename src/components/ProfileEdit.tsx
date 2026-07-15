import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { User, Sparkles, Plus, X, Check, Save, GraduationCap } from 'lucide-react';

interface ProfileEditProps {
  profile: StudentProfile;
  onProfileUpdate: (updatedProfile: StudentProfile) => Promise<void>;
}

const PRESET_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Django', 
  'Java', 'C++', 'SQL', 'PostgreSQL', 'HTML/CSS', 'Tailwind CSS', 'Git', 'Docker',
  'AWS', 'Machine Learning', 'Data Analysis', 'Object Oriented Programming'
];

const PRESET_INTERESTS = [
  'Web Development', 'Mobile App Development', 'AI/ML Engineering', 'Data Science', 
  'Cloud Architecture', 'Cybersecurity', 'UI/UX Product Design', 'FinTech Applications',
  'Blockchain Systems', 'Game Development', 'Embedded Systems', 'SaaS Entrepreneurship'
];

export default function ProfileEdit({ profile, onProfileUpdate }: ProfileEditProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel);
  const [major, setMajor] = useState(profile.major);
  const [currentYear, setCurrentYear] = useState(profile.currentYear);
  const [targetCareer, setTargetCareer] = useState(profile.targetCareer);
  const [careerGoals, setCareerGoals] = useState(profile.careerGoals);
  
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [interests, setInterests] = useState<string[]>(profile.interests);

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    const updatedProfile: StudentProfile = {
      fullName,
      educationLevel,
      major,
      currentYear,
      targetCareer,
      skills,
      interests,
      careerGoals
    };

    try {
      await onProfileUpdate(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white">
      {/* Introduction Card */}
      <div className="bg-zinc-950 border border-zinc-800/80 p-6 rounded-none flex flex-col md:flex-row items-center gap-5">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-none flex items-center justify-center text-blue-400 flex-shrink-0 shadow-sm">
          <User size={28} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Configure Your Mentorship Context</h2>
          <p className="text-[11px] text-zinc-400 max-w-xl leading-relaxed mt-1">
            Mentorix AI injects your academic profile, target goals, and active skills directly into your prompts dynamically. Update this form to receive completely customized recommendations!
          </p>
        </div>
        <div className="bg-blue-950 border border-blue-900 text-blue-400 px-3.5 py-1.5 rounded-none text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 shrink-0 self-center">
          <Sparkles size={11} className="animate-pulse text-blue-400" />
          <span>Context Sync Active</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} id="profile_form" className="space-y-6">
        {error && (
          <div className="bg-red-950/30 border border-red-900/60 text-red-400 p-3.5 rounded-none text-xs font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Information */}
          <div className="bg-zinc-950 border border-zinc-800/80 p-6 rounded-none space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-2 border-b border-zinc-900">
              <GraduationCap size={16} className="text-blue-500" />
              <span>Academic Identity</span>
            </h3>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Full Name
              </label>
              <input
                id="profile_name"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="mt-1.5 block w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:outline-none rounded-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Education Level
                </label>
                <select
                  id="profile_education"
                  value={educationLevel}
                  onChange={e => setEducationLevel(e.target.value)}
                  className="mt-1.5 block w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white shadow-sm focus:border-blue-500 focus:outline-none rounded-none text-xs [&>option]:bg-zinc-950"
                >
                  <option>High School</option>
                  <option>Associate Degree</option>
                  <option>Bachelor's Degree</option>
                  <option>Master's Degree</option>
                  <option>Ph.D. Candidate</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Academic Year
                </label>
                <select
                  id="profile_year"
                  value={currentYear}
                  onChange={e => setCurrentYear(e.target.value)}
                  className="mt-1.5 block w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white shadow-sm focus:border-blue-500 focus:outline-none rounded-none text-xs [&>option]:bg-zinc-950"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>5th Year +</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Major / Field of Study
              </label>
              <input
                id="profile_major"
                type="text"
                required
                value={major}
                onChange={e => setMajor(e.target.value)}
                className="mt-1.5 block w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:outline-none rounded-none text-xs"
                placeholder="e.g. Computer Science and Engineering"
              />
            </div>
          </div>

          {/* Goals & Professional Focus */}
          <div className="bg-zinc-950 border border-zinc-800/80 p-6 rounded-none space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-2 border-b border-zinc-900">
              <Sparkles size={16} className="text-blue-500" />
              <span>Career Aspiration</span>
            </h3>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Target Career Title
              </label>
              <input
                id="profile_career"
                type="text"
                required
                value={targetCareer}
                onChange={e => setTargetCareer(e.target.value)}
                className="mt-1.5 block w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:outline-none rounded-none text-xs"
                placeholder="e.g. Senior Machine Learning Engineer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Mentorship Goals Narrative
              </label>
              <textarea
                id="profile_goals"
                required
                rows={4}
                value={careerGoals}
                onChange={e => setCareerGoals(e.target.value)}
                className="mt-1.5 block w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-white shadow-sm focus:border-blue-500 focus:outline-none rounded-none text-xs resize-none scrollbar-thin"
                placeholder="Detail what milestones you want to achieve, your project limits, or short-term constraints..."
              />
            </div>
          </div>
        </div>

        {/* Skill Gap and Interests Configuration */}
        <div className="bg-zinc-950 border border-zinc-800/80 p-6 rounded-none space-y-6">
          {/* Skills Management */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Active Skillset Tagging
            </label>
            
            {/* Tag List */}
            <div className="flex flex-wrap gap-2 py-1">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none text-xs font-bold text-zinc-300 uppercase tracking-wider"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-zinc-800 rounded-none p-0.5 text-zinc-500 hover:text-red-400 transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-zinc-500 italic">No skills configured. Add some skills below!</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                id="new_skill_input"
                type="text"
                placeholder="Enter custom skill (e.g., Spring Boot)"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(newSkill))}
                className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-black px-4 rounded-none text-[11px] uppercase tracking-wider transition flex items-center gap-1 border border-zinc-700"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider block mb-1">Quick Preset Recommendations:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                {PRESET_SKILLS.filter(s => !skills.includes(s)).map(preset => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleAddSkill(preset)}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-none text-[10px] transition font-bold uppercase tracking-wider"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-zinc-900" />

          {/* Interests Management */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Academic & Professional Interests
            </label>
            
            {/* Tag List */}
            <div className="flex flex-wrap gap-2 py-1">
              {interests.map(interest => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none text-xs font-bold text-zinc-300 uppercase tracking-wider"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:bg-zinc-800 rounded-none p-0.5 text-zinc-500 hover:text-red-400 transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {interests.length === 0 && (
                <span className="text-xs text-zinc-500 italic">No interests selected. Choose some below!</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                id="new_interest_input"
                type="text"
                placeholder="Enter custom interest (e.g., NLP)"
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInterest(newInterest))}
                className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none"
              />
              <button
                type="button"
                onClick={() => handleAddInterest(newInterest)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-black px-4 rounded-none text-[11px] uppercase tracking-wider transition flex items-center gap-1 border border-zinc-700"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider block mb-1">Quick Preset Recommendations:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                {PRESET_INTERESTS.filter(i => !interests.includes(i)).map(preset => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleAddInterest(preset)}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-none text-[10px] transition font-bold uppercase tracking-wider"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 items-center">
          {success && (
            <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/20 border border-emerald-900/60 rounded-none animate-fade-in">
              <Check size={12} />
              <span>Profile Synced</span>
            </span>
          )}
          <button
            id="save_profile_btn"
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-none shadow-md text-xs uppercase tracking-widest transition disabled:opacity-50 flex items-center gap-2 border border-blue-500 cursor-pointer"
          >
            {saving ? 'Syncing...' : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
