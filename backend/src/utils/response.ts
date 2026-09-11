// =============================================================
// RouteWise — Consistent API Response Helpers
// =============================================================

/** Standard success response shape */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

/** Standard error response shape */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Build a success response body */
export function successResponse<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return response;
}

/** Build an error response body */
export function errorResponse(message: string, code?: string): ApiErrorResponse {
  return {
    success: false,
    error: { message, ...(code ? { code } : {}) },
  };
}
