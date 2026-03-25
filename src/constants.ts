// ============================================================================
// GENERAL
// ============================================================================
export const DEFAULT_FOLDER = 'General';

// ============================================================================
// PLAYBACK & TIMING
// ============================================================================
/** Time in milliseconds before seeking back to previous track */
export const SKIP_BACK_THRESHOLD = 3000;

/** Sleep timer interval in milliseconds */
export const SLEEP_TIMER_INTERVAL = 1000;

/** Default playback speed */
export const DEFAULT_PLAYBACK_SPEED = 1.0;

/** Default playback pitch */
export const DEFAULT_PLAYBACK_PITCH = 0.0;

// ============================================================================
// UI LAYOUT & DIMENSIONS
// ============================================================================
/** Tablet/landscape breakpoint width in pixels */
export const TABLET_BREAKPOINT = 500;

/** Maximum artwork size in pixels */
export const MAX_ARTWORK_SIZE = 350;

/** Tall device breakpoint (for padding adjustments) */
export const TALL_DEVICE_HEIGHT = 800;

/** List content bottom padding (above mini player) */
export const LIST_BOTTOM_PADDING = 100;

/** Top margin for empty states */
export const EMPTY_STATE_TOP_MARGIN = 120;

/** Modal max width */
export const MODAL_MAX_WIDTH = 400;

/** Slider height */
export const SLIDER_HEIGHT = 40;

/** Folders screen max width for grid */
export const FOLDERS_GRID_MAX_WIDTH = 400;

// ============================================================================
// FILE OPERATIONS
// ============================================================================
/** Maximum file size to extract metadata (prevents OOM on low-end devices) */
export const MAX_FILE_SIZE_FOR_METADATA = 50 * 1024 * 1024; // 50 MB

/** URL parameter separator for filename extraction */
export const URL_PARAM_SEPARATOR = '?';

// ============================================================================
// ASYNC OPERATIONS
// ============================================================================
/** Document picker timeout (ms) */
export const DOCUMENT_PICKER_TIMEOUT = 30000;
