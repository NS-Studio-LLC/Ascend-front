const header = document.querySelector("header");

// neçə px scroll olanda ağ olsun?
const STICKY_AT = 10;

window.addEventListener("scroll", () => {
  if (window.scrollY > STICKY_AT) {
    header.classList.add("is-sticky");
  } else {
    header.classList.remove("is-sticky");
  }
});
