export interface StudentProfile {
  fullName: string;
  educationLevel: string;
  major: string;
  currentYear: string;
  targetCareer: string;
  skills: string[];
  interests: string[];
  careerGoals: string;
}

export interface FavoriteItem {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface CourseProgress {
  id: string;
  title: string;
  provider: string;
  progress: number; // 0 to 100
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface RoadmapNodeProgress {
  nodeId: string;
  title: string;
  status: 'locked' | 'active' | 'completed';
}

export interface ProgressTracker {
  completedServicesCount: number;
  studyHoursThisWeek: number;
  completedTasksCount: number;
  courses: CourseProgress[];
  activeRoadmaps: {
    id: string;
    serviceId: string;
    title: string;
    nodes: RoadmapNodeProgress[];
  }[];
  streakDays: number;
  lastActiveDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'recommendation';
  read: boolean;
  createdAt: string;
}

export interface UserState {
  id: string;
  email: string;
  profile: StudentProfile;
  progress: ProgressTracker;
  notifications: NotificationItem[];
  favorites: FavoriteItem[];
}

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'career' | 'academic' | 'technical' | 'business';
  placeholder: string;
}
export const SERVICES: ServiceDefinition[] = [
  {
    id: 'career_mentor',
    name: 'AI Career Mentor',
    description: 'Get tailored career advice, target roles, and certifications based on your major.',
    iconName: 'Briefcase',
    category: 'career',
    placeholder: 'Ask about career options for your major, certifications to get, or job search advice...'
  },
  {
    id: 'learning_roadmap',
    name: 'Personalized Learning Roadmap',
    description: 'Build semester-wise, weekly, or topic plans. Milestone tracking enabled.',
    iconName: 'Compass',
    category: 'academic',
    placeholder: 'Generate a step-by-step roadmap to become a Cloud Architect or master React...'
  },
  {
    id: 'resume_analyzer',
    name: 'Resume Analyzer',
    description: 'Analyze resume text for ATS compatibility, fit, and bullet points optimizations.',
    iconName: 'FileText',
    category: 'career',
    placeholder: 'Paste your current resume here and ask for an ATS rating and optimization suggestions...'
  },
  {
    id: 'skill_gap',
    name: 'Skill Gap Analyzer',
    description: 'Pinpoint missing skills for specific roles and explore recommendations.',
    iconName: 'Sliders',
    category: 'technical',
    placeholder: 'Tell us your target job (e.g. Data Analyst) and we will identify your gaps...'
  },
  {
    id: 'project_mentor',
    name: 'AI Project Mentor',
    description: 'Get project suggestions (Mini, Major, and Capstone) with tech stack and guidance.',
    iconName: 'GitBranch',
    category: 'technical',
    placeholder: 'Suggest projects for my Node.js and React skillset with detailed phases...'
  },
  {
    id: 'internship_recommendation',
    name: 'Internship Recommendation',
    description: 'Find roles and cover letter points customized to your degree year.',
    iconName: 'MapPin',
    category: 'career',
    placeholder: 'I am a 3rd year student looking for front-end internships. Give me suggestions...'
  },
  {
    id: 'hackathon_finder',
    name: 'Hackathon & Competitions',
    description: 'Explore competition guidelines, winning strategies, and MVPs scoping.',
    iconName: 'Trophy',
    category: 'technical',
    placeholder: 'Recommend coding contests or hackathon project ideas matching my interests...'
  },
  {
    id: 'course_recommendation',
    name: 'Course Recommendations',
    description: 'Explore books, playlists, courses, and certifications tailored to your targets.',
    iconName: 'BookOpen',
    category: 'academic',
    placeholder: 'What are some top-tier free courses and books to master Machine Learning?'
  },
  {
    id: 'interview_prep',
    name: 'Interview Preparation',
    description: 'Conduct interactive technical, HR, and coding practice sessions.',
    iconName: 'MessageSquareText',
    category: 'career',
    placeholder: 'Prepare me for a junior backend developer interview with 5 sample questions...'
  },
  {
    id: 'coding_mentor',
    name: 'Coding Mentor',
    description: 'Debug errors, rewrite code snippets, and learn programming concepts.',
    iconName: 'CodeXml',
    category: 'technical',
    placeholder: 'Explain why my SQL query is slow, or review my React useEffect script...'
  },
  {
    id: 'study_planner',
    name: 'AI Study Planner',
    description: 'Generate study timetables, revision plans, and productivity tips.',
    iconName: 'CalendarRange',
    category: 'academic',
    placeholder: 'Design a 4-week study planner for my upcoming University computer network exams...'
  },
  {
    id: 'assignment_assistant',
    name: 'Assignment Assistant',
    description: 'Clarify homework guidelines and outline structures without plagiarism.',
    iconName: 'FileQuestion',
    category: 'academic',
    placeholder: 'Help me outline my database normalization assignment and suggest reference structures...'
  },
  {
    id: 'exam_prep',
    name: 'Exam Prep Assistant',
    description: 'Review summaries, draft high-yield questions, and outline revision keys.',
    iconName: 'GraduationCap',
    category: 'academic',
    placeholder: 'Create a revision guide and mock exam questions for Data Structures...'
  },
  {
    id: 'research_assistant',
    name: 'Research Assistant',
    description: 'Summarize topics, explore scientific directions, and layout abstract formats.',
    iconName: 'SearchCode',
    category: 'academic',
    placeholder: 'Draft an outline and explain the research directions for Generative Adversarial Networks...'
  },
  {
    id: 'startup_mentor',
    name: 'Startup Mentor',
    description: 'Get product/market fit advice, Business Model Canvas, and pitch blueprints.',
    iconName: 'Rocket',
    category: 'business',
    placeholder: 'Validate my idea of an AI-powered automated student textbook exchanger...'
  },
  {
    id: 'doubt_solver',
    name: 'AI Doubt Solver',
    description: 'Solve technical queries with clear step-by-step analogies.',
    iconName: 'Lightbulb',
    category: 'technical',
    placeholder: 'Explain the difference between TCP and UDP with simple analogies and examples...'
  }
];
