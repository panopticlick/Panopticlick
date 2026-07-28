/** Smooth-scroll to a section id, degrading to a jump under reduced motion. */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
