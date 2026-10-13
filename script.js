
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("chatPanel");
  const backdrop = document.getElementById("chatBackdrop");
  const closeButton = document.getElementById("closeChat");
  const continueButton = document.getElementById("continueChat");
  const status = document.getElementById("panelStatus");
  const year = document.getElementById("year");

  let pendingMessage = null;
  let webchatReady = false;
  let previousFocus = null;

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function openPanel() {
    if (!panel || !backdrop) return;

    previousFocus = document.activeElement;
    panel.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add("panel-open");

    requestAnimationFrame(() => {
      panel.classList.add("is-open");
      closeButton?.focus();
    });
  }

  function closePanel() {
    if (!panel || !backdrop) return;

    panel.classList.remove("is-open");
    document.body.classList.remove("panel-open");

    setTimeout(() => {
      panel.hidden = true;
      backdrop.hidden = true;
    }, 220);

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function sendPendingMessage() {
    if (!pendingMessage || !webchatReady) return;

    const message = pendingMessage;
    pendingMessage = null;

    Promise.resolve(window.botpress.sendMessage(message))
      .then(() => {
        setStatus("Your prompt was sent to Zyro AI.");
      })
      .catch((error) => {
        console.error("Botpress message error:", error);
        setStatus(
          "Couldn't send the prompt. Try typing it directly in the chat."
        );
      });
  }

  function openBotpress(message = null) {
    if (message) {
      pendingMessage = message;
    }

    if (!window.botpress ||
        typeof window.botpress.open !== "function") {
      setStatus(
        "The assistant is still loading. Please wait a moment and try again."
      );
      return;
    }

    // The user has deliberately chosen to start a conversation.
    try {
      window.botpress.open();

      if (webchatReady && pendingMessage) {
        setTimeout(sendPendingMessage, 400);
      } else if (!webchatReady) {
        setStatus("Connecting to Zyro AI…");
      }
    } catch (error) {
      console.error("Could not open Botpress:", error);
      setStatus(
        "The chat couldn't open. Check that your Botpress bot is published."
      );
    }
  }

  // Register Botpress events when the integration is available.
  function connectBotpress() {
    if (!window.botpress ||
        typeof window.botpress.on !== "function") {
      setTimeout(connectBotpress, 300);
      return;
    }

    window.botpress.on("webchat:ready", () => {
      webchatReady = true;
      sendPendingMessage();
      setStatus("Connected to your Zyro AI assistant.");
    });

    window.botpress.on("error", (error) => {
      console.error("Botpress reported an error:", error);
      setStatus("The assistant encountered an error. Please try again.");
    });
  }

  connectBotpress();

  // Main buttons open the custom Zyro panel.
  document.querySelectorAll("[data-open-chat]").forEach((button) => {
    button.addEventListener("click", openPanel);
  });

  // Quick prompts send the chosen task to the real Botpress bot.
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.prompt;

      if (!prompt) return;

      closePanel();
      openBotpress(prompt);
    });
  });

  closeButton?.addEventListener("click", closePanel);
  backdrop?.addEventListener("click", closePanel);

  continueButton?.addEventListener("click", () => {
    closePanel();
    openBotpress();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel && !panel.hidden) {
      closePanel();
    }
  });

  // Smooth scrolling for the navigation.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

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

