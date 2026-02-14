// NodeIcons.js
// Clean, professional SVG icons for pipeline nodes.
// Style: Lucide-inspired line art, 16x16, stroke-based, currentColor.

const s = { width: 16, height: 16, display: 'block' };
const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

// ── Core ──────────────────────────────────────────────────────────────────────

// Arrow entering a container
export const InputIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// AI sparkle
export const LLMIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
    <path d="M20 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
  </svg>
);

// Arrow leaving a container
export const OutputIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Text lines
export const TextIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="16" y2="12" />
    <line x1="4" y1="17" x2="12" y2="17" />
  </svg>
);

// ── Transform ─────────────────────────────────────────────────────────────────

// Funnel
export const FilterIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// Converging paths
export const MergeIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
);

// ── API ───────────────────────────────────────────────────────────────────────

// Globe
export const HTTPIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
  </svg>
);

// ── Logic ─────────────────────────────────────────────────────────────────────

// Forking path
export const ConditionalIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

// ── Utility ───────────────────────────────────────────────────────────────────

// Terminal prompt
export const LoggerIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

// Clock face
export const DelayIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Document with fold
export const NoteIcon = (
  <svg style={s} viewBox="0 0 24 24" {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);
