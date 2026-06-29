import * as THREE from 'https://esm.sh/three@0.129.0';
import { GLTFLoader } from 'https://esm.sh/three@0.129.0/examples/jsm/loaders/GLTFLoader';

// ─── SPLASH SCREEN CONTROLLER ─────────────────────────────────────────────────
const splash      = document.getElementById('splash-screen');
const splashBar   = document.getElementById('splash-bar');
const splashLabel = document.getElementById('splash-label');

let loadProgress = 0;
let splashHidden = false;

function setProgress(pct, label) {
  loadProgress = Math.max(loadProgress, pct);
  if (splashBar)   splashBar.style.width = loadProgress + '%';
  if (splashLabel) splashLabel.textContent = label;
}

function hideSplash() {
  if (splashHidden) return;
  splashHidden = true;
  setProgress(100, 'Ready');
  setTimeout(() => {
    if (splash) splash.classList.add('splash--hidden');
    setTimeout(() => { if (splash) splash.remove(); }, 1000);
  }, 500);
}

setProgress(5, 'Initialising…');

// ─── DEVICE DETECTION ────────────────────────────────────────────────────────
const isMobile = window.innerWidth < 768;

// ─── SMART ASSET TRACKER ─────────────────────────────────────────────────────
// Tracks multiple async tasks; calls hideSplash only when all are done (or timed out).
const tracker = (() => {
  const tasks = {};
  let totalWeight = 0;
  let doneWeight  = 0;

  function register(id, weight, startPct, label) {
    tasks[id] = { weight, done: false };
    totalWeight += weight;
    setProgress(startPct, label);
  }

  function complete(id, label) {
    if (!tasks[id] || tasks[id].done) return;
    tasks[id].done = true;
    doneWeight += tasks[id].weight;
    const pct = 5 + Math.round((doneWeight / totalWeight) * 85);
    setProgress(pct, label || 'Loading…');
    if (doneWeight >= totalWeight) hideSplash();
  }

  return { register, complete };
})();

// ─── SETUP ────────────────────────────────────────────────────────────────────
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
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

// ─── LIGHTS ──────────────────────────────────────────────────────────────────
const pointLight   = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// ─── STARS (instant) ─────────────────────────────────────────────────────────
(function addStars() {
  const starCount = isMobile ? 200 : 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3]     = THREE.MathUtils.randFloatSpread(270);
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(270);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(270);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff,
    size: isMobile ? 0.4 : 0.3,
    sizeAttenuation: true,
  })));
})();

// ─── REGISTER ASYNC TASKS ────────────────────────────────────────────────────
// Weights reflect importance/load time. Total = 90; last 10 is the "ready" pause.
tracker.register('bg-texture',  10, 10, 'Loading scene…');
tracker.register('earth',       20, 15, 'Loading Earth…');
tracker.register('satellite',   20, 20, 'Loading satellite…');
tracker.register('hero-images', 40, 25, 'Loading assets…');

// ─── BACKGROUND STAR TEXTURE ─────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
  './images/stars-2179083_960_720 (1).jpg',
  (tex) => { scene.background = tex; tracker.complete('bg-texture', 'Loading Earth…'); },
  undefined,
  ()    => { tracker.complete('bg-texture', 'Loading Earth…'); }
);

// ─── SATELLITE (desktop only) ─────────────────────────────────────────────────
if (!isMobile) {
  new GLTFLoader().load(
    './Satellite/scene.gltf',
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      const sat = model.getObjectByName('GLTF_SceneRootNode');
      if (sat) { sat.position.set(2, -7, 0); sat.rotation.set(1.5, -0.4, 2.3); }
      tracker.complete('satellite', 'Almost there…');
    },
    undefined,
    (err) => { console.warn('Satellite not found:', err); tracker.complete('satellite', 'Almost there…'); }
  );
} else {
  tracker.complete('satellite', 'Almost there…');
}

// ─── EARTH ───────────────────────────────────────────────────────────────────
textureLoader.load(
  './images/earth.jpg',
  (earthTex) => {
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(30, isMobile ? 16 : 32, isMobile ? 16 : 32),
      new THREE.MeshStandardMaterial({ map: earthTex })
    );
    earth.position.set(-40, 0, 30);
    scene.add(earth);
    tracker.complete('earth', 'Loading assets…');

    function moveCamera() {
      const t = document.body.getBoundingClientRect().top;
      earth.rotation.x += 0.025;
      earth.rotation.y += 0.05;
      earth.rotation.z += 0.025;
      camera.position.z  = t * -0.01;
      camera.position.x  = t * -0.0002;
      camera.rotation.y  = t * -0.0002;
    }
    document.body.onscroll = moveCamera;
    moveCamera();

    let lastTime = 0;
    const frameInterval = 1000 / (isMobile ? 30 : 60);
    function animate(now = 0) {
      requestAnimationFrame(animate);
      const delta = now - lastTime;
      if (delta < frameInterval) return;
      lastTime = now - (delta % frameInterval);
      earth.rotation.x += 0.0025;
      renderer.render(scene, camera);
    }
    animate();
  },
  undefined,
  () => { tracker.complete('earth', 'Loading assets…'); }
);

