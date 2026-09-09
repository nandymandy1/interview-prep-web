'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type FC, useEffect } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleCheckBig,
  Code2,
  Dumbbell,
  Globe,
  HeartHandshake,
  Layers3,
  ListChecks,
  MessageSquareText,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import GenerationProgress from '@/components/kits/generation-progress';
import KitBuilder from '@/components/kits/kit-builder';
import KitStatusBadge from '@/components/kits/kit-status-badge';
import SectionCard from '@/components/ui/section-card';
import { APP_ROUTES } from '@/constants';
import { useKit, useKitStatus } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';
import type { KitRequirement, RequirementKind } from '@/types/kits/kit.type';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'questions', label: 'Questions' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'schedule', label: 'Schedule' },
] as const;

const KIND_ICON: Record<RequirementKind, LucideIcon> = {
  technical: Code2,
  behavioural: HeartHandshake,
  domain: Globe,
};

const kindLabel = (kind: RequirementKind): string =>
  kind === 'technical' ? 'Technical' : kind === 'behavioural' ? 'Behavioural' : 'Domain';

type RequirementCardProps = {
  requirement: KitRequirement;
};

const RequirementCard: FC<RequirementCardProps> = ({ requirement }) => {
  const KindIcon = KIND_ICON[requirement.kind];

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-muted-foreground/30">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
          <KindIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed font-medium">{requirement.text}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-[38px]">
        <Badge variant={requirement.priority === 'must' ? 'default' : 'outline'}>
          {requirement.priority === 'must' ? 'Must-have' : 'Nice-to-have'}
        </Badge>
        <Badge variant="outline">{kindLabel(requirement.kind)}</Badge>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{requirement.id}</span>
      </div>
    </li>
  );
};

const KitDetailView: FC = () => {
  const params = useParams<{ kitId: string }>();
  const kitId = params.kitId;
  const kit = useKit(kitId);
  const status = useKitStatus(kitId, kit.data?.status !== 'completed');

  const detailStatus = kit.data?.status;
  const refetchKit = kit.refetch;

  useEffect(() => {
    if (status.data?.status === 'completed' && detailStatus !== 'completed') {
      void refetchKit();
    }
  }, [detailStatus, refetchKit, status.data?.status]);

  if (kit.isPending) {
    return (
      <PageContainer>
        <LoadingState rows={5} />
      </PageContainer>
    );
  }

  if (kit.isError) {
    return (
      <PageContainer>
        <ErrorState message={getErrorMessage(kit.error)} onRetry={() => kit.refetch()} />
      </PageContainer>
    );
  }

  if (kit.data.status !== 'completed' || !kit.data.kit) {
    return (
      <PageContainer className="max-w-4xl">
        <PageHeader
          backHref={APP_ROUTES.dashboard}
          backLabel="Interview kits"
          title="Preparing your interview kit"
          description="Research and generation can take a little while. Progress below reflects backend stages."
        />
        {status.data ? (
          <GenerationProgress status={status.data} kitId={kitId} />
        ) : (
          <LoadingState rows={4} />
        )}
        {status.isError ? (
          <div className="mt-6">
            <ErrorState message={getErrorMessage(status.error)} onRetry={() => status.refetch()} />
          </div>
        ) : null}
      </PageContainer>
    );
  }

  const data = kit.data.kit;
  const uncovered = data.coverage.uncovered_requirement_ids.length;
  const covered = uncovered === 0;

  return (
    <PageContainer>
      <PageHeader
        backHref={APP_ROUTES.dashboard}
        backLabel="Interview kits"
        eyebrow={data.source.company}
        title={data.role.title || data.source.role || 'Interview kit'}
        description={`${data.source.company} · ${data.schedule.days_available} day${data.schedule.days_available === 1 ? '' : 's'} of preparation`}
        actions={
          <Button asChild>
            <Link href={APP_ROUTES.practice(kitId)}>
              <Dumbbell className="size-4" aria-hidden="true" />
              Practice flashcards
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border bg-card px-4 py-3">
        <KitStatusBadge status={kit.data.status} />
        <Badge variant="outline">
          <CalendarDays className="size-3" aria-hidden="true" />
          {data.schedule.days_available} day{data.schedule.days_available === 1 ? '' : 's'}
        </Badge>
        <Badge variant="outline">
          <ListChecks className="size-3" aria-hidden="true" />
          {data.role.requirements.length} requirement
          {data.role.requirements.length === 1 ? '' : 's'}
        </Badge>
        <Badge variant="outline">
          <MessageSquareText className="size-3" aria-hidden="true" />
          {data.questions.length} question{data.questions.length === 1 ? '' : 's'}
        </Badge>
        <Badge variant="outline">
          <Layers3 className="size-3" aria-hidden="true" />
          {data.flashcards.length} flashcard{data.flashcards.length === 1 ? '' : 's'}
        </Badge>
        <Badge variant={covered ? 'default' : 'destructive'}>
          {covered ? (
            <>
              <CircleCheckBig className="size-3" aria-hidden="true" />
              Covered in {data.coverage.passes} pass{data.coverage.passes === 1 ? '' : 'es'}
            </>
          ) : (
            <>
              <TriangleAlert className="size-3" aria-hidden="true" />
              {uncovered} uncovered
            </>
          )}
        </Badge>
      </div>

      <nav
        aria-label="Kit sections"
        className="sticky top-0 z-10 -mx-4 mb-8 flex gap-2 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-full border bg-background px-3.5 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:border-muted-foreground/40 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div id="overview" className="grid scroll-mt-24 gap-5 lg:grid-cols-2">
        <SectionCard icon={BriefcaseBusiness} title="Role" description={data.role.seniority}>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Title</dt>
              <dd className="text-right font-medium">{data.role.title}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-2.5">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-right font-medium">{data.source.location}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-2.5">
              <dt className="text-muted-foreground">Preparation</dt>
              <dd className="text-right font-medium">
                {data.schedule.days_available} day{data.schedule.days_available === 1 ? '' : 's'} ·{' '}
                {data.questions.length} question{data.questions.length === 1 ? '' : 's'}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard icon={covered ? CircleCheckBig : TriangleAlert} title="Coverage">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{data.role.requirements.length} requirements</Badge>
            <Badge variant="outline">{data.questions.length} questions</Badge>
            <Badge variant="outline">{data.flashcards.length} flashcards</Badge>
            <Badge variant={covered ? 'default' : 'destructive'}>
              {covered ? (
                <>
                  <CircleCheckBig className="size-3" aria-hidden="true" />
                  Covered in {data.coverage.passes} pass{data.coverage.passes === 1 ? '' : 'es'}
                </>
              ) : (
                <>
                  <TriangleAlert className="size-3" aria-hidden="true" />
                  {uncovered} must-have{uncovered === 1 ? '' : 's'} still need
                  {uncovered === 1 ? 's' : ''} coverage
                </>
              )}
            </Badge>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard
          id="requirements"
          icon={ListChecks}
          title="Requirements"
          description="Extracted from the job description — never invented."
        >
          {data.role.requirements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This job description stated no explicit criteria, so the kit stays honestly thin.
            </p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {data.role.requirements.map((requirement) => (
                <RequirementCard key={requirement.id} requirement={requirement} />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-5">
        <KitBuilder kitId={kitId} kit={data} />
      </div>
    </PageContainer>
  );
};

export default KitDetailView;
