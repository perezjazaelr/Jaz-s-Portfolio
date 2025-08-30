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
console.log('Theme toggle element found:', themeToggle); // Debug log

const applyTheme = (mode) => {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem('theme', mode);
  console.log('Theme applied:', mode); // Debug log
  
  // Update button text to show current theme
  if (themeToggle) {
    themeToggle.textContent = mode === 'dark' ? '🌙 Dark' : '☀️ Light';
    console.log('Button text updated to:', themeToggle.textContent); // Debug log
  }
};

const preferred = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
console.log('Preferred theme:', preferred); // Debug log
applyTheme(preferred);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    const next = (current === 'dark') ? 'light' : 'dark';
    console.log('Theme toggle clicked. Current:', current, 'Next:', next); // Debug log
    applyTheme(next);
  });
  console.log('Theme toggle event listener added'); // Debug log
} else {
  console.error('Theme toggle button not found!'); // Debug log
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
  
  // Mobile-specific optimizations
  if (window.innerWidth <= 768) {
    // Add touch-friendly behavior
    document.body.classList.add('mobile-device');
    
    // Optimize scroll performance on mobile
    let ticking = false;
    const updateScroll = () => {
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    
    // Use passive scroll listeners for better mobile performance
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Add mobile-specific touch feedback
    document.querySelectorAll('.btn, .stack-item, .service-card, .project-card, .timeline-card').forEach(element => {
      element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        this.style.transform = '';
      }, { passive: true });
    });
  }
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

// ===================== CHATBOT FAQ SYSTEM =====================

