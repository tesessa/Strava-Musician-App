/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When "true", use FakeDataServer instead of ServerFacade (demo mode). */
  readonly VITE_DEMO_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
