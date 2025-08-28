const projectsContainer = document.getElementById("projects");
const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

// Mobile navigation toggle
const menuToggleButton = document.querySelector(".menu-toggle");
if (menuToggleButton) {
  menuToggleButton.addEventListener("click", () => {
    const expanded = menuToggleButton.getAttribute("aria-expanded") === "true";
    menuToggleButton.setAttribute("aria-expanded", String(!expanded));
  });
  // Close menu on navigation link click
  document.querySelectorAll(".site-header .nav a").forEach((link) => {
    link.addEventListener("click", () => menuToggleButton.setAttribute("aria-expanded", "false"));
  });
  // Close if resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      menuToggleButton.setAttribute("aria-expanded", "false");
    }
  });
  // Close with Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menuToggleButton.setAttribute("aria-expanded", "false");
  });
}

// Theme toggle (light/dark) with localStorage persistence
const themeToggle = document.getElementById('theme-toggle');
const applyTheme = (mode) => {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem('theme', mode);
};
const preferred = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');
applyTheme(preferred);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
    applyTheme(next);
  });
}

// Smooth scroll and active section highlighting
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

const sectionObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const id = entry.target.getAttribute('id');
    if (entry.isIntersecting && id) {
      document.querySelectorAll('#primary-nav a').forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0.1 }) : null;
if (sectionObserver) {
  document.querySelectorAll('section[id]').forEach((s) => sectionObserver.observe(s));
}

// Testimonials carousel
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const items = track ? Array.from(track.children) : [];
  let index = 0;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };
  carousel.querySelector('[data-prev]')?.addEventListener('click', () => { index = (index - 1 + items.length) % items.length; update(); });
  carousel.querySelector('[data-next]')?.addEventListener('click', () => { index = (index + 1) % items.length; update(); });
});

// Contact form validation (client-side only as example)
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');
  const endpointEl = document.getElementById('contact-endpoint');
  const endpoint = endpointEl ? endpointEl.value : '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
    const name = /** @type {HTMLInputElement} */(document.getElementById('name'));
    const email = /** @type {HTMLInputElement} */(document.getElementById('email'));
    const message = /** @type {HTMLTextAreaElement} */(document.getElementById('message'));
    if (!name.value.trim()) { name.nextElementSibling.textContent = 'Please enter your name.'; valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.nextElementSibling.textContent = 'Please enter a valid email.'; valid = false; }
    if (!message.value.trim()) { message.nextElementSibling.textContent = 'Please enter a message.'; valid = false; }
    if (!valid) { status.textContent = 'Please correct the errors above.'; return; }

    if (!endpoint) {
      // Fallback: open mailto with prefilled subject/body
      const subject = encodeURIComponent('Portfolio Inquiry');
      const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`);
      window.location.href = `mailto:perezjazaelr@gmail.com?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email client...';
      return;
    }

    // Submit via fetch to endpoint (e.g., Formspree)
    status.textContent = 'Sending...';
    submitBtn && (submitBtn.disabled = true);

    const payload = new FormData(form);
    fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { 'Accept': 'application/json' }
    })
    .then(async (res) => {
      if (res.ok) {
        status.textContent = 'Thanks! Your message has been sent.';
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        if (data && data.errors && Array.isArray(data.errors)) {
          status.textContent = data.errors.map((e) => e.message).join(', ');
        } else {
          status.textContent = 'Sorry, there was a problem sending your message.';
        }
      }
    })
    .catch(() => {
      status.textContent = 'Network error. Please try again later.';
    })
    .finally(() => {
      submitBtn && (submitBtn.disabled = false);
    });
  });
}