// Comprehensive FAQ database with 100 questions and answers
const chatbotFAQs = [
  // ===================== PORTFOLIO & PROJECTS =====================
  {
    question: "What projects have you worked on?",
    answer: "I've worked on various projects including web applications, mobile apps, and full-stack solutions. Some notable ones include a real-time chat application, an e-commerce platform, and a project management tool. You can see detailed project information in my portfolio."
  },
  {
    question: "Can you show me your portfolio?",
    answer: "You're currently viewing my portfolio! It showcases my skills, projects, experience, and contact information. Feel free to explore the different sections to learn more about my work."
  },
  {
    question: "What technologies do you use?",
    answer: "I work with modern web technologies including HTML5, CSS3, JavaScript (ES6+), React, Node.js, Python, and various databases. I'm also experienced with cloud platforms like AWS and deployment tools."
  },
  {
    question: "How long have you been coding?",
    answer: "I've been passionate about coding for several years, continuously learning and improving my skills. I believe in lifelong learning and staying updated with the latest technologies and best practices."
  },
  {
    question: "What's your coding style?",
    answer: "I follow clean code principles, write maintainable and readable code, use proper documentation, and implement best practices. I believe in writing code that others can easily understand and maintain."
  },
  {
    question: "Do you have any open source contributions?",
    answer: "Yes, I contribute to open source projects when possible. I believe in giving back to the developer community and learning from collaborative development experiences."
  },
  {
    question: "What's your favorite programming language?",
    answer: "I enjoy working with JavaScript/TypeScript for frontend development and Python for backend and data processing. Each language has its strengths, and I choose based on project requirements."
  },
  {
    question: "How do you stay updated with technology?",
    answer: "I follow tech blogs, participate in developer communities, attend conferences, take online courses, and experiment with new technologies. Continuous learning is essential in this fast-evolving field."
  },
  {
    question: "What's your development workflow?",
    answer: "I follow an agile development approach with proper planning, development, testing, and deployment phases. I use version control, code reviews, and automated testing to ensure quality."
  },
  {
    question: "How do you handle project deadlines?",
    answer: "I use project management tools, break down tasks into manageable chunks, set realistic timelines, and communicate regularly with stakeholders. I prioritize tasks based on importance and urgency."
  },

  // ===================== PROFESSIONAL EXPERIENCE =====================
  {
    question: "What's your work experience?",
    answer: "I have experience working on various projects, collaborating with teams, and delivering solutions for different clients. My experience includes both freelance work and team-based development projects."
  },
  {
    question: "Have you worked in a team?",
    answer: "Yes, I've worked in collaborative team environments where I've learned the importance of communication, code reviews, and working together to achieve project goals."
  },
  {
    question: "What's your communication style?",
    answer: "I believe in clear, concise communication. I ask questions when needed, provide regular updates, and ensure everyone understands project requirements and progress."
  },
  {
    question: "How do you handle feedback?",
    answer: "I welcome constructive feedback as it helps me improve. I listen carefully, ask clarifying questions, and implement suggestions to deliver better results."
  },
  {
    question: "What's your problem-solving approach?",
    answer: "I analyze problems systematically, break them down into smaller parts, research solutions, and test different approaches. I'm not afraid to ask for help when needed."
  },
  {
    question: "How do you handle stress?",
    answer: "I maintain a balanced approach by prioritizing tasks, taking breaks when needed, and staying organized. I believe in sustainable work practices for long-term success."
  },
  {
    question: "What motivates you?",
    answer: "I'm motivated by solving complex problems, creating useful applications, learning new technologies, and seeing my work make a positive impact on users."
  },
  {
    question: "What are your career goals?",
    answer: "I aim to continue growing as a developer, work on challenging projects, contribute to meaningful solutions, and help others learn and grow in their development journey."
  },
  {
    question: "How do you handle failure?",
    answer: "I view failures as learning opportunities. I analyze what went wrong, learn from mistakes, and use those lessons to improve future work."
  },
  {
    question: "What's your learning philosophy?",
    answer: "I believe in continuous learning, being curious, and staying humble. There's always something new to learn, and I embrace challenges that push me to grow."
  },

  // ===================== TECHNICAL SKILLS =====================
  {
    question: "Are you good at debugging?",
    answer: "Yes, I'm experienced in debugging using various tools and techniques. I use console logs, debugging tools, and systematic approaches to identify and fix issues efficiently."
  },
  {
    question: "Do you write tests?",
    answer: "Absolutely! I write unit tests, integration tests, and use testing frameworks to ensure code quality and reliability. Testing is crucial for maintaining robust applications."
  },
  {
    question: "How do you handle security?",
    answer: "I follow security best practices, implement proper authentication, validate inputs, use HTTPS, and stay updated with security vulnerabilities and fixes."
  },
  {
    question: "What about performance optimization?",
    answer: "I optimize code performance by analyzing bottlenecks, using efficient algorithms, implementing caching strategies, and monitoring application performance metrics."
  },
  {
    question: "Do you use version control?",
    answer: "Yes, I use Git extensively for version control, branching strategies, and collaborative development. I follow best practices for commit messages and repository management."
  },
  {
    question: "How do you handle responsive design?",
    answer: "I use CSS Grid, Flexbox, media queries, and modern CSS techniques to create responsive designs that work perfectly on all devices and screen sizes."
  },
  {
    question: "What about accessibility?",
    answer: "I implement accessibility features like semantic HTML, ARIA labels, keyboard navigation, and screen reader support to ensure my applications are usable by everyone."
  },
  {
    question: "How do you handle cross-browser compatibility?",
    answer: "I test across different browsers, use CSS prefixes when needed, implement polyfills for older browsers, and follow web standards for maximum compatibility."
  },
  {
    question: "What about mobile development?",
    answer: "I create mobile-first responsive designs, optimize for touch interactions, ensure fast loading times, and test on various mobile devices and screen sizes."
  },
  {
    question: "How do you handle data management?",
    answer: "I use appropriate data structures, implement efficient database queries, handle state management properly, and ensure data consistency and integrity."
  },

  // ===================== PROJECT MANAGEMENT =====================
  {
    question: "How do you plan projects?",
    answer: "I start by understanding requirements, creating project timelines, breaking down tasks, identifying risks, and setting up project management tools for tracking progress."
  },
  {
    question: "What project management tools do you use?",
    answer: "I use tools like Trello, Asana, GitHub Projects, and Jira for task management, progress tracking, and team collaboration depending on project needs."
  },
  {
    question: "How do you estimate project time?",
    answer: "I break down tasks, consider complexity, factor in testing and debugging time, add buffer for unexpected issues, and base estimates on similar past projects."
  },
  {
    question: "How do you handle scope changes?",
    answer: "I assess the impact of changes, communicate with stakeholders, adjust timelines and resources accordingly, and ensure changes don't compromise project quality."
  },
  {
    question: "What about quality assurance?",
    answer: "I implement code reviews, automated testing, manual testing, and quality checks throughout development to ensure high-quality deliverables."
  },
  {
    question: "How do you handle documentation?",
    answer: "I maintain comprehensive documentation including code comments, README files, API documentation, and user guides to ensure maintainability and usability."
  },
  {
    question: "What about deployment?",
    answer: "I use CI/CD pipelines, automated testing, staging environments, and rollback strategies to ensure smooth and reliable deployments."
  },
  {
    question: "How do you handle maintenance?",
    answer: "I provide ongoing support, monitor applications, fix bugs, implement updates, and ensure applications remain secure and up-to-date."
  },
  {
    question: "What about user feedback?",
    answer: "I collect user feedback, analyze it systematically, prioritize improvements, and implement changes based on user needs and preferences."
  },
  {
    question: "How do you handle project closure?",
    answer: "I conduct project reviews, document lessons learned, hand over documentation, provide training if needed, and ensure smooth project completion."
  },

  // ===================== COLLABORATION & TEAMWORK =====================
  {
    question: "How do you work with designers?",
    answer: "I collaborate closely with designers, understand design requirements, provide technical feedback, and ensure designs are implemented accurately while maintaining functionality."
  },
  {
    question: "How do you handle conflicts?",
    answer: "I address conflicts directly, listen to different perspectives, find common ground, and work towards solutions that benefit the project and team."
  },
  {
    question: "What about code reviews?",
    answer: "I participate actively in code reviews, provide constructive feedback, learn from others' code, and ensure code quality and consistency across the team."
  },
  {
    question: "How do you share knowledge?",
    answer: "I document my work, share best practices, conduct knowledge sharing sessions, and help team members learn new technologies and approaches."
  },
  {
    question: "What about mentoring?",
    answer: "I enjoy mentoring junior developers, sharing my knowledge, providing guidance, and helping others grow in their development careers."
  },
  {
    question: "How do you handle remote work?",
    answer: "I'm experienced with remote collaboration, use communication tools effectively, maintain regular check-ins, and ensure clear communication despite physical distance."
  },
  {
    question: "What about time zones?",
    answer: "I'm flexible with different time zones, schedule meetings at convenient times for all parties, and ensure effective communication across different schedules."
  },
  {
    question: "How do you handle cultural differences?",
    answer: "I respect different cultures, adapt my communication style, learn about cultural norms, and ensure inclusive and respectful collaboration."
  },
  {
    question: "What about language barriers?",
    answer: "I communicate clearly, use simple language when needed, provide written documentation, and ensure understanding through confirmation and clarification."
  },
  {
    question: "How do you build team relationships?",
    answer: "I build trust through reliability, show interest in team members, participate in team activities, and create a positive and supportive work environment."
  },

  // ===================== PROBLEM SOLVING & INNOVATION =====================
  {
    question: "How do you approach complex problems?",
    answer: "I break down complex problems into smaller, manageable parts, research solutions, consult with others, and use systematic approaches to find the best solutions."
  },
  {
    question: "What about creative solutions?",
    answer: "I think outside the box, explore different approaches, consider user experience, and find innovative ways to solve problems while maintaining technical excellence."
  },
  {
    question: "How do you handle technical debt?",
    answer: "I identify technical debt, prioritize refactoring tasks, balance new features with maintenance, and ensure code quality doesn't suffer over time."
  },
  {
    question: "What about scalability?",
    answer: "I design systems with scalability in mind, use efficient algorithms, implement caching strategies, and ensure applications can handle growth and increased load."
  },
  {
    question: "How do you handle legacy code?",
    answer: "I analyze legacy code carefully, understand its purpose, refactor gradually, maintain functionality, and improve code quality without breaking existing features."
  },
  {
    question: "What about new technologies?",
    answer: "I evaluate new technologies based on project needs, consider learning curves, assess community support, and implement them when they provide clear benefits."
  },
  {
    question: "How do you handle technical challenges?",
    answer: "I research solutions, consult documentation, seek help from the community, experiment with different approaches, and learn from each challenge."
  },
  {
    question: "What about optimization?",
    answer: "I continuously look for optimization opportunities, profile code performance, implement improvements, and ensure applications run efficiently."
  },
  {
    question: "How do you handle edge cases?",
    answer: "I think through different scenarios, test edge cases, implement proper error handling, and ensure applications work reliably under various conditions."
  },
  {
    question: "What about future-proofing?",
    answer: "I design systems that are flexible, maintainable, and adaptable to future changes, ensuring long-term sustainability and ease of updates."
  },

  // ===================== COMMUNICATION & PRESENTATION =====================
  {
    question: "How do you explain technical concepts?",
    answer: "I use simple language, provide examples, create analogies, and ensure my audience understands technical concepts regardless of their technical background."
  },
  {
    question: "What about presentations?",
    answer: "I prepare thoroughly, structure content logically, use visual aids, practice delivery, and engage with my audience to ensure effective communication."
  },
  {
    question: "How do you handle questions?",
    answer: "I listen carefully, clarify questions if needed, provide comprehensive answers, and ensure the person asking feels heard and understood."
  },
  {
    question: "What about written communication?",
    answer: "I write clearly, use proper grammar, structure content logically, and ensure my written communication is professional and easy to understand."
  },
  {
    question: "How do you handle feedback?",
    answer: "I welcome feedback, listen actively, ask clarifying questions, and use feedback to improve my work and communication skills."
  },
  {
    question: "What about difficult conversations?",
    answer: "I approach difficult conversations with empathy, stay professional, focus on solutions, and work towards positive outcomes for all parties involved."
  },
  {
    question: "How do you build rapport?",
    answer: "I show genuine interest in others, find common ground, maintain positive energy, and create comfortable and engaging interactions."
  },
  {
    question: "What about cultural sensitivity?",
    answer: "I respect different cultures, adapt my communication style, avoid assumptions, and ensure inclusive and respectful interactions."
  },
  {
    question: "How do you handle misunderstandings?",
    answer: "I clarify immediately, ask questions, provide context, and ensure clear understanding to prevent and resolve misunderstandings."
  },
  {
    question: "What about professional networking?",
    answer: "I build genuine relationships, provide value to others, stay connected, and create mutually beneficial professional connections."
  },

  // ===================== LEARNING & DEVELOPMENT =====================
  {
    question: "How do you learn new technologies?",
    answer: "I start with documentation, take online courses, build small projects, practice regularly, and seek help from the community when needed."
  },
  {
    question: "What about staying current?",
    answer: "I follow industry news, participate in developer communities, attend conferences, read technical blogs, and experiment with new technologies."
  },
  {
    question: "How do you practice coding?",
    answer: "I work on personal projects, solve coding challenges, contribute to open source, and continuously build and improve my skills through hands-on practice."
  },
  {
    question: "What about learning from mistakes?",
    answer: "I analyze my mistakes, understand what went wrong, learn from them, and use those lessons to improve my future work and decision-making."
  },
  {
    question: "How do you handle imposter syndrome?",
    answer: "I acknowledge my feelings, focus on my achievements, continue learning, seek support from others, and recognize that growth comes from challenges."
  },
  {
    question: "What about skill gaps?",
    answer: "I identify skill gaps honestly, create learning plans, seek resources, practice regularly, and work systematically to improve my abilities."
  },
  {
    question: "How do you measure progress?",
    answer: "I set specific goals, track my achievements, review my work regularly, seek feedback, and celebrate milestones to measure my progress."
  },
  {
    question: "What about learning resources?",
    answer: "I use various resources including online courses, books, documentation, community forums, and hands-on practice to learn effectively."
  },
  {
    question: "How do you handle learning plateaus?",
    answer: "I change my approach, seek new challenges, learn from different sources, and push myself outside my comfort zone to overcome learning plateaus."
  },
  {
    question: "What about teaching others?",
    answer: "I enjoy teaching others as it reinforces my own learning, helps me understand concepts better, and contributes to the growth of the developer community."
  },

  // ===================== WORK-LIFE BALANCE =====================
  {
    question: "How do you manage stress?",
    answer: "I practice time management, take regular breaks, exercise, maintain hobbies, and ensure I have a healthy work-life balance to manage stress effectively."
  },
  {
    question: "What about work hours?",
    answer: "I maintain regular work hours, avoid overworking, take breaks when needed, and ensure sustainable work practices for long-term success."
  },
  {
    question: "How do you handle deadlines?",
    answer: "I plan realistically, break down tasks, communicate early about challenges, and manage expectations to handle deadlines effectively without excessive stress."
  },
  {
    question: "What about personal time?",
    answer: "I prioritize personal time, maintain hobbies, spend time with family and friends, and ensure work doesn't consume all aspects of my life."
  },
  {
    question: "How do you stay motivated?",
    answer: "I set meaningful goals, celebrate achievements, maintain work-life balance, and remind myself of the impact and purpose of my work."
  },
  {
    question: "What about burnout prevention?",
    answer: "I recognize early warning signs, take regular breaks, maintain boundaries, seek support when needed, and prioritize self-care to prevent burnout."
  },
  {
    question: "How do you handle work pressure?",
    answer: "I stay organized, communicate clearly, ask for help when needed, and maintain perspective to handle work pressure effectively."
  },
  {
    question: "What about team support?",
    answer: "I support my team members, share workload when possible, provide encouragement, and create a supportive work environment for everyone."
  },
  {
    question: "How do you handle criticism?",
    answer: "I view criticism as feedback for improvement, listen objectively, ask for clarification, and use it constructively to grow and improve."
  },
  {
    question: "What about professional growth?",
    answer: "I set career goals, seek opportunities for growth, take on challenges, and continuously work towards advancing my professional development."
  },

  // ===================== FUTURE & GOALS =====================
  {
    question: "Where do you see yourself in 5 years?",
    answer: "I see myself as a senior developer, leading projects, mentoring others, and contributing to innovative solutions that make a positive impact on users and businesses."
  },
  {
    question: "What are your long-term goals?",
    answer: "My long-term goals include becoming a technical leader, contributing to open source projects, speaking at conferences, and helping shape the future of web development."
  },
  {
    question: "How do you plan to achieve your goals?",
    answer: "I break down my goals into actionable steps, create timelines, seek mentorship, take on challenging projects, and continuously learn and grow."
  },
  {
    question: "What about industry trends?",
    answer: "I stay informed about industry trends, evaluate their relevance, adapt my skills accordingly, and position myself to take advantage of emerging opportunities."
  },
  {
    question: "How do you stay competitive?",
    answer: "I continuously improve my skills, stay updated with technology trends, build a strong portfolio, network with professionals, and deliver high-quality work."
  },
  {
    question: "What about entrepreneurship?",
    answer: "I'm interested in entrepreneurship and may explore starting my own business or product in the future, using my technical skills to create innovative solutions."
  },
  {
    question: "How do you handle change?",
    answer: "I embrace change as an opportunity for growth, adapt quickly to new situations, learn new skills when needed, and maintain flexibility in my approach."
  },
  {
    question: "What about global opportunities?",
    answer: "I'm open to global opportunities, working with international teams, and contributing to projects that have worldwide impact and reach."
  },
  {
    question: "How do you give back to the community?",
    answer: "I contribute to open source projects, mentor junior developers, share knowledge through blogs and presentations, and participate in community events."
  },
  {
    question: "What legacy do you want to leave?",
    answer: "I want to leave a legacy of quality code, helpful mentorship, positive impact on users, and contributions that help advance the field of web development."
  }
];

