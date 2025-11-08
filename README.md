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
            cursor: pointer;
            transition: background-color 0.2s ease, border-color 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 5px;
            height: 42px; 
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            line-height: 1;
        }
        
        #moon-phases-ui button:hover {
            background: #444;
        }
        
        #moon-phases-ui button.active {
            background: #4A4A4A; 
            border-color: #ffc107; 
            font-weight: bold;
            box-shadow: 0 0 8px 1px rgba(255, 193, 7, 0.7); 
        }

        #demo-speed-control {
            display: none; 
            margin-top: 10px;
        }

        /* --- NEU: Info-Popup --- */
        #info-popup {
            display: none; /* Standardmässig versteckt */
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 2000; /* Über allem, auch der UI */
            width: 90%;
            max-width: 400px;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        #info-popup-content {
            width: 100%;
            text-align: left;
        }
        #popup-title {
            margin: 0 0 15px 0;
            font-size: 20px;
            font-weight: 600;
            border-bottom: 1px solid #555;
            padding-bottom: 10px;
            text-align: center;
            color: #ffc107; /* Akzentfarbe */
        }
        #popup-details p {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.4;
        }
        #popup-details strong {
            color: #fff; /* Statt gelb, für besseren Kontrast */
            font-weight: 600;
            min-width: 120px; /* Bessere Ausrichtung */
            display: inline-block;
        }
        #popup-details span {
            color: #ddd;
        }
        #popup-details .fun-fact {
            margin-top: 8px; /* Reduziert von 15px, da jetzt mehrere Fakten existieren */
            padding-top: 0; /* Entfernt, da die Trennlinie jetzt per JS hinzugefügt wird */
            border-top: none; /* Entfernt */
            font-style: italic;
            color: #ccc;
        }
        /* --- ENDE NEU --- */

    </style>
