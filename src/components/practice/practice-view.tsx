'use client';

import { useParams } from 'next/navigation';
import { type FC, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Brain, Dumbbell, Eye, LoaderCircle, Target } from 'lucide-react';
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

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        backHref={APP_ROUTES.kit(kitId)}
        backLabel="Back to kit"
        eyebrow={kit.data.kit?.role.title}
        title="Practice flashcards"
        description="Focus on the cards you are least confident about."
      />

      <div className="mb-6 space-y-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">
            <Dumbbell className="size-3" aria-hidden="true" />
            Card {(position % ordered.length) + 1} of {ordered.length}
          </Badge>
          <Badge variant="outline">
            <Target className="size-3" aria-hidden="true" />
            {covered} covered
          </Badge>
          <Badge variant="outline">{remaining} remaining</Badge>
        </div>
        <Progress value={progress} aria-label={`${covered} of ${ordered.length} cards covered`} />
      </div>

      <Card className="min-h-80 justify-between">
        <CardContent className="space-y-8">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Brain className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Question
              </p>
              <p className="mt-1.5 text-xl leading-relaxed font-medium">{current?.front}</p>
            </div>
          </div>

          {revealed ? (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Answer
              </p>
              <p className="mt-2 text-sm leading-relaxed">{current?.back}</p>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              <Eye className="size-4" aria-hidden="true" />
              Reveal answer
            </Button>
          )}

          {revealed ? (
            <div>
              <p className="mb-3 text-sm font-medium">How confident are you?</p>
              <div className="grid grid-cols-5 gap-2" role="group" aria-label="Confidence level">
                {([1, 2, 3, 4, 5] as const).map((confidence) => (
                  <Button
                    key={confidence}
                    type="button"
                    variant="outline"
                    className="h-11"
                    disabled={recordPractice.isPending}
                    onClick={() => handleConfidence(confidence)}
                    aria-label={`Confidence ${confidence}${confidence === 1 ? ', needs work' : confidence === 3 ? ', okay' : confidence === 5 ? ', confident' : ''}`}
                  >
                    {recordPractice.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      confidence
                    )}
                  </Button>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>1 · Needs work</span>
                <span>3 · Okay</span>
                <span>5 · Confident</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PracticeView;
