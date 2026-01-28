import './style.css'

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
}


const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1'
      entry.target.style.transform = 'translateY(0)'
    }
  })
}, observerOptions)

document.addEventListener('DOMContentLoaded', () => {
  // existing cleanup (if present)
  const navList = document.querySelector('.nav-links');
  const mobileBtn = document.querySelector('.mobile-menu-btn');

  if (mobileBtn && navList) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', String(isOpen));
      // toggle page scroll lock when open
      document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    });

    // close on link click (mobile)
    navList.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      navList.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    });

    // close when clicking outside nav on small screens
    document.addEventListener('click', (e) => {
      if (!navList.classList.contains('open')) return;
      const insideNav = e.target.closest('.nav-content');
      if (!insideNav) {
        navList.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      }
    });

    // close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        navList.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      }
    });
  }

  // optional: remove nav items that don't match sections (existing helper)
  if (navList) {
    Array.from(navList.querySelectorAll('a[href^="#"]')).forEach(a => {
      const targetId = a.getAttribute('href').slice(1);
      if (!document.getElementById(targetId)) {
        const li = a.closest('li') || a;
        li.remove();
      }
    });
    if (navList.children.length === 0) navList.style.display = 'none';
  }

  const animatedElements = document.querySelectorAll('.feature-card, .step, .ecosystem-item, .impact-card, .pricing-card, .highlight, .vision-card, .mission-card, .problem-list li, .solution-content p, .business-card, .growth-card, .partnership-card, .advantage-list li, .vision-2026-content li, .investment-content li')
  animatedElements.forEach(el => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    observer.observe(el)
  })

  const navbar = document.querySelector('.navbar')
  window.addEventListener('scroll', () => {
    if (!navbar) return
    const currentScroll = window.pageYOffset

    navbar.style.boxShadow = currentScroll > 100
      ? '0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 4px 6px rgba(0, 0, 0, 0.1)'
  })

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const target = document.querySelector(anchor.getAttribute('href'))
      if (!target) return

      event.preventDefault()
      const offsetTop = target.offsetTop - 80
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    })
  })
})
