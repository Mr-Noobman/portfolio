document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // DOM ELEMENT SELECTIONS
    // =================================================================

    // General & Navigation
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const hiddenElements = document.querySelectorAll('.hidden');

    // Hamburger Menu
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav-links');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Hero Section
    const typingElement = document.getElementById('typing-subtitle');
    const hoverArea = document.querySelector('.profile-pic-frame-wrapper');
    const profileImageElement = document.querySelector('.profile-pic');

    // Projects Section
    const projectGrid = document.querySelector('.project-grid');
    const allCards = Array.from(document.querySelectorAll('.project-card'));
    const filterBtns = document.querySelectorAll('.filter-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const projectSliderContainer = document.querySelector('.project-slider-container'); // <-- Important selection for the fix

    // Project Modal
    const projectModal = document.getElementById('project-modal');
    const closeButton = projectModal?.querySelector('.close-button');
    const modalSliderInner = projectModal?.querySelector('.modal-image-slider .slider-inner');
    const modalPrevSlideBtn = projectModal?.querySelector('.slider-nav.prev-slide');
    const modalNextSlideBtn = projectModal?.querySelector('.slider-nav.next-slide');

    // Contact Section
    const copyEmailWrapper = document.getElementById('copy-email-wrapper');
    const emailTextElement = document.getElementById('email-text');
    const copyTooltip = document.getElementById('copy-tooltip');
    const form = document.getElementById('contact-form');
    const statusMessage = document.getElementById('form-status');


    // =================================================================
    // STATE & CONFIGURATION
    // =================================================================

    // Hero Subtitle Typing Effect
    const wordsToType = ["FullStack Web-Developer", "Graphic Designer", "Digital Marketing Expert"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    // Profile Picture Rotation
    const profileImages = ['./Files/Profile.jpg','./Files/Profile 2.jpg', './Files/Profile 3.jpg' ];
    let imageIndex = 0;
    let imageChangeInterval;

    // Project Slider & Modal
    let visibleCards = [];
    let currentModalImages = [];
    let scrollTimer = -1; // Timer for debouncing scroll events


    // =================================================================
    // FUNCTIONS
    // =================================================================

    // --- Navigation & Observers ---
    const updateActiveNavLink = (entries) => {
        let activeSectionId = '';
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSectionId = entry.target.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            const sectionId = link.getAttribute('href').substring(1);
            link.classList.toggle('active-link', sectionId === activeSectionId);
        });
    };

    const revealOnScroll = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    };

    // --- Hamburger Menu ---
    const toggleHamburgerMenu = () => {
        mobileNav.classList.toggle('active');
        const icon = hamburgerBtn.querySelector('i');
        const isActive = mobileNav.classList.contains('active');
        icon.classList.toggle('fa-bars', !isActive);
        icon.classList.toggle('fa-times', isActive);
    };

    const closeHamburgerMenu = () => {
        mobileNav.classList.remove('active');
        const icon = hamburgerBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    };

    // --- Hero Section ---
    const typeEffect = () => {
        if (!typingElement) return;
        const currentWord = wordsToType[wordIndex];
        const displayText = isDeleting ? currentWord.slice(0, charIndex - 1) : currentWord.slice(0, charIndex + 1);
        typingElement.textContent = displayText;
        let typeSpeed = isDeleting ? 75 : 150;
        if (!isDeleting && displayText === currentWord) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && displayText === '') {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % wordsToType.length;
            typeSpeed = 500;
        }
        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
        setTimeout(typeEffect, typeSpeed);
    };

    const changeProfileImage = () => {
        profileImageElement.style.opacity = 0;
        setTimeout(() => {
            profileImageElement.src = profileImages[imageIndex];
            imageIndex = (imageIndex + 1) % profileImages.length;
            profileImageElement.style.opacity = 1;
        }, 400);
    };

    const startImageRotation = () => {
        clearInterval(imageChangeInterval);
        imageChangeInterval = setInterval(changeProfileImage, 3000);
    };

    const stopImageRotation = () => clearInterval(imageChangeInterval);

    // --- Projects Section (NEW UNIFIED LOGIC) ---
    const updateButtonStates = () => {
        const scrollLeft = projectSliderContainer.scrollLeft;
        const scrollWidth = projectSliderContainer.scrollWidth;
        const clientWidth = projectSliderContainer.clientWidth;
        prevBtn.disabled = scrollLeft < 1;
        nextBtn.disabled = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
    };
    
    const filterProjects = (filter) => {
        allCards.forEach(card => {
            const isVisible = filter === 'all' || filter === card.dataset.category;
            card.style.display = isVisible ? 'flex' : 'none';
        });
        visibleCards = allCards.filter(card => card.style.display !== 'none');
        projectSliderContainer.scrollLeft = 0; // Reset scroll on filter
        updateButtonStates(); // Update buttons immediately
    };

    // --- Project Modal ---
    const updateModalImageSlider = (imageIndex) => {
        if (!currentModalImages || currentModalImages.length === 0) {
            modalSliderInner.innerHTML = '<p>No images available.</p>';
            modalPrevSlideBtn.style.display = 'none';
            modalNextSlideBtn.style.display = 'none';
            return;
        }
        const newIndex = Math.max(0, Math.min(imageIndex, currentModalImages.length - 1));
        modalSliderInner.innerHTML = `<img src="${currentModalImages[newIndex]}" alt="Project Image">`;
        modalSliderInner.dataset.currentImageIndex = newIndex;
        const showButtons = currentModalImages.length > 1;
        modalPrevSlideBtn.style.display = showButtons ? 'flex' : 'none';
        modalNextSlideBtn.style.display = showButtons ? 'flex' : 'none';
        modalPrevSlideBtn.disabled = newIndex === 0;
        modalNextSlideBtn.disabled = newIndex === currentModalImages.length - 1;
    };

    const openModal = (card) => {
        const { title, githubLink, liveLink, images, about, features, tech, challenges } = card.dataset;
        currentModalImages = (images || "").split(',').filter(img => img.trim() !== '');
        const modalTitle = projectModal.querySelector('.modal-title');
        const modalLinks = projectModal.querySelector('.modal-links');
        const modalAbout = projectModal.querySelector('.modal-about');
        const modalFeaturesList = projectModal.querySelector('.modal-features');
        const modalTechList = projectModal.querySelector('.modal-tech');
        const modalChallenges = projectModal.querySelector('.modal-challenges');
        modalTitle.textContent = title;
        modalAbout.textContent = about;
        modalChallenges.textContent = challenges;
        modalLinks.innerHTML = '';
        if (githubLink && githubLink !== '#') modalLinks.innerHTML += `<a href="${githubLink}" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a>`;
        if (liveLink && liveLink !== '#') modalLinks.innerHTML += `<a href="${liveLink}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>`;
        modalLinks.style.display = modalLinks.innerHTML === '' ? 'none' : 'block';
        const createListItems = (listElement, dataString) => {
            const dataArray = (dataString || "").split(',').filter(item => item.trim() !== '');
            listElement.innerHTML = '';
            const parentDiv = listElement.closest('div');
            if (!dataArray.length || dataArray[0] === '') {
                if (parentDiv) parentDiv.style.display = 'none';
                return;
            }
            if (parentDiv) parentDiv.style.display = 'block';
            dataArray.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listElement.appendChild(li);
            });
        };
        createListItems(modalFeaturesList, features);
        createListItems(modalTechList, tech);
        updateModalImageSlider(0);
        projectModal.classList.add('visible');
    };

    const closeModal = () => projectModal.classList.remove('visible');

    // --- Contact Section ---
    const handleCopyEmail = () => {
        navigator.clipboard.writeText(emailTextElement.innerText).then(() => {
            copyTooltip.style.display = 'inline';
            setTimeout(() => { copyTooltip.style.display = 'none'; }, 2000);
        }).catch(err => console.error('Failed to copy email: ', err));
    };

    const handleContactFormSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        statusMessage.innerHTML = "Sending...";
        statusMessage.className = '';
        statusMessage.style.display = 'block';
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                statusMessage.innerHTML = "Message sent successfully!";
                statusMessage.className = 'form-success';
                form.reset();
            } else {
                statusMessage.innerHTML = "Oops! There was a problem.";
                statusMessage.className = 'form-error';
            }
        } catch (error) {
            statusMessage.innerHTML = "Oops! There was a network error.";
            statusMessage.className = 'form-error';
        }
    };

    // ... after your other functions ...

