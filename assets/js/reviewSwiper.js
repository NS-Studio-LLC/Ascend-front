const customerSwiper = new Swiper(".customerSwiper", {
    loop: true,
    speed: 1000,
    effect: "fade",
    fadeEffect: { crossFade: true },
    navigation: {
        nextEl: ".btn-next",
        prevEl: ".btn-prew",
    },
});
