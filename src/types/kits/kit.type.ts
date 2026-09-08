export type RequirementKind = 'technical' | 'behavioural' | 'domain';
export type RequirementPriority = 'must' | 'nice';
export type QuestionCategory = 'technical' | 'behavioural' | 'system-design' | 'company-fit';
export type QuestionDifficulty = 1 | 2 | 3;
export type GenerationStatus = 'queued' | 'running' | 'completed' | 'failed';

export type KitSource = {
  company: string;
  company_url: string;
  role: string;
  location: string;
  jd_chars: number;
  researched_at: string;
  pages_used: string[];
};

export type CompanyBrief = {
  summary: string;
  what_they_do: string;
  sources: string[];
};

export type KitRequirement = {
  id: string;
  text: string;
  kind: RequirementKind;
  priority: RequirementPriority;
};

export type KitRole = {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: KitRequirement[];
};

export type KitQuestion = {
  id: string;
  requirement_ids: string[];
  category: QuestionCategory;
  prompt: string;
  answer_outline: string;
  difficulty: QuestionDifficulty;
};

export type KitFlashcard = {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
};

export type ScheduleDay = {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
};

export type KitSchedule = {
  days_available: number;
  days: ScheduleDay[];
};

export type KitCoverage = {
  uncovered_requirement_ids: string[];
  passes: number;
};

export type InterviewKit = {
  source: KitSource;
  company_brief: CompanyBrief;
  role: KitRole;
  questions: KitQuestion[];
  flashcards: KitFlashcard[];
  schedule: KitSchedule;
  coverage: KitCoverage;
};

export type KitSummary = {
  id: string;
  company: string;
  role: string;
  status: GenerationStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateKitInput = {
  jd: string;
  companyUrl: string;
  days: number;
};

export type CreateKitResult = {
  kitId: string;
  status: GenerationStatus;
};

export type KitDetailResult = {
  id: string;
  status: GenerationStatus;
  kit: InterviewKit | null;
};

export type GenerationStep = {
  key: string;
  label: string;
  state: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message?: string;
};

export type KitStatusResult = {
  kitId: string;
  status: GenerationStatus;
  progress: number;
  steps: GenerationStep[];
  error?: {
    code: string;
    message: string;
  };
};

export type UpdateQuestionInput = Partial<
  Pick<KitQuestion, 'prompt' | 'answer_outline' | 'category' | 'difficulty'>
>;

export type ReorderQuestionsInput = {
  questionIds: string[];
};

export type RegenerateSectionInput =
  | { section: 'company_brief' }
  | { section: 'schedule' }
  | { section: 'questions'; category: QuestionCategory };

export type RecordPracticeInput = {
  confidence: 1 | 2 | 3 | 4 | 5;
};
