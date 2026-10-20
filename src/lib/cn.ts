/** Joins optional class names without introducing a runtime dependency. */
export const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');
