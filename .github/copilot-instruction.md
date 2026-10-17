# GitHub Copilot Instructions for Angular Frontend

You are an expert Angular and TypeScript software engineer. Follow these architectural standards, coding conventions, and best practices strictly when generating or refactoring code for this project.

---

## 1. Core Architecture & Tech Stack

* **Angular Version:** Latest (Standalone Components, no `NgModule` unless strictly required for legacy integration).
* **State Management:** Angular Signals (`signal()`, `computed()`, `effect()`) and RxJS for async streams only when necessary (prefer `toSignal` / `toObservable` bridges).
* **Styling:** Tailwind CSS / SCSS BEM methodology (check existing `styles.scss` or component styles first).
* **Change Detection:** `ChangeDetectionStrategy.OnPush` is mandatory on all components.

---

## 2. Component Guidelines

* **Single Responsibility:** Each component must have one clear, focused task.
* **Standalone First:** Do not generate `NgModule`. Always use `standalone: true`.
* **Inputs & Outputs:** Use signal inputs (`input()`, `input.required()`) and output functions (`output()`) instead of legacy `@Input()` and `@Output()` decorators.
* **Template Logic:** Keep templates clean. Do not call complex methods or heavy calculations inside templates; use `computed()` signals instead.

### Component Structure Template:
```typescript
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2>{{ title() }}</h2>
      <button (click)="onAction()">Click Me</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  title = input.required<string>();
  actionTriggered = output<void>();

  // Computed value example
  upperTitle = computed(() => this.title().toUpperCase());

  onAction(): void {
    this.actionTriggered.emit();
  }
}
```

---

## 3. Services & Dependency Injection

* **Injection Strategy:** Always use the `inject()` function in field initializers rather than constructor injection.
* **ProvidedIn:** Use `providedIn: 'root'` for singletons, or scope them to feature routes.
* **Separation of Concerns:** Services handle data fetching or business logic, never UI rendering.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  // Use modern resource or RxJS handling
}
```

---

## 4. Naming Conventions

* **Files:** Use kebab-case for all file names:
  * Components: `user-profile.component.ts`
  * Services: `user.service.ts`
  * Models/Interfaces: `user.model.ts`
* **Classes:** PascalCase (`UserProfileComponent`, `UserService`).
* **Variables & Methods:** camelCase (`userList`, `fetchUserData()`).
* **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`).
* **Boolean flags:** Prefix with `is`, `has`, `should`, or `can` (e.g., `isLoading`, `hasError`).

---

## 5. TypeScript & Strict Rules

* **Strict Mode:** TypeScript strict mode is enabled. Do not use `any`; explicitly define interfaces or types.
* **Nullability:** Handle `null` and `undefined` safely with optional chaining (`?.`) and nullish coalescing (`??`).
* **Immutability:** Treat state objects and arrays as immutable. Use `.map()`, `.filter()`, or spread operators instead of mutations.

---

## 6. Testing Conventions

* Write unit tests for all new components and services using Jest or Jasmine/Karma matching the project setup.
* Mock external HTTP calls and services cleanly using `HttpTestingController` or Jasmine/Jest spies.
* Test signal values and `computed` outputs explicitly.

---

## 7. What NOT to Do

* Do not generate `NgModule` boilerplate.
* Do not use legacy `@Input()` / `@Output()` decorators.
* Do not subscribe inside component `.ts` files manually without unsubscribing or using `toSignal()` (avoid memory leaks).
* Do not put business logic or heavy mapping inside `.html` templates.
