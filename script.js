document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links li a');
    const typedTextSpan = document.querySelector('.typed-text');
    const cursorSpan = document.querySelector('.cursor');
    const backToTopButton = document.querySelector('.back-to-top');
    const sections = document.querySelectorAll('main section[id]');
    const currentYearSpan = document.getElementById('currentYear');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // --- Textes pour l'effet de frappe ---
    const textArray = ["Développeur Web Junior.", "Passionné par l'innovation.", "Créatif et rigoureux.", "Étudiant en Informatique."];
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000; // Délai avant de commencer un nouveau texte
    let textArrayIndex = 0;
    let charIndex = 0;

    // --- Effet de frappe ---
    function type() {
        if (charIndex < textArray[textArrayIndex].length) {
            if(!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingDelay);
        } else {
            cursorSpan.classList.remove("typing");
            setTimeout(erase, newTextDelay);
        }
    }

    function erase() {
        if (charIndex > 0) {
            if(!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingDelay);
        } else {
            cursorSpan.classList.remove("typing");
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingDelay + 1100);
        }
    }

    // --- Menu Burger ---
    function toggleNav() {
        navLinks.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        // Empêcher le scroll du body quand le menu est ouvert
        document.body.style.overflow = navLinks.classList.contains('nav-active') ? 'hidden' : 'auto';
    }

    burger.addEventListener('click', toggleNav);

    // Fermer le menu quand on clique sur un lien
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-active')) {
                toggleNav();
            }
        });
    });

    // --- Header qui change au scroll ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // --- Bouton "Retour en Haut" ---
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }

        // --- Active Nav Link on Scroll ---
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinkItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
         // Gérer le cas où on est tout en haut (pour 'Accueil')
        if (window.scrollY < sections[0].offsetTop - header.offsetHeight) {
            navLinkItems.forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-links a[href="#hero"]').classList.add('active');
        }
    });
    
    // --- Animations de révélation au scroll ---
    const revealElements = document.querySelectorAll('.section-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optionnel: ne l'animer qu'une fois
            }
        });
    }, { threshold: 0.1 }); // Se déclenche quand 10% de l'élément est visible

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // --- Année actuelle pour le Footer ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Soumission du formulaire de contact (avec Web3Forms) ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.innerHTML = 'Envoi en cours...';
            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200) {
                    formStatus.innerHTML = `<span style="color: var(--secondary-color);">${jsonResponse.message || "Message envoyé avec succès !"}</span>`;
                    contactForm.reset(); // Réinitialise les champs du formulaire
                     // Faire disparaître le message après quelques secondes
                    setTimeout(() => { formStatus.innerHTML = ''; }, 5000);
                } else {
                    console.log(response);
                    formStatus.innerHTML = `<span style="color: #e74c3c;">${jsonResponse.message || "Une erreur s'est produite."}</span>`;
                }
            })
            .catch(error => {
                console.log(error);
                formStatus.innerHTML = `<span style="color: #e74c3c;">Oups ! Quelque chose s'est mal passé.</span>`;
            })
            .finally(() => {
                 // Réactiver le label flottant si nécessaire (cas où le form est reset)
                contactForm.querySelectorAll('input, textarea').forEach(input => {
                    if (input.value === '') {
                        input.nextElementSibling.classList.remove('label-active-on-reset');
                    }
                });
            });
        });
    }
    
    // Effet pour les labels flottants du formulaire de contact
    const formInputs = document.querySelectorAll('#contact-form input, #contact-form textarea');
    formInputs.forEach(input => {
        // Pour gérer le label au focus/blur et au remplissage
        input.addEventListener('focus', () => input.nextElementSibling.classList.add('focused'));
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.nextElementSibling.classList.remove('focused');
            }
        });
        // Gérer le cas où le champ est pré-rempli (autofill du navigateur)
        if (input.value !== '') {
            input.nextElementSibling.classList.add('focused');
        }
    });


    // --- Initialisation ---
    if (textArray.length) setTimeout(type, newTextDelay + 250); // Démarrer l'effet de frappe
});