// Chatbot functionality
let isChatbotOpen = false;
let chatHistory = [];

// Initialize chatbot
function initChatbot() {
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotInterface = document.querySelector('.chatbot-interface');
  const chatbotInput = document.querySelector('.chatbot-input input');
  const chatbotSendBtn = document.querySelector('.chatbot-input button');
  const chatbotMessages = document.querySelector('.chatbot-messages');

  if (!chatbotToggle || !chatbotInterface || !chatbotInput || !chatbotSendBtn || !chatbotMessages) {
    return;
  }

  // Toggle chatbot
  chatbotToggle.addEventListener('click', () => {
    isChatbotOpen = !isChatbotOpen;
    chatbotInterface.style.display = isChatbotOpen ? 'block' : 'none';
    
    if (isChatbotOpen) {
      chatbotInput.focus();
      // Show welcome message if first time
      if (chatHistory.length === 0) {
        addBotMessage("Hello! I'm Jaz's AI assistant. I can help you learn more about my portfolio, skills, and experience. Ask me anything!");
      }
    }
  });

  // Send message on button click
  chatbotSendBtn.addEventListener('click', sendMessage);

  // Send message on Enter key
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Close chatbot on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isChatbotOpen) {
      isChatbotOpen = false;
      chatbotInterface.style.display = 'none';
    }
  });

  function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    // Add user message
    addUserMessage(message);
    chatbotInput.value = '';

    // Process message and generate response
    setTimeout(() => {
      const response = generateResponse(message);
      addBotMessage(response);
    }, 500);
  }

  function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message user-message';
    messageDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatbotMessages.appendChild(messageDiv);
    chatHistory.push({ type: 'user', message });
    scrollToBottom();
  }

  function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message bot-message';
    messageDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatbotMessages.appendChild(messageDiv);
    chatHistory.push({ type: 'bot', message });
    scrollToBottom();
  }

  function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const faq of chatbotFAQs) {
      if (lowerMessage.includes(faq.question.toLowerCase()) || 
          faq.question.toLowerCase().includes(lowerMessage)) {
        return faq.answer;
      }
    }

    // Check for keyword matches
    const keywords = {
      'portfolio': "You can explore my portfolio to see my projects, skills, and experience. Feel free to ask me specific questions about any section!",
      'project': "I've worked on various projects including web applications, mobile apps, and full-stack solutions. What type of projects are you interested in?",
      'skill': "I have skills in frontend development (HTML, CSS, JavaScript, React), backend development (Node.js, Python), and various other technologies. What would you like to know?",
      'experience': "I have experience in web development, working with teams, managing projects, and delivering solutions. What aspect of my experience interests you?",
      'contact': "You can contact me through the contact form on this page, or ask me any questions you have right here!",
      'hire': "I'm always interested in new opportunities! You can contact me through the contact form, and I'd be happy to discuss how I can help with your project.",
      'resume': "You can download my resume from the portfolio. It contains detailed information about my skills, experience, and qualifications.",
      'github': "I have a GitHub profile where you can see my code and projects. Would you like me to share the link?",
      'linkedin': "I'm on LinkedIn and would be happy to connect! It's a great way to stay in touch professionally.",
      'rate': "My rates vary depending on project scope and requirements. Feel free to contact me to discuss your specific needs and get a quote."
    };

    for (const [keyword, response] of Object.entries(keywords)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Default responses for common questions
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! How can I help you today? You can ask me about my portfolio, projects, skills, or anything else!";
    }

    if (lowerMessage.includes('how are you')) {
      return "I'm doing well, thank you for asking! I'm here to help you learn more about my portfolio and experience. What would you like to know?";
    }

    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about my portfolio or experience?";
    }

    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! Feel free to come back if you have more questions. You can also contact me through the contact form if you'd like to discuss working together!";
    }

    // If no specific match, provide a helpful response
    return "That's an interesting question! While I don't have a specific answer for that, I can help you with information about my portfolio, projects, skills, and experience. What would you like to know about?";
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', initChatbot);
