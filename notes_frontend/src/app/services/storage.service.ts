import { Injectable, signal } from '@angular/core';
import { Note, Tag, NoteId } from '../models/note.model';
import { getLocalStorage } from '../shared/env';

const STORAGE_KEYS = {
  notes: 'pnm_notes_v1',
  tags: 'pnm_tags_v1',
  lastId: 'pnm_last_id_v1'
};

function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix = 'n'): string {
  const ls = getLocalStorage();
  const current = Number(ls?.getItem(STORAGE_KEYS.lastId) || '0') + 1;
  ls?.setItem(STORAGE_KEYS.lastId, String(current));
  return `${prefix}_${current.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Simple localStorage-backed repository for Notes and Tags.
 * In future this can be replaced by HTTP API calls while keeping the same interface.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  // Reactive state signals
  readonly notes = signal<Note[]>([]);
  readonly tags = signal<Tag[]>([]);
  readonly activeTagIds = signal<string[]>([]);
  readonly searchQuery = signal<string>('');

  constructor() {
    this.load();
    // Seed with a sample note if empty
    if (this.notes().length === 0) {
      const t1 = this.createTag('Personal');
      const t2 = this.createTag('Ideas');
      this.createNote({
        title: 'Welcome to Personal Notes',
        contentHtml:
          `<p>Use the editor to write rich text notes.</p>
           <ul><li>Format text</li><li>Add tags</li><li>Search notes</li></ul>`,
        tags: [t1.id, t2.id],
      });
    }
  }

  private load(): void {
    try {
      const ls = getLocalStorage();
      const notes = JSON.parse(ls?.getItem(STORAGE_KEYS.notes) || '[]') as Note[];
      const tags = JSON.parse(ls?.getItem(STORAGE_KEYS.tags) || '[]') as Tag[];
      this.notes.set(notes);
      this.tags.set(tags);
    } catch {
      this.notes.set([]);
      this.tags.set([]);
    }
  }

  private persist(): void {
    const ls = getLocalStorage();
    ls?.setItem(STORAGE_KEYS.notes, JSON.stringify(this.notes()));
    ls?.setItem(STORAGE_KEYS.tags, JSON.stringify(this.tags()));
  }

  /**
   * PUBLIC_INTERFACE
   * Add a new note.
   */
  createNote(data: { title: string; contentHtml: string; tags: string[]; favorite?: boolean }): Note {
    const n: Note = {
      id: genId('note'),
      title: data.title || 'Untitled',
      contentHtml: data.contentHtml || '',
      tags: data.tags || [],
      favorite: !!data.favorite,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this.notes.update(list => [n, ...list]);
    this.persist();
    return n;
  }

  /**
   * PUBLIC_INTERFACE
   * Update an existing note by id.
   */
  updateNote(id: NoteId, patch: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | undefined {
    let updated: Note | undefined;
    this.notes.update(list =>
      list.map(n => {
        if (n.id !== id) return n;
        updated = { ...n, ...patch, updatedAt: nowIso() };
        return updated;
      })
    );
    if (updated) this.persist();
    return updated;
  }

  /**
   * PUBLIC_INTERFACE
   * Delete a note by id.
   */
  deleteNote(id: NoteId): void {
    this.notes.update(list => list.filter(n => n.id !== id));
    this.persist();
  }

  /**
   * PUBLIC_INTERFACE
   * Create a tag.
   */
  createTag(name: string, color?: string): Tag {
    const t: Tag = { id: genId('tag'), name, color };
    this.tags.update(list => [...list, t]);
    this.persist();
    return t;
  }

  /**
   * PUBLIC_INTERFACE
   * Delete a tag and remove it from all notes.
   */
  deleteTag(tagId: string): void {
    this.tags.update(list => list.filter(t => t.id !== tagId));
    this.notes.update(list => list.map(n => ({ ...n, tags: n.tags.filter(t => t !== tagId) })));
    this.persist();
  }

  /**
   * PUBLIC_INTERFACE
   * Toggle a tag as active for filtering.
   */
  toggleActiveTag(tagId: string): void {
    const current = new Set(this.activeTagIds());
    if (current.has(tagId)) {
      current.delete(tagId);
    } else {
      current.add(tagId);
    }
    this.activeTagIds.set(Array.from(current));
  }

  /**
   * PUBLIC_INTERFACE
   * Set search query.
   */
  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * PUBLIC_INTERFACE
   * Get filtered notes based on active tag ids and search query.
   */
  getFilteredNotes(): Note[] {
    const q = this.searchQuery().trim().toLowerCase();
    const active = new Set(this.activeTagIds());
    return this.notes().filter(n => {
      const matchesQuery = q.length === 0
        || n.title.toLowerCase().includes(q)
        || n.contentHtml.toLowerCase().includes(q);
      const matchesTags = active.size === 0 || n.tags.some(t => active.has(t));
      return matchesQuery && matchesTags;
    });
  }
}
