import fs from 'fs';
import path from 'path';

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

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  profile: StudentProfile;
  favorites: FavoriteItem[];
  conversations: Conversation[];
  progress: ProgressTracker;
  notifications: NotificationItem[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'mentorix_db.json');

class DatabaseManager {
  private users: Record<string, User> = {};

  constructor() {
    this.initDb();
  }

  private initDb() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');

        if (!fileContent || !fileContent.trim()) {
          // File exists but is empty (e.g. created via `touch`, or a previous
          // write was interrupted). Treat it like a missing file instead of
          // crashing on JSON.parse('').
          this.users = {};
          this.save();
        } else {
          this.users = JSON.parse(fileContent);
        }
      } else {
        this.users = {};
        this.save();
      }
    } catch (error) {
      console.error('Failed to initialize local JSON database:', error);

      // The file exists but contains invalid JSON (e.g. truncated by a crash
      // mid-write). Back it up so the bad data isn't lost, then start fresh
      // so the app doesn't keep failing on every subsequent read.
      try {
        if (fs.existsSync(DB_FILE)) {
          const backupPath = `${DB_FILE}.corrupted-${Date.now()}.bak`;
          fs.copyFileSync(DB_FILE, backupPath);
          console.error(`Backed up corrupted database to ${backupPath}`);
        }
      } catch (backupError) {
        console.error('Failed to back up corrupted database:', backupError);
      }

      this.users = {};
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.users, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save JSON database to disk:', error);
    }
  }

  public getUserByEmail(email: string): User | undefined {
    this.initDb(); // Reload to capture any manual or alternate modifications
    return Object.values(this.users).find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    this.initDb();
    return this.users[id];
  }

  public createUser(email: string, passwordHash: string, fullName: string): User {
    this.initDb();
    const id = 'user_' + Math.random().toString(36).substring(2, 11);
    
    const newUser: User = {
      id,
      email: email.toLowerCase(),
      passwordHash,
      profile: {
        fullName,
        educationLevel: "Bachelor's Degree",
        major: 'Computer Science',
        currentYear: '3rd Year',
        targetCareer: 'Full Stack Developer',
        skills: ['JavaScript', 'HTML/CSS', 'Python'],
        interests: ['Web Development', 'AI/ML'],
        careerGoals: 'Build high-quality web products and secure an internship.',
      },
      favorites: [],
      conversations: [],
      progress: {
        completedServicesCount: 0,
        studyHoursThisWeek: 12,
        completedTasksCount: 4,
        courses: [
          {
            id: 'c1',
            title: 'Modern Web Development with React',
            provider: 'Coursera / freeCodeCamp',
            progress: 60,
            status: 'In Progress',
          },
          {
            id: 'c2',
            title: 'Introduction to Algorithms & Data Structures',
            provider: 'MIT OpenCourseWare',
            progress: 10,
            status: 'In Progress',
          },
          {
            id: 'c3',
            title: 'Advanced Machine Learning Specialization',
            provider: 'DeepLearning.AI',
            progress: 0,
            status: 'Not Started',
          }
        ],
        activeRoadmaps: [],
        streakDays: 3,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      notifications: [
        {
          id: 'n1',
          title: 'Welcome to Mentorix AI!',
          message: 'Explore your customized 16 AI student services on your sidebar to boost your academic and career goals.',
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          title: 'Tip: Get a Learning Roadmap',
          message: 'Go to the "Personalized Learning Roadmap" tool to design your weekly learning schedules tailored to your target skills.',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        }
      ],
    };

    this.users[id] = newUser;
    this.save();
    return newUser;
  }

  public updateUserProfile(userId: string, profile: Partial<StudentProfile>): User {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.profile = { ...user.profile, ...profile };
    this.save();
    return user;
  }

  public getConversations(userId: string): Conversation[] {
    this.initDb();
    return this.users[userId]?.conversations || [];
  }

  public getConversation(userId: string, conversationId: string): Conversation | undefined {
    this.initDb();
    return this.users[userId]?.conversations.find(c => c.id === conversationId);
  }

  public addMessageToConversation(
    userId: string,
    serviceId: string,
    serviceName: string,
    conversationId: string | null,
    message: ChatMessage
  ): { conversation: Conversation; isNew: boolean } {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    let conversation: Conversation | undefined;
    let isNew = false;

    if (conversationId) {
      conversation = user.conversations.find(c => c.id === conversationId);
    }

    if (!conversation) {
      isNew = true;
      const newId = 'conv_' + Math.random().toString(36).substring(2, 11);
      conversation = {
        id: newId,
        serviceId,
        serviceName,
        title: message.text.length > 30 ? message.text.substring(0, 30) + '...' : message.text,
        messages: [],
        updatedAt: new Date().toISOString()
      };
      user.conversations.unshift(conversation);
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    // Increment service counter if they ask something new
    if (message.role === 'user' && isNew) {
      user.progress.completedServicesCount += 1;
      // Add dynamic milestone notification
      user.notifications.unshift({
        id: 'n_' + Math.random().toString(36).substring(2, 9),
        title: `Service Utilized: ${serviceName}`,
        message: `You successfully initiated a consulting session with the ${serviceName}.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return { conversation, isNew };
  }

  public saveFavorite(userId: string, favorite: Omit<FavoriteItem, 'id' | 'createdAt'>): FavoriteItem {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    const newFav: FavoriteItem = {
      ...favorite,
      id: 'fav_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString()
    };

    user.favorites.unshift(newFav);
    this.save();
    return newFav;
  }

  public removeFavorite(userId: string, favoriteId: string): void {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.favorites = user.favorites.filter(f => f.id !== favoriteId);
    this.save();
  }

  public updateProgress(userId: string, update: Partial<ProgressTracker>): ProgressTracker {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.progress = { ...user.progress, ...update };
    this.save();
    return user.progress;
  }

  public updateCourseProgress(userId: string, courseId: string, progress: number, status: CourseProgress['status']): ProgressTracker {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.progress.courses = user.progress.courses.map(c => {
      if (c.id === courseId) {
        return { ...c, progress, status };
      }
      return c;
    });

    if (status === 'Completed') {
      user.progress.completedTasksCount += 1;
      user.notifications.unshift({
        id: 'n_' + Math.random().toString(36).substring(2, 9),
        title: 'Course Completed! 🎉',
        message: `Congratulations on completing "${user.progress.courses.find(c => c.id === courseId)?.title}". Keep up the momentum!`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return user.progress;
  }

  public addActiveRoadmap(userId: string, serviceId: string, title: string, nodes: string[]): ProgressTracker {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    const roadmapNodes: RoadmapNodeProgress[] = nodes.map((n, i) => ({
      nodeId: `node_${i}`,
      title: n,
      status: i === 0 ? 'active' : 'locked'
    }));

    user.progress.activeRoadmaps.push({
      id: 'rm_' + Math.random().toString(36).substring(2, 11),
      serviceId,
      title,
      nodes: roadmapNodes
    });

    this.save();
    return user.progress;
  }

  public updateRoadmapNode(userId: string, roadmapId: string, nodeId: string, status: RoadmapNodeProgress['status']): ProgressTracker {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.progress.activeRoadmaps = user.progress.activeRoadmaps.map(rm => {
      if (rm.id === roadmapId) {
        const updatedNodes = rm.nodes.map(n => {
          if (n.nodeId === nodeId) {
            return { ...n, status };
          }
          return n;
        });

        // If a node was completed, automatically activate the next one if it was locked
        if (status === 'completed') {
          const completedIndex = rm.nodes.findIndex(n => n.nodeId === nodeId);
          if (completedIndex !== -1 && completedIndex + 1 < updatedNodes.length) {
            const nextNode = updatedNodes[completedIndex + 1];
            if (nextNode.status === 'locked') {
              nextNode.status = 'active';
            }
          }
        }

        return { ...rm, nodes: updatedNodes };
      }
      return rm;
    });

    this.save();
    return user.progress;
  }

  public markNotificationRead(userId: string, notificationId: string): NotificationItem[] {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.notifications = user.notifications.map(n => {
      if (n.id === notificationId) {
        return { ...n, read: true };
      }
      return n;
    });

    this.save();
    return user.notifications;
  }

  public markAllNotificationsRead(userId: string): NotificationItem[] {
    this.initDb();
    const user = this.users[userId];
    if (!user) throw new Error('User not found');

    user.notifications = user.notifications.map(n => ({ ...n, read: true }));
    this.save();
    return user.notifications;
  }
}

export const db = new DatabaseManager();
