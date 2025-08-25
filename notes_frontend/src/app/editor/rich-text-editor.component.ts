import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, afterNextRender } from '@angular/core';
import { getDocument, isBrowser } from '../shared/env';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css'],
})
export class RichTextEditorComponent {
  @Input() placeholder = 'Start writing...';
  @Input() html = '';
  @Output() htmlChange = new EventEmitter<string>();
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  constructor() {
    afterNextRender(() => {
      this.setContent(this.html);
    });
  }

  setContent(html: string): void {
    if (this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.innerHTML = html || '';
    }
  }

  onInput(): void {
    const html = this.editorRef.nativeElement.innerHTML;
    this.htmlChange.emit(html);
  }

  exec(cmd: string, value?: string): void {
    const doc = getDocument();
    if (!doc) return;
    // Using deprecated execCommand for simplicity; acceptable for this lightweight editor
    doc.execCommand(cmd, false, value);
    this.onInput();
  }

  makeLink(): void {
    if (!isBrowser()) return;
    const url = window.prompt('Enter URL');
    if (!url) return;
    this.exec('createLink', url);
  }

  clearFormatting(): void {
    this.exec('removeFormat');
  }
}
