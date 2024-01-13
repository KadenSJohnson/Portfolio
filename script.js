function initializeCarousel() {
    document.querySelectorAll(".carousel").forEach((carousel) => {
        const slides = carousel.querySelector(".slides");
        const images = slides.querySelectorAll('img'); // Select all images
        const prevButton = carousel.querySelector(".prev");
        const nextButton = carousel.querySelector(".next");
    
        let currentIndex = 0;
        const slideCount = slides.childElementCount; // Not including clone
        let slideWidth; // Variable to store the width of a slide
    
        // Function to measure and set slide width
        function setSlideWidth() {
            if (images.length > 0) {
                slideWidth = images[0].clientWidth; // Use the width of the first image
                updateSlidePosition();
            }
        }
    
        function updateSlidePosition() {
            gsap.to(slides, {
                duration: .8,
                x: -currentIndex * slideWidth,
                ease: "cubic-bezier(0.133333, 0.06, 0.25, 1)"
            });
        }
    
        // Resize event listener
        window.addEventListener('resize', setSlideWidth);
    
        // Add load event listener to images
        images.forEach(image => {
            if (image.complete) {
                setSlideWidth();
            } else {
                image.addEventListener('load', setSlideWidth);
            }
        });
        
      
        prevButton.addEventListener("click", () => {
          if (currentIndex === 0) {
            currentIndex = slideCount - 1;
            slides.style.transition = "none";
            slides.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            setTimeout(() => {
              slides.style.transition = "";
              updateSlidePosition();
            });
          } else {
            currentIndex--;
            updateSlidePosition();
          }
        });
      
        nextButton.addEventListener("click", () => {
          if (currentIndex === slideCount - 1) {
            currentIndex = 0;
            slides.style.transition = "none";
            slides.style.transform = "translateX(0)";
            setTimeout(() => {
              slides.style.transition = "";
              updateSlidePosition();
            });
          } else {
            currentIndex++;
            updateSlidePosition();
          }
        });
      });
}





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
            initializeCarousel();
            initializeFlick()
        },
        async once(data) {
            contentAnimation();
            window.scrollTo(0, 0);
            initializeCarousel();
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

