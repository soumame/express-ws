export default function addTrailingSlash(string: string): string {
  let suffixed = string;
  if (suffixed.charAt(suffixed.length - 1) !== "/") {
    suffixed = `${suffixed}/`;
  }
  return suffixed;
}
