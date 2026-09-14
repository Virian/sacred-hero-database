const windowsInvalidCharacters = /[<>:"|?*]/;

const hasControlCharacters = (path: string) =>
  [...path].some((character) => character.charCodeAt(0) < 32);

export const isValidPath = (path: string) => {
  // Windows drive paths must start with a drive letter and a slash, such as C:\\Games.
  if (/^[A-Za-z]:[\\/]/.test(path)) {
    const pathSegments = path.slice(3).split(/[\\/]/).filter(Boolean);

    // Windows forbids these characters and does not allow segments ending in a dot or space.
    return pathSegments.every(
      (segment) =>
        !hasControlCharacters(segment) &&
        !windowsInvalidCharacters.test(segment) &&
        !/[. ]$/.test(segment),
    );
  }

  // UNC paths point to a network share and must contain both a server and share name.
  if (/^\\\\/.test(path)) {
    const pathSegments = path.split(/[\\/]/).filter(Boolean);

    return (
      pathSegments.length >= 2 &&
      pathSegments.every(
        (segment) =>
          !hasControlCharacters(segment) &&
          !windowsInvalidCharacters.test(segment) &&
          !/[. ]$/.test(segment),
      )
    );
  }

  // Linux and macOS use POSIX paths, which must be absolute and cannot contain controls.
  return path.startsWith('/') && !hasControlCharacters(path);
};
