// ===========================================
// HAUPTSTEUERUNG (MAIN)
// ===========================================

function init() {
    // Loading Screen
    loadingManager = new THREE.LoadingManager();
    
    loadingManager.onLoad = () => {
        console.log('Alle Assets geladen.');
        plantFlagOnMoon();
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0'; 
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500); 
        }
    };
    
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progressBar = document.getElementById('progress-bar');
        const percent = (itemsLoaded / itemsTotal) * 100;
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = `Laden... (${Math.round(percent)}%)`;
        }
        console.log(`Lade: ${url} (${itemsLoaded}/${itemsTotal})`);
    };

    loadingManager.onError = (url) => {
        console.error('Fehler beim Laden von: ' + url);
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = `Fehler beim Laden von Assets. Bitte neu laden.`;
        }
    };

    distanceLabelEl = document.getElementById('distance-label');
    currentDayLabelEl = document.getElementById('current-day-label');

    infoToastButton = document.getElementById('info-toast-button');
    followCometBtn = document.getElementById('follow-comet-btn'); 
    cometControls = document.getElementById('comet-controls');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.set(EARTH_DISTANCE * 1.5, EARTH_DISTANCE * 0.7, EARTH_DISTANCE * 1.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true 
    });

    renderer.toneMapping = THREE.LinearToneMapping; 
    renderer.toneMappingExposure = 1.0;             

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.touches = { ONE: 0, TWO: 2 };
    controls.maxDistance = 7000;
    
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
    createSkybox(); 
    createSolarSystem();
    createAsteroidBelt();

    originalSunScale.copy(sun.scale);
    originalMoonScale.copy(moon.scale);

    const moonApparentSizeRad = 2 * Math.atan((MOON_RADIUS * originalMoonScale.x) / (2 * MOON_DISTANCE));
    const newSunRadius = Math.tan(moonApparentSizeRad / 2) * EARTH_DISTANCE;
    freqDemoSunScale = (newSunRadius / (SUN_RADIUS * originalSunScale.x)) * 2.05;

    const realAngSizeRad = (0.52 * Math.PI) / 180;
    const realRatioNewMoonRadius = Math.tan(realAngSizeRad / 2) * MOON_DISTANCE;
    realRatioMoonScale = realRatioNewMoonRadius / (MOON_RADIUS * originalMoonScale.x);
    const realRatioNewSunRadius = Math.tan(realAngSizeRad / 2) * EARTH_DISTANCE;
    realRatioSunScale = (realRatioNewSunRadius / (SUN_RADIUS * originalSunScale.x)) * 1.2;
    
    createOrbits();
    load3DModels();
    setupUI();

    if (Math.random() < COMET_PROBABILITY) {
        cometSpawnDay = THREE.MathUtils.randFloat(COMET_MIN_DAY, COMET_MAX_DAY);
        console.log(`Glück gehabt! Komet 67P wird an Tag ${cometSpawnDay.toFixed(1)} erscheinen.`);
    } else {
        console.log("Kein Komet in dieser Simulation.");
        cometSpawnDay = -1; 
    }

    const rocketControls = document.getElementById('rocket-controls');
    const launchBtn = document.getElementById('launch-rocket-btn');
    const rocketCamBtn = document.getElementById('rocket-cam-btn');
    rocketCamBtn.addEventListener('click', () => {
        if (rocketInstance) {
            rocketInstance.toggleOnboardCamera();
        }
    });
    launchBtn.addEventListener('click', () => {
        if (!rocketInstance) {
            rocketInstance = new Rocket(scene);
            rocketInstance.launch();
            
            launchBtn.disabled = true;
            launchBtn.classList.remove('btn-pulse');
            launchBtn.textContent = "Startsequenz initiiert...";
        }
    });

    const abortBtn = document.getElementById('rocket-abort-btn');
    abortBtn.addEventListener('click', () => {
        if (rocketInstance) {
            rocketInstance.abort();
            rocketInstance = null; 
        }
    });

    const dismissBtn = document.getElementById('rocket-dismiss-btn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            updateLaunchHUD(false);
            if (rocketControls) {
                rocketControls.style.display = 'none';
            }
            rocketSpawnAllowed = false;
            console.log("Raketenstart vom Nutzer abgelehnt.");
        });
    }

    const diceRoll = Math.random(); 
    console.log(`🎲 Raketen-Lotterie: Gewürfelt wurde ${diceRoll.toFixed(2)} (Benötigt: < ${ROCKET_PROBABILITY})`);

    if (diceRoll < ROCKET_PROBABILITY) {
        console.log("🎉 GLÜCK GEHABT! Ein Raketenstart ist verfügbar.");
        rocketSpawnAllowed = true;
        
        const minMinutes = 2;
        const maxMinutes = 5;
        const randomDelay = (Math.random() * (maxMinutes - minMinutes) + minMinutes) * 60 * 1000;
        
        console.log(`⏱️ Der Start-Button erscheint in ${(randomDelay / 1000 / 60).toFixed(1)} Minuten.`);

        setTimeout(() => {
            if (!isRealScaleActive) {
                if (rocketControls) rocketControls.style.display = 'block';
                updateLaunchHUD(true, "SYSTEM CHECK", "Warte auf Startfreigabe...", "⏱️", 0);
            } else {
                console.log("Rakete ist bereit, wird aber erst nach Beenden des Real-Scale-Modus angezeigt.");
            }
            console.log("🚀 Raketenstart JETZT verfügbar!");
            
        }, randomDelay);
    } else {
        console.log("❌ Kein Raketenstart in dieser Sitzung.");
    }

    animate();
    
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick, false);
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

        if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
            const rocketControls = document.getElementById('rocket-controls');
            const launchBtn = document.getElementById('launch-rocket-btn');
            
            if (rocketControls) {
                rocketControls.style.display = 'block';
                launchBtn.disabled = false;
                launchBtn.textContent = "🚀 Raketenstart verfügbar!";
                launchBtn.classList.add('btn-pulse');
                console.log("Raketen-Modus per Shortcut aktiviert!");
            }
        }

        if (e.shiftKey && (e.key === 'F' || e.key === 'f')) {
            toggleFlatEarthMode();
        }
        
        if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
            unlockDeepSpaceMission();
        }
    });
    
    updatePositions(currentDay);
    setFocus(sun, 0); 
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (isPlaying) {
            playPauseBtn.classList.add('playing');
            playPauseBtn.innerHTML = iconPause;
    } else {
        playPauseBtn.innerHTML = iconPlay;
    }

    const warpBtn = document.getElementById('warp-btn');
    if (warpBtn) {
        warpBtn.addEventListener('click', () => {
            const loadingScreen = document.getElementById('loading-screen');
            const loadingText = document.getElementById('loading-text');
            
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
                loadingScreen.style.opacity = '1';
                if (loadingText) loadingText.textContent = "Initialisiere Sprungantrieb...";
            }

            setTimeout(() => {
                window.location.href = 'deep_space.html';
            }, 1500);
        });
    }
}

