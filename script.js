document.addEventListener("DOMContentLoaded", () => {
  // Navigation functionality
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // Scroll to tours function
  window.scrollToTours = function() {
    const toursSection = document.getElementById('tours360') || document.querySelector('[href="#tours360"]');
    if (toursSection) {
      toursSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Scroll to booking function
  window.scrollToBooking = function() {
    const bookingBtn = document.querySelector('a[href*="tidycal.com"]');
    if (bookingBtn) {
      bookingBtn.click();
    } else {
      // Fallback: scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  };

  // Open map modal function
  window.openMapModal = function() {
    // For now, just open Google Maps in a new tab
    // In the future, this could open a modal with an embedded map
    const address = 'Apple Cottage, Silver Street, Creetown, Newton Stewart DG8 7HU';
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  // Enhanced sharing functionality
  const shareButtons = document.querySelectorAll('.js-share');
  shareButtons.forEach(button => {
    button.addEventListener('click', function() {
      const platform = this.dataset.platform;
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent('Apple Cottage Creetown - Beautiful property for sale');
      const description = encodeURIComponent('Energy-smart three-bed home with annex, EV charging & landscaped gardens. Offers over £300,000');
      
      let shareUrl = '';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'x':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${title}%20${url}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        
        // Track sharing event
        track('property_shared', {
          platform: platform,
          property_id: 'apple-cottage-creetown'
        });
      }
    });
  });

  // Copy link functionality
  const copyButtons = document.querySelectorAll('.js-copy');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        // Show success feedback
        const originalText = this.innerHTML;
        this.innerHTML = '<span class="share-icon">✅</span> Copied!';
        
        setTimeout(() => {
          this.innerHTML = originalText;
        }, 2000);
        
        // Track copy event
        track('property_link_copied', {
          property_id: 'apple-cottage-creetown'
        });
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.innerHTML = '<span class="share-icon">✅</span> Copied!';
        setTimeout(() => {
          this.innerHTML = '<span class="share-icon">🔗</span> Copy Link';
        }, 2000);
      });
    });
  });

  // Mobile action bar visibility
  let lastScrollY = window.scrollY;
  const mobileActionBar = document.getElementById('mobileActionBar');
  
  if (mobileActionBar) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show action bar on mobile when scrolling down past hero
      if (window.innerWidth <= 768) {
        if (currentScrollY > windowHeight * 0.5) {
          mobileActionBar.style.transform = 'translateY(0)';
        } else {
          mobileActionBar.style.transform = 'translateY(100%)';
        }
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Track key interactions for analytics
  const trackInteraction = (element, eventName) => {
    element.addEventListener('click', () => {
      track(eventName, {
        property_id: 'apple-cottage-creetown',
        timestamp: new Date().toISOString()
      });
    });
  };

  // Track important clicks
  const viewingButtons = document.querySelectorAll('a[href*="tidycal.com"]');
  viewingButtons.forEach(btn => trackInteraction(btn, 'viewing_booking_clicked'));

  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => trackInteraction(link, 'phone_number_clicked'));

  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(link => trackInteraction(link, 'email_clicked'));

  const tourButtons = document.querySelectorAll('.tour-trigger, .btn-accent');
  tourButtons.forEach(btn => trackInteraction(btn, 'virtual_tour_clicked'));

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      }
    }, { passive: true });
  }

  // Existing modal functionality
  const modal = document.getElementById("homeReportModal");
  const form = document.getElementById("homeReportForm");
  const formContainer = document.getElementById("homeReportFormContainer");
  const bookPrompt = document.getElementById("bookPrompt");
  const closeBtn = modal.querySelector(".modal-close");
  const noBookBtn = document.getElementById("noBook");
  const captchaQuestion = document.getElementById("captchaQuestion");
  const captchaAnswer = document.getElementById("captchaAnswer");

  // Analytics helper: prefer dataLayer events for GTM; fallback to gtag
  const track = (eventName, params = {}) => {
    try {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push(Object.assign({ event: eventName }, params));
      } else if (typeof window.gtag === "function") {
        window.gtag("event", eventName, params);
      }
    } catch (_) {}
  };

  // Consent handled by Silktide; GA4 loaded in head with Consent Mode defaults

  // Ensure modal elements start hidden (defensive)
  if (modal && !modal.classList.contains("hidden"))
    modal.classList.add("hidden");
  if (bookPrompt && !bookPrompt.classList.contains("hidden"))
    bookPrompt.classList.add("hidden");

  function openModal() {
    modal.classList.remove("hidden");
    try {
      // Save last focused element to restore later
      openModal.lastFocus = document.activeElement;
    } catch (_) {}
    // Focus first input for accessibility
    const first = form && form.querySelector("#firstName");
    if (first) first.focus();

    // Enable focus trap inside modal
    if (openModal.trapCleanup) {
      try {
        openModal.trapCleanup();
      } catch (_) {}
    }
    openModal.trapCleanup = enableFocusTrap(modal);
  }

  // Gallery performance & UX: progressive load with IntersectionObserver, concurrency cap, counts, and spinners
  const accordion = document.querySelector(".gallery-accordion");
  if (accordion) {
    const MAX_CONCURRENT = 3;
    let loadingCount = 0;
    const queue = [];
    const supportsIO = typeof window.IntersectionObserver === "function";

    const updateCounts = () => {
      accordion.querySelectorAll("details").forEach((d) => {
        const imgs = Array.from(d.querySelectorAll("img[data-src], img[src]"));
        const total = imgs.length;
        const loaded = imgs.filter(
          (img) => img.getAttribute("src") && img.complete
        ).length;
        const countEl = d.querySelector("summary .count");
        if (!countEl) return;
        if (!total) {
          countEl.textContent = "";
          return;
        }
        countEl.textContent =
          loaded < total ? `(${loaded}/${total} loading…)` : `(${total})`;
      });
    };

    const pump = () => {
      while (loadingCount < MAX_CONCURRENT && queue.length) {
        const img = queue.shift();
        if (img.getAttribute("src")) continue;
        const wrap = img.closest(".img-wrap");
        if (wrap) {
          wrap.classList.add("loading");
          wrap.setAttribute("aria-busy", "true");
        }
        if (img.dataset.priority === "high")
          img.setAttribute("fetchpriority", "high");
        else img.setAttribute("fetchpriority", "low");
        // Hydrate <picture> sources if present
        const pic = img.closest("picture");
        if (pic) {
          pic.querySelectorAll("source[data-srcset]").forEach((source) => {
            if (!source.getAttribute("srcset"))
              source.setAttribute("srcset", source.dataset.srcset);
          });
        }
        if (img.dataset.srcset && !img.getAttribute("srcset")) {
          img.setAttribute("srcset", img.dataset.srcset);
        }
        img.src = img.dataset.src;
        loadingCount++;
      }
    };

    const enqueue = (img, high = false) => {
      if (img.__queued) return;
      img.__queued = true;
      if (high) img.dataset.priority = "high";
      high ? queue.unshift(img) : queue.push(img);
      pump();
    };

    const onImgLoad = (e) => {
      const wrap = e.target.closest(".img-wrap");
      if (wrap) {
        wrap.classList.remove("loading");
        wrap.setAttribute("aria-busy", "false");
        wrap.classList.add("loaded");
      }
      loadingCount = Math.max(0, loadingCount - 1);
      updateCounts();
      pump();
    };

    // attach load/error handlers
    accordion.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", onImgLoad, { once: true });
      img.addEventListener("error", onImgLoad, { once: true });
    });

    let io = null;
    if (supportsIO) {
      // IO observes images within opened sections; preloads slightly before
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const img = entry.target;
            if (entry.isIntersecting) {
              io.unobserve(img);
              enqueue(img);
            }
          });
        },
        { root: null, rootMargin: "200px 0px", threshold: 0.01 }
      );
    }

    const observeSection = (d) => {
      const imgs = Array.from(d.querySelectorAll("img[data-src]"));
      // Eagerly queue all in opened section; throttling handled by pump()
      imgs.forEach((img, i) => enqueue(img, i < 2));
      updateCounts();
    };

    // Observe when sections are opened
    accordion.querySelectorAll("details").forEach((d) => {
      d.addEventListener("toggle", () => {
        if (d.open) observeSection(d);
      });
    });

    // Kick off for initially open sections
    accordion
      .querySelectorAll("details[open]")
      .forEach((d) => observeSection(d));
    // Safety: after a short delay, ensure at least first image of each section is queued
    setTimeout(() => {
      accordion.querySelectorAll("details").forEach((d) => {
        const first = d.querySelector("img[data-src]");
        if (first && !first.getAttribute("src")) enqueue(first, true);
      });
    }, 600);
  }

  // Lazy load videos (360 tours) when visible
  const lazyVideos = Array.from(
    document.querySelectorAll('video[data-lazy="true"]')
  );
  if (lazyVideos.length) {
    const hydrateVideo = (v) => {
      let changed = false;
      v.querySelectorAll("source[data-src]").forEach((s) => {
        if (!s.src && s.dataset.src) {
          s.src = s.dataset.src;
          changed = true;
        }
      });
      if (changed) {
        try {
          v.load();
        } catch (_) {}
      }
      return changed;
    };
    if (typeof window.IntersectionObserver === "function") {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            hydrateVideo(e.target);
            vio.unobserve(e.target);
          });
        },
        { root: null, rootMargin: "200px 0px", threshold: 0.01 }
      );
      lazyVideos.forEach((v) => vio.observe(v));
    } else {
      // Fallback: hydrate immediately
      lazyVideos.forEach(hydrateVideo);
    }

    // Also hydrate on first user interaction or when playback is requested
    lazyVideos.forEach((v) => {
      const onAttemptPlay = () => {
        hydrateVideo(v);
      };
      v.addEventListener("play", onAttemptPlay, { once: true });
      v.addEventListener("click", onAttemptPlay, { once: true });
      v.addEventListener("pointerdown", onAttemptPlay, { once: true });
    });
  }

  // VR viewer play buttons -> start underlying <video> so A‑Frame updates the sphere
  document.querySelectorAll(".vr-play").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-target");
      const v = document.getElementById(id);
      if (!v) return;
      const viewer = btn.closest(".vr-viewer");
      const scene = viewer ? viewer.querySelector("a-scene") : null;
      // Hide poster image if present
      const posterImg = btn.closest(".vr-viewer")?.querySelector(".vr-poster");
      if (posterImg) posterImg.style.display = "none";
      // ensure sources are set then play
      const changed = (function hydrateVideoOnce(video) {
        let changed = false;
        video.querySelectorAll("source[data-src]").forEach((s) => {
          if (!s.src && s.dataset.src) {
            s.src = s.dataset.src;
            changed = true;
          }
        });
        if (changed) {
          try {
            video.load();
          } catch (_) {}
        }
        return changed;
      })(v);
      // Try playing; if it fails or doesn't start, fall back to flat video
      const flat = viewer ? viewer.querySelector("video.flat-video") : null;
      const showFlat = () => {
        if (!flat) return;
        flat.querySelectorAll("source[data-src]").forEach((s) => {
          if (!s.src && s.dataset.src) s.src = s.dataset.src;
        });
        try {
          flat.load();
        } catch (_) {}
        if (scene) scene.style.display = "none";
        flat.style.display = "block";
        try {
          flat.play();
        } catch (_) {}
      };

      // Make scene visible just before attempting to play
      if (scene) scene.style.display = "block";

      let played = false;
      try {
        await v.play();
        played = true;
      } catch (_) {
        /* will fallback below */
      }
      setTimeout(() => {
        const stalled = v.readyState < 2 || v.currentTime === 0;
        if (!played || stalled) {
          showFlat();
        } else {
          btn.style.display = "none";
        }
      }, 1200);
      v.addEventListener("error", showFlat, { once: true });
    });
  });

  // 360 viewer hints and fallback messaging
  document.querySelectorAll('#tours360 .vr-viewer').forEach((viewer) => {
    const show = (selector, ms = 2500) => {
      const el = viewer.querySelector(selector);
      if (!el) return;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), ms);
    };
    const playBtn = viewer.querySelector('.vr-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        setTimeout(() => show('.vr-hint.drag'), 800);
      });
    }
    const flat = viewer.querySelector('video.flat-video');
    if (flat) {
      const obs = new MutationObserver(() => {
        if (getComputedStyle(flat).display !== 'none') {
          show('.vr-hint.fallback');
          obs.disconnect();
        }
      });
      obs.observe(flat, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  });

  // Playback speed control for VR viewers (affects both 360 and flat videos)
  document.querySelectorAll(".vr-viewer").forEach((viewer) => {
    const speedSel = viewer.querySelector(".vr-speed");
    const setRate = (rate) => {
      const vids = viewer.querySelectorAll("video");
      vids.forEach((v) => {
        try {
          v.playbackRate = rate;
        } catch (_) {}
      });
    };
    if (speedSel) {
      speedSel.addEventListener("change", () =>
        setRate(parseFloat(speedSel.value) || 1)
      );
      setRate(parseFloat(speedSel.value) || 1);
    }
  });

  // Fullscreen control (tries scene first; falls back to native video fullscreen on iOS)
  document.querySelectorAll(".vr-fullscreen").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const viewer = btn.closest(".vr-viewer");
      if (!viewer) return;
      const scene = viewer.querySelector("a-scene");
      const flat = viewer.querySelector("video.flat-video");
      // Try element fullscreen (A-Frame canvas)
      const elem = scene || viewer;
      const req =
        elem.requestFullscreen ||
        elem.webkitRequestFullscreen ||
        elem.msRequestFullscreen;
      if (req) {
        try {
          await req.call(elem);
          return;
        } catch (_) {
          /* continue fallback */
        }
      }
      // iOS: use native video fullscreen
      if (flat) {
        // hydrate and show flat
        flat.querySelectorAll("source[data-src]").forEach((s) => {
          if (!s.src && s.dataset.src) s.src = s.dataset.src;
        });
        try {
          flat.load();
        } catch (_) {}
        flat.style.display = "block";
        const vfs = flat.webkitEnterFullscreen || flat.requestFullscreen;
        if (vfs) {
          try {
            vfs.call(flat);
          } catch (_) {}
        }
      }
    });
  });

  // Simple announcement banner for fresh media
  (function () {
    const key = "newContentNotice:v2";
    const banner = document.getElementById("newContentBanner");
    const dismiss = document.getElementById("dismissAnnounce");
    if (!banner) return;
    try {
      const seen = localStorage.getItem(key);
      if (!seen) {
        banner.classList.remove("hidden");
      }
      if (dismiss)
        dismiss.addEventListener("click", () => {
          banner.classList.add("hidden");
          try {
            localStorage.setItem(key, String(Date.now()));
          } catch (_) {}
        });
      // Auto-hide after 10s but still mark seen
      setTimeout(() => {
        if (!banner.classList.contains("hidden")) {
          banner.classList.add("hidden");
          try {
            localStorage.setItem(key, String(Date.now()));
          } catch (_) {}
        }
      }, 10000);
    } catch (_) {}
  })();

  // 360 photo viewers: show A‑Frame sky on click
  document.querySelectorAll(".vr-photo .vr-photo-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewer = btn.closest(".vr-photo");
      if (!viewer) return;
      const poster = viewer.querySelector(".vr-poster");
      const scene = viewer.querySelector("a-scene");
      if (poster) poster.style.display = "none";
      if (scene) scene.style.display = "block";
      btn.style.display = "none";
    });
  });

  // Open 360 section if linked via hash
  (function () {
    const openTours = () => {
      if (location.hash === "#tours360") {
        const d = document.getElementById("tours360");
        if (d && !d.open) d.open = true;
        if (d) d.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("hashchange", openTours);
    openTours();
    // Also intercept clicks to force open
    document.querySelectorAll('a[href="#tours360"]').forEach((a) => {
      a.addEventListener("click", () => {
        const d = document.getElementById("tours360");
        if (d) d.open = true;
      });
    });
  })();

  function closeModal() {
    modal.classList.add("hidden");
    form.reset();
    formContainer.classList.remove("hidden");
    bookPrompt.classList.add("hidden");
    // Restore focus to opener if possible
    if (
      openModal.lastFocus &&
      typeof openModal.lastFocus.focus === "function"
    ) {
      try {
        openModal.lastFocus.focus();
      } catch (_) {}
    }
    if (openModal.trapCleanup) {
      try {
        openModal.trapCleanup();
      } catch (_) {}
    }
  }

  document.querySelectorAll(".request-report-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
      track("request_report_click", { location: "cta" });
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  noBookBtn.addEventListener("click", closeModal);
  noBookBtn.addEventListener("click", () => {
    track("decline_viewing_prompt", { source: "home_report_modal" });
  });

  // Track clicks to TidyCal (outbound)
  document.querySelectorAll('a[href^="https://tidycal.com"]').forEach((a) => {
    a.addEventListener("click", () => {
      track("book_viewing_click", {
        link_url: a.href,
        outbound: true,
        transport_type: "beacon",
      });
    });
  });

  // No local cookie banner logic (Silktide handles UI and storage)

  // Simple math captcha
  const a = Math.floor(2 + Math.random() * 8);
  const b = Math.floor(1 + Math.random() * 7);
  const answer = a + b;
  if (captchaQuestion) captchaQuestion.textContent = `What is ${a} + ${b}?`;

  // Lightbox for gallery images
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCaption");
  const lbClose = document.querySelector(".lightbox-close");
  const lbPrev = document.querySelector(".lightbox-prev");
  const lbNext = document.querySelector(".lightbox-next");

  const galleryImgs = Array.from(document.querySelectorAll(".gallery img"));
  let currentIndex = -1;
  const getCaption = (imgEl) => {
    const fig = imgEl.closest("figure");
    const fc = fig ? fig.querySelector("figcaption") : null;
    return (fc && fc.textContent.trim()) || imgEl.alt || "";
  };
  const showAt = (idx) => {
    if (!lb || !lbImg) return;
    if (idx < 0) idx = galleryImgs.length - 1;
    if (idx >= galleryImgs.length) idx = 0;
    currentIndex = idx;
    const imgEl = galleryImgs[currentIndex];
    lbImg.src = imgEl.currentSrc || imgEl.src;
    lbImg.alt = imgEl.alt || "";
    if (lbCap) lbCap.textContent = getCaption(imgEl);
  };
  const openLightbox = (idxOrImg) => {
    const idx =
      typeof idxOrImg === "number" ? idxOrImg : galleryImgs.indexOf(idxOrImg);
    if (idx < 0) return;
    showAt(idx);
    lb.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const imgEl = galleryImgs[idx];
    track("lightbox_open", {
      src: imgEl.currentSrc || imgEl.src,
      alt: imgEl.alt || "",
    });
    if (openLightbox.trapCleanup) {
      try {
        openLightbox.trapCleanup();
      } catch (_) {}
    }
    openLightbox.trapCleanup = enableFocusTrap(lb);
  };
  const closeLightbox = () => {
    if (!lb) return;
    lb.classList.add("hidden");
    document.body.style.overflow = "";
    if (openLightbox.trapCleanup) {
      try {
        openLightbox.trapCleanup();
      } catch (_) {}
    }
  };
  const nextImg = () => showAt(currentIndex + 1);
  const prevImg = () => showAt(currentIndex - 1);

  galleryImgs.forEach((img, i) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      if (!img.src) return;
      openLightbox(i);
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", prevImg);
  if (lbNext) lbNext.addEventListener("click", nextImg);
  if (lb)
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLightbox();
    });
  window.addEventListener("keydown", (e) => {
    // Close modal on Escape
    if (!modal.classList.contains("hidden") && e.key === "Escape") {
      closeModal();
      return;
    }
    // Lightbox navigation
    if (lb && !lb.classList.contains("hidden")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "ArrowLeft") prevImg();
    }
  });

  // Sticky CTA -> open report modal
  document.querySelectorAll(".js-open-report").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
      track("request_report_click", { location: "sticky_cta" });
    });
  });

  // Register Interest form
  // Register Interest form removed per request

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Abort if honeypot filled
    if (form.company && form.company.value) {
      return; // silently drop
    }
    // Validate captcha
    if (
      !captchaAnswer ||
      String(answer) !== String(captchaAnswer.value).trim()
    ) {
      alert("Please answer the security question correctly.");
      return;
    }
    const data = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      phone: form.phone.value,
      hear: form.hear.value,
    };
    try {
      const res = await fetch(
        "https://formsubmit.co/ajax/56ed50dfa1ad28cde3aeb234e8fbaff1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Network response was not ok");
      // Track successful lead + download
      track("generate_lead", { form_id: "home_report" });
      track("home_report_download", { file: "HR-Apple-Cottage.pdf" });

      // Trigger PDF download
      const link = document.createElement("a");
      link.href = "HR-Apple-Cottage.pdf";
      link.download = "HR-Apple-Cottage.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      formContainer.classList.add("hidden");
      bookPrompt.classList.remove("hidden");
    } catch (err) {
      track("lead_submit_error", { form_id: "home_report" });
      alert("There was a problem submitting the form. Please try again later.");
    }
  });

  // Panoramas: fetch manifest and render a grid of 360 photo viewers
  (async function renderPanos() {
    try {
      const wrap = document.querySelector("#panoramas .pano-grid");
      if (!wrap) return;
      const res = await fetch("data/panos.json", { cache: "no-cache" });
      if (!res.ok) return;
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      items.forEach((p) => {
        const fig = document.createElement("figure");
        fig.innerHTML = `
          <div class="img-wrap vr-photo" style="aspect-ratio:2/1; position:relative;">
            <picture>
              <source type="image/webp" srcset="${p.srcWebp}">
              <img class="vr-poster" src="${p.srcJpg}" alt="${
          p.title || "Panorama"
        }" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:8px;"/>
            </picture>
            <a-scene embedded vr-mode-ui="enabled: false" loading-screen="enabled: false" renderer="antialias: true; precision: high" style="display:none; position:absolute; inset:0;">
              <a-sky src="${p.srcJpg}" rotation="0 -90 0"></a-sky>
            </a-scene>
            <button class="vr-photo-play" aria-label="View panorama" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); padding:.6rem 1rem; background:#00000099; color:#fff; border:1px solid #ffffff66; border-radius:6px; font-weight:700; cursor:pointer;">View 360</button>
          </div>
          <figcaption>${p.title || "Panorama"}</figcaption>
        `;
        wrap.appendChild(fig);
      });

      // Wire up play buttons for newly added viewers
      document
        .querySelectorAll("#panoramas .vr-photo .vr-photo-play")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const viewer = btn.closest(".vr-photo");
            if (!viewer) return;
            const poster = viewer.querySelector(".vr-poster");
            const scene = viewer.querySelector("a-scene");
            if (poster) poster.style.display = "none";
            if (scene) scene.style.display = "block";
            btn.style.display = "none";
          });
        });
      // Update count
      const countEl = document.querySelector("#panoramas summary .count");
      if (countEl)
        countEl.textContent = items.length ? `(${items.length})` : "";
    } catch (_) {}
  })();

  // Social sharing buttons
  const shareBtns = document.querySelectorAll(".js-share");
  const copyBtn = document.querySelector(".js-copy");
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent("Apple Cottage, Creetown");
  shareBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-platform");
      let url = "";
      if (p === "facebook")
        url = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (p === "x")
        url = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      if (p === "whatsapp")
        url = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
      if (p === "email") url = `mailto:?subject=${pageTitle}&body=${pageUrl}`;
      if (url) window.open(url, "_blank", "noopener");
    });
  });
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(window.location.href);
        } else {
          const ta = document.createElement("textarea");
          ta.value = window.location.href;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        alert("Link copied");
      } catch (_) {}
    });
  }
});

