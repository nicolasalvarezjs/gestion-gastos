import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'default' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private resolver: ((value: boolean) => void) | null = null;

  private readonly stateSignal = signal<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default'
  });

  readonly state = this.stateSignal.asReadonly();

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    this.stateSignal.set({
      open: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirmar',
      cancelText: options.cancelText ?? 'Cancelar',
      variant: options.variant ?? 'default'
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  accept(): void {
    this.closeWith(true);
  }

  cancel(): void {
    this.closeWith(false);
  }

  private closeWith(result: boolean): void {
    this.stateSignal.update((current) => ({ ...current, open: false }));
    this.resolver?.(result);
    this.resolver = null;
  }
}
