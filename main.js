let typedText = null;
let typeTimeout = null;
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const roles = [
  "AI / ML Engineer",
  "B.Tech CSE (AI & ML)",
  "Google Student Ambassador",
  "Tech Community Builder"
];

const pageColors = {
  home: { c1: '#e6b87d', c2: '#9fb39a' },
  about: { c1: '#9fb39a', c2: '#8fa88c' },
  skills: { c1: '#8fa88c', c2: '#7d9487' },
  projects: { c1: '#7d9487', c2: '#6b8076' },
  contact: { c1: '#6b8076', c2: '#e6b87d' }
};

function initAmbientBackground(namespace) {
  const colors = pageColors[namespace] || pageColors.home;
  document.documentElement.style.setProperty('--ambient-color-1', colors.c1);
  document.documentElement.style.setProperty('--ambient-color-2', colors.c2);
}

// --- Custom Cursor ---
function initCursor() {
  const customCursor = document.querySelector('.custom-cursor');
  if (!customCursor) return;

  document.addEventListener('mousemove', (e) => {
    customCursor.style.left = e.clientX + 'px';
    customCursor.style.top = e.clientY + 'px';
  });

  const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card, .theme-toggle');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => customCursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => customCursor.classList.remove('hovering'));
  });
}

// --- 3D Hero Element ---
let scene, camera, renderer, heroMesh, animationId;
let mouseX = 0;
let mouseY = 0;

function initHero3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container) return;
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const group = new THREE.Group();
  scene.add(group);

  // Wireframe outer
  const geoOuter = new THREE.IcosahedronGeometry(1.5, 1);
  const matOuter = new THREE.MeshBasicMaterial({ color: 0xe6b87d, wireframe: true, transparent: true, opacity: 0.3 });
  const meshOuter = new THREE.Mesh(geoOuter, matOuter);
  group.add(meshOuter);

  // Solid inner
  const geoInner = new THREE.IcosahedronGeometry(0.8, 0);
  const matInner = new THREE.MeshBasicMaterial({ color: 0x9fb39a, transparent: true, opacity: 0.8 });
  const meshInner = new THREE.Mesh(geoInner, matInner);
  group.add(meshInner);

  heroMesh = group;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    animationId = requestAnimationFrame(animate);
    group.rotation.y += 0.002;
    group.rotation.x += 0.001;
    
    // Smooth mouse tilt
    gsap.to(group.rotation, {
      x: mouseY * 0.3,
      y: mouseX * 0.3,
      duration: 2,
      ease: "power2.out"
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', onWindowResize);
  function onWindowResize() {
    if(!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
}

function cleanupHero3D() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (heroMesh) {
    scene.remove(heroMesh);
    heroMesh.children.forEach(child => {
      child.geometry.dispose();
      child.material.dispose();
    });
  }
}

// --- Typing Effect ---
function type() {
  const currentRole = roles[roleIndex];
  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  if (typedText) {
    typedText.textContent = currentRole.substring(0, charIndex);
  }

  let typeSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentRole.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    typeSpeed = 500;
  }

  typeTimeout = setTimeout(type, typeSpeed);
}

// --- Page Init ---
function initPage(namespace) {
  typedText = document.getElementById('typed-text');
  
  if (namespace === 'home') {
    if (typedText && !typeTimeout) {
      charIndex = 0;
      isDeleting = false;
      type();
    }
    initHero3D();
  } else {
    clearTimeout(typeTimeout);
    typeTimeout = null;
  }

  initAmbientBackground(namespace);

  document.querySelectorAll('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('active')
    });
  });

  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".project-card, .skill-card"), {
      max: 5,
      speed: 400,
      glare: true,
      "max-glare": 0.1
    });
  }
  
  initCursor();
}

// --- Theme Toggle ---
function initTheme() {
  const toggleBtns = document.querySelectorAll('.theme-toggle');
  const body = document.body;
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') body.classList.add('light-mode');

  toggleBtns.forEach(btn => {
    btn.textContent = body.classList.contains('light-mode') ? '🌙' : '☀️';
    btn.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      const isLight = body.classList.contains('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      toggleBtns.forEach(b => b.textContent = isLight ? '🌙' : '☀️');
    });
  });
}

// --- Barba Init ---
if (typeof barba !== 'undefined') {
  barba.init({
    sync: true,
    transitions: [{
      async leave(data) {
        const done = this.async();
        gsap.to(data.current.container, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: done
        });
        if(data.current.namespace === 'home') {
          cleanupHero3D();
        }
      },
      async enter(data) {
        window.scrollTo(0, 0);
        gsap.from(data.next.container, {
          opacity: 0,
          y: 20,
          duration: 0.4,
          ease: "power2.out"
        });
        initPage(data.next.namespace);
      }
    }]
  });
}

window.addEventListener('load', () => {
  const namespace = document.documentElement.getAttribute('data-barba-namespace') || 
                    document.querySelector('[data-barba-namespace]')?.getAttribute('data-barba-namespace') || 'home';
  initPage(namespace);
  initTheme();
});
