export type UserRole = 'student' | 'editor' | 'admin';

export type ThemeMode = 'light' | 'dark' | 'system';

export type UserGoal =
  | 'academic_balance'
  | 'time_management'
  | 'make_friends'
  | 'campus_navigation'
  | 'budget_control'
  | 'mental_wellness';

export interface PrivacySettings {
  hideEmail: boolean;
  hidePhone: boolean;
  hideSchedule: boolean;
  hideClass: boolean;
  hideCommunityActivity: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  studentCode: string;
  email: string;
  phone: string;
  bio: string;
  schoolName: string;
  faculty: string;
  major: string;
  cohort: string;
  className: string;
  campus: string;
  semester: string;
  goals: UserGoal[];
  freeSlots: string[];
  interests: string[];
  privacy: PrivacySettings;
  onboardingCompleted: boolean;
  role: UserRole;
  isSample?: boolean;
}

export type CourseResourceOrigin = 'school_sample' | 'community' | 'personal';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  scheduleSummary: string;
  color: string;
  targetGrade?: string;
  currentScore?: number;
  progressPercent: number;
  semester: string;
  description?: string;
  syllabusHighlights?: string[];
  isSample?: boolean;
}

export interface CourseNote {
  id: string;
  courseId: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  pinned?: boolean;
}

export interface CourseChecklistItem {
  id: string;
  courseId: string;
  title: string;
  weekLabel?: string;
  completed: boolean;
}

export type FlashcardMastery = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  courseId: string;
  front: string;
  back: string;
  mastery: FlashcardMastery;
  lastReviewedAt?: string;
}

export type CourseResourceType =
  | 'syllabus'
  | 'slide'
  | 'reference'
  | 'practice'
  | 'link';

export interface CourseResource {
  id: string;
  courseId: string;
  title: string;
  type: CourseResourceType;
  url?: string;
  description: string;
  origin: CourseResourceOrigin;
  addedAt: string;
}

export type ScheduleCategory = 'class' | 'exam' | 'event' | 'personal';
export type ScheduleRecurrence = 'none' | 'weekly';
export type ScheduleSource = 'personal' | 'club' | 'imported';

export interface ScheduleEvent {
  id: string;
  title: string;
  category: ScheduleCategory;
  /** Format: YYYY-MM-DD */
  date: string;
  /** Format: HH:mm */
  startTime: string;
  /** Format: HH:mm */
  endTime: string;
  location?: string;
  courseId?: string;
  note?: string;
  recurrence: ScheduleRecurrence;
  recurrenceWeeks?: number;
  source: ScheduleSource;
  linkedEventId?: string;
  isSample?: boolean;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type ReminderBefore = 'none' | '1h' | '1d' | '3d';
export type TaskStatus = 'todo' | 'done' | 'archived';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  /** Format: YYYY-MM-DD */
  dueDate: string;
  /** Format: HH:mm */
  dueTime?: string;
  priority: TaskPriority;
  reminderBefore: ReminderBefore;
  status: TaskStatus;
  subtasks: Subtask[];
  estimatedMinutes?: number;
  createdAt: string;
  completedAt?: string;
  isSample?: boolean;
}

export type HandbookCategory =
  | 'getting_started'
  | 'course_registration'
  | 'academic_regulations'
  | 'credits_gpa'
  | 'tuition_scholarships'
  | 'student_card_accounts'
  | 'library'
  | 'housing_commute'
  | 'clubs_activities'
  | 'faq';

export interface HandbookArticle {
  id: string;
  title: string;
  category: HandbookCategory;
  summary: string;
  steps: string[];
  requiredDocs: string[];
  sourceUnit: string;
  officialGuidance: string;
  tags: string[];
  readMinutes: number;
  updatedAt: string;
  helpfulYes: number;
  helpfulNo: number;
  userVote?: 'yes' | 'no';
  bookmarked?: boolean;
  isSample: boolean;
}

