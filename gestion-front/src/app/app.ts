import { Component, DestroyRef, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith, combineLatest } from 'rxjs';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppHeaderComponent } from './layout/app-header.component';
import { AppSidebarComponent } from './layout/app-sidebar.component';
import { I18nService } from './shared/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent, AppSidebarComponent, AsyncPipe, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly language$ = toObservable(this.i18n.language);

  sidebarOpen = false;

  readonly routeView$ = combineLatest([
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd), startWith(null)),
    this.language$
  ]).pipe(map(() => this.getRouteData()));

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.sidebarOpen = false;
      });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  private getRouteData(): { title: string; subtitle?: string; hideShell: boolean } {
    let activeRoute = this.route;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const data = activeRoute.snapshot.data as {
      titleKey?: string;
      subtitleKey?: string;
      hideShell?: boolean;
    };

    const titleKey = data.titleKey ?? 'nav.dashboard';
    const subtitleKey = data.subtitleKey;
    return {
      title: this.i18n.t(titleKey),
      subtitle: subtitleKey ? this.i18n.t(subtitleKey) : undefined,
      hideShell: Boolean(data.hideShell)
    };
  }
}
