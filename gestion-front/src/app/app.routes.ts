import { Routes } from '@angular/router';
import { AnalysisComponent } from './features/analysis/analysis.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HistoryComponent } from './features/history/history.component';
import { LoginComponent } from './features/login/login.component';
import { ReportsComponent } from './features/reports/reports.component';
import { SettingsComponent } from './features/settings/settings.component';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';

export const routes: Routes = [
	{
		path: 'login',
		component: LoginComponent,
		canActivate: [guestGuard],
		data: { hideShell: true }
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard'
	},
	{
		path: 'dashboard',
		canActivate: [authGuard],
		component: DashboardComponent,
		data: { titleKey: 'nav.dashboard', subtitleKey: 'header.dashboardSubtitle' }
	},
	{
		path: 'history',
		canActivate: [authGuard],
		component: HistoryComponent,
		data: { titleKey: 'nav.history', subtitleKey: 'header.historySubtitle' }
	},
	{
		path: 'analysis',
		canActivate: [authGuard],
		component: AnalysisComponent,
		data: { titleKey: 'nav.analysis', subtitleKey: 'header.analysisSubtitle' }
	},
	{
		path: 'categories',
		canActivate: [authGuard],
		component: CategoriesComponent,
		data: { titleKey: 'nav.categories', subtitleKey: 'header.categoriesSubtitle' }
	},
	{
		path: 'reports',
		canActivate: [authGuard],
		component: ReportsComponent,
		data: { titleKey: 'nav.reports' }
	},
	{
		path: 'settings',
		canActivate: [authGuard],
		component: SettingsComponent,
		data: { titleKey: 'nav.settings' }
	},
	{
		path: '**',
		redirectTo: 'dashboard'
	}
];
