'use client';

import { useParams } from 'next/navigation';
import { type FC, useState } from 'react';
import { toast } from 'sonner';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import { useKit, useRecordPractice } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';

const PracticeView: FC = () => {
  const params = useParams<{ kitId: string }>();
  const kitId = params.kitId;
  const kit = useKit(kitId);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const flashcards = kit.data?.kit?.flashcards ?? [];
  const current = flashcards[index];
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

  if (!kit.data.kit || flashcards.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="No flashcards yet"
          message="This kit does not currently contain practice flashcards."
        />
      </PageContainer>
    );
  }

  const handleConfidence = async (confidence: 1 | 2 | 3 | 4 | 5): Promise<void> => {
    if (!current) {
      return;
    }

    try {
      await recordPractice.mutateAsync({ confidence });
      const nextIndex = (index + 1) % flashcards.length;
      setIndex(nextIndex);
      setRevealed(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Practice flashcards"
        description={`Card ${index + 1} of ${flashcards.length}. Reveal the answer, then record how confident you felt.`}
      />

      <Card className="min-h-80 justify-between">
        <CardContent className="space-y-8">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Question
            </p>
            <p className="mt-3 text-xl leading-relaxed font-medium">{current.front}</p>
          </div>

          {revealed ? (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Answer
              </p>
              <p className="mt-2 text-sm leading-relaxed">{current.back}</p>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              Reveal answer
            </Button>
          )}

          {revealed ? (
            <div>
              <p className="mb-3 text-sm font-medium">How confident were you?</p>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as const).map((confidence) => (
                  <Button
                    key={confidence}
                    type="button"
                    variant="outline"
                    disabled={recordPractice.isPending}
                    onClick={() => handleConfidence(confidence)}
                  >
                    {confidence}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PracticeView;
