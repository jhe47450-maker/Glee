// Navigation module
import { AccessibleMenu } from '../ui.js';

export function initNavigation() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('nav ul');
  
  if (mobileMenuBtn && navMenu) {
    new AccessibleMenu('.mobile-menu-btn', 'nav ul');
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      
      if (target && href !== '#') {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        
        // Close mobile menu if open
        const menu = document.querySelector('nav ul');
        if (menu?.classList.contains('open')) {
          menu.classList.remove('open');
        }
      }
    });
  });

  // Active link highlighting
  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink);
}

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

export function initMobileOptimizations() {
  // Prevent layout shift on scroll
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth) {
    document.documentElement.style.overflow = 'overlay';
  }

  // Touch optimization: increase touch targets
  const inputs = document.querySelectorAll('input, select, textarea, button');
  inputs.forEach(input => {
    const style = window.getComputedStyle(input);
    const height = parseFloat(style.height);
    if (height < 44) {
      input.style.minHeight = '44px';
      input.style.minWidth = '44px';
    }
  });

  // Reduce animation for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
  }
}

export function initFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      const answer = question.nextElementSibling;

      // Close other open items
      faqQuestions.forEach(q => {
        if (q !== question && q.getAttribute('aria-expanded') === 'true') {
          q.setAttribute('aria-expanded', 'false');
          const nextAnswer = q.nextElementSibling;
          if (nextAnswer) nextAnswer.style.display = 'none';
        }
      });

      // Toggle current
      question.setAttribute('aria-expanded', !isExpanded);
      if (answer) {
        answer.style.display = isExpanded ? 'none' : 'block';
      }
    });
  });
}
