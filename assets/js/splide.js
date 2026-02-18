new Splide('#logoStrip', {
  type: 'loop',
  arrows: false,
  pagination: false,
  drag: false,          // istəsən true et
  autoWidth: true,      // logo ölçüsünə görə yan-yana düzülür
  gap: '18px',
  focus: 'center',
  autoScroll: {
    speed: -1.2,         // artır = daha sürətli
    pauseOnHover: true,
    pauseOnFocus: false,
  },
}).mount(window.splide.Extensions);