// ─── CRITICAL IMAGE PRELOADER ─────────────────────────────────────────────────
// Preloads the images visible immediately on first load so they don't pop in
// after the splash hides — profile photo + about section images.
(function preloadHeroImages() {
  const criticalSrcs = [
    './images/profilephoto2.jpg',
    './images/spacepark.jpeg',
    './images/ita3.JPEG',
    './images/grad1.jpeg',
    './images/totals1.JPEG',
    './images/dweed2.jpeg',
    './images/lidar3.JPEG',
  ];

  let loaded = 0;
  const total = criticalSrcs.length;

  function onLoad() {
    loaded++;
    const pct = 25 + Math.round((loaded / total) * 65);
    setProgress(pct, loaded < total ? 'Loading assets…' : 'Almost ready…');
    if (loaded >= total) tracker.complete('hero-images', 'Almost ready…');
  }

  criticalSrcs.forEach(src => {
    const img    = new Image();
    img.onload   = onLoad;
    img.onerror  = onLoad;  // missing image → don't block
    img.src      = src;
  });
})();

// ─── HARD FAILSAFE: hide after 8s no matter what ─────────────────────────────
setTimeout(hideSplash, 8000);

// ─── RESIZE ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── NAV MENU ────────────────────────────────────────────────────────────────
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav    = document.getElementById(navId);
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('show'));
};
showMenu('nav-toggle', 'nav-menu');

document.querySelectorAll('.nav__link').forEach(n =>
  n.addEventListener('click', () => document.getElementById('nav-menu').classList.remove('show'))
);

// ─── SCROLL ACTIVE LINK ──────────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  sections.forEach(current => {
    const sectionTop = current.offsetTop - 400;
    const sectionId  = current.getAttribute('id');
    const link = document.querySelector('.nav__menu a[href*=' + sectionId + ']');
    if (!link) return;
    link.classList.toggle('active',
      scrollY > sectionTop && scrollY <= sectionTop + current.offsetHeight
    );
  });
});

// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
const backToTopButton     = document.createElement('a');
backToTopButton.href      = '#';
backToTopButton.className = 'back-to-top';
backToTopButton.id        = 'back-to-top';
backToTopButton.innerHTML = '<i class="bx bx-up-arrow-alt"></i>';
document.body.appendChild(backToTopButton);
window.addEventListener('scroll', () =>
  backToTopButton.classList.toggle('show', window.pageYOffset > 300)
);
backToTopButton.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── CLOSE MENU OUTSIDE CLICK ────────────────────────────────────────────────
document.addEventListener('click', e => {
  const navMenu   = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  if (navMenu && navToggle && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('show');
  }
});

// ─── SMOOTH SCROLL ───────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId !== '#') {
      e.preventDefault();
      const el = document.querySelector(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── TOUCH SWIPE FOR MOBILE MENU ─────────────────────────────────────────────
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].screenX;
  const navMenu   = document.getElementById('nav-menu');
  if (!navMenu) return;
  if (touchStartX - touchEndX > 100 && navMenu.classList.contains('show')) navMenu.classList.remove('show');
  if (touchEndX - touchStartX > 100 && touchStartX < 50) navMenu.classList.add('show');
}, { passive: true });

window.addEventListener('hashchange', () => window.history.pushState({}, '', '/'), {});
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

  let wordIndex = 0, charIndex = 0, deleting = false;
  const typeSpeed = 80, deleteSpeed = 45, pauseAfterWord = 1600, pauseBeforeDelete = 400;

  function tick() {
    const current = words[wordIndex];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) { deleting = true; setTimeout(tick, pauseAfterWord); return; }
      setTimeout(tick, typeSpeed);
    } else {
      el.textContent = current.slice(0, --charIndex);
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

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
const emailjs = window.emailjs;
emailjs.init('gxkOJWve53B-1yd9G');

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  emailjs.sendForm('service_spejpzl', 'template_aucu1wo', this)
    .then(() => {
      btn.textContent = 'Sent ✓';
      this.reset();
    })
    .catch(() => {
      btn.textContent = 'Send';
      btn.disabled = false;
      alert('Something went wrong — please try again.');
    });
});
