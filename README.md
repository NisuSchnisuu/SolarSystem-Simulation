<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sonnensystem-Simulation (6. Klasse)</title>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
            background-color: #000;
            color: #fff;
            overflow: hidden;
        }

        #container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        #ui-container {
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.75);
            padding: 15px;
            border-radius: 12px;
            max-width: 320px;
            width: calc(100% - 40px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            max-height: calc(100vh - 20px);
            overflow-y: auto;
            transition: max-width 0.3s ease, padding 0.3s ease;
            z-index: 1000; /* Sicherstellen, dass UI über 3D-Szene ist */
        }

        /* Neu: Für minimierbare UI */
        #toggle-ui {
            width: 100%;
            margin-bottom: 10px;
            font-size: 12px;
            padding: 6px;
        }
        #ui-container.minimized {
            max-width: 100px;
            padding: 10px 5px;
            overflow: hidden;
        }
        #ui-container.minimized .control-group {
            display: none;
        }
        #ui-container.minimized #toggle-ui {
            margin-bottom: 0;
        }
        /* Ende Neu */

        .control-group {
            margin-bottom: 15px;
        }

        .control-group h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #444;
            padding-bottom: 5px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-size: 12px;
            font-weight: 500;
        }

        .btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .btn:hover {
            background-color: #0056b3;
        }
        
        .btn:active {
            transform: scale(0.98);
        }

        .btn-secondary {
            background-color: #4a4a4a;
        }
        .btn-secondary:hover {
            background-color: #666;
        }
        
        .btn-warning {
            background-color: #ffc107;
            color: #000;
        }
        .btn-warning:hover {
            background-color: #e0a800;
        }
        
        .btn-danger { /* Neuer Button-Style */
            background-color: #dc3545;
            color: white;
        }
        .btn-danger:hover {
            background-color: #c82333;
        }


        .btn-group {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        
        .btn-group button {
            flex-grow: 1;
            font-size: 12px;
            padding: 6px 8px;
        }

        input[type="range"] {
            width: 100%;
            cursor: pointer;
        }
        
        #info-box {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            margin-top: 10px;
            min-height: 2.5em;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
        }
        
        #moon-phases-ui {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
        }
        
        #moon-phases-ui button {
            background: #333;
            border: 1px solid #555;
            color: #fff;
            border-radius: 5px;
            /* Entfernt: padding: 8px 4px; */
            /* Entfernt: font-size: 10px; */
            cursor: pointer;
            transition: background-color 0.2s ease, border-color 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            /* Entfernt: line-height: 0; */
            padding: 5px;
            height: 42px; /* Angepasste Höhe für die Icons */
            display: flex;
            align-items: center;
            justify-content: center;
            /* Neu: Für Emojis */
            font-size: 24px;
            line-height: 1;
        }
        
        #moon-phases-ui button:hover {
            background: #444;
        }
        
        #moon-phases-ui button.active {
            background: #4A4A4A; /* Angepasster Hintergrund für aktive Phase */
            border-color: #ffc107; /* Gelber Rand, passend zum Bild */
            font-weight: bold;
            box-shadow: 0 0 8px 1px rgba(255, 193, 7, 0.7); /* Hellerer Leuchteffekt */
        }

        /* Demo-spezifische Steuerung (Regler) */
        #demo-speed-control {
            display: none; /* Standardmäßig ausgeblendet */
            margin-top: 10px;
        }

    </style>