// =================================================================
// PAGE FLIP NAVIGATION LOGIC
// =================================================================
const mainContent = document.querySelector('main');
const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

const handlePageFlip = (event) => {
    // 1. Prevent the browser's default instant jump
    event.preventDefault();

    const link = event.currentTarget;
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    // If the target doesn't exist, do nothing
    if (!targetElement) return;

    // 2. Add the class to start the "flip out" animation
    mainContent.classList.add('page-flip-out');

    // 3. Wait for the animation to finish (600ms, matching the CSS)
    setTimeout(() => {
        // 4. Calculate where the top of the section is, accounting for the fixed header
        const headerHeight = 70; // The height of your fixed header
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        // 5. Instantly scroll to the new position while the page is "invisible"
        window.scrollTo({
            top: targetPosition,
            behavior: 'instant' 
        });

        // 6. Remove the class to trigger the "flip in" animation
        mainContent.classList.remove('page-flip-out');

    }, 600); // This duration MUST match the 'transition' time in your CSS
};

// Add the click listener to all navigation links (desktop and mobile)
allNavLinks.forEach(link => {
    // Only apply to in-page links (that start with #)
    if (link.getAttribute('href').startsWith('#')) {
        link.addEventListener('click', handlePageFlip);
    }
});


    // =================================================================
    // EVENT LISTENERS
    // =================================================================

    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', toggleHamburgerMenu);
        mobileNavLinks.forEach(link => link.addEventListener('click', closeHamburgerMenu));
    }

    if (hoverArea && profileImageElement) {
        hoverArea.addEventListener('mouseenter', stopImageRotation);
        hoverArea.addEventListener('mouseleave', startImageRotation);
    }

    if (projectGrid) {
        // Project Filter Buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                btn.classList.add('active');
                filterProjects(btn.dataset.filter);
            });
        });

        // Project Arrow Buttons (New Logic)
        nextBtn.addEventListener('click', () => {
            const cardWidth = visibleCards[0]?.offsetWidth || 0;
            const gap = parseInt(window.getComputedStyle(projectGrid).gap) || 0;
            projectSliderContainer.scrollLeft += cardWidth + gap;
        });

        prevBtn.addEventListener('click', () => {
            const cardWidth = visibleCards[0]?.offsetWidth || 0;
            const gap = parseInt(window.getComputedStyle(projectGrid).gap) || 0;
            projectSliderContainer.scrollLeft -= cardWidth + gap;
        });
        
        // Manual Scroll Listener (New Logic)
        projectSliderContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateButtonStates, 100);
        });

        // Open Modal Listener
        allCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.github-link')) return;
                openModal(card);
            });
        });
    }
    
    if (projectModal && closeButton) {
        closeButton.addEventListener('click', closeModal);
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('visible')) closeModal();
        });
        modalNextSlideBtn.addEventListener('click', () => {
            let idx = parseInt(modalSliderInner.dataset.currentImageIndex || '0');
            updateModalImageSlider(idx + 1);
        });
        modalPrevSlideBtn.addEventListener('click', () => {
            let idx = parseInt(modalSliderInner.dataset.currentImageIndex || '0');
            updateModalImageSlider(idx - 1);
        });
    }

    if (copyEmailWrapper) copyEmailWrapper.addEventListener('click', handleCopyEmail);
    if (form) form.addEventListener('submit', handleContactFormSubmit);

    window.addEventListener('resize', () => {
        if(projectGrid) updateButtonStates();
    });

    // =================================================================
