import { apiUrl } from '@/lib/http';

/**
 * Fire-and-forget request that wakes a sleeping API host (free hosting tiers spin down
 * when idle) while the user is still on the first screen, so their first real action
 * isn't the slow one.
 */
export const warmUpApi = () => {
  fetch(apiUrl('/health')).catch(() => undefined);
};