// Enable a focus trap within a container element; returns a cleanup function
function enableFocusTrap(container) {
  const FOCUSABLE =
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const getFocusable = () =>
    Array.from(container.querySelectorAll(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
    );
  const handler = (e) => {
    if (e.key !== "Tab") return;
    const nodes = getFocusable();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey) {
      if (
        document.activeElement === first ||
        !container.contains(document.activeElement)
      ) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (
        document.activeElement === last ||
        !container.contains(document.activeElement)
      ) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  container.addEventListener("keydown", handler);
  return () => container.removeEventListener("keydown", handler);
}

/* =================================================================
   FLOOR PLANS FUNCTIONALITY
   ================================================================= */

// Floor Plans Tab Navigation
function initializeFloorPlans() {
  const tabs = document.querySelectorAll('.floorplan-tab');
  const panels = document.querySelectorAll('.floorplan-panel');
  
  // Tab switching functionality
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      switchFloorPlanTab(targetId);
      
      // Track floor plan interaction
      track('floorplan_viewed', {
        plan_type: targetId,
        property_id: 'apple-cottage-creetown'
      });
    });
    
    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = Array.from(tabs).indexOf(tab);
        let nextIndex;
        
        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      }
    });
  });
}

function switchFloorPlanTab(targetId) {
  const tabs = document.querySelectorAll('.floorplan-tab');
  const panels = document.querySelectorAll('.floorplan-panel');
  
  // Update tabs
  tabs.forEach(tab => {
    const isActive = tab.dataset.target === targetId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });
  
  // Update panels
  panels.forEach(panel => {
    const isActive = panel.id.includes(targetId);
    panel.classList.toggle('active', isActive);
    panel.style.display = isActive ? 'block' : 'none';
    
    if (isActive) {
      // Focus the panel for screen readers
      panel.focus();
    }
  });
}

