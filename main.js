import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// ─── SPLASH SCREEN CONTROLLER ─────────────────────────────────────────────────
const splash = document.getElementById('splash-screen');
const splashBar = document.getElementById('splash-bar');
const splashLabel = document.getElementById('splash-label');

let loadProgress = 0;

function setProgress(pct, label) {
  loadProgress = Math.max(loadProgress, pct);
  if (splashBar) splashBar.style.width = loadProgress + '%';
  if (splashLabel) splashLabel.textContent = label;
}

function hideSplash() {
  setProgress(100, 'Ready');
  setTimeout(() => {
    if (splash) splash.classList.add('splash--hidden');
    setTimeout(() => { if (splash) splash.remove(); }, 900);
  }, 400);
}

setProgress(5, 'Initialising…');

// ─── DEVICE DETECTION ────────────────────────────────────────────────────────
const isMobile = window.innerWidth < 768;

// ─── SETUP ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('.bg'),
  powerPreference: 'high-performance',
  antialias: !isMobile,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);
renderer.render(scene, camera);

setProgress(15, 'Setting up scene…');

// ─── LIGHTS ──────────────────────────────────────────────────────────────────
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// ─── STARS ───────────────────────────────────────────────────────────────────
(function addStars() {
  const starCount = isMobile ? 200 : 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3]     = THREE.MathUtils.randFloatSpread(270);
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(270);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(270);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: isMobile ? 0.4 : 0.3,
    sizeAttenuation: true,
  });
  scene.add(new THREE.Points(geometry, material));
})();

setProgress(30, 'Loading stars…');

// ─── BACKGROUND TEXTURE ───────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();

textureLoader.load(
  './images/stars-2179083_960_720 (1).jpg',
  (texture) => {
    scene.background = texture;
    setProgress(55, 'Loading Earth…');
  },
  undefined,
  () => { setProgress(55, 'Loading Earth…'); }
);

// ─── SATELLITE (GLTF) ────────────────────────────────────────────────────────
if (!isMobile) {
  new GLTFLoader().load(
    '../Satellite/scene.gltf',
    function (gltf) {
      const model = gltf.scene;
      scene.add(model);
      const sat = model.getObjectByName('GLTF_SceneRootNode');
      if (sat) {
        sat.position.set(2, -7, 0);
        sat.rotation.set(1.5, -0.4, 2.3);
      }
      setProgress(85, 'Loading satellite…');
    },
    function (xhr) {
      const pct = (xhr.loaded / xhr.total) * 30;
      setProgress(55 + pct, 'Loading satellite…');
    },
    function () {
      setProgress(85, 'Almost there…');
    }
  );
} else {
  setProgress(85, 'Almost there…');
}

// ─── EARTH ───────────────────────────────────────────────────────────────────
textureLoader.load(
  './images/earth.jpg',
  (earthTexture) => {
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(30, isMobile ? 16 : 32, isMobile ? 16 : 32),
      new THREE.MeshStandardMaterial({ map: earthTexture })
    );
    earth.position.set(-40, 0, 30);
    scene.add(earth);

    setProgress(95, 'Almost ready…');
    hideSplash();

    function moveCamera() {
      const t = document.body.getBoundingClientRect().top;
      earth.rotation.x += 0.025;
      earth.rotation.y += 0.05;
      earth.rotation.z += 0.025;
      camera.position.z = t * -0.01;
      camera.position.x = t * -0.0002;
      camera.rotation.y = t * -0.0002;
    }
    document.body.onscroll = moveCamera;
    moveCamera();

    let lastTime = 0;
    const frameInterval = 1000 / (isMobile ? 30 : 60);

    function animate(currentTime = 0) {
      requestAnimationFrame(animate);
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);
      earth.rotation.x += 0.0025;
      renderer.render(scene, camera);
    }
    animate();
  },
  undefined,
  () => { hideSplash(); }
);

// ─── FAILSAFE: hide after 6s no matter what ──────────────────────────────────
setTimeout(hideSplash, 6000);

// ─── RESIZE HANDLER ──────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── NAV MENU ────────────────────────────────────────────────────────────────
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('show'));
  }
};
showMenu('nav-toggle', 'nav-menu');

const navLink = document.querySelectorAll('.nav__link');
function linkAction() {
  document.getElementById('nav-menu').classList.remove('show');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

// ─── SCROLL ACTIVE LINK ──────────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
function scrollActive() {
  const scrollY = window.pageYOffset;
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 400;
    const sectionId = current.getAttribute('id');
    const link = document.querySelector('.nav__menu a[href*=' + sectionId + ']');
    if (!link) return;
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', scrollActive);

// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
const backToTopButton = document.createElement('a');
backToTopButton.href = '#';
backToTopButton.className = 'back-to-top';
backToTopButton.id = 'back-to-top';
backToTopButton.innerHTML = '<i class="bx bx-up-arrow-alt"></i>';
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
  backToTopButton.classList.toggle('show', window.pageYOffset > 300);
});
backToTopButton.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── CLOSE MENU OUTSIDE CLICK ────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('show');
  }
});

// ─── SMOOTH SCROLL ───────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId !== '#') {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ─── TOUCH SWIPE FOR MOBILE MENU ─────────────────────────────────────────────
let touchStartX = 0;
let touchEndX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });
document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const navMenu = document.getElementById('nav-menu');
  const swipeThreshold = 100;
  if (touchStartX - touchEndX > swipeThreshold && navMenu.classList.contains('show')) {
    navMenu.classList.remove('show');
  }
  if (touchEndX - touchStartX > swipeThreshold && touchStartX < 50) {
    navMenu.classList.add('show');
  }
}, { passive: true });

window.addEventListener("hashchange", () => window.history.pushState({}, "", '/'), {});
console.log(`Loaded — mobile: ${isMobile}, pixel ratio: ${renderer.getPixelRatio()}`);

// ─── TYPEWRITER EFFECT ────────────────────────────────────────────────────────
(function typewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const words = [
    'GIS Specialist',
    'Earth Observation Analyst',
    'Spatial Data Scientist',
    'UAV & Drone Operator',
    'LiDAR & Point Cloud Expert',
    'Web GIS Developer',
    'GeoAI Researcher',
    'Remote Sensing Expert',
    'Geospatial Consultant',
    'Environmental Mapping Specialist',
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const typeSpeed  = 80;
  const deleteSpeed = 45;
  const pauseAfterWord = 1600;
  const pauseBeforeDelete = 400;

  function tick() {
    const current = words[wordIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, pauseAfterWord);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, pauseBeforeDelete);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  setTimeout(tick, 800);
})();
