document.addEventListener("DOMContentLoaded", function () {
    const loading = document.getElementById("pageloader");

    const isHomePage = window.location.pathname === '/';

    // Show loading animation when navigating to another page
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (e) {
            if (this.target === "_blank" || this.classList.contains("noloading") || this.getAttribute("href") === "#") {
                return;
            }

            e.preventDefault();
            loading.classList.add("show");
            setTimeout(() => {
                window.location.href = this.href;
            }, 500);
        });
    });

    // Hide loading animation when the page is loaded or shown from cache
    function hideLoading() {
        loading.classList.remove("show");
    }

    window.addEventListener("load", hideLoading);
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {  // la página viene del cache bfcache
            hideLoading();
        }
    });

    if (isHomePage) {
        loading.classList.add("show");
        setTimeout(() => {
            loading.classList.remove("show");
        }, 1500);
    }
});


gsap.registerPlugin(ScrollTrigger);

(function ($) {
        $(document).ready(function () {

            function initScrollTriggers() {
                // Parallax de imágenes
                gsap.utils.toArray('.parallax-img').forEach(container => {
                    const img = container.querySelector('img');

                    gsap.fromTo(img, {
                        yPercent: -20,
                        ease: 'none'
                    }, {
                        yPercent: 20,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            scrub: true,
                            pin: false,
                        }
                    });
                });

                // FadeIn al hacer scroll
                gsap.utils.toArray('.fadeIn').forEach((element) => {
                    gsap.from(element, {
                        opacity: 0,
                        duration: 1,
                        scrollTrigger: {
                            trigger: element,
                            start: 'top 80%',
                            end: "bottom 20%",
                            toggleActions: 'play none none reverse'
                        }
                    });
                });

                // FadeInUp al hacer scroll
                gsap.utils.toArray(".fadeInUp").forEach(function (elem) {
                    ScrollTrigger.create({
                        trigger: elem,
                        start: "top 80%",
                        end: "bottom 20%",
                        onEnter: function () {
                            gsap.fromTo(
                                elem,
                                { y: 100, autoAlpha: 0 },
                                {
                                    duration: 1.25,
                                    y: 0,
                                    autoAlpha: 1,
                                    ease: "back",
                                    overwrite: "auto"
                                }
                            );
                        },
                        onLeave: function () {
                            gsap.fromTo(elem, { autoAlpha: 1 }, { autoAlpha: 0, overwrite: "auto" });
                        },
                        onEnterBack: function () {
                            gsap.fromTo(
                                elem,
                                { y: -100, autoAlpha: 0 },
                                {
                                    duration: 1.25,
                                    y: 0,
                                    autoAlpha: 1,
                                    ease: "back",
                                    overwrite: "auto"
                                }
                            );
                        },
                        onLeaveBack: function () {
                            gsap.fromTo(elem, { autoAlpha: 1 }, { autoAlpha: 0, overwrite: "auto" });
                        }
                    });
                });

                // Portfolio animations
                if (document.querySelector('.home-2')) {
                    gsap.utils.toArray('.feed-projects .thumbnail img').forEach((image) => {
                        gsap.fromTo(image,
                            { scale: 0.7 },
                            {
                                scale: 1,
                                scrollTrigger: {
                                    trigger: image,
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: true,
                                    markers: false,
                                }
                            }
                        );
                    });

                    gsap.utils.toArray('.feed-projects .data').forEach((dataElement, index) => {
                        gsap.fromTo(dataElement,
                            { opacity: 0 },
                            {
                                opacity: 1,
                                scrollTrigger: {
                                    trigger: dataElement,
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: true,
                                    markers: false,
                                    delay: index * 0.2 // Retardo de 0.2 segundos multiplicado por el índice del elemento
                                }
                            }
                        );
                    });
                }
            }
            

            // Inicializar los scripts al cargar el documento
            initScrollTriggers();

            // Detener y reanudar animaciones con el botón de menú
            /*$('[data-open="menu"]').click(function (e) {
                e.preventDefault();
                if ($(this).hasClass('active')) {
                    ScrollTrigger.getAll().forEach(trigger => {
                        trigger.disable();
                    });
                } else {
                    ScrollTrigger.getAll().forEach(trigger => {
                        trigger.enable();
                    });
                }
            });*/

        });
    })(jQuery);


		