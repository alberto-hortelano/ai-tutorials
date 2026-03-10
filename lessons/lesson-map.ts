// Re-exporting shim — all imports from 'lessons/lesson-map' are forwarded to registry
export {
  getLessonTitle,
  getLessonDesc,
  getLessonMeta,
  getModuleName,
  getModuleMeta,
  getQuizData,
  LESSONS,
  MODULES,
  QUIZ_DATA,
  MODULE_NAMES,
  getNextLesson,
  getLessonModule,
  getLesson,
} from './registry';
