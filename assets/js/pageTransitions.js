const view = document.querySelector("#view");
const DURATION = 1000;
const DELAY_MS = 800;
let isTransitioning = false;

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const next2Frames = async () => {
  await nextFrame();
  await nextFrame();
};

function getDelay() {
  return document.body.classList.contains("view-delay") ? DELAY_MS : 0;
}

function setViewHeightTo(el) {
  if (!view || !el) return;
  view.style.height = el.scrollHeight + "px";
}

function clearViewHeight() {
  if (!view) return;
  view.style.height = "auto";
}

function wrapInitialContentOnce() {
  if (!view || view.dataset.layered === "1") return false;

  const old = document.createElement("div");
  old.className = "layer old";
  old.innerHTML = view.innerHTML;

  view.innerHTML = "";
  view.appendChild(old);

  view.dataset.layered = "1";
  setViewHeightTo(old);

  return true;
}

function once(el, event, handler) {
  const fn = (e) => {
    el.removeEventListener(event, fn);
    handler(e);
  };
  el.addEventListener(event, fn);
}

function cleanupStrayLayers() {
  if (!view) return;
  view.querySelectorAll(".layer.old.is-leaving").forEach((el) => el.remove());
  view.querySelectorAll(".layer.new").forEach((el) => {
    if (!el.classList.contains("old")) el.remove();
  });
}

async function shrinkAnimatedHeads(oldLayer, targetPx = 360) {
  const heads = oldLayer.querySelectorAll(".animated-head");
  if (!heads || heads.length === 0) return;

  heads.forEach(async (head) => {
    const from = head.scrollHeight;
    if (from <= targetPx) return;

    head.style.height = from + "px";
    head.style.overflow = "hidden";

    await next2Frames();

    head.classList.add("is-shrinking");
    head.style.height = targetPx + "px";
  });
}

function resetAnimatedHeadStyles(layer) {
  const heads = layer?.querySelectorAll(".animated-head");
  if (!heads || heads.length === 0) return;

  heads.forEach((head) => {
    head.classList.remove("is-shrinking");
    head.style.height = "";
    head.style.overflow = "";
  });
}

async function navigate(url, { push = true } = {}) {
  if (!view) return;
  if (isTransitioning) return;
  isTransitioning = true;

  const delay = getDelay();

  const justWrapped = wrapInitialContentOnce();
  cleanupStrayLayers();

  const oldLayer = view.querySelector(".layer.old");
  if (!oldLayer) {
    isTransitioning = false;
    window.location.href = url;
    return;
  }

  if (justWrapped) {
    await next2Frames();
  }

  setViewHeightTo(oldLayer);

  shrinkAnimatedHeads(oldLayer, 360);

  let html = "";
  try {
    const res = await fetch(url, { cache: "no-store" });
    html = await res.text();
  } catch (e) {
    isTransitioning = false;
    window.location.href = url;
    return;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const nextView = doc.querySelector("#view");
  const nextTitle = doc.title || document.title;

  if (!nextView) {
    isTransitioning = false;
    window.location.href = url;
    return;
  }

  const newLayer = document.createElement("div");
  newLayer.className = "layer new";
  newLayer.innerHTML = nextView.innerHTML;
  view.appendChild(newLayer);

  setViewHeightTo(newLayer);

  document.title = nextTitle;
  if (push) history.pushState({}, "", url);

  const finish = () => {
    if (oldLayer?.isConnected) oldLayer.remove();

    if (newLayer?.isConnected) {
      newLayer.classList.remove("new", "is-entering");
      newLayer.classList.add("old");
      resetAnimatedHeadStyles(newLayer);
    }

    clearViewHeight();
    isTransitioning = false;
  };

  const startAnimation = () => {
    requestAnimationFrame(() => oldLayer.classList.add("is-leaving"));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => newLayer.classList.add("is-entering"));
    });

    once(oldLayer, "transitionend", (e) => {
      if (e.propertyName !== "opacity") return;
      finish();
    });
  };

  if (delay > 0) setTimeout(startAnimation, delay);
  else startAnimation();

  setTimeout(() => {
    const stillOld = view.querySelector(".layer.old.is-leaving");
    const stillNew = view.querySelector(".layer.new.is-entering");
    if (stillOld || stillNew) finish();
    else isTransitioning = false;
  }, delay + DURATION + 300);
}

// link intercept
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  if (a.dataset.bsToggle) return;

  let href = a.getAttribute("href");
  if (!href) return;

  if (
    href === "#" ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http")
  ) return;

  if (a.target === "_blank") return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  e.preventDefault();

  const file =
    new URL(href, window.location.href).pathname.split("/").pop() || "index.html";

  navigate(file, { push: true });
});

window.addEventListener("popstate", () => {
  const file = location.pathname.split("/").pop() || "index.html";
  navigate(file, { push: false });
});

wrapInitialContentOnce();
