'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type FC, useEffect } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleCheckBig,
  Dumbbell,
  ListChecks,
  TriangleAlert,
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

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'questions', label: 'Questions' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'schedule', label: 'Schedule' },
] as const;

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
        {status.data ? <GenerationProgress status={status.data} /> : <LoadingState rows={4} />}
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

      <div className="mb-8 flex flex-wrap items-center gap-2">
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
          {data.questions.length} question{data.questions.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <nav aria-label="Kit sections" className="mb-8 flex gap-2 overflow-x-auto pb-1">
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

      <div id="overview" className="grid scroll-mt-20 gap-5 lg:grid-cols-2">
        <SectionCard icon={BriefcaseBusiness} title="Role" description={data.role.seniority}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Title</dt>
              <dd className="font-medium">{data.role.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{data.source.location}</dd>
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
                <li
                  key={requirement.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3.5"
                >
                  <p className="text-sm">{requirement.text}</p>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={requirement.priority === 'must' ? 'default' : 'outline'}>
                      {requirement.priority === 'must' ? 'Must-have' : 'Nice-to-have'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {requirement.kind}
                    </Badge>
                  </span>
                </li>
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
