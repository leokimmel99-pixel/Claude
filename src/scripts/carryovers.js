import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class CarryoverNarratives {
  constructor() {
    this.renderers = [];
    this.animationIds = [];
    this.resizeHandlers = [];

    this.initRefrigerationStory();
    this.initHVACStory();
  }

  initRefrigerationStory() {
    const container = document.getElementById('refrigeration-story');
    if (!container) return;

    // Create 3D Scene for Fridge
    const canvas = document.createElement('canvas');
    canvas.classList.add('carryover-canvas');
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Build Abstract Fridge Box
    const fridgeGroup = new THREE.Group();

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(1.5, 3, 1.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -0.75;
    fridgeGroup.add(body);

    // Door (pivot)
    const doorGeo = new THREE.BoxGeometry(1.5, 3, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.1, metalness: 0.9 });
    const door = new THREE.Mesh(doorGeo, doorMat);

    // Create a pivot group for the door
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.75, 0, 0); // Hinge position
    door.position.set(0.75, 0, 0); // Offset geometry to pivot correctly
    doorPivot.add(door);
    fridgeGroup.add(doorPivot);

    scene.add(fridgeGroup);

    // Lighting (Volumetric cold glow inside)
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const coldLight = new THREE.PointLight(0x00f0ff, 0, 2); // Initially off (intensity 0)
    coldLight.position.set(0, 0, -0.5);
    scene.add(coldLight);

    // Position fridge to the right side of the screen
    fridgeGroup.position.x = 2;
    fridgeGroup.rotation.y = -Math.PI * 0.1;

    this.renderers.push(renderer);

    // Render loop
    const animate = () => {
      renderer.render(scene, camera);
      this.animationIds.push(requestAnimationFrame(animate));
    };
    animate();

    // GSAP ScrollTrigger for opening animation
    const textContainer = container.querySelector('.story-text-container');

    ScrollTrigger.create({
      trigger: container,
      start: "top center",
      end: "bottom center",
      scrub: 1,
      onUpdate: (self) => {
        // Open door (rotate from 0 to roughly 120 degrees)
        doorPivot.rotation.y = self.progress * -Math.PI * 0.7;

        // Increase cold light intensity as door opens
        coldLight.intensity = self.progress * 5;

        // Slightly rotate the whole fridge to show the inside
        fridgeGroup.rotation.y = -Math.PI * 0.1 + (self.progress * Math.PI * 0.15);
      }
    });

    // Reveal HTML text inside when open
    gsap.fromTo(textContainer.querySelectorAll('p'),
      { opacity: 0, x: -20, filter: 'blur(10px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        stagger: 0.2,
        scrollTrigger: {
          trigger: container,
          start: "center center",
          end: "bottom center",
          scrub: 1
        }
      }
    );

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    this.resizeHandlers.push(onResize);
  }

  initHVACStory() {
    const container = document.getElementById('hvac-story');
    if (!container) return;

    // Create 3D Scene for HVAC
    const canvas = document.createElement('canvas');
    canvas.classList.add('carryover-canvas');
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Build Abstract HVAC Unit
    const hvacGroup = new THREE.Group();
    const unitGeo = new THREE.BoxGeometry(2, 1.5, 1);
    const unitMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    const unit = new THREE.Mesh(unitGeo, unitMat);
    hvacGroup.add(unit);

    // Add a simple spinning fan representation
    const fanGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const fan = new THREE.Mesh(fanGeo, fanMat);
    fan.rotation.x = Math.PI / 2;
    fan.position.z = 0.55;
    hvacGroup.add(fan);

    hvacGroup.position.set(-2, 0, 0); // Position left
    scene.add(hvacGroup);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Dust Particles that morph into text
    // For performance and visual quality, we'll use HTML text that is revealed via a mask/clip-path
    // tied to the particle explosion, simulating the dust forming the words.

    const textContainer = container.querySelector('.hvac-text-mask');

    this.renderers.push(renderer);

    let fanSpeed = 0;

    const animate = () => {
      fan.rotation.y += fanSpeed;
      renderer.render(scene, camera);
      this.animationIds.push(requestAnimationFrame(animate));
    };
    animate();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top center",
        end: "bottom top",
        scrub: 1
      }
    });

    // Animate HVAC powering on and blowing air
    tl.to({}, {
      duration: 1,
      onUpdate: function() {
        // Ramp up fan speed
        fanSpeed = this.progress() * 0.5;
        // Shake unit slightly
        hvacGroup.position.x = -2 + (Math.random() - 0.5) * 0.05 * this.progress();
      }
    })
    // Simulate dust blowing away to reveal text
    .fromTo(textContainer,
      { clipPath: 'circle(0% at 0% 50%)', filter: 'blur(20px)' },
      { clipPath: 'circle(150% at 0% 50%)', filter: 'blur(0px)', duration: 1 },
      "-=0.5"
    );

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    this.resizeHandlers.push(onResize);
  }

  destroy() {
    this.animationIds.forEach(id => cancelAnimationFrame(id));
    this.resizeHandlers.forEach(handler => window.removeEventListener('resize', handler));
    this.renderers.forEach(renderer => {
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    });
  }
}