export type CampusLocationCategory =
  | 'building'
  | 'library'
  | 'medical'
  | 'canteen'
  | 'restroom'
  | 'parking'
  | 'admin';

export interface CampusLocation {
  id: string;
  code: string;
  name: string;
  category: CampusLocationCategory;
  /** Percentage coordinate 0..100 */
  x: number;
  /** Percentage coordinate 0..100 */
  y: number;
  openHours: string;
  contactNote: string;
  floorGuide: string[];
  routeFromMainGate: string[];
  services: string[];
  accessibilityNote?: string;
  isSample: boolean;
}

export type CampusUtilityCategory =
  | 'hours'
  | 'procedure'
  | 'contact'
  | 'transport';

export interface CampusUtilityService {
  id: string;
  title: string;
  category: CampusUtilityCategory;
  summary: string;
  details: string[];
  scheduleOrHours: string;
  contactNote: string;
  officialGuidance: string;
  isSample: boolean;
}

export type ClubField =
  | 'academic'
  | 'skills'
  | 'sports'
  | 'volunteer'
  | 'arts';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  field: ClubField;
  description: string;
  meetingSchedule: string;
  location: string;
  memberCount: number;
  highlights: string[];
  contactNote: string;
  joined?: boolean;
  isSample: boolean;
}

export type CampusEventStatus = 'upcoming' | 'cancelled' | 'updated';

export type CampusEventCategory =
  | 'orientation'
  | 'academic'
  | 'club'
  | 'career'
  | 'sports'
  | 'culture';

export interface CampusEvent {
  id: string;
  title: string;
  organizer: string;
  clubId?: string;
  category: CampusEventCategory;
  /** Format: YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: CampusEventStatus;
  statusNote?: string;
  capacity: number;
  registeredCount: number;
  registered?: boolean;
  addedToCalendar?: boolean;
  isSample: boolean;
}

export type CommunityTopic =
  | 'registration'
  | 'courses'
  | 'campus_life'
  | 'housing'
  | 'clubs'
  | 'study_tips';

export interface CommunityAnswer {
  id: string;
  questionId: string;
  authorName: string;
  authorRoleLabel: string;
  content: string;
  createdAt: string;
  votes: number;
  userUpvoted?: boolean;
  isHelpfulAccepted?: boolean;
  isHidden?: boolean;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  content: string;
  topic: CommunityTopic;
  authorName: string;
  authorCohort: string;
  createdAt: string;
  tags: string[];
  votes: number;
  userUpvoted?: boolean;
  resolved: boolean;
  answers: CommunityAnswer[];
  isHidden?: boolean;
  isSample?: boolean;
}

export interface GroupSession {
  id: string;
  groupId: string;
  title: string;
  /** Format: YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  locationOrLink: string;
  agenda: string;
  addedToCalendar?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  courseCode?: string;
  courseName?: string;
  topic: string;
  description: string;
  scheduleNote: string;
  locationNote: string;
  memberCount: number;
  maxMembers: number;
  joined?: boolean;
  members: string[];
  sessions: GroupSession[];
  isSample?: boolean;
}

export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'study'
  | 'social'
  | 'other';

export interface ExpenseEntry {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  /** Format: YYYY-MM-DD */
  date: string;
  note?: string;
  isSample?: boolean;
}

export interface BudgetLimit {
  category: ExpenseCategory;
  monthlyLimit: number;
}

export type LifeChecklistCategory =
  | 'semester_prep'
  | 'essentials'
  | 'saving_tips'
  | 'essential_places';

