import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createInitialSeedData } from '../data';
import type {
  AppNotification,
  AppSettings,
  AppState,
  CampusEvent,
  CampusLocation,
  CommunityTopic,
  Course,
  CourseChecklistItem,
  CourseNote,
  CourseResource,
  DashboardWidgetId,
  DemoSimulationState,
  ExpenseCategory,
  ExpenseEntry,
  Flashcard,
  FlashcardMastery,
  GroupSession,
  HandbookArticle,
  LifeChecklistCategory,
  ModerationTargetType,
  MoodLevel,
  NotificationPreferences,
  PrivacySettings,
  ScheduleEvent,
  StudentProfile,
  TaskItem,
  TaskStatus,
  UserRole,
} from '../types/models';

export const STORAGE_KEY = 'unibuddy_v1_state';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function loadInitialState(): AppState {
  if (typeof window === 'undefined') {
    return createInitialSeedData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSeedData();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || parsed.version !== 1 || !parsed.profile) {
      return createInitialSeedData();
    }
    const fallback = createInitialSeedData();
    return {
      ...fallback,
      ...parsed,
      profile: {
        ...fallback.profile,
        ...parsed.profile,
        privacy: {
          ...fallback.profile.privacy,
          ...(parsed.profile.privacy ?? {}),
        },
      },
      settings: {
        ...fallback.settings,
        ...(parsed.settings ?? {}),
        notifications: {
          ...fallback.settings.notifications,
          ...(parsed.settings?.notifications ?? {}),
        },
      },
      simulation: {
        networkError: Boolean(parsed.simulation?.networkError),
        sessionExpired: Boolean(parsed.simulation?.sessionExpired),
        loadingFeature: null,
        isOffline: Boolean(parsed.simulation?.isOffline),
      },
    };
  } catch {
    return createInitialSeedData();
  }
}

