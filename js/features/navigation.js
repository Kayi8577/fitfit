// Bottom-nav section switching, backed by the URL hash so refresh keeps
// your place and the Android back button navigates instead of exiting.

export const SECTIONS = ['home', 'food', 'plan', 'videos', 'more'];

let current = 'home';

export function activeSection() {
  return current;
}

// Resolves the hash to a valid section and shows it. Returns the section id.
export function applyHash() {
  const id = location.hash.replace('#', '');
  return switchSection(SECTIONS.includes(id) ? id : 'home');
}

export function switchSection(sectionId) {
  current = sectionId;
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.ni').forEach(b => {
    const isActive = b.dataset.section === sectionId;
    b.classList.toggle('active', isActive);
    if (isActive) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return sectionId;
}
