new Splide('#logoStrip', {
  type: 'loop',
  arrows: false,
  pagination: false,
  drag: false,
  autoWidth: true,
  gap: '18px',
  focus: 'center',
  autoScroll: {
    speed: -1.2,
    pauseOnHover: true,
    pauseOnFocus: false,
  },
}).mount(window.splide.Extensions);
