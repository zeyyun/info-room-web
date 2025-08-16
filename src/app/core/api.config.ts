export const API_BASE = 'http://localhost:9090/api';

export const ENDPOINTS = {
  posts: `${API_BASE}/posts`,
  myPosts: `${API_BASE}/posts/mine`,
  campuses: `${API_BASE}/meta/campuses`,
  classes: (campusId: number | string) => `${API_BASE}/meta/campuses/${campusId}/classes`,
};
