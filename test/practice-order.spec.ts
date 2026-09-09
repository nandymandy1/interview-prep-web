import { describe, expect, it } from 'vitest';
import { orderFlashcards } from '@/lib/practice-order';

const cards = [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }];

describe('practice weakest-first ordering', () => {
  it('puts unpractised cards first, then lowest confidence, then original order', () => {
    const ordered = orderFlashcards(
      cards,
      new Map([
        ['f1', 5],
        ['f3', 2],
      ]),
    );

    expect(ordered.map((card) => card.id)).toEqual(['f2', 'f3', 'f1']);
  });

  it('breaks confidence ties by original order', () => {
    const ordered = orderFlashcards(
      cards,
      new Map([
        ['f1', 3],
        ['f2', 3],
        ['f3', 1],
      ]),
    );

    expect(ordered.map((card) => card.id)).toEqual(['f3', 'f1', 'f2']);
  });

  it('a freshly recorded card reranks deterministically (no skip after reset)', () => {
    // Before: f2 unpractised, so it fronts the deck. After recording f2 with
    // confidence 1 while f1 sits at 4, the deck reranks to [f3, f2, f1]
    // (unpractised f3 first) and the view resets position to 0 — the user
    // always lands on the deterministic front, never position+1 into a
    // reordered deck.
    const before = orderFlashcards(cards, new Map([['f1', 4]]));
    expect(before.map((card) => card.id)[0]).toBe('f2');

    const after = orderFlashcards(
      cards,
      new Map([
        ['f1', 4],
        ['f2', 1],
      ]),
    );
    expect(after.map((card) => card.id)).toEqual(['f3', 'f2', 'f1']);
    expect(after[0]?.id).toBe('f3');
  });
});
