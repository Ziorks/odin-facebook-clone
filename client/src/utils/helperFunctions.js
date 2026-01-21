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

export function getFriendFromFriendship(friendship, currentUserId) {
  return friendship.user1.id === currentUserId
    ? friendship.user2
    : friendship.user1;
}
