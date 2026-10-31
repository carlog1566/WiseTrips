export interface ApiClientInterface {
  get<T>(endpoint: string): Promise<T | null>;
  post<T, B = unknown>(endpoint: string, body: B): Promise<T | null>;
  put<T, B = unknown>(endpoint: string, body: B): Promise<T | null>;
  delete<T>(endpoint: string): Promise<T | null>;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly details: string,
  ) {
    super(`Request failed (${status})`);
    this.name = "ApiError";
  }
}

class ApiClient implements ApiClientInterface {
  private readonly apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

  // endpoint should be in format of: '/api/trips/generate'
  // should start with '/'
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: unknown,
  ): Promise<T | null> {
    if (!this.apiBaseUrl) {
      throw new Error("API URL is not configured.");
    }

    if (!endpoint.startsWith("/") || endpoint.startsWith("//")) {
      throw new Error("Endpoint path must start with '/'.");
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new ApiClientError(response.status, text);
    }

    if (!text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiClientError(
        response.status,
        "The server returned an invalid response.",
      );
    }
  }

  get<T>(endpoint: string): Promise<T | null> {
    return this.request<T>("GET", endpoint);
  }

  post<T, B = unknown>(endpoint: string, body: B): Promise<T | null> {
    return this.request<T>("POST", endpoint, body);
  }

  put<T, B = unknown>(endpoint: string, body: B): Promise<T | null> {
    return this.request<T>("PUT", endpoint, body);
  }

  delete<T>(endpoint: string): Promise<T | null> {
    return this.request<T>("DELETE", endpoint);
  }
}

export const apiClient = new ApiClient();