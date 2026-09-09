'use client';

import { type FC, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  Layers3,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SectionCard from '@/components/ui/section-card';
import Textarea from '@/components/ui/textarea';
import {
  useAddFlashcard,
  useAddQuestion,
  useDeleteFlashcard,
  useDeleteQuestion,
  useRegenerateKitSection,
  useReorderQuestions,
  useUpdateBrief,
  useUpdateFlashcard,
  useUpdateQuestion,
} from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';
import type {
  InterviewKit,
  KitFlashcard,
  KitQuestion,
  QuestionCategory,
  QuestionDifficulty,
} from '@/types/kits/kit.type';

type KitBuilderProps = {
  kitId: string;
  kit: InterviewKit;
};

const CATEGORIES: QuestionCategory[] = ['technical', 'behavioural', 'system-design', 'company-fit'];

const categoryLabel = (category: QuestionCategory): string =>
  category === 'system-design' ? 'System Design' : category[0]?.toUpperCase() + category.slice(1);

const hostnameOf = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const requirementTextById = (kit: InterviewKit): Map<string, string> =>
  new Map(kit.role.requirements.map((requirement) => [requirement.id, requirement.text]));

type QuestionEditorProps = {
  kitId: string;
  question: KitQuestion;
  questionIds: string[];
};

const QuestionEditor: FC<QuestionEditorProps> = ({ kitId, question, questionIds }) => {
  const [prompt, setPrompt] = useState(question.prompt);
  const [outline, setOutline] = useState(question.answer_outline);
  const [category, setCategory] = useState<QuestionCategory>(question.category);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(question.difficulty);
  const updateQuestion = useUpdateQuestion(kitId, question.id);
  const deleteQuestion = useDeleteQuestion(kitId);
  const reorderQuestions = useReorderQuestions(kitId);
  const busy = updateQuestion.isPending || deleteQuestion.isPending || reorderQuestions.isPending;

  const dirty =
    prompt !== question.prompt ||
    outline !== question.answer_outline ||
    category !== question.category ||
    difficulty !== question.difficulty;

  const save = async (): Promise<void> => {
    try {
      await updateQuestion.mutateAsync({
        prompt,
        answer_outline: outline,
        category,
        difficulty,
      });
      toast.success('Question saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const move = async (direction: -1 | 1): Promise<void> => {
    const from = questionIds.indexOf(question.id);
    const to = from + direction;

    if (from < 0 || to < 0 || to >= questionIds.length) {
      return;
    }

    const next = [...questionIds];
    const moved = next.splice(from, 1)[0] as string;
    next.splice(to, 0, moved);

    try {
      await reorderQuestions.mutateAsync({ questionIds: next });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (): Promise<void> => {
    try {
      await deleteQuestion.mutateAsync(question.id);
      toast.success('Question deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="gap-0 py-4">
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabel(question.category)}</Badge>
          <Badge variant="outline">Difficulty {question.difficulty}</Badge>
          <span className="text-xs text-muted-foreground">{question.id}</span>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`prompt-${question.id}`}>Prompt</Label>
          <Textarea
            id={`prompt-${question.id}`}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`outline-${question.id}`}>Answer outline</Label>
          <Textarea
            id={`outline-${question.id}`}
            value={outline}
            onChange={(event) => setOutline(event.target.value)}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`category-${question.id}`}>Category</Label>
            <select
              id={`category-${question.id}`}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value as QuestionCategory)}
            >
              {CATEGORIES.map((entry) => (
                <option key={entry} value={entry}>
                  {categoryLabel(entry)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`difficulty-${question.id}`}>Difficulty</Label>
            <select
              id={`difficulty-${question.id}`}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value) as QuestionDifficulty)}
            >
              {([1, 2, 3] as const).map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" disabled={!dirty || busy} onClick={() => void save()}>
            {updateQuestion.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {updateQuestion.isPending ? 'Saving...' : 'Save'}
          </Button>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              disabled={busy}
              title="Move up"
              aria-label={`Move question ${question.id} up`}
              onClick={() => void move(-1)}
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              disabled={busy}
              title="Move down"
              aria-label={`Move question ${question.id} down`}
              onClick={() => void move(1)}
            >
              <ArrowDown className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="size-8"
              disabled={busy}
              title="Delete question"
              aria-label={`Delete question ${question.id}`}
              onClick={() => void remove()}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type FlashcardEditorProps = {
  kitId: string;
  flashcard: KitFlashcard;
  requirementTextByIdProp: Map<string, string>;
};

const FlashcardEditor: FC<FlashcardEditorProps> = ({
  kitId,
  flashcard,
  requirementTextByIdProp,
}) => {
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [editing, setEditing] = useState(false);
  const updateFlashcard = useUpdateFlashcard(kitId, flashcard.id);
  const deleteFlashcard = useDeleteFlashcard(kitId);
  const busy = updateFlashcard.isPending || deleteFlashcard.isPending;

  const dirty = front !== flashcard.front || back !== flashcard.back;

  const save = async (): Promise<void> => {
    try {
      await updateFlashcard.mutateAsync({ front, back });
      setEditing(false);
      toast.success('Flashcard saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (): Promise<void> => {
    try {
      await deleteFlashcard.mutateAsync(flashcard.id);
      toast.success('Flashcard deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="gap-0 py-4">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-muted-foreground">{flashcard.id}</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8"
              disabled={busy}
              title="Edit flashcard"
              aria-label={`Edit flashcard ${flashcard.id}`}
              onClick={() => setEditing((value) => !value)}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 text-destructive hover:text-destructive"
              disabled={busy}
              title="Delete flashcard"
              aria-label={`Delete flashcard ${flashcard.id}`}
              onClick={() => void remove()}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`front-${flashcard.id}`}>Front</Label>
              <Textarea
                id={`front-${flashcard.id}`}
                value={front}
                onChange={(event) => setFront(event.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`back-${flashcard.id}`}>Back</Label>
              <Textarea
                id={`back-${flashcard.id}`}
                value={back}
                onChange={(event) => setBack(event.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={!dirty || busy} onClick={() => void save()}>
                {updateFlashcard.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {updateFlashcard.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setFront(flashcard.front);
                  setBack(flashcard.back);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed font-medium">{flashcard.front}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{flashcard.back}</p>
            {flashcard.requirement_ids.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {flashcard.requirement_ids.map((id) => (
                  <Badge key={id} variant="outline" title={requirementTextByIdProp.get(id) ?? id}>
                    {id}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const KitBuilder: FC<KitBuilderProps> = ({ kitId, kit }) => {
  const regenerate = useRegenerateKitSection(kitId);
  const updateBrief = useUpdateBrief(kitId);
  const addQuestion = useAddQuestion(kitId);
  const addFlashcard = useAddFlashcard(kitId);

  const [briefDraft, setBriefDraft] = useState({
    summary: kit.company_brief.summary,
    whatTheyDo: kit.company_brief.what_they_do,
    base: kit.company_brief,
  });

  // Remote brief changes (e.g. after regeneration) flow into the editor, but
  // an active unsaved local edit is never overwritten. Render-time adjustment
  // (not an effect): untouched drafts adopt the new remote text.
  if (briefDraft.base !== kit.company_brief) {
    const untouched =
      briefDraft.summary === briefDraft.base.summary &&
      briefDraft.whatTheyDo === briefDraft.base.what_they_do;

    setBriefDraft(
      untouched
        ? {
            summary: kit.company_brief.summary,
            whatTheyDo: kit.company_brief.what_they_do,
            base: kit.company_brief,
          }
        : { ...briefDraft, base: kit.company_brief },
    );
  }

  const summary = briefDraft.summary;
  const whatTheyDo = briefDraft.whatTheyDo;
  const setSummary = (value: string): void =>
    setBriefDraft((draft) => ({ ...draft, summary: value }));
  const setWhatTheyDo = (value: string): void =>
    setBriefDraft((draft) => ({ ...draft, whatTheyDo: value }));
  const [newPrompt, setNewPrompt] = useState('');
  const [newOutline, setNewOutline] = useState('');
  const [newCategory, setNewCategory] = useState<QuestionCategory>('technical');
  const [newRequirementId, setNewRequirementId] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);

  const questionIds = kit.questions.map((question) => question.id);
  const requirementTexts = requirementTextById(kit);
  const briefDirty =
    summary !== kit.company_brief.summary || whatTheyDo !== kit.company_brief.what_they_do;

  const runRegenerate = async (
    input: Parameters<typeof regenerate.mutateAsync>[0],
    label: string,
  ): Promise<void> => {
    try {
      await regenerate.mutateAsync(input);
      toast.success(`${label} regenerated — your manual edits were preserved`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const saveBrief = async (): Promise<void> => {
    try {
      await updateBrief.mutateAsync({ summary, what_they_do: whatTheyDo });
      setBriefDraft({ summary, whatTheyDo, base: kit.company_brief });
      toast.success('Company brief saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const createQuestion = async (): Promise<void> => {
    if (!newPrompt.trim() || !newOutline.trim()) {
      toast.error('Prompt and answer outline are required');
      return;
    }

    try {
      await addQuestion.mutateAsync({
        prompt: newPrompt.trim(),
        answer_outline: newOutline.trim(),
        category: newCategory,
        ...(newRequirementId ? { requirement_ids: [newRequirementId] } : { requirement_ids: [] }),
      });
      setNewPrompt('');
      setNewOutline('');
      setShowQuestionForm(false);
      toast.success('Question added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const createFlashcard = async (): Promise<void> => {
    if (!newFront.trim() || !newBack.trim()) {
      toast.error('Front and back are required');
      return;
    }

    try {
      await addFlashcard.mutateAsync({ front: newFront.trim(), back: newBack.trim() });
      setNewFront('');
      setNewBack('');
      setShowFlashcardForm(false);
      toast.success('Flashcard added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const regenLabel = regenerate.isPending ? 'Regenerating...' : 'Regenerate';

  return (
    <div className="space-y-5">
      <SectionCard
        icon={Building2}
        title="Company brief"
        description="Edit the wording or regenerate it from fresh research."
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={regenerate.isPending}
            onClick={() => void runRegenerate({ section: 'company_brief' }, 'Company brief')}
          >
            {regenerate.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {regenerate.isPending ? 'Regenerating...' : 'Regenerate brief'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="brief-summary">Summary</Label>
            <Textarea
              id="brief-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
            />
          </div>
          <div className="rounded-lg bg-muted p-4">
            <Label htmlFor="brief-what">What they do</Label>
            <Textarea
              id="brief-what"
              className="mt-1.5"
              value={whatTheyDo}
              onChange={(event) => setWhatTheyDo(event.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!briefDirty || updateBrief.isPending}
              onClick={() => void saveBrief()}
            >
              {updateBrief.isPending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {updateBrief.isPending ? 'Saving...' : 'Save brief'}
            </Button>
            {kit.company_brief.sources.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {kit.company_brief.sources.slice(0, 4).map((source) => (
                  <a
                    key={source}
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <ExternalLink className="size-3" aria-hidden="true" />
                    {hostnameOf(source)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="questions"
        icon={MessageSquareText}
        title="Questions"
        description="Your manually edited or added questions are preserved across regenerations."
      >
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const group = kit.questions.filter((question) => question.category === category);

            return (
              <div key={category} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {categoryLabel(category)}{' '}
                    <span className="font-normal text-muted-foreground">({group.length})</span>
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={regenerate.isPending}
                    onClick={() =>
                      void runRegenerate(
                        { section: 'questions', category },
                        categoryLabel(category),
                      )
                    }
                  >
                    {regenerate.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="size-4" aria-hidden="true" />
                    )}
                    {regenLabel} {categoryLabel(category)}
                  </Button>
                </div>
                {group.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No {categoryLabel(category).toLowerCase()} questions in this kit.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {group.map((question) => (
                      <QuestionEditor
                        key={question.id}
                        kitId={kitId}
                        question={question}
                        questionIds={questionIds}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {showQuestionForm ? (
            <Card className="gap-0 border-dashed py-4">
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-prompt">Prompt</Label>
                  <Textarea
                    id="new-prompt"
                    value={newPrompt}
                    onChange={(event) => setNewPrompt(event.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-outline">Answer outline</Label>
                  <Textarea
                    id="new-outline"
                    value={newOutline}
                    onChange={(event) => setNewOutline(event.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-category">Category</Label>
                    <select
                      id="new-category"
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value as QuestionCategory)}
                    >
                      {CATEGORIES.map((entry) => (
                        <option key={entry} value={entry}>
                          {categoryLabel(entry)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-requirement">Related requirement</Label>
                    <select
                      id="new-requirement"
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      value={newRequirementId}
                      onChange={(event) => setNewRequirementId(event.target.value)}
                    >
                      <option value="">
                        {kit.role.requirements.length === 0
                          ? 'No requirements in this kit'
                          : 'None (manual question)'}
                      </option>
                      {kit.role.requirements.map((requirement) => (
                        <option key={requirement.id} value={requirement.id}>
                          {requirement.id} · {requirement.text.slice(0, 80)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={addQuestion.isPending}
                    onClick={() => void createQuestion()}
                  >
                    {addQuestion.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus className="size-4" aria-hidden="true" />
                    )}
                    {addQuestion.isPending ? 'Adding...' : 'Add question'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQuestionForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowQuestionForm(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add question
            </Button>
          )}
        </div>
      </SectionCard>

      <SectionCard
        id="flashcards"
        icon={Layers3}
        title="Flashcards"
        description={`${kit.flashcards.length} card${kit.flashcards.length === 1 ? '' : 's'} for active recall.`}
      >
        <div className="space-y-3">
          {kit.flashcards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No flashcards in this kit yet — add one manually below.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {kit.flashcards.map((flashcard) => (
                <FlashcardEditor
                  key={flashcard.id}
                  kitId={kitId}
                  flashcard={flashcard}
                  requirementTextByIdProp={requirementTexts}
                />
              ))}
            </div>
          )}
          {showFlashcardForm ? (
            <Card className="gap-0 border-dashed py-4">
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-front">Front</Label>
                    <Input
                      id="new-front"
                      value={newFront}
                      onChange={(event) => setNewFront(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-back">Back</Label>
                    <Input
                      id="new-back"
                      value={newBack}
                      onChange={(event) => setNewBack(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={addFlashcard.isPending}
                    onClick={() => void createFlashcard()}
                  >
                    {addFlashcard.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus className="size-4" aria-hidden="true" />
                    )}
                    {addFlashcard.isPending ? 'Adding...' : 'Add flashcard'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFlashcardForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowFlashcardForm(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add flashcard
            </Button>
          )}
        </div>
      </SectionCard>

      <SectionCard
        id="schedule"
        icon={CalendarDays}
        title="Study schedule"
        description={`${kit.schedule.days_available} day${kit.schedule.days_available === 1 ? '' : 's'} · rebuilt deterministically after every edit.`}
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={regenerate.isPending}
            onClick={() => void runRegenerate({ section: 'schedule' }, 'Schedule')}
          >
            {regenerate.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {regenerate.isPending ? 'Regenerating...' : 'Regenerate schedule'}
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {kit.schedule.days.map((day) => (
            <Card key={day.day} className="gap-0 py-4">
              <CardContent>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Day {day.day}
                </p>
                <p className="mt-1 text-sm font-medium">{day.focus}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  {day.minutes} min · {day.question_ids.length} question
                  {day.question_ids.length === 1 ? '' : 's'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default KitBuilder;
