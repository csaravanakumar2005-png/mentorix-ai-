import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';
import { db } from './src/server/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Groq Client (Grow API)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY,
});

app.use(express.json());

// API Routes
// Middleware to authenticate user via x-user-id header
const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user ID header' });
  }
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Student account not found' });
  }
  req.body._user = user;
  next();
};

// 1. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // In a real app we'd hash and compare, here we do a simple check
  if (user.passwordHash !== password) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  res.json({
    id: user.id,
    email: user.email,
    profile: user.profile,
    progress: user.progress,
    notifications: user.notifications,
    favorites: user.favorites,
  });
});

// 2. Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields (email, password, fullName) are required' });
  }

  const existingUser = db.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const user = db.createUser(email, password, fullName);
  res.status(201).json({
    id: user.id,
    email: user.email,
    profile: user.profile,
    progress: user.progress,
    notifications: user.notifications,
    favorites: user.favorites,
  });
});

// 3. Auth: Guest/Demo login (so users don't get stuck)
app.post('/api/auth/guest', (req, res) => {
  const demoEmail = 'student@mentorix.ai';
  let user = db.getUserByEmail(demoEmail);
  if (!user) {
    user = db.createUser(demoEmail, 'password', 'Demo Student');
  }
  res.json({
    id: user.id,
    email: user.email,
    profile: user.profile,
    progress: user.progress,
    notifications: user.notifications,
    favorites: user.favorites,
  });
});

// 4. Get Current Profile & State
app.get('/api/user/state', authenticateUser, (req, res) => {
  const user = req.body._user;
  res.json({
    id: user.id,
    email: user.email,
    profile: user.profile,
    progress: user.progress,
    notifications: user.notifications,
    favorites: user.favorites,
  });
});

// 5. Update Profile
app.put('/api/user/profile', authenticateUser, (req, res) => {
  const user = req.body._user;
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: 'Profile payload is required' });
  }

  const updatedUser = db.updateUserProfile(user.id, profile);
  res.json(updatedUser.profile);
});

// 6. Get Favorites
app.get('/api/user/favorites', authenticateUser, (req, res) => {
  const user = req.body._user;
  res.json(user.favorites);
});

// 7. Add Favorite
app.post('/api/user/favorites', authenticateUser, (req, res) => {
  const user = req.body._user;
  const { serviceId, serviceName, title, content } = req.body;
  if (!serviceId || !serviceName || !title || !content) {
    return res.status(400).json({ error: 'Missing favorite fields' });
  }

  const newFav = db.saveFavorite(user.id, { serviceId, serviceName, title, content });
  res.status(201).json(newFav);
});

// 8. Delete Favorite
app.delete('/api/user/favorites/:favoriteId', authenticateUser, (req, res) => {
  const user = req.body._user;
  db.removeFavorite(user.id, req.params.favoriteId);
  res.json({ success: true });
});

// 9. Get Progress
app.get('/api/user/progress', authenticateUser, (req, res) => {
  const user = req.body._user;
  res.json(user.progress);
});

// 10. Create Active Learning Roadmap
app.post('/api/user/progress/roadmaps', authenticateUser, (req, res) => {
  const user = req.body._user;
  const { serviceId, title, nodes } = req.body;
  if (!serviceId || !title || !nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'Missing or invalid roadmap fields' });
  }

  const updatedProgress = db.addActiveRoadmap(user.id, serviceId, title, nodes);
  res.status(201).json(updatedProgress);
});

// 11. Update Roadmap Node Status
app.put('/api/user/progress/roadmaps/:roadmapId/nodes/:nodeId', authenticateUser, (req, res) => {
  const user = req.body._user;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updatedProgress = db.updateRoadmapNode(user.id, req.params.roadmapId, req.params.nodeId, status);
  res.json(updatedProgress);
});

// 12. Update Course Progress
app.put('/api/user/progress/courses/:courseId', authenticateUser, (req, res) => {
  const user = req.body._user;
  const { progress, status } = req.body;
  if (progress === undefined || !status) {
    return res.status(400).json({ error: 'Progress and status are required' });
  }

  const updatedProgress = db.updateCourseProgress(user.id, req.params.courseId, progress, status);
  res.json(updatedProgress);
});

// 13. Update Study Hours
app.put('/api/user/progress/hours', authenticateUser, (req, res) => {
  const user = req.body._user;
  const { hours } = req.body;
  if (hours === undefined) {
    return res.status(400).json({ error: 'Hours is required' });
  }

  const updatedProgress = db.updateProgress(user.id, { studyHoursThisWeek: hours });
  res.json(updatedProgress);
});

// 14. Get Conversations
app.get('/api/user/conversations', authenticateUser, (req, res) => {
  const user = req.body._user;
  res.json(db.getConversations(user.id));
});

