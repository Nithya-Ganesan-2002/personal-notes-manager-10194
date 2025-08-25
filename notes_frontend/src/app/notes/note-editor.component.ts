import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { Note } from '../models/note.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RichTextEditorComponent } from '../editor/rich-text-editor.component';
import { isBrowser } from '../shared/env';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RichTextEditorComponent],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css'],
})
export class NoteEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  storage = inject(StorageService);

  note = signal<Note | null>(null);
  title = signal<string>('');
  html = signal<string>('');
  selectedTagIds = signal<string[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const n = this.storage.notes().find(x => x.id === id) || null;
      if (!n) {
        // If note not found navigate home
        this.router.navigateByUrl('/');
        return;
      }
      this.note.set(n);
      this.title.set(n.title);
      this.html.set(n.contentHtml);
      this.selectedTagIds.set([...n.tags]);
    } else {
      // new note draft
      this.note.set(null);
      this.title.set('New note');
      this.html.set('');
      this.selectedTagIds.set([]);
    }
  }

  createOrSave(): void {
    const payload = {
      title: this.title().trim() || 'Untitled',
      contentHtml: this.html(),
      tags: this.selectedTagIds(),
    };
    if (!this.note()) {
      const n = this.storage.createNote(payload);
      this.note.set(n);
      this.router.navigate(['/edit', n.id]);
    } else {
      const n = this.storage.updateNote(this.note()!.id, payload);
      if (n) this.note.set(n);
    }
  }

  deleteNote(): void {
    if (!this.note()) return;
    let ok = true;
    if (isBrowser()) {
      ok = window.confirm('Delete this note?');
    }
    if (!ok) return;
    this.storage.deleteNote(this.note()!.id);
    this.router.navigateByUrl('/');
  }

  toggleTag(tagId: string): void {
    const set = new Set(this.selectedTagIds());
    if (set.has(tagId)) set.delete(tagId);
    else set.add(tagId);
    this.selectedTagIds.set(Array.from(set));
  }

  addTag(): void {
    let name: string | null = 'New Tag';
    if (isBrowser()) {
      name = window.prompt('Tag name') ?? null;
    }
    if (!name) return;
    const t = this.storage.createTag(name);
    this.toggleTag(t.id);
  }
}
