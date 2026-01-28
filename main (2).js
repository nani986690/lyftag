const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const navList = document.querySelector('.nav-links');
  const mobileBtn = document.querySelector('.mobile-menu-btn');

  if (mobileBtn && navList) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', String(isOpen));
      document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    });

    navList.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      navList.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    });

    document.addEventListener('click', (e) => {
      if (!navList.classList.contains('open')) return;
      const insideNav = e.target.closest('.nav-content');
      if (!insideNav) {
        navList.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        navList.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      }
    });
  }

  const animatedElements = document.querySelectorAll('.feature-card, .step, .ecosystem-item, .impact-card, .highlight, .vision-card, .mission-card, .problem-list li, .solution-content p, .business-card');

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.pageYOffset;

    navbar.style.boxShadow = currentScroll > 100
      ? '0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 4px 6px rgba(0, 0, 0, 0.1)';
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const referralLink = document.querySelector('.referral-link');
      if (referralLink) {
        navigator.clipboard.writeText(referralLink.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }
    });
  }

  const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!btn.closest('a') && !btn.classList.contains('copy-btn')) {
        e.preventDefault();
        const featuresSection = document.querySelector('#features');
        if (featuresSection) {
          const offsetTop = featuresSection.offsetTop - 80;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      }
    });
  });
});
