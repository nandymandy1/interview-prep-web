import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GenerationProgress from '@/components/kits/generation-progress';
import { GENERATION_STEPS } from '@/components/kits/generation-stages';
import type { GenerationStep, KitStatusResult } from '@/types/kits/kit.type';

const STEP_LABELS = [
  'Queued',
  'Researching company',
  'Analyzing job description',
  'Generating interview kit',
  'Checking coverage',
  'Building schedule',
];

const steps = (states: Array<GenerationStep['state']>, message?: string): GenerationStep[] => {
  const keys = [
    'queued',
    'researching',
    'analyzing-jd',
    'generating',
    'checking-coverage',
    'building-schedule',
  ];

  return keys.map((key, index) => ({
    key,
    label: STEP_LABELS[index] as string,
    state: states[index] as GenerationStep['state'],
    ...(message && states[index] === 'failed' ? { message } : {}),
  }));
};

const statusOf = (
  status: KitStatusResult['status'],
  progress: number,
  states: Array<GenerationStep['state']>,
  message?: string,
): KitStatusResult => ({
  kitId: 'kit-1',
  status,
  progress,
  steps: steps(states, message),
  ...(message && status === 'failed' ? { error: { code: 'OPENAI_RATE_LIMITED', message } } : {}),
  updatedAt: '2026-09-09T00:00:00.000Z',
});

const rendered = (status: KitStatusResult): string =>
  renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(GenerationProgress, { status, kitId: 'kit-1' }),
    ),
  );

const RATE_LIMIT_MESSAGE =
  'OpenAI is temporarily rate-limiting requests. Please retry in a moment.';

describe('generation stage metadata', () => {
  it('defines the six work stages in execution order', () => {
    expect(GENERATION_STEPS.map((step) => step.key)).toEqual([
      'queued',
      'researching',
      'analyzing-jd',
      'generating',
      'checking-coverage',
      'building-schedule',
    ]);
    expect(GENERATION_STEPS.map((step) => step.label)).toEqual(STEP_LABELS);
  });

  it('gives every stage a Lucide icon', () => {
    for (const step of GENERATION_STEPS) {
      expect(step.icon).toBeDefined();
      expect(typeof step.icon).toBe('object');
    }
  });
});

describe('failed step mapping', () => {
  it('attaches JD-extraction failure to Analyzing after completed research', () => {
    const html = rendered(
      statusOf(
        'failed',
        33,
        ['completed', 'completed', 'failed', 'pending', 'pending', 'pending'],
        RATE_LIMIT_MESSAGE,
      ),
    );

    for (const label of STEP_LABELS) {
      expect(html).toContain(label);
    }

    expect(html).toContain(RATE_LIMIT_MESSAGE);
    // Queued + researching completed.
    expect(html.split('lucide-circle-check-big')).toHaveLength(3);
    // Failed analyzing step.
    expect(html.split('lucide-circle-x')).toHaveLength(3);
    // Completed research and failed analysis both override stage icons.
    expect(html).not.toContain('lucide-earth');
    expect(html).not.toContain('lucide-file-search');
  });

  it('attaches research failure to Researching with analysis pending', () => {
    const html = rendered(
      statusOf(
        'failed',
        17,
        ['completed', 'failed', 'pending', 'pending', 'pending', 'pending'],
        'Crawl failed.',
      ),
    );

    expect(html).toContain('Crawl failed.');
    // Only queued completed.
    expect(html.split('lucide-circle-check-big')).toHaveLength(2);
    // Failed research step.
    expect(html.split('lucide-circle-x')).toHaveLength(3);
    // Pending analysis keeps its stage icon; failed research overrides its own.
    expect(html).toContain('lucide-file-search');
    expect(html).not.toContain('lucide-earth');
  });

  it('attaches content failure to Generating with prior stages completed', () => {
    const html = rendered(
      statusOf(
        'failed',
        50,
        ['completed', 'completed', 'completed', 'failed', 'pending', 'pending'],
        'Brief failed.',
      ),
    );

    expect(html).toContain('Brief failed.');
    expect(html.split('lucide-circle-check-big')).toHaveLength(4);
    expect(html.split('lucide-circle-x')).toHaveLength(3);
  });
});

describe('retry reset and progress', () => {
  it('clears failed visuals once retry returns to queued', () => {
    const html = rendered(
      statusOf('queued', 0, ['pending', 'pending', 'pending', 'pending', 'pending', 'pending']),
    );

    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('Retry generation');
    expect(html).not.toContain('Generation failed');
    expect(html).toContain('lucide-clock3');

    for (const label of STEP_LABELS) {
      expect(html).toContain(label);
    }
  });

  it('reports backend progress verbatim and monotonically', () => {
    const progresses = [0, 17, 33, 50, 67, 83];

    for (const progress of progresses) {
      const html = rendered(
        statusOf('running', progress, [
          'completed',
          'running',
          'pending',
          'pending',
          'pending',
          'pending',
        ]),
      );

      expect(html).toContain(`${progress}%`);
    }

    const done = rendered(
      statusOf('completed', 100, [
        'completed',
        'completed',
        'completed',
        'completed',
        'completed',
        'completed',
      ]),
    );

    expect(done).toContain('100%');
    expect(done).not.toContain('role="alert"');
  });

  it('never reports 100% before completion', () => {
    const html = rendered(
      statusOf('running', 83, [
        'completed',
        'completed',
        'completed',
        'completed',
        'completed',
        'running',
      ]),
    );

    expect(html).toContain('83%');
    expect(html).not.toContain('100%');
  });
});
