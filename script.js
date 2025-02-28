// Smooth scrolling with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Get the target element
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Calculate the offset for fixed header (adjust 80 to match your header height)
            const offset = 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

            // Smooth scroll to the target position
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update the URL hash without jumping
            if (history.pushState) {
                history.pushState(null, null, targetId);
            } else {
                window.location.hash = targetId;
            }
        }
    });
});