// DARK MODE TOGGLE LOGIC
// =================================================================

// Select both buttons and the body
const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
const body = document.body;

// Function to apply the saved theme on page load
const applyTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        // Update icons on both buttons
        themeToggleBtns.forEach(btn => {
            btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        });
    } else {
        body.classList.remove('dark-mode');
        themeToggleBtns.forEach(btn => {
            btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        });
    }
};

// Function to handle the toggle click
const toggleTheme = () => {
    body.classList.toggle('dark-mode');
    
    // Check the current theme and save it to localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }

    // Update the icons after the toggle
    applyTheme();
};

// Add click event listeners to both buttons
themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
});

// Apply the theme when the page initially loads
applyTheme();


    // =================================================================
    // INITIALIZATIONS
    // =================================================================

    const navObserver = new IntersectionObserver(updateActiveNavLink, { root: null, rootMargin: '0px', threshold: 0.4 });
    sections.forEach(section => navObserver.observe(section));

    const animationObserver = new IntersectionObserver(revealOnScroll, { threshold: 0.15 });
    hiddenElements.forEach(el => animationObserver.observe(el));

    if (typingElement) typeEffect();
    if (profileImageElement) {
        changeProfileImage();
        startImageRotation();
    }
    
    if (projectGrid) filterProjects('all');

});