// Format Toggle Functionality
function initializeFormatToggle() {
  const formatButtons = document.querySelectorAll('.format-btn');
  
  formatButtons.forEach(button => {
    button.addEventListener('click', () => {
      const format = button.dataset.format;
      const container = button.closest('.floorplan-panel');
      toggleFloorPlanFormat(container, format);
      
      // Update button states
      const siblingButtons = container.querySelectorAll('.format-btn');
      siblingButtons.forEach(btn => {
        const isActive = btn.dataset.format === format;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
      });
      
      // Track format change
      track('floorplan_format_changed', {
        format: format,
        plan_type: container.id,
        property_id: 'apple-cottage-creetown'
      });
    });
  });
}

function toggleFloorPlanFormat(container, format) {
  const images = container.querySelectorAll('.floorplan-image');
  
  images.forEach(img => {
    const isTargetFormat = img.dataset.format === format;
    img.classList.toggle('active', isTargetFormat);
    img.style.display = isTargetFormat ? 'block' : 'none';
  });
}

// Download Functionality
function initializeDownloads() {
  const downloadButtons = document.querySelectorAll('.download-btn');
  
  downloadButtons.forEach(button => {
    button.addEventListener('click', () => {
      const planType = button.dataset.plan;
      handleFloorPlanDownload(planType, button);
    });
  });
}