</head>
<body>

    <div id="container"></div>

    <div id="ui-container">
        
        <!-- Minimieren-Knopf -->
        <button id="toggle-ui" class="btn btn-secondary">Verbergen</button>

        <!-- Gruppe: Hauptsteuerung -->
        <div class="control-group">
            <h3>Steuerung</h3>
            <div class="btn-group" style="margin-bottom: 15px;">
                <button id="play-pause-btn" class="btn">Pause</button>
            </div>
            
            <label for="day-slider">Tag im Jahr: <span id="day-label">0</span></label>
            <input type="range" id="day-slider" min="0" max="365" value="0" step="0.1">
            
            <label for="speed-slider" style="margin-top: 10px;">Geschwindigkeit: <span id="speed-label">1.0</span>x</label>
            <input type="range" id="speed-slider" min="0" max="100" value="90" step="1">

            <label class="checkbox-label" style="margin-top: 15px;">
                <input type="checkbox" id="orbit-checkbox" checked>
                Umlaufbahnen anzeigen
            </label>
            
            <!-- NEUES KÄSTCHEN: Absolute Dunkelheit -->
            <label class="checkbox-label" style="margin-top: 10px;">
                <input type="checkbox" id="darkness-checkbox">
                Absolute Dunkelheit
            </label>
        </div>

        <!-- Gruppe: Kamera -->
        <div class="control-group">
            <h3>Kamera-Fokus</h3>
            <div class="btn-group">
                <button id="focus-system" class="btn btn-secondary">Sonnensystem</button>
                <button id="focus-earth" class="btn btn-secondary">Erde</button>
                <button id="focus-moon" class="btn btn-secondary">Mond</button>
            </div>
        </div>

        <!-- Gruppe: Ereignisse -->
        <div class="control-group">
            <h3>Ereignisse</h3>
            <div class="btn-group" id="demo-buttons">
                <button id="demo-sofi" class="btn btn-warning">Demo: SoFi</button>
                <button id="demo-mofi" class="btn btn-warning">Demo: MoFi</button>
            </div>
            <div class="btn-group" id="demo-control-buttons" style="display: none; margin-top: 10px;">
                <button id="end-demo-btn" class="btn btn-danger">Demo beenden</button>
            </div>
            
            <!-- Demo-Geschwindigkeitsregler (wird per JS ein/ausgeblendet) -->
            <div id="demo-speed-control">
                 <label for="demo-speed-slider" style="margin-top: 10px;">Demo-Geschw.: <span id="demo-speed-label">1.0</span>x</label>
                 <input type="range" id="demo-speed-slider" min="0" max="100" value="50" step="1">
            </div>
            
            <div id="info-box">Tag: 0</div>
        </div>

        <!-- Gruppe: Mondphasen -->
        <div class="control-group">
            <h3>Mondphasen</h3>
            <!-- Emojis für Mondphasen -->
            <div id="moon-phases-ui">
                <button id="phase-0" data-phase-index="0" class="moon-phase-btn" title="Neumond (Springen)">🌑</button>
                <button id="phase-1" data-phase-index="1" class="moon-phase-btn" title="Zunehmende Sichel (Springen)">🌒</button>
                <button id="phase-2" data-phase-index="2" class="moon-phase-btn" title="Zunehmender Halbmond (Springen)">🌓</button>
                <button id="phase-3" data-phase-index="3" class="moon-phase-btn" title="Zunehmendes Drittel (Springen)">🌔</button>
                <button id="phase-4" data-phase-index="4" class="moon-phase-btn" title="Vollmond (Springen)">🌕</button>
                <button id="phase-5" data-phase-index="5" class="moon-phase-btn" title="Abnehmendes Drittel (Springen)">🌖</button>
                <button id="phase-6" data-phase-index="6" class="moon-phase-btn" title="Abnehmender Halbmond (Springen)">🌗</button>
                <button id="phase-7" data-phase-index="7" class="moon-phase-btn" title="Abnehmende Sichel (Springen)">🌘</button>
            </div>
        </div>
    </div>

    <script>
        // --- Globale Variablen ---
        let scene, camera, renderer, controls;
        let sun, earth, moon, earthPivot, moonPivot;
        let earthOrbitLine, moonOrbitLine;
        let umbra, penumbra; // Für SoFi-Schatten auf der Erde
        
        let isPlaying = true;
        let currentDay = 0;
        let speed = 1.0;
        let cameraFocus = 'system';
        let lastCameraTargetPos = new THREE.Vector3();
        let isDemoActive = false;
        let originalMoonMaterial;
        let moonPhaseButtons = [];

        // Demo-spezifische Variablen
        let demoLoopStartDay = 0;
        let demoLoopEndDay = 0;
        let demoLoopSpeed = 0.1; // Standard-Demo-Geschwindigkeit
        let demoType = ''; // 'sofi' oder 'mofi'
        let demoShadowBrightness = 0.0; // Helligkeit des Schattens (0.0 = 100% Schwarz)
        let demoRedOverlay = 0.0; // Deckkraft des roten Overlays
        let earthDemoRotationOffset = 0.5; // Neu: Für manuelle Rotation der Erde in Demos

        // --- Konstanten ---
        const SCENE_SCALE = 1.0;
        const SUN_RADIUS = 5 * SCENE_SCALE; // KORRIGIERT: Kleinere Sonne
        const EARTH_RADIUS = 2.5 * SCENE_SCALE;
        const MOON_RADIUS = 0.7 * SCENE_SCALE;
        
        const EARTH_DISTANCE = 150 * SCENE_SCALE;
        const MOON_DISTANCE = 15 * SCENE_SCALE;

        const EARTH_TILT_RAD = (23.5 * Math.PI) / 180;
        const MOON_TILT_RAD = (5.1 * Math.PI) / 180; // Neigung der Mondbahn relativ zur Ekliptik

        const EARTH_YEAR_DAYS = 365.25;
        const LUNAR_MONTH_DAYS = 29.53; // Synodischer Monat (von Neumond zu Neumond)
        
        // KORREKTUR: Offset, um monatliche Finsternisse zu verhindern
        const PHASE_OFFSET_DAYS = 5; 
        
        // Konstanten für die Phasen-Navigation (KORRIGIERT laut deinem Bild)
        // Diese Map steuert, zu welchem Tag "gesprungen" wird
        const PHASE_DAY_MAP = [
            LUNAR_MONTH_DAYS * 0.02  + PHASE_OFFSET_DAYS, // Neumond
            LUNAR_MONTH_DAYS * 0.145 + PHASE_OFFSET_DAYS, // Zun. Sichel (Index 1)
            LUNAR_MONTH_DAYS * 0.27  + PHASE_OFFSET_DAYS, // Zun. Halbmond (Index 2)
            LUNAR_MONTH_DAYS * 0.395 + PHASE_OFFSET_DAYS, // Zun. Drittel (Index 3)
            LUNAR_MONTH_DAYS * 0.55  + PHASE_OFFSET_DAYS, // Vollmond
            LUNAR_MONTH_DAYS * 0.71  + PHASE_OFFSET_DAYS, // Abn. Drittel (Index 5)
            LUNAR_MONTH_DAYS * 0.85  + PHASE_OFFSET_DAYS, // Abn. Halbmond (Index 6)
            LUNAR_MONTH_DAYS * 0.97  + PHASE_OFFSET_DAYS  // Abn. Sichel (Index 7)
        ];
        
        // --- DOM-Elemente ---
        const container = document.getElementById('container');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const daySlider = document.getElementById('day-slider');
        const dayLabel = document.getElementById('day-label');
        const speedSlider = document.getElementById('speed-slider');
        const speedLabel = document.getElementById('speed-label');
        const orbitCheckbox = document.getElementById('orbit-checkbox');
        const infoBox = document.getElementById('info-box');
        const darknessCheckbox = document.getElementById('darkness-checkbox'); // Neu

        const demoButtons = document.getElementById('demo-buttons');
        const demoControlButtons = document.getElementById('demo-control-buttons');
        const endDemoBtn = document.getElementById('end-demo-btn');
        const demoSpeedControl = document.getElementById('demo-speed-control');
        const demoSpeedSlider = document.getElementById('demo-speed-slider');
        const demoSpeedLabel = document.getElementById('demo-speed-label');
        
        // --- Shader (Erde) ---
        // Dieser Shader ignoriert die Objektrotation für die Beleuchtung
        const earthVertexShader = `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            
            void main() {
                vUv = uv;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const earthFragmentShader = `
            uniform sampler2D dayTexture;
            uniform vec3 uSunPosition;         // Position der Sonne (Weltkoordinaten)
            uniform vec3 uObjectWorldPosition; // Position des Objekt-Zentrums (Weltkoordinaten)
            uniform float uNightBrightness;    // NEU: 0.3 oder 0.07
            
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            
            void main() {
                vec3 objectToSun = normalize(uSunPosition - uObjectWorldPosition);
                vec3 objectToFragment = normalize(vWorldPosition - uObjectWorldPosition);
                
                float intensity = (dot(objectToFragment, objectToSun) + 1.0) / 2.0;
                
                float nightBrightness = uNightBrightness; // 30% Helligkeit für die Nachtseite
                float lightMix = smoothstep(0.48, 0.59, intensity); // Scharfe Grenze
                
                vec4 dayColor = texture2D(dayTexture, vUv);
                vec4 nightColor = dayColor * nightBrightness;
                
                vec4 finalColor = mix(nightColor, dayColor, lightMix);
                gl_FragColor = finalColor;
            }
        `;
        
        // --- Shader (Mond) ---
        // Dieser Shader kann zusätzlich den Erdschatten (MoFi) darstellen
        const moonVertexShader = `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            
            void main() {
                vUv = uv;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const moonFragmentShader = `
            uniform sampler2D dayTexture;
            uniform vec3 uSunPosition;         // Sonne (Lichtquelle)
            uniform vec3 uEarthPosition;       // Erde (Schattenquelle)
            uniform vec3 uObjectWorldPosition; // Mond (Dieses Objekt)
            
            uniform float uEarthRadius;
            uniform float uSunRadius;
            uniform float uMoonRadius;
            uniform float uNightBrightness;    // NEU: 0.3 oder 0.07
            
            // Demo-spezifische Uniforms
            uniform bool uDemoActive;          // Ist MoFi-Demo aktiv?
            uniform float uShadowBrightness; // Helligkeit des Schattens (0.0 = 100% Schwarz, 0.5 = Totalität)
            uniform float uRedOverlayIntensity; // Deckkraft des roten Overlays (0.0 bis 1.0)

            varying vec2 vUv;
            varying vec3 vWorldPosition; // Position des Pixels auf dem Mond (Welt)

            // Helper: Berechnet die Helligkeit des Erdschattens (0.0 = 100% Schwarz, 1.0 = volles Licht)
            float calculateShadowIntensity(vec3 pixelPos, vec3 earthPos, float earthRadius, vec3 sunPos, float sunRadius) {
                
                // KORREKTUR: Schattenachse war invertiert
                // Vektor von der Sonne zur Erde (Schattenachse)
                vec3 sunToEarth = earthPos - sunPos;
                float earthSunDist = length(sunToEarth);
                vec3 shadowAxis = normalize(sunToEarth);

                // Vektor von der Sonne zum Pixel auf dem Mond
                vec3 sunToPixel = pixelPos - sunPos;
                
                // Projiziere sunToPixel auf die Schattenachse, um die "Tiefe" im Schatten zu finden
                float depthInShadow = dot(sunToPixel, shadowAxis);
                if (depthInShadow < 0.0) return 1.0; // Pixel ist vor der Sonne

                // Finde den Punkt auf der Schattenachse, der dem Pixel am nächsten ist
                vec3 closestPointOnAxis = sunPos + shadowAxis * depthInShadow;
                
                // Distanz des Pixels zu diesem Punkt (Radius im Schattenkegel)
                float pixelDistanceToAxis = distance(pixelPos, closestPointOnAxis);

                // --- Didaktisch vereinfachtes Modell (feste Radien) ---
                // Wir nutzen den Erdradius als Basis für den Schatten
                float umbraRadius = uEarthRadius * 0.9; // Kernschatten (ca. 90% der Erde)
                
         
        
                // KORREKTUR: Halbschatten (Penumbra) drastisch reduziert (scharfe Kante)
                float penumbraRadius = umbraRadius * 1.01; // Sehr schmaler Halbschatten

                if (pixelDistanceToAxis > penumbraRadius) {
                    return 1.0; // 1. Außerhalb des Halbschattens (Volles Licht)
                }

                if (pixelDistanceToAxis < umbraRadius) {
                    return 0.0; // 2. Im Kernschatten (Umbra)
                }

                // 3. Im Halbschatten: Übergang von 1.0 (Licht) zu 0.0 (Schatten)
                float progress = (pixelDistanceToAxis - umbraRadius) / (penumbraRadius - umbraRadius);
                return mix(0.0, 1.0, progress); // Linearer Übergang von 0.0 (Umbra) zu 1.0 (Licht)
            }

            void main() {
                vec4 textureColor = texture2D(dayTexture, vUv);
                
                // 1. Normale Tag/Nacht-Beleuchtung (durch die Sonne)
                vec3 objectToSun = normalize(uSunPosition - uObjectWorldPosition);
                vec3 objectToFragment = normalize(vWorldPosition - uObjectWorldPosition);
                float sunLightIntensity = (dot(objectToFragment, objectToSun) + 1.0) / 2.0;
                float nightBrightness = uNightBrightness; // KORRIGIERT
                float sunLightMix = smoothstep(0.48, 0.59, sunLightIntensity);
                
                vec4 sunLitColor = mix(textureColor * nightBrightness, textureColor, sunLightMix);

                // Nur wenn die MoFi-Demo aktiv ist, berechne Schatten und Rot
                if (uDemoActive) {
                    // 2. Rotes Overlay (Blutmond)
                    vec3 bloodMoonColor = vec3(1.0, 0.1, 0.0); // Rot
                    // KORREKTUR: 10% transparenter (50% Deckkraft)
                    float redMixAmount = uRedOverlayIntensity * sunLightMix * 0.5; // 50% Deckkraft
                    vec3 redOverlayColor = mix(sunLitColor.rgb, bloodMoonColor, redMixAmount);
                    
                    vec4 finalColor = vec4(redOverlayColor, 1.0);

                    // 3. Erdschatten-Berechnung (MoFi)
                    float earthShadowIntensity = calculateShadowIntensity(
                        vWorldPosition, 
                        uEarthPosition, 
                        uEarthRadius, 
                        uSunPosition, 
                        uSunRadius
                    );

                    // 4. Wende den Erdschatten AN
                    
                    // Logik:
                    // 2. Im Kernschatten ODER Halbschatten (Umbra und Penumbra)
                    if (earthShadowIntensity < 1.0) { // NEU: Wenn es IRGENDEINEN Schatten gibt (< 1.0)
                        // Die Helligkeitsreduzierung wird nur auf die von der Sonne beleuchtete Seite angewendet.
                         float shadowAmount = (1.0 - earthShadowIntensity);
                        // Der Kernschatten ist 100% Deckkraft (wird zu 0.0)
                        finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * uShadowBrightness, sunLightMix);
                        
                        // Der Rot-Effekt wird auch nur auf der beleuchteten (Tag-)Seite angewendet,
                        // was im Schritt 2 (Red Overlay) bereits durch 'sunLightMix' im RedMixAmount geschieht.
                    }
                    
                   
                    
                    gl_FragColor = finalColor;

                } else {
                    // Normale Ansicht (keine Demo)
                    gl_FragColor = sunLitColor;
                }
            }
        `;

        // --- Initialisierung ---
        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
            camera.position.set(EARTH_DISTANCE * 1.5, EARTH_DISTANCE * 0.7, EARTH_DISTANCE * 1.5);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;

            createSolarSystem();
            createOrbits();
            setupUI();

            animate();
            
            window.addEventListener('resize', onWindowResize);
            
            updatePositions(currentDay);
            updateCamera(true); 
        }

        // --- Himmelskörper erstellen ---
        function createSolarSystem() {
            const textureLoader = new THREE.TextureLoader();

            // 1. Sonne
            const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
            sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 32), sunMaterial);
            scene.add(sun);
            
            // 2. Erde
            earthPivot = new THREE.Group();
            scene.add(earthPivot);

            const earthMaterial = new THREE.ShaderMaterial({
                vertexShader: earthVertexShader,
                fragmentShader: earthFragmentShader,
                uniforms: {
                    dayTexture: { value: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg') },
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                    uObjectWorldPosition: { value: new THREE.Vector3() },
                    uNightBrightness: { value: 0.3 } // NEU
                }
            });
            earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 32, 32), earthMaterial);
            earth.position.x = EARTH_DISTANCE;
            earth.rotation.order = 'YXZ'; 
            earth.rotation.z = EARTH_TILT_RAD; 
            earthPivot.add(earth);

            // 3. Mond
            // KORREKTUR (Monatliche Finsternis): moonPivot ist jetzt ein Kind der SCENE
            moonPivot = new THREE.Group();
            // moonPivot.position.x = EARTH_DISTANCE; // Entfernt
            moonPivot.rotation.x = MOON_TILT_RAD; 
            scene.add(moonPivot); // KORREKTUR

            originalMoonMaterial = new THREE.ShaderMaterial({
                vertexShader: moonVertexShader,
                fragmentShader: moonFragmentShader,
                uniforms: {
                    dayTexture: { value: textureLoader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg') },
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                    uEarthPosition: { value: new THREE.Vector3() },
                    uObjectWorldPosition: { value: new THREE.Vector3() },
                    uEarthRadius: { value: EARTH_RADIUS },
                    uSunRadius: { value: SUN_RADIUS },
                    uMoonRadius: { value: MOON_RADIUS },
                    uNightBrightness: { value: 0.3 }, // NEU
                    uDemoActive: { value: false }, // Wichtig: Standardmäßig aus
                    uShadowBrightness: { value: 0.0 }, // 100% Schwarz
                    uRedOverlayIntensity: { value: 0.0 } // 0% Rot
                }
            });
            moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 32, 32), originalMoonMaterial);
            moon.position.x = -MOON_DISTANCE; // Position, damit Neumond Sonne-Mond-Erde ist
            moonPivot.add(moon);
            
            // 4. SoFi-Schatten (auf der Erde)
            // Umbra (total)
            umbra = new THREE.Mesh(
                new THREE.CircleGeometry(MOON_RADIUS * 0.2, 32), // Größe des Kernschattens anpassen
                new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9 })
            );
            // Penumbra (partiell)
            penumbra = new THREE.Mesh(
                new THREE.CircleGeometry(MOON_RADIUS * 1.5, 32), // Größe des Halbschattens anpassen
                new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
            );
            
            umbra.visible = false;
            penumbra.visible = false;
            
            // Schatten werden an die Erde geheftet
            earth.add(umbra);
            earth.add(penumbra);
        }

        // --- Umlaufbahnen (Linien) ---
        function createOrbits() {
            const createOrbitLine = (radius, color, segments = 128) => {
                const points = [];
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: color });
                return new THREE.Line(geometry, material);
            };

            earthOrbitLine = createOrbitLine(EARTH_DISTANCE, 0x0000FF);
            scene.add(earthOrbitLine);

            moonOrbitLine = createOrbitLine(MOON_DISTANCE, 0xFFFF00);
            // KORREKTUR (Monatliche Finsternis): Mond-Linie ist jetzt ein Kind der SCENE
            // moonOrbitLine.position.x = EARTH_DISTANCE; // Entfernt
            moonOrbitLine.rotation.x = MOON_TILT_RAD; 
            scene.add(moonOrbitLine); // KORREKTUR
        }

        // --- UI-Einrichtung ---
        function setupUI() {
            const uiContainer = document.getElementById('ui-container');
            const toggleBtn = document.getElementById('toggle-ui');
            toggleBtn.addEventListener('click', () => {
                uiContainer.classList.toggle('minimized');
                toggleBtn.textContent = uiContainer.classList.contains('minimized') ? 'Anzeigen' : 'Verbergen';
            });

            playPauseBtn.addEventListener('click', togglePlay);
            daySlider.addEventListener('input', () => {
                pauseSimulation();
                currentDay = parseFloat(daySlider.value);
                updatePositions(currentDay);
                updateUI();
            });

            speedSlider.addEventListener('input', onSpeedSliderChange);
            onSpeedSliderChange(); 

            orbitCheckbox.addEventListener('change', (e) => {
                earthOrbitLine.visible = e.target.checked;
                moonOrbitLine.visible = e.target.checked;
            });
            
            // NEU: Event-Listener für Dunkelheit
            darknessCheckbox.addEventListener('change', (e) => {
                const brightness = e.target.checked ? 0.001 : 0.2; // KORRIGIERT auf 0.07
                earth.material.uniforms.uNightBrightness.value = brightness;
                originalMoonMaterial.uniforms.uNightBrightness.value = brightness;
            });

            document.getElementById('focus-system').addEventListener('click', () => setFocus('system'));
            document.getElementById('focus-earth').addEventListener('click', () => setFocus('earth'));
            document.getElementById('focus-moon').addEventListener('click', () => setFocus('moon'));

            document.getElementById('demo-sofi').addEventListener('click', () => startDemo('sofi'));
            document.getElementById('demo-mofi').addEventListener('click', () => startDemo('mofi'));
            endDemoBtn.addEventListener('click', endDemo);
            
            // Demo-Geschwindigkeitsregler
            demoSpeedSlider.addEventListener('input', onDemoSpeedSliderChange);
            onDemoSpeedSliderChange();

            document.querySelectorAll('#moon-phases-ui button').forEach(btn => {
                const index = parseInt(btn.dataset.phaseIndex);
                btn.addEventListener('click', () => jumpToPhase(index));
                moonPhaseButtons.push(btn);
            });
        }
        
        // --- Event Handler ---

        function togglePlay() {
            isPlaying = !isPlaying;
            playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
            
            // NEU: Zoom soll IMMER aktiv sein (da der Drift jetzt stabil ist)
            controls.enableZoom = true; // <--- JETZT IST DER ZOOM IMMER AN
        }

        function pauseSimulation() {
            if (isPlaying) {
                togglePlay();
            }
        }
        
        function onSpeedSliderChange() {
            const value = parseFloat(speedSlider.value); 
            const minSpeed = 0.00005; 
            const normalSpeed = 1.0; 
            const maxSpeed = 10.0;
            
            if (value <= 90) {
                speed = minSpeed + (value / 90) * (normalSpeed - minSpeed);
            } else {
                speed = normalSpeed + ((value - 90) / 10) * (maxSpeed - normalSpeed);
            }
            speedLabel.textContent = speed.toFixed(4) + 'x'; 
        }
        
        function onDemoSpeedSliderChange() {
            const value = parseFloat(demoSpeedSlider.value); // 0-100
            const minSpeed = 0.01;
            const normalSpeed = 0.1;
            const maxSpeed = 1.0;
            
            if (value <= 50) {
                demoLoopSpeed = minSpeed + (value / 50) * (normalSpeed - minSpeed);
            } else {
                demoLoopSpeed = normalSpeed + ((value - 50) / 50) * (maxSpeed - normalSpeed);
            }
            demoSpeedLabel.textContent = demoLoopSpeed.toFixed(2) + 'x';
        }

        function setFocus(target) {
            cameraFocus = target; // Setze den globalen Fokus-Status
            let targetObj;
            let zoomFactor = 1.0;

            if (target === 'earth') {
                targetObj = earth;
                zoomFactor = 2.0;
            } else if (target === 'moon') {
                targetObj = moon;
                zoomFactor = 10.0;
            } else { // 'system'
                targetObj = sun; 
                zoomFactor = 0.2;
            }

            const targetPos = new THREE.Vector3();
            targetObj.getWorldPosition(targetPos);
            
            // Berechne einen Kamera-Offset relativ zur aktuellen Blickrichtung
            const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(EARTH_DISTANCE / zoomFactor);
            camera.position.copy(targetPos).add(offset);
            controls.target.copy(targetPos);
            lastCameraTargetPos.copy(targetPos);

            // NEU: Zoom-Status beim Wechseln des Fokus. Wir halten ihn IMMER aktiv.
            controls.enableZoom = true;
        }

        function resetToRealMode() {
            isDemoActive = false;
            demoType = '';
            // KORREKTUR: Simulation nicht automatisch starten
            // isPlaying = true; // Nach Demo wieder normal spielen lassen
            // playPauseBtn.textContent = 'Pause';
            controls.enableZoom = true;

            // UI-Anzeige zurücksetzen
            demoButtons.style.display = 'flex';
            demoControlButtons.style.display = 'none';
            demoSpeedControl.style.display = 'none';

            // Rotationen zurücksetzen
            earth.rotation.z = EARTH_TILT_RAD;
            moonPivot.rotation.x = MOON_TILT_RAD; // KORREKTUR: Dies ist die Neigung der BAHN
            
            // Schatten auf der Erde (SoFi) ausblenden
            umbra.visible = false;
            penumbra.visible = false;
            
            // Mond-Material zurücksetzen und Finsternis-Shader deaktivieren
            moon.material = originalMoonMaterial;
            if (moon.material.uniforms) {
                originalMoonMaterial.uniforms.uDemoActive.value = false; // Demo aus
                originalMoonMaterial.uniforms.uShadowBrightness.value = 0.0;
                originalMoonMaterial.uniforms.uRedOverlayIntensity.value = 0.0;
            }
        }
        
        // --- Demo-Start ---
        function startDemo(type) {
            pauseSimulation(); // Zuerst normale Simulation pausieren
            resetToRealMode(); // Alles zurücksetzen
            
            isDemoActive = true;
            demoType = type;
            isPlaying = true; // Demo soll abspielen
            playPauseBtn.textContent = 'Pause';
            controls.enableZoom = true; // KORREKTUR: Zoomen in Demo erlauben

            demoButtons.style.display = 'none'; // Normale Demo-Buttons ausblenden
            demoControlButtons.style.display = 'flex'; // "Demo beenden" Button einblenden
            demoSpeedControl.style.display = 'block'; // Demo-Geschw.-Regler einblenden

            // Rotationen für die Demo anpassen (Finsternis muss in der Ekliptik sein)
             
            earth.rotation.z = -EARTH_TILT_RAD; // Erdachse auf -23.5 Grad spiegeln 
            moonPivot.rotation.x = 0; // KORREKTUR: Neigung der BAHN auf 0
            
            let demoDurationDays;

            if (type === 'sofi') {
                demoDurationDays = 0.5; // 12 Stunden für SoFi
                currentDay = LUNAR_MONTH_DAYS * 0.0 - (demoDurationDays / 2); // Start vor Neumond
                demoLoopStartDay = currentDay;
                demoLoopEndDay = LUNAR_MONTH_DAYS * 0.0 + (demoDurationDays / 2); // Ende nach Neumond
                
                // Schatten auf der Erde einblenden
                umbra.visible = true;
                penumbra.visible = true;
                
                // NEU: Setze den Rotations-Offset auf ~202.5 Grad, um den Schatten nach Europa zu verschieben
                earthDemoRotationOffset = 2.3 + Math.PI / 8; // 180 Grad + 22.5 Grad
                // (WICHTIG: Setzt den Offset auf dem Mondanker, um den Schatten zu verschieben)
                // Positiver Wert verschiebt den Schatten nach oben (Richtung +Y der Szene)
                // Negativer Wert verschiebt den Schatten nach unten (Richtung -Y der Szene)
                moon.position.y = 0; // Beispiel: Verschiebt den Schatten um 0.5 Einheiten nach oben

                setFocus('earth'); // Fokus auf Erde, um den Schatten zu sehen
            } else if (type === 'mofi') {
                // KORREKTUR: Angepasstes Timing
                demoDurationDays = 17.5 - 14.3; // 3.2 Tage
                currentDay = 14.3; // Start bei Tag 14.3
                demoLoopStartDay = currentDay;
                demoLoopEndDay = 17.5; // Ende bei Tag 17.5

                // Offset für den Schatten
                moonPivot.position.y = MOON_RADIUS * 1.0; // Schatten trifft nicht mittig
                
                // MoFi-Demo im Shader aktivieren
                originalMoonMaterial.uniforms.uDemoActive.value = true;
                
                setFocus('moon'); // Fokus auf Mond, um den Effekt zu sehen
            }
            
            updatePositions(currentDay);
            daySlider.value = currentDay;
            updateUI();
        }

        // --- Demo-Beenden ---
        function endDemo() {
            resetToRealMode();
            // Setze den Tag auf den normalen Wert, der vor der Demo war, oder auf 0.
            currentDay = 0; 
            daySlider.value = currentDay;
            moonPivot.position.y = 0; // Offset zurücksetzen
            
            earthDemoRotationOffset = 0.0; // NEU: Offset zurücksetzen

            updatePositions(currentDay);
            updateUI();
        }
        
        // --- Zu Mondphase springen ---
        function jumpToPhase(index) {
            pauseSimulation(); // KORREKTUR: Diese Funktion stoppt die Simulation
            resetToRealMode(); // Wichtig: Erst Demo beenden, dann springen
            earthDemoRotationOffset = 0.0; // NEU: Sicherstellen, dass der Offset 0 ist
            moonPivot.position.y = 0; // Offset zurücksetzen
            
            currentDay = PHASE_DAY_MAP[index];

            // --- NEUE HIGHLIGHT-LOGIK ---
            // Alle Knöpfe deaktivieren
            moonPhaseButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Nur den geklickten Knopf aktivieren
            const clickedButton = moonPhaseButtons.find(btn => parseInt(btn.dataset.phaseIndex) === index);
            if (clickedButton) {
                clickedButton.classList.add('active');
            }
            // --- ENDE NEUE LOGIK ---
            
            updatePositions(currentDay);
            daySlider.value = currentDay;
            updateUI();

            // --- NEU: Kamera-Sprung & Modus-Wechsel ---
            cameraFocus = 'earthView'; // Setze den neuen Kamera-Modus
            
            let earthPos = new THREE.Vector3();
            let moonPos = new THREE.Vector3();
            earth.getWorldPosition(earthPos);
            moon.getWorldPosition(moonPos);
            
            camera.position.copy(earthPos); // Kamera in die Erde
            controls.target.copy(moonPos); // Fokus auf den Mond
            lastCameraTargetPos.copy(moonPos);
        }

        // --- Animations-Loop ---
        function animate() {
            requestAnimationFrame(animate);

            let actualSpeed = speed;

            if (isDemoActive) {
                actualSpeed = demoLoopSpeed;
            }

            if (isPlaying) {
                // deltaDays = (speed * (1/60s) pro Frame) * (Anzahl der Tage, die 1x pro Sekunde vergehen sollen)
                const deltaDays = (actualSpeed * (1 / 60)) * (isDemoActive ? 1 : EARTH_YEAR_DAYS / 60); 
                currentDay += deltaDays;
                
                if (isDemoActive) {
                    // Loop-Logik für Demos
                    if (currentDay > demoLoopEndDay) {
                        currentDay = demoLoopStartDay; // Zurück zum Startpunkt der Demo
                    } else if (currentDay < demoLoopStartDay) { // Falls Rückwärtsbewegung gewünscht wäre
                        currentDay = demoLoopEndDay;
                    }
                } else {
                    // Normale Loop-Logik
                    if (currentDay > EARTH_YEAR_DAYS) {
                        currentDay -= EARTH_YEAR_DAYS;
                    }
                }
                
                daySlider.value = currentDay; // Slider aktualisieren
                updateUI();
            }

            updatePositions(currentDay);
            updateCamera(false);
            
            controls.update();
            renderer.render(scene, camera);
        }

        // --- Update-Funktionen ---

        function updatePositions(day) {
            // 1. Umlaufbahn der Erde (um die Sonne)
            const earthOrbitAngle = (day / EARTH_YEAR_DAYS) * Math.PI * 2;
            earthPivot.rotation.y = earthOrbitAngle;

            // 2. Eigendrehung der Erde (1x pro Tag)
            let rotationFactor = 1.0;
            
            // NEUE LOGIK: Wenn SoFi-Demo aktiv, verlangsamen wir die Erddrehung (z.B. 100x)
            if (isDemoActive && demoType === 'sofi') {
                // Wir verwenden eine stark reduzierte Geschwindigkeit, um den Schattenwanderweg sichtbar zu machen.
                rotationFactor = 0.3; 
            }
            
            earth.rotation.y = (day * rotationFactor) * Math.PI * 2; 
            earth.rotation.y += earthDemoRotationOffset; // Fügt den Demo-Offset hinzu

            // 3. Umlaufbahn des Mondes (um die Erde)
            // KORREKTUR (Monatliche Finsternis): Offset wird abgezogen
            let moonOrbitAngle;
            if (isDemoActive) {
                // Demos müssen den Offset ignorieren, um die Finsternis-Linie zu treffen
                moonOrbitAngle = (day / LUNAR_MONTH_DAYS) * Math.PI * 2;
            } else {
                // Normale Phasen verwenden den Offset, um Finsternisse zu vermeiden
                moonOrbitAngle = ((day - PHASE_OFFSET_DAYS) / LUNAR_MONTH_DAYS) * Math.PI * 2;
            }
            
            // KORREKTUR (Monatliche Finsternis): Mond-Pivot folgt der Erde
            let earthPos = new THREE.Vector3();
            earth.getWorldPosition(earthPos);
            
            moonPivot.position.copy(earthPos);
            moonPivot.rotation.y = moonOrbitAngle; // Mond rotiert um die (jetzt fixierte) Achse
            moonOrbitLine.position.copy(earthPos);
            
            // 4. Eigendrehung des Mondes (Gebundene Rotation)
            moon.rotation.y = 0;

            // 5. Shader-Uniforms aktualisieren
            let tempVec = new THREE.Vector3();
            earth.getWorldPosition(tempVec);
            earth.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
            
            // MoFi-Demo Logik
            if (isDemoActive && demoType === 'mofi') {
                // Berechne den Animationsfortschritt (0.0 bis 1.0)
                const animProgress = (currentDay - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);
                
                // --- Fading-Logik (State-Based) ---
                // KORREKTUR: Angepasstes Fading
                // Demo: 14.3 bis 17.5 (3.2 Tage)
                
                const dayToProgress = (d) => (d - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);

                // DEINE NEUEN ZEITEN (basierend auf der letzten Anfrage)
                const peakDay = 15.53; 
                const peakProgress = dayToProgress(peakDay); // (15.5 - 14.3) / 3.2 = 0.375

                // Rot
                const redFadeInStart = peakProgress - 0.05; // (0.325) // Fade-In (Start)
                const redFadeOutStart = dayToProgress(16); // (0.6875) // Fade-Out (Start)
                const redFadeOutEnd = dayToProgress(16.8);   // (0.78125) // Fade-Out (Ende)
                
                // Schatten
                const shadowFadeInStart = dayToProgress(16.5); // 0.6875
                const shadowFadeInEnd = dayToProgress(16.6); // 0.71875
                const shadowFadeOutStart = dayToProgress(16); // 0.8125 // Veraltet?
                
                const shadowTargetBrightness = 0.6; // 40% Deckkraft (1.0 - 0.4 = 0.6 Helligkeit)

                let redIntensity = 0.0;
                let shadowBrightness = 0.02; // 100% Schwarz

                // Rot Fade-In (Start -> Peak 15.5)
                if (animProgress <= peakProgress) {
                    const fadeProgress = Math.max(0.0, (animProgress - redFadeInStart) / (peakProgress - redFadeInStart));
                    redIntensity = (fadeProgress * fadeProgress); // 0 -> 1
                }
                // Rot Fade-Out (15.5 -> 16.8)
                else if (animProgress > peakProgress && animProgress <= redFadeOutEnd) {
                    const fadeProgress = (animProgress - peakProgress) / (redFadeOutEnd - peakProgress);
                    redIntensity = 1.0 - (fadeProgress * fadeProgress); // 1 -> 0
                }

                // Schatten-Deckkraft Fade-In (15.34 -> 15.5)
                if (animProgress > shadowFadeInStart && animProgress <= peakProgress) {
                    const fadeProgress = (animProgress - shadowFadeInStart) / (peakProgress - shadowFadeInStart);
                    shadowBrightness = (fadeProgress * fadeProgress) * shadowTargetBrightness; // 0.0 -> 0.6
                }
                // Plateau (15.5 -> 16.5)
                else if (animProgress > peakProgress && animProgress <= shadowFadeOutStart) {
                     shadowBrightness = shadowTargetBrightness; // Bleibt transparent (40% Deckkraft)
                }
                // Schatten-Deckkraft Fade-Out (16.5 -> 16.6)
                else if (animProgress > shadowFadeOutStart && animProgress <= shadowFadeInEnd) {
                    const fadeProgress = (animProgress - shadowFadeOutStart) / (shadowFadeInEnd - shadowFadeOutStart);
                    shadowBrightness = shadowTargetBrightness - ((fadeProgress * fadeProgress) * shadowTargetBrightness); // 0.6 -> 0.0
                }
                
                originalMoonMaterial.uniforms.uShadowBrightness.value = shadowBrightness;
                originalMoonMaterial.uniforms.uRedOverlayIntensity.value = redIntensity;
            }
            
            moon.getWorldPosition(tempVec);
            if (moon.material.uniforms) {
                originalMoonMaterial.uniforms.uObjectWorldPosition.value.copy(tempVec);
                earth.getWorldPosition(tempVec); // Brauchen Erd-Position für Shader
                originalMoonMaterial.uniforms.uEarthPosition.value.copy(tempVec);
            }
            
            // 6. SoFi-Schatten auf der Erde positionieren
            if (umbra.visible) {
                // Holen Sie sich die Richtung von der Erde zum Mond im Weltraum
                let moonWorldPosition = new THREE.Vector3();
                moon.getWorldPosition(moonWorldPosition);
                let earthWorldPosition = new THREE.Vector3();
                earth.getWorldPosition(earthWorldPosition);
                
                let earthToMoonDirection = new THREE.Vector3().subVectors(moonWorldPosition, earthWorldPosition).normalize();

                // Konvertieren Sie diese Richtung in das lokale Koordinatensystem der Erde
                let localEarthToMoonDirection = earth.worldToLocal(moonWorldPosition.clone()).normalize();
                
                // Der Schattenpunkt ist an der Oberfläche in dieser Richtung
                let shadowLocalPosition = localEarthToMoonDirection.multiplyScalar(EARTH_RADIUS * 1.01);
                
                umbra.position.copy(shadowLocalPosition);
                penumbra.position.copy(shadowLocalPosition);
                
                // Ausrichtung des Schattens: Er muss zum Erdmittelpunkt zeigen
                umbra.lookAt(new THREE.Vector3(0,0,0));
                penumbra.lookAt(new THREE.Vector3(0,0,0));
            }
        }

        function updateCamera(isJump = false) {
            let targetObj;
            let currentTargetPos = new THREE.Vector3();

            // NEUER 'earthView'-Modus
            if (cameraFocus === 'earthView') {
                earth.getWorldPosition(currentTargetPos); // Kamera-Position = Erde
                
                if (isJump) {
                    lastCameraTargetPos.copy(currentTargetPos);
                } else if (isPlaying) { // Nur driften, wenn Simulation läuft
                    const delta = currentTargetPos.clone().sub(lastCameraTargetPos);
                    camera.position.add(delta);
                }
                lastCameraTargetPos.copy(currentTargetPos);
                
                // Fokus-Ziel (controls.target) auf den Mond setzen
                let moonPos = new THREE.Vector3();
                moon.getWorldPosition(moonPos);
                controls.target.copy(moonPos);
                return;
            }

            // Normale Fokus-Logik
            if (cameraFocus === 'system') {
                targetObj = sun;
            } else if (cameraFocus === 'earth') {
                targetObj = earth;
            } else { // 'moon'
                targetObj = moon;
            }
            
            targetObj.getWorldPosition(currentTargetPos);

            if (isJump) {
                lastCameraTargetPos.copy(currentTargetPos);
            }
            // KORREKTUR: Kamera-Drift soll immer stattfinden (auch wenn pausiert),
            // außer wenn die normale Simulation pausiert ist.
            else if (isPlaying || isDemoActive) {
                const delta = currentTargetPos.clone().sub(lastCameraTargetPos);
                camera.position.add(delta);
                controls.target.add(delta);
            }
            
            lastCameraTargetPos.copy(currentTargetPos);
        }
        
        function updateUI() {
            dayLabel.textContent = Math.floor(currentDay % EARTH_YEAR_DAYS);
            
            let sunPos = new THREE.Vector3();
            let earthPos = new THREE.Vector3();
            let moonPos = new THREE.Vector3();
            
            sun.getWorldPosition(sunPos);
            earth.getWorldPosition(earthPos);
            moon.getWorldPosition(moonPos);

            // KORRIGIERTE Phasen-Logik
            const vecEarthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos);
            const vecEarthToSun = new THREE.Vector3().subVectors(sunPos, earthPos); 
            
            // Winkel auf der Ekliptik-Ebene (XZ)
            let angle = Math.atan2(vecEarthToSun.z, vecEarthToSun.x) - Math.atan2(vecEarthToMoon.z, vecEarthToMoon.x);
            // Normalisieren auf 0 bis 2PI
            angle = (angle + Math.PI * 2) % (Math.PI * 2);

            // 0 = Neumond (vor der Erde)
            // PI = Vollmond (hinter der Erde)
            
            let phaseIndex = 0;
            // Mappen von [0, 2PI] auf [0, 8]
            let normalizedAngle = angle;
            
            // KORREKTUR: Rundungsfehler behoben
            phaseIndex = Math.floor(normalizedAngle / (Math.PI * 2) * 8 + 0.5) % 8;
            
            const phaseNames = ["Neumond", "Zun. Sichel", "Zun. Halbmond", "Zun. Drittel", "Vollmond", "Abn. Drittel", "Abn. Halbmond", "Abn. Sichel"];
            let phaseName = phaseNames[phaseIndex];

            // Entfernt: Automatische Hervorhebung (ersetzt durch Klick-Logik in jumpToPhase)
            // moonPhaseButtons.forEach((btn, idx) => {
            //     btn.classList.toggle('active', idx === phaseIndex);
            // });

            let infoText = `Tag: ${Math.floor(currentDay % EARTH_YEAR_DAYS)} | ${phaseName}`;
            
            // Finsternis-Logik (Prüfung)
            if (isDemoActive) {
                if (demoType === 'sofi') {
                    infoText = "SONNENFINSTERNIS (Demo)";
                } else if (demoType === 'mofi') {
                    infoText = "MONDFINSTERNIS (Demo)";
                }
            } else {
                // Reale Prüfung (sehr vereinfacht, da MOON_TILT_RAD in echter Simulation)
                let moonWorldY = moon.getWorldPosition(new THREE.Vector3()).y;
                let earthWorldY = earth.getWorldPosition(new THREE.Vector3()).y; 
                
                let yDiff = Math.abs(moonWorldY - earthWorldY); 
                
                const ECLIPSE_TOLERANCE = (MOON_RADIUS + EARTH_RADIUS) / 3; 

                if (phaseIndex === 0 && yDiff < ECLIPSE_TOLERANCE) { 
                    infoText += " (Mögliche SoFi)";
                }
                if (phaseIndex === 4 && yDiff < ECLIPSE_TOLERANCE) { 
                     infoText += " (Mögliche MoFi)";
                }
            }
            infoBox.textContent = infoText;
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // --- Start ---
        init();
    </script>
</body>
</html>
