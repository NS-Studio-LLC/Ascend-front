(() => {
  function initTrack(track) {
    const speedSec = Number(track.dataset.speed || 18);
    track.style.setProperty("--speed", `${speedSec}s`);

    // original elementləri saxla
    const originals = Array.from(track.children).map((el) => el.cloneNode(true));

    // container ölçüsü
    const parent = track.parentElement;
    if (!parent) return;

    // Track-i doldurmaq üçün çoxaltma (ən az 2.5x dolsun)
    // Qeyd: track ölçüləri ancaq DOM-da olanda düz hesablanır
    const fill = () => {
      // reset
      track.innerHTML = "";
      originals.forEach((el) => track.appendChild(el.cloneNode(true)));

      // lazım olduqca append et
      const targetWidth = parent.clientWidth * 2.5;

      // track-in current width-ünü artırmaq üçün təkrar əlavə et
      while (track.scrollWidth < targetWidth) {
        originals.forEach((el) => track.appendChild(el.cloneNode(true)));
      }

      // loop məsafəsi: elementlərin yarısı qədər getməlidir
      // (çünki biz iki dəfə doldurmuşuq, yarısı “1 dövr” sayılır)
      const loopWidth = track.scrollWidth / 2;
      track.style.setProperty("--loop-width", `${loopWidth}px`);
    };

    // şəkillər yüklənəndən sonra ölçülər düzgün alınsın
    const images = track.querySelectorAll("img");
    let left = images.length;

    if (!left) {
      fill();
    } else {
      images.forEach((img) => {
        if (img.complete) {
          left--;
          if (left === 0) fill();
        } else {
          img.addEventListener("load", () => {
            left--;
            if (left === 0) fill();
          });
          img.addEventListener("error", () => {
            left--;
            if (left === 0) fill();
          });
        }
      });
    }

    // resize olanda yenidən hesabla
    window.addEventListener("resize", () => {
      // kiçik debounce
      clearTimeout(track.__t);
      track.__t = setTimeout(fill, 120);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".track").forEach(initTrack);
  });
})();
