import { API_ENDPOINTS } from '@/constants';
import type { ApiClientService } from '@/services/http/api-client.service';
import type {
  AuthResult,
  CurrentUserResult,
  LoginInput,
  LogoutResult,
  RegisterInput,
} from '@/types/auth/auth.type';

type AuthServiceDependencies = {
  apiClient: ApiClientService;
};

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  register(input: RegisterInput): Promise<AuthResult> {
    return this.dependencies.apiClient.post<AuthResult, RegisterInput>(
      API_ENDPOINTS.auth.register,
      input,
    );
  }

  login(input: LoginInput): Promise<AuthResult> {
    return this.dependencies.apiClient.post<AuthResult, LoginInput>(
      API_ENDPOINTS.auth.login,
      input,
    );
  }

  logout(): Promise<LogoutResult> {
    return this.dependencies.apiClient.post<LogoutResult>(API_ENDPOINTS.auth.logout);
  }

  me(): Promise<CurrentUserResult> {
    return this.dependencies.apiClient.get<CurrentUserResult>(API_ENDPOINTS.auth.me);
  }
}
