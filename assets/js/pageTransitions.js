// assets/js/pageTransitions.js

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const headImage = document.querySelector(".page-head-image");
  const pageContainer = document.querySelector(".page-container");

  if (pageContainer) {
    body.classList.add("is-page-entering");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.remove("is-page-entering");
      });
    });
  }

  let isLeaving = false;

  const FADE_DURATION = 550;
  const HEAD_DURATION = 650;

  const links = document.querySelectorAll("a[href]");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = (link.getAttribute("href") || "").trim();

      if (!href || href === "#" || href.startsWith("#")) return;
      if (href.startsWith("javascript:")) return;
      if (link.target === "_blank") return;
      if (link.hasAttribute("download")) return;
      if (link.hasAttribute("data-bs-toggle")) return;

      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("https://wa.me") ||
        href.startsWith("whatsapp:")
      ) {
        return;
      }

      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//");

      if (isExternal) return;

      if (isLeaving) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      isLeaving = true;

      const hasAnimationDelayClass = body.classList.contains("animation-delay");
      const shouldWaitForHeadShrink = hasAnimationDelayClass && !!headImage;

      body.classList.add("is-page-leaving");

      if (headImage) {
        headImage.classList.add("is-leaving");
      }

      const totalWait = shouldWaitForHeadShrink
        ? HEAD_DURATION + FADE_DURATION
        : FADE_DURATION;

      setTimeout(() => {
        window.location.href = href;
      }, totalWait);
    });
  });
});