// Page load animations: mark onload targets, then reveal with stagger
document.addEventListener('DOMContentLoaded', () => {
  // Mark elements for onload animation
  document.querySelectorAll('[data-onload]').forEach((el, i) => {
    el.style.opacity = '0';
    el.dataset.staggerIndex = i;
  });

  // Reveal elements with stagger
  setTimeout(() => {
    document.querySelectorAll('[data-onload]').forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, i * 100);
    });
  }, 100);

  // Looping typewriter effect for headings with data-typewriter
  const typeEls = document.querySelectorAll('.typewriter[data-typewriter]');
  typeEls.forEach((el) => {
    const full = (el.getAttribute('data-typewriter') || el.textContent || '').trim();
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { el.textContent = full; return; }

    let index = 0;
    let direction = 1; // 1 = typing, -1 = deleting
    el.textContent = '';

    const step = () => {
      index += direction;
      if (index < 0) { index = 0; direction = 1; setTimeout(step, 600); return; }
      if (index > full.length) { index = full.length; direction = -1; setTimeout(step, 1200); return; }
      el.textContent = full.slice(0, index);
      const base = 55; // base ms per character
      const jitter = Math.random() * 45; // humanized speed
      setTimeout(step, base + jitter);
    };

    // kick off after a short delay
    setTimeout(step, 300);
  });
});

// ===================== CHATBOT FUNCTIONALITY =====================
class Chatbot {
  constructor() {
    this.isOpen = false;
    this.faqData = {
      'skills': 'I specialize in HTML, CSS, JavaScript, Python, and PHP. I focus on creating responsive, accessible websites with smooth animations and modern design principles.',
      'experience': 'I have experience as an IT Personnel at Barangay Namayan, working as a Graphic Artist for Fire and Rescue, and completed an internship at Polaris in Makati. I handle PR, graphic design, and IT support.',
      'projects': 'I work on UI/UX design, front-end development, and graphic design projects. My work includes responsive websites, design systems, wireframes, and brand assets.',
      'contact': 'You can reach me through the contact form on this page, or download my resume from the navigation menu. I\'m always open to new opportunities and collaborations.',
      'education': 'I\'m a 4th-year student pursuing a Bachelor of Science in Information Technology at Rizal Technological University.',
      'services': 'I offer UI/UX design, front-end development, and graphic design services. I create responsive websites, design systems, wireframes, and brand assets.',
      'location': 'I\'m based in Mandaluyong City, Philippines.',
      'age': 'I\'m 22 years old and passionate about technology and programming.',
      'help': 'I can help you learn about my skills, experience, projects, services, education, and how to contact me. Just ask me anything!',
      'hello': 'Hello! I\'m here to help you learn more about Jazael\'s portfolio. What would you like to know?',
      'hi': 'Hi there! I\'m your FAQ assistant. Feel free to ask me anything about Jazael\'s work, skills, or experience.',
      'thanks': 'You\'re welcome! Is there anything else you\'d like to know about Jazael\'s portfolio?',
      'thank you': 'You\'re welcome! Feel free to ask more questions about Jazael\'s work and experience.',
      'bye': 'Goodbye! Feel free to come back if you have more questions. Good luck with your project!',

      // Additional FAQs
      'availability': 'I\'m currently available for freelance and internship opportunities. Share your timeline and scope to get started.',
      'rates': 'Rates depend on project scope, timeline, and deliverables. Share details via the contact form and I\'ll provide an estimate.',
      'timeline': 'Typical small sites take 1-2 weeks; larger projects vary based on scope and revisions.',
      'tools': 'My toolkit includes VS Code, Figma, Git, GitHub, and Adobe tools. I\'m comfortable with modern web workflows.',
      'resume': 'You can download my resume from the navigation bar under “Resume.”',
      'social': 'You can reach me via the contact form. Social links can be shared on request.',
      'languages': 'I speak English and Filipino.',
      'freelance': 'Yes, I accept freelance work. Send your project details through the contact form.',
      'collaboration': 'I collaborate using GitHub, Figma, and common PM tools like Trello or Notion as needed.',
      'revisions': 'I typically include 1-2 revision rounds depending on the package. Extra rounds can be added.'
    };

    this.init();
  }

  init() {
    this.toggleBtn = document.getElementById('chatbot-toggle');
    this.interface = document.getElementById('chatbot-interface');
    this.closeBtn = document.getElementById('chatbot-close');
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.sendBtn = document.getElementById('chatbot-send');

    this.bindEvents();
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.interface.contains(e.target) && !this.toggleBtn.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.interface.classList.add('active');
    this.input.focus();
  }

  close() {
    this.isOpen = false;
    this.interface.classList.remove('active');
  }

  sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage(message, 'user');
    this.input.value = '';

