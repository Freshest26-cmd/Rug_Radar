interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface Window {
  aistudio?: AIStudio;
}

interface ImportMeta {
  readonly env: {
    readonly [key: string]: string | undefined;
    readonly VITE_WS_URL?: string;
  };
}
