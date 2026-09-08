'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type FC, useEffect } from 'react';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import CardHeader from '@/components/ui/card-header';
import CardTitle from '@/components/ui/card-title';
import Badge from '@/components/ui/badge';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import GenerationProgress from '@/components/kits/generation-progress';
import { APP_ROUTES } from '@/constants';
import { useKit, useKitStatus } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';

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

  return (
    <PageContainer>
      <PageHeader
        title={data.role.title || data.source.role || 'Interview kit'}
        description={data.source.company}
        action={
          <Button asChild>
            <Link href={APP_ROUTES.practice(kitId)}>Practice flashcards</Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{data.company_brief.summary}</p>
            <p className="text-muted-foreground">{data.company_brief.what_they_do}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{data.role.requirements.length} extracted requirements</p>
            <p>{data.questions.length} interview questions</p>
            <p>{data.flashcards.length} flashcards</p>
            <Badge
              variant={
                data.coverage.uncovered_requirement_ids.length === 0 ? 'default' : 'secondary'
              }
            >
              {data.coverage.uncovered_requirement_ids.length === 0
                ? `Covered after ${data.coverage.passes} pass${data.coverage.passes === 1 ? '' : 'es'}`
                : `${data.coverage.uncovered_requirement_ids.length} uncovered`}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Requirements</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.role.requirements.map((requirement) => (
            <Card key={requirement.id} className="gap-3 py-4">
              <CardContent className="flex items-start justify-between gap-3">
                <p className="text-sm">{requirement.text}</p>
                <Badge variant={requirement.priority === 'must' ? 'default' : 'outline'}>
                  {requirement.priority}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Questions</h2>
        <div className="space-y-3">
          {data.questions.map((question) => (
            <Card key={question.id} className="gap-3 py-4">
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{question.category}</Badge>
                  <Badge variant="outline">Difficulty {question.difficulty}</Badge>
                </div>
                <p className="font-medium">{question.prompt}</p>
                <p className="text-sm text-muted-foreground">{question.answer_outline}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Study schedule</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.schedule.days.map((day) => (
            <Card key={day.day} className="gap-3 py-4">
              <CardContent>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Day {day.day}
                </p>
                <p className="mt-1 font-medium">{day.focus}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {day.minutes} minutes · {day.question_ids.length} questions
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageContainer>
  );
};

export default KitDetailView;
