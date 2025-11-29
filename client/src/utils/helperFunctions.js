import { formatDistanceToNowStrict } from "date-fns";

export function formatDistanceToNowShort(time) {
  const distance = formatDistanceToNowStrict(time);

  const [number, unit] = distance.split(" ");

  return `${number}${unit[0]}`;
}
