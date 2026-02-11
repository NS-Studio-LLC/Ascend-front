const view = document.querySelector("#view");
const DURATION = 1000;
let isTransitioning = false;

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const next2Frames = async () => {
  await nextFrame();
  await nextFrame();
};

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

/* ✅ homepage-head real height -> 200px animasiyası */
async function shrinkHomepageHead(oldLayer, targetPx = 360) {
  const head = oldLayer.querySelector(".homepage-head");
  if (!head) return;

  // real height ölç
  const from = head.scrollHeight;

  // əgər onsuz da kiçikdirsə heç nə etmə
  if (from <= targetPx) return;

  // 1) height-i rəqəm olaraq set et (auto əvəzinə)
  head.style.height = from + "px";
  head.style.overflow = "hidden";

  // 2) bir frame gözlə ki, brauzer bunu tətbiq etsin
  await next2Frames();

  // 3) transition üçün class ver
  head.classList.add("is-shrinking");

  // 4) hədəfə animasiya et
  head.style.height = targetPx + "px";
}

function resetHomepageHeadStyles(layer) {
  const head = layer?.querySelector(".homepage-head");
  if (!head) return;
  head.classList.remove("is-shrinking");
  head.style.height = "";
  head.style.overflow = "";
}

async function navigate(url, { push = true } = {}) {
  if (!view) return;
  if (isTransitioning) return;
  isTransitioning = true;

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

  // köhnə hündürlüyü sabitle
  setViewHeightTo(oldLayer);

  // ✅ Ana səhifədən çıxanda homepage-head 200px-ə qədər kiçilsin
  // (yalnız homepage-də .homepage-head var)
  shrinkHomepageHead(oldLayer, 360);

  // yeni səhifəni gətir
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

  // yeni layer
  const newLayer = document.createElement("div");
  newLayer.className = "layer new";
  newLayer.innerHTML = nextView.innerHTML;
  view.appendChild(newLayer);

  // yeni kontent hündürlüyünə görə #view-i yenilə
  setViewHeightTo(newLayer);

  document.title = nextTitle;
  if (push) history.pushState({}, "", url);

  // opacity animasiyalar
  requestAnimationFrame(() => {
    oldLayer.classList.add("is-leaving");
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newLayer.classList.add("is-entering");
    });
  });

  const finish = () => {
    if (oldLayer?.isConnected) oldLayer.remove();

    if (newLayer?.isConnected) {
      newLayer.classList.remove("new", "is-entering");
      newLayer.classList.add("old");

      // ✅ yeni layer-də (ana səhifəyə qayıdanda) əvvəlki inline height qalmasın
      resetHomepageHeadStyles(newLayer);
    }

    clearViewHeight();
    isTransitioning = false;
  };

  once(oldLayer, "transitionend", (e) => {
    if (e.propertyName !== "opacity") return;
    finish();
  });

  setTimeout(() => {
    const stillOld = view.querySelector(".layer.old.is-leaving");
    const stillNew = view.querySelector(".layer.new.is-entering");
    if (stillOld || stillNew) finish();
    else isTransitioning = false;
  }, DURATION + 200);
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

// init
wrapInitialContentOnce();
