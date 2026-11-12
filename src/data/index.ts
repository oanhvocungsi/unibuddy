import type {
  AppSettings,
  AppState,
  DemoSimulationState,
} from '../types/models';
import { createAcademicSeedData } from './academicSeedData';
import { createCampusSeedData } from './campusData';
import { createCommunitySeedData } from './communityData';
import { createHandbookSeedData } from './handbookData';
import { createLifeAndSupportSeedData } from './lifeAndSupportData';

export * from './academicSeedData';
export * from './handbookData';
export * from './campusData';
export * from './communityData';
export * from './lifeAndSupportData';

export function createDefaultSettings(): AppSettings {
  return {
    theme: 'system',
    reduceMotion: 'system',
    quietHoursEnabled: false,
    quietStart: '22:30',
    quietEnd: '06:30',
    focusModeUntil: null,
    notifications: {
      schedule: true,
      deadline: true,
      academic: true,
      group: true,
      event: true,
    },
    dashboardWidgets: [
      'today_timeline',
      'upcoming_deadlines',
      'weekly_progress',
      'courses_overview',
      'quick_actions',
      'campus_shortcuts',
      'wellness_budget',
    ],
  };
}

export function createDefaultSimulationState(): DemoSimulationState {
  return {
    networkError: false,
    sessionExpired: false,
    loadingFeature: null,
    isOffline: false,
  };
}

/**
 * Khởi tạo toàn bộ trạng thái mẫu ban đầu của UniBuddy với mốc ngày tương đối tính từ HÔM NAY.
 */
export function createInitialSeedData(): AppState {
  const academic = createAcademicSeedData();
  const handbookArticles = createHandbookSeedData();
  const campus = createCampusSeedData();
  const community = createCommunitySeedData();
  const lifeAndSupport = createLifeAndSupportSeedData();

  return {
    version: 1,
    isAuthenticated: true,
    profile: academic.profile,
    courses: academic.courses,
    courseNotes: academic.courseNotes,
    courseChecklists: academic.courseChecklists,
    flashcards: academic.flashcards,
    courseResources: academic.courseResources,
    scheduleEvents: academic.scheduleEvents,
    tasks: academic.tasks,
    handbookArticles,
    campusLocations: campus.campusLocations,
    campusUtilities: campus.campusUtilities,
    clubs: community.clubs,
    events: community.events,
    questions: community.questions,
    studyGroups: community.studyGroups,
    expenses: lifeAndSupport.expenses,
    budgetLimits: lifeAndSupport.budgetLimits,
    lifeChecklist: lifeAndSupport.lifeChecklist,
    moodCheckIns: lifeAndSupport.moodCheckIns,
    supportCenters: lifeAndSupport.supportCenters,
    supportAppointments: lifeAndSupport.supportAppointments,
    wellnessGuides: lifeAndSupport.wellnessGuides,
    notifications: lifeAndSupport.notifications,
    moderationReports: lifeAndSupport.moderationReports,
    auditLogs: lifeAndSupport.auditLogs,
    recentSearches: ['Đăng ký tín chỉ', 'Thư viện TV-01', 'GPA'],
    settings: createDefaultSettings(),
    simulation: createDefaultSimulationState(),
  };
}
