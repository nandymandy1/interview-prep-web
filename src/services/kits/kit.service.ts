import { API_ENDPOINTS } from '@/constants';
import type { ApiClientService } from '@/services/http/api-client.service';
import type {
  CreateKitInput,
  CreateKitResult,
  InterviewKit,
  KitDetailResult,
  KitStatusResult,
  KitSummary,
  RecordPracticeInput,
  RegenerateSectionInput,
  ReorderQuestionsInput,
  UpdateQuestionInput,
} from '@/types/kits/kit.type';

type KitServiceDependencies = {
  apiClient: ApiClientService;
};

export class KitService {
  constructor(private readonly dependencies: KitServiceDependencies) {}

  list(): Promise<KitSummary[]> {
    return this.dependencies.apiClient.get<KitSummary[]>(API_ENDPOINTS.kits.root);
  }

  create(input: CreateKitInput): Promise<CreateKitResult> {
    return this.dependencies.apiClient.post<CreateKitResult, CreateKitInput>(
      API_ENDPOINTS.kits.root,
      input,
    );
  }

  getById(kitId: string): Promise<KitDetailResult> {
    return this.dependencies.apiClient.get<KitDetailResult>(API_ENDPOINTS.kits.byId(kitId));
  }

  getStatus(kitId: string): Promise<KitStatusResult> {
    return this.dependencies.apiClient.get<KitStatusResult>(API_ENDPOINTS.kits.status(kitId));
  }

  regenerate(kitId: string, input: RegenerateSectionInput): Promise<InterviewKit> {
    return this.dependencies.apiClient.post<InterviewKit, RegenerateSectionInput>(
      API_ENDPOINTS.kits.regenerate(kitId),
      input,
    );
  }

  updateQuestion(
    kitId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<InterviewKit> {
    return this.dependencies.apiClient.patch<InterviewKit, UpdateQuestionInput>(
      API_ENDPOINTS.kits.question(kitId, questionId),
      input,
    );
  }

  reorderQuestions(kitId: string, input: ReorderQuestionsInput): Promise<InterviewKit> {
    return this.dependencies.apiClient.post<InterviewKit, ReorderQuestionsInput>(
      API_ENDPOINTS.kits.reorderQuestions(kitId),
      input,
    );
  }

  deleteQuestion(kitId: string, questionId: string): Promise<InterviewKit> {
    return this.dependencies.apiClient.delete<InterviewKit>(
      API_ENDPOINTS.kits.question(kitId, questionId),
    );
  }

  recordPractice(
    kitId: string,
    flashcardId: string,
    input: RecordPracticeInput,
  ): Promise<{ recorded: true }> {
    return this.dependencies.apiClient.patch<{ recorded: true }, RecordPracticeInput>(
      API_ENDPOINTS.kits.practice(kitId, flashcardId),
      input,
    );
  }
}
