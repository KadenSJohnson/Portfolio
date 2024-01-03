document.addEventListener("DOMContentLoaded", function() {
    // Your code here
    const slideshowContainers = document.querySelectorAll('.slideshow-container');

    slideshowContainers.forEach((container) => {
        initSlideshow(container);
    });

    function initSlideshow(container) {
        let slideIndex = 1;

        // Show the first slide initially
        showSlides(container, slideIndex);

        // Event listeners for next/previous buttons
        let prevBtn = container.querySelector(".prev");
        let nextBtn = container.querySelector(".next");

        prevBtn.addEventListener("click", function () {
            plusSlides(container, -1);
        });

        nextBtn.addEventListener("click", function () {
            plusSlides(container, 1);
        });

        // Thumbnail image controls
        function plusSlides(container, n) {
            showSlides(container, (slideIndex += n), n);
        }
        
        function showSlides(container, n, direction) {
            let i;
            let slides = container.getElementsByClassName("mySlides");
        
            // Wrap around to the first or last slide if reaching the end
            if (n > slides.length) {
                slideIndex = 1;
            }
            if (n < 1) {
                slideIndex = slides.length;
            }
        
            // Hide all slides
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
        
            // Show the current slide
            slides[slideIndex - 1].style.display = "block";
        
            // Determine the animation class based on the direction
            let animationClass = direction === -1 ? "slide-left" : "slide-right";
        
            // Apply the animation class to the current slide
            slides[slideIndex - 1].classList.remove("slide-left", "slide-right");
            slides[slideIndex - 1].classList.add(animationClass);
        }
    }
});
