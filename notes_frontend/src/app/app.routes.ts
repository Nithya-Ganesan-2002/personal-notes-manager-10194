import { Routes } from '@angular/router';
import { NotesListComponent } from './notes/notes-list.component';
import { NoteEditorComponent } from './notes/note-editor.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: NotesListComponent },
  { path: 'new', component: NoteEditorComponent },
  { path: 'edit/:id', component: NoteEditorComponent },
  { path: '**', redirectTo: '' },
];
