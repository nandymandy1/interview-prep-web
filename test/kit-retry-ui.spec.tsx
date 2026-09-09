import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import GenerationProgress, { FailedGenerationState } from '@/components/kits/generation-progress';
import { KitService } from '@/services/kits/kit.service';
import type { KitStatusResult } from '@/types/kits/kit.type';

const failedStatus = (message: string): KitStatusResult => ({
  kitId: 'kit-1',
  status: 'failed',
  progress: 40,
  steps: [
    { key: 'queued', label: 'Queued', state: 'completed' },
    { key: 'researching', label: 'Researching company', state: 'failed', message },
  ],
  error: { code: 'OPENAI_RATE_LIMITED', message },
  updatedAt: '2026-09-09T00:00:00.000Z',
});

const runningStatus: KitStatusResult = {
  kitId: 'kit-1',
  status: 'running',
  progress: 40,
  steps: [
    { key: 'queued', label: 'Queued', state: 'completed' },
    { key: 'researching', label: 'Researching company', state: 'running' },
  ],
  updatedAt: '2026-09-09T00:00:00.000Z',
};

const withQueryClient = (element: React.ReactElement) =>
  createElement(QueryClientProvider, { client: new QueryClient() }, element);

describe('failed generation UI', () => {
  it('renders the retry button with the safe backend message', () => {
    const message = 'OpenAI is temporarily rate-limiting requests. Please retry in a moment.';

    const html = renderToStaticMarkup(
      withQueryClient(
        createElement(GenerationProgress, { status: failedStatus(message), kitId: 'kit-1' }),
      ),
    );

    expect(html).toContain('Generation failed');
    expect(html).toContain(message);
    expect(html).toContain('Retry generation');
    expect(html).toContain('Back to interview kits');
    expect(html).not.toContain('disabled=""');
  });

  it('shows only the safe message, never provider internals', () => {
    const html = renderToStaticMarkup(
      withQueryClient(
        createElement(GenerationProgress, {
          status: failedStatus('OpenAI billing quota was exhausted.'),
          kitId: 'kit-1',
        }),
      ),
    );

    expect(html).toContain('OpenAI billing quota was exhausted.');
    expect(html).not.toContain('sk-secret');
    expect(html).not.toContain('insufficient_quota');
  });

  it('disables the retry button with a spinner while retrying', () => {
    const html = renderToStaticMarkup(
      createElement(FailedGenerationState, {
        message: 'OpenAI is temporarily rate-limiting requests. Please retry in a moment.',
        isRetrying: true,
        onRetry: () => undefined,
      }),
    );

    expect(html).toContain('Retrying...');
    expect(html).toContain('disabled=""');
    expect(html).toContain('animate-spin');
    expect(html).not.toContain('Retry generation</');
  });

  it('keeps the retry button enabled when idle', () => {
    const html = renderToStaticMarkup(
      createElement(FailedGenerationState, {
        message: 'Something went wrong while generating this kit.',
        isRetrying: false,
        onRetry: () => undefined,
      }),
    );

    expect(html).toContain('Retry generation');
    expect(html).not.toContain('disabled=""');
    expect(html).not.toContain('Retrying...');
  });
});

describe('generation progress states', () => {
  it('shows progress without a retry action while running', () => {
    const html = renderToStaticMarkup(
      withQueryClient(createElement(GenerationProgress, { status: runningStatus, kitId: 'kit-1' })),
    );

    expect(html).toContain('Generating your kit');
    expect(html).not.toContain('Retry generation');
    expect(html).not.toContain('Generation failed');
  });
});

describe('kit retry service', () => {
  it('posts to the retry endpoint with the idempotency key', async () => {
    const post = vi.fn(async () => ({ kitId: 'kit-1', status: 'queued' }));
    const service = new KitService({ apiClient: { post } as never });

    const result = await service.retryGeneration('kit-1', { idempotencyKey: 'retry-key-1' });

    expect(result).toEqual({ kitId: 'kit-1', status: 'queued' });
    expect(post).toHaveBeenCalledWith('/kits/kit-1/retry', undefined, {
      headers: { 'Idempotency-Key': 'retry-key-1' },
    });
  });
});
