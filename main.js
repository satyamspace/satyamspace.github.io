// import './style.css';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
// import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';


// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('.bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight*1.5);
camera.position.setZ(30);
camera.position.setX(-3); 

renderer.render(scene, camera);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);


function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 5, 5);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(270));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(600).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('./images/stars-2179083_960_720 (1).jpg');
scene.background = spaceTexture;

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

let sat_pos;
// Instantiate a loader
const jeff = new GLTFLoader().load(
    // resource URL
    '../Satellite/scene.gltf',
    // called when the resource is loaded
    function ( gltf ) {
      const model = gltf.scene;
      scene.add( model);
      let sat = model.getObjectByName('GLTF_SceneRootNode');
      sat.position.y = -7;
      sat.position.x = 2;
      sat.position.z = 0;
      sat.rotation.z = 2.3;
      sat.rotation.y = -0.4;
      sat.rotation.x = 1.5;
      // var sat_pos = sat;
    },
    // called while loading is progressing
    function ( xhr ) {

      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

      console.log( 'An error happened' );

    }
);
window.addEventListener("hashchange", () => window.history.pushState({}, "", '/'), {});
// console.log(jeff);
// var sat;
//   {
//     const gltfLoader = new GLTFLoader();
//     gltfLoader.load('scene.gltf', (gltf) => {
//       const root = gltf.scene;
//       scene.add(root);
//       sat = root.getObjectByName('GLTF_SceneRootNode');
//       // console.log(sat);
//     });
//   }
// console.log(sat);
// Satellite{
//     const jeff = new GLTFLoader().load('scene.gltf',function ( gltf ) {
//     // gltf.animations; // Array<THREE.AnimationClip>
//     // gltf.scene; // THREE.Group
//     // gltf.scene.scale.set(0.1, 0.1, 0.1); 
//     // gltf.scenes; // Array<THREE.Group>
//     // gltf.cameras; // Array<THREE.Camera>
//     // gltf.asset; // Object
//       const root = gltf.scene;
//       scene.add(root);
//       let sat = root.getObjectByName('GLTF_SceneRootNode');
//     // console.log(dumpObject(gltf.scene).join('\n'));
//     // sat.position.y = -5;
//     // sat.position.x = 4;
//     // sat.position.z = 0;
//     // sat.rotation.z = 6;
//     }); 


// Earth

const earthTexture = new THREE.TextureLoader().load('./images/earth.jpg');
// const normalTexture = new THREE.TextureLoader().load('Earth.png');

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(30, 32, 32),
  new THREE.MeshStandardMaterial({
    map: earthTexture,
    // normalMap: normalTexture,
  })
);

scene.add(earth);


// sat.position.y = -5;
// sat.position.x = 4;
// sat.position.z = 0;
// sat.rotation.z = 6;

earth.position.z = 30;
earth.position.setX(-40);


// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  earth.rotation.x += 0.025;
  earth.rotation.y += 0.05;
  earth.rotation.z += 0.025;

  // sat.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  earth.rotation.x += 0.0025;
  renderer.render(scene, camera);
}

animate();

/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
  const toggle = document.getElementById(toggleId),
  nav = document.getElementById(navId)

  if(toggle && nav){
      toggle.addEventListener('click', ()=>{
          nav.classList.toggle('show')
      })
  }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
  const navMenu = document.getElementById('nav-menu')
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
  const scrollY = window.pageYOffset

  sections.forEach(current =>{
      const sectionHeight = current.offsetHeight
      const sectionTop = current.offsetTop - 400;
      var sectionId = current.getAttribute('id')
      
      if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
          document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active')
      }else{
          document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active')
      }
  })
}
window.addEventListener('scroll', scrollActive)

// const scriptURL = 'https://script.google.com/macros/s/AKfycbymIU0k46GPF0RgDoslkqtsbNkW0WaI2pBdVdxUUgkUA89ALD_-LAUzttVnZVV_gA_qVw/exec'
//     const form = document.forms['submit-to-google-sheet']

//     form.addEventListener('submit', e => {
//       e.preventDefault()
//       console.log(e)
//       showLoadingIndicator()
//       fetch(scriptURL, { mode: 'cors',method: 'POST', body: new FormData(form)})
//         .then(response => showSuccessMessage(response))
//         .catch(error => showErrorMessage(error))
//     })

//     function showLoadingIndicator () {
//     }

//     function showSuccessMessage (response) {
//       console.log('Success!', response)
//       setTimeout(() => {
//       }, 500)
//     }

//     function showErrorMessage (error) {
//       console.error('Error!', error.message)
//       setTimeout(() => {
//       }, 500)
//     }

/*==================== BACK TO TOP BUTTON ====================*/
// Create the button element dynamically
const backToTopButton = document.createElement('a');
backToTopButton.href = '#';
backToTopButton.className = 'back-to-top';
backToTopButton.id = 'back-to-top';
backToTopButton.innerHTML = '<i class="bx bx-up-arrow-alt"></i>';
document.body.appendChild(backToTopButton);

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
});

// Scroll to top when clicked
backToTopButton.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/*==================== IMPROVED MOBILE EXPERIENCE ====================*/
// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  
  if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('show');
  }
});

// Adjust canvas size for mobile
function adjustCanvasSize() {
  const canvas = document.querySelector('.bg');
  const renderer = window.renderer; // If you need to access the renderer
  
  if (window.innerWidth < 768) {
    // Reduce canvas quality on mobile for better performance
    if (renderer) {
      renderer.setPixelRatio(1); // Lower pixel ratio for mobile
    }
  }
}

// Call on load and resize
adjustCanvasSize();
window.addEventListener('resize', adjustCanvasSize);

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId !== '#') {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Prevent horizontal scroll on mobile
function preventHorizontalScroll() {
  const maxWidth = window.innerWidth;
  const elements = document.querySelectorAll('*');
  
  elements.forEach(el => {
    if (el.offsetWidth > maxWidth) {
      console.warn('Element causing horizontal scroll:', el);
      el.style.maxWidth = '100%';
    }
  });
}

// Check on load and after dynamic content loads
window.addEventListener('load', preventHorizontalScroll);

/*==================== PERFORMANCE OPTIMIZATION FOR MOBILE ====================*/
// Reduce animation complexity on mobile
if (window.innerWidth < 768) {
  // Store original animate function
  const originalAnimate = window.animate;
  
  // Throttle animations on mobile
  let animationFrame = 0;
  window.animate = function() {
    animationFrame++;
    // Skip every other frame on mobile for better performance
    if (animationFrame % 2 === 0) {
      return;
    }
    if (originalAnimate) {
      originalAnimate.call(this);
    }
  };
}

// Add touch swipe support for mobile menu
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const navMenu = document.getElementById('nav-menu');
  const swipeThreshold = 100;
  
  // Swipe left to close menu
  if (touchStartX - touchEndX > swipeThreshold && navMenu.classList.contains('show')) {
    navMenu.classList.remove('show');
  }
  
  // Swipe right to open menu (only from left edge)
  if (touchEndX - touchStartX > swipeThreshold && touchStartX < 50) {
    navMenu.classList.add('show');
  }
}

console.log('Mobile optimizations loaded successfully');