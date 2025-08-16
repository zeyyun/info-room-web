// src/app/core/models/post.models.ts

// ====== Audience ======
export type Audience = 'ALL_STUDENTS' | 'CLASSES';

// ====== Meta models (used by MetaService & post-create) ======
export interface Campus {
  id: number;
  name: string;      // e.g. "Main", "Tunguu"
  code?: string;     // optional
}

export interface ClassItem {
  id: number;
  code: string;      // e.g. "BITA", "DITA"
  name?: string;     // optional
  campusId?: number; // optional helper
}

// ====== Posts ======
export interface CreatePostDto {
  audienceType: Audience;
  /** Single class selection when audienceType === 'CLASSES' */
  classId?: number;
  text: string;
  link?: string;
}

export interface PostItem {
  id: number;
  text: string;
  link?: string | null;
  imagePath?: string | null;
  authorEmail: string;
  authorName?: string | null;
  createdAt: string;

  // Metadata from backend (optional if backend not sending yet)
  audienceType?: Audience;
  classId?: number | null;
}
