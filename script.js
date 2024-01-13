// page transition code 

barba.init({

    sync: true,

    transitions: [{
        async leave(data) {
            const done = this.async();

            pageTransition();
            await delay(1500);
            done();
        },

        async enter(data) {
            contentAnimation();
            window.scrollTo(0, 0);
            initializeFlick()
        },
        async once(data) {
            contentAnimation();
            window.scrollTo(0, 0);
            initializeFlick()
        },
    }]
})

function pageTransition() {
    var tl = gsap.timeline();

    tl.to('ul.morph li', { duration: .8, scaleY: 1, transformOrigin: "bottom left", ease: "cubic-bezier(0.3, 0.0, 0.8, 0.15)", delay: .5})
    tl.to('ul.morph li', { duration: .8, scaleY: 0, transformOrigin: "bottom left", ease: "	cubic-bezier(0.05, 0.7, 0.1, 1.0)", delay: .5})
    return tl;
}

function contentAnimation() {
    var tl = gsap.timeline(); 

    tl.from('.hero-text', { duration: 1, translateY: -50, opacity: 0, delay: .25})
    tl.from('.study-header', { duration: 1, translateY: -50, opacity: 0, delay: .25})
}

function delay(n) {
    n = n || 2000;
    return new Promise(done => {
        setTimeout(() => {
            done();
        }, n);
    });
}

// study scroll animation 
function initializeFlick() {
    var carousels = document.querySelectorAll('.main-carousel');
    for (var i = 0; i < carousels.length; i++) {
        new Flickity(carousels[i], {
            // options
            cellAlign: 'left',
            contain: true,
            wrapAround: true
        });
    }
}


