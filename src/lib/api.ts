import axios from "axios";

export const api = axios.create({
  baseURL: "https://whisperbox.koyeb.app/",
});

const REFRESH_TOKEN_KEY = "refreshToken";

let refreshRequest: Promise<string | null> | null = null;

export function saveAuthTokens(accessToken?: string, refreshToken?: string) {
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("user");
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) return null;

  if (!refreshRequest) {
    refreshRequest = axios
      .post("https://whisperbox.koyeb.app/auth/refresh", {
        refresh_token: refreshToken,
      })
      .then((res) => {
        const accessToken = res.data.access_token;
        const newRefreshToken = res.data.refresh_token;

        if (!accessToken) return null;

        saveAuthTokens(accessToken, newRefreshToken);
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

function isAuthRoute(url?: string) {
  return url?.includes("/auth/login") ||
    url?.includes("/auth/register") ||
    url?.includes("/auth/refresh");
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthRoute(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const accessToken = await refreshAccessToken();

    if (!accessToken) {
      clearAuthTokens();
      window.location.assign("/login");
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
  }
);
