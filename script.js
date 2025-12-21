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

// Theme toggle
const themeToggle = document.getElementById('themeToggle')
const themeKey = 'portfolioTheme'
const applyTheme = t => {
  document.documentElement.dataset.theme = t
  if (t === 'light') document.body.classList.add('light')
  else document.body.classList.remove('light')
  storage.set(themeKey, t)
  themeToggle.setAttribute('aria-pressed', String(t === 'light'))
  themeToggle.innerHTML = t === 'light' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>'
}
const saved = storage.get(themeKey)
if (saved) applyTheme(saved)
themeToggle.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'))

// Reduce motion toggle
const rmBtn = document.getElementById('reduceMotion')
const rmKey = 'portfolioReduceMotion'
const setRM = v => {
  document.documentElement.style.setProperty('scroll-behavior', v ? 'auto' : 'smooth')
  storage.set(rmKey, v ? '1' : '0')
  rmBtn.setAttribute('aria-pressed', String(v))
}
setRM(storage.get(rmKey) === '1')
rmBtn.addEventListener('click', () => setRM(!(storage.get(rmKey) === '1')))

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

// Project search and tag filter
const search = document.getElementById('projectSearch')
const grid = document.getElementById('projectGrid')
const cards = Array.from(grid.querySelectorAll('.card'))
const applyFilter = q => {
  const s = q.trim().toLowerCase()
  cards.forEach(c => {
    const tags = (c.getAttribute('data-tags') || '').toLowerCase()
    const text = c.textContent.toLowerCase()
    const match = !s || tags.includes(s) || text.includes(s)
    c.style.display = match ? '' : 'none'
  })
}
search.addEventListener('input', e => applyFilter(e.target.value))
grid.addEventListener('click', e => {
  const b = e.target.closest('[data-filter]')
  if (!b) return
  const term = b.getAttribute('data-filter')
  search.value = term
  applyFilter(term)
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

// GitHub API
const escapeHTML = str => str ? str.replace(/[&<>'"]/g, 
  tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag])) : ''

const fetchGitHubRepos = async () => {
  const container = document.getElementById('github-repos')
  if (!container) return

  try {
    const res = await fetch('https://api.github.com/users/natime1231/repos?sort=updated&per_page=6')
    if (!res.ok) throw new Error('Failed to fetch')
    const repos = await res.json()
    
    container.innerHTML = repos.map(repo => `
      <a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener" class="card" style="text-decoration:none;color:inherit;display:flex;flex-direction:column">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <h3 style="margin:0;font-size:16px;color:var(--brand)">${escapeHTML(repo.name)}</h3>
          <span class="muted" style="font-size:12px"><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
        </div>
        <p class="muted" style="font-size:14px;flex:1;margin:0 0 12px 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
          ${escapeHTML(repo.description) || 'No description available.'}
        </p>
        <div class="meta" style="margin-top:auto">
          ${repo.language ? `<span class="badge">${escapeHTML(repo.language)}</span>` : ''}
          <span style="font-size:12px">Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
      </a>
    `).join('')
  } catch (e) {
    container.innerHTML = `<p class="muted" style="grid-column:1/-1;text-align:center">Failed to load repositories. <a href="https://github.com/natime1231" target="_blank">View on GitHub</a></p>`
  }
}
fetchGitHubRepos()

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
