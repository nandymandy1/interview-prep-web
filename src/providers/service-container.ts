import { singleton, type Provider } from '@/providers/provider';
import { AuthService } from '@/services/auth/auth.service';
import { createApiClientService, type ApiClientService } from '@/services/http/api-client.service';
import { KitService } from '@/services/kits/kit.service';

export type ServiceContainer = {
  apiClient: Provider<ApiClientService>;
  authService: Provider<AuthService>;
  kitService: Provider<KitService>;
};

const createServiceContainer = (): ServiceContainer => {
  const apiClient = singleton(() => createApiClientService());
  const authService = singleton(() => new AuthService({ apiClient: apiClient() }));
  const kitService = singleton(() => new KitService({ apiClient: apiClient() }));

  return {
    apiClient,
    authService,
    kitService,
  };
};

export const serviceContainer = createServiceContainer();
