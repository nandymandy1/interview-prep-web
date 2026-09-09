type PracticeCard = {
  id: string;
};

type OrderedCard<T extends PracticeCard> = {
  card: T;
  order: number;
};

// Weakest-first ordering: unpractised cards first, then lowest confidence,
// then original flashcard order. No spaced-repetition engine. Pure and
// exported for regression tests; the view resets to position 0 after every
// successful record so a rerank never skips a card.
export const orderFlashcards = <T extends PracticeCard>(
  flashcards: readonly T[],
  confidenceById: ReadonlyMap<string, number>,
): T[] =>
  flashcards
    .map((card, order): OrderedCard<T> => ({ card, order }))
    .sort((a, b) => {
      const confidenceA = confidenceById.get(a.card.id);
      const confidenceB = confidenceById.get(b.card.id);

      if (confidenceA === undefined && confidenceB !== undefined) {
        return -1;
      }

      if (confidenceA !== undefined && confidenceB === undefined) {
        return 1;
      }

      if (confidenceA !== undefined && confidenceB !== undefined && confidenceA !== confidenceB) {
        return confidenceA - confidenceB;
      }

      return a.order - b.order;
    })
    .map((entry) => entry.card);
