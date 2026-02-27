import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-description-generate',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './description-generate.html',
  styleUrl: './description-generate.css',
})
export class DescriptionGenerate {

  products: number[] = [];
  tones = ['professional', 'casual', 'persuasive'];
  focusOptions = ['seo', 'conversion', 'infomative'];
  lengths = ['short', 'medium', 'long'];
  size: number = 0;
  form!: FormGroup;

  ngOnInit(): void {
    const state = history.state;
    console.log("logging state");
    // console.log(state.productIds.length);
    if (state == null || state.productIds == null || state.productIds.length === 0)
      return
    this.products = state.productIds;
    this.form = this.fb.group({
      tone: ['professional', Validators.required],
      length: ['medium', Validators.required],
      focus: ['seo', Validators.required]
    });
  }

  constructor(private fb: FormBuilder) {

  }

  onGenerate() {
    console.log(this.form.value);
  }

}
