/**
 * Domain models for the notes app.
 */

export type NoteId = string;

/**
 * Tag model used to categorize notes.
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
}

/**
 * Note model capturing content and metadata.
 */
export interface Note {
  id: NoteId;
  title: string;
  contentHtml: string; // Rich text (HTML) stored
  tags: string[]; // Tag ids
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  favorite?: boolean;
}
