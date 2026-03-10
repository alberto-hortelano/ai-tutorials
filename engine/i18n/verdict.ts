// Verdict regex patterns — match grading tags in both languages

export const VERDICT_RE: RegExp = /^\[(CORRECTO|CORRECT)\]/i;
export const PARTIAL_RE: RegExp = /^\[(PARCIAL|PARTIAL)\]/i;
export const INCORRECT_RE: RegExp = /^\[(INCORRECTO|INCORRECT)\]/i;
export const ALL_VERDICT_RE: RegExp = /^\[(CORRECTO|CORRECT|PARCIAL|PARTIAL|INCORRECTO|INCORRECT)\]\s*/i;
