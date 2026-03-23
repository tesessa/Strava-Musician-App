/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When "true", use FakeDataServer instead of ServerFacade (demo mode). */
  readonly VITE_DEMO_MODE: string;
  readonly VITE_ORACLE_NAMESPACE?: string;
  readonly VITE_ORACLE_REGION?: string;
  readonly VITE_BUCKET_PROFILE_IMAGES?: string;
  readonly VITE_BUCKET_SESSION_AUDIO?: string;
  readonly VITE_BUCKET_SESSION_VIDEO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
