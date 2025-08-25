import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
})
export class AppLayoutComponent {
  // Responsive sidebar state
  sidebarOpen = signal(true);

  // Derived count for header
  noteCount = computed(() => this.storage.getFilteredNotes().length);

  constructor(public storage: StorageService) {}

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