</head>
<body>

    <div id="container"></div>

    <div id="ui-container">
        
        <button id="toggle-ui" class="btn btn-secondary">Verbergen</button>

        <div class="control-group">
            <h3>Steuerung</h3>
            <div class="btn-group" style="margin-bottom: 15px;">
                <button id="play-pause-btn" class="btn">Pause</button>
            </div>
            
            <label for="day-slider">Tag im Jahr: <span id="day-label">0</span></label>
            <input type="range" id="day-slider" min="0" max="365" value="0" step="0.1">
            
            <label for="speed-slider" style="margin-top: 10px;">Geschwindigkeit: <span id="speed-label">1.0</span>x</label>
            <input type="range" id="speed-slider" min="0" max="100" value="10" step="1"> <!-- Startwert auf 10 (langsamer) gesetzt -->

            <!-- MODIFIZIERT: Label-Text geändert -->
            <label class="checkbox-label" style="margin-top: 15px;">
                <input type="checkbox" id="orbit-checkbox" checked>
                Erd-/Mondbahn anzeigen
            </label>
            
            <!-- MODIFIZIERT: Aufgeteilt in zwei Checkboxen -->
            <div style="display: flex; gap: 15px; margin-top: 10px;">
                <label class="checkbox-label" style="flex: 1;">
                    <input type="checkbox" id="planets-visible-checkbox" checked>
                    Planeten
                </label>
                <label class="checkbox-label" style="flex: 1;">
                    <input type="checkbox" id="planets-orbit-checkbox" checked>
                    Planetenbahnen
                </label>
            </div>
            
            <label for="darkness-slider" style="margin-top: 10px;">Helligkeit (Nachtseite): <span id="darkness-label">0.30</span></label>
            <input type="range" id="darkness-slider" min="0" max="0.9" value="0.3" step="0.01">
        </div>

        <div class="control-group">
            <h3>Kamera-Fokus</h3>
            <div class="btn-group">
                <button id="focus-system" class="btn btn-secondary">Sonnensystem</button>
                <button id="focus-earth" class="btn btn-secondary">Erde</button>
                <button id="focus-moon" class="btn btn-secondary">Mond</button>
                <button id="focus-ecliptic" class="btn btn-secondary">Ekliptik-Sicht</button>
            </div>
            <!-- NEU: Container für Planeten-Fokus-Buttons -->
            <div id="planet-focus-buttons" class="btn-group" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; display: none;">
                <!-- Wird per JS befüllt -->
            </div>
        </div>

        <div class="control-group">
            <h3>Ereignisse</h3>
            <div class="btn-group" id="demo-buttons">
                <button id="demo-sofi" class="btn btn-warning">Sonnenfinsternis</button>
                <button id="demo-mofi" class="btn btn-warning">Mondfinsternis</button>
            </div>
            <div class="btn-group" id="demo-control-buttons" style="display: none; margin-top: 10px;">
                <button id="end-demo-btn" class="btn btn-danger">Demo beenden</button>
            </div>
            
            <div id="demo-speed-control">
                 <label for="demo-speed-slider" style="margin-top: 10px;">Demo-Geschw.: <span id="demo-speed-label">1.0</span>x</label>
                 <input type="range" id="demo-speed-slider" min="0" max="100" value="50" step="1">
            </div>
            
            <div id="info-box">Tag: 0</div>
        </div>

        <div class="control-group">
            <h3>Mondphasen</h3>
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

    <!-- NEU: Info-Popup (außerhalb von #container) -->
    <div id="info-popup">
        <div id="info-popup-content">
            <h2 id="popup-title">Titel</h2>
            <div id="popup-details">
                <!-- Inhalt wird per JS geladen -->
            </div>
            <button id="popup-close-btn" class="btn btn-secondary">Schliessen</button>
        </div>
    </div>


    <script>
        // --- Globale Variablen ---
        let scene, camera, renderer, controls;
        let sun, earth, moon, earthPivot, moonPivot;
        let earthOrbitLine, moonOrbitLine;
        let starField;
        
        let otherPlanets = [];
        let otherPlanetPivots = [];
        let otherPlanetOrbits = [];
        let planetsData = [];
        let saturnRingMaterial;
        
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
        let demoLoopSpeed = 0.1; 
        let demoType = ''; 
        let demoShadowBrightness = 0.0; 
        let demoRedOverlay = 0.0; 
        let earthDemoRotationOffset = 0.0;
        
        // --- NEU: Kamera-Animation (Tweening) ---
        const clock = new THREE.Clock();
        let isCameraTransitioning = false;
        let cameraTransitionProgress = 0.0;
        let cameraTransitionDuration = 1.0;
        let cameraTransitionStartPos = new THREE.Vector3();
        let cameraTransitionStartTarget = new THREE.Vector3();
        let cameraTransitionEndPos = new THREE.Vector3();
        let cameraTransitionEndTarget = new THREE.Vector3();
        let cameraFocusAfterTransition = null;
        // --- ENDE NEU ---
        
        // --- NEU: Raycasting (Klick-Erkennung) ---
        let raycaster;
        let mouse;
        let clickableObjects = [];
        // --- ENDE NEU ---
        
        // --- NEU: Touch-Handling für Popup ---
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging = false;
        const dragThreshold = 10; // Pixel-Toleranz für Drag vs. Tap
        // --- ENDE NEU ---

        // --- Konstanten ---
        const SCENE_SCALE = 1.0;
        const SUN_RADIUS = 20 * SCENE_SCALE; 
        const EARTH_RADIUS = 2.5 * SCENE_SCALE;
        const MOON_RADIUS = 0.7 * SCENE_SCALE;
        const ERDE_RADIUS_KM = 6371; // NEU: Echter Erdradius für Vergleiche
        
        const EARTH_DISTANCE = 150 * SCENE_SCALE;
        const MOON_DISTANCE = 15 * SCENE_SCALE;

        const EARTH_TILT_RAD = (23.5 * Math.PI) / 180;
        const MOON_TILT_RAD = (5.1 * Math.PI) / 180; 

        const EARTH_YEAR_DAYS = 365.25;
        const LUNAR_MONTH_DAYS = 29.53; 
        
        const PHASE_OFFSET_DAYS = 5; 
        
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

        // --- NEU: Variable um manuelle Kamerasteuerung zu erkennen ---
        let isUserControllingCamera = false;
        
        // --- DOM-Elemente ---
        const container = document.getElementById('container');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const daySlider = document.getElementById('day-slider');
        const dayLabel = document.getElementById('day-label');
        const speedSlider = document.getElementById('speed-slider');
        const speedLabel = document.getElementById('speed-label');
        const orbitCheckbox = document.getElementById('orbit-checkbox');
        const infoBox = document.getElementById('info-box');
        
        // MODIFIZIERT: Aufgeteilte Checkboxen
        const planetsVisibleCheckbox = document.getElementById('planets-visible-checkbox');
        const planetsOrbitCheckbox = document.getElementById('planets-orbit-checkbox');
        const planetFocusContainer = document.getElementById('planet-focus-buttons');

        const darknessSlider = document.getElementById('darkness-slider');
        const darknessLabel = document.getElementById('darkness-label');

        const demoButtons = document.getElementById('demo-buttons');
        const demoControlButtons = document.getElementById('demo-control-buttons');
        const endDemoBtn = document.getElementById('end-demo-btn');
        const demoSpeedControl = document.getElementById('demo-speed-control');
        const demoSpeedSlider = document.getElementById('demo-speed-slider');
        const demoSpeedLabel = document.getElementById('demo-speed-label');
        
        // --- Shader (Erde & ANDERE PLANETEN) ---
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
            uniform vec3 uSunPosition;
            uniform vec3 uObjectWorldPosition;
            uniform float uNightBrightness;
            
            uniform bool uSofiDemoActive;
            uniform vec3 uMoonPosition;
            uniform float uMoonRadius;
            uniform float uSunRadius;
            
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            
            float calculateMoonShadowIntensity(vec3 pixelPos, vec3 moonPos, float moonRadius, vec3 sunPos, float sunRadius) {
                
                vec3 sunToMoon = moonPos - sunPos;
                vec3 shadowAxis = normalize(sunToMoon);

                vec3 sunToPixel = pixelPos - sunPos;
                
                float depthInShadow = dot(sunToPixel, shadowAxis);
                if (depthInShadow < 0.0) return 1.0; 

                vec3 closestPointOnAxis = sunPos + shadowAxis * depthInShadow;
                
                float pixelDistanceToAxis = distance(pixelPos, closestPointOnAxis);

                float umbraRadius = moonRadius * 0.1;
                float penumbraRadius = moonRadius * 1.0; 

                if (pixelDistanceToAxis > penumbraRadius) {
                    return 1.0;
                }

                if (pixelDistanceToAxis < umbraRadius) {
                    return 0.0;
                }

                float progress = (pixelDistanceToAxis - umbraRadius) / (penumbraRadius - umbraRadius);
                return mix(0.4, 0.9, progress);
            }
            
            void main() {
                vec3 objectToSun = normalize(uSunPosition - uObjectWorldPosition);
                vec3 objectToFragment = normalize(vWorldPosition - uObjectWorldPosition);
                
                float intensity = (dot(objectToFragment, objectToSun) + 1.0) / 2.0;
                
                float nightBrightness = uNightBrightness;
                float lightMix = smoothstep(0.48, 0.59, intensity);
                
                vec4 dayColor = texture2D(dayTexture, vUv);
                vec4 nightColor = dayColor * nightBrightness;
                
                vec4 finalColor = mix(nightColor, dayColor, lightMix);

                if (uSofiDemoActive) {
                    if (intensity > 0.01) { 
                        float moonShadowIntensity = calculateMoonShadowIntensity(
                            vWorldPosition, 
                            uMoonPosition, 
                            uMoonRadius,
                            uSunPosition,
                            uSunRadius
                        );
                        finalColor.rgb *= moonShadowIntensity;
                    }
                }

                gl_FragColor = finalColor;
            }
        `;
        
        // --- Shader (Mond) ---
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
            uniform vec3 uSunPosition;
            uniform vec3 uEarthPosition;
            uniform vec3 uObjectWorldPosition;
            
            uniform float uEarthRadius;
            uniform float uSunRadius;
            uniform float uMoonRadius;
            uniform float uNightBrightness;
            
            uniform bool uDemoActive;
            uniform float uShadowBrightness;
            uniform float uRedOverlayIntensity;

            varying vec2 vUv;
            varying vec3 vWorldPosition;

            float calculateShadowIntensity(vec3 pixelPos, vec3 earthPos, float earthRadius, vec3 sunPos, float sunRadius) {
                
                vec3 sunToEarth = earthPos - sunPos;
                vec3 shadowAxis = normalize(sunToEarth);

                vec3 sunToPixel = pixelPos - sunPos;
                
                float depthInShadow = dot(sunToPixel, shadowAxis);
                if (depthInShadow < 0.0) return 1.0;

                vec3 closestPointOnAxis = sunPos + shadowAxis * depthInShadow;
                
                float pixelDistanceToAxis = distance(pixelPos, closestPointOnAxis);

                float umbraRadius = uEarthRadius * 0.9;
                
                float startRatio = 0.95; 
                float endRatio = 1.05;   
                
                float intensity = smoothstep(umbraRadius * startRatio, umbraRadius * endRatio, pixelDistanceToAxis);
                
                return intensity; 
            }

            void main() {
                vec4 textureColor = texture2D(dayTexture, vUv);
                
                vec3 objectToSun = normalize(uSunPosition - uObjectWorldPosition);
                vec3 objectToFragment = normalize(vWorldPosition - uObjectWorldPosition);
                float sunLightIntensity = (dot(objectToFragment, objectToSun) + 1.0) / 2.0;
                float nightBrightness = uNightBrightness;
                float sunLightMix = smoothstep(0.5, 0.6, sunLightIntensity);
                
                vec4 sunLitColor = mix(textureColor * nightBrightness, textureColor, sunLightMix);

                if (uDemoActive) {
                    vec4 finalColor = vec4(sunLitColor.rgb, 1.0);

                    float earthShadowIntensity = calculateShadowIntensity(
                        vWorldPosition, 
                        uEarthPosition, 
                        uEarthRadius, 
                        uSunPosition, 
                        uSunRadius
                    );

                    if (earthShadowIntensity < 1.0) {
                        if (earthShadowIntensity == 0.0) {
                            finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * uShadowBrightness, sunLightMix);
                        } else {
                             finalColor.rgb *= (1.0 - (1.0 - earthShadowIntensity) * sunLightMix); 
                        }
                    }
                    
                    vec3 bloodMoonColor = vec3(1.0, 0.2, 0.0);
                    float redMixAmount = uRedOverlayIntensity * sunLightMix * 0.4;
                    
                    finalColor.rgb = mix(finalColor.rgb, bloodMoonColor, redMixAmount);
                    
                    gl_FragColor = finalColor;

                } else {
                    gl_FragColor = sunLitColor;
                }
            }
        `;
        
        // --- Shader (Saturn-Ring) ---
        const ringVertexShader = `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            
            void main() {
                vUv = uv;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const ringFragmentShader = `
            uniform sampler2D ringTexture;
            uniform vec3 uSunPosition;
            uniform vec3 uSaturnPosition;
            uniform float uSaturnRadius;
            uniform float uNightBrightness;
            
            varying vec2 vUv;
            varying vec3 vWorldPosition;

            float getShadow(vec3 fragPos, vec3 shadowCasterPos, float casterRadius, vec3 sunPos) {
                vec3 sunToCaster = normalize(shadowCasterPos - sunPos);
                vec3 casterToFrag = fragPos - shadowCasterPos;

                float distOnAxis = dot(casterToFrag, sunToCaster);
                if (distOnAxis < 0.0) return 1.0;

                vec3 closestPointOnAxis = shadowCasterPos + sunToCaster * distOnAxis;
                float distToAxis = distance(fragPos, closestPointOnAxis);
                
                return smoothstep(casterRadius * 0.9, casterRadius * 1.1, distToAxis);
            }

            void main() {
                vec4 texColor = texture2D(ringTexture, vUv);
                
                float shadowIntensity = getShadow(vWorldPosition, uSaturnPosition, uSaturnRadius, uSunPosition);
                
                vec4 nightColor = vec4(texColor.rgb * uNightBrightness, texColor.a);
                
                gl_FragColor = mix(nightColor, texColor, shadowIntensity);
                
                gl_FragColor.a *= texColor.a;
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
            controls.touches = {
                ONE: 0,
                TWO: 2
            };
            
            // NEU: Hinzufügen eines Listeners, der merkt, wenn der Benutzer
            // die Kamera manuell bewegt.
            controls.addEventListener('start', () => {
                isUserControllingCamera = true;
            });
            
            // --- NEU: Raycaster initialisieren ---
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            // --- ENDE NEU ---

            definePlanetData();
            createSolarSystem();
            createOrbits();
            setupUI();

            animate();
            
            window.addEventListener('resize', onWindowResize);
            
            // --- MODIFIZIERT: Klick- und Touch-Listener ---
            window.addEventListener('click', onMouseClick, false);      // Für Maus
            window.addEventListener('touchstart', onTouchStart, false); // Für Touch-Beginn
            window.addEventListener('touchmove', onTouchMove, false);   // Für Touch-Bewegung
            window.addEventListener('touchend', onTouchEnd, false);     // Für Touch-Ende (Tippen)
            // --- ENDE MODIFIZIERT ---
            
            updatePositions(currentDay);
            // MODIFIZIERT: Starte mit Sprung (Dauer 0), nicht mit updateCamera
            setFocus(sun, 0); 
        }
        
        // --- Planetendaten (MODIFIZIERT: Pluto hinzugefügt + INFODATEN) ---
        function definePlanetData() {
            const textureBasePath = 'https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/Images/';
            
            // --- MODIFIZIERT: funFact zu funFacts Array geändert + Hardfacts ---
            planetsData = [
                { 
                    name: 'Mercury', 
                    radius: 1.0 * SCENE_SCALE, 
                    distance: 60 * SCENE_SCALE, 
                    yearDays: 88, 
                    texture: textureBasePath + '2k_mercury.jpg',
                    axialTilt: 0.03,
                    rotationSpeed: 0.017,
                    // NEU: Info-Daten
                    name_de: 'Merkur',
                    realRadius_km: 2439,
                    earthCompareRadius: '0,38x Erde',
                    realDistance_Mio_km: 57.9,
                    lightMinutes: 3.2,
                    taglaenge: '176 Erdtage',
                    temperatur: '-173°C bis 427°C',
                    funFacts: [
                        'Auf Merkur dauert ein Tag (176 Erdtage) länger als ein Jahr (88 Erdtage).',
                        'Er hat keine Monde und keine nennenswerte Atmosphäre.',
                        'Trotz seiner Nähe zur Sonne ist er nicht der heisseste Planet (das ist die Venus).'
                    ]
                },
                { 
                    name: 'Venus', 
                    radius: 2.2 * SCENE_SCALE, 
                    distance: 110 * SCENE_SCALE, 
                    yearDays: 225, 
                    texture: textureBasePath + '2k_venus_surface.jpg',
                    axialTilt: 177.0,
                    rotationSpeed: -0.0041,
                    // NEU: Info-Daten
                    name_de: 'Venus',
                    realRadius_km: 6051,
                    earthCompareRadius: '0,95x Erde',
                    realDistance_Mio_km: 108.2,
                    lightMinutes: 6.0,
                    taglaenge: '243 Erdtage (retrograd)',
                    atmosphaere: '96% CO2',
                    temperatur: '464°C (Durchschnitt)',
                    funFacts: [
                        'Die Venus dreht sich "rückwärts" (retrograd).',
                        'Ein Tag auf der Venus (243 Erdtage) ist länger als ihr Jahr (225 Erdtage).',
                        'Ihre dichte Atmosphäre aus Kohlendioxid erzeugt einen extremen Treibhauseffekt (heissester Planet).'
                    ]
                },
                { 
                    name: 'Mars', 
                    radius: 1.5 * SCENE_SCALE, 
                    distance: 230 * SCENE_SCALE, 
                    yearDays: 687, 
                    texture: textureBasePath + '2k_mars.jpg',
                    axialTilt: 25.19,
                    rotationSpeed: 0.97,
                    // NEU: Info-Daten
                    name_de: 'Mars',
                    realRadius_km: 3389,
                    earthCompareRadius: '0,53x Erde',
                    realDistance_Mio_km: 227.9,
                    lightMinutes: 12.7,
                    taglaenge: '24,6 Stunden',
                    atmosphaere: '95% CO2 (sehr dünn)',
                    temperatur: '-63°C (Durchschnitt)',
                    funFacts: [
                        'Der Mars beherbergt den Olympus Mons, den höchsten Vulkan im Sonnensystem (ca. 22 km hoch).',
                        'Er hat zwei kleine Monde: Phobos und Deimos.',
                        'Seine rote Farbe stammt von Eisenoxid (Rost) auf der Oberfläche.'
                    ]
                },
                { 
                    name: 'Jupiter', 
                    radius: 16.0 * SCENE_SCALE, 
                    distance: 500 * SCENE_SCALE, 
                    yearDays: 4333, 
                    texture: textureBasePath + '2k_jupiter.jpg',
                    axialTilt: 3.13,
                    rotationSpeed: 2.43,
                    // NEU: Info-Daten
                    name_de: 'Jupiter',
                    realRadius_km: 69911,
                    earthCompareRadius: '10,97x Erde',
                    realDistance_Mio_km: 778.5,
                    lightMinutes: 43.2,
                    taglaenge: '9,9 Stunden',
                    atmosphaere: 'H, He',
                    schwerkraft: '2,53 g',
                    funFacts: [
                        'Jupiter hat über 90 bekannte Monde, darunter die vier "Galileischen Monde".',
                        'Ein Tag auf Jupiter dauert nur knapp 10 Stunden (schnellste Rotation).',
                        'Der "Große Rote Fleck" ist ein riesiger Sturm, der größer ist als die Erde.'
                    ]
                },
                { 
                    name: 'Saturn', 
                    radius: 13.0 * SCENE_SCALE, 
                    distance: 750 * SCENE_SCALE, 
                    yearDays: 10759, 
                    texture: textureBasePath + '2k_saturn.jpg',
                    ringTexture: textureBasePath + '2k_saturn_ring_alpha.png',
                    axialTilt: 26.73,
                    rotationSpeed: 2.22,
                    // NEU: Info-Daten
                    name_de: 'Saturn',
                    realRadius_km: 58232,
                    earthCompareRadius: '9,14x Erde',
                    realDistance_Mio_km: 1433.5,
                    lightMinutes: 79.6,
                    taglaenge: '10,7 Stunden',
                    atmosphaere: 'H, He',
                    ringe: '99,9% Wassereis',
                    funFacts: [
                        'Saturns Ringe bestehen hauptsächlich aus Eispartikeln, Staub und Gestein.',
                        'Er hat die geringste Dichte aller Planeten – er würde auf Wasser schwimmen.',
                        'Saturn hat über 80 Monde, der größte ist Titan, der eine eigene Atmosphäre besitzt.'
                    ]
                },
                { 
                    name: 'Uranus', 
                    radius: 6.0 * SCENE_SCALE, 
                    distance: 900 * SCENE_SCALE, 
                    yearDays: 30687, 
                    texture: textureBasePath + '2k_uranus.jpg',
                    axialTilt: 97.77,
                    rotationSpeed: 1.38,
                    // NEU: Info-Daten
                    name_de: 'Uranus',
                    realRadius_km: 25362,
                    earthCompareRadius: '3,98x Erde',
                    realDistance_Mio_km: 2872.5,
                    lightMinutes: 159.6,
                    taglaenge: '17,2 Stunden',
                    atmosphaere: 'H, He, Methan',
                    achsneigung: '97,8°',
                    funFacts: [
                        'Uranus "rollt" auf seiner Bahn, da seine Achse um 98 Grad geneigt ist.',
                        'Er ist ein "Eisriese", dessen Atmosphäre hauptsächlich aus Wasserstoff, Helium und Methan besteht.',
                        'Sein Methan absorbiert rotes Licht, was ihm seine blaugrüne Farbe gibt.'
                    ]
                },
                { 
                    name: 'Neptune', 
                    radius: 5.8 * SCENE_SCALE, 
                    distance: 1100 * SCENE_SCALE, 
                    yearDays: 60190, 
                    texture: textureBasePath + '2k_neptune.jpg',
                    axialTilt: 28.32,
                    rotationSpeed: 1.49,
                    // NEU: Info-Daten
                    name_de: 'Neptun',
                    realRadius_km: 24622,
                    earthCompareRadius: '3,86x Erde',
                    realDistance_Mio_km: 4495.1,
                    lightMinutes: 249.7,
                    taglaenge: '16,1 Stunden',
                    atmosphaere: 'H, He, Methan',
                    wind: 'Bis 2.100 km/h',
                    funFacts: [
                        'Auf Neptun herrschen die stärksten Winde im Sonnensystem (bis zu 2.100 km/h).',
                        'Er ist der am weitesten von der Sonne entfernte Planet.',
                        'Seit seiner Entdeckung im Jahr 1846 hat er 2011 erst einen vollen Sonnenumlauf vollendet.'
                    ]
                },
                // --- NEU: Pluto ---
                {
                    name: 'Pluto',
                    radius: 0.5 * SCENE_SCALE, // Sehr klein
                    distance: 1300 * SCENE_SCALE, // Weiter weg als Neptun
                    yearDays: 90582, // ca. 248 Erdjahre
                    texture: textureBasePath + '2k_pluto.jpg', 
                    axialTilt: 122.5, // Extreme Achsenneigung
                    orbitalInclination: 17.16, // Starke Bahnneigung
                    rotationSpeed: -0.156,
                    // NEU: Info-Daten
                    name_de: 'Pluto (Zwergplanet)',
                    realRadius_km: 1188,
                    earthCompareRadius: '0,18x Erde',
                    realDistance_Mio_km: 5906.4,
                    lightMinutes: 328.1,
                    taglaenge: '6,4 Erdtage',
                    atmosphaere: 'N, Methan, CO (dünn)',
                    temperatur: '-229°C (Durchschnitt)',
                    funFacts: [
                        'Pluto wurde 2006 zum "Zwergplaneten" herabgestuft.',
                        'Er hat 5 bekannte Monde, der größte (Charon) ist fast halb so groß wie Pluto selbst.',
                        'Seine Umlaufbahn ist so elliptisch, dass er der Sonne manchmal näher ist als Neptun.'
                    ]
                }
                // --- ENDE NEU ---
            ];
        }

        // --- Himmelskörper erstellen ---
        // (MODIFIZIERT: Bahneigung für Pluto + userData.info hinzugefügt)
        function createSolarSystem() {
            const textureLoader = new THREE.TextureLoader();

            // 1. Sternenhimmel
            const starGeometry = new THREE.SphereGeometry(3500, 32, 32); 
            const starTexture = textureLoader.load('https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/8k_stars.jpg');
            const starMaterial = new THREE.MeshBasicMaterial({
                map: starTexture,
                side: THREE.BackSide 
            });
            starField = new THREE.Mesh(starGeometry, starMaterial);
            scene.add(starField);

            // 2. Sonne
	        const sunTexture = textureLoader.load('https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/2k_sun.jpg');
            const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
	        sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 32), sunMaterial);
            
            // --- MODIFIZIERT: Info-Daten für Sonne ---
            sun.userData.info = {
                name: 'Sonne',
                radius_km: '695.700',
                earthCompareRadius: '109x Erde',
                oberflaeche_temp: 'ca. 5.500 °C',
                kerntemperatur: 'ca. 15 Mio. °C',
                zusammensetzung: '74% Wasserstoff, 24% Helium',
                alter: 'ca. 4,6 Mrd. Jahre',
                funFacts: [
                    'Die Sonne macht 99,86% der Masse unseres Sonnensystems aus.',
                    'Sie ist ein Stern vom Typ "Gelber Zwerg".',
                    'Das Licht der Sonne braucht ca. 8,3 Minuten bis zur Erde.'
                ]
            };
            clickableObjects.push(sun); // Zum Klicken hinzufügen
            // --- ENDE MODIFIZIERT ---
            
            scene.add(sun);
            
            // 3. Erde
            earthPivot = new THREE.Group();
            scene.add(earthPivot);

            const earthMaterial = new THREE.ShaderMaterial({
                vertexShader: earthVertexShader,
                fragmentShader: earthFragmentShader,
                uniforms: {
                    dayTexture: { value: textureLoader.load('https://stemkoski.github.io/Three.js/images/earth-day.jpg') },
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                    uObjectWorldPosition: { value: new THREE.Vector3() },
                    uNightBrightness: { value: 0.3 }, 
                    uSofiDemoActive: { value: false },
                    uMoonPosition: { value: new THREE.Vector3() },
                    uMoonRadius: { value: MOON_RADIUS },
                    uSunRadius: { value: SUN_RADIUS } 
                }
            });
            earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 32, 32), earthMaterial);
            earth.position.x = EARTH_DISTANCE;
            earth.rotation.order = 'YXZ'; 
            earth.rotation.z = EARTH_TILT_RAD; 
            
            // --- MODIFIZIERT: Info-Daten für Erde ---
            earth.userData.info = {
                name: 'Erde',
                radius_km: '6.371',
                earthCompareRadius: '1x Erde',
                distance_Mio_km: '149,6',
                distanceType: 'Abstand zur Sonne',
                lightTime: '8,3 Minuten (von Sonne)',
                taglaenge: '23,9 Stunden',
                atmosphaere: '78% N, 21% O2',
                temperatur: '15°C (Durchschnitt)',
                funFacts: [ 
                    'Die Erde ist der einzige uns bekannte Planet, auf dem es flüssiges Wasser an der Oberfläche gibt.',
                    'Sie ist der dichteste Planet im Sonnensystem.',
                    'Das Magnetfeld der Erde schützt uns vor Sonnenwinden.'
                ]
            };
            clickableObjects.push(earth); // Zum Klicken hinzufügen
            // --- ENDE MODIFIZIERT ---
            
            earthPivot.add(earth);

            // 4. Mond
            moonPivot = new THREE.Group();
            moonPivot.rotation.x = MOON_TILT_RAD; 
            scene.add(moonPivot); 

            originalMoonMaterial = new THREE.ShaderMaterial({
                vertexShader: moonVertexShader,
                fragmentShader: moonFragmentShader,
                uniforms: {
                    dayTexture: { value: textureLoader.load('https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/2k_moon.jpg') },
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                    uEarthPosition: { value: new THREE.Vector3() },
                    uObjectWorldPosition: { value: new THREE.Vector3() },
                    uEarthRadius: { value: EARTH_RADIUS },
                    uSunRadius: { value: SUN_RADIUS },
                    uMoonRadius: { value: MOON_RADIUS },
                    uNightBrightness: { value: 0.3 },
                    uDemoActive: { value: false },
                    uShadowBrightness: { value: 0.0 }, 
                    uRedOverlayIntensity: { value: 0.0 } 
                }
            });
            moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 32, 32), originalMoonMaterial);
            moon.position.x = -MOON_DISTANCE; 
            
            // --- MODIFIZIERT: Info-Daten für Mond ---
            moon.userData.info = {
                name: 'Mond',
                radius_km: '1.737',
                earthCompareRadius: '0,27x Erde',
                distance_Mio_km: '384.400 km (im Schnitt)', // 384.400 km
                distanceType: 'Abstand zur Erde',
                lightTime: '1,3 Sekunden (von Erde)',
                umlaufzeit: '27,3 Erdtage',
                taglaenge: '27,3 Erdtage',
                temperatur: '-173°C (Nacht) bis 127°C (Tag)',
                funFacts: [ 
                    'Der Mond entfernt sich jedes Jahr etwa 3,8 cm von der Erde.',
                    'Er hat eine "gebundene Rotation", weshalb wir immer dieselbe Seite sehen.',
                    'Die Schwerkraft des Mondes verursacht die Gezeiten (Ebbe und Flut) auf der Erde.'
                ]
            };
            clickableObjects.push(moon); // Zum Klicken hinzufügen
            // --- ENDE MODIFIZIERT ---
            
            moonPivot.add(moon);
            
            // 5. Andere Planeten
            planetsData.forEach(data => {
                const pivot = new THREE.Group();
                
                // --- NEU: Bahneigung (Inklination) ---
                if (data.orbitalInclination) {
                    pivot.rotation.x = (data.orbitalInclination * Math.PI) / 180;
                }
                // --- ENDE NEU ---
                
                scene.add(pivot);
                
                const material = new THREE.ShaderMaterial({
                    vertexShader: earthVertexShader,
                    fragmentShader: earthFragmentShader,
                    uniforms: {
                        dayTexture: { value: textureLoader.load(data.texture) },
                        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                        uObjectWorldPosition: { value: new THREE.Vector3() },
                        uNightBrightness: { value: 0.3 },
                        uSofiDemoActive: { value: false },
                        uMoonPosition: { value: new THREE.Vector3() },
                        uMoonRadius: { value: 0.1 },
                        uSunRadius: { value: SUN_RADIUS } 
                    }
                });

                const planet = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 32, 32), material);
                planet.position.x = data.distance;
                
                planet.rotation.order = 'YXZ';
                planet.rotation.z = (data.axialTilt * Math.PI) / 180;

                // --- MODIFIZIERT: Info-Daten für Planeten ---
                // Kopiert alle Daten aus dem planetsData-Eintrag in userData.info
                planet.userData.info = { ...data }; 
                
                // (Diese Felder werden nicht im Popup gebraucht)
                delete planet.userData.info.name; 
                delete planet.userData.info.radius;
                delete planet.userData.info.distance;
                delete planet.userData.info.yearDays;
                delete planet.userData.info.texture;
                delete planet.userData.info.ringTexture;
                delete planet.userData.info.axialTilt;
                delete planet.userData.info.orbitalInclination;
                delete planet.userData.info.rotationSpeed;
                
                planet.userData.info.name = data.name_de; // Sicherstellen, dass der deutsche Name da ist
                
                clickableObjects.push(planet); // Zum Klicken hinzufügen
                // --- ENDE MODIFIZIERT ---

                // Speziell für Saturn: Ring hinzufügen
                if (data.name === 'Saturn') {
                    const ringTexture = textureLoader.load(data.ringTexture);
                    ringTexture.wrapT = THREE.RepeatWrapping;

                    saturnRingMaterial = new THREE.ShaderMaterial({
                        vertexShader: ringVertexShader,
                        fragmentShader: ringFragmentShader,
                        uniforms: {
                            ringTexture: { value: ringTexture },
                            uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                            uSaturnPosition: { value: new THREE.Vector3() },
                            uSaturnRadius: { value: data.radius },
                            uNightBrightness: { value: 0.3 }
                        },
                        transparent: true,
                        side: THREE.DoubleSide
                    });

                    const ringGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.2, 64);
                    
                    ringGeometry.rotateX(Math.PI / 2); 
                    
                    const pos = ringGeometry.attributes.position;
                    const uv = ringGeometry.attributes.uv;
                    const innerRadius = data.radius * 1.2;
                    const outerRadius = data.radius * 2.2;
                    const repeatFactor = 10; 
                    
                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i);
                        const z = pos.getZ(i);
                        let angle = 1.0 - ((Math.atan2(z, x) / (Math.PI * 2)) + 0.5);
                        let v = angle * repeatFactor;
                        const r = Math.sqrt(x * x + z * z);
                        let u = (r - innerRadius) / (outerRadius - innerRadius);
                        uv.setXY(i, u, v);
                    }
                    
                    const ringMesh = new THREE.Mesh(ringGeometry, saturnRingMaterial);
                    planet.add(ringMesh);
                }
                
                pivot.add(planet);

                otherPlanets.push(planet);
                otherPlanetPivots.push(pivot);
            });
        }

        // --- Umlaufbahnen (Linien) ---
        // (MODIFIZIERT: Bahneigung für Pluto-Orbit)
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
            moonOrbitLine.rotation.x = MOON_TILT_RAD; 
            scene.add(moonOrbitLine); 
            
            planetsData.forEach(data => {
                const orbitLine = createOrbitLine(data.distance, 0x555555); // Grau
                
                // --- NEU: Bahneigung (Inklination) für Orbitlinie ---
                if (data.orbitalInclination) {
                    orbitLine.rotation.x = (data.orbitalInclination * Math.PI) / 180;
                }
                // --- ENDE NEU ---
                
                scene.add(orbitLine);
                otherPlanetOrbits.push(orbitLine);
            });
        }

        // --- UI-Einrichtung ---
        // (MODIFIZIERT: Pluto-Button-Name + Popup-Schliessen-Listener)
        function setupUI() {
            //Verbergen Button toggle
             const uiContainer = document.getElementById('ui-container');
            const toggleBtn = document.getElementById('toggle-ui');
            toggleBtn.addEventListener('click', () => {
                uiContainer.classList.toggle('minimized');
                toggleBtn.textContent = uiContainer.classList.contains('minimized') ? 'Anzeigen' : 'Verbergen';
            });
            
            //Orbit Checkbox
            orbitCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                earthOrbitLine.visible = isChecked;
                moonOrbitLine.visible = isChecked;
            });
            earthOrbitLine.visible = orbitCheckbox.checked;
            moonOrbitLine.visible = orbitCheckbox.checked;

            // --- MODIFIZIERT: Geteilte Checkboxen für Planeten und Bahnen ---

            // 1. Checkbox für Planeten-Sichtbarkeit
            planetsVisibleCheckbox.addEventListener('change', (e) => {
                const isVisible = e.target.checked;
                otherPlanetPivots.forEach(pivot => {
                    pivot.visible = isVisible;
                });
                // Das Anzeigen/Verbergen der Fokus-Buttons hängt nur von den Planeten ab
                planetFocusContainer.style.display = isVisible ? 'flex' : 'none';
            });

            // 2. Checkbox für Planetenbahn-Sichtbarkeit
            planetsOrbitCheckbox.addEventListener('change', (e) => {
                const isVisible = e.target.checked;
                otherPlanetOrbits.forEach(orbit => {
                    orbit.visible = isVisible;
                });
            });

            // 3. Initialen Status für BEIDE setzen
            const planetsInitiallyVisible = planetsVisibleCheckbox.checked;
            otherPlanetPivots.forEach(pivot => { pivot.visible = planetsInitiallyVisible; });
            
            const orbitsInitiallyVisible = planetsOrbitCheckbox.checked;
            otherPlanetOrbits.forEach(orbit => { orbit.visible = orbitsInitiallyVisible; });

            // 4. Initialen Status der Planeten-Fokus-Buttons setzen (ersetzt die alte Logik am Ende von setupUI)
            planetFocusContainer.style.display = planetsInitiallyVisible ? 'flex' : 'none';
            // --- ENDE MODIFIKATION ---

            
            // Event-Listener für Dunkelheits-Slider
            darknessSlider.addEventListener('input', (e) => {
                const brightness = parseFloat(e.target.value);
                
                earth.material.uniforms.uNightBrightness.value = brightness;
                originalMoonMaterial.uniforms.uNightBrightness.value = brightness;
                
                otherPlanets.forEach(planet => {
                    planet.material.uniforms.uNightBrightness.value = brightness;
                });
                
                if (saturnRingMaterial) {
                    saturnRingMaterial.uniforms.uNightBrightness.value = brightness;
                }
                
                darknessLabel.textContent = brightness.toFixed(2);
            });
            
            //Speedslider Fix
            speedSlider.addEventListener('input', onSpeedSliderChange);
            onSpeedSliderChange(); 
            //Play Button fix
            playPauseBtn.addEventListener('click', togglePlay);
            daySlider.addEventListener('input', () => {
                pauseSimulation();
                currentDay = parseFloat(daySlider.value);
                updatePositions(currentDay);
                updateUI();
            });
            
            // Initialwert setzen
            const initialBrightness = parseFloat(darknessSlider.value);
            earth.material.uniforms.uNightBrightness.value = initialBrightness;
            originalMoonMaterial.uniforms.uNightBrightness.value = initialBrightness;
            otherPlanets.forEach(planet => {
                planet.material.uniforms.uNightBrightness.value = initialBrightness;
            });
            if (saturnRingMaterial) {
                saturnRingMaterial.uniforms.uNightBrightness.value = initialBrightness;
            }
            darknessLabel.textContent = initialBrightness.toFixed(2);


            // Event Listener für Fokus (ruft jetzt setFocus mit Standard-Dauer auf)
            document.getElementById('focus-system').addEventListener('click', () => setFocus(sun));
            document.getElementById('focus-earth').addEventListener('click', () => setFocus(earth));
            document.getElementById('focus-moon').addEventListener('click', () => setFocus(moon));

            // Listener für Ekliptik-Sicht (MODIFIZIERT: nutzt flyTo)
            document.getElementById('focus-ecliptic').addEventListener('click', () => {
                cameraFocus = 'ecliptic_side_view'; // Behält den Logik-Namen
                
                let earthPos = new THREE.Vector3();
                earth.getWorldPosition(earthPos);
                
                const target = new THREE.Vector3(0, 0, 0); // Schaut auf das Zentrum
                
                let offset = earthPos.clone().normalize().multiplyScalar(40);
                let sideOffset = new THREE.Vector3(-earthPos.z, 0, earthPos.x).normalize().multiplyScalar(4); 
                
                const endPos = earthPos.clone().add(offset).add(sideOffset);
                endPos.y = 0; // Auf die Ekliptik-Ebene
                
                flyTo(endPos, target, 2.0, 'ecliptic_side_view'); // MODIFIZIERT: Dauer 1.0 -> 2.0
            });

            document.getElementById('demo-sofi').addEventListener('click', () => startDemo('sofi'));
            document.getElementById('demo-mofi').addEventListener('click', () => startDemo('mofi'));
            endDemoBtn.addEventListener('click', endDemo);
            
            demoSpeedSlider.addEventListener('input', onDemoSpeedSliderChange);
            onDemoSpeedSliderChange();

            document.querySelectorAll('#moon-phases-ui button').forEach(btn => {
                const index = parseInt(btn.dataset.phaseIndex);
                btn.addEventListener('click', () => jumpToPhase(index));
                moonPhaseButtons.push(btn);
            });
            
            // Planeten-Fokus-Buttons dynamisch erstellen
            planetsData.forEach((data, index) => {
                const btn = document.createElement('button');
                btn.id = `focus-${data.name.toLowerCase()}`;
                btn.className = 'btn btn-secondary';
                
                // --- MODIFIZY: Verwendet name_de und kürzt (Zwergplanet) ab ---
                let btnName = data.name_de;
                if (btnName.includes('(')) {
                    btnName = btnName.split('(')[0].trim(); // "Pluto (Zwergplanet)" -> "Pluto"
                }
                btn.textContent = btnName;
                // --- ENDE MODIFIZY ---

                btn.addEventListener('click', () => {
                    setFocus(otherPlanets[index]); // Nutzt jetzt animiertes setFocus
                });
                planetFocusContainer.appendChild(btn);
            });
            
            // --- NEU: Listener für Popup-Schliessen-Button ---
            document.getElementById('popup-close-btn').addEventListener('click', () => {
                document.getElementById('info-popup').style.display = 'none';
            });
            // --- ENDE NEU ---
        }
        
        // --- NEU: Kamera-Flug-Funktion ---
        /**
         * Startet eine sanfte Kamera-Transition (Flug).
         * @param {THREE.Vector3} endPos - Die Zielposition der Kamera.
         * @param {THREE.Vector3} endTarget - Das Ziel, auf das die Kamera schauen soll.
         * @param {number} duration - Dauer des Flugs in Sekunden.
         * @param {Object | string} newFocusTarget - Das Objekt oder der Modus, der nach dem Flug fokussiert bleiben soll.
         */
        function flyTo(endPos, endTarget, duration = 1.0, newFocusTarget = null) {
            // NEU: Jede automatische Kamerabewegung setzt den manuellen
            // Steuerungs-Flag zurück.
            isUserControllingCamera = false;

            // --- NEU: Abfangen für sofortigen Sprung ---
            if (duration <= 0) {
                camera.position.copy(endPos);
                controls.target.copy(endTarget);
                lastCameraTargetPos.copy(endTarget);
                isCameraTransitioning = false;
                cameraFocus = newFocusTarget;
                return; // Beendet die Funktion hier
            }
            // --- ENDE NEU ---
            
            isCameraTransitioning = true;
            cameraTransitionProgress = 0.0;
            cameraTransitionDuration = duration;
            
            cameraTransitionStartPos.copy(camera.position);
            cameraTransitionStartTarget.copy(controls.target);
            
            cameraTransitionEndPos.copy(endPos);
            cameraTransitionEndTarget.copy(endTarget);
            
            cameraFocusAfterTransition = newFocusTarget; // z.B. earth, moon, 'earthView'
            cameraFocus = 'transitioning'; // Sperrt die updateCamera-Logik
        }
        
        // --- Event Handler ---
        function togglePlay() {
            isPlaying = !isPlaying;
            playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
            controls.enableZoom = true;
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
                // --- MODIFIZIERT: Exponentielle Skala für bessere Kontrolle im langsamen Bereich ---
                // (value / 90) wird quadriert, um den Slider am Anfang langsamer ansteigen zu lassen
                const normalizedValue = (value / 90.0);
                speed = minSpeed + (normalizedValue * normalizedValue) * (normalSpeed - minSpeed);
                // --- ENDE MODIFIZIERT ---
            } else {
                // Der schnelle Bereich bleibt linear
                speed = normalSpeed + ((value - 90) / 10) * (maxSpeed - normalSpeed);
            }
            
            speedLabel.textContent = speed.toFixed(4) + 'x'; 
        }
        
        function onDemoSpeedSliderChange() {
            const value = parseFloat(demoSpeedSlider.value); 
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

        /**
         * MODIFIZIERT: Startet einen Kamera-Flug (animiert) oder Sprung (Dauer 0).
         * @param {THREE.Object3D} targetObj - Das Zielobjekt.
         * @param {number} duration - Dauer des Flugs in Sekunden. 0 für sofortigen Sprung.
         */
        function setFocus(targetObj, duration = 2.0) { // MODIFIZIERT: Dauer 1.0 -> 2.0
            // --- NEU: Feste "Sonnensystem"-Ansicht ---
            if (targetObj === sun) {
                cameraFocus = sun; // Setzt das Ziel, das *nach* dem Flug verfolgt wird
                // --- MODIFIZIERT: Kameraposition angepasst ---
                // const homePos = new THREE.Vector3(-800, 600, 800); // ALT: "links-oben" Linie
                const homePos = new THREE.Vector3(-600, 450, 600); // NEU: Noch näher dran
                // --- ENDE MODIFIZIERT ---
                const homeTarget = new THREE.Vector3(0, 0, 0); // Schaut auf die Sonne (Zentrum)
                
                if (duration === 0) { // Sofortiger Sprung
                    camera.position.copy(homePos);
                    controls.target.copy(homeTarget);
                    lastCameraTargetPos.copy(homeTarget);
                    isCameraTransitioning = false; 
                    cameraFocus = sun; 
                } else {
                    flyTo(homePos, homeTarget, duration, sun); // Animierter Flug
                }
                controls.enableZoom = true;
                return; // WICHTIG: Funktion hier beenden
            }
            // --- ENDE NEU ---

            cameraFocus = targetObj; // Setzt das Ziel, das *nach* dem Flug verfolgt wird
            
            let zoomFactor;
            const radius = targetObj.geometry.parameters.radius;
            
            if (targetObj === moon) {
                zoomFactor = 10.0;
            } else if (targetObj === sun) {
                zoomFactor = 0.2;
            // --- NEU: Spezifischer Zoom für Jupiter und Saturn ---
            } else if (targetObj === otherPlanets[3]) { // Jupiter
                zoomFactor = 1.5; // Näher heran (war dynamisch ca. 0.39)
            } else if (targetObj === otherPlanets[4]) { // Saturn
                zoomFactor = 2.0; // Näher heran (war dynamisch ca. 0.48). Etwas näher als Saturn kleiner ist.
            // --- ENDE NEU ---
            // --- NEU: Spezifischer Zoom für die Erde ---
            } else if (targetObj === earth) {
                // Näher ran, sodass die Mondbahn (Radius 15) den Bildschirm fast ausfüllt
                zoomFactor = 4.2; 
            // --- ENDE NEU ---
            } else {
                // Dynamischer Zoom basierend auf Planetengröße im Verhältnis zur Erde
                zoomFactor = (EARTH_RADIUS / radius) * 2.5; 
            }

            const targetPos = new THREE.Vector3();
            targetObj.getWorldPosition(targetPos);
            
            const endTarget = targetPos.clone();
            
            // --- MODIFIZIERT: Berechne Offset, um auf die belichtete Seite zu schauen ---
            // Richtung vom Planeten zur Sonne (Sonne ist bei 0,0,0)
            const offsetDir = new THREE.Vector3(0, 0, 0).sub(targetPos).normalize();
            
            // Füge eine "Y" (oben) Komponente hinzu, um schräg draufzuschauen
            offsetDir.y = 0.5; // (kann angepasst werden, 0.5 ist ein guter Start)
            offsetDir.normalize(); // Erneut normalisieren, um einen korrekten Richtungsvektor zu erhalten
            // --- ENDE MODIFIZIERT ---
            
            const offset = offsetDir.multiplyScalar(EARTH_DISTANCE / zoomFactor);
            const endPos = targetPos.clone().add(offset);

            if (duration === 0) { // Sofortiger Sprung
                camera.position.copy(endPos);
                controls.target.copy(endTarget);
                lastCameraTargetPos.copy(endTarget);
                isCameraTransitioning = false; // Sicherstellen, dass keine Transition läuft
                cameraFocus = targetObj; // Fokus direkt setzen
            } else {
                flyTo(endPos, endTarget, duration, targetObj); // Animierter Flug
            }

            controls.enableZoom = true;
        }

        function resetToRealMode() {
            isDemoActive = false;
            demoType = '';
            controls.enableZoom = true;

            demoButtons.style.display = 'flex';
            demoControlButtons.style.display = 'none';
            demoSpeedControl.style.display = 'none';

            earth.rotation.z = EARTH_TILT_RAD;
            earth.rotation.x = 0; 
            moonPivot.rotation.x = MOON_TILT_RAD; 
            
            earth.material.uniforms.uSofiDemoActive.value = false;
            
            if (moon.material.uniforms) {
                originalMoonMaterial.uniforms.uDemoActive.value = false; 
                originalMoonMaterial.uniforms.uShadowBrightness.value = 0.0;
                originalMoonMaterial.uniforms.uRedOverlayIntensity.value = 0.0;
            }
        }
        
        // --- MODIFIZIERT: Nutzt jetzt flyTo für spezielle Kamerapositionen ---
        function startDemo(type) {
            pauseSimulation(); 
            resetToRealMode(); 
            
            isDemoActive = true;
            demoType = type;
            isPlaying = true; 
            playPauseBtn.textContent = 'Pause';
            controls.enableZoom = true; 

            demoButtons.style.display = 'none'; 
            demoControlButtons.style.display = 'flex'; 
            demoSpeedControl.style.display = 'block'; 
            
            if (type === 'sofi') {
                earth.rotation.z = -EARTH_TILT_RAD;
                
                demoDurationDays = 2; 
                currentDay = LUNAR_MONTH_DAYS * 0.0 - (demoDurationDays / 2); 
                demoLoopStartDay = currentDay;
                demoLoopEndDay = LUNAR_MONTH_DAYS * 0.0 + (demoDurationDays / 2); 
                
                earth.material.uniforms.uSofiDemoActive.value = true;
                earthDemoRotationOffset = 3.7 * Math.PI / 4; 
                moon.position.y = 0.3; 

                // setFocus(earth); // ALT
            } else if (type === 'mofi') {
                earth.rotation.z = 0;
                
                demoDurationDays = 17.5 - 14.3; 
                currentDay = 14.3; 
                demoLoopStartDay = currentDay;
                demoLoopEndDay = 17.5; 

                moonPivot.position.y = MOON_RADIUS * 1.0; 
                originalMoonMaterial.uniforms.uDemoActive.value = true;
                
                // setFocus(moon); // ALT
            }
            
            updatePositions(currentDay); // Wichtig: Positionen setzen
            daySlider.value = currentDay;
            updateUI();

            // --- NEU: Kamera-Flug (NACH updatePositions) ---
            if (type === 'sofi') {
                const earthPos = new THREE.Vector3();
                earth.getWorldPosition(earthPos);
                const sunPos = new THREE.Vector3(0,0,0); // Sonne ist im Zentrum
                
                const target = earthPos.clone();
                // Positioniere Kamera zwischen Erde und Sonne (auf der belichteten Seite)
                const direction = sunPos.clone().sub(earthPos).normalize();
                const endPos = earthPos.clone().add(direction.multiplyScalar(EARTH_RADIUS * 5)); // 5 Radien davor
                
                flyTo(endPos, target, 3.0, earth); // MODIFIZIERT: 1.5s -> 3.0s Flug, dann Erde fokussieren

            } else if (type === 'mofi') {
                const moonPos = new THREE.Vector3();
                moon.getWorldPosition(moonPos);
                const sunPos = new THREE.Vector3(0,0,0); // Sonne ist im Zentrum
                
                const target = moonPos.clone();
                // Positioniere Kamera "vor" den Mond (aus Sicht der Sonne)
                const direction = sunPos.clone().sub(moonPos).normalize();
                const endPos = moonPos.clone().add(direction.multiplyScalar(MOON_RADIUS * 12)); // 12 Radien davor
                
                flyTo(endPos, target, 3.0, moon); // MODIFIZIERT: 1.5s -> 3.0s Flug, dann Mond fokussieren
            }
        }

        function endDemo() {
            resetToRealMode();
            currentDay = 0; 
            daySlider.value = currentDay;
            moonPivot.position.y = 0; 
            
            earthDemoRotationOffset = 0.0; 
            moon.position.y = 0; 
            
            updatePositions(currentDay);
            updateUI();
        }
        
        // --- MODIFIZIERT: Nutzt jetzt flyTo ---
        function jumpToPhase(index) {
            pauseSimulation(); 
            resetToRealMode(); 
            
            earthDemoRotationOffset = 0.0; 
            moonPivot.position.y = 0; 
            moon.position.y = 0;
            
            currentDay = PHASE_DAY_MAP[index];

            moonPhaseButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            const clickedButton = moonPhaseButtons.find(btn => parseInt(btn.dataset.phaseIndex) === index);
            if (clickedButton) {
                clickedButton.classList.add('active');
            }
            
            updatePositions(currentDay);
            daySlider.value = currentDay;
            updateUI();

            // MODIFIZIERT: Fliege zur "Erdsicht auf Mond"-Position
            let earthPos = new THREE.Vector3();
            let moonPos = new THREE.Vector3();
            earth.getWorldPosition(earthPos);
            moon.getWorldPosition(moonPos);
            
            // MODIFIZIERT: Springe zur Erd-Position, schaue auf den Mond
            // und aktiviere den 'earthView'-Modus (Kamera-Lock).
            flyTo(earthPos, moonPos, 0, 'earthView'); 
        }

        // --- Animations-Loop (MODIFIZIERT: Verwaltet Kamera-Transition) ---
        function animate() {
            requestAnimationFrame(animate);
            const deltaTime = clock.getDelta(); // NEU: Zeitdelta holen

            // 1. Kamera-Transition-Logik
            if (isCameraTransitioning) {
                cameraTransitionProgress += deltaTime / cameraTransitionDuration;
                
                // Sanftes Ein- und Ausblenden (Ease-In-Out)
                const t = cameraTransitionProgress < 0.5 
                    ? 4 * cameraTransitionProgress * cameraTransitionProgress * cameraTransitionProgress 
                    : 1 - Math.pow(-2 * cameraTransitionProgress + 2, 3) / 2;

                if (cameraTransitionProgress >= 1.0) {
                    // Übergang beendet
                    isCameraTransitioning = false;
                    camera.position.copy(cameraTransitionEndPos);
                    controls.target.copy(cameraTransitionEndTarget);
                    cameraFocus = cameraFocusAfterTransition; // Fokus wiederherstellen
                    lastCameraTargetPos.copy(controls.target);
                } else {
                    // Während des Übergangs: Position und Ziel interpolieren
                    camera.position.lerpVectors(cameraTransitionStartPos, cameraTransitionEndPos, t);
                    controls.target.lerpVectors(cameraTransitionStartTarget, cameraTransitionEndTarget, t);
                }
            }

            // 2. Simulations-Logik (läuft auch während des Kameraflugs)
            let actualSpeed = speed;
            if (isDemoActive) {
                actualSpeed = demoLoopSpeed;
            }

            if (isPlaying) {
                // Originale, Framerate-abhängige Zeitlogik
                const deltaDays = (actualSpeed * (1 / 60)) * (isDemoActive ? 1 : EARTH_YEAR_DAYS / 60); 
                currentDay += deltaDays;
                
                if (isDemoActive) {
                    if (currentDay > demoLoopEndDay) {
                        currentDay = demoLoopStartDay; 
                    } else if (currentDay < demoLoopStartDay) { 
                        currentDay = demoLoopEndDay;
                    }
                }
                
                daySlider.value = currentDay % EARTH_YEAR_DAYS;
                updateUI();
            }

            // 3. Updates (laufen immer)
            updatePositions(currentDay);
            updateCamera(false); // updateCamera wird jetzt nur aktiv, wenn *nicht* getransitiont wird
            
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
            
            if (isDemoActive && demoType === 'sofi') {
                rotationFactor = 0.1; 
            }
            
            earth.rotation.y = (day * rotationFactor) * Math.PI * 2; 
            earth.rotation.y += earthDemoRotationOffset; 

            // 3. Umlaufbahn des Mondes (um die Erde)
            let moonOrbitAngle;
            if (isDemoActive) {
                moonOrbitAngle = (day / LUNAR_MONTH_DAYS) * Math.PI * 2;
            } else {
                moonOrbitAngle = ((day - PHASE_OFFSET_DAYS) / LUNAR_MONTH_DAYS) * Math.PI * 2;
            }
            
            let earthPos = new THREE.Vector3();
            earth.getWorldPosition(earthPos);
            
            moonPivot.position.copy(earthPos);
            moonPivot.rotation.y = moonOrbitAngle; 
            moonOrbitLine.position.copy(earthPos);
            
            // 4. Eigendrehung des Mondes (Gebundene Rotation)
            moon.rotation.y = 0;

            // 5. Positionen der anderen Planeten aktualisieren
            otherPlanetPivots.forEach((pivot, index) => {
                const data = planetsData[index];
                const planet = otherPlanets[index];
                
                const orbitAngle = (day / data.yearDays) * Math.PI * 2;
                pivot.rotation.y = orbitAngle;
                
                // planet.rotation.y = (day * 1.0) * Math.PI * 2; 

                // --- MODIFIZIERT: Realistische Rotationsgeschwindigkeit ---
                // Nutzt den neuen 'rotationSpeed'-Wert aus definePlanetData()
                // (relativ zur Erde = 1.0)
                planet.rotation.y = (day * data.rotationSpeed) * Math.PI * 2;
                // --- ENDE MODIFIZIERT ---

                let tempVec = new THREE.Vector3();
                planet.getWorldPosition(tempVec);
                planet.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
                
                if (data.name === 'Saturn' && saturnRingMaterial) {
                    saturnRingMaterial.uniforms.uSaturnPosition.value.copy(tempVec);
                }
            });

            // 6. Shader-Uniforms aktualisieren (war 5.)
            let tempVec = new THREE.Vector3();
            earth.getWorldPosition(tempVec);
            earth.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
            
            let moonWorldPosition = new THREE.Vector3();
            moon.getWorldPosition(moonWorldPosition);
            earth.material.uniforms.uMoonPosition.value.copy(moonWorldPosition);

            // MoFi-Demo Logik
            if (isDemoActive && demoType === 'mofi') {
                const animProgress = (currentDay - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);
                
                const dayToProgress = (d) => (d - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);

                const peakDay = 15.7; 
                const peakProgress = dayToProgress(peakDay); 

                const redFadeInStart = peakProgress - 0.05; 
                const redFadeOutStart = dayToProgress(16.4); 
                const redFadeOutEnd = dayToProgress(16.5);   
                
                const shadowFadeInStart = peakProgress - 0.05; 
                const shadowFadeInEnd = peakProgress;         

                const shadowFadeOutStart = dayToProgress(16.2);
                const shadowFadeOutEnd = dayToProgress(16.5);
                
                const shadowTargetBrightness = 0.6; 

                let redIntensity = 0.0;
                let shadowBrightness = 0.0; 

                if (animProgress <= peakProgress) {
                    const fadeProgress = Math.max(0.0, (animProgress - redFadeInStart) / (peakProgress - redFadeInStart));
                    redIntensity = (fadeProgress * fadeProgress); 
                }
                else if (animProgress > peakProgress && animProgress <= redFadeOutEnd) {
                    const fadeProgress = (animProgress - peakProgress) / (redFadeOutEnd - peakProgress);
                    redIntensity = 1.0 - (fadeProgress * fadeProgress); 
                }

                if (animProgress > shadowFadeInStart && animProgress <= shadowFadeInEnd) {
                    const fadeProgress = (animProgress - shadowFadeInStart) / (shadowFadeInEnd - shadowFadeInStart);
                    shadowBrightness = (fadeProgress * fadeProgress) * shadowTargetBrightness;
                }
                else if (animProgress > shadowFadeInEnd && animProgress <= shadowFadeOutStart) {
                     shadowBrightness = shadowTargetBrightness;
                }
                else if (animProgress > shadowFadeOutStart && animProgress <= shadowFadeOutEnd) {
                    const fadeProgress = (animProgress - shadowFadeOutStart) / (shadowFadeOutEnd - shadowFadeOutStart);
                    shadowBrightness = shadowTargetBrightness - ((fadeProgress * fadeProgress) * shadowTargetBrightness);
                }
                
                originalMoonMaterial.uniforms.uShadowBrightness.value = shadowBrightness;
                originalMoonMaterial.uniforms.uRedOverlayIntensity.value = redIntensity;
            }
            
            moon.getWorldPosition(tempVec);
            if (moon.material.uniforms) {
                originalMoonMaterial.uniforms.uObjectWorldPosition.value.copy(tempVec);
                earth.getWorldPosition(tempVec); 
                originalMoonMaterial.uniforms.uEarthPosition.value.copy(tempVec);
            }
        }

        // --- MODIFIZIERT: Führt nur noch das "Folgen" aus, kein Springen/Fliegen ---
        function updateCamera(isJump = false) {
            // Wenn wir fliegen oder springen (isJump=true, wird von init nicht mehr genutzt), 
            // wird die Kamera an anderer Stelle gesteuert.
            if (isCameraTransitioning || isJump) {
                return;
            }
            
            // Wenn der Fokus ein String-Name für eine Logik ist (z.B. 'transitioning' oder 'earthView')
            if (typeof cameraFocus === 'string') {
                if (cameraFocus === 'earthView') {
                    // NEUE LOGIK:
                    // Die Kamera bleibt auf der Erde (Position) und schaut 
                    // zum Mond (Target). ABER: Wenn der Benutzer die 
                    // Kamera selbst bewegt, wird dieser Lock aufgehoben.
                    
                    if (isUserControllingCamera) {
                        // 1. Der Benutzer hat die Steuerung übernommen.
                        // Wir wechseln den Fokus zum MOND.
                        cameraFocus = moon; 
                        
                        // 2. WICHTIG: Wir setzen 'lastCameraTargetPos' sofort auf den MOND,
                        //    damit kein Sprung im nächsten Frame entsteht.
                        moon.getWorldPosition(lastCameraTargetPos);
                        
                        // 3. WICHTIG: Wir kehren sofort zurück, damit wir in DIESEM Frame
                        //    nicht noch die Standard-Logik ausführen, die evtl. mit
                        //    der manuellen Steuerung kollidiert.
                        return; 

                    } else {
                        // 4. Der Benutzer steuert nicht. Wir wenden den Lock an.
                        //    (Das ist die "von Erde auf Mond schauen"-Logik)
                        let earthPos = new THREE.Vector3();
                        let moonPos = new THREE.Vector3();
                        earth.getWorldPosition(earthPos);
                        moon.getWorldPosition(moonPos);
                        
                        // Halte die Kameraposition = Erdposition
                        camera.position.copy(earthPos); 
                        // Halte das Target = Mondposition
                        controls.target.copy(moonPos);
                        lastCameraTargetPos.copy(moonPos);
                        return; // Wichtig: updateCamera hier beenden
                    }
                }
                
                if (cameraFocus === 'ecliptic_side_view') {
                    // Logik für Ekliptik-Sicht (folgt der Erde von der Seite)
                    let earthPos = new THREE.Vector3();
                    earth.getWorldPosition(earthPos);
                    
                    let offset = earthPos.clone().normalize().multiplyScalar(40);
                    let sideOffset = new THREE.Vector3(-earthPos.z, 0, earthPos.x).normalize().multiplyScalar(4); 
                    
                    const endPos = earthPos.clone().add(offset).add(sideOffset);
                    endPos.y = 0; // Auf die Ekliptik-Ebene
                    
                    camera.position.copy(endPos);
                    controls.target.set(0, 0, 0);
                    lastCameraTargetPos.copy(controls.target);
                    return;
                }
                
                // Wenn 'transitioning' oder unbekannter String, tu nichts (oder setze Standard)
                if (cameraFocus === 'transitioning') return;
                
                // Fallback, falls Fokus-String unbekannt ist
                setFocus(sun, 0); // Springe zur Sonne
                return;
            }
            
            // Wenn der Fokus ein Objekt ist (Standard-Folgen-Logik)
            let targetObj = cameraFocus; 
            
            if (!targetObj) {
                targetObj = sun;
                cameraFocus = sun;
            }
            
            let currentTargetPos = new THREE.Vector3();
            targetObj.getWorldPosition(currentTargetPos);

            // Dies ist die "Folgen"-Logik
            if (isPlaying || isDemoActive) {
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
            // KORREKTUR: Das 'f' wurde hier entfernt
            earth.getWorldPosition(earthPos);
            moon.getWorldPosition(moonPos);

            const vecEarthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos);
            const vecEarthToSun = new THREE.Vector3().subVectors(sunPos, earthPos); 
            
            let angle = Math.atan2(vecEarthToSun.z, vecEarthToSun.x) - Math.atan2(vecEarthToMoon.z, vecEarthToMoon.x);
            angle = (angle + Math.PI * 2) % (Math.PI * 2);
            
            let phaseIndex = 0;
            let normalizedAngle = angle;
            
            phaseIndex = Math.floor(normalizedAngle / (Math.PI * 2) * 8 + 0.5) % 8;
            
            const phaseNames = ["Neumond", "Zun. Sichel", "Zun. Halbmond", "Zun. Drittel", "Vollmond", "Abn. Drittel", "Abn. Halbmond", "Abn. Sichel"];
            let phaseName = phaseNames[phaseIndex];

            let infoText = `Tag: ${Math.floor(currentDay % EARTH_YEAR_DAYS)} | ${phaseName}`;
            
            // Finsternis-Logik (Prüfung)
            if (isDemoActive) {
                if (demoType === 'sofi') {
                    infoText = "SONNENFINSTERNIS (Demo)";
                } else if (demoType === 'mofi') {
                    infoText = "MONDFINSTERNIS (Demo)";
                }
            } else {
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

        // --- NEUE/MODIFIZIERTE FUNKTIONEN FÜR INFO-POPUP ---

        /**
         * NEU: Start des Touch-Events. Speichert die Startposition.
         */
        function onTouchStart(event) {
            // Nur den ersten Finger berücksichtigen
            if (event.touches.length === 1) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                isDragging = false; // Zurücksetzen bei jedem neuen Touch
            }
        }
        
        /**
         * NEU: Bewegung des Touch-Events. Prüft, ob es ein "Drag" ist.
         */
        function onTouchMove(event) {
            if (isDragging || event.touches.length !== 1) {
                return; // Entweder schon als Drag markiert or Multi-Touch
            }
            
            const deltaX = Math.abs(event.touches[0].clientX - touchStartX);
            const deltaY = Math.abs(event.touches[0].clientY - touchStartY);
            
            // Wenn der Finger sich mehr als den Schwellenwert bewegt, ist es ein Drag
            if (deltaX > dragThreshold || deltaY > dragThreshold) {
                isDragging = true;
            }
        }
        
        /**
         * NEU: Ende des Touch-Events (Tap-Logik)
         */
        function onTouchEnd(event) {
            // event.target ist beim 'touchend' das Element, auf dem der Touch *gestartet* wurde
            const targetElement = event.target;
            
            // Wenn 'isDragging' true ist, war es eine Wischgeste (Kamerasteuerung), kein Tap.
            if (isDragging) {
                isDragging = false; // Reset
                return;
            }
            
            // Es war ein Tap. Holen der Koordinaten.
            // Wichtig: 'changedTouches' verwenden, da 'touches' bei 'touchend' leer ist.
            const touch = event.changedTouches[0];
            if (!touch) return; 
            
            // Führe die Klick/Tap-Logik aus
            const popupOpened = handleInteraction(touch.clientX, touch.clientY, targetElement);
            
            // "Ghost Click" verhindern: Wenn das Popup geöffnet wurde,
            // verhindern wir das 300ms verzögerte 'click'-Event.
            if (popupOpened) {
                event.preventDefault();
            }
        }

        /**
         * NEU: Klick-Event (nur für Maus)
         */
        function onMouseClick(event) {
            // Führe die Klick/Tap-Logik aus
            handleInteraction(event.clientX, event.clientY, event.target);
        }

        /**
         * NEU: Zentrale Logik für Klick/Tap-Verarbeitung (Raycasting)
         * Prüft UI-Kollision und führt Raycasting aus.
         * Gibt true zurück, wenn das Popup geöffnet wurde.
         */
        function handleInteraction(x, y, targetElement) {
            // Verhindern, dass Klicks auf die UI (oder das Popup selbst) die Szene durchdringen
            const uiContainer = document.getElementById('ui-container');
            const popup = document.getElementById('info-popup');
            
            // Prüfen, ob das Ziel-Element (wo geklickt/getippt wurde) Teil der UI oder des Popups ist
            if (uiContainer.contains(targetElement) || popup.contains(targetElement)) {
                return false; // Interaktion war auf der UI, nicht in der Szene
            }

            // Maus-/Touch-Position normalisieren (von -1 bis +1)
            mouse.x = (x / window.innerWidth) * 2 - 1;
            mouse.y = -(y / window.innerHeight) * 2 + 1;

            // Raycaster von der Kamera durch die Mausposition aktualisieren
            raycaster.setFromCamera(mouse, camera);

            // Schnittpunkte mit den klickbaren Objekten berechnen
            const intersects = raycaster.intersectObjects(clickableObjects);

            if (intersects.length > 0) {
                // Das erste getroffene Objekt nehmen
                const clickedObject = intersects[0].object;
                
                // Prüfen, ob das Objekt Info-Daten hat
                if (clickedObject.userData.info) {
                    showInfoPopup(clickedObject.userData.info);
                    return true; // Popup wurde geöffnet
                }
            }
            return false; // Nichts getroffen oder kein Info-Objekt
        }


        /**
         * Zeigt das Info-Popup mit den Daten des übergebenen Objekts an.
         * @param {object} info - Das info-Objekt aus userData.
         */
        // --- MODIFIZIERT: showInfoPopup für neue dynamische Datenstruktur ---
        function showInfoPopup(info) {
            const popup = document.getElementById('info-popup');
            const titleEl = document.getElementById('popup-title');
            const detailsEl = document.getElementById('popup-details');

            titleEl.textContent = info.name;

            // Mapping von internen Schlüsseln zu angezeigten Labels
            const factMap = {
                oberflaeche_temp: 'Oberflächentemp.',
                kerntemperatur: 'Kerntemperatur',
                zusammensetzung: 'Zusammensetzung',
                alter: 'Alter',
                distance_Mio_km: 'Abstand (Sonne)', // Standard
                lightTime: 'Lichtlaufzeit',
                taglaenge: 'Tageslänge',
                temperatur: 'Temperatur',
                atmosphaere: 'Atmosphäre (Haupt.)',
                schwerkraft: 'Schwerkraft (Vergl. Erde)',
                ringe: 'Ringe (Zus.)',
                achsneigung: 'Achsenneigung',
                wind: 'Windgeschwindigkeit',
                umlaufzeit: 'Umlaufzeit'
            };

            // Spezielle Labels für Erde und Mond
            if (info.distanceType) {
                factMap['distance_Mio_km'] = info.distanceType; // z.B. "Abstand zur Erde"
            }
            if (info.name === 'Erde') {
                 factMap['temperatur'] = 'Durchschnittstemp.';
            }

            let detailsHTML = `
                <p><strong>Radius:</strong> <span>${info.radius_km} km</span></p>
                <p><strong>Größe:</strong> <span>${info.earthCompareRadius}</span></p>
            `;

            // Dynamisch alle "Hardfacts" hinzufügen, die im Mapping definiert sind
            for (const key in info) {
                if (factMap[key] && info[key]) {
                    detailsHTML += `<p><strong>${factMap[key]}:</strong> <span>${info[key]}</span></p>`;
                }
            }
            
            // Fun Facts hinzufügen (jetzt ein Array)
            if (info.funFacts && info.funFacts.length > 0) {
                info.funFacts.forEach((fact, index) => {
                    // Füge eine Trennlinie vor dem ersten Fakt hinzu
                    const style = (index === 0) ? 'margin-top: 15px; padding-top: 10px; border-top: 1px dashed #444;' : '';
                    detailsHTML += `<p class="fun-fact" style="${style}">${fact}</p>`;
                });
            }

            detailsEl.innerHTML = detailsHTML;
            
            // Popup anzeigen
            popup.style.display = 'flex';
        }
        // --- ENDE MODIFIKATION ---

        // --- ENDE NEUE FUNKTIONEN ---


        // --- Start ---
        init();
    </script>
</body>
</html>
