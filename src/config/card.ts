// Canvas size of the exported card. Single source of truth — used by the
// card component, the export pipeline (PNG/JPG/PDF) and preview scaling.
// v2.2 grew the canvas from 1080×1920 so the advantages grid stopped
// overflowing into the footer (owner's request).
export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 2060
