const formattingPattern = /\\[cdw][\s\S]{8}|\\g[\s\S]{16}|\\r/g;

export const stripCharacterFormatting = (value: string): string =>
  value.replace(formattingPattern, '');