export interface LifeChecklistItem {
  id: string;
  title: string;
  category: LifeChecklistCategory;
  description: string;
  completed: boolean;
  tip?: string;
  isSample?: boolean;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodCheckIn {
  id: string;
  /** Format: YYYY-MM-DD */
  date: string;
  createdAt: string;
  mood: MoodLevel;
  energy: MoodLevel;
  tags: string[];
  note: string;
  isPrivate: true;
}

export type SupportCenterCategory =
  | 'counseling'
  | 'medical'
  | 'student_affairs'
  | 'hotline'
  | 'academic_advising';

export interface SupportCenter {
  id: string;
  name: string;
  category: SupportCenterCategory;
  description: string;
  location: string;
  openHours: string;
  contactNote: string;
  bookingAvailable: boolean;
  officialGuidance: string;
  isSample: boolean;
}

export interface SupportAppointment {
  id: string;
  centerId: string;
  centerName: string;
  /** Format: YYYY-MM-DD */
  date: string;
  timeSlot: string;
  mode: 'in_person' | 'online';
  topic: string;
  note?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
  isPrivate: true;
}

export type WellnessGuideCategory =
  | 'homesickness'
  | 'exam_stress'
  | 'sleep_balance'
  | 'social_adaptation'
  | 'study_burnout';

export interface WellnessGuide {
  id: string;
  title: string;
  category: WellnessGuideCategory;
  summary: string;
  practicalSteps: string[];
  whenToSeekHelp: string;
  isSample: boolean;
}

export type NotificationCategory =
  | 'schedule'
  | 'deadline'
  | 'academic'
  | 'group'
  | 'event';

export type NotificationPriority = 'urgent' | 'important' | 'normal';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  createdAt: string;
  read: boolean;
  isSample?: boolean;
  actionRoute?: string;
}

export type ModerationTargetType = 'question' | 'answer' | 'group';
export type ModerationStatus = 'pending' | 'resolved_hidden' | 'dismissed';

export interface ModerationReport {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  parentId?: string;
  targetPreview: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
  status: ModerationStatus;
  resolutionNote?: string;
}

export interface AdminAuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetLabel: string;
  createdAt: string;
  details?: string;
}

export type DashboardWidgetId =
  | 'today_timeline'
  | 'upcoming_deadlines'
  | 'weekly_progress'
  | 'courses_overview'
  | 'quick_actions'
  | 'campus_shortcuts'
  | 'wellness_budget';

export interface NotificationPreferences {
  schedule: boolean;
  deadline: boolean;
  academic: boolean;
  group: boolean;
  event: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  reduceMotion: 'system' | 'reduce' | 'normal';
  quietHoursEnabled: boolean;
  /** Format: HH:mm */
  quietStart: string;
  /** Format: HH:mm */
  quietEnd: string;
  /** ISO timestamp or null */
  focusModeUntil: string | null;
  notifications: NotificationPreferences;
  dashboardWidgets: DashboardWidgetId[];
}

export interface DemoSimulationState {
  networkError: boolean;
  sessionExpired: boolean;
  loadingFeature: string | null;
  isOffline: boolean;
}

export interface AppState {
  version: number;
  isAuthenticated: boolean;
  profile: StudentProfile;
  courses: Course[];
  courseNotes: CourseNote[];
  courseChecklists: CourseChecklistItem[];
  flashcards: Flashcard[];
  courseResources: CourseResource[];
  scheduleEvents: ScheduleEvent[];
  tasks: TaskItem[];
  handbookArticles: HandbookArticle[];
  campusLocations: CampusLocation[];
  campusUtilities: CampusUtilityService[];
  clubs: Club[];
  events: CampusEvent[];
  questions: CommunityQuestion[];
  studyGroups: StudyGroup[];
  expenses: ExpenseEntry[];
  budgetLimits: BudgetLimit[];
  lifeChecklist: LifeChecklistItem[];
  moodCheckIns: MoodCheckIn[];
  supportCenters: SupportCenter[];
  supportAppointments: SupportAppointment[];
  wellnessGuides: WellnessGuide[];
  notifications: AppNotification[];
  moderationReports: ModerationReport[];
  auditLogs: AdminAuditLog[];
  recentSearches: string[];
  settings: AppSettings;
  simulation: DemoSimulationState;
}