// 15. Get Specific Conversation
app.get('/api/user/conversations/:conversationId', authenticateUser, (req, res) => {
  const user = req.body._user;
  const conversation = db.getConversation(user.id, req.params.conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(conversation);
});

// 16. Get Notifications
app.get('/api/user/notifications', authenticateUser, (req, res) => {
  const user = req.body._user;
  res.json(user.notifications);
});

// 17. Mark Notification Read
app.post('/api/user/notifications/:notificationId/read', authenticateUser, (req, res) => {
  const user = req.body._user;
  const notifications = db.markNotificationRead(user.id, req.params.notificationId);
  res.json(notifications);
});

// 18. Mark All Notifications Read
app.post('/api/user/notifications/read-all', authenticateUser, (req, res) => {
  const user = req.body._user;
  const notifications = db.markAllNotificationsRead(user.id);
  res.json(notifications);
});

// 19. AI Chat Endpoints for all 16 Services (Unified Proxy Router)
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  career_mentor: `You are a professional Career Mentor. Recommend suitable roles, certifications, and industry trends based on the student's major, year, skills, and goals. Always construct your response as an elegant, detailed structured recommendation.
Provide actionable suggestions, specific search keywords, and short-term and long-term targets. Use clear sections, bullet points, and high-quality formatting.`,

  learning_roadmap: `You are an expert curriculum developer. Output a structured, step-by-step learning roadmap tailored to the student's major and target career.
Include daily, weekly, monthly, and semester-wise learning plans. Be concrete. Outline key concepts to study, project tasks to practice, and standard certifications.
Crucial: At the very end of your response, output a special XML tag <milestones> containing comma-separated key milestone titles that the user can track.
Example: <milestones>Fundamentals of Python, Web Routing, PostgreSQL Databases, Docker Containers</milestones> but make it highly specific to their request. Do not include extra text inside the tag.`,

  resume_analyzer: `You are an ATS parser and recruitment consultant. Analyze the resume text supplied by the student.
First, output a precise ATS Compatibility Score (a number from 0 to 100) and format it clearly at the top.
Structure your analysis into four key sections:
1. ATS Score & Fit
2. Core Strengths (What they did right)
3. Skill Gaps & Weaknesses (What is missing)
4. Concrete Improvement Suggestions (Formatting, action verbs, keyword optimization)
Be constructive and professional.`,

  skill_gap: `You are a tech skill advisor. Check the student's current skills against their target career.
Identify critical missing skills, prioritize them (High/Medium/Low priority), and recommend direct, high-quality learning resources (official documentations, free courses, tutorials) to bridge those gaps. Give exact topics they must master.`,

  project_mentor: `You are a senior technical lead. Suggest 3 high-impact project ideas for the student:
1. A Mini Project (to practice core fundamentals, 1-2 weeks)
2. A Major Project (to learn backend/frontend integration, 3-4 weeks)
3. A Final-Year Capstone Project (production-ready, full security, cloud deployments, 2-3 months)
For each project, detail:
- Comprehensive project description and purpose
- Full stack recommendations (e.g. Node.js, Express, React, Tailwind, PostgreSQL)
- Step-by-step implementation guide (divided into phases)
- Key learning outcomes and portfolio value.`,

  internship_recommendation: `You are an industry connector and HR coordinator. Recommend realistic internship titles, keywords to search, specific types of startups or corporations to target, cover letter talking points based on their skills, and techniques to bypass resume screening. Highlight standard roles that match their background.`,

  hackathon_finder: `You are a competition finder and hackathon veteran. Suggest typical active themes, hackathon contests, coding platforms (LeetCode, HackerRank, Devpost, Major League Hacking), and team formulation strategies. Offer winning strategies: how to brainstorm MVPs, how to present to judges, and code repository templates.`,

  course_recommendation: `You are an educational content curator. Suggest high-quality, direct learning courses, books, Youtube playlists, certifications, and official documentation.
Divide into Free vs Paid. Include actual course/book titles, providers, and brief explanations of why they are relevant to their target career.`,

  interview_prep: `You are a senior technical recruiter. Conduct customized interview preparation.
Generate:
1. 3 Technical Questions (pertaining to their skills)
2. 2 HR / Behavioral Questions (using the STAR method)
3. 1 Coding Challenge with a prompt, constraints, and standard solution with explanation.
Provide sample ideal answers, core criteria the interviewer is looking for, and instant feedback.`,

  coding_mentor: `You are an incredibly patient, senior Coding Mentor. Explain coding bugs, suggest optimizations, rewrite confusing scripts into clean production-ready alternatives, and explain underlying programming paradigms (like OOP, Big-O complexity, or MVC) with simple analogies and beautiful diagrams.`,

  study_planner: `You are an academic success coach. Design a personalized study schedule and revision planner.
Include time-management techniques (e.g., Pomodoro, Active Recall), daily hour allocation, subject distribution, and techniques to manage exam fatigue.`,

  assignment_assistant: `You are an academic tutor. Explain the core requirements of their assignment, break down complex topics into digestible steps, explain concepts, and provide standard academic references.
Crucial Rule: Do NOT write direct copy-paste solutions or homework essays. Guide them through the analytical process to strictly prevent plagiarism. Give them research paths and outlines instead.`,

  exam_prep: `You are an exam preparation advisor. Design a high-efficiency revision blueprint:
- High-yield topics they must prioritize
- Summary guides of complex concepts
- 3 mock test questions with detailed step-by-step solutions
- Exam-taking strategies (time allocation, panic avoidance).`,

  research_assistant: `You are an experienced research mentor. Summarize complex scientific theories, guide them in reviewing papers, suggest academic journals/literature to explore, recommend methodology patterns, and show how to structure an academic abstract or research paper outline.`,

  startup_mentor: `You are a startup incubator director. Validate the student's startup or business ideas:
- Provide direct product/market fit validation
- Draft a recommended 9-block Business Model Canvas outline
- Scope a minimal viable product (MVP) they can build in 30 days
- Draft a 30-second elevator pitch blueprint.`,

  doubt_solver: `You are an AI Doubt Solver. Provide clear, direct academic or technical explanations.
Utilize simple real-world analogies, step-by-step breakdowns, and illustrative code snippets or markdown diagrams. Never write hand-wavy explanations; give concrete proof, derivations, or comprehensive examples.`
};

