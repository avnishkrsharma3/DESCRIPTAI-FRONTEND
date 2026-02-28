import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { debounce } from '@angular/forms/signals';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-description-generate',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './description-generate.html',
  styleUrl: './description-generate.css',
})
export class DescriptionGenerate {

  products: number[] = [];
  tones = ['Professional', 'Casual', 'Persuasive'];
  focusOptions = ['Seo', 'Conversion', 'Infomative'];
  lengths = ['Short', 'Medium', 'Long'];
  size: number = 0;
  form!: FormGroup;
  preview!: string;
  isTyping: boolean = false;

  ngOnInit(): void {
    const state = history.state;
    console.log("logging state");
    // console.log(state.productIds.length);
    if (state == null || state.productIds == null || state.productIds.length === 0)
      return
    this.products = state.productIds;
    this.form = this.fb.group({
      tone: ['Professional', Validators.required],
      length: ['Medium', Validators.required],
      focus: ['Seo', Validators.required]
    });
    this.generatePreview();
    this.form.valueChanges.pipe(debounceTime(0)).subscribe(() => {
      this.generatePreview();
    });
  }

  constructor(private fb: FormBuilder) {

  }

  onGenerate() {
    console.log(this.products[0])
    console.log(this.form.value);
  }


  // product id 2 description will get generated based on tone Professional , length medium and focus seo.
  generatePreview() {
    if (!this.products.length) return;

    const { tone, length, focus } = this.form.value;

    const fullText =
      "Product id " +
      this.products[0] +
      " description will get generated based on tone " +
      tone +
      ", length " +
      length +
      " and focus " +
      focus + ".";

    this.simulateTyping(fullText);
  }

  simulateTyping(text: string) {
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
