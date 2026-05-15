// Year
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

// Last Updated (from GitHub API) + sync JSON-LD dateModified
const lastUpdatedEl = document.getElementById('lastUpdated')
const profileJsonLd = document.getElementById('profileJsonLd')
const setLastUpdated = date => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  if (lastUpdatedEl) lastUpdatedEl.textContent = date.toLocaleDateString('en-US', options)
  if (profileJsonLd) {
    try {
      const data = JSON.parse(profileJsonLd.textContent)
      data.dateModified = date.toISOString()
      profileJsonLd.textContent = JSON.stringify(data)
    } catch {}
  }
}
// Pulls the latest commit timestamp (= GitHub Pages deploy time)
fetch('https://api.github.com/repos/natime1231/natime1231.github.io/commits?per_page=1')
  .then(res => res.json())
  .then(commits => setLastUpdated(new Date(commits[0].commit.author.date)))
  .catch(() => setLastUpdated(new Date(2026, 4, 15)))

// Load Publications
const pubList = document.getElementById('publicationList')
if (pubList) {
  fetch('publications.json')
    .then(res => res.json())
    .then(data => {
      const yearOf = pub => {
        const m = (pub.venue || '').match(/(19|20)\d{2}/g)
        return m ? Math.max(...m.map(Number)) : 0
      }
      data.sort((a, b) => yearOf(b) - yearOf(a))
      const linkBtn = (href, label, icon) =>
        `<a class="pub-link" href="${href}" target="_blank" rel="noopener"><i class="${icon}"></i>${label}</a>`
      pubList.innerHTML = data.map(pub => {
        const links = []
        if (pub.url) links.push(linkBtn(pub.url, 'DOI', 'fa-solid fa-link'))
        if (pub.links?.pdf) links.push(linkBtn(pub.links.pdf, 'PDF', 'fa-solid fa-file-pdf'))
        if (pub.links?.arxiv) links.push(linkBtn(pub.links.arxiv, 'arXiv', 'fa-solid fa-scroll'))
        if (pub.links?.code) links.push(linkBtn(pub.links.code, 'Code', 'fa-brands fa-github'))
        if (pub.links?.dataset) links.push(linkBtn(pub.links.dataset, 'Dataset', 'fa-solid fa-database'))
        return `
        <li>
          <div class="pub-title"><a href="${pub.url}" target="_blank" rel="noopener">${pub.title}</a></div>
          <div class="pub-venue">${pub.venue}</div>
          <div class="pub-links">${links.join('')}</div>
        </li>`
      }).join('')
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
const email = 'ntilahun@uh.edu'
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

// Mobile nav toggle
const menuToggle = document.getElementById('menuToggle')
const navContent = document.getElementById('navContent')
if (menuToggle && navContent) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navContent.classList.toggle('show')
    menuToggle.setAttribute('aria-expanded', String(isOpen))
  })
  navContent.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navContent.classList.remove('show')
      menuToggle.setAttribute('aria-expanded', 'false')
    })
  })
}

// PDF Preview
const previewBtn = document.getElementById('previewCV')
const cvModal = document.getElementById('modal-cv')
if (previewBtn && cvModal) {
  previewBtn.addEventListener('click', () => cvModal.showModal())
}

// Contact form
const contactForm = document.getElementById('contactForm')
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault()
    const submitBtn = contactForm.querySelector('[type=submit]')
    const status = document.getElementById('formStatus')
    const originalText = submitBtn.textContent
    submitBtn.disabled = true
    submitBtn.textContent = 'Sending…'
    status.style.display = 'none'
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      })
      if (res.ok) {
        status.textContent = "Message sent! I'll get back to you soon."
        status.style.color = 'var(--ok)'
        contactForm.reset()
      } else {
        throw new Error()
      }
    } catch {
      status.textContent = 'Something went wrong. Please email directly.'
      status.style.color = 'var(--warn)'
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
      status.style.display = 'block'
    }
  })
}

// Scroll Reveal Observer
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('active')
  })
}, { threshold: 0.1 })
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el))
