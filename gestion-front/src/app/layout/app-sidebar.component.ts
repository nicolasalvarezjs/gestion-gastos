import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../shared/i18n/translate.pipe';

interface SidebarItem {
  labelKey: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss',
  imports: [NgFor, RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSidebarComponent {
  @Input() isOpen = false;

  readonly items: SidebarItem[] = [
    { labelKey: 'nav.dashboard', icon: 'dashboard', path: '/dashboard' },
    { labelKey: 'nav.history', icon: 'history', path: '/history' },
    { labelKey: 'nav.categories', icon: 'label', path: '/categories' },
    { labelKey: 'nav.reports', icon: 'pie_chart', path: '/reports' }
  ];

  readonly analysisItem: SidebarItem = {
    labelKey: 'nav.analysis',
    icon: 'donut_large',
    path: '/analysis'
  };

  readonly settingsItem: SidebarItem = {
    labelKey: 'nav.settings',
    icon: 'settings',
    path: '/settings'
  };
}
