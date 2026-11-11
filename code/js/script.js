document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".site-nav");
  const navCollapse = document.getElementById("mainNavigation");
  const backToTop = document.getElementById("backToTop");
  const form = document.getElementById("enquiryForm");
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const formSuccess = document.getElementById("formSuccess");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  let activeImageIndex = 0;
  let lastFocusedElement = null;

  document.getElementById("currentYear").textContent = new Date().getFullYear();

  function updateScrollState() {
    const hasScrolled = window.scrollY > 35;
    navbar.classList.toggle("scrolled", hasScrolled);
    backToTop.classList.toggle("visible", window.scrollY > 500);
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  navCollapse.addEventListener("show.bs.collapse", function () {
    navbar.classList.add("menu-open");
  });
  navCollapse.addEventListener("hidden.bs.collapse", function () {
    navbar.classList.remove("menu-open");
  });
  navCollapse.querySelectorAll(".nav-link, .nav-book").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.bootstrap && window.innerWidth < 992) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (element) {
    revealObserver.observe(element);
  });

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  const today = localDateString(new Date());
  checkin.min = today;
  checkout.min = today;

  checkin.addEventListener("change", function () {
    checkout.min = checkin.value || today;
    if (checkout.value && checkout.value <= checkin.value) {
      checkout.value = "";
      checkout.classList.remove("is-invalid");
    }
  });

  function validateField(field) {
    let isValid = field.checkValidity();
    if (field === checkin && field.value && field.value < today) {
      isValid = false;
    }
    if (field === checkout && field.value && checkin.value && field.value <= checkin.value) {
      isValid = false;
    }
    field.classList.toggle("is-invalid", !isValid);
    field.classList.toggle("is-valid", isValid && field.value !== "");
    return isValid;
  }

  form.querySelectorAll("[required]").forEach(function (field) {
    field.addEventListener("input", function () {
      validateField(field);
      if (field === checkin && checkout.value) validateField(checkout);
    });
    field.addEventListener("change", function () {
      validateField(field);
      if (field === checkin && checkout.value) validateField(checkout);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const requiredFields = Array.from(form.querySelectorAll("[required]"));
    const isFormValid = requiredFields.map(validateField).every(Boolean);
    if (!isFormValid) {
      form.querySelector(".is-invalid").focus();
      return;
    }

    formSuccess.hidden = false;
    form.reset();
    checkout.min = today;
    form.querySelectorAll(".is-valid").forEach(function (field) {
      field.classList.remove("is-valid");
    });
    formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  formSuccess.querySelector(".success-dismiss").addEventListener("click", function () {
    formSuccess.hidden = true;
  });

  function showImage(index) {
    activeImageIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeImageIndex];
    const image = item.querySelector("img");
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = item.querySelector("span").textContent;
  }

  function openLightbox(index) {
    lastFocusedElement = document.activeElement;
    showImage(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      openLightbox(index);
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", function () {
    showImage(activeImageIndex - 1);
  });
  lightbox.querySelector(".lightbox-next").addEventListener("click", function () {
    showImage(activeImageIndex + 1);
  });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showImage(activeImageIndex + 1);
  });
});
