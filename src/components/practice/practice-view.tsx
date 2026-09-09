'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type FC, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Brain,
  CircleCheckBig,
  Clock3,
  Eye,
  EyeOff,
  Layers3,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Target,
} from 'lucide-react';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import Progress from '@/components/ui/progress';
import { useKit, useRecordPractice } from '@/hooks/kits/use-kits';
import { APP_ROUTES } from '@/constants';
import { getErrorMessage } from '@/lib/error';
import { orderFlashcards } from '@/lib/practice-order';

const CONFIDENCE_LABELS = ['Needs work', 'Weak', 'Okay', 'Good', 'Confident'] as const;

const PracticeView: FC = () => {
  const params = useParams<{ kitId: string }>();
  const kitId = params.kitId;
  const kit = useKit(kitId);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const flashcards = useMemo(() => kit.data?.kit?.flashcards ?? [], [kit.data?.kit?.flashcards]);
  const confidenceById = useMemo(() => {
    const latest = new Map<string, number>();

    for (const record of kit.data?.practiceRecords ?? []) {
      latest.set(record.flashcardId, record.confidence);
    }

    return latest;
  }, [kit.data?.practiceRecords]);

  const ordered = useMemo(
    () => orderFlashcards(flashcards, confidenceById),
    [flashcards, confidenceById],
  );
  const current = ordered[position % Math.max(ordered.length, 1)];
  const recordPractice = useRecordPractice(kitId, current?.id ?? '');

  if (kit.isPending) {
    return (
      <PageContainer>
        <LoadingState rows={4} />
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
      <PageContainer>
        <ErrorState
          title="Kit is still generating"
          message="Practice unlocks once generation completes. Check back after the kit is ready."
        />
      </PageContainer>
    );
  }

  if (ordered.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="No flashcards yet"
          message="This kit does not currently contain practice flashcards."
        />
      </PageContainer>
    );
  }

  const covered = flashcards.filter((card) => confidenceById.has(card.id)).length;
  const remaining = flashcards.length - covered;
  const progress = flashcards.length === 0 ? 0 : (covered / flashcards.length) * 100;

  const handleConfidence = async (confidence: 1 | 2 | 3 | 4 | 5): Promise<void> => {
    if (!current) {
      return;
    }

    try {
      await recordPractice.mutateAsync({ confidence });
      // The deck reranks from refetched detail state; restart at the new
      // weakest card instead of stepping past it.
      setPosition(0);
      setRevealed(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const currentConfidence = current ? confidenceById.get(current.id) : undefined;
  const isPriorityCard = current !== undefined && currentConfidence === undefined;
  const requirementTitleById = new Map(
    (kit.data.kit?.role.requirements ?? []).map((requirement) => [
      requirement.id,
      requirement.text,
    ]),
  );

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        backHref={APP_ROUTES.kit(kitId)}
        backLabel="Back to kit"
        eyebrow={kit.data.kit?.role.title}
        title="Practice flashcards"
        description="Focus on the cards you are least confident about."
        actions={
          <Badge variant="outline">
            <Target className="size-3" aria-hidden="true" />
            Weakest first
          </Badge>
        }
      />

      <div className="mb-5 space-y-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">
            <Layers3 className="size-3" aria-hidden="true" />
            Card {(position % ordered.length) + 1} of {ordered.length}
          </Badge>
          <Badge variant="outline">
            <Target className="size-3" aria-hidden="true" />
            {covered} covered
          </Badge>
          <Badge variant="outline">
            <Clock3 className="size-3" aria-hidden="true" />
            {remaining} remaining
          </Badge>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} aria-label={`${covered} of ${ordered.length} cards covered`} />
      </div>

      {remaining === 0 ? (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <CircleCheckBig className="size-5 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Practice complete</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You have reviewed all {flashcards.length} flashcard
              {flashcards.length === 1 ? '' : 's'}. Keep going to reinforce the weakest ones.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setPosition(0);
                setRevealed(false);
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Practice again
            </Button>
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href={APP_ROUTES.kit(kitId)}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to kit
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Brain className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Question
                </p>
                {isPriorityCard ? (
                  <Badge variant="secondary" className="px-2 py-0 text-[11px] font-normal">
                    <Target className="size-3" aria-hidden="true" />
                    Priority card
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1.5 text-lg leading-relaxed font-medium sm:text-xl">
                {current?.front}
              </p>
              {(current?.requirement_ids.length ?? 0) > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {current?.requirement_ids.map((id) => (
                    <Badge
                      key={id}
                      variant="outline"
                      className="px-2 py-0 text-[11px] font-normal text-muted-foreground"
                      title={requirementTitleById.get(id) ?? id}
                    >
                      {id}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {revealed ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <Lightbulb className="size-3.5" aria-hidden="true" />
                  Answer
                </p>
                <p className="mt-2 text-sm leading-relaxed">{current?.back}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRevealed(false)}
                className="text-muted-foreground"
              >
                <EyeOff className="size-4" aria-hidden="true" />
                Hide answer
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              <Eye className="size-4" aria-hidden="true" />
              Reveal answer
            </Button>
          )}

          {revealed ? (
            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium">How confident are you?</p>
              <div
                className="grid grid-cols-5 gap-2"
                role="group"
                aria-label="Confidence level"
                aria-busy={recordPractice.isPending}
              >
                {([1, 2, 3, 4, 5] as const).map((confidence) => (
                  <div key={confidence} className="flex flex-col items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      disabled={recordPractice.isPending}
                      onClick={() => handleConfidence(confidence)}
                      aria-label={`Confidence ${confidence}, ${CONFIDENCE_LABELS[confidence - 1]}`}
                    >
                      {recordPractice.isPending ? (
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        confidence
                      )}
                    </Button>
                    <span className="hidden text-[11px] text-muted-foreground sm:block">
                      {CONFIDENCE_LABELS[confidence - 1]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground sm:hidden">
                <span>1 · Needs work</span>
                <span>5 · Confident</span>
              </div>
              {recordPractice.isPending ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                  Saving… advancing to your weakest card next.
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PracticeView;