function handleFloorPlanDownload(planType, button) {
  // Track download attempt
  track('floorplan_download_started', {
    plan_type: planType,
    property_id: 'apple-cottage-creetown'
  });
  
  // Show loading state
  const originalText = button.innerHTML;
  button.innerHTML = '<span class="loading-spinner"></span> Preparing...';
  button.disabled = true;
  
  setTimeout(() => {
    try {
      if (planType === 'complete') {
        // Download complete plan pack PDF from CDN
        downloadFile('assets/floorplans-local/plan-pack.pdf', 'Apple-Cottage-Floor-Plans-Complete.pdf');
      } else {
        // Determine current format and plan
        const container = button.closest('.floorplan-panel');
        const activeFormatBtn = container.querySelector('.format-btn.active');
        const format = activeFormatBtn ? activeFormatBtn.dataset.format : 'svg';
        const filename = `${planType}.${format}`;
        const downloadName = `Apple-Cottage-${planType.replace('-', '-').replace(/\b\w/g, l => l.toUpperCase())}-Plan.${format}`;
        
        // Download from CDN
        downloadFile(`assets/floorplans-local/${filename}`, downloadName);
      }
      
      // Track successful download
      track('floorplan_download_completed', {
        plan_type: planType,
        property_id: 'apple-cottage-creetown'
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Track download error
      track('floorplan_download_error', {
        plan_type: planType,
        error: error.message,
        property_id: 'apple-cottage-creetown'
      });
      
      // Show error message
      showDownloadError(button);
    }
    
    // Restore button state
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 1000);
  }, 800);
}

function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showDownloadError(button) {
  const originalText = button.innerHTML;
  button.innerHTML = '<span style="color: #dc3545;">⚠ Error</span>';
  button.style.background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = '';
  }, 3000);
}

