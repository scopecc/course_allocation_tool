export interface DeleteDraftResponse {
  message: string;
  error?: string;
}

export interface CreateDraftResponse {
  draftId?: string;
  message?: string;
}
