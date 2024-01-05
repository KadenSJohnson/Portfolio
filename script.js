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

  gsap.registerPlugin(ScrollTrigger);

// Function to apply the hover effect
function applyHoverEffect(item) {
    const hoverEffect = item.querySelector('.hover-effect');
    gsap.to(hoverEffect, { scale: 1, duration: 0.3 });
    item.querySelector('.nav-text').style.color = "#FFF";
    item.querySelector('img').src = "/icons/active-paper-icon.svg";
}

// Function to remove the hover effect
function removeHoverEffect(item) {
    const hoverEffect = item.querySelector('.hover-effect');
    gsap.to(hoverEffect, { scale: 0, duration: 0.3 });
    item.querySelector('.nav-text').style.color = "#000";
    item.querySelector('img').src = "/icons/paper-icon.svg";
}

// Initialize all nav items to their default state
function initializeNavItems() {
    document.querySelectorAll('.nav-item').forEach(item => {
        removeHoverEffect(item);
    });
}

// Function to create a ScrollTrigger for a section
function createSectionTrigger(sectionSelector, navItemIndex) {
    const navItem = document.querySelectorAll('.nav-item')[navItemIndex];

    ScrollTrigger.create({
        trigger: sectionSelector,
        start: 'top center',
        end: 'center end',
        onEnter: () => applyHoverEffect(navItem),
        onLeave: () => removeHoverEffect(navItem),
        onEnterBack: () => applyHoverEffect(navItem),
        onLeaveBack: () => removeHoverEffect(navItem)
    });
}

// Initialize navigation items and set up triggers
document.addEventListener('DOMContentLoaded', () => {
    initializeNavItems();
    createSectionTrigger('.page-2', 0);
    createSectionTrigger('.page-3', 1);
    // ... Add more as needed
});

  
  
  document.querySelectorAll('.nav-item').forEach(item => {
    const hoverEffect = item.querySelector('.hover-effect');
    const textElement = item.querySelector('.nav-text');
    const image = item.querySelector('img');

    const defaultImageSrc = "/icons/paper-icon.svg"; // Default image source
    const activeImageSrc = "/icons/active-paper-icon.svg"; // Active image source

    item.addEventListener('click', (e) => {
        // Deactivate all other items
        document.querySelectorAll('.nav-item').forEach(otherItem => {
            if (otherItem !== item) {
                gsap.to(otherItem.querySelector('.hover-effect'), { 
                    scale: 0, 
                    duration: 0.3, 
                    ease: "cubic-bezier(0.133333, 0.06, 0.25, 1)",
                    onComplete: () => {
                        otherItem.querySelector('.nav-text').style.color = "#000"; 
                        otherItem.querySelector('img').src = defaultImageSrc;
                    }
                });
            }
        });

        // Check if the item is already scaled
        const isScaled = gsap.getProperty(hoverEffect, "scale") === 1;

        // Toggle the scale of the clicked item's hover effect
        gsap.to(hoverEffect, {
            scale: isScaled ? 0 : 1,
            duration: 0.3,
            ease: 'power1.out',
            onComplete: () => {
                // Change the text color and image source after the animation
                textElement.style.color = isScaled ? "#000" : "#FFF";
                image.src = isScaled ? defaultImageSrc : activeImageSrc;
            }
        });
    });
});


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
        },
    }]
})

function pageTransition() {

    var tl = gsap.timeline();

    tl.to('ul.morph li', { duration: 1, scaleY: 1, transformOrigin: "bottom left", ease: "cubic-bezier(0.3, 0.0, 0.8, 0.15)"})
    tl.to('ul.morph li', { duration: .8, scaleY: 0, transformOrigin: "bottom left", ease: "	cubic-bezier(0.05, 0.7, 0.1, 1.0)"})
    return tl;
}

function contentAnimation() {
    var tl = gsap.timeline(); 

    tl.from('.hero-text', { duration: 1, translateY: -50, opacity: 0, delay: .25})
}

function delay(n) {
    n = n || 2000;
    return new Promise(done => {
        setTimeout(() => {
            done();
        }, n);
    });
}


