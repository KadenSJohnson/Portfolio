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
            duration: 0.5,
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
  