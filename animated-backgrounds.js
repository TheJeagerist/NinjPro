/**
 * Sistema de Fondos Animados - NinjPro
 * ====================================
 * Maneja la creación y animación de fondos dinámicos para cada tema
 */

class AnimatedBackgrounds {
    constructor() {
        this.currentTheme = 'theme-dark';
        this.backgrounds = {};
        this.isInitialized = false;
        this.animationFrameId = null;
        
        // Configuración de rendimiento
        this.performanceMode = this.detectPerformanceMode();
        
        console.log('🎨 AnimatedBackgrounds inicializado');
    }

    /**
     * Detecta el modo de rendimiento basado en el dispositivo
     */
    detectPerformanceMode() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        return isMobile || isLowEnd || prefersReducedMotion ? 'low' : 'high';
    }

    /**
     * Inicializa el sistema de fondos
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🎨 Inicializando sistema de fondos animados...');
        
        // Limpiar fondos existentes para evitar duplicados
        this.cleanupExistingBackgrounds();
        
        this.createBackgroundContainers();
        this.createSVGDefinitions();
        this.createBackgroundElements();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ Fondos animados inicializados');
    }

    /**
     * Limpia fondos animados existentes
     */
    cleanupExistingBackgrounds() {
        const existingBackgrounds = document.querySelectorAll('.animated-background');
        existingBackgrounds.forEach(bg => {
            if (bg.parentNode) {
                bg.parentNode.removeChild(bg);
            }
        });
        
        // Limpiar cualquier SVG residual en el documento
        const allSVGs = document.querySelectorAll('svg');
        allSVGs.forEach(svg => {
            if (svg.closest('.animated-background') || svg.querySelector('circle, ellipse')) {
                svg.remove();
            }
        });
        
        // Limpiar elementos con clases de partículas
        const particles = document.querySelectorAll('[class*="particle"], [class*="circle"], [class*="bubble"]');
        particles.forEach(particle => {
            if (particle.closest('.animated-background')) {
                particle.remove();
            }
        });
        
        this.backgrounds = {};
        console.log('🧹 Fondos existentes y elementos SVG limpiados completamente');
    }

    /**
     * Crea los contenedores para cada tema
     */
    createBackgroundContainers() {
        const themes = ['dark', 'light', 'rosa', 'neon'];
        
        themes.forEach(theme => {
            const container = document.createElement('div');
            container.id = `bg-animated-${theme}`;
            container.className = 'animated-background';
            
            if (theme === 'dark') {
                container.classList.add('active');
            }
            
            document.body.appendChild(container);
            this.backgrounds[theme] = container;
        });
    }

    /**
     * Crea las definiciones SVG para gradientes y filtros
     */
    createSVGDefinitions() {
        // No crear ningún SVG - todos los temas usan solo CSS
        console.log('🚫 SVG deshabilitado - solo fondos CSS');
    }

    /**
     * Crea los elementos animados para cada tema
     */
    createBackgroundElements() {
        this.createDarkThemeElements();
        this.createLightThemeElements();
        this.createRosaThemeElements();
        
        this.createNeonThemeElements();
    }

    /**
     * Crea elementos para tema dark (Ocean waves effect con colores oscuros)
     */
    createDarkThemeElements() {
        const container = this.backgrounds.dark;
        
        // Limpiar cualquier contenido existente
        container.innerHTML = '';
        
        // Crear el contenedor del océano oscuro
        const ocean = document.createElement('div');
        ocean.className = 'ocean ocean-dark';
        
        // Crear las dos olas con estilo oscuro
        const wave1 = document.createElement('div');
        wave1.className = 'wave wave-dark';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave wave-dark';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
        
        console.log('✅ Tema Dark con océano y olas oscuras creado');
    }

    /**
     * Crea elementos para tema light (Ocean waves effect)
     */
    createLightThemeElements() {
        const container = this.backgrounds.light;
        
        // Limpiar cualquier contenido existente
        container.innerHTML = '';
        
        // Crear el contenedor del océano
        const ocean = document.createElement('div');
        ocean.className = 'ocean';
        
        // Crear las dos olas
        const wave1 = document.createElement('div');
        wave1.className = 'wave';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
        
        console.log('✅ Tema Light con océano y olas creado');
    }

    /**
     * Crea elementos para tema rosa (Ocean waves effect con colores rosa)
     */
    createRosaThemeElements() {
        const container = this.backgrounds.rosa;
        
        // Limpiar cualquier contenido existente
        container.innerHTML = '';
        
        // Crear el contenedor del océano rosa
        const ocean = document.createElement('div');
        ocean.className = 'ocean ocean-rosa';
        
        // Crear las dos olas con estilo rosa
        const wave1 = document.createElement('div');
        wave1.className = 'wave wave-rosa';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave wave-rosa';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
        
        console.log('✅ Tema Rosa con océano y olas rosadas creado');
    }

    /**
     * Elimina todos los elementos circulares del documento
     */
    removeAllCircularElements() {
        // Eliminar elementos con border-radius circular
        const circularElements = document.querySelectorAll('*');
        circularElements.forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.borderRadius === '50%' || 
                style.borderRadius.includes('50%') ||
                element.style.borderRadius === '50%') {
                if (element.closest('.animated-background')) {
                    element.style.display = 'none';
                    element.style.opacity = '0';
                    element.style.visibility = 'hidden';
                }
            }
        });
        
        // Eliminar elementos SVG circulares
        const svgCircles = document.querySelectorAll('circle, ellipse');
        svgCircles.forEach(circle => {
            if (circle.closest('.animated-background')) {
                circle.remove();
            }
        });
        
        console.log('🚫 Elementos circulares eliminados');
    }

    /**
     * Crea elementos para tema neon (NEW WAVE Three.js effect)
     */
    createNeonThemeElements() {
        const container = this.backgrounds.neon;
        
        if (!container) {
            console.error('❌ Contenedor neon no encontrado!');
            return;
        }
        
        // Limpiar cualquier contenido existente
        container.innerHTML = '';
        
        // Crear la estructura de olas estilo PlayStation 4
        const ocean = document.createElement('div');
        ocean.className = 'ocean-neon';
        
        const wave1 = document.createElement('div');
        wave1.className = 'wave-neon';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave-neon';
        
        // Ensamblar la estructura
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
        
        console.log('✅ Tema Neon con olas PlayStation 4 creado');
    }

    /**
     * Función legacy - ya no se usa Three.js para el tema neon
     */
    initNewWaveEffect() {
        console.log('⚠️ initNewWaveEffect llamado pero ya no se usa Three.js para tema neon');
    }

    /**
     * Carga Three.js dinámicamente si no está disponible
     */
    loadThreeJS() {
        try {
            return new Promise((resolve, reject) => {
                // Si Three.js ya está cargado, resolver inmediatamente
                if (window.THREE) {
                    console.log('✅ Three.js ya está disponible');
                    resolve();
                    return;
                }

                console.log('📦 Cargando Three.js desde CDN...');

                // Cargar Three.js desde CDN
                const threeScript = document.createElement('script');
                threeScript.type = 'module';
                threeScript.textContent = `
                    try {
                        import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
                        import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
                        import { FontLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/FontLoader.js';
                        import { TextGeometry } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/TextGeometry.js';
                        import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
                        import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
                        import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
                        import { ShaderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/ShaderPass.js';
                        
                        window.THREE = THREE;
                        window.OrbitControls = OrbitControls;
                        window.FontLoader = FontLoader;
                        window.TextGeometry = TextGeometry;
                        window.EffectComposer = EffectComposer;
                        window.RenderPass = RenderPass;
                        window.UnrealBloomPass = UnrealBloomPass;
                        window.ShaderPass = ShaderPass;
                        
                        console.log('✅ Three.js y módulos cargados dinámicamente');
                        
                        // Resolver la Promise
                        if (window.animatedBackgrounds && window.animatedBackgrounds.threeJSLoadResolve) {
                            window.animatedBackgrounds.threeJSLoadResolve();
                        }
                    } catch (error) {
                        console.error('❌ Error al importar Three.js:', error);
                        if (window.animatedBackgrounds && window.animatedBackgrounds.threeJSLoadReject) {
                            window.animatedBackgrounds.threeJSLoadReject(error);
                        }
                    }
                `;

                // Configurar callbacks para la Promise
                this.threeJSLoadResolve = resolve;
                this.threeJSLoadReject = reject;

                // Manejar errores de carga del script
                threeScript.onerror = (error) => {
                    console.error('❌ Error al cargar el script de Three.js:', error);
                    reject(new Error('Failed to load Three.js script'));
                };

                document.head.appendChild(threeScript);

                // Timeout de seguridad
                setTimeout(() => {
                    if (!window.THREE) {
                        console.warn('⏰ Timeout al cargar Three.js');
                        reject(new Error('Three.js load timeout'));
                    }
                }, 15000); // Aumentado a 15 segundos
            });
        } catch (error) {
            console.error('❌ Error crítico en loadThreeJS:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Configura la escena NEW WAVE Three.js
     */
    setupNewWaveScene(container) {
        // Variables de la escena
        let scene, camera, renderer, composer, bloomPass, ripplePass;
        let uniforms, material, mesh;
        let neonGroup;

        // Inicializar escena
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Guardar referencias
        this.threeScene = scene;
        this.threeCamera = camera;
        this.threeRenderer = renderer;
        this.threeContainer = container;

        // Configurar uniforms para shaders con colores PlayStation 4
        uniforms = {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            opacity: { value: 0.7 },
            color1: { value: new THREE.Color(0x0070D1) }, // Azul PlayStation principal
            color2: { value: new THREE.Color(0x00439C) }, // Azul PlayStation oscuro
            color3: { value: new THREE.Color(0x00246E) }  // Azul PlayStation más oscuro
        };

        // Crear material shader
        material = new THREE.ShaderMaterial({
            wireframe: false,
            transparent: true,
            opacity: 1,
            uniforms: uniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform vec2 resolution;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                uniform float opacity;

                void main() {
                    vec2 uv = vUv;
                    vec3 color = mix(color1, color2, uv.x + sin(time));
                    color = mix(color, color3, uv.y + cos(time));
                    gl_FragColor = vec4(color, opacity);
                }
            `
        });

        // Cargar fuente y crear texto
        this.loadNewWaveFont(scene, material);

        // Configurar controles
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.5;
        controls.enableZoom = true;
        controls.minDistance = 2;
        controls.maxDistance = 20;

        // Configurar post-processing
        this.setupPostProcessing(scene, camera, renderer);

        // Crear elementos neon
        this.createNeonElements(scene, uniforms);

        // Iniciar animación
        this.startNewWaveAnimation(uniforms, renderer, composer);

        // Manejar redimensionamiento
        this.handleResize(camera, renderer, composer);
    }

    /**
     * Carga la fuente y crea el texto NEW WAVE
     */
    loadNewWaveFont(scene, material) {
        const loader = new FontLoader();
        loader.load('https://raw.githubusercontent.com/vainsan/assets/main/Dubtronic_Regular.json', (font) => {
            const textGeometry1 = new TextGeometry('NEW', {
                font: font,
                size: 0.4,
                height: 1,
                curveSegments: 0,
                bevelEnabled: true,
                bevelThickness: 0,
                bevelSize: 0,
                bevelOffset: 0,
                bevelSegments: 1
            });

            const textGeometry2 = new TextGeometry('WAVE', {
                font: font,
                size: 1,
                height: 1,
                curveSegments: 0,
                bevelEnabled: true,
                bevelThickness: 0,
                bevelSize: 0,
                bevelOffset: 0,
                bevelSegments: 1
            });

            // Centrar las geometrías
            textGeometry1.center();
            textGeometry2.center();

            // Crear meshes de texto
            const textMesh1 = new THREE.Mesh(textGeometry1, material);
            const textMesh2 = new THREE.Mesh(textGeometry2, material);

            // Posicionar los textos
            textMesh1.position.set(0, 0.6, 0);
            textMesh2.position.set(0, -0.2, 0);

            // Agregar a la escena
            scene.add(textMesh1);
            scene.add(textMesh2);
        });
    }

    /**
     * Configura el post-processing con efectos
     */
    setupPostProcessing(scene, camera, renderer) {
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        // Efecto de líneas de escaneo
        const scanLineShader = {
            blending: THREE.AdditiveBlending,
            uniforms: {
                "tDiffuse": { value: null },
                "time": { value: 0.0 },
                "lineHeight": { value: 4.0 },
                "lineSpacing": { value: 2.0 },
                "opacity": { value: 0.15 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float lineHeight;
                uniform float lineSpacing;
                uniform float opacity;
                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float scanline = step(lineSpacing, mod(gl_FragCoord.y, lineHeight)) * opacity;
                    color.rgb += scanline;
                    gl_FragColor = color;
                }
            `
        };
        const scanLinePass = new ShaderPass(scanLineShader);
        composer.addPass(scanLinePass);

        // Efecto Bloom
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 1, 0.15);
        composer.addPass(bloomPass);

        // Efecto de ondulación
        const rippleShader = {
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0.0 },
                amplitude: { value: 0.02 },
                frequency: { value: 10.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float amplitude;
                uniform float frequency;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    float ripple = sin(uv.y * frequency + time) * amplitude;
                    uv.x += ripple;
                    vec4 color = texture2D(tDiffuse, uv);
                    gl_FragColor = color;
                }
            `
        };
        const ripplePass = new ShaderPass(rippleShader);
        composer.addPass(ripplePass);

        // Efecto de grano
        const grainShader = {
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float grain = fract(sin(dot(vUv.xy, vec2(12.9898, 78.233))) * 43758.5453 + time);
                    color.rgb += (grain - 0.5) * 0.05;
                    gl_FragColor = color;
                }
            `
        };
        const grainPass = new ShaderPass(grainShader);
        composer.addPass(grainPass);

        // Guardar referencia del composer
        this.threeComposer = composer;
    }

    /**
     * Crea elementos neon cilíndricos
     */
    createNeonElements(scene, uniforms) {
        const neonGroup = new THREE.Group();
        const count = 100;
        const neonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 32);
        const neonMaterials = [];

        const getRandomColor = () => {
            const colors = [uniforms.color1.value, uniforms.color2.value, uniforms.color3.value];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        for (let i = 0; i < count; i++) {
            const material = new THREE.MeshBasicMaterial({ color: getRandomColor() });
            const cylinder = new THREE.Mesh(neonGeometry, material);

            // Posición aleatoria
            cylinder.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );

            cylinder.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            cylinder.scale.set(
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1
            );

            neonMaterials.push(material);
            neonGroup.add(cylinder);
        }

        scene.add(neonGroup);
        this.neonGroup = neonGroup;
    }

    /**
     * Inicia la animación NEW WAVE
     */
    startNewWaveAnimation(uniforms, renderer, composer) {
        const animate = () => {
            if (this.neonGroup) {
                this.neonGroup.children.forEach(cylinder => {
                    cylinder.rotation.x += 0.002;
                    cylinder.rotation.y += 0.003;
                });
            }

            if (this.threeComposer && this.threeComposer.passes) {
                // Actualizar tiempo en shaders
                this.threeComposer.passes.forEach(pass => {
                    if (pass.uniforms && pass.uniforms.time) {
                        pass.uniforms.time.value += 0.005;
                    }
                });
            }

            uniforms.time.value += 0.005;

            if (this.threeComposer) {
                this.threeComposer.render();
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Maneja el redimensionamiento de la ventana
     */
    handleResize(camera, renderer, composer) {
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (composer) {
                composer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        this.resizeHandler = handleResize;
    }

    /**
     * Destruye la escena Three.js
     */
    destroyThreeScene() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        if (this.threeRenderer && this.threeContainer) {
            this.threeContainer.removeChild(this.threeRenderer.domElement);
            this.threeRenderer.dispose();
        }

        this.threeScene = null;
        this.threeCamera = null;
        this.threeRenderer = null;
        this.threeComposer = null;
        this.neonGroup = null;
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Escuchar cambios de tema
        window.addEventListener('themeChanged', (e) => {
            this.switchTheme(e.detail.theme);
        });

        // Escuchar cambios en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.switchTheme(e.newValue);
            }
        });

        // Detectar cambios de rendimiento
        window.addEventListener('resize', () => {
            this.performanceMode = this.detectPerformanceMode();
        });
    }

    /**
     * Cambia el tema activo
     */
    switchTheme(theme) {
        const normalizedTheme = theme.replace('theme-', '');
        
        if (this.currentTheme === normalizedTheme) return;
        
        console.log(`🎨 Cambiando fondo animado a: ${normalizedTheme}`);
        
        // Ocultar fondo actual
        Object.values(this.backgrounds).forEach(bg => {
            bg.classList.remove('active');
        });
        
        // Mostrar nuevo fondo
        if (this.backgrounds[normalizedTheme]) {
            this.backgrounds[normalizedTheme].classList.add('active');
            this.currentTheme = normalizedTheme;
            
            // Asegurar que el fondo neon tenga su contenido
            if (normalizedTheme === 'neon') {
                setTimeout(() => {
                    // Verificar que el contenido vaporwave esté presente
                    const neonBg = this.backgrounds.neon;
                    if (neonBg && !neonBg.querySelector('.vaporwave-scene')) {
                        console.log('🔧 Recreando elementos del tema neon...');
                        this.createNeonThemeElements();
                    }
                }, 100);
            }
            
            // Limpiar elementos circulares al cambiar tema
            setTimeout(() => {
                this.removeAllCircularElements();
            }, 100);
        }
    }

    /**
     * Pausa todas las animaciones
     */
    pauseAnimations() {
        document.body.classList.add('no-animations');
    }

    /**
     * Reanuda todas las animaciones
     */
    resumeAnimations() {
        document.body.classList.remove('no-animations');
    }

    /**
     * Destruye el sistema de fondos
     */
    destroy() {
        this.pauseAnimations();
        this.cleanupExistingBackgrounds();
        this.destroyThreeScene();
        this.isInitialized = false;
        console.log('🔄 Sistema de fondos destruido');
    }

    /**
     * Crea elementos específicos para el panel de matemáticas rápidas
     */
    createMathThemeElements() {
        console.log('🧮 Creando fondos específicos para matemáticas rápidas...');
        
        // Crear fondos para cada tema específicamente para el panel de matemáticas
        this.createMathDarkElements();
        this.createMathLightElements();
        this.createMathRosaElements();
        this.createMathNeonElements();
    }

    /**
     * Crea elementos del tema dark para matemáticas rápidas
     */
    createMathDarkElements() {
        const container = document.getElementById('bg-wrap-dark-math');
        if (!container) return;
        
        container.innerHTML = '';
        
        const ocean = document.createElement('div');
        ocean.className = 'ocean ocean-dark';
        
        const wave1 = document.createElement('div');
        wave1.className = 'wave wave-dark';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave wave-dark';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
    }

    /**
     * Crea elementos del tema light para matemáticas rápidas
     */
    createMathLightElements() {
        const container = document.getElementById('bg-wrap-math');
        if (!container) return;
        
        container.innerHTML = '';
        
        const ocean = document.createElement('div');
        ocean.className = 'ocean';
        
        const wave1 = document.createElement('div');
        wave1.className = 'wave';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
    }

    /**
     * Crea elementos del tema rosa para matemáticas rápidas
     */
    createMathRosaElements() {
        const container = document.getElementById('bg-wrap-rosa-math');
        if (!container) return;
        
        container.innerHTML = '';
        
        const ocean = document.createElement('div');
        ocean.className = 'ocean ocean-rosa';
        
        const wave1 = document.createElement('div');
        wave1.className = 'wave wave-rosa';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave wave-rosa';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
    }

    /**
     * Crea elementos del tema neón para matemáticas rápidas
     */
    createMathNeonElements() {
        const container = document.getElementById('bg-wrap-neon-math');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Para el tema neón, usar el efecto Three.js si está disponible
        if (this.performanceMode === 'high') {
            this.initMathNeonEffect(container);
        } else {
            // Fallback a CSS para dispositivos de bajo rendimiento
            const ocean = document.createElement('div');
            ocean.className = 'ocean ocean-neon';
            
            const wave1 = document.createElement('div');
            wave1.className = 'wave wave-neon';
            
            const wave2 = document.createElement('div');
            wave2.className = 'wave wave-neon';
            
            ocean.appendChild(wave1);
            ocean.appendChild(wave2);
            container.appendChild(ocean);
        }
    }

    /**
     * Inicializa el efecto neón específico para matemáticas
     */
    initMathNeonEffect(container) {
        console.log('🔍 DEBUG: initMathNeonEffect llamado');
        console.log('🔍 DEBUG: this =', this);
        console.log('🔍 DEBUG: this.loadThreeJS =', typeof this.loadThreeJS);
        
        // Por ahora, usar siempre el fallback CSS para evitar errores
        console.log('🔄 Usando fallback CSS para tema neón de matemáticas');
        this.createMathNeonFallback(container);
        
        // Comentar la lógica de Three.js temporalmente
        /*
        // Implementación simplificada del efecto neón
        try {
            const loadPromise = this.loadThreeJS();
            if (loadPromise && typeof loadPromise.then === 'function') {
                loadPromise.then(() => {
                    this.setupMathNeonScene(container);
                }).catch((error) => {
                    console.warn('⚠️ Three.js no disponible, usando fallback CSS para neón math:', error);
                    this.createMathNeonFallback(container);
                });
            } else {
                console.warn('⚠️ loadThreeJS no retornó una Promise válida, usando fallback CSS');
                this.createMathNeonFallback(container);
            }
        } catch (error) {
            console.error('❌ Error en initMathNeonEffect:', error);
            this.createMathNeonFallback(container);
        }
        */
    }

    /**
     * Crea el fallback CSS para el efecto neón de matemáticas
     */
    createMathNeonFallback(container) {
        // Fallback a CSS
        const ocean = document.createElement('div');
        ocean.className = 'ocean ocean-neon';
        
        const wave1 = document.createElement('div');
        wave1.className = 'wave wave-neon';
        
        const wave2 = document.createElement('div');
        wave2.className = 'wave wave-neon';
        
        ocean.appendChild(wave1);
        ocean.appendChild(wave2);
        container.appendChild(ocean);
    }

    /**
     * Configura la escena Three.js para el panel de matemáticas neón
     */
    setupMathNeonScene(container) {
        if (!window.THREE) return;
        
        // Crear una versión simplificada del efecto neón
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0a0a0f, 0);
        container.appendChild(renderer.domElement);
        
        // Crear geometría simple para partículas
        const geometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x8b5cf6,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        camera.position.z = 5;
        
        // Animación simple
        const animate = () => {
            requestAnimationFrame(animate);
            particles.rotation.x += 0.01;
            particles.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        
        animate();
    }

    /**
     * Cambia el tema específicamente para el panel de matemáticas
     */
    switchMathTheme(theme) {
        console.log(`🧮 Cambiando tema de matemáticas a: ${theme}`);
        
        const mathBgElements = {
            'theme-light': document.getElementById('bg-wrap-math'),
            'theme-dark': document.getElementById('bg-wrap-dark-math'),
            'theme-rosa': document.getElementById('bg-wrap-rosa-math'),
            'theme-neon': document.getElementById('bg-wrap-neon-math')
        };
        
        // Ocultar todos los fondos
        Object.values(mathBgElements).forEach(bg => {
            if (bg) {
                bg.style.display = 'none';
                bg.style.opacity = '0';
            }
        });
        
        // Mostrar el fondo del tema actual
        const activeBg = mathBgElements[theme];
        if (activeBg) {
            activeBg.style.display = 'block';
            setTimeout(() => {
                activeBg.style.opacity = '1';
            }, 50);
        }
    }
}

// Crear instancia global solo si no existe
if (!window.animatedBackgrounds) {
    window.animatedBackgrounds = new AnimatedBackgrounds();
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.animatedBackgrounds.isInitialized) {
            console.log('🎨 Inicializando fondos animados...');
            window.animatedBackgrounds.init();
            
            // Aplicar tema inicial
            const savedTheme = localStorage.getItem('theme') || 'theme-dark';
            window.animatedBackgrounds.switchTheme(savedTheme);
        }
    });
}

// Exponer funciones útiles
window.backgroundsAPI = {
    switchTheme: (theme) => window.animatedBackgrounds.switchTheme(theme),
    pause: () => window.animatedBackgrounds.pauseAnimations(),
    resume: () => window.animatedBackgrounds.resumeAnimations(),
    destroy: () => window.animatedBackgrounds.destroy()
};

console.log('🎨 Sistema de fondos animados cargado'); 