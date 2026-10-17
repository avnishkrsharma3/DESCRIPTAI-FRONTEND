import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-description-generate',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './description-generate.html',
  styleUrl: './description-generate.css',
})
export class DescriptionGenerate implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly router = inject(Router, { optional: true });

  products: number[] = [];
  tones = ['Professional', 'Casual', 'Persuasive'];
  focusOptions = ['Seo', 'Conversion', 'Infomative'];
  lengths = ['Short', 'Medium', 'Long'];
  size = 0;
  form!: FormGroup;
  preview = '';
  isTyping = false;
  prompts = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      tone: ['Professional', Validators.required],
      length: ['Short', Validators.required],
      focus: ['Seo', Validators.required],
    });

    const queryIds = this.route?.snapshot.queryParamMap.get('productIds');
    const state = history.state as { productIds?: unknown };
    const rawIds = queryIds ?? state?.productIds;
    this.products = (Array.isArray(rawIds) ? rawIds : String(rawIds ?? '').split(','))
      .map((id) => Number(id))
      .filter((id) => Number.isSafeInteger(id) && id > 0);

    if (this.products.length === 0) {
      return;
    }

    this.generatePreview();
    this.form.valueChanges.pipe(debounceTime(0)).subscribe(() => {
      this.generatePreview();
    });
  }

  onGenerate(): void {
    const { tone, length, focus } = this.form.value;
    this.prompts = `${tone},${length},${focus}`;

    if (!this.router) {
      return;
    }

    this.router.navigate(['/description-generation'], {
      queryParams: {
        prompts: this.prompts,
        productIds: this.products.join(','),
      },
    });
  }

  generatePreview(): void {
    if (!this.products.length) {
      return;
    }

    const { tone, length, focus } = this.form.value;
    const fullText = `Product id ${this.products[0]} description will get generated based on tone ${tone}, length ${length} and focus ${focus}.`;
    this.simulateTyping(fullText);
  }

  simulateTyping(text: string): void {
    this.preview = '';
    this.isTyping = true;

    let index = 0;

    const interval = setInterval(() => {
      this.preview += text[index];
      index++;

      if (index >= text.length) {
        clearInterval(interval);
        this.isTyping = false;
      }
    }, 10);
  }
}
