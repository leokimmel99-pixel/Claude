import * as THREE from 'three';
import gsap from 'gsap';

export class HeroScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    // Default stagnant environment
    this.scene.fog = new THREE.FogExp2(0x050505, 0.05);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.createStagnantEnvironment();
    this.createParticles(); // Hidden initially

    this._onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this._onWindowResize);

    this._animate = this.animate.bind(this);
    this._animationId = requestAnimationFrame(this._animate);
  }

  createStagnantEnvironment() {
    // Abstract geometric shapes representing "Stagnant space"
    this.geometry = new THREE.BoxGeometry(2, 2, 2);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.cube);

    // Harsh, stagnant lighting
    this.ambientLight = new THREE.AmbientLight(0x222222);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0x444444, 1);
    this.directionalLight.position.set(5, 5, 5);
    this.scene.add(this.directionalLight);
  }

  createParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  // Called by ScrollTrigger to update the 3D scene state based on scroll progress
  updateScrollState(progress) {
    if (!this.cube) return;

    // Phase 1 (0.0 - 0.33): Stagnant
    // Phase 2 (0.33 - 0.66): Mechanical Fix
    // Phase 3 (0.66 - 1.0): Active / Breathing

    if (progress < 0.33) {
      // Stagnant
      const p = progress / 0.33;
      this.cube.rotation.x = p * Math.PI * 0.1;
      this.cube.scale.setScalar(1);
      this.particles.material.opacity = 0;
      this.ambientLight.color.setHex(0x222222);
    } else if (progress >= 0.33 && progress < 0.66) {
      // Mechanical fix (snapping into place, precision)
      const p = (progress - 0.33) / 0.33;
      this.cube.rotation.y = p * Math.PI;
      // Slight expansion and contraction to simulate mechanical tension
      const scale = 1 + Math.sin(p * Math.PI) * 0.2;
      this.cube.scale.setScalar(scale);

      this.particles.material.opacity = p * 0.2; // Starting to activate
      this.ambientLight.color.setHex(0x444444);
    } else {
      // Breathing / Equilibrium
      const p = (progress - 0.66) / 0.34;
      this.cube.rotation.z += 0.01; // Continuous smooth rotation
      this.cube.scale.setScalar(1 - p * 0.2); // Shrink slightly
      this.cube.material.color.setHex(0x333333); // Lighten up
      this.ambientLight.color.setHex(0x888888);

      this.particles.material.opacity = 0.5 + p * 0.5;

      // Animate particles flowing
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i+1] += 0.01; // Move up
        if (positions[i+1] > 5) positions[i+1] = -5; // Reset
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this._animationId = requestAnimationFrame(this._animate);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this._animationId);
    window.removeEventListener('resize', this._onWindowResize);

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if(this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
