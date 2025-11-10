<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sonnensystem-Simulation (6. Klasse) - Realistische Bahnen & Saturnschatten</title>
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
            z-index: 1000; 
        }

        #toggle-ui {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
        }
        #toggle-ui:hover {
            background: rgba(255,255,255,0.1);
        }

        #ui-container.minimized {
            max-width: 50px; 
            padding: 10px;
            overflow: hidden;
            height: 30px; 
        }
        #ui-container.minimized .control-group {
            display: none;
        }
        #ui-container.minimized #toggle-ui {
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%);
             border: none;
        }

        .control-group {
            margin-bottom: 15px;
        }
        .control-group:first-of-type {
            margin-top: 25px;
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
            transition: all 0.2s ease; 
        }

        .btn:hover {
            background-color: #0056b3;
        }
        
        .btn:active {
            transform: scale(0.98);
        }

        #play-pause-btn.playing {
            background-color: #28a745; 
            box-shadow: 0 0 10px rgba(40, 167, 69, 0.5); 
        }
        #play-pause-btn.playing:hover {
            background-color: #218838;
        }

        .btn-secondary {
            background-color: #4a4a4a;
        }
        .btn-secondary:hover {
            background-color: #666;
        }

        .btn-focus {
            background-color: #388e3c; 
            color: white;
        }
        .btn-focus:hover {
            background-color: #4caf50; 
        }

        .btn-planet {
            background-color: #d87c1c; 
            color: white;
            font-size: 12px !important; 
            padding: 6px 8px !important;
        }
        .btn-planet:hover {
            background-color: #e69545; 
        }

        .btn-moon {
            background-color: #6f42c1; 
            color: white;
            font-size: 11px !important; 
            padding: 4px 8px !important;
        }
        .btn-moon:hover {
            background-color: #59359a;
        }
        
        .btn-warning {
            background-color: #ffc107;
            color: #000;
        }
        .btn-warning:hover {
            background-color: #e0a800;
        }
        
        .btn-danger { 
            background-color: #dc3545;
            color: white;
        }
        .btn-danger:hover {
            background-color: #c82333;
        }

        .btn-info { 
            background-color: #00ffff;
            color: #000;
            font-weight: 700;
        }
        .btn-info:hover {
            background-color: #00aaaa;
            color: #fff;
        }

        .btn-pulse {
            animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(0, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
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

        #moon-focus-container {
            display: none; 
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #555;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

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

        #info-popup {
            display: none; 
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
            z-index: 2000; 
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
            color: #ffc107; 
        }
        #popup-details p {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.4;
        }
        #popup-details strong {
            color: #fff; 
            font-weight: 600;
            min-width: 140px; 
            display: inline-block;
        }
        #popup-details span {
            color: #ddd;
        }
        #popup-details .fun-fact {
            margin-top: 8px; 
            padding-top: 0; 
            border-top: none; 
            font-style: italic;
            color: #ccc;
        }

        #info-toast-button {
            display: none; 
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1001; 
            background-color: #00ffff;
            color: #000;
            border: 2px solid #000;
            box-shadow: 0 4px 10px rgba(0, 255, 255, 0.3);
            font-size: 14px;
            font-weight: 700;
            font-family: cursive;
            padding: 10px 15px;
        }

        /* --- UFO Dialog Styles --- */
        #ufo-dialog {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 0, 0.95); 
            color: #0f0; 
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
            border: 2px solid #0f0;
            z-index: 2001;
            width: 80%;
            max-width: 350px;
            font-family: "Courier New", monospace;
            text-align: center;
        }
        #ufo-dialog h3 {
            margin-top: 0;
            color: #0f0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        #ufo-dialog-text {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .ufo-btn-group {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        .ufo-btn {
            background: #000;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 8px 15px;
            cursor: pointer;
            font-family: "Courier New", monospace;
            font-weight: bold;
            transition: all 0.2s;
        }
        .ufo-btn:hover {
            background: #0f0;
            color: #000;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
        }

        /* Styles für Realitätscheck Controls */
        #real-scale-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #555;
        }
        #real-dist-label {
            display: none; 
            color: #ff9999;
            animation: fadeIn 0.5s ease;
        }

    </style>
