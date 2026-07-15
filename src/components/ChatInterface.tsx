import React, { useState, useEffect, useRef } from 'react';
import { ServiceDefinition, ChatMessage, Conversation, FavoriteItem } from '../types';
import Icon from './Icon';
import { 
  Send, Loader2, Bookmark, BookmarkCheck, Sparkles, Download, PlayCircle, PlusCircle, AlertCircle, RefreshCw, BookmarkPlus 
} from 'lucide-react';

interface ChatInterfaceProps {
  service: ServiceDefinition;
  userId: string;
  onFavoriteSave: (fav: Omit<FavoriteItem, 'id' | 'createdAt'>) => Promise<void>;
  onRoadmapActivate: (title: string, nodes: string[]) => Promise<void>;
  favorites: FavoriteItem[];
}

export default function ChatInterface({ 
  service, 
  userId, 
  onFavoriteSave, 
  onRoadmapActivate, 
  favorites 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [savingFav, setSavingFav] = useState(false);
  const [favSaved, setFavSaved] = useState<Record<string, boolean>>({});
  const [roadmapTracked, setRoadmapTracked] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt ideas for the current service
  const PRESET_PROMPTS: Record<string, string[]> = {
    career_mentor: [
      'What are the most promising career paths for my major?',
      'Which professional certifications should I prioritize?',
      'How should I position myself to enter the tech industry?'
    ],
    learning_roadmap: [
      'Design a 12-week roadmap to master Full-Stack Web Development.',
      'Create a daily learning schedule for learning Python and Machine Learning.',
      'Generate a structured path to pass AWS Cloud Practitioner certificate.'
    ],
    resume_analyzer: [
      'Analyze my resume draft. [Paste resume below or write key points here]',
      'How do I rewrite my project bullet points to be more impact-driven?',
      'Suggest key industry terms to bypass ATS filters in software engineering.'
    ],
    skill_gap: [
      'What skill gap do I have to bridge to secure a Data Engineer role?',
      'Compare front-end versus back-end engineer gaps for my skills.',
      'Suggest a training course to learn microservice system design.'
    ],
    project_mentor: [
      'Suggest three unique web applications I can build to get hired.',
      'Give me a step-by-step major capstone project using React and Node.js.',
      'How do I plan my computer systems engineering final year project?'
    ],
    internship_recommendation: [
      'What criteria should a 3rd year student focus on to secure an internship?',
      'Help me draft cover letter talking points highlighting my skills.',
      'How should I search for remote software engineering internships?'
    ],
    hackathon_finder: [
      'Suggest standard hackathon MVP ideas for a student developer.',
      'What are some winning pitch strategies for judges?',
      'Recommend platforms to find hackathons and technical contests.'
    ],
    course_recommendation: [
      'What free Coursera/Youtube playlists are best for SQL and PostgreSQL?',
      'Recommend three must-read books for software craftsmanship.',
      'Which certifications are genuinely respected by tech recruiters?'
    ],
    interview_prep: [
      'Give me 5 hard React and JavaScript technical questions with answers.',
      'Conduct a mock behavioral interview based on the STAR format.',
      'Give me an algorithms coding challenge to solve with test cases.'
    ],
    coding_mentor: [
      'Help me debug my React useEffect causing infinite re-renders.',
      'Explain the Difference between Object and Map in JS with code.',
      'How do I optimize a slow SQL query with indexes?'
    ],
    study_planner: [
      'Design a Pomodoro-based study planner for my exam week.',
      'How do I manage university lectures while self-studying modern frameworks?',
      'Suggest a revision schedule for active recall of complex concepts.'
    ],
    assignment_assistant: [
      'Explain the difference between 3NF and BCNF database normalization.',
      'Help me outline a research report on cloud virtualization models.',
      'Give me a guide on how to structure a software requirements document.'
    ],
    exam_prep: [
      'Draft a mock test paper on Data Structures and Algorithms.',
      'Provide a quick summary guide of Operating System process scheduling.',
      'What are some top-tier memory hacks for engineering students?'
    ],
    research_assistant: [
      'Summarize key directions in generative AI models for code.',
      'Outline a professional abstract for a student research paper.',
      'Recommend methodologies to evaluate deep learning performance.'
    ],
    startup_mentor: [
      'Validate my startup idea of a student tutoring marketplace.',
      'Create a Business Model Canvas draft for an on-demand resume service.',
      'What should be in a 5-slide student startup pitch deck?'
    ],
    doubt_solver: [
      'Explain how HTTPS works using a real-world letter analogy.',
      'Explain asynchronous event loops in Node.js clearly.',
      'How does public-key cryptography ensure secure data transmission?'
    ]
  };

  useEffect(() => {
    // Reset state when service changes
    setMessages([]);
    setError('');
    setConversationId(null);
    setRoadmapTracked(false);
    setInput('');
    
    // Fetch previous conversation if it exists for this service
    fetchPreviousConversations();
  }, [service]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPreviousConversations = async () => {
    try {
      const res = await fetch('/api/user/conversations', {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const list: Conversation[] = await res.json();
        const existing = list.find(c => c.serviceId === service.id);
        if (existing) {
          setConversationId(existing.id);
          setMessages(existing.messages);
        }
      }
    } catch (err) {
      console.error('Failed to load past chat:', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim() || loading) return;

    setError('');
    setLoading(true);
    if (!textToSend) setInput('');

    // Append user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      text: msgText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`/api/services/${service.id}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          message: msgText,
          history: messages,
          conversationId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get mentor response');
      }

      setConversationId(data.conversationId);
      setMessages(data.conversation.messages);
    } catch (err: any) {
      setError(err.message || 'An error occurred during communication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFavorites = async (text: string) => {
    setSavingFav(true);
    try {
      const firstLine = text.split('\n')[0].replace(/[#*`_-]/g, '').trim();
      const title = firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
      
      await onFavoriteSave({
        serviceId: service.id,
        serviceName: service.name,
        title: title || `${service.name} Advice`,
        content: text
      });

      setFavSaved(prev => ({ ...prev, [text]: true }));
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Could not save favorite recommendation.');
    } finally {
      setSavingFav(false);
    }
  };

  // Check if a milestone list exists in the text and extract it
  const parseMilestones = (text: string): string[] => {
    const match = text.match(/<milestones>([\s\S]*?)<\/milestones>/);
    if (match && match[1]) {
      return match[1].split(',').map(m => m.trim()).filter(m => m.length > 0);
    }
    return [];
  };

  const handleTrackRoadmap = async (text: string) => {
    const milestones = parseMilestones(text);
    if (milestones.length === 0) return;

    try {
      await onRoadmapActivate(`${service.name} Roadmap`, milestones);
      setRoadmapTracked(true);
    } catch (err) {
      console.error(err);
      alert('Failed to instantiate tracked roadmap.');
    }
  };

  const handlePrintReport = () => {
    // Open a beautifully styled print-friendly document window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const messagesHTML = messages.map(m => `
      <div class="message ${m.role}">
        <div class="meta">${m.role === 'user' ? 'Student Query' : 'AI Mentor Response'} &bull; ${new Date(m.createdAt).toLocaleString()}</div>
        <div class="content">${m.text.replace(/\n/g, '<br>').replace(/<milestones>.*?<\/milestones>/, '')}</div>
      </div>
    `).join('<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">');

    printWindow.document.write(`
      <html>
        <head>
          <title>Mentorix AI Official Consultation Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: bold; color: #1e293b; }
            .brand span { color: #4f46e5; }
            .report-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold; }
            .meta { font-size: 12px; color: #64748b; font-weight: bold; margin-bottom: 5px; }
            .message { margin-bottom: 20px; }
            .message.user { padding-left: 10px; border-left: 3px solid #64748b; }
            .message.model { padding-left: 10px; border-left: 3px solid #4f46e5; }
            .content { font-size: 14px; }
            .footer { border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Mentorix<span>AI</span></div>
            <div class="report-title">${service.name} Report</div>
          </div>
          <div style="margin-bottom: 30px; font-size: 13px; background: #f8fafc; padding: 15px; border-radius: 8px;">
            <strong>Menteeship Output Report:</strong> Dynamically generated based on your registered academic student profile, active skillset, and career goals.
          </div>
          ${messagesHTML}
          <div class="footer">
            Mentorix AI Student Mentorship Platform &bull; Completed dynamically via Gemini-3.5-flash &bull; Page 1 of 1
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#050505] relative text-white">
      {/* Service Header */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 border border-zinc-800 text-blue-400 p-3 rounded-none flex items-center justify-center flex-shrink-0">
            <Icon name={service.iconName} size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">{service.name}</h2>
            <p className="text-[11px] text-zinc-400 max-w-xl leading-relaxed mt-0.5">{service.description}</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            id="download_report_btn"
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-[10px] uppercase tracking-widest font-black rounded-none transition border border-white shrink-0 self-start sm:self-center"
          >
            <Download size={12} />
            <span>Download Report</span>
          </button>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-none flex items-center justify-center mx-auto text-blue-500 shadow-sm animate-pulse">
              <Sparkles size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Start Your Interactive Mentoring Session</h3>
              <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
                Choose one of the specialized prompt recommendations below or write your own specific query to generate completely personalized advice!
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {PRESET_PROMPTS[service.id]?.map((prompt, i) => (
                <button
                  key={i}
                  id={`preset_prompt_${i}_btn`}
                  onClick={() => handleSend(prompt)}
                  className="p-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 hover:text-white rounded-none text-left text-[11px] font-black uppercase tracking-wider text-zinc-400 transition-all leading-relaxed cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const milestones = parseMilestones(msg.text);
              const showRoadmapWidget = service.id === 'learning_roadmap' && msg.role === 'model' && milestones.length > 0;
              const cleanText = msg.text.replace(/<milestones>([\s\S]*?)<\/milestones>/g, '');

              return (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl rounded-none p-5 shadow-sm border ${
                    msg.role === 'user'
                      ? 'bg-zinc-900 border-zinc-800 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-100'
                  }`}>
                    {/* Meta Header */}
                    <div className="flex items-center justify-between mb-3 text-[9px] uppercase tracking-widest font-black text-zinc-500">
                      <span>{msg.role === 'user' ? 'Student query' : 'AI Service Response'}</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Text Body */}
                    <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans break-words space-y-4">
                      {cleanText}
                    </div>

                    {/* Model Actions */}
                    {msg.role === 'model' && (
                      <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => handleSaveToFavorites(cleanText)}
                          disabled={savingFav || favSaved[cleanText]}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border transition cursor-pointer ${
                            favSaved[cleanText]
                              ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                              : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {favSaved[cleanText] ? (
                            <>
                              <BookmarkCheck size={11} />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark size={11} />
                              Save Favorite
                            </>
                          )}
                        </button>

                        {showRoadmapWidget && (
                          <button
                            onClick={() => handleTrackRoadmap(msg.text)}
                            disabled={roadmapTracked}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border transition cursor-pointer ${
                              roadmapTracked
                                ? 'bg-blue-950 border-blue-900 text-blue-400'
                                : 'bg-blue-600 border-blue-500 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <PlusCircle size={11} />
                            <span>{roadmapTracked ? 'Tracked ✓' : 'Track Roadmap'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start max-w-4xl mx-auto">
            <div className="bg-zinc-950 border border-zinc-900 rounded-none p-4 shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={14} />
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Context analysis in progress...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="max-w-4xl mx-auto bg-red-950/30 border border-red-900/60 rounded-none p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-400">
              <p className="font-black uppercase tracking-widest">Groq API Connection Offline</p>
              <p className="mt-1 leading-relaxed text-[11px] text-zinc-400">{error}</p>
              <button
                onClick={() => handleSend()}
                className="mt-2 text-red-400 font-black uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                Retry Context
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="bg-zinc-950 border-t border-zinc-900 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="max-w-4xl mx-auto flex gap-3 items-center"
          id="chat_form"
        >
          <input
            id="chat_message_input"
            type="text"
            required
            disabled={loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 rounded-none transition"
            placeholder={service.placeholder}
          />
          <button
            id="chat_send_btn"
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-none shadow-md transition disabled:opacity-50 flex-shrink-0 border border-blue-500 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
