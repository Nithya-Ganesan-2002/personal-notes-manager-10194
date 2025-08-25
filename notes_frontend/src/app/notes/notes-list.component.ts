import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
})
export class NotesListComponent {
  storage = inject(StorageService);
  router = inject(Router);

  createNote(): void {
    const n = this.storage.createNote({ title: 'New note', contentHtml: '', tags: [] });
    this.router.navigate(['/edit', n.id]);
  }

  tagName(id: string): string {
    const t = this.storage.tags().find(x => x.id === id);
    return t?.name ?? 'Tag';
  }
}
