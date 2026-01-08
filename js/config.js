// ===========================================
// GLOBALE KONFIGURATION & VARIABLEN
// ===========================================

// --- Globale Szenen-Variablen ---
let scene, camera, renderer, controls;
let sun, earth, moon, moonPivot;
let earthTiltPivot;

// Liste für alle "Nacht-Lichter"
let nightTimeLights = [];

// Hilfsfunktion: Fügt ein lokales Licht zum Objekt hinzu
// (Muss global verfügbar sein, da es von verschiedenen Modulen genutzt wird)
function addFillLight(object3D, intensity, distance, positionOffset = null, minBrightness = 0.0) {
    const light = new THREE.PointLight(0xffffff, intensity, distance);
    if (positionOffset) {
        light.position.copy(positionOffset);
    } else {
        light.position.set(0, 2.0, 1.0); 
    }
    light.castShadow = false; 
    object3D.add(light);
    light.userData.baseIntensity = intensity;   
    light.userData.minBrightness = minBrightness; 
    nightTimeLights.push(light);
}

// --- Linien & Hilfsobjekte ---
let earthAxisLine = null;
let earthEquatorLine = null;
let earthOrbitLine, moonOrbitLine;
let starField;

// --- Planeten & Monde ---
let otherPlanets = [];
let otherPlanetControls = []; 
let otherPlanetOrbits = [];
let otherMoons = []; 
let planetsData = [];
let jupiterMoonShadowUniforms = null;
let jupiterMoons = [];
let moonSurfaceObjects = [];

// --- Raketen Konfiguration ---
const ROCKET_FLIGHT_DURATION_SECONDS = 40.0;
const ROCKET_SIZE_SCALE = 1.0; 
const ROCKET_PROBABILITY = 0.2; 
const LIFTOFF_DURATION_SECONDS = 9.0; 
const LIFTOFF_HEIGHT = 0.4; 

let rocketInstance = null; 
let rocketSpawnAllowed = false; 

// Template Variablen
let rocketFullTemplate = null;      
let rocketStage2Template = null;    
let debris1Template = null;         
let debris2Template = null;         
let capsuleModelTemplate = null;    

// --- Loading Manager & 3D Modelle ---
let loadingManager;
let loaded3DModels = []; 
let humanObjectsCheckbox;  
let cometModelTemplate = null;
let cometRockTexture;
let ufoModelTemplate = null;
let astronautTemplate = null;
let landerTemplate = null;
let flagTemplate = null
let asteroidInstancedMesh = null;

// --- Ecliptic Plane ---
let earthEclipticPlane, moonEclipticPlane;
let eclipticPlaneCheckbox;
let planetRingMaterials = []; 

// --- Simulations-Status ---
let isPlaying = true;
let isRewinding = false;
let currentDay = 0;
let speed = 1.0;
let cameraFocus = 'system';
let lastCameraTargetPos = new THREE.Vector3(); // Wird in init() initialisiert, aber hier deklariert
let isDemoActive = false;
let originalMoonMaterial;
let moonPhaseButtons = [];

// --- Realitätscheck Variablen ---
let isRealScaleActive = false;
let isRealDistanceActive = false;
let realityCheckPhase = 'idle'; 
let flightStartState = { startDist: 0, startMoonDist: 0, progress: 0, duration: 10.0 };
let sunGhost = null;
let rulerGroup = null; 
let rulerFadeTimer = 0;
let distanceLabelEl = null;
let currentDayLabelEl = null;

let targetSunScale = 1.0;
let targetEarthDistance; 
let targetMoonDistance; 
let currentSunScale = 1.0;
let currentEarthDistance;
let currentMoonDistance; 

// --- Demo Variablen ---
let demoLoopStartDay = 0;
let demoLoopEndDay = 0;
let demoLoopSpeed = 0.1; 
let demoType = ''; 
let demoShadowBrightness = 0.0; 
let demoRedOverlay = 0.0; 
let earthDemoRotationOffset = 0.0;

// --- Frequenz Demo Variablen ---
let isFrequencyDemoActive = false;
let freqDemoControls;
let realRatioCheckbox;
let originalSunScale = new THREE.Vector3(1,1,1);
let originalMoonScale = new THREE.Vector3(1,1,1);
let freqDemoSunScale;   
let realRatioSunScale;  
let realRatioMoonScale; 

// --- Kamera Animation ---
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

// --- Raycasting ---
let raycaster;
let mouse;
let clickableObjects = [];
let lastTouchTime = 0;
let interactionTimeout;
let userInteractedRecently = false;

// ===========================================
// KONSTANTEN
// ===========================================
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
const PHASE_OFFSET_DAYS = 0; 

// Konstanten für reale Verhältnisse
const REAL_SUN_SCALE_FACTOR = (109 * EARTH_RADIUS) / SUN_RADIUS; 
const REAL_EARTH_DIST_VALUE = 23400 * EARTH_RADIUS; 
let COMPARE_EARTH_DIST_VALUE = 400 * SCENE_SCALE; 
const REAL_MOON_DIST_VALUE = 60 * EARTH_RADIUS; 

const RING_SHADOW_SOFTNESS = 10 * SCENE_SCALE;

const PHASE_DAY_MAP = [
    LUNAR_MONTH_DAYS * 0.0  + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.125 + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.25  + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.375 + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.5  + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.625  + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.75  + PHASE_OFFSET_DAYS, 
    LUNAR_MONTH_DAYS * 0.875  + PHASE_OFFSET_DAYS  
];

const COMET_FOCUS_DISTANCE = 20.0;

let isUserControllingCamera = false;
let currentSelectedInfo = null;
let infoToastButton;
let followCometBtn;
let cometControls; 

// --- UFO Variablen ---
let ufo;
let ufoState = 'inactive'; 
let ufoSpawnTimer = Math.random() * 180 + 120; 
let ufoEncounterCount = 0;
let ufoWanderTimer = 0;
let ufoTargetPos = new THREE.Vector3();
let ufoCurrentTargetObject = null; 
let ufoDepartureTarget = null; 
const UFO_SPEED = 100 * SCENE_SCALE; 
const UFO_SPEED_TO_EARTH = 300 * SCENE_SCALE;
let ufoLeaveTimer = 0; 

// --- Flat Earth ---
let isFlatEarth = false; 
let isFlagOnMoon = false; 
let hasMoonMissionLanded = false;
let flatAnimPhase = 'idle'; 
let flatAnimTimer = 0;

// --- Komet Variablen ---
let comet; 
let cometSpawnDay = -1; 
const COMET_PROBABILITY = 0.2; 
const COMET_MIN_DAY = 100;
const COMET_MAX_DAY = 500;
let cometSpawnTimer = 0; // Wird später initialisiert
const COMET_SPAWN_DIST = 2500 * SCENE_SCALE; 
const COMET_DESTROY_DIST = 2500 * SCENE_SCALE; 
const COMET_CAMERA_RESET_DIST = 2400 * SCENE_SCALE; 

const GRAVITY_STRENGTH = 100000 * SCENE_SCALE; 
const GRAVITY_FACTOR = 0.05; 
const MIN_PERIHELION_DISTANCE = 110 * SCENE_SCALE; 

let cometTimeScale = 1.0;

// --- Kompatibilitäts-Variablen (für Deep Space Code) ---
let blackHoleUniforms = null;
let composer = null;
let usePostProcessing = false;
