// eslint-disable-next-line import/no-unresolved -- Provided by @vite-pwa at build time.
import { registerSW, type RegisterSWOptions } from 'virtual:pwa-register';

// eslint-disable-next-line no-unused-vars -- Document the boolean parameter returned by registerSW.
type UpdateFunction = (reloadPage?: boolean) => Promise<void>;

type Cleanup = () => void;

const isBrowser = typeof window !== 'undefined';

export const registerServiceWorker = (options?: RegisterSWOptions): UpdateFunction | undefined => {
  if (!isBrowser) {
    return undefined;
  }

  return registerSW({ immediate: true, ...options });
};

/**
 * Prompt-based flow if you prefer to control when the reload happens.
 * Call this instead of the auto-update to surface a UI prompt.
 */
export const registerServiceWorkerWithPrompt = (options?: RegisterSWOptions): UpdateFunction | undefined => {
  if (!isBrowser) {
    return undefined;
  }

  const { onNeedRefresh: userNeedRefresh, onOfflineReady: userOfflineReady, ...restOptions } = options ?? {};

  let updateSWRef: UpdateFunction | undefined;

  const updateSW = registerSW({
    ...restOptions,
    immediate: false,
    onNeedRefresh() {
      renderUpdatePrompt(async () => {
        if (!updateSWRef) {
          return;
        }
        await updateSWRef(true);
      });
      userNeedRefresh?.();
    },
    onOfflineReady() {
      announceOfflineReady();
      userOfflineReady?.();
    }
  } satisfies RegisterSWOptions);

  updateSWRef = updateSW;
  return updateSW;
};

const renderUpdatePrompt = (onConfirm: () => Promise<void>): Cleanup => {
  ensurePromptStyles();

  document.querySelectorAll('.pwa-update-toast').forEach((existing) => existing.remove());

  const root = document.createElement('aside');
  root.className = 'pwa-update-toast';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'false');
  root.setAttribute('aria-live', 'assertive');
  root.tabIndex = -1;

  const heading = document.createElement('h2');
  heading.textContent = 'Update available';
  heading.className = 'pwa-update-toast__title';
  heading.id = 'pwa-update-toast__title';

  const description = document.createElement('p');
  description.textContent = 'Reload to get the newest fixes and content.';
  description.className = 'pwa-update-toast__description';
  description.id = 'pwa-update-toast__description';

  const buttonRow = document.createElement('div');
  buttonRow.className = 'pwa-update-toast__actions';

  const cleanup: Cleanup = () => {
    root.remove();
  };

  const reloadButton = document.createElement('button');
  reloadButton.type = 'button';
  reloadButton.textContent = 'Reload now';
  reloadButton.className = 'pwa-update-toast__reload';
  reloadButton.setAttribute('aria-describedby', `${heading.id} ${description.id}`);
  reloadButton.addEventListener('click', () => {
    reloadButton.disabled = true;
    void onConfirm().finally(cleanup);
  });

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.textContent = 'Not now';
  dismissButton.className = 'pwa-update-toast__dismiss';
  dismissButton.addEventListener('click', () => {
    cleanup();
  });

  buttonRow.append(reloadButton, dismissButton);
  root.append(heading, description, buttonRow);
  root.setAttribute('aria-labelledby', heading.id);
  root.setAttribute('aria-describedby', description.id);

  document.body.append(root);

  window.setTimeout(() => {
    root.focus?.();
  }, 0);

  return cleanup;
};

const announceOfflineReady = (): void => {
  ensurePromptStyles();

  const offlineNotice = document.createElement('aside');
  offlineNotice.setAttribute('role', 'status');
  offlineNotice.setAttribute('aria-live', 'polite');
  offlineNotice.textContent = 'The site is ready to work offline.';
  offlineNotice.className = 'pwa-offline-toast';

  document.body.append(offlineNotice);

  try {
    window.dispatchEvent(new CustomEvent('applecottage:offline-download'));
  } catch {
    // Dispatch may fail in older browsers without CustomEvent support; ignore gracefully.
  }

  window.setTimeout(() => {
    offlineNotice.remove();
  }, 4000);
};

const ensurePromptStyles = (): void => {
  if (document.getElementById('pwa-update-toast-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'pwa-update-toast-styles';
  style.textContent = `
    .pwa-update-toast {
      position: fixed;
      inset-inline-end: 1rem;
      inset-block-end: 1rem;
      z-index: 2147483647;
      background-color: var(--color-slate-900, #1f2937);
      color: var(--color-white, #ffffff);
      padding: 1rem;
      border-radius: 0.75rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 20rem;
      font-family: var(--font-sans, system-ui, sans-serif);
    }

    .pwa-update-toast:focus {
      outline: 3px solid var(--color-focus-ring, #facc15);
      outline-offset: 4px;
    }

    .pwa-update-toast__title {
      margin: 0;
      font-weight: 600;
      font-size: 1rem;
    }

    .pwa-update-toast__description {
      margin: 0;
      font-size: 0.875rem;
    }

    .pwa-update-toast__actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .pwa-update-toast__reload {
      background-color: var(--color-accent, #f97316);
      color: var(--color-slate-900, #111827);
      font-weight: 600;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .pwa-update-toast__reload:hover {
      background-color: var(--color-accent-strong, #fb923c);
      transform: translateY(-1px);
    }

    .pwa-update-toast__reload:focus-visible,
    .pwa-update-toast__dismiss:focus-visible {
      outline: 3px solid var(--color-focus-ring, #facc15);
      outline-offset: 2px;
    }

    .pwa-update-toast__dismiss {
      background-color: transparent;
      color: var(--color-white, #ffffff);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 999px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: color 0.15s ease, background-color 0.15s ease;
    }

    .pwa-update-toast__dismiss:hover {
      background-color: rgba(255, 255, 255, 0.12);
    }

    .pwa-offline-toast {
      position: fixed;
      inset-inline-end: 1rem;
      inset-block-start: 1rem;
      background-color: var(--color-emerald-400, #34d399);
      color: var(--color-emerald-950, #022c22);
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      font-size: 0.875rem;
      box-shadow: 0 10px 24px rgba(6, 95, 70, 0.25);
      font-family: var(--font-sans, system-ui, sans-serif);
    }
  `;

  document.head.append(style);
};
