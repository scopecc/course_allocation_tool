import { Draft } from "./draft";

export interface DeleteDraftResponse {
  message: string;
  error?: string;
}

export interface CreateDraftResponse {
  draftId?: string;
  message?: string;
}

export interface GetDraftResponse {
  draft: Draft;
  error?: string;
}
