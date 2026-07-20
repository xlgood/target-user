// A non-empty line represents one custom comment service item.
export const countNonEmptyLines = (value: unknown): number => String(value ?? '')
  .split(/\r?\n/)
  .filter((line) => line.trim().length > 0)
  .length