// 3D Model Functionality
function initialize3DModel() {
  const modelViewer = document.querySelector('#cottage-model');
  
  if (!modelViewer) return;
  
  // Handle model loading events
  modelViewer.addEventListener('load', () => {
    console.log('3D model loaded successfully');
    track('3d_model_loaded', {
      property_id: 'apple-cottage-creetown'
    });
  });
  
  modelViewer.addEventListener('error', (error) => {
    console.error('3D model load error:', error);
    track('3d_model_error', {
      error: error.message,
      property_id: 'apple-cottage-creetown'
    });
  });
  
  // Handle AR button clicks
  const arButton = document.querySelector('.ar-button');
  if (arButton) {
    arButton.addEventListener('click', () => {
      track('ar_view_attempted', {
        property_id: 'apple-cottage-creetown',
        user_agent: navigator.userAgent
      });
    });
  }
  
  // Handle model interactions
  modelViewer.addEventListener('camera-change', debounce(() => {
    track('3d_model_interacted', {
      interaction_type: 'camera_change',
      property_id: 'apple-cottage-creetown'
    });
  }, 1000));
}

// Lazy Loading for Floor Plan Images
function initializeFloorPlanLazyLoading() {
  const floorPlanImages = document.querySelectorAll('.floorplan-image[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Preload the image
          const preloadImage = new Image();
          preloadImage.onload = () => {
            img.classList.add('loaded');
            track('floorplan_image_loaded', {
              plan_type: img.closest('.floorplan-panel').id,
              format: img.dataset.format,
              property_id: 'apple-cottage-creetown'
            });
          };
          preloadImage.src = img.src;
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    floorPlanImages.forEach(img => imageObserver.observe(img));
  }
}

