export interface Note {
  id: string;
  userId: string;
  title: string;
  contentJson: object;
  isPublic: boolean;
  publicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteSummary {
  id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicNote {
  id: string;
  title: string;
  contentJson: object;
}

export interface CreateNoteInput {
  userId: string;
  title: string;
  contentJson: object;
}

export interface UpdateNoteInput {
  noteId: string;
  userId: string;
  title?: string;
  contentJson?: object;
}
