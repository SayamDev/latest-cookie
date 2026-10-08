try {
  document.documentElement.dataset.theme =
    localStorage.getItem("latest-cookie:theme") === "dark" ? "dark" : "light";
} catch {
  document.documentElement.dataset.theme = "light";
}
