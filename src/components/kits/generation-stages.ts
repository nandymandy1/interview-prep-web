import {
  CalendarClock,
  Clock3,
  FileSearch,
  Globe2,
  ShieldCheck,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react';

export type GenerationStageKey =
  | 'queued'
  | 'researching'
  | 'analyzing-jd'
  | 'generating'
  | 'checking-coverage'
  | 'building-schedule';

export type GenerationStageMeta = {
  key: GenerationStageKey;
  label: string;
  icon: LucideIcon;
};

// One canonical stage order source for the generation stepper. Labels mirror
// the backend STATUS_STEPS; icons identify pending steps while terminal and
// active states (completed/failed/running) override with state icons.
export const GENERATION_STEPS: ReadonlyArray<GenerationStageMeta> = [
  { key: 'queued', label: 'Queued', icon: Clock3 },
  { key: 'researching', label: 'Researching company', icon: Globe2 },
  { key: 'analyzing-jd', label: 'Analyzing job description', icon: FileSearch },
  { key: 'generating', label: 'Generating interview kit', icon: WandSparkles },
  { key: 'checking-coverage', label: 'Checking coverage', icon: ShieldCheck },
  { key: 'building-schedule', label: 'Building schedule', icon: CalendarClock },
];

export const generationStageIcon = (key: string): LucideIcon | undefined =>
  GENERATION_STEPS.find((step) => step.key === key)?.icon;
