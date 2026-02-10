import { formatDistanceToNowStrict } from "date-fns";

export function formatDistanceToNowShort(time) {
  const distance = formatDistanceToNowStrict(time);

  const [number, unit] = distance.split(" ");

  return `${number}${unit[0]}`;
}

export function capitalizeFirstLetters(string) {
  return string
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getDuplicatesRemovedMerged(...args) {
  if (!args.every((arg) => Array.isArray(arg)))
    throw new Error(
      "non-Array argument passed to function 'getDuplicatesRemovedMerged'",
    );

  const idTracker = {};
  const result = [];

  const cb = (obj) => {
    if (typeof obj !== "object" || !Object.hasOwn(obj, "id"))
      return result.push(obj);

    if (idTracker[obj.id]) return;

    result.push(obj);
    idTracker[obj.id] = true;
  };

  args.forEach((arg) => arg.forEach(cb));

  return result;
}

const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
export function formatBytes(number) {
  let i = 0;
  let n = parseInt(number, 10) || 0;

  while (n >= 1024 && ++i) {
    n = n / 1024;
  }

  return n.toFixed(i > 0 && !Number.isInteger(n) ? 1 : 0) + " " + units[i];
}
