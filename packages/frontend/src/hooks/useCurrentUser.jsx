export function useCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}
