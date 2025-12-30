// Year
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

// Last Updated (from GitHub API)
const lastUpdatedEl = document.getElementById('lastUpdated')
if (lastUpdatedEl) {
  fetch('https://api.github.com/repos/natime1231/natime1231.github.io/commits?per_page=1')
    .then(res => res.json())
    .then(commits => {
      const date = new Date(commits[0].commit.author.date)
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      lastUpdatedEl.textContent = date.toLocaleDateString('en-US', options)
    })
    .catch(() => {
      const date = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      lastUpdatedEl.textContent = date.toLocaleDateString('en-US', options)
    })
}

// Load Publications
const pubList = document.getElementById('publicationList')
if (pubList) {
  fetch('publications.json')
    .then(res => res.json())
    .then(data => {
      pubList.innerHTML = data.map(pub => `
        <li>
          <div class="pub-title"><a href="${pub.url}" target="_blank" rel="noopener">${pub.title}</a></div>
          <div class="pub-venue">${pub.venue}</div>
        </li>
      `).join('')
    })
    .catch(err => console.error('Failed to load publications', err))
}

// Active nav highlighting
const links = Array.from(document.querySelectorAll('.nav-link'))
const ids = links.map(a => a.getAttribute('href')).filter(Boolean).map(h => h.replace('#',''))
const sections = ids.map(id => document.getElementById(id)).filter(Boolean)
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id))
    }
  })
}, { rootMargin: '0px 0px -70% 0px', threshold: 0.2 })
sections.forEach(s => observer.observe(s))

// Copy email + toast
const email = 'natnael.tilahun@uh.edu'
const toast = document.getElementById('toast')
const showToast = msg => {
  toast.textContent = msg
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 1600)
}
document.getElementById('copyEmail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(email); showToast('Email copied') } catch(_) { showToast('Copy failed') }
})



// Modals
const openers = document.querySelectorAll('[data-open]')
const closers = document.querySelectorAll('[data-close]')
openers.forEach(btn => btn.addEventListener('click', () => {
  const id = btn.getAttribute('data-open')
  const dlg = document.querySelector(id)
  if (dlg) dlg.showModal()
    }))
closers.forEach(btn => btn.addEventListener('click', () => btn.closest('dialog').close()))

// Back to top
const toTop = document.getElementById('toTop')
const topObs = new IntersectionObserver(entries => {
  const show = !entries[0].isIntersecting
  toTop.classList.toggle('show', show)
}, { threshold: 0 })
topObs.observe(document.querySelector('header'))
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))

// PDF Preview
const previewBtn = document.getElementById('previewCV')
const cvModal = document.getElementById('modal-cv')
if (previewBtn && cvModal) {
  previewBtn.addEventListener('click', () => cvModal.showModal())
}



// Scroll Reveal Observer
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('active')
  })
}, { threshold: 0.1 })
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el))

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle')
const navContent = document.getElementById('navContent')
if (menuToggle && navContent) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true'
    menuToggle.setAttribute('aria-expanded', !expanded)
    navContent.classList.toggle('show')
    menuToggle.innerHTML = expanded ? '<i class="fa-solid fa-bars"></i>' : '<i class="fa-solid fa-xmark"></i>'
  })
  
  // Close menu when clicking a link
  navContent.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navContent.classList.remove('show')
      menuToggle.setAttribute('aria-expanded', 'false')
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>'
    })
  })
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm')
const formStatus = document.getElementById('formStatus')

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(contactForm)
    
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      
      if (res.ok) {
        formStatus.textContent = "Thanks! Your message has been sent."
        formStatus.style.color = "var(--ok)"
        formStatus.style.display = "block"
        contactForm.reset()
      } else {
        const json = await res.json()
        if (Object.hasOwn(json, 'errors')) {
          formStatus.textContent = json.errors.map(error => error["message"]).join(", ")
        } else {
          formStatus.textContent = "Oops! There was a problem submitting your form."
        }
        formStatus.style.color = "var(--warn)"
        formStatus.style.display = "block"
      }
    } catch (error) {
      formStatus.textContent = "Oops! There was a problem submitting your form."
      formStatus.style.color = "var(--warn)"
      formStatus.style.display = "block"
    }
  })
}
