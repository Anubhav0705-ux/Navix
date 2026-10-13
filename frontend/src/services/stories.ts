import { getApi } from './api';

export interface StoryItem {
  id: string;
  slug: string;
  title: string;
  destination_slug: string;
  destination_name: string;
  category: string;
  summary: string;
  body: string;
  author: string;
  read_time: string;
  hero_image: string;
  data_state: string;
}

export interface StoryListResponse {
  total: number;
  page: number;
  limit: number;
  items: StoryItem[];
}

export async function getStories(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<StoryListResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit || 32));

  const qs = query.toString();
  return getApi<StoryListResponse>(`/api/v1/stories${qs ? `?${qs}` : ''}`);
}

export async function getStoryDetail(slug: string): Promise<StoryItem> {
  return getApi<StoryItem>(`/api/v1/stories/${encodeURIComponent(slug)}`);
}
