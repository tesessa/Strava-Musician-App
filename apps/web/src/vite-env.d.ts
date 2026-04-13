/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When "true", use FakeDataServer instead of ServerFacade (demo mode). */
  readonly VITE_DEMO_MODE: string;
  /** Oracle PAR base URLs (each must end with `/o/`). Defaults are set in MediaService. */
  readonly VITE_ORACLE_PAR_AUDIO_BASE_URL?: string;
  readonly VITE_ORACLE_PAR_VIDEO_BASE_URL?: string;
  readonly VITE_ORACLE_PAR_PROFILE_IMAGES_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
