const header = document.getElementById("siteHeader");
const svg = document.getElementById("topoSvg");

function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 16);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

window.addEventListener("mousemove", (event) => {
  document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
}, { passive: true });

const revealTargets = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });
revealTargets.forEach((target) => observer.observe(target));

const SVG_NS = "http://www.w3.org/2000/svg";
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let targetX = viewportWidth * 0.5;
let targetY = viewportHeight * 0.5;
let currentX = targetX;
let currentY = targetY;
const lineCount = 12;
const paths = [];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resizeScene() {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  svg?.setAttribute("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`);
}

function createPaths() {
  if (!svg) return;
  svg.innerHTML = "";
  paths.length = 0;
  for (let i = 0; i < lineCount; i += 1) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", "topo-line");
    path.setAttribute("opacity", `${0.14 + i * 0.045}`);
    svg.appendChild(path);
    paths.push(path);
  }
}

function getTopoPath(level) {
  const points = [];
  const step = Math.max(22, Math.floor(viewportWidth / 38));
  const baseRadiusX = 130 + level * 42;
  const baseRadiusY = 72 + level * 24;

  for (let x = -step; x <= viewportWidth + step; x += step) {
    const dx = (x - currentX) / baseRadiusX;
    const mountain = Math.exp(-(dx * dx) * 1.55) * baseRadiusY;
    const waveA = Math.sin((x * 0.014) + level * 0.72) * (14 + level * 1.8);
    const waveB = Math.sin((x * 0.028) - level * 0.45) * (7 + level * 0.8);
    const waveC = Math.cos((x * 0.009) + level * 0.9) * (10 + level * 1.2);
    const y = currentY - mountain + level * 28 + waveA + waveB + waveC;
    points.push({ x, y: clamp(y, -160, viewportHeight + 160) });
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const p = points[i];
    const next = points[i + 1];
    d += ` Q ${p.x} ${p.y} ${(p.x + next.x) / 2} ${(p.y + next.y) / 2}`;
  }
  const last = points[points.length - 1];
  return `${d} T ${last.x} ${last.y}`;
}

function animateTopo() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;
  paths.forEach((path, index) => path.setAttribute("d", getTopoPath(index)));
  requestAnimationFrame(animateTopo);
}

window.addEventListener("mousemove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
}, { passive: true });

window.addEventListener("resize", () => {
  resizeScene();
  createPaths();
}, { passive: true });

resizeScene();
createPaths();
animateTopo();

const copyButton = document.getElementById("copyMail");

if (copyButton) {
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(
      "okada.esc@gmail.com"
    );

    copyButton.textContent = "コピーしました";
  });
}