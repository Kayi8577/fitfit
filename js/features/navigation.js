// Bottom-nav section switching.

export function switchSection(sectionId, navItem) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(b => b.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  navItem.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