    // Process and respond
    setTimeout(() => {
      const response = this.getResponse(message);
      this.addMessage(response, 'bot');
    }, 500);
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    
    contentDiv.appendChild(paragraph);
    messageDiv.appendChild(contentDiv);
    this.messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  getResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Synonym map to keys in faqData
    const intents = [
      { keys: ['skill', 'stack', 'technology', 'tech'], answer: 'skills' },
      { keys: ['experience', 'work history', 'background'], answer: 'experience' },
      { keys: ['project', 'portfolio', 'work samples'], answer: 'projects' },
      { keys: ['service', 'offer', 'what can you do'], answer: 'services' },
      { keys: ['contact', 'reach', 'email', 'get in touch'], answer: 'contact' },
      { keys: ['where', 'location', 'based'], answer: 'location' },
      { keys: ['how old', 'age'], answer: 'age' },
      { keys: ['availability', 'available', 'book', 'schedule'], answer: 'availability' },
      { keys: ['rate', 'price', 'pricing', 'cost', 'budget'], answer: 'rates' },
      { keys: ['timeline', 'turnaround', 'how long'], answer: 'timeline' },
      { keys: ['tool', 'software'], answer: 'tools' },
      { keys: ['resume', 'cv'], answer: 'resume' },
      { keys: ['social', 'linkedin', 'github'], answer: 'social' },
      { keys: ['language', 'speak'], answer: 'languages' },
      { keys: ['freelance', 'contract'], answer: 'freelance' },
      { keys: ['collaborate', 'collaboration'], answer: 'collaboration' },
      { keys: ['revision', 'revisions'], answer: 'revisions' },
      { keys: ['help', 'how does this', 'what can you answer'], answer: 'help' },
      { keys: ['hello', 'hey', 'hi'], answer: 'hello' },
      { keys: ['thank', 'thanks'], answer: 'thanks' },
      { keys: ['bye', 'goodbye'], answer: 'bye' }
    ];

    for (const intent of intents) {
      if (intent.keys.some((k) => lowerMessage.includes(k))) {
        return this.faqData[intent.answer] || this.faqData.help;
      }
    }

    // Default response for unrecognized questions
    return "I'm not sure about that specific question. You can ask about skills, services, projects, experience, availability, rates, or how to contact me.";
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Chatbot();
});

// Scroll-triggered animations using IntersectionObserver
const observer = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // If container is projects grid, also mark it for child stagger
      if (entry.target.id === 'projects') {
        entry.target.classList.add('is-visible');
      }
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }) : null;

if (observer) {
  document.querySelectorAll('.reveal:not([data-onload])').forEach((el) => observer.observe(el));
}
fetch("data/projects.json")
  .then((r) => r.json())
  .then((items) => {
    if (!Array.isArray(items)) return;
    projectsContainer.innerHTML = items.map((p) => projectCard(p)).join("");
    // After injecting projects, observe each card for staggered reveal
    const cards = projectsContainer.querySelectorAll('.project-card');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
      if (observer) observer.observe(card);
      else card.style.opacity = '1';
    });
  })
  .catch(() => {
    projectsContainer.innerHTML = "<p>Unable to load projects right now.</p>";
  });
function projectCard(p) {
  const tags = (p.tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
  
  // Truncate title to fit
  const title = (p.title || "Untitled").length > 30 
    ? (p.title || "Untitled").substring(0, 30) + "..."
    : (p.title || "Untitled");
  
  // Truncate description to fit
  const description = (p.description || "").length > 80 
    ? (p.description || "").substring(0, 80) + "..."
    : (p.description || "");
  
  // Highlight PHP text
  const highlightedDesc = description.replace(/PHP/gi, '<span style="color: #8993be; font-weight: 600;">PHP</span>');
  
  return [
    `<article class="project-card">`,
    `<img src="${p.image || "assets/img/projects/.gitkeep"}" alt="${title}">`,
    `<h3>${title}</h3>`,
    `<p>${highlightedDesc}</p>`,
    `<div class="tags">${tags}</div>`,
    p.url ? `<a class="btn" href="${p.url}" target="_blank" rel="noopener">Open</a>` : "",
    `</article>`
  ].join("");
}