app.post('/api/services/:serviceId/chat', authenticateUser, async (req, res) => {
  const { serviceId } = req.params;
  const { message, history, conversationId } = req.body;
  const user = req.body._user;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const systemInstruction = SYSTEM_INSTRUCTIONS[serviceId];
  if (!systemInstruction) {
    return res.status(404).json({ error: 'AI Service not found' });
  }

  // Personalize the instruction with student profile context
  const profileContext = `
STUDENT PROFILE CONTEXT:
- Name: ${user.profile.fullName}
- Education Level: ${user.profile.educationLevel}
- Major: ${user.profile.major}
- Current Academic Year: ${user.profile.currentYear}
- Target Career Goal: ${user.profile.targetCareer}
- Skills: ${user.profile.skills.join(', ')}
- Interests: ${user.profile.interests.join(', ')}
- Career Goals Narrative: ${user.profile.careerGoals}

Incorporate this student's background to personalize your response. Do not explicitly say 'According to your profile', but make suggestions completely fitting for their skillset, major, and career path.`;

  try {
    const systemContent = systemInstruction + '\n' + profileContext;
    const formattedMessages = [
      { role: 'system', content: systemContent },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // Generate response using llama-3.3-70b-versatile
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: formattedMessages as any,
      temperature: 0.7,
    });

    const aiResponseText = response.choices[0]?.message?.content || "I apologize, I encountered an issue generating a response. Could you please rephrase or try again?";

    // Save user message to database
    const userMsg = { role: 'user' as const, text: message, createdAt: new Date().toISOString() };
    const savedUserResult = db.addMessageToConversation(user.id, serviceId, getServiceName(serviceId), conversationId, userMsg);

    // Save AI response to database
    const aiMsg = { role: 'model' as const, text: aiResponseText, createdAt: new Date().toISOString() };
    const savedAiResult = db.addMessageToConversation(user.id, serviceId, getServiceName(serviceId), savedUserResult.conversation.id, aiMsg);

    res.json({
      reply: aiResponseText,
      conversationId: savedUserResult.conversation.id,
      conversation: savedAiResult.conversation
    });

  } catch (error: any) {
    console.error('Groq API Error:', error);
    res.status(500).json({
      error: 'An error occurred during AI processing. Please verify your GROQ_API_KEY in Settings > Secrets.',
      details: error.message
    });
  }
});

function getServiceName(serviceId: string): string {
  const names: Record<string, string> = {
    career_mentor: 'AI Career Mentor',
    learning_roadmap: 'Personalized Learning Roadmap',
    resume_analyzer: 'Resume Analyzer',
    skill_gap: 'Skill Gap Analyzer',
    project_mentor: 'AI Project Mentor',
    internship_recommendation: 'Internship Recommendation',
    hackathon_finder: 'Hackathon Finder',
    course_recommendation: 'Course Recommendation',
    interview_prep: 'Interview Preparation',
    coding_mentor: 'Coding Mentor',
    study_planner: 'AI Study Planner',
    assignment_assistant: 'Assignment Assistant',
    exam_prep: 'Exam Preparation Assistant',
    research_assistant: 'Research Assistant',
    startup_mentor: 'Startup Mentor',
    doubt_solver: 'AI Doubt Solver'
  };
  return names[serviceId] || serviceId;
}

// Start development or production Express app
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mentorix AI server running on port ${PORT}`);
  });
}

startServer();
