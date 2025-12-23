// Storage helpers
const storage = {
  get: key => { try { return localStorage.getItem(key) } catch(_) { return null } },
  set: (key, val) => { try { localStorage.setItem(key, val) } catch(_) {} }
}

// Year
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

// Last Updated
const lastUpdatedEl = document.getElementById('lastUpdated')
if (lastUpdatedEl) {
  const date = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  lastUpdatedEl.textContent = date.toLocaleDateString('en-US', options)
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