// Keyboard Navigation Support
function initializeFloorPlanKeyboardNavigation() {
  const floorPlansSection = document.querySelector('#floorplans');
  
  if (!floorPlansSection) return;
  
  floorPlansSection.addEventListener('keydown', (e) => {
    // Handle Escape key to close details
    if (e.key === 'Escape' && floorPlansSection.hasAttribute('open')) {
      floorPlansSection.removeAttribute('open');
      floorPlansSection.querySelector('summary').focus();
    }
  });
}

// Error Handling and Fallbacks
function handleFloorPlanErrors() {
  const floorPlanImages = document.querySelectorAll('.floorplan-image');
  
  floorPlanImages.forEach(img => {
    img.addEventListener('error', () => {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'floorplan-error';
      fallbackDiv.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #6c757d; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px;">
          <p><strong>Floor plan unavailable</strong></p>
          <p>Please try refreshing the page or contact us for the floor plan.</p>
          <button class="btn" onclick="location.reload()">Refresh Page</button>
        </div>
      `;
      
      img.parentNode.replaceChild(fallbackDiv, img);
      
      track('floorplan_image_error', {
        image_src: img.src,
        plan_type: img.closest('.floorplan-panel').id,
        property_id: 'apple-cottage-creetown'
      });
    });
  });
}

// Initialize all floor plan functionality
function initializeAllFloorPlanFeatures() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFloorPlanFeatures);
    return;
  }
  
  try {
    initializeFloorPlans();
    initializeFormatToggle();
    initializeDownloads();
    initialize3DModel();
    initializeFloorPlanLazyLoading();
    initializeFloorPlanKeyboardNavigation();
    handleFloorPlanErrors();
    
    console.log('Floor plans functionality initialized successfully');
  } catch (error) {
    console.error('Error initializing floor plans:', error);
    track('floorplan_initialization_error', {
      error: error.message,
      property_id: 'apple-cottage-creetown'
    });
  }
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize floor plans when script loads
initializeAllFloorPlanFeatures();