export interface AppStoreContextValue {
  state: AppState;
  unreadNotificationCount: number;
  // Auth & Profile
  signIn: (payload?: { name?: string; email?: string; role?: UserRole }) => void;
  signOut: () => void;
  completeOnboarding: (updates: Partial<StudentProfile>) => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  updatePrivacy: (updates: Partial<PrivacySettings>) => void;
  switchRole: (role: UserRole) => void;
  // Schedule
  addScheduleEvent: (event: Omit<ScheduleEvent, 'id'>) => ScheduleEvent;
  updateScheduleEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteScheduleEvent: (id: string) => void;
  importScheduleEvents: (
    events: Omit<ScheduleEvent, 'id'>[],
  ) => { added: number; skipped: number };
  // Tasks & Subtasks
  addTask: (
    task: Omit<TaskItem, 'id' | 'createdAt' | 'status'> & {
      status?: TaskStatus;
    },
  ) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  toggleTaskStatus: (id: string) => void;
  archiveTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  // Courses & Study items
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addCourseNote: (note: Omit<CourseNote, 'id' | 'updatedAt'>) => void;
  updateCourseNote: (id: string, updates: Partial<CourseNote>) => void;
  deleteCourseNote: (id: string) => void;
  addCourseChecklistItem: (item: Omit<CourseChecklistItem, 'id'>) => void;
  toggleCourseChecklistItem: (id: string) => void;
  deleteCourseChecklistItem: (id: string) => void;
  addFlashcard: (card: Omit<Flashcard, 'id'>) => void;
  updateFlashcardMastery: (id: string, mastery: FlashcardMastery) => void;
  deleteFlashcard: (id: string) => void;
  addCourseResource: (
    resource: Omit<CourseResource, 'id' | 'addedAt'>,
  ) => void;
  deleteCourseResource: (id: string) => void;
  // Handbook
  toggleHandbookBookmark: (articleId: string) => void;
  voteHandbookArticle: (articleId: string, vote: 'yes' | 'no') => void;
  upsertHandbookArticle: (
    article: Omit<
      HandbookArticle,
      'id' | 'helpfulYes' | 'helpfulNo' | 'updatedAt'
    > & { id?: string },
  ) => void;
  deleteHandbookArticle: (articleId: string) => void;
  // Campus, Clubs & Events
  toggleJoinClub: (clubId: string) => void;
  toggleRegisterEvent: (eventId: string) => void;
  addEventToSchedule: (eventId: string) => boolean;
  upsertCampusEvent: (
    event: Omit<CampusEvent, 'id'> & { id?: string },
  ) => void;
  upsertCampusLocation: (
    location: Omit<CampusLocation, 'id'> & { id?: string },
  ) => void;
  deleteCampusLocation: (locationId: string) => void;
  // Community Q&A, Study Groups & Moderation
  addQuestion: (input: {
    title: string;
    content: string;
    topic: CommunityTopic;
    tags: string[];
  }) => void;
  toggleUpvoteQuestion: (questionId: string) => void;
  toggleResolveQuestion: (questionId: string) => void;
  addAnswer: (questionId: string, content: string) => void;
  toggleUpvoteAnswer: (questionId: string, answerId: string) => void;
  toggleAcceptAnswer: (questionId: string, answerId: string) => void;
  toggleJoinStudyGroup: (groupId: string) => void;
  createStudyGroup: (input: {
    name: string;
    courseCode?: string;
    courseName?: string;
    topic: string;
    description: string;
    scheduleNote: string;
    locationNote: string;
    maxMembers: number;
  }) => void;
  addStudyGroupSession: (
    groupId: string,
    session: Omit<GroupSession, 'id' | 'groupId'>,
  ) => void;
  addGroupSessionToSchedule: (groupId: string, sessionId: string) => boolean;
  submitModerationReport: (input: {
    targetType: ModerationTargetType;
    targetId: string;
    parentId?: string;
    targetPreview: string;
    reason: string;
  }) => void;
  resolveModerationReport: (
    reportId: string,
    decision: 'hide' | 'dismiss',
    resolutionNote?: string,
  ) => void;
  // Life, Budget, Wellness & Support
  addExpense: (entry: Omit<ExpenseEntry, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateBudgetLimit: (category: ExpenseCategory, monthlyLimit: number) => void;
  toggleLifeChecklistItem: (id: string) => void;
  addLifeChecklistItem: (input: {
    title: string;
    category: LifeChecklistCategory;
    description: string;
    tip?: string;
  }) => void;
  addMoodCheckIn: (input: {
    mood: MoodLevel;
    energy: MoodLevel;
    tags: string[];
    note: string;
  }) => void;
  deleteMoodCheckIn: (id: string) => void;
  bookSupportAppointment: (input: {
    centerId: string;
    centerName: string;
    date: string;
    timeSlot: string;
    mode: 'in_person' | 'online';
    topic: string;
    note?: string;
  }) => void;
  cancelSupportAppointment: (id: string) => void;
  // Notifications & Search
  markNotificationRead: (id: string, read?: boolean) => void;
  markAllNotificationsRead: () => void;
  addNotification: (
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>,
  ) => void;
  deleteNotification: (id: string) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  // Settings, Focus, Simulation, Data Portability
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotificationPrefs: (updates: Partial<NotificationPreferences>) => void;
  toggleDashboardWidget: (widgetId: DashboardWidgetId) => void;
  startFocusMode: (minutes: number) => void;
  stopFocusMode: () => void;
  setSimulation: (updates: Partial<DemoSimulationState>) => void;
  exportStateJSON: () => string;
  importStateJSON: (jsonText: string) => { ok: boolean; error?: string };
  resetDemoData: () => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function AppStoreProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: AppState;
}) {
  const [state, setState] = useState<AppState>(
    () => initialState ?? loadInitialState(),
  );

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota / private mode failures cleanly
    }
  }, [state]);

  // Sync theme and reduced motion to <html>
  useEffect(() => {
    const root = document.documentElement;
    const darkMq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const motionMq = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const applyClasses = () => {
      const useDark =
        state.settings.theme === 'dark' ||
        (state.settings.theme === 'system' && Boolean(darkMq?.matches));
      root.classList.toggle('dark', useDark);

      const useReduced =
        state.settings.reduceMotion === 'reduce' ||
        (state.settings.reduceMotion === 'system' &&
          Boolean(motionMq?.matches));
      root.classList.toggle('reduce-motion', useReduced);
    };

    applyClasses();
    darkMq?.addEventListener?.('change', applyClasses);
    motionMq?.addEventListener?.('change', applyClasses);

    return () => {
      darkMq?.removeEventListener?.('change', applyClasses);
      motionMq?.removeEventListener?.('change', applyClasses);
    };
  }, [state.settings.theme, state.settings.reduceMotion]);

  const appendAuditLog = useCallback(
    (
      prev: AppState,
      action: string,
      targetLabel: string,
      details?: string,
    ) => [
      {
        id: makeId('audit'),
        actorName: prev.profile.name,
        actorRole: prev.profile.role,
        action,
        targetLabel,
        createdAt: new Date().toISOString(),
        details,
      },
      ...prev.auditLogs.slice(0, 49),
    ],
    [],
  );

  // Auth & Profile
  const signIn = useCallback(
    (payload?: { name?: string; email?: string; role?: UserRole }) => {
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        profile: {
          ...prev.profile,
          name: payload?.name?.trim() || prev.profile.name,
          email: payload?.email?.trim() || prev.profile.email,
          role: payload?.role ?? prev.profile.role,
        },
        simulation: {
          ...prev.simulation,
          sessionExpired: false,
        },
      }));
    },
    [],
  );

  const signOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
  }, []);

  const completeOnboarding = useCallback((updates: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      profile: {
        ...prev.profile,
        ...updates,
        onboardingCompleted: true,
      },
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
      },
    }));
  }, []);

  const updatePrivacy = useCallback((updates: Partial<PrivacySettings>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        privacy: {
          ...prev.profile.privacy,
          ...updates,
        },
      },
    }));
  }, []);

  const switchRole = useCallback(
    (role: UserRole) => {
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          role,
        },
        auditLogs: appendAuditLog(
          prev,
          'Chuyển vai trò minh họa',
          role,
          `Từ ${prev.profile.role} sang ${role}`,
        ),
      }));
    },
    [appendAuditLog],
  );

  // Schedule
  const addScheduleEvent = useCallback(
    (event: Omit<ScheduleEvent, 'id'>): ScheduleEvent => {
      const created: ScheduleEvent = { ...event, id: makeId('sched') };
      setState((prev) => ({
        ...prev,
        scheduleEvents: [...prev.scheduleEvents, created],
      }));
      return created;
    },
    [],
  );

  const updateScheduleEvent = useCallback(
    (id: string, updates: Partial<ScheduleEvent>) => {
      setState((prev) => ({
        ...prev,
        scheduleEvents: prev.scheduleEvents.map((ev) =>
          ev.id === id ? { ...ev, ...updates } : ev,
        ),
      }));
    },
    [],
  );

  const deleteScheduleEvent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      scheduleEvents: prev.scheduleEvents.filter((ev) => ev.id !== id),
    }));
  }, []);

  const importScheduleEvents = useCallback(
    (events: Omit<ScheduleEvent, 'id'>[]) => {
      let added = 0;
      let skipped = 0;

      setState((prev) => {
        const existingKeys = new Set(
          prev.scheduleEvents.map(
            (e) => `${e.title}|${e.date}|${e.startTime}|${e.endTime}`,
          ),
        );
        const toInsert: ScheduleEvent[] = [];

        for (const item of events) {
          const sig = `${item.title}|${item.date}|${item.startTime}|${item.endTime}`;
          if (existingKeys.has(sig)) {
            skipped += 1;
            continue;
          }
          existingKeys.add(sig);
          added += 1;
          toInsert.push({ ...item, id: makeId('ics') });
        }

        return {
          ...prev,
          scheduleEvents: [...prev.scheduleEvents, ...toInsert],
        };
      });

      return { added, skipped };
    },
    [],
  );

  // Tasks & Subtasks
  const addTask = useCallback(
    (
      task: Omit<TaskItem, 'id' | 'createdAt' | 'status'> & {
        status?: TaskStatus;
      },
    ): TaskItem => {
      const created: TaskItem = {
        ...task,
        id: makeId('task'),
        status: task.status ?? 'todo',
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        tasks: [created, ...prev.tasks],
      }));
      return created;
    },
    [],
  );

  const updateTask = useCallback((id: string, updates: Partial<TaskItem>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
        return {
          ...t,
          status: nextStatus,
          completedAt:
            nextStatus === 'done' ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, []);

  const archiveTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, status: 'archived' } : t,
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, done: !st.done } : st,
              ),
            }
          : t,
      ),
    }));
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: makeId('sub'), title: trimmed, done: false },
              ],
            }
          : t,
      ),
    }));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
            }
          : t,
      ),
    }));
  }, []);

  // Courses & Study
  const addCourse = useCallback((course: Omit<Course, 'id'>): Course => {
    const created: Course = { ...course, id: makeId('course') };
    setState((prev) => ({
      ...prev,
      courses: [...prev.courses, created],
    }));
    return created;
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
      courseNotes: prev.courseNotes.filter((n) => n.courseId !== id),
      courseChecklists: prev.courseChecklists.filter((i) => i.courseId !== id),
      flashcards: prev.flashcards.filter((f) => f.courseId !== id),
      courseResources: prev.courseResources.filter((r) => r.courseId !== id),
    }));
  }, []);

  const addCourseNote = useCallback(
    (note: Omit<CourseNote, 'id' | 'updatedAt'>) => {
      const created: CourseNote = {
        ...note,
        id: makeId('note'),
        updatedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        courseNotes: [created, ...prev.courseNotes],
      }));
    },
    [],
  );

  const updateCourseNote = useCallback(
    (id: string, updates: Partial<CourseNote>) => {
      setState((prev) => ({
        ...prev,
        courseNotes: prev.courseNotes.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n,
        ),
      }));
    },
    [],
  );

  const deleteCourseNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courseNotes: prev.courseNotes.filter((n) => n.id !== id),
    }));
  }, []);

  const addCourseChecklistItem = useCallback(
    (item: Omit<CourseChecklistItem, 'id'>) => {
      setState((prev) => ({
        ...prev,
        courseChecklists: [
          ...prev.courseChecklists,
          { ...item, id: makeId('chk') },
        ],
      }));
    },
    [],
  );

  const toggleCourseChecklistItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courseChecklists: prev.courseChecklists.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }, []);

  const deleteCourseChecklistItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courseChecklists: prev.courseChecklists.filter((item) => item.id !== id),
    }));
  }, []);

  const addFlashcard = useCallback((card: Omit<Flashcard, 'id'>) => {
    setState((prev) => ({
      ...prev,
      flashcards: [...prev.flashcards, { ...card, id: makeId('fc') }],
    }));
  }, []);

  const updateFlashcardMastery = useCallback(
    (id: string, mastery: FlashcardMastery) => {
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((f) =>
          f.id === id
            ? { ...f, mastery, lastReviewedAt: new Date().toISOString() }
            : f,
        ),
      }));
    },
    [],
  );

  const deleteFlashcard = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      flashcards: prev.flashcards.filter((f) => f.id !== id),
    }));
  }, []);

  const addCourseResource = useCallback(
    (resource: Omit<CourseResource, 'id' | 'addedAt'>) => {
      setState((prev) => ({
        ...prev,
        courseResources: [
          {
            ...resource,
            id: makeId('res'),
            addedAt: new Date().toISOString(),
          },
          ...prev.courseResources,
        ],
      }));
    },
    [],
  );

  const deleteCourseResource = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courseResources: prev.courseResources.filter((r) => r.id !== id),
    }));
  }, []);

  // Handbook
  const toggleHandbookBookmark = useCallback((articleId: string) => {
    setState((prev) => ({
      ...prev,
      handbookArticles: prev.handbookArticles.map((art) =>
        art.id === articleId ? { ...art, bookmarked: !art.bookmarked } : art,
      ),
    }));
  }, []);

  const voteHandbookArticle = useCallback(
    (articleId: string, vote: 'yes' | 'no') => {
      setState((prev) => ({
        ...prev,
        handbookArticles: prev.handbookArticles.map((art) => {
          if (art.id !== articleId) return art;
          let helpfulYes = art.helpfulYes;
          let helpfulNo = art.helpfulNo;

          if (art.userVote === 'yes') helpfulYes = Math.max(0, helpfulYes - 1);
          if (art.userVote === 'no') helpfulNo = Math.max(0, helpfulNo - 1);

          const nextVote = art.userVote === vote ? undefined : vote;
          if (nextVote === 'yes') helpfulYes += 1;
          if (nextVote === 'no') helpfulNo += 1;

          return { ...art, helpfulYes, helpfulNo, userVote: nextVote };
        }),
      }));
    },
    [],
  );

  const upsertHandbookArticle = useCallback(
    (
      article: Omit<
        HandbookArticle,
        'id' | 'helpfulYes' | 'helpfulNo' | 'updatedAt'
      > & { id?: string },
    ) => {
      setState((prev) => {
        const now = new Date().toISOString().slice(0, 10);
        if (article.id) {
          return {
            ...prev,
            handbookArticles: prev.handbookArticles.map((item) =>
              item.id === article.id
                ? { ...item, ...article, id: item.id, updatedAt: now }
                : item,
            ),
            auditLogs: appendAuditLog(
              prev,
              'Cập nhật bài sổ tay',
              article.title,
            ),
          };
        }

        const created: HandbookArticle = {
          ...article,
          id: makeId('hb'),
          helpfulYes: 0,
          helpfulNo: 0,
          updatedAt: now,
        };
        return {
          ...prev,
          handbookArticles: [created, ...prev.handbookArticles],
          auditLogs: appendAuditLog(prev, 'Tạo bài sổ tay mới', article.title),
        };
      });
    },
    [appendAuditLog],
  );

  const deleteHandbookArticle = useCallback(
    (articleId: string) => {
      setState((prev) => {
        const target = prev.handbookArticles.find((a) => a.id === articleId);
        return {
          ...prev,
          handbookArticles: prev.handbookArticles.filter(
            (a) => a.id !== articleId,
          ),
          auditLogs: appendAuditLog(
            prev,
            'Xóa bài sổ tay',
            target?.title ?? articleId,
          ),
        };
      });
    },
    [appendAuditLog],
  );

  // Clubs, Events & Campus
  const toggleJoinClub = useCallback((clubId: string) => {
    setState((prev) => ({
      ...prev,
      clubs: prev.clubs.map((club) => {
        if (club.id !== clubId) return club;
        const nextJoined = !club.joined;
        return {
          ...club,
          joined: nextJoined,
          memberCount: Math.max(0, club.memberCount + (nextJoined ? 1 : -1)),
        };
      }),
    }));
  }, []);

  const toggleRegisterEvent = useCallback((eventId: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((ev) => {
        if (ev.id !== eventId || ev.status === 'cancelled') return ev;
        const nextReg = !ev.registered;
        if (nextReg && ev.registeredCount >= ev.capacity) return ev;
        return {
          ...ev,
          registered: nextReg,
          registeredCount: Math.max(
            0,
            Math.min(ev.capacity, ev.registeredCount + (nextReg ? 1 : -1)),
          ),
        };
      }),
    }));
  }, []);

  const addEventToSchedule = useCallback((eventId: string): boolean => {
    let added = false;
    setState((prev) => {
      const target = prev.events.find((e) => e.id === eventId);
      if (!target || target.status === 'cancelled') return prev;
      const alreadyLinked = prev.scheduleEvents.some(
        (s) => s.linkedEventId === eventId,
      );
      if (alreadyLinked) {
        return {
          ...prev,
          events: prev.events.map((e) =>
            e.id === eventId ? { ...e, addedToCalendar: true } : e,
          ),
        };
      }
      added = true;
      const scheduleItem: ScheduleEvent = {
        id: makeId('sched-ev'),
        title: target.title,
        category: 'event',
        date: target.date,
        startTime: target.startTime,
        endTime: target.endTime,
        location: target.location,
        note: `Đơn vị tổ chức: ${target.organizer}`,
        recurrence: 'none',
        source: 'club',
        linkedEventId: eventId,
      };
      return {
        ...prev,
        scheduleEvents: [...prev.scheduleEvents, scheduleItem],
        events: prev.events.map((e) =>
          e.id === eventId ? { ...e, addedToCalendar: true } : e,
        ),
      };
    });
    return added;
  }, []);

  const upsertCampusEvent = useCallback(
    (event: Omit<CampusEvent, 'id'> & { id?: string }) => {
      setState((prev) => {
        if (event.id) {
          return {
            ...prev,
            events: prev.events.map((item) =>
              item.id === event.id ? { ...item, ...event, id: item.id } : item,
            ),
            auditLogs: appendAuditLog(prev, 'Cập nhật sự kiện', event.title),
          };
        }
        const created: CampusEvent = { ...event, id: makeId('ev') };
        return {
          ...prev,
          events: [created, ...prev.events],
          auditLogs: appendAuditLog(prev, 'Tạo sự kiện mới', event.title),
        };
      });
    },
    [appendAuditLog],
  );

  const upsertCampusLocation = useCallback(
    (location: Omit<CampusLocation, 'id'> & { id?: string }) => {
      setState((prev) => {
        if (location.id) {
          return {
            ...prev,
            campusLocations: prev.campusLocations.map((loc) =>
              loc.id === location.id
                ? { ...loc, ...location, id: loc.id }
                : loc,
            ),
            auditLogs: appendAuditLog(
              prev,
              'Cập nhật điểm bản đồ',
              location.name,
            ),
          };
        }
        const created: CampusLocation = { ...location, id: makeId('loc') };
        return {
          ...prev,
          campusLocations: [...prev.campusLocations, created],
          auditLogs: appendAuditLog(
            prev,
            'Thêm điểm bản đồ mới',
            location.name,
          ),
        };
      });
    },
    [appendAuditLog],
  );

  const deleteCampusLocation = useCallback(
    (locationId: string) => {
      setState((prev) => {
        const target = prev.campusLocations.find((l) => l.id === locationId);
        return {
          ...prev,
          campusLocations: prev.campusLocations.filter(
            (l) => l.id !== locationId,
          ),
          auditLogs: appendAuditLog(
            prev,
            'Xóa điểm bản đồ',
            target?.name ?? locationId,
          ),
        };
      });
    },
    [appendAuditLog],
  );

  // Community Q&A, Study Groups & Moderation
  const addQuestion = useCallback(
    (input: {
      title: string;
      content: string;
      topic: CommunityTopic;
      tags: string[];
    }) => {
      setState((prev) => ({
        ...prev,
        questions: [
          {
            id: makeId('q'),
            title: input.title.trim(),
            content: input.content.trim(),
            topic: input.topic,
            authorName: prev.profile.name,
            authorCohort: prev.profile.cohort,
            createdAt: new Date().toISOString(),
            tags: input.tags,
            votes: 1,
            userUpvoted: true,
            resolved: false,
            answers: [],
          },
          ...prev.questions,
        ],
      }));
    },
    [],
  );

  const toggleUpvoteQuestion = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const next = !q.userUpvoted;
        return {
          ...q,
          userUpvoted: next,
          votes: Math.max(0, q.votes + (next ? 1 : -1)),
        };
      }),
    }));
  }, []);

  const toggleResolveQuestion = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, resolved: !q.resolved } : q,
      ),
    }));
  }, []);

  const addAnswer = useCallback((questionId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: [
            ...q.answers,
            {
              id: makeId('ans'),
              questionId,
              authorName: prev.profile.name,
              authorRoleLabel: `${prev.profile.cohort} • ${prev.profile.major}`,
              content: trimmed,
              createdAt: new Date().toISOString(),
              votes: 0,
            },
          ],
        };
      }),
    }));
  }, []);

  const toggleUpvoteAnswer = useCallback(
    (questionId: string, answerId: string) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answers: q.answers.map((ans) => {
                  if (ans.id !== answerId) return ans;
                  const next = !ans.userUpvoted;
                  return {
                    ...ans,
                    userUpvoted: next,
                    votes: Math.max(0, ans.votes + (next ? 1 : -1)),
                  };
                }),
              }
            : q,
        ),
      }));
    },
    [],
  );

  const toggleAcceptAnswer = useCallback(
    (questionId: string, answerId: string) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                resolved: true,
                answers: q.answers.map((ans) => ({
                  ...ans,
                  isHelpfulAccepted:
                    ans.id === answerId ? !ans.isHelpfulAccepted : false,
                })),
              }
            : q,
        ),
      }));
    },
    [],
  );

  const toggleJoinStudyGroup = useCallback((groupId: string) => {
    setState((prev) => ({
      ...prev,
      studyGroups: prev.studyGroups.map((g) => {
        if (g.id !== groupId) return g;
        const nextJoined = !g.joined;
        if (nextJoined && g.memberCount >= g.maxMembers) return g;
        return {
          ...g,
          joined: nextJoined,
          memberCount: Math.max(
            0,
            Math.min(g.maxMembers, g.memberCount + (nextJoined ? 1 : -1)),
          ),
          members: nextJoined
            ? Array.from(new Set([...g.members, prev.profile.name]))
            : g.members.filter((m) => m !== prev.profile.name),
        };
      }),
    }));
  }, []);

  const createStudyGroup = useCallback(
    (input: {
      name: string;
      courseCode?: string;
      courseName?: string;
      topic: string;
      description: string;
      scheduleNote: string;
      locationNote: string;
      maxMembers: number;
    }) => {
      setState((prev) => ({
        ...prev,
        studyGroups: [
          {
            id: makeId('grp'),
            name: input.name.trim(),
            courseCode: input.courseCode?.trim() || undefined,
            courseName: input.courseName?.trim() || undefined,
            topic: input.topic.trim(),
            description: input.description.trim(),
            scheduleNote: input.scheduleNote.trim(),
            locationNote: input.locationNote.trim(),
            memberCount: 1,
            maxMembers: Math.max(2, input.maxMembers),
            joined: true,
            members: [prev.profile.name],
            sessions: [],
          },
          ...prev.studyGroups,
        ],
      }));
    },
    [],
  );

  const addStudyGroupSession = useCallback(
    (groupId: string, session: Omit<GroupSession, 'id' | 'groupId'>) => {
      setState((prev) => ({
        ...prev,
        studyGroups: prev.studyGroups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                sessions: [
                  ...g.sessions,
                  { ...session, id: makeId('gses'), groupId },
                ],
              }
            : g,
        ),
      }));
    },
    [],
  );

  const addGroupSessionToSchedule = useCallback(
    (groupId: string, sessionId: string): boolean => {
      let added = false;
      setState((prev) => {
        const grp = prev.studyGroups.find((g) => g.id === groupId);
        const sess = grp?.sessions.find((s) => s.id === sessionId);
        if (!grp || !sess) return prev;

        const linkedKey = `${groupId}:${sessionId}`;
        if (prev.scheduleEvents.some((e) => e.linkedEventId === linkedKey)) {
          return prev;
        }
        added = true;
        return {
          ...prev,
          scheduleEvents: [
            ...prev.scheduleEvents,
            {
              id: makeId('sched-grp'),
              title: `[Nhóm học] ${sess.title}`,
              category: 'personal',
              date: sess.date,
              startTime: sess.startTime,
              endTime: sess.endTime,
              location: sess.locationOrLink,
              note: `${grp.name} — ${sess.agenda}`,
              recurrence: 'none',
              source: 'personal',
              linkedEventId: linkedKey,
            },
          ],
          studyGroups: prev.studyGroups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  sessions: g.sessions.map((s) =>
                    s.id === sessionId ? { ...s, addedToCalendar: true } : s,
                  ),
                }
              : g,
          ),
        };
      });
      return added;
    },
    [],
  );

  const submitModerationReport = useCallback(
    (input: {
      targetType: ModerationTargetType;
      targetId: string;
      parentId?: string;
      targetPreview: string;
      reason: string;
    }) => {
      setState((prev) => ({
        ...prev,
        moderationReports: [
          {
            id: makeId('rep'),
            targetType: input.targetType,
            targetId: input.targetId,
            parentId: input.parentId,
            targetPreview: input.targetPreview,
            reason: input.reason.trim(),
            reportedBy: prev.profile.name,
            createdAt: new Date().toISOString(),
            status: 'pending',
          },
          ...prev.moderationReports,
        ],
      }));
    },
    [],
  );

  const resolveModerationReport = useCallback(
    (
      reportId: string,
      decision: 'hide' | 'dismiss',
      resolutionNote?: string,
    ) => {
      setState((prev) => {
        const targetReport = prev.moderationReports.find(
          (r) => r.id === reportId,
        );
        if (!targetReport) return prev;

        const nextQuestions =
          decision === 'hide'
            ? prev.questions.map((q) => {
                if (
                  targetReport.targetType === 'question' &&
                  q.id === targetReport.targetId
                ) {
                  return { ...q, isHidden: true };
                }
                if (
                  targetReport.targetType === 'answer' &&
                  q.id === targetReport.parentId
                ) {
                  return {
                    ...q,
                    answers: q.answers.map((a) =>
                      a.id === targetReport.targetId
                        ? { ...a, isHidden: true }
                        : a,
                    ),
                  };
                }
                return q;
              })
            : prev.questions;

        return {
          ...prev,
          questions: nextQuestions,
          moderationReports: prev.moderationReports.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status:
                    decision === 'hide' ? 'resolved_hidden' : 'dismissed',
                  resolutionNote,
                }
              : r,
          ),
          auditLogs: appendAuditLog(
            prev,
            decision === 'hide'
              ? 'Ẩn nội dung theo báo cáo'
              : 'Bỏ qua báo cáo kiểm duyệt',
            targetReport.targetPreview,
            resolutionNote,
          ),
        };
      });
    },
    [appendAuditLog],
  );

  // Life, Budget, Wellness & Support
  const addExpense = useCallback((entry: Omit<ExpenseEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      expenses: [{ ...entry, id: makeId('exp') }, ...prev.expenses],
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const updateBudgetLimit = useCallback(
    (category: ExpenseCategory, monthlyLimit: number) => {
      setState((prev) => {
        const exists = prev.budgetLimits.some((b) => b.category === category);
        return {
          ...prev,
          budgetLimits: exists
            ? prev.budgetLimits.map((b) =>
                b.category === category ? { ...b, monthlyLimit } : b,
              )
            : [...prev.budgetLimits, { category, monthlyLimit }],
        };
      });
    },
    [],
  );

  const toggleLifeChecklistItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      lifeChecklist: prev.lifeChecklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }, []);

  const addLifeChecklistItem = useCallback(
    (input: {
      title: string;
      category: LifeChecklistCategory;
      description: string;
      tip?: string;
    }) => {
      setState((prev) => ({
        ...prev,
        lifeChecklist: [
          ...prev.lifeChecklist,
          {
            id: makeId('lchk'),
            title: input.title.trim(),
            category: input.category,
            description: input.description.trim(),
            tip: input.tip?.trim() || undefined,
            completed: false,
          },
        ],
      }));
    },
    [],
  );

  const addMoodCheckIn = useCallback(
    (input: {
      mood: MoodLevel;
      energy: MoodLevel;
      tags: string[];
      note: string;
    }) => {
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(now.getDate()).padStart(2, '0')}`;
      setState((prev) => ({
        ...prev,
        moodCheckIns: [
          {
            id: makeId('mood'),
            date,
            createdAt: now.toISOString(),
            mood: input.mood,
            energy: input.energy,
            tags: input.tags,
            note: input.note.trim(),
            isPrivate: true,
          },
          ...prev.moodCheckIns,
        ],
      }));
    },
    [],
  );

  const deleteMoodCheckIn = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      moodCheckIns: prev.moodCheckIns.filter((m) => m.id !== id),
    }));
  }, []);

  const bookSupportAppointment = useCallback(
    (input: {
      centerId: string;
      centerName: string;
      date: string;
      timeSlot: string;
      mode: 'in_person' | 'online';
      topic: string;
      note?: string;
    }) => {
      setState((prev) => ({
        ...prev,
        supportAppointments: [
          {
            id: makeId('appt'),
            ...input,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            isPrivate: true,
          },
          ...prev.supportAppointments,
        ],
      }));
    },
    [],
  );

  const cancelSupportAppointment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      supportAppointments: prev.supportAppointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' } : a,
      ),
    }));
  }, []);

  // Notifications & Search
  const markNotificationRead = useCallback((id: string, read = true) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      setState((prev) => ({
        ...prev,
        notifications: [
          {
            ...notification,
            id: makeId('notif'),
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev.notifications,
        ],
      }));
    },
    [],
  );

  const deleteNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setState((prev) => ({
      ...prev,
      recentSearches: [
        clean,
        ...prev.recentSearches.filter(
          (item) => item.toLowerCase() !== clean.toLowerCase(),
        ),
      ].slice(0, 8),
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState((prev) => ({
      ...prev,
      recentSearches: [],
    }));
  }, []);

  // Settings, Focus, Simulation, Import/Export
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));
  }, []);

  const updateNotificationPrefs = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          notifications: {
            ...prev.settings.notifications,
            ...updates,
          },
        },
      }));
    },
    [],
  );

  const toggleDashboardWidget = useCallback((widgetId: DashboardWidgetId) => {
    setState((prev) => {
      const current = prev.settings.dashboardWidgets;
      const exists = current.includes(widgetId);
      const next = exists
        ? current.filter((w) => w !== widgetId)
        : [...current, widgetId];
      return {
        ...prev,
        settings: {
          ...prev.settings,
          dashboardWidgets: next,
        },
      };
    });
  }, []);

  const startFocusMode = useCallback((minutes: number) => {
    const until = new Date(Date.now() + Math.max(5, minutes) * 60000);
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        focusModeUntil: until.toISOString(),
      },
    }));
  }, []);

  const stopFocusMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        focusModeUntil: null,
      },
    }));
  }, []);

  const setSimulation = useCallback((updates: Partial<DemoSimulationState>) => {
    setState((prev) => ({
      ...prev,
      simulation: {
        ...prev.simulation,
        ...updates,
      },
    }));
  }, []);

  const exportStateJSON = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importStateJSON = useCallback(
    (jsonText: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonText) as Partial<AppState>;
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          parsed.version !== 1 ||
          !parsed.profile ||
          !Array.isArray(parsed.courses) ||
          !Array.isArray(parsed.tasks) ||
          !Array.isArray(parsed.scheduleEvents)
        ) {
          return {
            ok: false,
            error:
              'Tệp JSON không đúng cấu trúc sao lưu của UniBuddy (thiếu profile, courses, tasks hoặc scheduleEvents).',
          };
        }

        const fallback = createInitialSeedData();
        setState({
          ...fallback,
          ...parsed,
          profile: {
            ...fallback.profile,
            ...parsed.profile,
            privacy: {
              ...fallback.profile.privacy,
              ...(parsed.profile.privacy ?? {}),
            },
          },
          settings: {
            ...fallback.settings,
            ...(parsed.settings ?? {}),
            notifications: {
              ...fallback.settings.notifications,
              ...(parsed.settings?.notifications ?? {}),
            },
          },
          simulation: {
            networkError: false,
            sessionExpired: false,
            loadingFeature: null,
            isOffline: false,
          },
        });
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: 'Không thể đọc tệp JSON. Vui lòng kiểm tra cú pháp tệp.',
        };
      }
    },
    [],
  );

  const resetDemoData = useCallback(() => {
    const fresh = createInitialSeedData();
    setState(fresh);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  }, []);

  const unreadNotificationCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  const value = useMemo<AppStoreContextValue>(
    () => ({
      state,
      unreadNotificationCount,
      signIn,
      signOut,
      completeOnboarding,
      updateProfile,
      updatePrivacy,
      switchRole,
      addScheduleEvent,
      updateScheduleEvent,
      deleteScheduleEvent,
      importScheduleEvents,
      addTask,
      updateTask,
      toggleTaskStatus,
      archiveTask,
      deleteTask,
      toggleSubtask,
      addSubtask,
      deleteSubtask,
      addCourse,
      updateCourse,
      deleteCourse,
      addCourseNote,
      updateCourseNote,
      deleteCourseNote,
      addCourseChecklistItem,
      toggleCourseChecklistItem,
      deleteCourseChecklistItem,
      addFlashcard,
      updateFlashcardMastery,
      deleteFlashcard,
      addCourseResource,
      deleteCourseResource,
      toggleHandbookBookmark,
      voteHandbookArticle,
      upsertHandbookArticle,
      deleteHandbookArticle,
      toggleJoinClub,
      toggleRegisterEvent,
      addEventToSchedule,
      upsertCampusEvent,
      upsertCampusLocation,
      deleteCampusLocation,
      addQuestion,
      toggleUpvoteQuestion,
      toggleResolveQuestion,
      addAnswer,
      toggleUpvoteAnswer,
      toggleAcceptAnswer,
      toggleJoinStudyGroup,
      createStudyGroup,
      addStudyGroupSession,
      addGroupSessionToSchedule,
      submitModerationReport,
      resolveModerationReport,
      addExpense,
      deleteExpense,
      updateBudgetLimit,
      toggleLifeChecklistItem,
      addLifeChecklistItem,
      addMoodCheckIn,
      deleteMoodCheckIn,
      bookSupportAppointment,
      cancelSupportAppointment,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      deleteNotification,
      addRecentSearch,
      clearRecentSearches,
      updateSettings,
      updateNotificationPrefs,
      toggleDashboardWidget,
      startFocusMode,
      stopFocusMode,
      setSimulation,
      exportStateJSON,
      importStateJSON,
      resetDemoData,
    }),
    [
      state,
      unreadNotificationCount,
      signIn,
      signOut,
      completeOnboarding,
      updateProfile,
      updatePrivacy,
      switchRole,
      addScheduleEvent,
      updateScheduleEvent,
      deleteScheduleEvent,
      importScheduleEvents,
      addTask,
      updateTask,
      toggleTaskStatus,
      archiveTask,
      deleteTask,
      toggleSubtask,
      addSubtask,
      deleteSubtask,
      addCourse,
      updateCourse,
      deleteCourse,
      addCourseNote,
      updateCourseNote,
      deleteCourseNote,
      addCourseChecklistItem,
      toggleCourseChecklistItem,
      deleteCourseChecklistItem,
      addFlashcard,
      updateFlashcardMastery,
      deleteFlashcard,
      addCourseResource,
      deleteCourseResource,
      toggleHandbookBookmark,
      voteHandbookArticle,
      upsertHandbookArticle,
      deleteHandbookArticle,
      toggleJoinClub,
      toggleRegisterEvent,
      addEventToSchedule,
      upsertCampusEvent,
      upsertCampusLocation,
      deleteCampusLocation,
      addQuestion,
      toggleUpvoteQuestion,
      toggleResolveQuestion,
      addAnswer,
      toggleUpvoteAnswer,
      toggleAcceptAnswer,
      toggleJoinStudyGroup,
      createStudyGroup,
      addStudyGroupSession,
      addGroupSessionToSchedule,
      submitModerationReport,
      resolveModerationReport,
      addExpense,
      deleteExpense,
      updateBudgetLimit,
      toggleLifeChecklistItem,
      addLifeChecklistItem,
      addMoodCheckIn,
      deleteMoodCheckIn,
      bookSupportAppointment,
      cancelSupportAppointment,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      deleteNotification,
      addRecentSearch,
      clearRecentSearches,
      updateSettings,
      updateNotificationPrefs,
      toggleDashboardWidget,
      startFocusMode,
      stopFocusMode,
      setSimulation,
      exportStateJSON,
      importStateJSON,
      resetDemoData,
    ],
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreContextValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error('useAppStore phải được dùng bên trong AppStoreProvider');
  }
  return ctx;
}