// ===========================================
// ANIMATION LOOP
// ===========================================

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();

    // --- FLAT EARTH ANIMATION ---
    if (flatAnimPhase !== 'idle') {
        flatAnimTimer += deltaTime;

        if (flatAnimPhase === 'anticipation') {
            const progress = Math.min(1.0, flatAnimTimer / 0.5);
            const stretch = 1.0 + (Math.sin(progress * Math.PI) * 0.2); 
            const thin = 1.0 - (Math.sin(progress * Math.PI) * 0.1);    
            earth.scale.set(thin, stretch, thin);
            
            if (progress >= 1.0) {
                flatAnimPhase = 'wobble';
                flatAnimTimer = 0;
            }

        } else if (flatAnimPhase === 'wobble') {
            const progress = Math.min(1.0, flatAnimTimer / 0.8);
            const shake = Math.sin(flatAnimTimer * 30) * (0.1 * (1.0 - progress)); 
            earth.scale.set(1.0 + shake, 1.0 - shake, 1.0 + shake);

            if (progress >= 1.0) {
                flatAnimPhase = 'splat';
                flatAnimTimer = 0;
            }

        } else if (flatAnimPhase === 'splat') {
            const progress = Math.min(1.0, flatAnimTimer / 0.2);
            const currentY = 1.0 - (0.95 * progress); 
            const currentXZ = 1.0 + (0.5 * progress);

            earth.scale.set(currentXZ, currentY, currentXZ);

            if (progress >= 1.0) {
                flatAnimPhase = 'idle'; 
                isFlatEarth = true;
                if (infoToastButton) {
                    infoToastButton.textContent = "⚠️ ACHTUNG: Erde wurde plattgedrückt!";
                    infoToastButton.style.display = 'block';
                    infoToastButton.classList.add('btn-danger');
                    setTimeout(() => { 
                        infoToastButton.style.display = 'none'; 
                        infoToastButton.classList.remove('btn-danger');
                    }, 4000);
                }
            }
        } else if (flatAnimPhase === 'restoring') {
            const progress = Math.min(1.0, flatAnimTimer / 1.0);
            const currentY = 0.05 + (0.95 * progress);
            const currentXZ = 1.5 - (0.5 * progress);
            const elastic = 1.0 + (Math.sin(progress * Math.PI * 4) * 0.05 * (1.0 - progress));
            
            earth.scale.set(currentXZ * elastic, currentY * elastic, currentXZ * elastic);

            if (progress >= 1.0) {
                earth.scale.set(1, 1, 1); 
                flatAnimPhase = 'idle';
                isFlatEarth = false;
            }
        }
    }
     
    if (isRealScaleActive) {
        if (realityCheckPhase === 'growing') {
            const growthSpeed = 2.0; 
            currentSunScale += growthSpeed * deltaTime;
            
            if (currentSunScale >= targetSunScale) {
                currentSunScale = targetSunScale;
                realityCheckPhase = 'active';
                document.getElementById('info-box').textContent = "MAẞSTAB: Reale Grösse erreicht.";

                if (sunGhost) {
                    setTimeout(() => {
                        if (sunGhost) { 
                            sunGhost.visible = false;
                        }
                    }, 2000); 
                }
            }
            sun.scale.set(currentSunScale, currentSunScale, currentSunScale);
            if (sunGhost) sunGhost.scale.set(currentSunScale, currentSunScale, currentSunScale);

        }
        else if (realityCheckPhase === 'flying_out') {
            const earthOrbitAngle = 0;
            flightStartState.progress += deltaTime / flightStartState.duration;
            const easing = easeInOutCubic(Math.min(1.0, flightStartState.progress)); 
            currentEarthDistance = THREE.MathUtils.lerp(flightStartState.startDist, targetEarthDistance, easing);
            
            const kmPerUnit = 149600000 / REAL_EARTH_DIST_VALUE;
            const currentKm = (currentEarthDistance / REAL_EARTH_DIST_VALUE) * 149600000;
            updateDynamicLabel(currentKm);

            if (flightStartState.progress >= 1.0) {
                currentEarthDistance = targetEarthDistance; 
                realityCheckPhase = 'active_distant';
                document.getElementById('info-box').textContent = "ANGEKOMMEN! Distanz: ca. 150 Mio. km";
                controls.enabled = true;
                cameraFocus = earth; 
                let earthPos = new THREE.Vector3(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);
                controls.target.copy(earthPos);
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
        else if (realityCheckPhase === 'active_distant') {
            if (rulerGroup) {
                rulerFadeTimer += deltaTime;
                if (rulerFadeTimer > 2.0) {
                        const fadeDuration = 1.0;
                        const opacity = Math.max(0, 0.8 * (1.0 - (rulerFadeTimer - 2.0) / fadeDuration));
                        rulerGroup.traverse(child => {
                            if (child.material) {
                                child.material.opacity = opacity;
                            }
                        });
                        if (distanceLabelEl) {
                            distanceLabelEl.style.opacity = opacity;
                        }
                        
                        if (opacity <= 0) {
                            scene.remove(rulerGroup);
                            rulerGroup = null;
                            if (distanceLabelEl) {
                                    distanceLabelEl.style.display = 'none';
                                    distanceLabelEl.style.opacity = 1.0; 
                            }
                        }
                }
            }
        }
        else if (realityCheckPhase === 'flying_in') {
            const earthOrbitAngle = 0;
            flightStartState.progress += deltaTime / flightStartState.duration;
            const easing = easeInOutCubic(Math.min(1.0, flightStartState.progress)); 
            currentEarthDistance = THREE.MathUtils.lerp(flightStartState.startDist, targetEarthDistance, easing);

            const currentKm = (currentEarthDistance / REAL_EARTH_DIST_VALUE) * 149600000;
            updateDynamicLabel(currentKm);

            if (flightStartState.progress >= 1.0) {
                currentEarthDistance = targetEarthDistance;
                realityCheckPhase = 'active';
                document.getElementById('info-box').textContent = "Wieder beim Grössenvergleich.";
                
                document.getElementById('planet-focus-buttons').style.display = 'grid';

                let earthPos = new THREE.Vector3(Math.cos(earthOrbitAngle) * currentEarthDistance, 0, -Math.sin(earthOrbitAngle) * currentEarthDistance);
                
                const finalSunRadius = REAL_SUN_SCALE_FACTOR * SUN_RADIUS;
                const fovInRad = THREE.MathUtils.degToRad(camera.fov);
                const visibleHeightNeeded = (finalSunRadius * 2) / 0.8;
                const requiredDist = (visibleHeightNeeded / 2) / Math.tan(fovInRad / 2);
                
                let sunToEarthDir = earthPos.clone().normalize();
                let camEndPos = sunToEarthDir.multiplyScalar(requiredDist); 
                
                flyTo(camEndPos, new THREE.Vector3(0,0,0), 1.5, null, () => { controls.enabled = true; });
                
                if (distanceLabelEl) {
                        distanceLabelEl.style.display = 'none';
                }

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
        if (comet) {
            if (comet.update(deltaTime)) {
                comet = null; 
            }
        } else {
            if (cometSpawnDay !== -1 && currentDay >= cometSpawnDay) {
                spawnComet();
                cometSpawnDay = -1; 
            }
        }
    }
    
    updateUFO(deltaTime);

    if (rocketInstance) {
        const isFinished = rocketInstance.update(deltaTime);
        if (isFinished) {
            rocketInstance = null;
        }
    }

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
    else if (isFrequencyDemoActive) actualSpeed = speed;

    if (isRewinding) {
        let daysPerSecondFactor = EARTH_YEAR_DAYS / 60.0;
        const deltaDays = actualSpeed * daysPerSecondFactor * deltaTime;
        currentDay -= deltaDays;
        
        const daySlider = document.getElementById('day-slider');
        daySlider.value = ((currentDay % EARTH_YEAR_DAYS) + EARTH_YEAR_DAYS) % EARTH_YEAR_DAYS;
        if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
        updateUI();
        
    } else if (isPlaying && !isRealScaleActive && !isRealDistanceActive) {
        let daysPerSecondFactor;
        if (isDemoActive) {
            daysPerSecondFactor = 1.0;
        } else {
            daysPerSecondFactor = EARTH_YEAR_DAYS / 60.0;
        }
        
        const deltaDays = actualSpeed * daysPerSecondFactor * deltaTime;
        currentDay += deltaDays;
        
        if (isDemoActive) {
            if (currentDay > demoLoopEndDay) currentDay = demoLoopStartDay; 
            else if (currentDay < demoLoopStartDay) currentDay = demoLoopEndDay;
        }
        
        const daySlider = document.getElementById('day-slider');
        daySlider.value = currentDay % EARTH_YEAR_DAYS;
        if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
        updateUI();
    }
    
    updatePositions(currentDay);
    updateCamera(false); 
    controls.update();
    renderer.render(scene, camera);
}

// ===========================================
// LOGIK & HELPER
// ===========================================

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
    let earthOrbitAngle;
    if (isRealScaleActive) {
        earthOrbitAngle = 0;
    } else {
        earthOrbitAngle = (day / EARTH_YEAR_DAYS) * Math.PI * 2;
    }
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
    moonPivot.rotation.y = earthOrbitAngle + moonOrbitAngle; 
    moonOrbitLine.position.copy(earthWorldPos);
    if (moonEclipticPlane) moonEclipticPlane.position.copy(earthWorldPos);
    
    moon.rotation.y = 0;
    moon.position.x = -currentMoonDistance; 

    otherPlanetControls.forEach((ctrl, index) => {
        const data = planetsData[index];
        const planet = otherPlanets[index];
        
        if (!isRealScaleActive || realityCheckPhase === 'idle') {
            const pos = calculateEllipticalPosition(data.distance, data.ecc, data.perihelionAngle, day, data.yearDays);
            ctrl.container.position.set(pos.x, 0, pos.z);
        }
        
        planet.rotation.y = (day * data.rotationSpeed) * Math.PI * 2;
        let tempVec = new THREE.Vector3();
        planet.getWorldPosition(tempVec);
        planet.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
        
        if (data.ring) {
                const ringEntry = planetRingMaterials.find(e => e.parentPlanet === planet);
                if (ringEntry && ringEntry.ringMat) {
                    ringEntry.ringMat.uniforms.uRingParentPosition.value.copy(tempVec);
                }
                
                const planetEntry = planetRingMaterials.find(e => e.pivot === ctrl.tiltPivot && e.mat);
                if (planetEntry && planetEntry.mat) {
                const ringNormalWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(ctrl.tiltPivot.getWorldQuaternion(new THREE.Quaternion()));
                planetEntry.mat.uniforms.uRingNormal.value.copy(ringNormalWorld);
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

    if (jupiterMoonShadowUniforms && jupiterMoons.length > 0) {
        let tempMoonPos = new THREE.Vector3();
        for (let i = 0; i < 4; i++) {
            if (jupiterMoons[i]) {
                jupiterMoons[i].getWorldPosition(tempMoonPos);
                jupiterMoonShadowUniforms.uMoonPositions.value[i].copy(tempMoonPos);
                jupiterMoonShadowUniforms.uMoonRadii.value[i] = jupiterMoons[i].geometry.parameters.radius;
            } else {
                jupiterMoonShadowUniforms.uMoonRadii.value[i] = 0.0;
            }
        }
    }

    if (loaded3DModels.length > 0) {
        let tempEarthPos = new THREE.Vector3(); 
        
        loaded3DModels.forEach(model => {
            if (model.data.updateType === 'earth_orbit') {
                
                earth.getWorldPosition(tempEarthPos);
                model.pivot.position.copy(tempEarthPos);
                
                const orbitsPerDay = model.data.orbitsPerDay;
                model.pivot.rotation.y = (day * orbitsPerDay) * Math.PI * 2;
                
                const inclinationRad = (model.data.inclination * Math.PI) / 180;
                model.pivot.rotation.y = (day * orbitsPerDay) * Math.PI * 2;

                model.pivot.rotation.order = 'ZXY'; 

                model.pivot.rotation.z = EARTH_TILT_RAD; 
                model.pivot.rotation.x = inclinationRad; 

                const precessionSpeedPerDay = (Math.PI * 2) / 365.25; 
                model.pivot.rotation.z += (day * precessionSpeedPerDay);
                
            }

            else if (model.data.updateType === 'static_rotation') {
                model.scene.rotation.z += 0.0005; 
                model.scene.rotation.y += 0.0002;
            }
        });
    }

    let tempVec = new THREE.Vector3();
    earth.getWorldPosition(tempVec);
    earth.material.uniforms.uObjectWorldPosition.value.copy(tempVec);
    
    let moonWorldPosition = new THREE.Vector3();
    moon.getWorldPosition(moonWorldPosition);
    earth.material.uniforms.uMoonPosition.value.copy(moonWorldPosition);
    
    earth.material.uniforms.uMoonRadius.value = MOON_RADIUS * moon.scale.x;


    if (isDemoActive && demoType === 'mofi') {
        const animProgress = (currentDay - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);
        const dayToProgress = (d) => (d - demoLoopStartDay) / (demoLoopEndDay - demoLoopStartDay);
        
        const peakDay = 14.765; 
        
        const redFadeInStart = dayToProgress(peakDay - 0.48); 
        const redFullIntensityStart = dayToProgress(peakDay - 0.43);
        
        const redFadeOutStart = dayToProgress(peakDay + 0.3); 
        const redFadeOutEnd = dayToProgress(peakDay + 0.5); 
        
        const shadowFadeInStart = dayToProgress(peakDay - 0.48); 
        const shadowFadeInEnd = dayToProgress(peakDay - 0.43);         
        
        const shadowFadeOutStart = dayToProgress(peakDay + 0.2); 
        const shadowFadeOutEnd = dayToProgress(peakDay + 0.5);
        
        const shadowTargetBrightness = 0.6; 
        
        let redIntensity = 0.0; 
        let shadowBrightness = 0.0;

        if (animProgress <= redFullIntensityStart) {
            const fadeDuration = redFullIntensityStart - redFadeInStart;
            const fadeProgress = Math.min(1.0, Math.max(0.0, (animProgress - redFadeInStart) / fadeDuration));
            redIntensity = fadeProgress; 
        } else if (animProgress <= redFadeOutStart) {
            redIntensity = 1.0;
        } else if (animProgress <= redFadeOutEnd) {
            const fadeDuration = redFadeOutEnd - redFadeOutStart;
            const fadeProgress = Math.min(1.0, Math.max(0.0, (animProgress - redFadeOutStart) / fadeDuration));
            redIntensity = 1.0 - fadeProgress; 
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
        originalMoonMaterial.uniforms.uMoonRadius.value = MOON_RADIUS * moon.scale.x;
    }

    if (asteroidInstancedMesh) {
        const asteroids = asteroidInstancedMesh.userData.asteroids;
        const dummy = new THREE.Object3D();
        
        for (let i = 0; i < asteroids.length; i++) {
            const data = asteroids[i];
            const currentAngle = data.startAngle + (day * data.speed * -0.1); 

            const x = Math.cos(currentAngle) * data.distance;
            const z = Math.sin(currentAngle) * data.distance;
            
            dummy.position.set(x, data.y, z);
            
            const currentMatrix = new THREE.Matrix4();
            asteroidInstancedMesh.getMatrixAt(i, currentMatrix);
            
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            currentMatrix.decompose(position, quaternion, scale);
            
            dummy.quaternion.copy(quaternion);
            dummy.scale.copy(scale);
            
            dummy.updateMatrix();
            asteroidInstancedMesh.setMatrixAt(i, dummy.matrix);
        }
        asteroidInstancedMesh.instanceMatrix.needsUpdate = true;
    }

    if (moon && surfaceObjectsMaterials.length > 0) {
        const moonWorldPos = new THREE.Vector3();
        moon.getWorldPosition(moonWorldPos);
        
        const sunWorldPos = new THREE.Vector3();
        if(sun) sun.getWorldPosition(sunWorldPos);

        const sliderEl = document.getElementById('darkness-slider');
        const currentBrightness = sliderEl ? parseFloat(sliderEl.value) : 0.04;

        surfaceObjectsMaterials.forEach(mat => {
            if (mat.userData.shader) {
                const uniforms = mat.userData.shader.uniforms;
                
                if (uniforms.uMoonCenter) uniforms.uMoonCenter.value.copy(moonWorldPos);
                if (uniforms.uSunPosition) uniforms.uSunPosition.value.copy(sunWorldPos);
                if (uniforms.uNightBrightness) uniforms.uNightBrightness.value = currentBrightness;
            }
        });
    }

    const sliderEl = document.getElementById('darkness-slider');
    const sliderValue = sliderEl ? parseFloat(sliderEl.value) : 0.04;

    const _lightWorldPos = new THREE.Vector3();
    const _moonCenterPos = new THREE.Vector3();
    const _sunPos = new THREE.Vector3();

    if (moon) moon.getWorldPosition(_moonCenterPos);
    if (sun) sun.getWorldPosition(_sunPos);

    nightTimeLights.forEach(light => {
        light.getWorldPosition(_lightWorldPos);

        const surfaceUp = new THREE.Vector3().subVectors(_lightWorldPos, _moonCenterPos).normalize();
        const sunDir = new THREE.Vector3().subVectors(_sunPos, _lightWorldPos).normalize();
        
        const sunIntensity = surfaceUp.dot(sunDir);
        
        const nightFactor = 1.0 - THREE.MathUtils.smoothstep(sunIntensity, -0.1, 0.2);

        let sliderFactor = sliderValue * 2.5; 
        if (sliderFactor > 1.0) sliderFactor = 1.0;

        let currentIntensity = light.userData.baseIntensity * sliderFactor * nightFactor;

        const minIntensity = light.userData.baseIntensity * light.userData.minBrightness;
        
        if (currentIntensity < minIntensity) {
            currentIntensity = minIntensity;
        }

        light.intensity = currentIntensity;
    });
}
// --- FUNKTIONEN ---

function setFocus(targetObj, duration = 2.0) { 
    resetActiveIndicators();
    toggleOtherPlanets(true);

    if (targetObj === sun) {
        cameraFocus = sun; 
        const homePos = new THREE.Vector3(-600, 450, 600); 
        const homeTarget = new THREE.Vector3(0, 0, 0); 
        document.getElementById('moon-focus-container').style.display = 'none';
        
        document.getElementById('focus-system').classList.add('active');
        
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
    
    if (!isRealScaleActive) {
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
                        btn.addEventListener('click', () => {
                            checkAndEndDemo();
                            setFocus(moonEntry.mesh);
                        });
                        moonContainer.appendChild(btn);
                        
                        if (targetObj === moonEntry.mesh) {
                            btn.classList.add('active');
                        }
                        
                    }
                });
            }
        }
    }
    
    let matchingBtn = null;
    if (targetObj === earth) {
        matchingBtn = document.getElementById('focus-earth');
    } else if (targetObj === moon) {
        matchingBtn = document.getElementById('focus-moon');
    } else {
        const planetIndex = otherPlanets.indexOf(targetObj);
        if (planetIndex > -1) {
            matchingBtn = document.getElementById(`focus-${planetsData[planetIndex].name.toLowerCase()}`);
        }
    }
    if (matchingBtn) matchingBtn.classList.add('active');
    
    if (!matchingBtn) { 
        const modelEntry = loaded3DModels.find(m => m.scene === targetObj);
        if (modelEntry && modelEntry.focusButton) {
            modelEntry.focusButton.classList.add('active');
        }
    }
    
    
    const radius = targetObj.geometry ? targetObj.geometry.parameters.radius : (targetObj.radius ? targetObj.radius : 1.0); 

    const targetPos = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);
    
    if (isRealScaleActive && targetObj !== sun) {
        const sunPos = new THREE.Vector3(0,0,0);
        const planetToSun = new THREE.Vector3().subVectors(sunPos, targetPos).normalize();
        const camOffset = planetToSun.clone().negate().multiplyScalar(radius * 30); 
        camOffset.y += radius * 2; 
        
        const endPos = targetPos.clone().add(camOffset);
        flyTo(endPos, targetPos, duration, targetObj);
        return;
    }

    const endTarget = targetPos.clone();
    let distance; 

    if (comet && (targetObj === comet.mesh || targetObj === comet.hitbox)) {

        const visualRadius = comet.visualRadius || 1.0; 
        if (!distance) distance = visualRadius * 7.0; 

        distance = THREE.MathUtils.clamp(distance, visualRadius * 2.0, 500.0);

        const cometSunPos = new THREE.Vector3(); 
        sun.getWorldPosition(cometSunPos);       

        const sunToComet = new THREE.Vector3().subVectors(targetPos, cometSunPos).normalize();
        const up = new THREE.Vector3(0, 1, 0);

        const cometOffsetDir = new THREE.Vector3().crossVectors(sunToComet, up).normalize();
        cometOffsetDir.applyAxisAngle(up, THREE.MathUtils.degToRad(-45));
        cometOffsetDir.y = 0.3; 
        cometOffsetDir.normalize();
        
        const offset = cometOffsetDir.multiplyScalar(distance);
        const endPos = targetPos.clone().add(offset);

        comet.isCameraTransitioning = true;
        flyTo(endPos, endTarget, duration, targetObj);
        return; 

    } else if (targetObj.userData && targetObj.userData.isRocket) {
        
        const rInst = rocketInstance; 
        const scaleBase = rInst ? rInst.effScale : 0.003;

        distance = scaleBase * 150.0; 
        
        const startDir = new THREE.Vector3(1, 2.5, 0).normalize();
        
        const offset = startDir.multiplyScalar(distance);
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
        return; 

    } else {
        const modelEntry = loaded3DModels.find(m => m.scene === targetObj);
        if (modelEntry && modelEntry.data.focusDistance) {
            distance = modelEntry.data.focusDistance;
        } else {
            const radius = targetObj.geometry ? targetObj.geometry.parameters.radius : (targetObj.radius ? targetObj.radius : 1.0); 
            const fovInRad = THREE.MathUtils.degToRad(camera.fov);
            distance = (radius / 0.3) / Math.tan(fovInRad / 2); 
        }
    }
    

    const offsetDir = new THREE.Vector3(0, 0, 0).sub(targetPos).normalize();
    offsetDir.y = 0.5; 
    offsetDir.normalize(); 
    const offset = offsetDir.multiplyScalar(distance); 
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
        if (cameraFocus === 'eclipse_frequency_view') {
            let camPos = new THREE.Vector3();
            let targetPos = new THREE.Vector3();
            earthTiltPivot.getWorldPosition(camPos);
            sun.getWorldPosition(targetPos);
            camera.position.copy(camPos);
            controls.target.copy(targetPos);
            lastCameraTargetPos.copy(targetPos);
            return;
        }
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
            const camPos = ufoPos.clone().add(behindDir.multiplyScalar(1.2 * SCENE_SCALE));
            camPos.y += 3 * SCENE_SCALE; 
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

    if (targetObject.userData && targetObject.userData.isRocket) {
        const rInst = rocketInstance;
        if (rInst) {
            const capsulePos = new THREE.Vector3();
            rInst.meshCapsule.getWorldPosition(capsulePos);
            
            const delta = capsulePos.clone().sub(lastCameraTargetPos);

            camera.position.add(delta);
            controls.target.copy(capsulePos);
            lastCameraTargetPos.copy(capsulePos);
            
            return; 
        }
    }
    
    if (isPlaying || isDemoActive || isFrequencyDemoActive || isRewinding) { 
        const delta = currentTargetPos.clone().sub(lastCameraTargetPos);
        camera.position.add(delta);
        controls.target.add(delta);
    }
    lastCameraTargetPos.copy(currentTargetPos);
}

// ===========================================
// UI SETUP
// ===========================================

function setupUI() {
    const uiContainer = document.getElementById('ui-container');
    const toggleBtn = document.getElementById('toggle-ui');
    toggleBtn.addEventListener('click', () => {
        uiContainer.classList.toggle('minimized');
        toggleBtn.textContent = uiContainer.classList.contains('minimized') ? '☰' : '✕';
        toggleBtn.title = uiContainer.classList.contains('minimized') ? 'Menü anzeigen' : 'Menü verbergen';
    });
    
    const orbitCheckbox = document.getElementById('orbit-checkbox');
    orbitCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        earthOrbitLine.visible = isChecked;
        moonOrbitLine.visible = isChecked;
    });
    earthOrbitLine.visible = orbitCheckbox.checked;
    moonOrbitLine.visible = orbitCheckbox.checked;

    const equatorCheckbox = document.getElementById('equator-checkbox');
    equatorCheckbox.addEventListener('change', (e) => {
        if (earthEquatorLine) {
            earthEquatorLine.visible = e.target.checked;
        }
    });
    if (earthEquatorLine) {
        earthEquatorLine.visible = equatorCheckbox.checked;
    }

    eclipticPlaneCheckbox = document.getElementById('ecliptic-plane-checkbox');
    eclipticPlaneCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (earthEclipticPlane) earthEclipticPlane.visible = isChecked;
        if (moonEclipticPlane) moonEclipticPlane.visible = isChecked;
    });
    if (earthEclipticPlane) earthEclipticPlane.visible = eclipticPlaneCheckbox.checked;
    if (moonEclipticPlane) moonEclipticPlane.visible = eclipticPlaneCheckbox.checked;
    
    humanObjectsCheckbox = document.getElementById('human-objects-checkbox');
    const humanObjectsBtnContainer = document.getElementById('human-objects-focus-buttons'); 

    humanObjectsCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        
        loaded3DModels.forEach(model => {
            model.scene.visible = isChecked;
            model.pivot.visible = isChecked; 
        });
        
        if (humanObjectsBtnContainer) {
            humanObjectsBtnContainer.style.display = isChecked ? 'flex' : 'none';
        }
    });

    const isCheckedInitially = humanObjectsCheckbox.checked; 
    loaded3DModels.forEach(model => {
        model.scene.visible = isCheckedInitially;
        model.pivot.visible = isCheckedInitially;
    });
    
    if (humanObjectsBtnContainer) {
        humanObjectsBtnContainer.style.display = isCheckedInitially ? 'flex' : 'none';
    }

    const planetsVisibleCheckbox = document.getElementById('planets-visible-checkbox');
    const planetsOrbitCheckbox = document.getElementById('planets-orbit-checkbox');
    const planetFocusContainer = document.getElementById('planet-focus-buttons');

    planetsVisibleCheckbox.addEventListener('change', (e) => {
        const isVisible = e.target.checked;
        otherPlanetControls.forEach(ctrl => { ctrl.orbit.visible = isVisible; });
        otherMoons.forEach(moonObj => { moonObj.mesh.visible = isVisible; });
        planetFocusContainer.style.display = isVisible ? 'grid' : 'none';
    });
    planetsOrbitCheckbox.addEventListener('change', (e) => {
        const isVisible = e.target.checked;
        otherPlanetOrbits.forEach(orbit => { orbit.visible = isVisible; });
    });
    const planetsInitiallyVisible = planetsVisibleCheckbox.checked;
    otherPlanetControls.forEach(ctrl => { ctrl.orbit.visible = planetsInitiallyVisible; });
    const orbitsInitiallyVisible = planetsOrbitCheckbox.checked;
    otherPlanetOrbits.forEach(orbit => { orbit.visible = orbitsInitiallyVisible; });
    planetFocusContainer.style.display = planetsInitiallyVisible ? 'grid' : 'none';
    
    const darknessSlider = document.getElementById('darkness-slider');
    const darknessLabel = document.getElementById('darkness-label');

    darknessSlider.addEventListener('input', (e) => {
        const brightness = parseFloat(e.target.value);
        earth.material.uniforms.uNightBrightness.value = brightness;
        originalMoonMaterial.uniforms.uNightBrightness.value = brightness;
        otherPlanets.forEach(planet => { planet.material.uniforms.uNightBrightness.value = brightness; });
        otherMoons.forEach(moonObj => { moonObj.mesh.material.uniforms.uNightBrightness.value = brightness; });
        
        planetRingMaterials.forEach(entry => {
            if (entry.ringMat) entry.ringMat.uniforms.uNightBrightness.value = brightness;
        });

        surfaceObjectsMaterials.forEach(mat => {
            if (mat.uniforms && mat.uniforms.uNightBrightness) {
                mat.uniforms.uNightBrightness.value = brightness;
            }
        });
        
        darknessLabel.textContent = brightness.toFixed(2);
    });
    
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.addEventListener('input', onSpeedSliderChange);
    onSpeedSliderChange(); 
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.addEventListener('click', togglePlay);
    
    const rewindBtn = document.getElementById('rewind-btn');
    rewindBtn.addEventListener('click', toggleRewind);
    
    const daySlider = document.getElementById('day-slider');
    daySlider.addEventListener('input', () => {
        pauseSimulation();
        currentDay = parseFloat(daySlider.value);
        if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
        updatePositions(currentDay);
        updateUI();

        if (cameraFocus && typeof cameraFocus !== 'string') {
            let newTargetPos = new THREE.Vector3();
            cameraFocus.getWorldPosition(newTargetPos);
            const delta = newTargetPos.clone().sub(lastCameraTargetPos);
            camera.position.add(delta);
            controls.target.add(delta);
            lastCameraTargetPos.copy(newTargetPos);
        }
    });
    
    const initialBrightness = parseFloat(darknessSlider.value);
    earth.material.uniforms.uNightBrightness.value = initialBrightness;
    originalMoonMaterial.uniforms.uNightBrightness.value = initialBrightness;
    otherPlanets.forEach(planet => { planet.material.uniforms.uNightBrightness.value = initialBrightness; });
    otherMoons.forEach(moonObj => { moonObj.mesh.material.uniforms.uNightBrightness.value = initialBrightness; });
    
    planetRingMaterials.forEach(entry => {
        if (entry.ringMat) entry.ringMat.uniforms.uNightBrightness.value = initialBrightness;
    });

    darknessLabel.textContent = initialBrightness.toFixed(2);

    document.getElementById('focus-system').addEventListener('click', () => {
        checkAndEndDemo();
        setFocus(sun);
    });
    document.getElementById('focus-earth').addEventListener('click', () => {
        checkAndEndDemo();
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
        checkAndEndDemo();
        if (isRealScaleActive) {
            let moonPos = new THREE.Vector3();
            moon.getWorldPosition(moonPos);
            const sunToMoonDir = moonPos.clone().normalize();
            sunToMoonDir.y = 0.25;
            sunToMoonDir.normalize();
            const endPos = moonPos.clone().add(sunToMoonDir.multiplyScalar(MOON_RADIUS * 12)); 
                flyTo(endPos, moonPos, 2.0, moon); 
        } else {
            setFocus(moon);
        }
    });

    document.getElementById('focus-ecliptic').addEventListener('click', () => {
        checkAndEndDemo();
        resetActiveIndicators();
        document.getElementById('focus-ecliptic').classList.add('active');
        toggleOtherPlanets(false); 
        restoreOrbitLines(); 
        
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

    document.getElementById('demo-freq').addEventListener('click', startFrequencyDemo);
    
    document.getElementById('demo-sofi').addEventListener('click', () => startDemo('sofi'));
    document.getElementById('demo-mofi').addEventListener('click', () => startDemo('mofi'));
    
    const endDemoBtn = document.getElementById('end-demo-btn');
    endDemoBtn.addEventListener('click', () => {
        if (isFrequencyDemoActive) {
            endFrequencyDemo();
        } else if (isDemoActive) {
            endDemo();
        }
    });
    
    document.getElementById('real-scale-btn').addEventListener('click', () => {
        checkAndEndDemo();
        toggleRealScale();
    });
    
    document.getElementById('real-dist-btn').addEventListener('click', () => {
        toggleRealDistance();
    }); 
    
    const demoSpeedSlider = document.getElementById('demo-speed-slider');
    demoSpeedSlider.addEventListener('input', onDemoSpeedSliderChange);
    onDemoSpeedSliderChange();

    document.querySelectorAll('#moon-phases-ui button').forEach(btn => {
        const index = parseInt(btn.dataset.phaseIndex);
        btn.addEventListener('click', () => {
            checkAndEndDemo();
            jumpToPhase(index);
        });
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
        btn.addEventListener('click', () => {
            checkAndEndDemo();
            setFocus(otherPlanets[index]);
        });
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

    document.getElementById('ufo-yes-btn').addEventListener('click', () => {
        document.getElementById('ufo-alien-image').src = "ImagesGit/Alien/alien_happy.webp";
        
        if (ufoEncounterCount === 0) {
            document.getElementById('ufo-dialog-text').textContent = "Perfekt. Danke für die Hilfe.";
        } else if (ufoEncounterCount === 1) {
            document.getElementById('ufo-dialog-text').textContent = "Gut wir geben unser Bestes. Wir melden uns, mit weiteren Infos! *zwoop*";
        }
        
        document.getElementById('ufo-initial-buttons').style.display = 'none';
        const closeGroup = document.getElementById('ufo-close-group');
        closeGroup.style.display = 'flex';
        
        const closeBtn = document.getElementById('ufo-close-btn');
        closeBtn.onclick = () => {
                document.getElementById('ufo-dialog').style.display = 'none';
                ufoState = 'leaving';
                
                ufoDepartureTarget = (ufoEncounterCount === 0) ? earth : null; 
                cameraFocus = (ufoEncounterCount === 0) ? 'ufo_to_earth' : ufo;
                if (!isPlaying) togglePlay();
                
                ufoEncounterCount++; 
                resetUfoDialog(); 
                
        };
    });

    document.getElementById('ufo-no-btn').addEventListener('click', () => {
        document.getElementById('ufo-alien-image').src = "ImagesGit/Alien/alien_angry.webp";
        
        if (ufoEncounterCount === 0) {
            document.getElementById('ufo-dialog-text').textContent = "Schade. Dann suchen wir weiter. Gute Reise, Erdling.";
        } else if (ufoEncounterCount === 1) {
            document.getElementById('ufo-dialog-text').textContent = "Na gut, dann nicht. Wir suchen weiter nach Herrn Maurer.";
        }
        
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
                
                ufoEncounterCount++; 
                resetUfoDialog(); 
                
        };
    });
    
    const SEASON_SPRING_DAY = 274.19;  
    const SEASON_SUMMER_DAY = 0.49; 
    const SEASON_AUTUMN_DAY = 91.76; 
    const SEASON_WINTER_DAY = 182.95; 
    
    const seasonSpringBtn = document.getElementById('season-spring');
    const seasonSummerBtn = document.getElementById('season-summer');
    const seasonAutumnBtn = document.getElementById('season-autumn');
    const seasonWinterBtn = document.getElementById('season-winter');

    seasonSpringBtn.addEventListener('click', () => {
        jumpToSeason(SEASON_SPRING_DAY, seasonSpringBtn);
    });
    seasonSummerBtn.addEventListener('click', () => {
        jumpToSeason(SEASON_SUMMER_DAY, seasonSummerBtn);
    });
    seasonAutumnBtn.addEventListener('click', () => {
        jumpToSeason(SEASON_AUTUMN_DAY, seasonAutumnBtn);
    });
    seasonWinterBtn.addEventListener('click', () => {
        jumpToSeason(SEASON_WINTER_DAY, seasonWinterBtn);
    });
    
    freqDemoControls = document.getElementById('freq-demo-controls');
    realRatioCheckbox = document.getElementById('real-ratio-checkbox');
    realRatioCheckbox.addEventListener('change', applyFrequencyDemoScaling);
    
    const scrollContent = document.getElementById('ui-scrollable-content');
    const scrollIndicator = document.getElementById('scroll-indicator');

    function checkScrollIndicator() {
        if (!scrollContent || !scrollIndicator) return;
        const isScrollable = scrollContent.scrollHeight > scrollContent.clientHeight;
        const isAtBottom = scrollContent.scrollHeight - scrollContent.scrollTop - scrollContent.clientHeight < 5;

        if (isScrollable && !isAtBottom) {
            scrollIndicator.style.display = 'block';
        } else {
            scrollIndicator.style.display = 'none';
        }
    }

    scrollContent.addEventListener('scroll', checkScrollIndicator);
    window.addEventListener('resize', checkScrollIndicator);
    
    document.getElementById('toggle-ui').addEventListener('click', () => {
        setTimeout(checkScrollIndicator, 350);
    });

    checkScrollIndicator();
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
    const phaseNames = ["Neumond", "Zunehmende Sichel", "Zunehmender Halbmond", "Zunehmendes Drittel", "Vollmond", "Abnehmendes Drittel", "Abnehmender Halbmond", "Abnehmende Sichel"];
    let phaseName = phaseNames[phaseIndex];
    
    let infoText = `Mondphase: ${phaseName}`;
    
    if (isFrequencyDemoActive) {
        infoText = "Ansicht: Finsternis-Häufigkeit";
        let moonWorldY = moon.getWorldPosition(new THREE.Vector3()).y;
        let earthWorldY = earth.getWorldPosition(new THREE.Vector3()).y; 
        let yDiff = moonWorldY - earthWorldY;
        infoText += ` | Mond-Neigung: ${yDiff.toFixed(1)}`;
    
    } else if (isDemoActive) {
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
            if (comet.hitbox && comet.hitbox.userData.info) {
            comet.hitbox.userData.info.velocity = `ca. ${speedKmh.toLocaleString('de-DE')} km/h`;
            }
            
            infoText += ` | Komet: ${speedKmh.toLocaleString('de-DE')} km/h`;
    }
    
    if (realityCheckPhase === 'flying_out' || realityCheckPhase === 'flying_in') {
            const kmPerUnit = 149600000 / REAL_EARTH_DIST_VALUE;
            const currentKm = Math.round(currentEarthDistance * kmPerUnit);
            infoText = `Distanz zur Sonne: ${currentKm.toLocaleString('de-DE')} km`;
    }

    document.getElementById('info-box').textContent = infoText;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onTouchEnd(event) {
    const targetElement = event.target;
    
    if (isUserControllingCamera) { 
        return; 
    }

    lastTouchTime = new Date().getTime();

    const touch = event.changedTouches[0];
    if (!touch) return; 
    const popupOpened = handleInteraction(touch.clientX, touch.clientY, targetElement);
    if (popupOpened) event.preventDefault(); 
}

function onMouseClick(event) {
    if (new Date().getTime() - lastTouchTime < 500) {
        return; 
    }

    handleInteraction(event.clientX, event.clientY, event.target);
}

function handleInteraction(x, y, targetElement) {
    const uiContainer = document.getElementById('ui-container');
    const popup = document.getElementById('info-popup');
    const ufoDialog = document.getElementById('ufo-dialog');
    
    if (uiContainer.contains(targetElement) || popup.contains(targetElement) || ufoDialog.contains(targetElement) || infoToastButton.contains(targetElement) || targetElement.id === 'rewind-btn') {
        return false; 
    }
    
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
            setupUfoDialogText();

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
        planetType_de: 'Planetentyp',
        earthCompareRadius: 'Größe',
        radius_km: 'Radius', 
        distance_Mio_km: 'Abstand zur Sonne', 
        umlaufzeit: 'Umlaufzeit (Sonne)', 
        taglaenge: 'Tageslänge',
        temperatur: 'Durchschnittstemp.', 
        oberflaeche_temp: 'Oberflächentemp.',
        zusammensetzung: 'Zusammensetzung',
        velocity: 'Geschwindigkeit' 
    };

    if (info.name === 'Sonne') {
            factMap['earthCompareRadius'] = 'Größe (Vergleich)';
    } else if (info.name.includes('Mond')) { 
            factMap['distance_Mio_km'] = `Abstand zu/r ${info.parentName}`; 
            factMap['umlaufzeit'] = `Umlaufzeit (${info.parentName})`; 
    }
    else if (info.name.includes('ISS')|| info.name.includes('Hubble')) {
        factMap['radius_km'] = 'Flughöhe';
        factMap['umlaufzeit'] = `Umlaufzeit (${info.parentName})`;
        factMap['taglaenge'] = 'Sonnenaufgänge';
    }

    else if (info.name.includes('Voyager')) {
            factMap['radius_km'] = 'Distanz zur Erde';
            factMap['taglaenge'] = 'Missionsdauer';
    }

    else if (info.type === 'rocket') {
        factMap['radius_km'] = 'Höhe'; 
    }

    let detailsHTML = ``;
    
    const orderedKeys = ['earthCompareRadius', 'radius_km', 'distance_Mio_km', 'planetType_de', 'umlaufzeit', 'taglaenge', 'temperatur', 'oberflaeche_temp', 'zusammensetzung', 'velocity'];
    
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

function setLaunchModeUI(isActive) {
    const displayStyle = isActive ? 'none' : ''; 
    
    const playGroup = document.getElementById('play-group');
    const timeControls = document.getElementById('time-controls');
    if (playGroup) playGroup.style.display = displayStyle;
    if (timeControls) timeControls.style.display = displayStyle;

    const cometCtrl = document.getElementById('comet-controls');
    if (cometCtrl) {
        if (isActive) {
            cometCtrl.style.display = 'none';
        } else {
            if (typeof comet !== 'undefined' && comet !== null) {
                cometCtrl.style.display = 'block';
            } else {
                cometCtrl.style.display = 'none';
            }
        }
    }

    const visCtrl = document.getElementById('visibility-controls');
    if (visCtrl) visCtrl.style.display = displayStyle;

    const focusGroup = document.getElementById('focus-system')?.parentElement?.parentElement; 
    const extrasGroup = document.getElementById('demo-buttons')?.parentElement; 
    const phasesGroup = document.getElementById('moon-phases-group');
    const seasonsGroup = document.getElementById('seasons-group');
    const realScaleGroup = document.getElementById('real-scale-group');

    if (focusGroup) focusGroup.style.display = displayStyle;
    if (extrasGroup) extrasGroup.style.display = displayStyle;
    if (phasesGroup) phasesGroup.style.display = displayStyle;
    if (seasonsGroup) seasonsGroup.style.display = displayStyle;
    if (realScaleGroup) realScaleGroup.style.display = displayStyle;

    const scrollInd = document.getElementById('scroll-indicator');
    if (scrollInd) scrollInd.style.display = displayStyle;
}

// Icons
const iconRewind = `
    <svg viewBox="0 0 24 24">
        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
    </svg>`;

const rewindBtn = document.getElementById('rewind-btn');
if (rewindBtn) {
    rewindBtn.innerHTML = iconRewind;
}

const iconEnter = `
    <svg viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>`;

const iconExit = `
    <svg viewBox="0 0 24 24">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>`;

const fullscreenBtn = document.getElementById('fullscreen-btn');

const iconPlay = `
    <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/> </svg>`;

const iconPause = `
    <svg viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> </svg>`;

fullscreenBtn.innerHTML = iconEnter;

function isFullscreen() {
    return document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement;
}

fullscreenBtn.addEventListener('click', () => {
    const elem = document.documentElement; 

    if (!isFullscreen()) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        } else if (elem.webkitRequestFullscreen) { 
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { 
            elem.msRequestFullscreen();
        }
        
        fullscreenBtn.innerHTML = iconExit;
        fullscreenBtn.title = "Vollbild beenden";
        
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { 
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { 
            document.msExitFullscreen();
        }
        
        fullscreenBtn.innerHTML = iconEnter;
        fullscreenBtn.title = "Vollbild aktivieren";
    }
});

['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(
    eventType => document.addEventListener(eventType, () => {
        
        if (isFullscreen()) {
            fullscreenBtn.innerHTML = iconExit;
            fullscreenBtn.title = "Vollbild beenden";
            document.body.classList.add('is-fullscreen');
            
        } else {
            fullscreenBtn.innerHTML = iconEnter;
            fullscreenBtn.title = "Vollbild aktivieren";
            document.body.classList.remove('is-fullscreen');
        }
    })
);

let isDeepSpaceUnlocked = false;

function unlockDeepSpaceMission() {
    if (isDeepSpaceUnlocked) return; 

    isDeepSpaceUnlocked = true;
    
    const controls = document.getElementById('deep-space-controls');
    if (controls) {
        controls.style.display = 'block';
        controls.scrollIntoView({ behavior: 'smooth' });
    }

    const toast = document.getElementById('info-toast-button');
    if (toast) {
        toast.textContent = "👽 EINGEHEND: Aliens haben Warpantrieb-Technologie geteilt!";
        toast.style.display = 'block';
        toast.style.backgroundColor = '#9900cc'; 
        toast.style.color = '#fff';
        
        setTimeout(() => { 
            toast.style.display = 'none'; 
            toast.style.backgroundColor = '#00ffff'; 
            toast.style.color = '#000';
        }, 6000);
    }
    
    console.log("Deep Space Mission durch Aliens freigeschaltet!");
}

init();

// ===========================================
// FEHLENDE HILFSFUNKTIONEN
// ===========================================

function spawnComet() {
    if (comet) {
        comet.destroy(); 
    }
    comet = new Comet(scene);
    cometSpawnTimer = THREE.MathUtils.randFloat(600, 1200); 
    
    if (!isRealScaleActive) {
        if (cometControls) cometControls.style.display = 'block';
        if (followCometBtn) followCometBtn.style.display = 'block';
    } else {
        if (cometControls) cometControls.dataset.wasVisible = 'true';
    }

    document.getElementById('comet-speed-checkbox').checked = false;
    cometTimeScale = 1.0;

    if (!isPlaying) togglePlay();
}

function createUFO() {
    if (ufoModelTemplate) {
        ufo = ufoModelTemplate.clone();
        
        const ufoTargetWidth = 1.5 * SCENE_SCALE;
        
        try {
            const box = new THREE.Box3().setFromObject(ufo);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = ufoTargetWidth / maxDim;
            ufo.scale.set(scaleFactor, scaleFactor, scaleFactor);
        } catch (e) {
            ufo.scale.set(1.0, 1.0, 1.0); 
            console.error("Konnte UFO-Grösse nicht automatisch anpassen:", e);
        }

    } else {
        console.warn("UFO-Modell nicht geladen, verwende Fallback-Geometrie.");
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
    }

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
    const potentialTargets = clickableObjects.filter(obj => {
        
        if (obj === ufo || obj.userData.isUFO || obj === ufoCurrentTargetObject) return false;

        if (obj === earth || obj === moon) return false;

        if (obj.userData && obj.userData.info) {
            if (obj.userData.info.parentName === 'Erde') return false;
            if (obj.userData.info.name && obj.userData.info.name.includes('Voyager')) return false;
            if (obj.userData.info.type === 'rocket') return false;
        }

        if (typeof moonSurfaceObjects !== 'undefined' && moonSurfaceObjects.includes(obj)) {
            return false;
        }

        if (obj.parent === moon) return false;

        return true;
    });

    if (potentialTargets.length > 0) {
        const randomIndex = Math.floor(Math.random() * potentialTargets.length);
        ufoCurrentTargetObject = potentialTargets[randomIndex];
    } else {
        ufoCurrentTargetObject = sun;
    }
}

function updateUFO(deltaTime) {
    if (ufoState === 'inactive') {

        if (ufoEncounterCount >= 3) {
            return; 
        }
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
        const offsetDistance = targetRadius * 1.3 + 4 * SCENE_SCALE; 
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
                currentSpeed = UFO_SPEED_TO_EARTH;
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
    document.getElementById('ufo-initial-buttons').style.display = 'flex';
    document.getElementById('ufo-close-group').style.display = 'none';

    document.getElementById('ufo-yes-btn').textContent = "Ja, dort lang! 👉";
    document.getElementById('ufo-no-btn').textContent = "Keine Ahnung 🤷‍♂️";
    document.getElementById('ufo-close-btn').textContent = "Kommunikation beenden";
    
    document.getElementById('ufo-alien-image').src = "ImagesGit/Alien/Alien_Nisu.webp";
}

function setupUfoDialogText() {
    const dialog = document.getElementById('ufo-dialog');
    const titleEl = dialog.querySelector('h3');
    const textEl = document.getElementById('ufo-dialog-text');
    const initialButtons = document.getElementById('ufo-initial-buttons');
    const closeGroup = document.getElementById('ufo-close-group');
    const closeBtn = document.getElementById('ufo-close-btn');

    if (ufoEncounterCount === 0) {
        titleEl.textContent = "🛸 Unbekanntes Flugobjekt";
        textEl.textContent = "Bist du in der Klasse von Herrn Lehmann? Wir sind auf dem Weg zur Erde, um Herrn Maurer zu entführen. Er hat wichtige Informationen über das Universum, die wir brauchen. Weisst du wo er ist?";
        
        initialButtons.style.display = 'flex';
        closeGroup.style.display = 'none';
        
    } else if (ufoEncounterCount === 1) {
        titleEl.textContent = "🛸 Signal [Priorität Rot]";
        textEl.textContent = "Wir sind es nochmal! Wir konnten Herrn Maurer nicht festnehmen, Er hatte einen Gehilfen namens Bursatsch oder so ähnlich. Wir hatten keine Chance gegen die Zwei 😡. Ausserdem sehen wir auf unserem Radar, dass ein feindliches Raumschiff auf dem Weg zur Erde ist, um diese zu zerstören. Sollen wir das Problem für euch beseitigen?";
        
        document.getElementById('ufo-yes-btn').textContent = "Ja, gerne! ☄️";
        document.getElementById('ufo-no-btn').textContent = "Nein, ist egal! 😟";

        initialButtons.style.display = 'flex';
        closeGroup.style.display = 'none';
        
    } else {
        titleEl.textContent = "🛸 [Übertragung gestört]";
        textEl.textContent = "Verbindung instabil... *kzzrt* ... Herr Maurer ist... *bzzzt* ... in Gewahrsam. Mission ... *krrk* ... erfolgreich. Danke für die ... *rausch* ... Kooperation. Als Dank, ... *krch* ... teilen wir unsere Technologie mit dir. Das Raumschiff ... *bzzz* ... ist jetzt euer Probl ... *Klick* ...";
        
        initialButtons.style.display = 'none';
        closeGroup.style.display = 'flex';
        closeBtn.textContent = "Verbindung verloren...";

        closeBtn.onclick = () => {
                document.getElementById('ufo-dialog').style.display = 'none';
                if (ufoEncounterCount === 2) {
                    unlockDeepSpaceMission();
                }
                ufoState = 'leaving';
                ufoDepartureTarget = null; 
                ufoLeaveTimer = 0; 
                ufoTargetPos.set( (Math.random() - 0.5) * 20000, (Math.random() - 0.5) * 20000, (Math.random() - 0.5) * 20000 );
                cameraFocus = ufo; 
                if (!isPlaying) togglePlay();
                
                ufoEncounterCount++; 
                resetUfoDialog(); 
        };
    }
}

function toggleRewind() {
    if (isRewinding) {
        stopRewind();
    } else {
        if (isDemoActive || isRealScaleActive) {
            return; 
        }
        
        isRewinding = true; 

        if (isPlaying) {
            isPlaying = false; 
            const playPauseBtn = document.getElementById('play-pause-btn');
            playPauseBtn.innerHTML = iconPlay;
            playPauseBtn.classList.remove('playing');
        }

        document.getElementById('rewind-btn').classList.add('playing'); 
    }
}

function stopRewind() {
    isRewinding = false;
    document.getElementById('rewind-btn').classList.remove('playing');
}

function togglePlay() {
    if (isRewinding) {
        stopRewind();
    }
    
    isPlaying = !isPlaying;
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.innerHTML = isPlaying ? iconPause : iconPlay;
    playPauseBtn.title = isPlaying ? "Pause" : "Abspielen";
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
    if (isRewinding) {
        stopRewind();
    }
}

function onSpeedSliderChange() {
    const slider = document.getElementById('speed-slider');
    const value = parseFloat(slider.value); 
    const minSpeed = 0.0000019013; 
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

    const daysPerSecondFactor = EARTH_YEAR_DAYS / 60.0; 
    const daysPerSecond = speed * daysPerSecondFactor;
    
    let labelText = "";
    if (daysPerSecond < (1/3600)) { 
        const hoursPerDay = (1.0 / daysPerSecond) / 3600.0;
            labelText = `~${hoursPerDay.toFixed(0)} Std. = 1 Tag`;
    } else if (daysPerSecond < (1/60)) { 
        const minutesPerDay = (1.0 / daysPerSecond) / 60.0;
        labelText = `~${minutesPerDay.toFixed(1)} Min. = 1 Tag`;
    } else if (daysPerSecond < 1.0) { 
        const secondsPerDay = 1.0 / daysPerSecond;
        labelText = `~${secondsPerDay.toFixed(1)} Sek. = 1 Tag`;
    } else { 
        labelText = `1 Sek. = ~${daysPerSecond.toFixed(1)} Tage`;
    }
    
    const labelEl = document.getElementById('speed-label');
    if (labelEl) {
        labelEl.textContent = labelText;
    }
}

function onDemoSpeedSliderChange() {
    const slider = document.getElementById('demo-speed-slider');
    const value = parseFloat(slider.value); 
    const minSpeed = 0.01; const normalSpeed = 0.1; const maxSpeed = 1.0;
    if (value <= 50) {
        demoLoopSpeed = minSpeed + (value / 50) * (normalSpeed - minSpeed);
    } else {
        demoLoopSpeed = normalSpeed + ((value - 50) / 50) * (maxSpeed - normalSpeed);
    }
    document.getElementById('demo-speed-label').textContent = demoLoopSpeed.toFixed(2) + 'x';
}

function startFrequencyDemo() {
    checkAndEndDemo(); 
    isFrequencyDemoActive = true;
    pauseSimulation();

    toggleOtherPlanets(false);
    earthOrbitLine.visible = false;
    moonOrbitLine.visible = true; 

    freqDemoControls.style.display = 'block';
    realRatioCheckbox.checked = false;
    document.getElementById('demo-control-buttons').style.display = 'flex'; 
    document.getElementById('demo-buttons').style.display = 'none'; 

    currentDay = 0;
    if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
    updatePositions(currentDay);
    document.getElementById('day-slider').value = currentDay;
    updateUI();

    applyFrequencyDemoScaling();

    controls.enabled = false;
    cameraFocus = 'eclipse_frequency_view';
    updateCamera(true); 
}

function applyFrequencyDemoScaling() {
    if (!isFrequencyDemoActive) return;

    if (realRatioCheckbox.checked) {
        sun.scale.set(realRatioSunScale, realRatioSunScale, realRatioSunScale);
        moon.scale.set(realRatioMoonScale, realRatioMoonScale, realRatioMoonScale);
    } else {
        sun.scale.set(freqDemoSunScale, freqDemoSunScale, freqDemoSunScale);
        moon.scale.copy(originalMoonScale); 
    }
}

function endFrequencyDemo() {
    isFrequencyDemoActive = false;

    freqDemoControls.style.display = 'none';
    document.getElementById('demo-control-buttons').style.display = 'none';
    document.getElementById('demo-buttons').style.display = 'flex';

    sun.scale.copy(originalSunScale);
    moon.scale.copy(originalMoonScale);

    toggleOtherPlanets(true);
    restoreOrbitLines();

    controls.enabled = true;
    setFocus(sun, 1.0);
}

function resetToRealMode() {
    isDemoActive = false;
    demoType = '';
    controls.enableZoom = true;
    if (!isRealScaleActive) {
        document.getElementById('demo-buttons').style.display = 'flex';
    }
    document.getElementById('demo-control-buttons').style.display = 'none';
    document.getElementById('demo-speed-control').style.display = 'none';
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
    checkAndEndDemo();
    
    pauseSimulation(); 
    resetToRealMode(); 
    isDemoActive = true;
    demoType = type;
    toggleOtherPlanets(false);    
    earthOrbitLine.visible = false; 
    moonOrbitLine.visible = false;  
    isPlaying = true; 
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.classList.add('playing'); 
    controls.enableZoom = true; 
    document.getElementById('demo-buttons').style.display = 'none'; 
    document.getElementById('demo-control-buttons').style.display = 'flex'; 
    document.getElementById('demo-speed-control').style.display = 'block'; 
    if (earthEclipticPlane) earthEclipticPlane.visible = false;
    if (moonEclipticPlane) moonEclipticPlane.visible = false;

    loaded3DModels.forEach(model => model.pivot.visible = false);
    
    
    if (type === 'sofi') {
        earthTiltPivot.rotation.z = EARTH_TILT_RAD;
        const demoDurationDays = 2; 
        currentDay = LUNAR_MONTH_DAYS * 0.0 - (demoDurationDays / 2); 
        demoLoopStartDay = currentDay;
        demoLoopEndDay = LUNAR_MONTH_DAYS * 0.0 + (demoDurationDays / 2); 
        earth.material.uniforms.uSofiDemoActive.value = true;
        earthDemoRotationOffset = 3.7 * Math.PI / 4; 
        moon.position.y = 0.3; 
    } else if (type === 'mofi') {
        earthTiltPivot.rotation.z = EARTH_TILT_RAD;
        
        const FULL_MOON_DAY = 29.53 / 2; 
        const demoDurationDays = 3.5; 
        
        currentDay = FULL_MOON_DAY - (demoDurationDays / 2); 
        demoLoopStartDay = currentDay;
        
        demoLoopEndDay = FULL_MOON_DAY + (demoDurationDays / 2); 
        
        moonPivot.position.y = MOON_RADIUS * 1.0; 
        originalMoonMaterial.uniforms.uDemoActive.value = true;
    }

    if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);

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
    resetActiveIndicators();
    
    resetToRealMode();
    toggleOtherPlanets(true);  
    restoreOrbitLines();       
    if (eclipticPlaneCheckbox) {
        const isChecked = eclipticPlaneCheckbox.checked;
        if (earthEclipticPlane) earthEclipticPlane.visible = isChecked;
        if (moonEclipticPlane) moonEclipticPlane.visible = isChecked;
    }

    if (humanObjectsCheckbox) {
        const isChecked = humanObjectsCheckbox.checked;
        loaded3DModels.forEach(model => model.pivot.visible = isChecked);
    }

    currentDay = 0; 
    if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
    const daySlider = document.getElementById('day-slider');
    daySlider.value = currentDay;
    moonPivot.position.y = 0; 
    earthDemoRotationOffset = 0.0; 
    moon.position.y = 0; 
    updatePositions(currentDay);
    updateUI();
}

function toggleRealScale() {
    pauseSimulation();
    
    resetActiveIndicators();
    
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
    scaleBtn.classList.add('btn-danger'); 
    
    document.getElementById('real-dist-btn').style.display = 'block';
    
    const planetButtons = document.getElementById('planet-focus-buttons');
    document.getElementById('real-scale-controls').prepend(planetButtons); 
    planetButtons.style.display = 'grid'; 
    planetButtons.style.marginTop = '0px'; 
    
    planetButtons.style.borderTop = 'none';
    planetButtons.style.paddingTop = '0px';

    document.getElementById('real-scale-sep1').style.display = 'none';
    document.getElementById('real-scale-sep2').style.display = 'none';

    document.getElementById('info-box').textContent = "MAẞSTAB: Kamera fliegt zur Position für Grössenvergleich...";

    setRealScaleUiVisibility(false);
    earthOrbitLine.visible = false;
    moonOrbitLine.visible = false;

    updateSpecialObjectsVisibility(false);
    if (earthEclipticPlane) earthEclipticPlane.visible = false;
    if (moonEclipticPlane) moonEclipticPlane.visible = false;
    loaded3DModels.forEach(model => model.pivot.visible = false);
    
    otherPlanetOrbits.forEach(o => o.visible = false);

    otherMoons.forEach(moonObj => { moonObj.mesh.visible = false; });
    
    otherPlanetControls.forEach(ctrl => { ctrl.orbit.visible = true; });
    

    const ghostGeo = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.3 });
    sunGhost = new THREE.Mesh(ghostGeo, ghostMat);
    scene.add(sunGhost);

    sun.userData.originalScale = sun.scale.clone();
    moon.userData.originalScale = moon.scale.clone();
    earthTiltPivot.userData.originalPosition = earthTiltPivot.position.clone();
    camera.userData.originalFar = camera.far;

    camera.far = 5000000; 
    camera.updateProjectionMatrix();
    controls.maxDistance = 5000000;

    targetSunScale = 1.0; 
    targetEarthDistance = COMPARE_EARTH_DIST_VALUE;
    
    earthTiltPivot.position.set(targetEarthDistance, 0, 0);
    currentEarthDistance = targetEarthDistance;

    const planetCount = otherPlanetControls.length;
    otherPlanetControls.forEach((ctrl, index) => {
        const angle = Math.PI/3 + (index / (planetCount-1)) * (Math.PI * 4/3);
        
        const dist = COMPARE_EARTH_DIST_VALUE;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        ctrl.container.position.set(x, 0, z);
        ctrl.tiltPivot.rotation.z = 0; 
    });

    const finalSunRadius = REAL_SUN_SCALE_FACTOR * SUN_RADIUS;
    const fovInRad = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeightNeeded = (finalSunRadius * 2) / 0.8;
    const requiredDist = (visibleHeightNeeded / 2) / Math.tan(fovInRad / 2);

    let earthPos = new THREE.Vector3(targetEarthDistance, 0, 0);
    let sunToEarthDir = earthPos.clone().normalize();
    let camTargetPos = sunToEarthDir.multiplyScalar(requiredDist); 
    let camTargetTarget = new THREE.Vector3(0,0,0); 

    flyTo(camTargetPos, camTargetTarget, 2.0, null, () => {
        realityCheckPhase = 'growing';
        targetSunScale = REAL_SUN_SCALE_FACTOR;
        document.getElementById('info-box').textContent = "MAẞSTAB: Sonne wächst auf reale Grösse...";
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
    
    document.getElementById('real-dist-btn').style.display = 'none';
    const distBtn = document.getElementById('real-dist-btn');
    distBtn.textContent = "🚀 Reale Distanz";
    distBtn.classList.remove('btn-warning');
    distBtn.classList.add('btn-secondary');
    
    if (sunGhost) { scene.remove(sunGhost); sunGhost.geometry.dispose(); sunGhost.material.dispose(); sunGhost = null; }
    if (rulerGroup) { scene.remove(rulerGroup); rulerGroup = null; } 
    if (distanceLabelEl) {
            distanceLabelEl.style.display = 'none';
    }

    const planetButtons = document.getElementById('planet-focus-buttons');
    const cameraGroup = document.querySelectorAll('#ui-scrollable-content .control-group')[1]; 
    const moonContainer = document.getElementById('moon-focus-container');
    
    cameraGroup.insertBefore(planetButtons, moonContainer); 
    
    planetButtons.style.display = document.getElementById('planets-visible-checkbox').checked ? 'grid' : 'none';
    planetButtons.style.marginTop = '10px'; 
    
    planetButtons.style.borderTop = '1px solid #444';
    planetButtons.style.paddingTop = '10px';


    document.getElementById('real-scale-sep1').style.display = 'none';
    document.getElementById('real-scale-sep2').style.display = 'none';

    setRealScaleUiVisibility(true);
    
    const planetsShouldBeVisible = document.getElementById('planets-visible-checkbox').checked;
    otherPlanetControls.forEach(ctrl => { ctrl.orbit.visible = planetsShouldBeVisible; });
    
    const orbitCheckbox = document.getElementById('orbit-checkbox');
    earthOrbitLine.visible = orbitCheckbox.checked;
    moonOrbitLine.visible = orbitCheckbox.checked;
    if (eclipticPlaneCheckbox) {
        const isChecked = eclipticPlaneCheckbox.checked;
        if (earthEclipticPlane) earthEclipticPlane.visible = isChecked;
        if (moonEclipticPlane) moonEclipticPlane.visible = isChecked;
    }

    updateSpecialObjectsVisibility(true);
    
    otherPlanetOrbits.forEach(o => o.visible = document.getElementById('planets-orbit-checkbox').checked);

    otherMoons.forEach(moonObj => { moonObj.mesh.visible = true; });

    otherPlanetControls.forEach((ctrl, index) => {
        const data = planetsData[index];
        ctrl.tiltPivot.rotation.z = (data.axialTilt * Math.PI) / 180;
    });

    earthTiltPivot.visible = true;
    if (sun.userData.originalScale) sun.scale.copy(sun.userData.originalScale);
    currentSunScale = 1.0;
    currentEarthDistance = EARTH_DISTANCE;
    currentMoonDistance = MOON_DISTANCE;

    setTimeout(() => {
        if (!isRealScaleActive) {
                camera.far = 20000; 
                camera.updateProjectionMatrix();
                controls.maxDistance = 7000;
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

    const eclipticPlaneLabel = document.getElementById('ecliptic-plane-checkbox');
    if (eclipticPlaneLabel) {
        eclipticPlaneLabel.parentElement.style.display = flexStyle;
    }
    
    if (humanObjectsCheckbox) {
        humanObjectsCheckbox.parentElement.style.display = flexStyle;
    }

    const astCheckbox = document.getElementById('asteroids-checkbox');
    if (astCheckbox) astCheckbox.parentElement.style.display = flexStyle;
    
    const humanObjectsBtnContainer = document.getElementById('human-objects-focus-buttons');
    if (humanObjectsBtnContainer) {
        if (visible) {
            humanObjectsBtnContainer.style.display = humanObjectsCheckbox.checked ? 'flex' : 'none';
        } else {
            humanObjectsBtnContainer.style.display = 'none';
        }
    }

    const rocketCtrl = document.getElementById('rocket-controls');
    if (rocketCtrl) {
        if (!visible) {
            rocketCtrl.style.display = 'none';
        } else {
            if (rocketSpawnAllowed || rocketInstance) {
                rocketCtrl.style.display = 'block';
            }
        }
    }

    document.getElementById('focus-ecliptic').style.display = displayStyle;
    
    document.getElementById('orbit-checkbox').parentElement.style.display = flexStyle;
    document.getElementById('planets-visible-checkbox').parentElement.parentElement.style.display = flexStyle; 
    document.getElementById('demo-buttons').style.display = flexStyle;
    document.getElementById('moon-phases-group').style.display = displayStyle;
    document.getElementById('play-group').style.display = flexStyle;
    
    document.getElementById('time-controls').style.display = displayStyle;
    
    document.getElementById('seasons-group').style.display = displayStyle;
    
    
    if (!visible) {
            if (cometControls.style.display !== 'none') {
                cometControls.dataset.wasVisible = 'true';
            }
            cometControls.style.display = 'none';
    } else {
            if (cometControls.dataset.wasVisible === 'true') {
                cometControls.style.display = 'block';
            }
    }
}

function updateDynamicLabel(km) {
    if (!distanceLabelEl) return;

    distanceLabelEl.textContent = Math.round(km / 1000000).toLocaleString('de-DE') + " Mio. km";

    let earthPos = new THREE.Vector3();
    earthTiltPivot.getWorldPosition(earthPos);

    earthPos.y += 15 * SCENE_SCALE;

    earthPos.project(camera);

    if (earthPos.z > 1) {
        distanceLabelEl.style.display = 'none';
        return;
    }

    const x = (earthPos.x * .5 + .5) * window.innerWidth;
    const y = (earthPos.y * -.5 + .5) * window.innerHeight;

    distanceLabelEl.style.display = 'block';
    distanceLabelEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
}

function createGrid() {
        if (rulerGroup) scene.remove(rulerGroup);
        rulerGroup = new THREE.Group();
        
        const gridColor = 0xaaaaaa; 
        const material = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.8 });
        const points = [];

        const startX = COMPARE_EARTH_DIST_VALUE * 0.5;
        const endX = REAL_EARTH_DIST_VALUE * 1.05;
        const widthZ = 200 * SCENE_SCALE; 
        const yPos = -30 * SCENE_SCALE;
        const step = 50 * SCENE_SCALE; 

        for (let z = -widthZ; z <= widthZ; z += step) {
            points.push(new THREE.Vector3(startX, yPos, z));
            points.push(new THREE.Vector3(endX, yPos, z));
        }

        for (let x = startX; x <= endX; x += step) {
            points.push(new THREE.Vector3(x, yPos, -widthZ));
            points.push(new THREE.Vector3(x, yPos, widthZ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const grid = new THREE.LineSegments(geometry, material);
        rulerGroup.add(grid);

        scene.add(rulerGroup);
}

function toggleRealDistance() {
    pauseSimulation();
    resetActiveIndicators();
    
    isRealDistanceActive = !isRealDistanceActive;
    updateSpecialObjectsVisibility(!isRealDistanceActive);
    const distBtn = document.getElementById('real-dist-btn');
    const planetButtons = document.getElementById('planet-focus-buttons'); 
    
    flightStartState.progress = 0;
    if (isRealDistanceActive) {
            flightStartState.duration = 10.0;
    } else {
            flightStartState.duration = 3.0;
    }
    flightStartState.startDist = currentEarthDistance;
    flightStartState.startMoonDist = currentMoonDistance; 

    if (isRealDistanceActive) {
        targetEarthDistance = REAL_EARTH_DIST_VALUE;
        targetMoonDistance = REAL_MOON_DIST_VALUE;
        document.getElementById('info-box').textContent = "DISTANZ: Flug in die reale Leere...";
        realityCheckPhase = 'flying_out';
        controls.enabled = false;
        
        distBtn.textContent = "☀️ Zurück zur Sonne";
        distBtn.classList.remove('btn-secondary');
        distBtn.classList.add('btn-warning');
        
        planetButtons.style.display = 'none';

        document.getElementById('moon-phases-group').style.display = 'block';

        createGrid(); 
        rulerFadeTimer = 0;

    } else {
        targetEarthDistance = COMPARE_EARTH_DIST_VALUE;
        targetMoonDistance = MOON_DISTANCE;
        document.getElementById('info-box').textContent = "DISTANZ: Rückflug zur Aufstellung...";
        realityCheckPhase = 'flying_in';
        controls.enabled = false;
        
        distBtn.textContent = "🚀 Reale Distanz";
        distBtn.classList.remove('btn-warning');
        distBtn.classList.add('btn-secondary');
        document.getElementById('moon-phases-group').style.display = 'none';

        if (rulerGroup) {
            scene.remove(rulerGroup);
            rulerGroup = null;
        }
    }
}

function jumpToPhase(index) {
    pauseSimulation(); 
    resetToRealMode(); 
    
    if (isFrequencyDemoActive) endFrequencyDemo();
    
    resetActiveIndicators();
    
    if (!isRealScaleActive) {
        restoreOrbitLines();
    }
    toggleOtherPlanets(false);
    
    earthDemoRotationOffset = 0.0; 
    moonPivot.position.y = 0; 
    moon.position.y = 0;
    currentDay = PHASE_DAY_MAP[index];
    if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
    
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

function restoreOrbitLines() {
    const isChecked = document.getElementById('orbit-checkbox').checked;
    earthOrbitLine.visible = isChecked;
    moonOrbitLine.visible = isChecked;
}

function updateSpecialObjectsVisibility(modeAllowsVisibility) {
    
    const astCb = document.getElementById('asteroids-checkbox');
    if (asteroidInstancedMesh) {
        const isChecked = astCb ? astCb.checked : true;
        asteroidInstancedMesh.visible = modeAllowsVisibility && isChecked;
    }

    const humanCb = document.getElementById('human-objects-checkbox');
    const humanBtns = document.getElementById('human-objects-focus-buttons');
    
    const humanChecked = humanCb ? humanCb.checked : false;
    const shouldShowHuman = modeAllowsVisibility && humanChecked;

    loaded3DModels.forEach(model => {
        model.pivot.visible = shouldShowHuman;
    });

    if (humanBtns) {
        humanBtns.style.display = shouldShowHuman ? 'flex' : 'none';
    }
    if (moonSurfaceObjects.length > 0) {
        moonSurfaceObjects.forEach(obj => {
            obj.visible = modeAllowsVisibility && hasMoonMissionLanded;
        });
    }
}

function toggleOtherPlanets(visible) {
    const planetsShouldBeVisible = visible && document.getElementById('planets-visible-checkbox').checked;
    const orbitsShouldBeVisible = visible && document.getElementById('planets-orbit-checkbox').checked && !isRealScaleActive;

    otherPlanetControls.forEach(ctrl => { 
        ctrl.orbit.visible = planetsShouldBeVisible; 
    });

    otherPlanetOrbits.forEach(orbit => { 
        orbit.visible = orbitsShouldBeVisible; 
    });
    
    otherMoons.forEach(moonObj => { 
        moonObj.mesh.visible = planetsShouldBeVisible; 
    });
    updateSpecialObjectsVisibility(visible);
}

function jumpToSeason(day, clickedBtn) {
    checkAndEndDemo(); 
    if (isRealScaleActive) {
        deactivateRealScale(); 
    }
    pauseSimulation();

    restoreOrbitLines(); 

    resetActiveIndicators();

    currentDay = day;
    if (currentDayLabelEl) currentDayLabelEl.textContent = formatDayCount(currentDay);
    const daySlider = document.getElementById('day-slider');
    daySlider.value = currentDay;

    updatePositions(currentDay);
    updateUI();
    
    toggleOtherPlanets(false); 

    if (clickedBtn) clickedBtn.classList.add('active');
    if (earthAxisLine) earthAxisLine.visible = true;

    let earthPos = new THREE.Vector3();
    earth.getWorldPosition(earthPos);
    const radius = EARTH_RADIUS;
    const fovInRad = THREE.MathUtils.degToRad(camera.fov);
    const distance = (radius / 0.3) / Math.tan(fovInRad / 2); 
    
    const offsetDir = new THREE.Vector3(0, 0, 0).sub(earthPos).normalize();
    offsetDir.y = 0.5; 
    offsetDir.normalize(); 
    const offset = offsetDir.multiplyScalar(distance);
    const endPos = earthPos.clone().add(offset);
    
    flyTo(endPos, earthPos, 1.5, earth); 
}

function toggleFlatEarthMode() {
    if (flatAnimPhase !== 'idle') return;

    if (!isFlatEarth) {
        if (isPlaying) pauseSimulation();

        const earthPos = new THREE.Vector3();
        earth.getWorldPosition(earthPos);
        
        const sunPos = new THREE.Vector3(0,0,0);
        const dirToSun = new THREE.Vector3().subVectors(sunPos, earthPos).normalize();
        
        const sideDir = new THREE.Vector3(-dirToSun.z, 0, dirToSun.x).normalize();
        
        const camPos = earthPos.clone().add(sideDir.multiplyScalar(EARTH_RADIUS * 5));
        
        const onArrival = () => {
            flatAnimPhase = 'anticipation'; 
            flatAnimTimer = 0;
        };

        flyTo(camPos, earthPos, 1.5, null, onArrival); 
        
    } else {
        flatAnimPhase = 'restoring';
        flatAnimTimer = 0;
        if (infoToastButton) {
            infoToastButton.textContent = "Puh... Physik wiederhergestellt.";
            infoToastButton.style.display = 'block';
            setTimeout(() => infoToastButton.style.display = 'none', 3000);
        }
    }
}

function checkAndEndDemo() {
    if (isDemoActive) {
        endDemo();
    }
    if (isFrequencyDemoActive) {
        endFrequencyDemo();
    }
}

// ===========================================
// KAMERA & GALERIE FUNKTIONEN
// ===========================================

const cameraModeBtn = document.getElementById('camera-mode-btn');
const cameraOverlay = document.getElementById('camera-overlay');
const closeCameraBtn = document.getElementById('close-camera-btn');
const shutterBtn = document.getElementById('shutter-btn');
const camIsoSlider = document.getElementById('cam-iso');
const camZoomSlider = document.getElementById('cam-zoom');
const cameraFlash = document.getElementById('camera-flash');

const galleryOverlay = document.getElementById('gallery-overlay');
const openGalleryBtn = document.getElementById('open-gallery-btn');
const closeGalleryBtn = document.getElementById('close-gallery-btn');
const galleryGrid = document.getElementById('gallery-grid');
const galleryBadge = document.getElementById('gallery-badge');

let isPhotoMode = false;
let photoCount = 0;
let storedPhotos = [];
let defaultToneMappingExposure = 1.5;
let defaultFov = 60;

function toggleCameraMode() {
    isPhotoMode = !isPhotoMode;
    const uiContainer = document.getElementById('ui-container');
    const debugPanel = document.getElementById('debug-panel');
    const movableControls = document.getElementById('movable-controls');
    
    const camBtn = document.getElementById('camera-mode-btn'); 
    const fsBtn = document.getElementById('fullscreen-btn'); 

    if (isPhotoMode) {
        cameraOverlay.style.display = 'block';
        
        if(camBtn) camBtn.style.display = 'none'; 
        if(fsBtn) fsBtn.style.display = 'none'; 

        uiContainer.style.display = 'none'; 
        if(debugPanel) debugPanel.style.display = 'none';
        if(movableControls) movableControls.style.display = 'none';
        
        defaultToneMappingExposure = renderer.toneMappingExposure;
        defaultFov = camera.fov;
        camIsoSlider.value = defaultToneMappingExposure;
        camZoomSlider.value = 33; 
        camZoomSlider.dispatchEvent(new Event('input'));
        
    } else {
        cameraOverlay.style.display = 'none';
        
        if(camBtn) camBtn.style.display = 'flex'; 
        if(fsBtn) fsBtn.style.display = 'flex'; 

        uiContainer.style.display = 'flex';
        
        // Movable controls nur einblenden wenn nÃ¶tig (Check fehlt hier, aber ok fÃ¼r Index)
        
        renderer.toneMappingExposure = defaultToneMappingExposure;
        camera.fov = defaultFov;
        camera.updateProjectionMatrix();
        
        if(blackHoleUniforms) {
            blackHoleUniforms.uFovScale.value = 60.0 / defaultFov;
        }
    }
}

camIsoSlider.addEventListener('input', (e) => {
    renderer.toneMappingExposure = parseFloat(e.target.value);
});

camZoomSlider.addEventListener('input', (e) => {
    const zoomPercent = parseFloat(e.target.value); 
    const maxFov = 90; 
    const minFov = 1; 
    const newFov = maxFov - ((zoomPercent / 100) * (maxFov - minFov));

    camera.fov = newFov;
    camera.updateProjectionMatrix();
    
    if(blackHoleUniforms) {
        blackHoleUniforms.uFovScale.value = 60.0 / newFov;
    }
});

shutterBtn.addEventListener('click', takePhoto);

function takePhoto() {
    cameraOverlay.style.display = 'none';
    
    if (composer && usePostProcessing) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }

    const dataURL = renderer.domElement.toDataURL('image/png');

    cameraFlash.style.opacity = 0.8;
    setTimeout(() => { cameraFlash.style.opacity = 0; }, 100);

    cameraOverlay.style.display = 'block';
    savePhotoToGallery(dataURL);
}

function savePhotoToGallery(dataURL) {
    const timestamp = new Date().toLocaleTimeString();
    const photoObj = { id: Date.now(), url: dataURL, time: timestamp };
    storedPhotos.unshift(photoObj);
    photoCount++;

    galleryBadge.style.display = 'flex';
    galleryBadge.textContent = photoCount;

    const btn = shutterBtn;
    const oldBorder = btn.style.borderColor;
    btn.style.borderColor = '#00ff00';
    setTimeout(() => btn.style.borderColor = oldBorder, 300);

    refreshGallery();
}

function refreshGallery() {
    galleryGrid.innerHTML = '';
    
    if (storedPhotos.length === 0) {
        galleryGrid.innerHTML = '<p style="color: #aaa; grid-column: 1/-1; text-align: center;">Keine Fotos vorhanden.</p>';
        return;
    }

    storedPhotos.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <img src="${photo.url}" alt="Foto" onclick="openLightbox('${photo.url}')">
            <div class="gallery-actions">
                <span style="font-size: 10px; color: #aaa; align-self: center;">${photo.time}</span>
                <div>
                    <a href="${photo.url}" download="space_foto_${photo.id}.png" class="gallery-btn" style="text-decoration: none; display:inline-block; font-size: 16px;">&#128190;</a>
                    
                    <button class="gallery-btn" onclick="deletePhoto(${photo.id})" style="font-size: 16px;">&#10060;</button>
                </div>
            </div>
        `;
        galleryGrid.appendChild(div);
    });
}

window.deletePhoto = function(id) {
    storedPhotos = storedPhotos.filter(p => p.id !== id);
    refreshGallery();
};

function deleteAllPhotos() {
    if (storedPhotos.length === 0) return; 
    
    const confirmDelete = confirm("Möchtest du wirklich ALLE Fotos unwiderruflich löschen?");
    
    if (confirmDelete) {
        storedPhotos = [];
        photoCount = 0;
        
        if (galleryBadge) {
            galleryBadge.style.display = 'none';
            galleryBadge.textContent = '0';
        }
        
        refreshGallery();
    }
}

const deleteAllBtn = document.getElementById('delete-all-btn');
if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', deleteAllPhotos);
}

if(cameraModeBtn) cameraModeBtn.addEventListener('click', toggleCameraMode);
closeCameraBtn.addEventListener('click', toggleCameraMode);

openGalleryBtn.addEventListener('click', () => {
    galleryOverlay.style.display = 'flex';
    galleryBadge.style.display = 'none';
    photoCount = 0;
});

closeGalleryBtn.addEventListener('click', () => {
    galleryOverlay.style.display = 'none';
});

// --- LIGHTBOX ---
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

window.openLightbox = function(url) {
    lightboxImg.src = url;
    lightboxOverlay.style.display = 'flex';
};

function closeLightbox() {
    lightboxOverlay.style.display = 'none';
    lightboxImg.src = '';
}

if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

if(lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) {
            closeLightbox();
        }
    });
}
