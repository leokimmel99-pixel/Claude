import * as THREE from 'three';
import gsap from 'gsap';

export class HeatHazeEffect {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Simple abstract heat gradient to represent the image
    const geometry = new THREE.PlaneGeometry(2, 2);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform float hoverState;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Heat distortion effect
        float distortion = sin(uv.y * 20.0 + time * 5.0) * 0.05 * hoverState;
        uv.x += distortion;

        // Base color (amber gradient)
        vec3 color1 = vec3(1.0, 0.42, 0.21); // --color-amber
        vec3 color2 = vec3(0.8, 0.1, 0.0);

        vec3 finalColor = mix(color2, color1, uv.y + distortion);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        hoverState: { value: 0 }
      }
    });

    this.plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.plane);

    // Interaction
    this.container.addEventListener('mouseenter', () => {
      gsap.to(this.material.uniforms.hoverState, {
        value: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    });

    this.container.addEventListener('mouseleave', () => {
      gsap.to(this.material.uniforms.hoverState, {
        value: 0,
        duration: 1.0,
        ease: 'power2.out'
      });
    });

    this.clock = new THREE.Clock();

    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    this._animate = this.animate.bind(this);
    this._animationId = requestAnimationFrame(this._animate);
  }

  onResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    this._animationId = requestAnimationFrame(this._animate);
    this.material.uniforms.time.value = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this._animationId);
    window.removeEventListener('resize', this._onResize);

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if(this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
