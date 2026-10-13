
document.addEventListener("DOMContentLoaded", () => {
  const chatButtons = document.querySelectorAll("[data-chat]");
  const chatHint = document.getElementById("chatHint");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  let hintTimeout;

  function showHint(message) {
    if (!chatHint) return;

    chatHint.textContent = message;
    chatHint.classList.add("show");

    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
      chatHint.classList.remove("show");
    }, 3500);
  }

  chatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Open the Botpress chat if its API is available.
      if (
        window.botpress &&
        typeof window.botpress.open === "function"
      ) {
        window.botpress.open();
        return;
      }

      // Some Botpress versions expose a different API.
      showHint(
        "Zyro AI is loading. If chat doesn't open, check your Botpress integration."
      );
    });
  });

  // Smooth scrolling for internal navigation.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
});
