function main() {
  const app = document.getElementById("app");

  if (!app) {
    throw new Error("No app element found");
  }

  app.innerHTML = "Jump in the third pool!";
}

main();