</head>
<body>

    <div id="container"></div>

    <div id="ui-container">
        <button id="toggle-ui" class="btn btn-secondary" title="Menü verbergen">✕</button>

        <div class="control-group" id="controls-general">
            <h3>Steuerung</h3>
            <div class="btn-group" style="margin-bottom: 15px;" id="play-group">
                <button id="play-pause-btn" class="btn">Pause</button>
            </div>
            
            <div id="time-controls">
                <label for="day-slider">Tag im Jahr: (Eingabe)</label>
                <input type="range" id="day-slider" min="0" max="365" value="0" step="0.1">
                
                <label for="speed-slider" style="margin-top: 10px;">Geschwindigkeit:</label>
                <input type="range" id="speed-slider" min="0" max="100" value="10" step="1">
            </div>

            <div id="comet-controls" style="display: none; margin-top: 15px; border-top: 1px dashed #444; padding-top: 10px;">
                <button id="follow-comet-btn" class="btn btn-info btn-pulse" style="width: 100%; margin-bottom: 10px;">🔭 Komet verfolgen!</button>
                <label class="checkbox-label" style="color: #00ffff;">
                    <input type="checkbox" id="comet-speed-checkbox">
                    Komet-Zeitraffer (3x)
                </label>
            </div>

            <div id="visibility-controls">
                 <label class="checkbox-label" style="margin-top: 15px;">
                    <input type="checkbox" id="orbit-checkbox" checked>
                    Erd-/Mondbahn anzeigen
                </label>
                
                <div style="display: flex; gap: 15px; margin-top: 10px;">
                    <label class="checkbox-label" style="flex: 1;">
                        <input type="checkbox" id="planets-visible-checkbox" checked>
                        Planeten
                    </label>
                    <label class="checkbox-label" style="flex: 1;">
                        <input type="checkbox" id="planets-orbit-checkbox" checked>
                        Bahnen
                    </label>
                </div>
            </div>
            
            <label for="darkness-slider" style="margin-top: 10px;">Helligkeit (Nachtseite): <span id="darkness-label">0.30</span></label>
            <input type="range" id="darkness-slider" min="0" max="0.9" value="0.3" step="0.01">
        </div>

        <div class="control-group">
            <h3>Kamera-Fokus</h3>
            <div class="btn-group">
                <button id="focus-system" class="btn btn-focus">Sonnensystem</button>
                <button id="focus-earth" class="btn btn-focus">Erde</button>
                <button id="focus-moon" class="btn btn-focus">Mond</button>
                <button id="focus-ecliptic" class="btn btn-focus">Ekliptik-Sicht</button>
            </div>
            <div id="planet-focus-buttons" class="btn-group" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; display: none;">
            </div>
            <div id="moon-focus-container">
            </div>
        </div>

        <div class="control-group">
            <h3>Ereignisse & Extras</h3>
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
            
            <div id="info-box">Mondphase: Neumond</div>
        </div>

        <div class="control-group" id="moon-phases-group">
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

        <div class="control-group" id="real-scale-group">
             <div id="real-scale-controls">
                <button id="real-scale-btn" class="btn btn-secondary" style="width: 100%; order: 1;">
                    🔍 Reale Grössen
                </button>
                
                <button id="real-dist-btn" class="btn btn-secondary" style="width: 100%; margin-top: 5px; display: none; order: 2;">
                    🚀 Reale Distanz
                </button>
            </div>
        </div>
        
    </div>

    <div id="info-popup">
        <div id="info-popup-content">
            <h2 id="popup-title">Titel</h2>
            <div id="popup-details">
                </div>
            <button id="popup-close-btn" class="btn btn-secondary">Schliessen</button>
        </div>
    </div>

    <!-- UFO Dialog -->
    <div id="ufo-dialog">
        <h3>🛸 Unbekanntes Flugobjekt</h3>
        <div id="ufo-dialog-text">Wir sind auf dem Weg zur Erde um diese zu übernehmen. Weißt du wo die ist?</div>
        <div class="ufo-btn-group" id="ufo-initial-buttons">
            <button id="ufo-yes-btn" class="ufo-btn">Ja, dort lang! 👉</button>
            <button id="ufo-no-btn" class="ufo-btn">Keine Ahnung 🤷‍♂️</button>
        </div>
        <div class="ufo-btn-group" id="ufo-close-group" style="display: none;">
            <button id="ufo-close-btn" class="ufo-btn">Kommunikation beenden</button>
        </div>
    </div>

    <button id="info-toast-button" class="btn btn"></button>

    <script>
        // --- Globale Variablen ---
        let scene, camera, renderer, controls;
        let sun, earth, moon, moonPivot;
        let earthTiltPivot;
        
        let earthOrbitLine, moonOrbitLine;
        let starField;
        
        let otherPlanets = [];
        let otherPlanetControls = []; 
        let otherPlanetOrbits = [];
        let otherMoons = []; 
        let planetsData = [];
        let saturnRingMaterial;
        let saturnPlanetMaterial;
        
        let isPlaying = true;
        let currentDay = 0;
        let speed = 1.0;
        let cameraFocus = 'system';
        let lastCameraTargetPos = new THREE.Vector3();
        let isDemoActive = false;
        let originalMoonMaterial;
        let moonPhaseButtons = [];

        // --- Animations-Variablen für Realitätscheck ---
        let isRealScaleActive = false;
        let isRealDistanceActive = false;
        let realityCheckPhase = 'idle'; // 'idle', 'positioning', 'growing', 'active', 'flying_out', 'flying_in'

        let flightStartState = { startDist: 0, startMoonDist: 0, progress: 0, duration: 4.0 };
        
        let referenceLine = null;
        let referenceTicks = null; // NEU: Ticks für den roten Faden
        let referenceFadeTimer = 0; // NEU: Timer fürs Ausblenden
        let sunGhost = null;

        let targetSunScale = 1.0;
        let targetEarthDistance; 
        let targetMoonDistance; 
        let currentSunScale = 1.0;
        let currentEarthDistance;
        let currentMoonDistance; 
        // ----------------------------------------------

        // Demo-spezifische Variablen
        let demoLoopStartDay = 0;
        let demoLoopEndDay = 0;
        let demoLoopSpeed = 0.1; 
        let demoType = ''; 
        let demoShadowBrightness = 0.0; 
        let demoRedOverlay = 0.0; 
        let earthDemoRotationOffset = 0.0;
        
        // Kamera-Animation (Tweening)
        const clock = new THREE.Clock();
        let isCameraTransitioning = false;
        let cameraTransitionProgress = 0.0;
        let cameraTransitionDuration = 1.0;
        let cameraTransitionStartPos = new THREE.Vector3();
        let cameraTransitionStartTarget = new THREE.Vector3();
        let cameraTransitionEndPos = new THREE.Vector3();
        let cameraTransitionEndTarget = new THREE.Vector3();
        let cameraFocusAfterTransition = null;
        let cameraTransitionCallback = null; 

        // Raycasting (Klick-Erkennung)
        let raycaster;
        let mouse;
        let clickableObjects = [];
        
        // Touch-Handling für Popup
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging = false;
        const dragThreshold = 10;

        // Interaction handling variables
        let interactionTimeout;
        let userInteractedRecently = false;

        // --- Konstanten ---
        const SCENE_SCALE = 1.0;
        const SUN_RADIUS = 62.5 * SCENE_SCALE; 
        const EARTH_RADIUS = 2.5 * SCENE_SCALE;
        const MOON_RADIUS = 0.68 * SCENE_SCALE;
        const ERDE_RADIUS_KM = 6371;
        
        const EARTH_DISTANCE = 270 * SCENE_SCALE;
        const MOON_DISTANCE = 15 * SCENE_SCALE;

        const EARTH_TILT_RAD = (23.5 * Math.PI) / 180;
        const MOON_TILT_RAD = (5.1 * Math.PI) / 180; 

        const EARTH_YEAR_DAYS = 365.25;
        const LUNAR_MONTH_DAYS = 29.53; 
        
        const PHASE_OFFSET_DAYS = 5; 

        // --- Konstanten für reale Verhältnisse ---
        const REAL_SUN_SCALE_FACTOR = (109 * EARTH_RADIUS) / SUN_RADIUS; 
        const REAL_EARTH_DIST_VALUE = 23400 * EARTH_RADIUS; 
        const COMPARE_EARTH_DIST_VALUE = 300 * SCENE_SCALE;
        const REAL_MOON_DIST_VALUE = 60 * EARTH_RADIUS; 
        // -----------------------------------------
        
        const RING_SHADOW_SOFTNESS = 10 * SCENE_SCALE;
        const SATURN_RING_C_INNER = 1.00 * EARTH_RADIUS; 
        const SATURN_RING_B_OUTER = 2.05 * EARTH_RADIUS; 
        const SATURN_RING_A_INNER = 2.25 * EARTH_RADIUS; 
        const SATURN_RING_A_OUTER = 2.70 * EARTH_RADIUS; 
        
        const RING_INNER_RADIUS_SCALE = 1.2; 
        const RING_OUTER_RADIUS_SCALE = 2.7; 

        const PHASE_DAY_MAP = [
            LUNAR_MONTH_DAYS * 0.02  + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.145 + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.27  + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.395 + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.55  + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.71  + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.85  + PHASE_OFFSET_DAYS, 
            LUNAR_MONTH_DAYS * 0.97  + PHASE_OFFSET_DAYS  
        ];

        let isUserControllingCamera = false;
        let currentSelectedInfo = null;
        let infoToastButton;
        let followCometBtn;
        let cometControls; 

        // --- UFO Variablen ---
        let ufo;
        let ufoState = 'inactive'; 
        let ufoSpawnTimer = Math.random() * 180 + 120; 
        let ufoWanderTimer = 0;
        let ufoTargetPos = new THREE.Vector3();
        let ufoCurrentTargetObject = null; 
        let ufoDepartureTarget = null; 
        const UFO_SPEED = 80 * SCENE_SCALE; 
        let ufoLeaveTimer = 0; 
        // --------------------------
        
        // --- Komet Variablen und Klasse ---
        let comet; 
        let cometSpawnTimer = THREE.MathUtils.randFloat(600, 1200); 
        const COMET_SPAWN_DIST = 2500 * SCENE_SCALE; 
        const COMET_DESTROY_DIST = 2500 * SCENE_SCALE; 
        const COMET_CAMERA_RESET_DIST = 2400 * SCENE_SCALE; 
        
        const GRAVITY_STRENGTH = 100000 * SCENE_SCALE; 
        const GRAVITY_FACTOR = 0.05; 
        const MIN_PERIHELION_DISTANCE = 110 * SCENE_SCALE; 
        
        let cometTimeScale = 1.0;

        class Comet {
            constructor(scene) {
                this.scene = scene;
                this.particles = [];
                this.group = new THREE.Group(); 
                scene.add(this.group);

                this.radius = THREE.MathUtils.randFloat(0.8 * SCENE_SCALE, 1.2 * SCENE_SCALE);
                this.baseSpeed = THREE.MathUtils.randFloat(6.0 * SCENE_SCALE, 10.0 * SCENE_SCALE); 
                
                const colorVariant = Math.random();
                if (colorVariant < 0.33) {
                     this.color = new THREE.Color(0.5, 1.0, 0.8); 
                } else if (colorVariant < 0.66) {
                     this.color = new THREE.Color(0.6, 0.8, 1.0); 
                } else {
                     this.color = new THREE.Color(0.9, 0.9, 1.0); 
                }

                const cometGeo = new THREE.DodecahedronGeometry(this.radius, 1);
                
                const textureLoader = new THREE.TextureLoader();
                const rockTexture = textureLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/moon_1024.jpg', undefined, undefined, (err) => {});

                this.material = new THREE.MeshStandardMaterial({ 
                    map: rockTexture,         
                    color: 0xaaaaaa,          
                    roughness: 0.9,           
                    metalness: 0.1,
                    flatShading: true,       
                    emissive: this.color,
                    emissiveIntensity: 0.0 
                });
                this.mesh = new THREE.Mesh(cometGeo, this.material);
                
                this.mesh.scale.set(
                    THREE.MathUtils.randFloat(0.7, 1.3),
                    THREE.MathUtils.randFloat(0.7, 1.3),
                    THREE.MathUtils.randFloat(0.7, 1.3)
                );

                this.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                this.group.add(this.mesh);

                this.glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
                    map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/glow.png'), 
                    color: this.color, 
                    transparent: true, 
                    blending: THREE.AdditiveBlending,
                    opacity: 0.0 
                }));
                this.glowSprite.scale.set(this.radius * 30, this.radius * 30, 1.0); 
                this.mesh.add(this.glowSprite); 

                const startAngle = THREE.MathUtils.randFloat(0, Math.PI * 2);
                const startX = Math.cos(startAngle) * COMET_SPAWN_DIST;
                const startZ = Math.sin(startAngle) * COMET_SPAWN_DIST;
                const startY = THREE.MathUtils.randFloat(-300 * SCENE_SCALE, 300 * SCENE_SCALE);
                const startPos = new THREE.Vector3(startX, startY, startZ);
                this.group.position.copy(startPos);
                
                const centerTargetOffset = 100 * SCENE_SCALE;
                let target = new THREE.Vector3(
                    THREE.MathUtils.randFloat(-centerTargetOffset, centerTargetOffset),
                    THREE.MathUtils.randFloat(-centerTargetOffset, centerTargetOffset),
                    THREE.MathUtils.randFloat(-centerTargetOffset, centerTargetOffset)
                );
                
                const startToSun = startPos.clone().negate();
                const startToSunNormal = startToSun.clone().normalize();
                const initialDirection = new THREE.Vector3().subVectors(target, startPos).normalize();
                const perpendicularOffset = new THREE.Vector3().crossVectors(startPos, initialDirection).normalize();
                perpendicularOffset.multiplyScalar(MIN_PERIHELION_DISTANCE * THREE.MathUtils.randFloat(1.1, 1.5)); 
                target.add(perpendicularOffset);
                const finalDirection = new THREE.Vector3().subVectors(target, startPos).normalize();
                
                this.velocity = finalDirection.multiplyScalar(this.baseSpeed);

                this.tailGroup = new THREE.Group();
                this.scene.add(this.tailGroup); 
                
                this.age = 0;

                this.mesh.userData.info = {
                    name: 'Komet (Vagabund)', 
                    type: 'comet', 
                    radius_km: `ca. ${Math.round(this.radius * 5)} km`, 
                    velocity: `variabel`, 
                    funFacts: [
                        'Kometen sind "schmutzige Schneebälle" aus Eis, Staub und Gestein.',
                        'Ihr Schweif entsteht erst in Sonnennähe, wenn das Eis verdampft (sublimiert).',
                        'Der Schweif zeigt immer von der Sonne weg, getrieben durch den Sonnenwind.'
                    ]
                };
                clickableObjects.push(this.mesh);
            }

            update(deltaTime) {
                const cometDelta = deltaTime * cometTimeScale;

                const sunPos = new THREE.Vector3(0,0,0);
                const toSun = new THREE.Vector3().subVectors(sunPos, this.group.position);
                const distanceSq = toSun.lengthSq();
                const distance = Math.sqrt(distanceSq);
                
                const safeDistanceSq = Math.max(distanceSq, (SUN_RADIUS * 2) * (SUN_RADIUS * 2));
                
                let acceleration = toSun.normalize().multiplyScalar(GRAVITY_STRENGTH / safeDistanceSq);
                acceleration.multiplyScalar(GRAVITY_FACTOR); 
                
                this.velocity.add(acceleration.multiplyScalar(cometDelta));
                this.group.position.add(this.velocity.clone().multiplyScalar(cometDelta));

                this.mesh.rotation.x += cometDelta * 0.1; 
                this.mesh.rotation.y += cometDelta * 0.15;

                const activeDist = EARTH_DISTANCE * 4.5;
                const intensity = 1.0 - Math.min(1.0, distance / activeDist); 
                
                this.material.roughness = 0.9 - (intensity * 0.7); 
                this.material.emissiveIntensity = intensity * 1.5; 
                this.glowSprite.material.opacity = Math.pow(intensity, 2) * 0.8; 

                this.generateTail(distance, intensity, cometDelta); 
                this.updateTail(cometDelta);
                
                const isMovingAway = this.group.position.dot(this.velocity) > 0;

                if (distance > COMET_CAMERA_RESET_DIST && isMovingAway) {
                    if (cameraFocus === this.mesh) {
                        setFocus(sun, 3.0);
                    }
                    if (cometControls) cometControls.style.display = 'none';
                }

                if (distance > COMET_DESTROY_DIST && isMovingAway) {
                    this.destroy();
                    return true; 
                }
                this.age += cometDelta;
                return false; 
            }

            generateTail(sunDistance, intensity, cometDelta) {
                if (intensity <= 0.05) return;

                const spawnChance = (intensity + 0.2) * cometTimeScale; 
                if (Math.random() > spawnChance) return; 

                const spawnOffset = new THREE.Vector3(
                    THREE.MathUtils.randFloat(-1, 1),
                    THREE.MathUtils.randFloat(-1, 1),
                    THREE.MathUtils.randFloat(-1, 1)
                ).normalize().multiplyScalar(this.radius * THREE.MathUtils.randFloat(1.0, 1.5));

                const spawnPos = this.group.position.clone().add(spawnOffset);

                const particleGeo = new THREE.SphereGeometry(this.radius * THREE.MathUtils.randFloat(0.1, 0.3), 4, 4);
                const particleMat = new THREE.MeshBasicMaterial({ 
                    color: this.color.clone().lerp(new THREE.Color(0xffffff), 0.5), 
                    transparent: true, 
                    opacity: intensity * 0.6, 
                    blending: THREE.AdditiveBlending 
                });
                const particleMesh = new THREE.Mesh(particleGeo, particleMat);
                particleMesh.position.copy(spawnPos);
                
                const fromSun = this.group.position.clone().normalize(); 
                const oppositeVelocity = this.velocity.clone().normalize().negate(); 
                
                const tailDir = new THREE.Vector3().addVectors(
                    fromSun.multiplyScalar(intensity * 0.8), 
                    oppositeVelocity.multiplyScalar(1.0 - intensity * 0.5)
                ).normalize();

                tailDir.x += THREE.MathUtils.randFloat(-0.15, 0.15); 
                tailDir.y += THREE.MathUtils.randFloat(-0.15, 0.15);
                tailDir.z += THREE.MathUtils.randFloat(-0.15, 0.15);

                this.particles.push({
                    mesh: particleMesh,
                    velocity: tailDir.multiplyScalar(THREE.MathUtils.randFloat(5 * SCENE_SCALE, 15 * SCENE_SCALE)),
                    drift: new THREE.Vector3( 
                        THREE.MathUtils.randFloat(-1, 1),
                        THREE.MathUtils.randFloat(-1, 1),
                        THREE.MathUtils.randFloat(-1, 1)
                    ).multiplyScalar(3.0 * SCENE_SCALE), 
                    lifetime: THREE.MathUtils.randFloat(8.0, 15.0), 
                    age: 0,
                    initialOpacity: particleMat.opacity
                });
                this.tailGroup.add(particleMesh);
            }

            updateTail(cometDelta) {
                const newParticles = [];
                for (let i = 0; i < this.particles.length; i++) {
                    const p = this.particles[i];
                    p.velocity.add(p.drift.clone().multiplyScalar(cometDelta * 0.1));
                    p.mesh.position.add(p.velocity.clone().multiplyScalar(cometDelta));
                    p.age += cometDelta;
                    const lifeRatio = p.age / p.lifetime;
                    if (lifeRatio >= 1.0) {
                        this.tailGroup.remove(p.mesh);
                        p.mesh.geometry.dispose();
                        p.mesh.material.dispose();
                    } else {
                        p.mesh.material.opacity = p.initialOpacity * (1.0 - lifeRatio);
                        p.mesh.scale.setScalar(1.0 + (lifeRatio * 6.0)); 
                        newParticles.push(p);
                    }
                }
                this.particles = newParticles;
            }

            destroy() {
                if (cameraFocus === this.mesh) {
                    setFocus(sun, 3.0);
                }
                if (cometControls) cometControls.style.display = 'none';

                this.particles.forEach(p => {
                    this.tailGroup.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    p.mesh.material.dispose();
                });
                this.particles = [];
                this.group.remove(this.mesh);
                this.scene.remove(this.group);
                this.scene.remove(this.tailGroup); 
                this.mesh.geometry.dispose();
                this.material.dispose(); 
                if (this.material.map) this.material.map.dispose(); 
                this.glowSprite.material.dispose();

                const index = clickableObjects.indexOf(this.mesh);
                if (index > -1) clickableObjects.splice(index, 1);
            }
        }
        
        // --- DOM-Elemente ---
        const container = document.getElementById('container');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const speedSlider = document.getElementById('speed-slider');
        const orbitCheckbox = document.getElementById('orbit-checkbox');
        const infoBox = document.getElementById('info-box');
        
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
                if (pixelDistanceToAxis > penumbraRadius) return 1.0;
                if (pixelDistanceToAxis < umbraRadius) return 0.0;
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
                        float moonShadowIntensity = calculateMoonShadowIntensity(vWorldPosition, uMoonPosition, uMoonRadius, uSunPosition, uSunRadius);
                        finalColor.rgb *= moonShadowIntensity;
                    }
                }
                gl_FragColor = finalColor;
            }
        `;

        const saturnFragmentShader = `
            uniform sampler2D dayTexture;
            uniform vec3 uSunPosition;
            uniform vec3 uObjectWorldPosition; 
            uniform float uNightBrightness;
            uniform vec3 uRingNormal;
            uniform float uRingInnerRadius;
            uniform float uRingOuterRadius;
            uniform float uRingShadowSoftness;
            const float uShadowIntensityFactor = 0.85;
            varying vec2 vUv;
            varying vec3 vWorldPosition; 
            float calculateRingShadow(vec3 fragPos, vec3 sunPos, vec3 planetPos, vec3 ringNormal, float innerR, float outerR, float softness) {
                vec3 lightDir = normalize(sunPos - fragPos);
                float denom = dot(lightDir, ringNormal);
                if (abs(denom) < 0.0001) return 0.0; 
                float t = dot(planetPos - fragPos, ringNormal) / denom;
                if (t < 0.0) return 0.0; 
                vec3 intersectPos = fragPos + t * lightDir;
                float distToCenter = distance(intersectPos, planetPos);
                float shadow = smoothstep(innerR - softness, innerR, distToCenter) * (1.0 - smoothstep(outerR, outerR + softness, distToCenter));
                return clamp(shadow, 0.0, 1.0);
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
                if (intensity > 0.48) { 
                    float ringShadowMask = calculateRingShadow(vWorldPosition, uSunPosition, uObjectWorldPosition, uRingNormal, uRingInnerRadius, uRingOuterRadius, uRingShadowSoftness);
                    vec3 shadowedColor = mix(finalColor.rgb, nightColor.rgb * uShadowIntensityFactor, ringShadowMask);
                    finalColor.rgb = shadowedColor;
                }
                gl_FragColor = finalColor;
            }
        `;

        const genericMoonFragmentShader = `
            uniform sampler2D dayTexture;
            uniform vec3 uSunPosition;
            uniform vec3 uObjectWorldPosition;
            uniform float uNightBrightness;
            uniform vec3 uParentPosition;
            uniform float uParentRadius;
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            float calculateParentShadow(vec3 fragPos, vec3 parentPos, float parentRadius, vec3 sunPos) {
                 vec3 sunToParent = parentPos - sunPos;
                 vec3 sunToFrag = fragPos - sunPos;
                 vec3 shadowAxis = normalize(sunToParent);
                 float distOnAxis = dot(fragPos - parentPos, shadowAxis);
                 if (distOnAxis < 0.0) return 1.0; 
                 vec3 closestPoint = parentPos + shadowAxis * distOnAxis;
                 float distFromAxis = distance(fragPos, closestPoint);
                 float umbra = parentRadius * 0.95;
                 float penumbra = parentRadius * 1.1;
                 return smoothstep(umbra, penumbra, distFromAxis);
            }
            void main() {
                vec4 textureColor = texture2D(dayTexture, vUv);
                vec3 objectToSun = normalize(uSunPosition - uObjectWorldPosition);
                vec3 objectToFragment = normalize(vWorldPosition - uObjectWorldPosition);
                float intensity = (dot(objectToFragment, objectToSun) + 1.0) / 2.0;
                float nightBrightness = uNightBrightness;
                float lightMix = smoothstep(0.48, 0.59, intensity);
                vec4 nightColor = textureColor * nightBrightness;
                vec4 finalColor = mix(nightColor, textureColor, lightMix);
                if (intensity > 0.01) {
                    float shadow = calculateParentShadow(vWorldPosition, uParentPosition, uParentRadius, uSunPosition);
                    finalColor.rgb *= mix(uNightBrightness, 1.0, shadow);
                }
                gl_FragColor = finalColor;
            }
        `;
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
                    float earthShadowIntensity = calculateShadowIntensity(vWorldPosition, uEarthPosition, uEarthRadius, uSunPosition, uSunRadius);
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

        function init() {
            infoToastButton = document.getElementById('info-toast-button');
            followCometBtn = document.getElementById('follow-comet-btn'); 
            cometControls = document.getElementById('comet-controls');

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 8000);
            camera.position.set(EARTH_DISTANCE * 1.5, EARTH_DISTANCE * 0.7, EARTH_DISTANCE * 1.5);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.touches = { ONE: 0, TWO: 2 };
            
            controls.addEventListener('start', () => {
                isUserControllingCamera = true;
                userInteractedRecently = true;
                if (interactionTimeout) clearTimeout(interactionTimeout);
                
                if (infoToastButton) {
                    infoToastButton.style.display = 'none';
                    currentSelectedInfo = null;
                }
            });

            controls.addEventListener('end', () => {
                isUserControllingCamera = false;
                interactionTimeout = setTimeout(() => {
                    userInteractedRecently = false;
                }, 3000); 
            });
            
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            targetEarthDistance = EARTH_DISTANCE;
            currentEarthDistance = EARTH_DISTANCE;
            targetMoonDistance = MOON_DISTANCE;
            currentMoonDistance = MOON_DISTANCE;

            definePlanetData();
            createSolarSystem();
            createOrbits();
            setupUI();

            animate();
            
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('click', onMouseClick, false);
            window.addEventListener('touchstart', onTouchStart, false);
            window.addEventListener('touchmove', onTouchMove, false);
            window.addEventListener('touchend', onTouchEnd, false);

            window.addEventListener('keydown', (e) => {
                if (e.shiftKey && (e.key === 'U' || e.key === 'u')) {
                    if (ufoState === 'inactive') {
                        spawnUFO();
                    }
                }
                if (e.shiftKey && (e.key === 'K' || e.key === 'k')) {
                    if (!comet) { 
                         spawnComet();
                    }
                }
            });
            
            updatePositions(currentDay);
            setFocus(sun, 0); 
            
            if (isPlaying) {
                 playPauseBtn.classList.add('playing');
            }
        }
        
        function definePlanetData() {
            const textureBasePath = 'https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/Images/';
            const moonTextureBasePath = 'https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/Images/';
            const degToRad = Math.PI / 180;
            
            planetsData = [
                { 
                    name: 'Mercury', 
                    radius: 0.95 * SCENE_SCALE, 
                    distance: 110 * SCENE_SCALE, 
                    yearDays: 88, 
                    texture: textureBasePath + '2k_mercury.jpg', 
                    axialTilt: 0.03, 
                    rotationSpeed: 0.017,
                    ecc: 0.205, 
                    perihelionAngle: 77.45 * degToRad, 
                    orbitalInclination: 7.0,
                    //Fakten
                    name_de: 'Merkur', earthCompareRadius: '0,38x Erde', radius_km: '2.439', distance_Mio_km: '57,9 Mio. km', umlaufzeit: '88 Erdtage', taglaenge: '176 Erdtage', temperatur: 'ca. 167°C',
                    funFacts: ['Auf Merkur dauert ein Tag (176 Erdtage) länger als ein Jahr (88 Erdtage).', 'Er hat keine Monde und keine nennenswerte Atmosphäre.', 'Trotz seiner Nähe zur Sonne ist er nicht der heisseste Planet.']
                },
                { 
                    name: 'Venus', 
                    radius: 2.4 * SCENE_SCALE, 
                    distance: 200 * SCENE_SCALE, 
                    yearDays: 225, 
                    texture: textureBasePath + '2k_venus_surface.jpg', 
                    axialTilt: 177.0, rotationSpeed: -0.0041,
                    ecc: 0.007, 
                    perihelionAngle: 131.53 * degToRad, 
                    orbitalInclination: 3.39,
                    //Fakten
                    name_de: 'Venus', earthCompareRadius: '0,95x Erde', radius_km: '6.051', distance_Mio_km: '108,2 Mio. km', umlaufzeit: '225 Erdtage', taglaenge: '243 Erdtage (rückwärts!)', temperatur: 'ca. 464°C (heissester Planet)',
                    funFacts: ['Die Venus dreht sich "rückwärts" (retrograd).', 'Ein Tag auf der Venus ist länger als ihr Jahr (Umlauf um die Sonne).', 'Ihre dichte CO2-Atmosphäre erzeugt einen extremen Treibhauseffekt.']
                },
                { 
                    name: 'Mars', 
                    radius: 1.3 * SCENE_SCALE, 
                    distance: 415 * SCENE_SCALE, 
                    yearDays: 687, 
                    texture: textureBasePath + '2k_mars.jpg', 
                    axialTilt: 25.19, 
                    rotationSpeed: 0.97,
                    ecc: 0.094, 
                    perihelionAngle: 336.04 * degToRad, 
                    orbitalInclination: 1.85,
                    //Fakten
                    name_de: 'Mars', earthCompareRadius: '0,53x Erde', radius_km: '3.389', distance_Mio_km: '227,9 Mio. km', umlaufzeit: '687 Erdtage', taglaenge: '24h 37min', temperatur: 'ca. -63°C',
                    funFacts: ['Der Mars hat den höchsten Vulkan im Sonnensystem (Olympus Mons, 22km hoch).', 'Er hat zwei kleine Monde: Phobos und Deimos.', 'Seine rote Farbe kommt von Eisenoxid (Rost) im Boden.']
                },
                { 
                    name: 'Jupiter', radius: 28.0 * SCENE_SCALE, distance: 900 * SCENE_SCALE, yearDays: 4333, texture: textureBasePath + '2k_jupiter.jpg', axialTilt: 3.13, rotationSpeed: 2.43,
                    ecc: 0.049, perihelionAngle: 14.75 * degToRad, orbitalInclination: 1.3,
                    moons: [
                        { 
                            name: 'Io', 
                            radius: 0.715 * SCENE_SCALE, 
                            distance: 49.5 * SCENE_SCALE, 
                            speed: 0.565,
                            startAngle: Math.random() * Math.PI * 2, 
                            texture: moonTextureBasePath + 'jupiter_io.jpg', 
                            inclination: 0.05 * degToRad,
                            //Fakten
                            earthCompareRadius: '0,28x Erde', radius_km: '1.821', distance_Mio_km: '421.700 km', umlaufzeit: '1,77 Tage', temperatur: 'ca. -143°C', parentName: 'Jupiter',
                            funFacts: ['Io ist der vulkanisch aktivste Körper im Sonnensystem.', 'Seine Oberfläche wird durch die Schwerkraft von Jupiter ständig "durchgeknetet".']
                        },
                        { 
                            name: 'Europa', 
                            radius: 0.61 * SCENE_SCALE, 
                            distance: 78.9 * SCENE_SCALE, 
                            speed: 0.282, 
                            startAngle: Math.random() * Math.PI * 2, 
                            texture: moonTextureBasePath + 'jupiter_europa.jpg', 
                            inclination: 0.47 * degToRad,
                            //Fakten
                            earthCompareRadius: '0,25x Erde', radius_km: '1.560', distance_Mio_km: '671.100 km', umlaufzeit: '3,55 Tage', temperatur: 'ca. -170°C', parentName: 'Jupiter',
                            funFacts: ['Europa hat einen Ozean aus flüssigem Wasser unter seiner Eiskruste.', 'Er gilt als einer der aussichtsreichsten Orte für ausserirdisches Leben.']
                        },
                        { 
                            name: 'Ganymed', 
                            radius: 1.03 * SCENE_SCALE, 
                            distance: 126 * SCENE_SCALE, 
                            speed: 0.14, 
                            startAngle: Math.random() * Math.PI * 2,
                            texture: moonTextureBasePath + 'jupiter_ganymede.jpg', 
                            inclination: 0.20 * degToRad,
                            //Fakten
                            earthCompareRadius: '0,41x Erde', radius_km: '2.634', distance_Mio_km: '1,07 Mio. km', umlaufzeit: '7,15 Tage', temperatur: 'ca. -163°C', parentName: 'Jupiter',
                            funFacts: ['Ganymed ist der größte Mond im Sonnensystem (größer als Merkur!).', 'Er ist der einzige Mond mit einer eigenen Magnetfeld.']
                        },
                        { 
                            name: 'Kallisto', 
                            radius: 0.945 * SCENE_SCALE, 
                            distance: 220 * SCENE_SCALE, 
                            speed: 0.060, 
                            startAngle: Math.random() * Math.PI * 2,
                            texture: moonTextureBasePath + 'jupiter_callisto.jpg', 
                            inclination: 0.20 * degToRad,
                            //Fakten
                            earthCompareRadius: '0,38x Erde', radius_km: '2.410', distance_Mio_km: '1,88 Mio. km', umlaufzeit: '16,69 Tage', temperatur: 'ca. -139°C', parentName: 'Jupiter',
                            funFacts: ['Kallisto hat eine der ältesten, am stärksten verkraterten Oberflächen im Sonnensystem.']
                        }
                    ],
                    //Fakten
                    name_de: 'Jupiter', earthCompareRadius: '11,2x Erde', radius_km: '69.911', distance_Mio_km: '778,5 Mio. km', umlaufzeit: '11,9 Jahre', taglaenge: '9h 56min', temperatur: 'ca. -108°C',
                    funFacts: ['Jupiter ist der größte Planet und hat über 90 Monde.', 'Der "Große Rote Fleck" ist ein riesiger Wirbelsturm, der schon seit Jahrhunderten tobt.']
                },
                { 
                    name: 'Saturn', 
                    radius: 23.8 * SCENE_SCALE, 
                    distance: 1350 * SCENE_SCALE, 
                    yearDays: 10759, 
                    texture: textureBasePath + '2k_saturn.jpg', 
                    ringTexture: textureBasePath + '2k_saturn_ring_alpha.png', 
                    axialTilt: 26.73, 
                    rotationSpeed: 2.22,
                    ecc: 0.057, 
                    perihelionAngle: 92.43 * degToRad, 
                    orbitalInclination: 2.49,
                    moons: [
                        { 
                            name: 'Titan', 
                            radius: 1.01 * SCENE_SCALE, 
                            distance: 144.9 * SCENE_SCALE, 
                            speed: 0.063, 
                            texture: moonTextureBasePath + 'saturn_titan.jpg', 
                            inclination: 0.35 * degToRad,
                            //Fakten
                            earthCompareRadius: '0,40x Erde', radius_km: '2.574', distance_Mio_km: '1,22 Mio. km', umlaufzeit: '15,95 Tage', temperatur: 'ca. -179°C', parentName: 'Saturn',
                            funFacts: ['Titan ist der einzige Mond mit einer dichten Atmosphäre.', 'Es gibt dort Seen und Flüsse aus flüssigem Methan und Ethan.']
                        }
                    ],
                    //Fakten
                    name_de: 'Saturn', earthCompareRadius: '9,5x Erde', radius_km: '58.232', distance_Mio_km: '1,43 Mrd. km', umlaufzeit: '29,5 Jahre', taglaenge: '10h 34min', temperatur: 'ca. -139°C',
                    funFacts: ['Saturns beeindruckende Ringe bestehen fast nur aus Eisbrocken und Staub.', 'Er hat die geringste Dichte aller Planeten – er würde in einer riesigen Badewanne schwimmen!']
                },
                { 
                    name: 'Uranus', 
                    radius: 10.0 * SCENE_SCALE, 
                    distance: 1620 * SCENE_SCALE, 
                    yearDays: 30687, 
                    texture: textureBasePath + '2k_uranus.jpg', 
                    axialTilt: 97.77, rotationSpeed: 1.38,
                    ecc: 0.046, 
                    perihelionAngle: 170.96 * degToRad, 
                    orbitalInclination: 0.77,
                    //Fakten
                    name_de: 'Uranus', earthCompareRadius: '4,0x Erde', radius_km: '25.362', distance_Mio_km: '2,87 Mrd. km', umlaufzeit: '84 Jahre', taglaenge: '17h 14min', temperatur: 'ca. -197°C',
                    funFacts: ['Uranus "rollt" auf seiner Bahn, da seine Achse um fast 98 Grad geneigt ist.', 'Er ist ein Eisriese und erscheint durch Methan in seiner Atmosphäre blau-grün.']
                },
                { 
                    name: 'Neptune', 
                    radius: 9.8 * SCENE_SCALE, 
                    distance: 1980 * SCENE_SCALE, 
                    yearDays: 60190, 
                    texture: textureBasePath + '2k_neptune.jpg', 
                    axialTilt: 28.32, 
                    rotationSpeed: 1.49,
                    ecc: 0.009, 
                    perihelionAngle: 44.97 * degToRad, 
                    orbitalInclination: 1.77,
                    //Fakten
                    name_de: 'Neptun', earthCompareRadius: '3,9x Erde', radius_km: '24.622', distance_Mio_km: '4,50 Mrd. km', umlaufzeit: '165 Jahre', taglaenge: '16h 6min', temperatur: 'ca. -201°C',
                    funFacts: ['Auf Neptun wehen die schnellsten Winde im Sonnensystem (bis zu 2.100 km/h).', 'Er wurde 1846 durch mathematische Berechnungen entdeckt, bevor man ihn im Teleskop sah.']
                },
                {
                    name: 'Pluto', 
                    radius: 0.19 * SCENE_SCALE, 
                    distance: 2340 * SCENE_SCALE, 
                    yearDays: 90582, texture: textureBasePath + '2k_pluto.jpg', 
                    axialTilt: 122.5, 
                    rotationSpeed: -0.156,
                    ecc: 0.244, 
                    perihelionAngle: 224.07 * degToRad, 
                    orbitalInclination: 17.16, 
                    //Fakten
                    name_de: 'Pluto (Zwergplanet)', earthCompareRadius: '0,19x Erde', radius_km: '1.188', distance_Mio_km: '5,9 Mrd. km (im Schnitt)', umlaufzeit: '248 Jahre', taglaenge: '6,4 Tage', temperatur: 'ca. -229°C',
                    funFacts: ['Pluto wurde 2006 vom Planeten zum "Zwergplaneten" umklassifiziert.', 'Seine Bahn ist so elliptisch, dass er zeitweise näher an der Sonne ist als Neptun.']
                }
            ];
        }

        function easeInOutCubic(t) {
            // Helper für sanftes Beschleunigen und Abbremsen
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function createSolarSystem() {
            const textureLoader = new THREE.TextureLoader();

            const starGeometry = new THREE.SphereGeometry(4000, 32, 32); 
            const starTexture = textureLoader.load('https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/8k_stars.jpg');
            const starMaterial = new THREE.MeshBasicMaterial({ map: starTexture, side: THREE.BackSide });
            starField = new THREE.Mesh(starGeometry, starMaterial);
            scene.add(starField);

	        const sunTexture = textureLoader.load('https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/2k_sun.jpg');
            const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
	        sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 32), sunMaterial);
            
            const sunLight = new THREE.PointLight(0xffffff, 1.5, 0, 2);
            sun.add(sunLight);

            sun.userData.info = {
                name: 'Sonne', earthCompareRadius: '109x Erde', radius_km: '696.340', oberflaeche_temp: 'ca. 5.500 °C', zusammensetzung: 'Wasserstoff, Helium',
                funFacts: ['Die Sonne macht 99,86% der gesamten Masse unseres Sonnensystems aus.', 'Sie ist ein Stern vom Typ "Gelber Zwerg" und etwa 4,6 Milliarden Jahre alt.']
            };
            clickableObjects.push(sun); 
            scene.add(sun);
            
            earthTiltPivot = new THREE.Group();
            earthTiltPivot.position.set(EARTH_DISTANCE, 0, 0);
            scene.add(earthTiltPivot);
            earthTiltPivot.rotation.z = EARTH_TILT_RAD;

            const earthMaterial = new THREE.ShaderMaterial({
                vertexShader: earthVertexShader, fragmentShader: earthFragmentShader,
                uniforms: {
                    dayTexture: { value: textureLoader.load('https://stemkoski.github.io/Three.js/images/earth-day.jpg') },
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uObjectWorldPosition: { value: new THREE.Vector3() }, uNightBrightness: { value: 0.3 }, 
                    uSofiDemoActive: { value: false }, uMoonPosition: { value: new THREE.Vector3() }, uMoonRadius: { value: MOON_RADIUS }, uSunRadius: { value: SUN_RADIUS } 
                }
            });
            earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 32, 32), earthMaterial);
            
            earth.userData.info = {
                name: 'Erde', earthCompareRadius: '1x Erde', radius_km: '6.371', distance_Mio_km: '149,6 Mio. km', umlaufzeit: '365,25 Tage', taglaenge: '23h 56min', temperatur: 'ca. +15°C',
                funFacts: [ 'Die Erde ist der einzige bekannte Planet mit flüssigem Wasser an der Oberfläche.', 'Unsere Atmosphäre schützt uns vor schädlicher Sonnenstrahlung und Meteoriten.']
            };
            clickableObjects.push(earth); 
            earthTiltPivot.add(earth); 

            moonPivot = new THREE.Group();
            moonPivot.rotation.x = MOON_TILT_RAD; 
            scene.add(moonPivot); 

            originalMoonMaterial = new THREE.ShaderMaterial({
                vertexShader: moonVertexShader, fragmentShader: moonFragmentShader,
                uniforms: {
                    dayTexture: { value: textureLoader.load('https://cdn.jsdelivr.net/gh/NisuSchnisuu/Simulation-Mondphasen@main/2k_moon.jpg') },
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uEarthPosition: { value: new THREE.Vector3() }, uObjectWorldPosition: { value: new THREE.Vector3() },
                    uEarthRadius: { value: EARTH_RADIUS }, uSunRadius: { value: SUN_RADIUS }, uMoonRadius: { value: MOON_RADIUS }, uNightBrightness: { value: 0.3 },
                    uDemoActive: { value: false }, uShadowBrightness: { value: 0.0 }, uRedOverlayIntensity: { value: 0.0 } 
                }
            });
            moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 32, 32), originalMoonMaterial);
            moon.position.x = -MOON_DISTANCE; 
            
            moon.userData.info = {
                name: 'Mond', earthCompareRadius: '0,27x Erde', radius_km: '1.737', distance_Mio_km: '384.400 km', umlaufzeit: '27,3 Tage', temperatur: '-173°C bis +127°C', parentName: 'Erde',
                funFacts: [ 'Der Mond zeigt uns immer dieselbe Seite, weil er sich genau einmal pro Umlauf um sich selbst dreht.', 'Seine Anziehungskraft verursacht Ebbe und Flut auf der Erde.']
            };
            clickableObjects.push(moon); 
            moonPivot.add(moon);
            
            planetsData.forEach(data => {
                const sunOrbitPivot = new THREE.Group();
                if (data.orbitalInclination) sunOrbitPivot.rotation.x = (data.orbitalInclination * Math.PI) / 180;
                scene.add(sunOrbitPivot);
                
                const planetSystemContainer = new THREE.Group();
                sunOrbitPivot.add(planetSystemContainer);

                const planetTiltPivot = new THREE.Group();
                planetTiltPivot.rotation.z = (data.axialTilt * Math.PI) / 180;
                planetSystemContainer.add(planetTiltPivot);

                let material;
                if (data.name === 'Saturn') {
                     material = new THREE.ShaderMaterial({
                        vertexShader: earthVertexShader, fragmentShader: saturnFragmentShader, 
                        uniforms: {
                            dayTexture: { value: textureLoader.load(data.texture) }, uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uObjectWorldPosition: { value: new THREE.Vector3() },
                            uNightBrightness: { value: 0.3 }, 
                            uRingNormal: { value: new THREE.Vector3(0, 1, 0) }, 
                            uRingInnerRadius: { value: data.radius * RING_INNER_RADIUS_SCALE },
                            uRingOuterRadius: { value: data.radius * RING_OUTER_RADIUS_SCALE },
                            uRingShadowSoftness: { value: RING_SHADOW_SOFTNESS }
                        }
                    });
                    saturnPlanetMaterial = material;
                } else {
                    material = new THREE.ShaderMaterial({
                        vertexShader: earthVertexShader, fragmentShader: earthFragmentShader, 
                        uniforms: {
                            dayTexture: { value: textureLoader.load(data.texture) }, uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uObjectWorldPosition: { value: new THREE.Vector3() },
                            uNightBrightness: { value: 0.3 }, uSofiDemoActive: { value: false }, uMoonPosition: { value: new THREE.Vector3() }, uMoonRadius: { value: 0.1 }, uSunRadius: { value: SUN_RADIUS } 
                        }
                    });
                }

                const planet = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 32, 32), material);
                planet.position.set(0, 0, 0); 

                planet.userData.info = { ...data }; 
                delete planet.userData.info.name; delete planet.userData.info.radius; delete planet.userData.info.distance; delete planet.userData.info.yearDays; delete planet.userData.info.texture; delete planet.userData.info.ringTexture; delete planet.userData.info.axialTilt; delete planet.userData.info.orbitalInclination; delete planet.userData.info.rotationSpeed; delete planet.userData.info.moons; delete planet.userData.info.ecc; delete planet.userData.info.perihelionAngle;
                planet.userData.info.name = data.name_de;
                clickableObjects.push(planet);

                if (data.name === 'Saturn') {
                    const ringTexture = textureLoader.load(data.ringTexture);
                    ringTexture.wrapT = THREE.RepeatWrapping;
                    saturnRingMaterial = new THREE.ShaderMaterial({
                        vertexShader: ringVertexShader, fragmentShader: ringFragmentShader, 
                        uniforms: {
                            ringTexture: { value: ringTexture }, uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uSaturnPosition: { value: new THREE.Vector3() },
                            uSaturnRadius: { value: data.radius }, uNightBrightness: { value: 0.3 }
                        },
                        transparent: true, side: THREE.DoubleSide
                    });
                    const ringGeometry = new THREE.RingGeometry(data.radius * RING_INNER_RADIUS_SCALE, data.radius * RING_OUTER_RADIUS_SCALE, 64);
                    ringGeometry.rotateX(Math.PI / 2); 
                    const pos = ringGeometry.attributes.position; const uv = ringGeometry.attributes.uv; const innerRadius = data.radius * RING_INNER_RADIUS_SCALE; const outerRadius = data.radius * RING_OUTER_RADIUS_SCALE; const repeatFactor = 10; 
                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i); const z = pos.getZ(i);
                        let angle = 1.0 - ((Math.atan2(z, x) / (Math.PI * 2)) + 0.5);
                        let v = angle * repeatFactor; const r = Math.sqrt(x * x + z * z);
                        let u = (r - innerRadius) / (outerRadius - innerRadius);
                        uv.setXY(i, u, v);
                    }
                    const ringMesh = new THREE.Mesh(ringGeometry, saturnRingMaterial);
                    planetTiltPivot.add(ringMesh); 
                }
                planetTiltPivot.add(planet); 

                if (data.moons) {
                    data.moons.forEach(moonData => {
                        const moonOrbitPivot = new THREE.Group();
                        if (data.name === 'Saturn' || data.name === 'Jupiter') {
                            moonOrbitPivot.rotation.x = moonData.inclination || 0; 
                            planetTiltPivot.add(moonOrbitPivot);
                        } else {
                            moonOrbitPivot.rotation.x = (Math.random() * 10 - 5) * Math.PI / 180;
                            planetSystemContainer.add(moonOrbitPivot);
                        }
                        const moonMat = new THREE.ShaderMaterial({
                            vertexShader: earthVertexShader, fragmentShader: genericMoonFragmentShader, 
                            uniforms: {
                                dayTexture: { value: textureLoader.load(moonData.texture) }, uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uObjectWorldPosition: { value: new THREE.Vector3() },
                                uNightBrightness: { value: 0.3 }, uParentPosition: { value: new THREE.Vector3() }, uParentRadius: { value: data.radius }
                            }
                        });
                        const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(moonData.radius, 32, 32), moonMat);
                        moonMesh.position.x = moonData.distance;
                        moonOrbitPivot.add(moonMesh);
                        otherMoons.push({ mesh: moonMesh, pivot: moonOrbitPivot, speed: moonData.speed, data: moonData, parentPlanet: planet });
                        
                        const moonInfo = { ...moonData };
                        delete moonInfo.name; delete moonInfo.radius; delete moonInfo.distance; delete moonInfo.speed; delete moonInfo.texture; delete moonInfo.inclination;
                        moonMesh.userData.info = { name: `${data.name_de}-Mond: ${moonData.name}`, ...moonInfo };
                        
                        clickableObjects.push(moonMesh);
                    });
                }
                otherPlanets.push(planet);
                otherPlanetControls.push({ orbit: sunOrbitPivot, container: planetSystemContainer, tiltPivot: planetTiltPivot });
            });
        }

        function createOrbits() {
            const createEllipticalOrbitLine = (a, e, perihelionAngle, color, segments = 256) => {
                const points = [];
                for (let i = 0; i <= segments; i++) {
                    const nu = (i / segments) * Math.PI * 2;
                    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
                    const x_orb = r * Math.cos(nu);
                    const z_orb = r * Math.sin(nu); 
                    const x_final = x_orb * Math.cos(perihelionAngle) - z_orb * Math.sin(perihelionAngle);
                    const z_final = x_orb * Math.sin(perihelionAngle) + z_orb * Math.cos(perihelionAngle);
                    points.push(new THREE.Vector3(x_final, 0, -z_final)); 
                }
                return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: color }));
            };

            const createCircleOrbit = (radius, color, segments = 128) => {
                 const points = [];
                 for (let i = 0; i <= segments; i++) {
                     const angle = (i / segments) * Math.PI * 2;
                     points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
                 }
                 return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: color }));
            };

            earthOrbitLine = createCircleOrbit(EARTH_DISTANCE, 0x0000FF); 
            scene.add(earthOrbitLine);

            moonOrbitLine = createCircleOrbit(MOON_DISTANCE, 0xFFFF00);
            moonOrbitLine.rotation.x = MOON_TILT_RAD; 
            scene.add(moonOrbitLine); 
            
            planetsData.forEach(data => {
                const orbitLine = createEllipticalOrbitLine(data.distance, data.ecc, data.perihelionAngle, 0x555555);
                if (data.orbitalInclination) orbitLine.rotation.x = (data.orbitalInclination * Math.PI) / 180;
                scene.add(orbitLine);
                otherPlanetOrbits.push(orbitLine);
            });
        }

        function setupUI() {
             const uiContainer = document.getElementById('ui-container');
            const toggleBtn = document.getElementById('toggle-ui');
            toggleBtn.addEventListener('click', () => {
                uiContainer.classList.toggle('minimized');
                toggleBtn.textContent = uiContainer.classList.contains('minimized') ? '☰' : '✕';
                toggleBtn.title = uiContainer.classList.contains('minimized') ? 'Menü anzeigen' : 'Menü verbergen';
            });
            
            orbitCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                earthOrbitLine.visible = isChecked;
                moonOrbitLine.visible = isChecked;
            });
            earthOrbitLine.visible = orbitCheckbox.checked;
            moonOrbitLine.visible = orbitCheckbox.checked;

            planetsVisibleCheckbox.addEventListener('change', (e) => {
                const isVisible = e.target.checked;
                otherPlanetControls.forEach(ctrl => { ctrl.orbit.visible = isVisible; });
                planetFocusContainer.style.display = isVisible ? 'flex' : 'none';
            });
            planetsOrbitCheckbox.addEventListener('change', (e) => {
                const isVisible = e.target.checked;
                otherPlanetOrbits.forEach(orbit => { orbit.visible = isVisible; });
            });
            const planetsInitiallyVisible = planetsVisibleCheckbox.checked;
            otherPlanetControls.forEach(ctrl => { ctrl.orbit.visible = planetsInitiallyVisible; });
            const orbitsInitiallyVisible = planetsOrbitCheckbox.checked;
            otherPlanetOrbits.forEach(orbit => { orbit.visible = orbitsInitiallyVisible; });
            planetFocusContainer.style.display = planetsInitiallyVisible ? 'flex' : 'none';
            
            darknessSlider.addEventListener('input', (e) => {
                const brightness = parseFloat(e.target.value);
                earth.material.uniforms.uNightBrightness.value = brightness;
                originalMoonMaterial.uniforms.uNightBrightness.value = brightness;
                otherPlanets.forEach(planet => { planet.material.uniforms.uNightBrightness.value = brightness; });
                otherMoons.forEach(moonObj => { moonObj.mesh.material.uniforms.uNightBrightness.value = brightness; });
                if (saturnRingMaterial) saturnRingMaterial.uniforms.uNightBrightness.value = brightness;
                darknessLabel.textContent = brightness.toFixed(2);
            });
            
            speedSlider.addEventListener('input', onSpeedSliderChange);
            onSpeedSliderChange(); 
            playPauseBtn.addEventListener('click', togglePlay);
            
            const daySlider = document.getElementById('day-slider');
            daySlider.addEventListener('input', () => {
                pauseSimulation();
                currentDay = parseFloat(daySlider.value);
                updatePositions(currentDay);
                updateUI();
            });
            
            const initialBrightness = parseFloat(darknessSlider.value);
            earth.material.uniforms.uNightBrightness.value = initialBrightness;
            originalMoonMaterial.uniforms.uNightBrightness.value = initialBrightness;
            otherPlanets.forEach(planet => { planet.material.uniforms.uNightBrightness.value = initialBrightness; });
            otherMoons.forEach(moonObj => { moonObj.mesh.material.uniforms.uNightBrightness.value = initialBrightness; });
            if (saturnRingMaterial) saturnRingMaterial.uniforms.uNightBrightness.value = initialBrightness;
            darknessLabel.textContent = initialBrightness.toFixed(2);

            document.getElementById('focus-system').addEventListener('click', () => setFocus(sun));
            document.getElementById('focus-earth').addEventListener('click', () => {
                if (isRealScaleActive) {
                    let earthPos = new THREE.Vector3();
                    earth.getWorldPosition(earthPos); 
                    const offsetDir = earthPos.clone().normalize(); 
                    offsetDir.y = 0.2; 
                    offsetDir.normalize();
                    const endPos = earthPos.clone().add(offsetDir.multiplyScalar(EARTH_RADIUS * 10)); 
                    flyTo(endPos, earthPos, 1.5, earth);
                } else {
                    setFocus(earth);
                }
            });
            document.getElementById('focus-moon').addEventListener('click', () => {
                if (isRealScaleActive) {
                    let moonPos = new THREE.Vector3();
                    moon.getWorldPosition(moonPos);
                    const sunToMoonDir = moonPos.clone().normalize();
                    sunToMoonDir.y = 0.1;
                    sunToMoonDir.normalize();
                    const endPos = moonPos.clone().add(sunToMoonDir.multiplyScalar(MOON_RADIUS * 5)); 
                     flyTo(endPos, moonPos, 2.0, moon); 
                } else {
                    setFocus(moon);
                }
            });

            document.getElementById('focus-ecliptic').addEventListener('click', () => {
                cameraFocus = 'ecliptic_side_view'; 
                let earthPos = new THREE.Vector3();
                earth.getWorldPosition(earthPos);
                const target = new THREE.Vector3(0, 0, 0); 
                let offset = earthPos.clone().normalize().multiplyScalar(40);
                let sideOffset = new THREE.Vector3(-earthPos.z, 0, earthPos.x).normalize().multiplyScalar(4); 
                const endPos = earthPos.clone().add(offset).add(sideOffset);
                endPos.y = 0; 
                flyTo(endPos, target, 2.0, 'ecliptic_side_view'); 
            });

            document.getElementById('demo-sofi').addEventListener('click', () => startDemo('sofi'));
            document.getElementById('demo-mofi').addEventListener('click', () => startDemo('mofi'));
            endDemoBtn.addEventListener('click', endDemo);
            document.getElementById('real-scale-btn').addEventListener('click', toggleRealScale);
            document.getElementById('real-dist-btn').addEventListener('click', toggleRealDistance); 
            demoSpeedSlider.addEventListener('input', onDemoSpeedSliderChange);
            onDemoSpeedSliderChange();

            document.querySelectorAll('#moon-phases-ui button').forEach(btn => {
                const index = parseInt(btn.dataset.phaseIndex);
                btn.addEventListener('click', () => jumpToPhase(index));
                moonPhaseButtons.push(btn);
            });

            followCometBtn.addEventListener('click', () => {
                if (comet && comet.mesh) {
                    setFocus(comet.mesh, 1.5);
                }
            });

            document.getElementById('comet-speed-checkbox').addEventListener('change', (e) => {
                cometTimeScale = e.target.checked ? 3.0 : 1.0;
            });
            
            planetsData.forEach((data, index) => {
                const btn = document.createElement('button');
                btn.id = `focus-${data.name.toLowerCase()}`;
                btn.className = 'btn btn-planet'; 
                let btnName = data.name_de;
                
                if (data.name === 'Pluto') {
                    btnName = '(Pluto)';
                } else if (btnName.includes('(')) {
                    btnName = btnName.split('(')[0].trim(); 
                }

                btn.textContent = btnName;
                btn.addEventListener('click', () => setFocus(otherPlanets[index]));
                planetFocusContainer.appendChild(btn);
            });
            
            document.getElementById('popup-close-btn').addEventListener('click', () => {
                document.getElementById('info-popup').style.display = 'none';
            });
            infoToastButton.addEventListener('click', () => {
                if (currentSelectedInfo) {
                    showInfoPopup(currentSelectedInfo);
                    infoToastButton.style.display = 'none'; 
                    currentSelectedInfo = null; 
                }
            });

            // --- UFO Dialog Listener ---
            document.getElementById('ufo-yes-btn').addEventListener('click', () => {
                document.getElementById('ufo-dialog-text').textContent = "Perfekt. Danke für die Hilfe. Wir sehen uns dann bald wieder. Ciao!";
                document.getElementById('ufo-initial-buttons').style.display = 'none';
                const closeGroup = document.getElementById('ufo-close-group');
                closeGroup.style.display = 'flex';
                
                const closeBtn = document.getElementById('ufo-close-btn');
                closeBtn.onclick = () => {
                     document.getElementById('ufo-dialog').style.display = 'none';
                     ufoState = 'leaving';
                     ufoDepartureTarget = earth; 
                     cameraFocus = 'ufo_to_earth'; 
                     if (!isPlaying) togglePlay();
                };
            });

            document.getElementById('ufo-no-btn').addEventListener('click', () => {
                document.getElementById('ufo-dialog-text').textContent = "Schade. Dann suchen wir weiter. Gute Reise, Erdling.";
                document.getElementById('ufo-initial-buttons').style.display = 'none';
                const closeGroup = document.getElementById('ufo-close-group');
                closeGroup.style.display = 'flex';

                const closeBtn = document.getElementById('ufo-close-btn');
                closeBtn.onclick = () => {
                     document.getElementById('ufo-dialog').style.display = 'none';
                     ufoState = 'leaving';
                     ufoDepartureTarget = null; 
                     ufoLeaveTimer = 0; 
                     ufoTargetPos.set(
                        (Math.random() - 0.5) * 20000,
                        (Math.random() - 0.5) * 20000,
                        (Math.random() - 0.5) * 20000
                     );
                     cameraFocus = ufo; 
                     if (!isPlaying) togglePlay();
                };
            });
            // --------------------------------
        }

        // --- Komet Funktionen ---
        function spawnComet() {
            if (comet) {
                comet.destroy(); 
            }
            comet = new Comet(scene);
            cometSpawnTimer = THREE.MathUtils.randFloat(600, 1200); 
            
            if (cometControls) cometControls.style.display = 'block';
            if (followCometBtn) followCometBtn.style.display = 'block';

            document.getElementById('comet-speed-checkbox').checked = false;
            cometTimeScale = 1.0;

            if (!isPlaying) togglePlay();
        }
        // -----------------------------


        // --- UFO Funktionen ---
        function createUFO() {
            const ufoGroup = new THREE.Group();
            const saucerGeo = new THREE.CylinderGeometry(0.5 * SCENE_SCALE, 1.5 * SCENE_SCALE, 0.3 * SCENE_SCALE, 16);
            const saucerMat = new THREE.MeshStandardMaterial({ color: 0x888888, emissive: 0x444444, metalness: 0.8, roughness: 0.2 });
            const saucer = new THREE.Mesh(saucerGeo, saucerMat);
            ufoGroup.add(saucer);
            const cockpitGeo = new THREE.SphereGeometry(0.6 * SCENE_SCALE, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
            const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00aaaa, metalness: 0.5, roughness: 0.1, transparent: true, opacity: 0.8 });
            const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
            cockpit.position.y = 0.15 * SCENE_SCALE; 
            ufoGroup.add(cockpit);

            ufo = ufoGroup;
            ufo.userData.isUFO = true; 
            clickableObjects.push(ufo);
            scene.add(ufo);
        }

        function spawnUFO() {
            if (!ufo) createUFO();
            ufoDepartureTarget = null; 
            const startAngle = Math.random() * Math.PI * 2;
            const startDist = 1500 * SCENE_SCALE;
            ufo.position.set(
                Math.cos(startAngle) * startDist,
                (Math.random() - 0.5) * 300 * SCENE_SCALE,
                Math.sin(startAngle) * startDist
            );
            ufoState = 'approaching_planet';
            pickNextPlanetTarget();
            ufo.visible = true;
        }

        function pickNextPlanetTarget() {
            const potentialTargets = clickableObjects.filter(obj => obj !== ufo && !obj.userData.isUFO && obj !== ufoCurrentTargetObject);
            if (potentialTargets.length > 0) {
                const randomIndex = Math.floor(Math.random() * potentialTargets.length);
                ufoCurrentTargetObject = potentialTargets[randomIndex];
            } else {
                 ufoCurrentTargetObject = sun;
            }
        }

        function updateUFO(deltaTime) {
            if (ufoState === 'inactive') {
                ufoSpawnTimer -= deltaTime;
                if (ufoSpawnTimer <= 0) {
                    spawnUFO();
                    ufoSpawnTimer = Math.random() * 300 + 180; 
                }
                return;
            }

            if (ufoCurrentTargetObject && (ufoState === 'approaching_planet' || ufoState === 'hovering')) {
                let targetRadius = 5.0 * SCENE_SCALE;
                if (ufoCurrentTargetObject.geometry && ufoCurrentTargetObject.geometry.parameters.radius) {
                    targetRadius = ufoCurrentTargetObject.geometry.parameters.radius;
                }
                const planetWorldPos = new THREE.Vector3();
                ufoCurrentTargetObject.getWorldPosition(planetWorldPos);
                const sunSideDir = planetWorldPos.clone().normalize().negate(); 
                sunSideDir.y += 0.5; 
                sunSideDir.normalize();
                const offsetDistance = targetRadius * 2.5 + 6 * SCENE_SCALE; 
                ufoCurrentTargetObject.getWorldPosition(ufoTargetPos).add(sunSideDir.multiplyScalar(offsetDistance));
            }

            if (ufoState === 'approaching_planet' || ufoState === 'leaving') {
                if (ufoState === 'leaving' && ufoDepartureTarget) {
                     ufoDepartureTarget.getWorldPosition(ufoTargetPos);
                     if (ufo.position.distanceTo(ufoTargetPos) < EARTH_RADIUS * 5) { 
                          ufo.visible = false;
                          ufoState = 'inactive';
                          setFocus(earth); 
                          resetUfoDialog();
                          return;
                     }
                }

                const direction = new THREE.Vector3().subVectors(ufoTargetPos, ufo.position);
                const distance = direction.length();
                let arrivalThreshold = 2.0 * SCENE_SCALE; 
                let currentSpeed = UFO_SPEED;

                if (ufoState === 'leaving') {
                    if (ufoDepartureTarget) {
                        currentSpeed = UFO_SPEED * 0.8;
                    } else {
                        ufoLeaveTimer += deltaTime;
                        arrivalThreshold = 10.0 * SCENE_SCALE;
                        if (ufoLeaveTimer < 3.0) {
                             currentSpeed = UFO_SPEED * 0.5; 
                             cameraFocus = ufo; 
                        } else {
                             currentSpeed = UFO_SPEED * 10.0; 
                             cameraFocus = 'ufo_leaving_watch'; 
                        }
                        if (ufo.position.length() > 3000 * SCENE_SCALE || distance < arrivalThreshold) { 
                              ufo.visible = false;
                              ufoState = 'inactive';
                              setFocus(sun, 3.0); 
                              resetUfoDialog();
                              return;
                        }
                    }
                }

                if (distance > arrivalThreshold) {
                     direction.normalize();
                     ufo.position.add(direction.multiplyScalar(currentSpeed * deltaTime));
                     ufo.lookAt(ufoTargetPos); 
                } else {
                    if (ufoState === 'approaching_planet') {
                        ufoState = 'hovering';
                        ufoWanderTimer = Math.random() * 20 + 20; 
                    } else if (ufoState === 'leaving' && !ufoDepartureTarget) {
                          ufo.visible = false;
                          ufoState = 'inactive';
                          if (cameraFocus === ufo || cameraFocus === 'ufo_leaving_watch') setFocus(sun, 3.0); 
                          resetUfoDialog();
                    }
                }
            } else if (ufoState === 'hovering') {
                 ufo.position.copy(ufoTargetPos);
                 ufoWanderTimer -= deltaTime;
                 ufo.rotation.y += deltaTime * 1.0; 
                 if (ufoWanderTimer <= 0) {
                    ufoState = 'approaching_planet';
                    pickNextPlanetTarget();
                }
            }
        }

        function resetUfoDialog() {
            document.getElementById('ufo-dialog-text').textContent = "Wir sind auf dem Weg zur Erde um diese zu übernehmen. Weißt du wo die ist?";
            document.getElementById('ufo-initial-buttons').style.display = 'flex';
            document.getElementById('ufo-close-group').style.display = 'none';
        }
        // ---------------------------
        
        function flyTo(endPos, endTarget, duration = 1.0, newFocusTarget = null, callback = null) {
            isUserControllingCamera = false;
            cameraTransitionCallback = callback; 
            if (duration <= 0) {
                camera.position.copy(endPos);
                controls.target.copy(endTarget);
                lastCameraTargetPos.copy(endTarget);
                isCameraTransitioning = false;
                cameraFocus = newFocusTarget;
                if (cameraTransitionCallback) {
                    cameraTransitionCallback();
                    cameraTransitionCallback = null;
                }
                return; 
            }
            isCameraTransitioning = true;
            cameraTransitionProgress = 0.0;
            cameraTransitionDuration = duration;
            cameraTransitionStartPos.copy(camera.position);
            cameraTransitionStartTarget.copy(controls.target);
            cameraTransitionEndPos.copy(endPos);
            cameraTransitionEndTarget.copy(endTarget);
            cameraFocusAfterTransition = newFocusTarget; 
            cameraFocus = 'transitioning'; 
        }
        
        function togglePlay() {
            isPlaying = !isPlaying;
            playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
            if (isPlaying) {
                playPauseBtn.classList.add('playing');
            } else {
                playPauseBtn.classList.remove('playing');
            }
            controls.enableZoom = true;
        }

        function pauseSimulation() {
            if (isPlaying) {
                togglePlay();
            }
        }
        
        function onSpeedSliderChange() {
            const value = parseFloat(speedSlider.value); 
            const minSpeed = 0.00000005; 
            const normalSpeed = 1.0; 
            const fastSpeed = 10.0;
            const maxSpeed = 100.0; 
            
            if (value <= 80) {
                const normalizedValue = (value / 80.0);
                speed = minSpeed + (Math.pow(normalizedValue, 4)) * (normalSpeed - minSpeed);
            } else if (value <= 90) {
                const normalizedValue = (value - 80) / 10;
                speed = normalSpeed + normalizedValue * (fastSpeed - normalSpeed);
            } else {
                const normalizedValue = (value - 90) / 10;
                speed = fastSpeed + normalizedValue * (maxSpeed - fastSpeed);
            }
        }
        
        function onDemoSpeedSliderChange() {
            const value = parseFloat(demoSpeedSlider.value); 
            const minSpeed = 0.01; const normalSpeed = 0.1; const maxSpeed = 1.0;
            if (value <= 50) {
                demoLoopSpeed = minSpeed + (value / 50) * (normalSpeed - minSpeed);
            } else {
                demoLoopSpeed = normalSpeed + ((value - 50) / 50) * (maxSpeed - normalSpeed);
            }
            demoSpeedLabel.textContent = demoLoopSpeed.toFixed(2) + 'x';
        }

        function setFocus(targetObj, duration = 2.0) { 
            if (targetObj === sun) {
                cameraFocus = sun; 
                const homePos = new THREE.Vector3(-600, 450, 600); 
                const homeTarget = new THREE.Vector3(0, 0, 0); 
                document.getElementById('moon-focus-container').style.display = 'none';
                if (duration === 0) { 
                    camera.position.copy(homePos);
                    controls.target.copy(homeTarget);
                    lastCameraTargetPos.copy(homeTarget);
                    isCameraTransitioning = false; 
                    cameraFocus = sun; 
                } else {
                    flyTo(homePos, homeTarget, duration, sun); 
                }
                controls.enableZoom = true;
                return; 
            }
            cameraFocus = targetObj; 
            const moonContainer = document.getElementById('moon-focus-container');
            moonContainer.style.display = 'none';
            moonContainer.innerHTML = ''; 
            let activePlanetIndex = -1;
            if (targetObj === otherPlanets[3]) activePlanetIndex = 3;
            else if (targetObj === otherPlanets[4]) activePlanetIndex = 4;
            else {
                const moonEntry = otherMoons.find(m => m.mesh === targetObj);
                if (moonEntry) {
                     if (moonEntry.parentPlanet === otherPlanets[3]) activePlanetIndex = 3;
                     if (moonEntry.parentPlanet === otherPlanets[4]) activePlanetIndex = 4;
                }
            }
            if (activePlanetIndex !== -1) {
                moonContainer.style.display = 'flex';
                const planetData = planetsData[activePlanetIndex];
                const parentPlanetMesh = otherPlanets[activePlanetIndex];
                if (planetData.moons) {
                    planetData.moons.forEach(moonData => {
                        const moonEntry = otherMoons.find(m => m.data.name === moonData.name && m.parentPlanet === parentPlanetMesh);
                        if (moonEntry) {
                            const btn = document.createElement('button');
                            btn.className = 'btn btn-moon';
                            btn.textContent = moonData.name;
                            btn.addEventListener('click', () => setFocus(moonEntry.mesh));
                            moonContainer.appendChild(btn);
                        }
                    });
                }
            }
            
            let zoomFactor;
            const radius = targetObj.geometry ? targetObj.geometry.parameters.radius : (targetObj.radius ? targetObj.radius : 1.0); 
            if (targetObj === moon) zoomFactor = 10.0;
            else if (targetObj === sun) zoomFactor = 0.2;
            else if (targetObj === otherPlanets[3]) zoomFactor = 1.5; 
            else if (targetObj === otherPlanets[4]) zoomFactor = 2.0; 
            else if (targetObj === earth) zoomFactor = 4.2; 
            else if (targetObj.userData.info.name.includes('Komet')) zoomFactor = 6.0; 
            else zoomFactor = (EARTH_RADIUS / radius) * 2.5; 

            const targetPos = new THREE.Vector3();
            targetObj.getWorldPosition(targetPos);
            const endTarget = targetPos.clone();
            const offsetDir = new THREE.Vector3(0, 0, 0).sub(targetPos).normalize();
            offsetDir.y = 0.5; 
            offsetDir.normalize(); 
            const offset = offsetDir.multiplyScalar(EARTH_DISTANCE / zoomFactor);
            const endPos = targetPos.clone().add(offset);

            if (duration === 0) { 
                camera.position.copy(endPos);
                controls.target.copy(endTarget);
                lastCameraTargetPos.copy(endTarget);
                isCameraTransitioning = false; 
                cameraFocus = targetObj; 
            } else {
                flyTo(endPos, endTarget, duration, targetObj); 
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
            earthTiltPivot.rotation.z = EARTH_TILT_RAD;
            earth.rotation.x = 0; 
            moonPivot.rotation.x = MOON_TILT_RAD; 
            earth.material.uniforms.uSofiDemoActive.value = false;
            if (moon.material.uniforms) {
                originalMoonMaterial.uniforms.uDemoActive.value = false; 
                originalMoonMaterial.uniforms.uShadowBrightness.value = 0.0;
                originalMoonMaterial.uniforms.uRedOverlayIntensity.value = 0.0;
            }
        }
        
        function startDemo(type) {
            pauseSimulation(); 
            resetToRealMode(); 
            isDemoActive = true;
            demoType = type;
            isPlaying = true; 
            playPauseBtn.textContent = 'Pause';
            playPauseBtn.classList.add('playing'); 
            controls.enableZoom = true; 
            demoButtons.style.display = 'none'; 
            demoControlButtons.style.display = 'flex'; 
            demoSpeedControl.style.display = 'block'; 
            
            if (type === 'sofi') {
                earthTiltPivot.rotation.z = EARTH_TILT_RAD;
                demoDurationDays = 2; 
                currentDay = LUNAR_MONTH_DAYS * 0.0 - (demoDurationDays / 2); 
                demoLoopStartDay = currentDay;
                demoLoopEndDay = LUNAR_MONTH_DAYS * 0.0 + (demoDurationDays / 2); 
                earth.material.uniforms.uSofiDemoActive.value = true;
                earthDemoRotationOffset = 3.7 * Math.PI / 4; 
                moon.position.y = 0.3; 
            } else if (type === 'mofi') {
                earthTiltPivot.rotation.z = EARTH_TILT_RAD;
                demoDurationDays = 17.5 - 14.3; 
                currentDay = 14.3; 
                demoLoopStartDay = currentDay;
                demoLoopEndDay = 17.5; 
                moonPivot.position.y = MOON_RADIUS * 1.0; 
                originalMoonMaterial.uniforms.uDemoActive.value = true;
            }
            
            updatePositions(currentDay); 
            const daySlider = document.getElementById('day-slider');
            daySlider.value = currentDay;
            updateUI();

            if (type === 'sofi') {
                const earthPos = new THREE.Vector3();
                earth.getWorldPosition(earthPos);
                const sunPos = new THREE.Vector3(0,0,0); 
                const target = earthPos.clone();
                const direction = sunPos.clone().sub(earthPos).normalize();
                const endPos = earthPos.clone().add(direction.multiplyScalar(EARTH_RADIUS * 5)); 
                flyTo(endPos, target, 3.0, earth); 
            } else if (type === 'mofi') {
                const moonPos = new THREE.Vector3();
                moon.getWorldPosition(moonPos);
                const sunPos = new THREE.Vector3(0,0,0); 
                const target = moonPos.clone();
                const direction = sunPos.clone().sub(moonPos).normalize();
                const endPos = moonPos.clone().add(direction.multiplyScalar(MOON_RADIUS * 12)); 
                flyTo(endPos, target, 3.0, moon); 
            }
        }

        function endDemo() {
            resetToRealMode();
            currentDay = 0; 
            const daySlider = document.getElementById('day-slider');
            daySlider.value = currentDay;
            moonPivot.position.y = 0; 
            earthDemoRotationOffset = 0.0; 
            moon.position.y = 0; 
            updatePositions(currentDay);
            updateUI();
        }

        // --- NEU: Sequenzieller Realitätscheck ---
        function toggleRealScale() {
            pauseSimulation();
            
            if (isRealScaleActive) {
                deactivateRealScale();
                return;
            }

            activateRealScaleSequence();
        }

        function activateRealScaleSequence() {
            isRealScaleActive = true;
            realityCheckPhase = 'positioning'; 

            const scaleBtn = document.getElementById('real-scale-btn');
            scaleBtn.textContent = 'Beenden (Zurück zur Simulation)';
            scaleBtn.classList.remove('btn-secondary');
            scaleBtn.classList.add('btn-danger'); // Rot für "Beenden"
            
            document.getElementById('real-dist-btn').style.display = 'block';
            
            infoBox.textContent = "MAẞSTAB: Kamera fliegt zur Position für Grössenvergleich...";

            // UI aufräumen & Bahnen verstecken
            setRealScaleUiVisibility(false);
            earthOrbitLine.visible = false;
            moonOrbitLine.visible = false;
            otherPlanetOrbits.forEach(o => o.visible = false);

            // --- NEUE REFERENZ-OBJEKTE ---
            // 1. Geister-Sonne für Grössenvergleich (wächst mit)
            const ghostGeo = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
            const ghostMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.3 });
            sunGhost = new THREE.Mesh(ghostGeo, ghostMat);
            scene.add(sunGhost);

            // 2. Referenz-Linie (Roter Faden) mit Ticks
            const lineMat = new THREE.LineBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.8, linewidth: 2 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
            referenceLine = new THREE.Line(lineGeo, lineMat);
            referenceLine.visible = false; 
            scene.add(referenceLine);

            // Ticks für den Faden
            const tickGeo = new THREE.BufferGeometry();
            const tickCount = 20;
            const positions = new Float32Array(tickCount * 3);
            tickGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const tickMat = new THREE.PointsMaterial({ color: 0xffaaaa, size: 4 * SCENE_SCALE, sizeAttenuation: false, transparent: true, opacity: 0.9 });
            referenceTicks = new THREE.Points(tickGeo, tickMat);
            referenceTicks.visible = false;
            scene.add(referenceTicks);
            // --- ENDE ---

            // Originalwerte sichern
            sun.userData.originalScale = sun.scale.clone();
            moon.userData.originalScale = moon.scale.clone();
            earthTiltPivot.userData.originalPosition = earthTiltPivot.position.clone();
            camera.userData.originalFar = camera.far;

            // Kamera-Sichtweite erhöhen
            camera.far = 5000000; 
            camera.updateProjectionMatrix();

            targetSunScale = 1.0; 
            targetEarthDistance = COMPARE_EARTH_DIST_VALUE;
            
            earthTiltPivot.position.set(targetEarthDistance, 0, 0);
            currentEarthDistance = targetEarthDistance;

            let earthPos = new THREE.Vector3(targetEarthDistance, 0, 0);
            let sunToEarth = earthPos.clone().normalize();
            let camTargetPos = earthPos.clone().add(sunToEarth.multiplyScalar(50)); 
            camTargetPos.y += 10;
            let camTargetTarget = new THREE.Vector3(0,0,0);

            flyTo(camTargetPos, camTargetTarget, 1.5, null, () => {
                realityCheckPhase = 'growing';
                targetSunScale = REAL_SUN_SCALE_FACTOR;
                infoBox.textContent = "MAẞSTAB: Sonne wächst auf reale Grösse...";
            });
        }

        function deactivateRealScale() {
            isRealScaleActive = false;
            isRealDistanceActive = false;
            realityCheckPhase = 'idle';

            const scaleBtn = document.getElementById('real-scale-btn');
            scaleBtn.textContent = '🔍 Reale Grössen';
            scaleBtn.classList.remove('btn-danger');
            scaleBtn.classList.add('btn-secondary');
            scaleBtn.style.order = 1; // Reset order

            document.getElementById('real-dist-btn').style.display = 'none';
            const distBtn = document.getElementById('real-dist-btn');
            distBtn.textContent = "🚀 Reale Distanz";
            distBtn.classList.remove('btn-warning');
            distBtn.classList.add('btn-secondary');
            distBtn.style.order = 2; // Reset order

            // --- Referenz-Objekte entfernen ---
            if (sunGhost) { scene.remove(sunGhost); sunGhost.geometry.dispose(); sunGhost.material.dispose(); sunGhost = null; }
            if (referenceLine) { scene.remove(referenceLine); referenceLine.geometry.dispose(); referenceLine.material.dispose(); referenceLine = null; }
            if (referenceTicks) { scene.remove(referenceTicks); referenceTicks.geometry.dispose(); referenceTicks.material.dispose(); referenceTicks = null; }
            // --- ENDE ---

            setRealScaleUiVisibility(true);
            
            // Bahnen wiederherstellen basierend auf Checkboxen
            earthOrbitLine.visible = orbitCheckbox.checked;
            moonOrbitLine.visible = orbitCheckbox.checked;
            otherPlanetOrbits.forEach(o => o.visible = planetsOrbitCheckbox.checked);

            earthTiltPivot.visible = true;
            if (sun.userData.originalScale) sun.scale.copy(sun.userData.originalScale);
            currentSunScale = 1.0;
            currentEarthDistance = EARTH_DISTANCE;
            currentMoonDistance = MOON_DISTANCE;

            setTimeout(() => {
                if (!isRealScaleActive) {
                     camera.far = 8000; 
                     camera.updateProjectionMatrix();
                }
            }, 500);

            updatePositions(currentDay);
            setFocus(sun, 1.5);
            updateUI();
            if (!isPlaying) togglePlay();
        }

        function setRealScaleUiVisibility(visible) {
            const displayStyle = visible ? '' : 'none';
            const flexStyle = visible ? 'flex' : 'none';

            document.getElementById('focus-ecliptic').style.display = displayStyle;
            document.getElementById('planet-focus-buttons').style.display = visible && planetsVisibleCheckbox.checked ? 'flex' : 'none';
            document.getElementById('orbit-checkbox').parentElement.style.display = flexStyle;
            document.getElementById('planets-visible-checkbox').parentElement.parentElement.style.display = flexStyle; 
            document.getElementById('demo-buttons').style.display = flexStyle;
            document.getElementById('moon-phases-group').style.display = displayStyle;
            document.getElementById('play-group').style.display = flexStyle;
            document.getElementById('time-controls').style.display = displayStyle;
            
            if (cometControls.style.display !== 'none' && !visible) {
                 cometControls.dataset.wasVisible = 'true';
                 cometControls.style.display = 'none';
            } else if (visible && cometControls.dataset.wasVisible === 'true') {
                 cometControls.style.display = 'block';
            }
        }

        function toggleRealDistance() {
            isRealDistanceActive = !isRealDistanceActive;
            const distBtn = document.getElementById('real-dist-btn');
            const scaleBtn = document.getElementById('real-scale-btn');
            
            flightStartState.progress = 0;
            flightStartState.duration = 5.0; // Etwas länger für den weiten Weg
            flightStartState.startDist = currentEarthDistance;
            flightStartState.startMoonDist = currentMoonDistance; 

            if (isRealDistanceActive) {
                targetEarthDistance = REAL_EARTH_DIST_VALUE;
                targetMoonDistance = REAL_MOON_DIST_VALUE;
                infoBox.textContent = "DISTANZ: Flug in die reale Leere...";
                realityCheckPhase = 'flying_out';
                controls.enabled = false;
                
                // Knopf anpassen: Gelb, Sonne-Emoji, Wichtig -> Oben
                distBtn.textContent = "☀️ Zurück zur Sonne";
                distBtn.classList.remove('btn-secondary');
                distBtn.classList.add('btn-warning');
                distBtn.style.order = 1; // Nach oben
                scaleBtn.style.order = 2; // Nach unten

                // Roter Faden sichtbar machen
                if (referenceLine) {
                     referenceLine.visible = true;
                     referenceLine.material.opacity = 0.8;
                }
                if (referenceTicks) {
                    referenceTicks.visible = true;
                    referenceTicks.material.opacity = 0.9;
                }
                referenceFadeTimer = 0;

            } else {
                targetEarthDistance = COMPARE_EARTH_DIST_VALUE;
                targetMoonDistance = MOON_DISTANCE;
                infoBox.textContent = "DISTANZ: Rückflug zur Aufstellung...";
                realityCheckPhase = 'flying_in';
                controls.enabled = false;
                
                // Knopf zurücksetzen
                distBtn.textContent = "🚀 Reale Distanz";
                distBtn.classList.remove('btn-warning');
                distBtn.classList.add('btn-secondary');
                distBtn.style.order = 2; // Wieder nach unten
                scaleBtn.style.order = 1; // Wieder nach oben

                // Faden sofort ausblenden beim Rückflug
                if (referenceLine) referenceLine.visible = false;
                if (referenceTicks) referenceTicks.visible = false;
            }
        }

        function jumpToPhase(index) {
            pauseSimulation(); 
            resetToRealMode(); 
            earthDemoRotationOffset = 0.0; 
            moonPivot.position.y = 0; 
            moon.position.y = 0;
            currentDay = PHASE_DAY_MAP[index];
            moonPhaseButtons.forEach(btn => { btn.classList.remove('active'); });
            const clickedButton = moonPhaseButtons.find(btn => parseInt(btn.dataset.phaseIndex) === index);
            if (clickedButton) clickedButton.classList.add('active');
            updatePositions(currentDay);
            const daySlider = document.getElementById('day-slider');
            daySlider.value = currentDay;
            updateUI();
            let earthPos = new THREE.Vector3();
            let moonPos = new THREE.Vector3();
            earth.getWorldPosition(earthPos);
            moon.getWorldPosition(moonPos);
            flyTo(earthPos, moonPos, 0, 'earthView'); 
        }

        function animate() {
            requestAnimationFrame(animate);
            const deltaTime = clock.getDelta(); 
            
            if (isRealScaleActive) {
                if (realityCheckPhase === 'growing') {
                    const growthSpeed = 0.4; 
                    currentSunScale += growthSpeed * deltaTime;
                    
                    if (currentSunScale >= targetSunScale) {
                        currentSunScale = targetSunScale;
                        realityCheckPhase = 'active';
                        infoBox.textContent = "MAẞSTAB: Reale Grösse erreicht.";

                        // ALT (sofort ausblenden):
                        // if (sunGhost) sunGhost.visible = false;

                        // NEU (mit 2 Sekunden Verzögerung):
                        if (sunGhost) {
                            setTimeout(() => {
                                // Wir prüfen nochmal, ob sunGhost noch existiert,
                                // falls der Modus vorher beendet wurde.
                                if (sunGhost) { 
                                    sunGhost.visible = false;
                                }
                            }, 2000); // 2000ms = 2 Sekunden
                        }
                    }
                    sun.scale.set(currentSunScale, currentSunScale, currentSunScale);
                    if (sunGhost) sunGhost.scale.set(currentSunScale, currentSunScale, currentSunScale);

                    // Automatischer Kamera-Zoom während des Wachstums, damit Sonne sichtbar bleibt
                    const fovFactor = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
                    // Benötigte Distanz, um die ganze Sonne zu sehen (plus 10% Margin)
                    const requiredCamDist = (SUN_RADIUS * currentSunScale * 1.4) / fovFactor;
                    
                    // Wir bewegen die Kamera entlang des Vektors von der Sonne zur aktuellen Kameraposition
                    const sunToCam = camera.position.clone().normalize();
                    // Wir nehmen mindestens die aktuelle Distanz oder die benötigte, je nachdem was größer ist
                    const currentDist = camera.position.length();
                    const newDist = Math.max(currentDist, requiredCamDist);
                    camera.position.copy(sunToCam.multiplyScalar(newDist));
                }
                else if (realityCheckPhase === 'flying_out') {
                    const earthOrbitAngle = (currentDay / EARTH_YEAR_DAYS) * Math.PI * 2;
                    flightStartState.progress += deltaTime / flightStartState.duration;
                    const easing = easeInOutCubic(Math.min(1.0, flightStartState.progress)); 
                    currentEarthDistance = THREE.MathUtils.lerp(flightStartState.startDist, targetEarthDistance, easing);
                    
                    if (flightStartState.progress >= 1.0) {
                        currentEarthDistance = targetEarthDistance; 
                        realityCheckPhase = 'active_distant';
                        infoBox.textContent = "ANGEKOMMEN! Distanz: ca. 150 Mio. km";
                        controls.enabled = true;
                        cameraFocus = earth; 
                        let earthPos = new THREE.Vector3(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);
                        controls.target.copy(earthPos);
                    } else {
                         // Während des Fluges nah an der Erde bleiben
                         let earthPos = new THREE.Vector3(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);
                         const offsetDir = earthPos.clone().normalize();
                         offsetDir.y = 0.2; offsetDir.normalize();
                         const camPos = earthPos.clone().add(offsetDir.multiplyScalar(EARTH_RADIUS * 20)); 
                         camera.position.copy(camPos);
                         controls.target.copy(earthPos); 
                    }
                    currentMoonDistance = THREE.MathUtils.lerp(flightStartState.startMoonDist, targetMoonDistance, easing);
                }
                else if (realityCheckPhase === 'active_distant') {
                    // Roter Faden nach 3 Sekunden ausblenden
                    if (referenceLine && referenceLine.visible) {
                        referenceFadeTimer += deltaTime;
                        if (referenceFadeTimer > 3.0) {
                            const fadeDuration = 1.0;
                            const opacity = Math.max(0, 0.8 * (1.0 - (referenceFadeTimer - 3.0) / fadeDuration));
                            referenceLine.material.opacity = opacity;
                            referenceTicks.material.opacity = opacity;
                            if (opacity <= 0) {
                                referenceLine.visible = false;
                                referenceTicks.visible = false;
                            }
                        }
                    }
                }
                else if (realityCheckPhase === 'flying_in') {
                    const earthOrbitAngle = (currentDay / EARTH_YEAR_DAYS) * Math.PI * 2;
                    flightStartState.progress += deltaTime / flightStartState.duration;
                    const easing = easeInOutCubic(Math.min(1.0, flightStartState.progress)); 
                    currentEarthDistance = THREE.MathUtils.lerp(flightStartState.startDist, targetEarthDistance, easing);

                    if (flightStartState.progress >= 1.0) {
                        currentEarthDistance = targetEarthDistance;
                        realityCheckPhase = 'active';
                        infoBox.textContent = "Wieder beim Grössenvergleich.";
                        let earthPos = new THREE.Vector3(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);
                        // Kamera zurücksetzen, weit genug weg für die grosse Sonne
                        const fovFactor = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
                        // 1. Berechne den Fortschritt des Wachstums (von 0.0 bis 1.0)
                        const growthProgress = (currentSunScale - 1.0) / (targetSunScale - 1.0);

                        // 2. Definiere den Start- und End-Puffer
                        const startBuffer = 20.0; // Starte mit 200% Puffer (Faktor 3.0)
                        const endBuffer = 1.1;   // Ende mit 10% Puffer (Faktor 1.1)

                        // 3. Berechne den aktuellen Puffer basierend auf dem Fortschritt
                        const currentBuffer = THREE.MathUtils.lerp(startBuffer, endBuffer, Math.min(growthProgress, 1.0));

                        // 4. Nutze den neuen, dynamischen Puffer für die Distanzberechnung
                        const requiredCamDist = (SUN_RADIUS * currentSunScale * currentBuffer) / fovFactor;
                        // --- ENDE NEU ---
                        
                        // Position relativ zur Erde, aber weit weg
                        const camEndPos = earthPos.clone().normalize().multiplyScalar(requiredCamDist);
                        camEndPos.y += 50; // Etwas Höhe
                        
                        flyTo(camEndPos, new THREE.Vector3(0,0,0), 1.5, null, () => { controls.enabled = true; });
                    } else {
                         let earthPos = new THREE.Vector3(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);
                         const offsetDir = earthPos.clone().normalize();
                         offsetDir.y = 0.2; offsetDir.normalize();
                         const camPos = earthPos.clone().add(offsetDir.multiplyScalar(EARTH_RADIUS * 20)); 
                         camera.position.copy(camPos);
                         controls.target.copy(earthPos);
                    }
                    currentMoonDistance = THREE.MathUtils.lerp(flightStartState.startMoonDist, targetMoonDistance, easing);
                }
            }

            if (comet) {
                if (comet.update(deltaTime)) {
                    comet = null;
                }
            } else {
                cometSpawnTimer -= deltaTime;
                if (cometSpawnTimer <= 0) {
                    spawnComet();
                }
            }
            
            updateUFO(deltaTime);

            if (isCameraTransitioning) {
                cameraTransitionProgress += deltaTime / cameraTransitionDuration;
                const t = cameraTransitionProgress < 0.5 ? 4 * cameraTransitionProgress * cameraTransitionProgress * cameraTransitionProgress : 1 - Math.pow(-2 * cameraTransitionProgress + 2, 3) / 2;
                if (cameraTransitionProgress >= 1.0) {
                    isCameraTransitioning = false;
                    camera.position.copy(cameraTransitionEndPos);
                    controls.target.copy(cameraTransitionEndTarget);
                    cameraFocus = cameraFocusAfterTransition; 
                    lastCameraTargetPos.copy(controls.target);
                    if (cameraTransitionCallback) {
                        cameraTransitionCallback();
                        cameraTransitionCallback = null;
                    }
                } else {
                    camera.position.lerpVectors(cameraTransitionStartPos, cameraTransitionEndPos, t);
                    controls.target.lerpVectors(cameraTransitionStartTarget, cameraTransitionEndTarget, t);
                }
            }
            let actualSpeed = speed;
            if (isDemoActive) actualSpeed = demoLoopSpeed;
            if (isPlaying) {
                const deltaDays = (actualSpeed * (1 / 60)) * (isDemoActive ? 1 : EARTH_YEAR_DAYS / 60); 
                currentDay += deltaDays;
                if (isDemoActive) {
                    if (currentDay > demoLoopEndDay) currentDay = demoLoopStartDay; 
                    else if (currentDay < demoLoopStartDay) currentDay = demoLoopEndDay;
                }
                const daySlider = document.getElementById('day-slider');
                daySlider.value = currentDay % EARTH_YEAR_DAYS;
                updateUI();
            }
            updatePositions(currentDay);
            updateCamera(false); 
            controls.update();
            renderer.render(scene, camera);
        }

        function calculateEllipticalPosition(a, e, perihelionAngle, days, yearDays) {
            const M = (days / yearDays) * Math.PI * 2;
            let nu = M + 2 * e * Math.sin(M) + 1.25 * e * e * Math.sin(2 * M);
            const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
            const x_orb = r * Math.cos(nu);
            const z_orb = r * Math.sin(nu);
            const x_final = x_orb * Math.cos(perihelionAngle) - z_orb * Math.sin(perihelionAngle);
            const z_final = x_orb * Math.sin(perihelionAngle) + z_orb * Math.cos(perihelionAngle);
            return { x: x_final, z: -z_final }; 
        }

        function updatePositions(day) {
            const earthOrbitAngle = (day / EARTH_YEAR_DAYS) * Math.PI * 2;
            earthTiltPivot.position.set(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);

            let rotationFactor = 1.0;
            if (isDemoActive && demoType === 'sofi') rotationFactor = 0.1; 
            earth.rotation.y = (day * rotationFactor) * Math.PI * 2; 
            earth.rotation.y += earthDemoRotationOffset; 

            let moonOrbitAngle;
            if (isDemoActive) moonOrbitAngle = (day / LUNAR_MONTH_DAYS) * Math.PI * 2;
            else moonOrbitAngle = ((day - PHASE_OFFSET_DAYS) / LUNAR_MONTH_DAYS) * Math.PI * 2;
            
            let earthWorldPos = new THREE.Vector3();
            earth.getWorldPosition(earthWorldPos);
            
            moonPivot.position.copy(earthWorldPos);
            moonPivot.rotation.y = moonOrbitAngle; 
            moonOrbitLine.position.copy(earthWorldPos);
            moon.rotation.y = 0;
            moon.position.x = -currentMoonDistance; 

            otherPlanetControls.forEach((ctrl, index) => {
                const data = planetsData[index];
                const planet = otherPlanets[index];
                const pos = calculateEllipticalPosition(data.distance, data.ecc, data.perihelionAngle, day, data.yearDays);
                ctrl.container.position.set(pos.x, 0, pos.z);
                planet.rotation.y = (day * data.rotationSpeed) * Math.PI * 2;
                let tempVec = new THREE.Vector3();
                planet.getWorldPosition(tempVec);
                planet.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
                
                if (data.name === 'Saturn') {
                     if (saturnRingMaterial) saturnRingMaterial.uniforms.uSaturnPosition.value.copy(tempVec);
                     
                     if (saturnPlanetMaterial) {
                        const ringNormalWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(ctrl.tiltPivot.getWorldQuaternion(new THREE.Quaternion()));
                        saturnPlanetMaterial.uniforms.uRingNormal.value.copy(ringNormalWorld);
                     }
                }
            });

            let tempParentPos = new THREE.Vector3();
            otherMoons.forEach(moonObj => {
                const startAngle = moonObj.data.startAngle || 0; 
                moonObj.pivot.rotation.y = (day * moonObj.speed) * Math.PI * 2 + startAngle; 

                let tempVec = new THREE.Vector3();
                moonObj.mesh.getWorldPosition(tempVec);
                moonObj.mesh.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
                moonObj.parentPlanet.getWorldPosition(tempParentPos);
                moonObj.mesh.material.uniforms.uParentPosition.value.copy(tempParentPos);
            });

            let tempVec = new THREE.Vector3();
            earth.getWorldPosition(tempVec);
            earth.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
            let moonWorldPosition = new THREE.Vector3();
            moon.getWorldPosition(moonWorldPosition);
            earth.material.uniforms.uMoonPosition.value.copy(moonWorldPosition);

            if (isDemoActive && demoType === 'mofi') {
                const animProgress = (currentDay - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);
                const dayToProgress = (d) => (d - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);
                const peakDay = 15.7; const peakProgress = dayToProgress(peakDay); 
                const redFadeInStart = peakProgress - 0.05; const redFadeOutStart = dayToProgress(16.4); const redFadeOutEnd = dayToProgress(16.5);   
                const shadowFadeInStart = peakProgress - 0.05; const shadowFadeInEnd = peakProgress;         
                const shadowFadeOutStart = dayToProgress(16.2); const shadowFadeOutEnd = dayToProgress(16.5);
                const shadowTargetBrightness = 0.6; 
                let redIntensity = 0.0; let shadowBrightness = 0.0; 
                if (animProgress <= peakProgress) {
                    const fadeProgress = Math.max(0.0, (animProgress - redFadeInStart) / (peakProgress - redFadeInStart));
                    redIntensity = (fadeProgress * fadeProgress); 
                } else if (animProgress > peakProgress && animProgress <= redFadeOutEnd) {
                    const fadeProgress = (animProgress - peakProgress) / (redFadeOutEnd - peakProgress);
                    redIntensity = 1.0 - (fadeProgress * fadeProgress); 
                }
                if (animProgress > shadowFadeInStart && animProgress <= shadowFadeInEnd) {
                    const fadeProgress = (animProgress - shadowFadeInStart) / (shadowFadeInEnd - shadowFadeInStart);
                    shadowBrightness = fadeProgress * shadowTargetBrightness;
                } else if (animProgress > shadowFadeInEnd && animProgress <= shadowFadeOutStart) {
                     shadowBrightness = shadowTargetBrightness;
                } else if (animProgress > shadowFadeOutStart && animProgress <= shadowFadeOutEnd) {
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

            // --- NEU: Referenz-Linie & Ticks aktualisieren ---
            if (isRealScaleActive && referenceLine && referenceLine.visible) {
                const earthPos = earthTiltPivot.position;
                // Linie
                const positions = referenceLine.geometry.attributes.position;
                positions.setXYZ(1, earthPos.x, earthPos.y, earthPos.z);
                positions.needsUpdate = true;

                // Ticks entlang der Linie verteilen
                const tickPosAttr = referenceTicks.geometry.attributes.position;
                const tickCount = tickPosAttr.count;
                for (let i = 0; i < tickCount; i++) {
                    const t = (i + 1) / (tickCount + 1); // 0 = Sonne, 1 = Erde. Ticks dazwischen.
                    tickPosAttr.setXYZ(i, earthPos.x * t, earthPos.y * t, earthPos.z * t);
                }
                tickPosAttr.needsUpdate = true;
            }
        }

        function updateCamera(isJump = false) {
            if (isCameraTransitioning || isJump) return;
            
            if (isRealScaleActive) {
                if (realityCheckPhase === 'active' || realityCheckPhase === 'active_distant') {
                    lastCameraTargetPos.copy(controls.target);
                }
                return; 
            }

            let targetObject;

            if (typeof cameraFocus === 'string') {
                if (cameraFocus === 'earthView') {
                    if (isUserControllingCamera) {
                        cameraFocus = moon; 
                        moon.getWorldPosition(lastCameraTargetPos);
                        return; 
                    } else {
                        let earthPos = new THREE.Vector3();
                        let moonPos = new THREE.Vector3();
                        earth.getWorldPosition(earthPos);
                        moon.getWorldPosition(moonPos);
                        camera.position.copy(earthPos); 
                        controls.target.copy(moonPos);
                        lastCameraTargetPos.copy(moonPos);
                        return; 
                    }
                }
                if (cameraFocus === 'ufo_to_earth') {
                    let ufoPos = new THREE.Vector3();
                    let earthPos = new THREE.Vector3();
                    ufo.getWorldPosition(ufoPos);
                    earth.getWorldPosition(earthPos);
                    controls.target.copy(earthPos); 
                    const behindDir = new THREE.Vector3().subVectors(ufoPos, earthPos).normalize();
                    const camPos = ufoPos.clone().add(behindDir.multiplyScalar(30 * SCENE_SCALE));
                    camPos.y += 15 * SCENE_SCALE; 
                    camera.position.lerp(camPos, 0.05); 
                    return;
                }
                if (cameraFocus === 'ufo_leaving_watch') {
                    ufo.getWorldPosition(controls.target);
                    return;
                }
                if (cameraFocus === 'ecliptic_side_view') {
                    let earthPos = new THREE.Vector3();
                    earth.getWorldPosition(earthPos);
                    let offset = earthPos.clone().normalize().multiplyScalar(40);
                    let sideOffset = new THREE.Vector3(-earthPos.z, 0, earthPos.x).normalize().multiplyScalar(4); 
                    const endPos = earthPos.clone().add(offset).add(sideOffset);
                    endPos.y = 0; 
                    camera.position.copy(endPos);
                    controls.target.set(0, 0, 0);
                    lastCameraTargetPos.copy(controls.target);
                    return;
                }
                if (cameraFocus === 'transitioning') return;
                setFocus(sun, 0); 
                return;
            }
            
            targetObject = cameraFocus; 
            if (!targetObject) { targetObject = sun; cameraFocus = sun; }
            
            let currentTargetPos = new THREE.Vector3();
            targetObject.getWorldPosition(currentTargetPos);
            
            if (isPlaying || isDemoActive) {
                const delta = currentTargetPos.clone().sub(lastCameraTargetPos);
                camera.position.add(delta);
                controls.target.add(delta);
            }
            lastCameraTargetPos.copy(currentTargetPos);
        }
        
        function updateUI() {
            let sunPos = new THREE.Vector3();
            let earthPos = new THREE.Vector3();
            let moonPos = new THREE.Vector3();
            sun.getWorldPosition(sunPos);
            earth.getWorldPosition(earthPos);
            moon.getWorldPosition(moonPos);
            const vecEarthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos);
            const vecEarthToSun = new THREE.Vector3().subVectors(sunPos, earthPos); 
            let angle = Math.atan2(vecEarthToSun.z, vecEarthToSun.x) - Math.atan2(vecEarthToMoon.z, vecEarthToMoon.x);
            angle = (angle + Math.PI * 2) % (Math.PI * 2);
            let phaseIndex = Math.floor(normalizedAngle = angle / (Math.PI * 2) * 8 + 0.5) % 8;
            const phaseNames = ["Neumond", "Zun. Sichel", "Zun. Halbmond", "Zun. Drittel", "Vollmond", "Abn. Drittel", "Abn. Halbmond", "Abn. Sichel"];
            let phaseName = phaseNames[phaseIndex];
            
            let infoText = `Mondphase: ${phaseName}`;
            
            if (isDemoActive) {
                if (demoType === 'sofi') infoText = "SONNENFINSTERNIS (Demo)";
                else if (demoType === 'mofi') infoText = "MONDFINSTERNIS (Demo)";
            } else {
                let moonWorldY = moon.getWorldPosition(new THREE.Vector3()).y;
                let earthWorldY = earth.getWorldPosition(new THREE.Vector3()).y; 
                let yDiff = Math.abs(moonWorldY - earthWorldY);
                const ECLIPSE_TOLERANCE = (MOON_RADIUS + EARTH_RADIUS) / 3; 
                if (phaseIndex === 0 && yDiff < ECLIPSE_TOLERANCE) infoText += " (Mögliche SoFi)";
                if (phaseIndex === 4 && yDiff < ECLIPSE_TOLERANCE) infoText += " (Mögliche MoFi)";
            }
            
            if (comet && comet.mesh) {
                 const speedKmh = Math.round(comet.velocity.length() * 25000);
                 comet.mesh.userData.info.velocity = `ca. ${speedKmh.toLocaleString('de-DE')} km/h`;
                 
                 infoText += ` | Komet: ${speedKmh.toLocaleString('de-DE')} km/h`;
            }
            
            if (realityCheckPhase === 'flying_out' || realityCheckPhase === 'flying_in') {
                 const kmPerUnit = 149600000 / REAL_EARTH_DIST_VALUE;
                 const currentKm = Math.round(currentEarthDistance * kmPerUnit);
                 infoText = `Distanz zur Sonne: ${currentKm.toLocaleString('de-DE')} km`;
            }

            infoBox.textContent = infoText;
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onTouchStart(event) {
            if (event.touches.length === 1) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                isDragging = false; 
            }
        }
        function onTouchMove(event) {
            if (isDragging || event.touches.length !== 1) return; 
            const deltaX = Math.abs(event.touches[0].clientX - touchStartX);
            const deltaY = Math.abs(event.touches[0].clientY - touchStartY);
            if (deltaX > dragThreshold || deltaY > dragThreshold) isDragging = true;
        }
        function onTouchEnd(event) {
            const targetElement = event.target;
            if (isDragging) { isDragging = false; return; }
            const touch = event.changedTouches[0];
            if (!touch) return; 
            const popupOpened = handleInteraction(touch.clientX, touch.clientY, targetElement);
            if (popupOpened) event.preventDefault();
        }
        function onMouseClick(event) {
            handleInteraction(event.clientX, event.clientY, event.target);
        }
        function handleInteraction(x, y, targetElement) {
            const uiContainer = document.getElementById('ui-container');
            const popup = document.getElementById('info-popup');
            const ufoDialog = document.getElementById('ufo-dialog');
            if (uiContainer.contains(targetElement) || popup.contains(targetElement) || ufoDialog.contains(targetElement) || infoToastButton.contains(targetElement)) return false; 
            
            mouse.x = (x / window.innerWidth) * 2 - 1;
            mouse.y = -(y / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(clickableObjects, true); 

            if (intersects.length > 0) {
                let clickedObject = intersects[0].object;
                while (clickedObject.parent && !clickableObjects.includes(clickedObject)) {
                    clickedObject = clickedObject.parent;
                }

                if (clickedObject.userData.isUFO && ufoState === 'hovering') { 
                    ufoState = 'interacted';
                    document.getElementById('ufo-dialog').style.display = 'block';
                    if (isPlaying) pauseSimulation();
                    return true;
                }

                if (clickedObject.userData.info) {
                    currentSelectedInfo = clickedObject.userData.info;
                    infoToastButton.textContent = `💡 Info: ${currentSelectedInfo.name}`;
                    infoToastButton.style.display = 'block';
                    return true; 
                }
            } else {
                infoToastButton.style.display = 'none';
                currentSelectedInfo = null;
            }
            return false; 
        }
        function showInfoPopup(info) {
            const popup = document.getElementById('info-popup');
            const titleEl = document.getElementById('popup-title');
            const detailsEl = document.getElementById('popup-details');
            titleEl.textContent = info.name;
            
            if (info.type === 'comet') {
                let detailsHTML = '';
                if (info.radius_km) detailsHTML += `<p><strong>Größe:</strong> <span>${info.radius_km}</span></p>`;
                if (info.velocity) detailsHTML += `<p><strong>Geschwindigkeit:</strong> <span id="popup-velocity">${info.velocity}</span></p>`;

                if (info.funFacts && info.funFacts.length > 0) {
                    info.funFacts.forEach((fact, index) => {
                        const style = (index === 0) ? 'margin-top: 15px; padding-top: 10px; border-top: 1px dashed #444;' : '';
                        detailsHTML += `<p class="fun-fact" style="${style}">${fact}</p>`;
                    });
                }
                detailsEl.innerHTML = detailsHTML;
                popup.style.display = 'flex';
                return;
            }

            const factMap = {
                earthCompareRadius: 'Größe',
                radius_km: 'Radius', 
                distance_Mio_km: 'Abstand zur Sonne', 
                umlaufzeit: 'Umlaufzeit (Sonne)', 
                taglaenge: 'Tageslänge',
                temperatur: 'Durchschnittstemp.', 
                oberflaeche_temp: 'Oberflächentemp.',
                zusammensetzung: 'Zusammensetzung'
            };

            if (info.name === 'Sonne') {
                 factMap['earthCompareRadius'] = 'Größe (Vergleich)';
            } else if (info.name.includes('Mond')) { 
                 factMap['distance_Mio_km'] = `Abstand zu/r ${info.parentName}`; 
                 factMap['umlaufzeit'] = `Umlaufzeit (${info.parentName})`; 
            }

            let detailsHTML = ``;
            
            const orderedKeys = ['earthCompareRadius', 'radius_km', 'distance_Mio_km', 'umlaufzeit', 'taglaenge', 'temperatur', 'oberflaeche_temp', 'zusammensetzung'];
            
            orderedKeys.forEach(key => {
                if (info.name === 'Sonne' && key === 'umlaufzeit') return;

                if (info[key] && factMap[key]) {
                    detailsHTML += `<p><strong>${factMap[key]}:</strong> <span>${info[key]}</span></p>`;
                }
            });

            if (info.funFacts && info.funFacts.length > 0) {
                info.funFacts.forEach((fact, index) => {
                    const style = (index === 0) ? 'margin-top: 15px; padding-top: 10px; border-top: 1px dashed #444;' : '';
                    detailsHTML += `<p class="fun-fact" style="${style}">${fact}</p>`;
                });
            }
            detailsEl.innerHTML = detailsHTML;
            popup.style.display = 'flex';
        }

        init();
    </script>
</body>
</html>
