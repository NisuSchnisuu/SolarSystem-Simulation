// ===========================================
// HILFSFUNKTIONEN & SZENEN-SETUP
// ===========================================

// --- Speicherbereinigung ---
function disposeObject(object) {
    if (!object) return;
    
    object.traverse((child) => {
        if (child.isMesh) {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (mat.map) mat.map.dispose();     
                        mat.dispose();                      
                    });
                } else {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            }
        }
    });
}

// --- Text-Formatierung ---
function formatDayCount(day) {
    const sign = day < 0 ? "-" : "";
    const absDay = Math.abs(day);
    
    const years = Math.trunc(absDay / EARTH_YEAR_DAYS);
    const remainingDays = absDay % EARTH_YEAR_DAYS;
    const daysFixed = remainingDays.toFixed(1);
    const dayPlural = (parseFloat(daysFixed) === 1.0) ? "Tag" : "Tage";

    if (years === 0) {
        return `${sign}${daysFixed} ${dayPlural}`;
    } else {
        const yearPlural = (years === 1) ? "Jahr" : "Jahre";
        return `${sign}${years} ${yearPlural} ${daysFixed} ${dayPlural}`;
    }
}

// --- Partikel Textur ---
function createParticleTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    
    const g = ctx.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0, 'rgba(255,255,255,1)'); 
    g.addColorStop(0.3, 'rgba(255,255,255,0.9)'); 
    g.addColorStop(0.6, 'rgba(255,255,255,0.3)'); 
    g.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = g; ctx.fillRect(0,0,32,32);
    return new THREE.CanvasTexture(canvas);
}

// --- Sternenhimmel ---
function createStarfield() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    for(let i=0; i<3000; i++) pos.push((Math.random()-0.5)*5000, (Math.random()-0.5)*5000, (Math.random()-0.5)*5000);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({size: 2, color: 0xffffff, transparent: true, opacity: 0.6});
    scene.add(new THREE.Points(geo, mat));
}

// --- Skybox ---
function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('ImagesGit/Scenery/8k_stars_milky_way.webp');
    const geometry = new THREE.SphereGeometry(5000, 32, 32); 
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    starField = new THREE.Mesh(geometry, material);
    scene.add(starField);
}

// --- Orbits ---
function createOrbits() {
    const createEllipticalOrbitLine = (a, e, perihelionAngle, color, segments = 1024) => {
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

    const createCircleOrbit = (radius, color, segments = 512) => {
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
    
    // Ekliptik-Flächen
    const earthPlaneGeo = new THREE.CircleGeometry(EARTH_DISTANCE, 512);
    earthPlaneGeo.rotateX(-Math.PI / 2); 
    const earthPlaneMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff, 
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    earthEclipticPlane = new THREE.Mesh(earthPlaneGeo, earthPlaneMat);
    earthEclipticPlane.visible = false; 
    scene.add(earthEclipticPlane);

    const moonPlaneGeo = new THREE.CircleGeometry(MOON_DISTANCE, 256);
    moonPlaneGeo.rotateX(-Math.PI / 2); 
    const moonPlaneMat = new THREE.MeshBasicMaterial({
        color: 0xffff99, 
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    moonEclipticPlane = new THREE.Mesh(moonPlaneGeo, moonPlaneMat);
    moonEclipticPlane.rotation.x = MOON_TILT_RAD; 
    moonEclipticPlane.visible = false; 
    scene.add(moonEclipticPlane);
}

// --- Asteroidengürtel ---
function createAsteroidBelt() {
    const asteroidCount = 4000; 
    const startDist = 550 * SCENE_SCALE; 
    const endDist = 650 * SCENE_SCALE;   
    
    const geometry = new THREE.DodecahedronGeometry(1.2 * SCENE_SCALE, 0); 
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x666666, 
        roughness: 0.9, 
        metalness: 0.1 
    });

    asteroidInstancedMesh = new THREE.InstancedMesh(geometry, material, asteroidCount);
    
    const dummy = new THREE.Object3D();
    const asteroidData = []; 

    for (let i = 0; i < asteroidCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = THREE.MathUtils.randFloat(startDist, endDist);
        const heightSpread = THREE.MathUtils.randFloatSpread(40 * SCENE_SCALE); 

        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = heightSpread;

        dummy.position.set(x, y, z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const scale = THREE.MathUtils.randFloat(0.5, 1.5);
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        asteroidInstancedMesh.setMatrixAt(i, dummy.matrix);

        asteroidData.push({
            startAngle: angle,
            distance: distance,
            y: y,
            speed: (0.05 / (distance / (100 * SCENE_SCALE))) 
        });
    }

    asteroidInstancedMesh.userData.asteroids = asteroidData;
    scene.add(asteroidInstancedMesh);
    console.log("Asteroidengürtel erstellt!");
}

// --- Flagge, Lander & Astronaut ---
function plantFlagOnMoon() {
    if (isFlagOnMoon) return;
    if (!moon) return;

    const moonRadius = MOON_RADIUS; 
    
    // 1. FLAGGE
    if (flagTemplate) {
        const flagGroup = flagTemplate.clone();
        applySurfaceShader(flagGroup);
        flagGroup.position.set(moonRadius, 0, 0); 
        flagGroup.rotation.z = Math.PI / 2; 
        flagGroup.rotation.y = Math.PI; 
        flagGroup.visible = false;
        moon.add(flagGroup);
        moonSurfaceObjects.push(flagGroup);
    } else {
        console.warn("Flaggen-Modell noch nicht geladen!");
    }

    // 2. ASTRONAUT
    if (astronautTemplate) {
        const astro = astronautTemplate.clone();
        const astroScale = 0.01 * SCENE_SCALE; 
        astro.scale.set(astroScale, astroScale, astroScale);
        astro.position.set(moonRadius, 0, 0.1 * SCENE_SCALE); 
        astro.rotation.z = Math.PI / 2; 
        astro.rotation.y = Math.PI; 

        const northAmount = 0.03;  
        const eastAmount = -0.03;   
        astro.position.set(1.0, northAmount, eastAmount);

        astro.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone(); 
                child.material.metalness = 0.8;          
                child.material.roughness = 0.8;          
            }
        });
        
        astro.position.normalize().multiplyScalar(moonRadius);
        astro.visible = false;
        applySurfaceShader(astro);
        moon.add(astro);
        moonSurfaceObjects.push(astro);
    } 

    // 3. LANDER
    if (landerTemplate) {
        const lander = landerTemplate.clone();
        const landerScale = 0.00025 * SCENE_SCALE;
        lander.scale.set(landerScale, landerScale, landerScale);
        
        const heightCorrection = 0.0082 * SCENE_SCALE;
        lander.position.set(moonRadius - heightCorrection, 0, -0.08 * SCENE_SCALE);
        
        lander.rotation.z = -Math.PI / 2.0; 
        lander.rotation.y = Math.PI / 0.492;
        
        lander.traverse((child) => {
            if (child.isMesh) {
                const isShadow = child.name.toLowerCase().includes('shadow') || child.name.toLowerCase().includes('plane');

                if (isShadow) {
                    child.material = new THREE.MeshBasicMaterial({
                        map: child.material.map, 
                        transparent: true,
                        opacity: 0.8, 
                        color: 0x000000 
                    });
                    child.userData.ignoreShader = true; 
                } else {
                    child.material = child.material.clone(); 
                    child.material.metalness = 0.3; 
                    child.material.roughness = 0.7;
                    child.material.emissive.setHex(0x151515);
                }
            }
        });
        
        lander.visible = false; 
        applySurfaceShader(lander);
        moon.add(lander);
        moonSurfaceObjects.push(lander);

        addFillLight(lander, 1.2, 40, new THREE.Vector3(0, 180.0, -80.0), 0.0);
    }

    isFlagOnMoon = true;
    console.log("Die Flagge, der Astronaut und der Lander stehen! 🇺🇸👨‍🚀🚀");
}

let surfaceObjectsMaterials = [];

function applySurfaceShader(object3D) {
    object3D.traverse((child) => {
        if (child.userData.ignoreShader) return;
        
        if (child.isMesh && child.material) {
            
            if (surfaceObjectsMaterials.includes(child.material)) {
                return;
            }

            child.material.userData.shader = null;

            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.uSunPosition = { value: new THREE.Vector3(0, 0, 0) };
                shader.uniforms.uMoonCenter = { value: new THREE.Vector3(0, 0, 0) };
                shader.uniforms.uNightBrightness = { value: 0.04 }; 

                child.material.userData.shader = shader;

                shader.vertexShader = `
                    varying vec3 vWorldPositionCustom;
                ` + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    `
                    #include <worldpos_vertex>
                    vWorldPositionCustom = (modelMatrix * vec4(transformed, 1.0)).xyz;
                    `
                );

                shader.fragmentShader = `
                    uniform vec3 uSunPosition;
                    uniform vec3 uMoonCenter;
                    uniform float uNightBrightness;
                    varying vec3 vWorldPositionCustom;
                ` + shader.fragmentShader;

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <dithering_fragment>',
                    `
                    #include <dithering_fragment>
                    vec3 surfaceUp = normalize(vWorldPositionCustom - uMoonCenter);
                    vec3 sunDir = normalize(uSunPosition - vWorldPositionCustom);
                    float globalDayFactor = dot(surfaceUp, sunDir);
                    float isDaySide = smoothstep(-0.2, 0.2, globalDayFactor);
                    float finalBrightness = mix(uNightBrightness, 1.0, isDaySide);
                    gl_FragColor.rgb *= finalBrightness;
                    `
                );
            };
            surfaceObjectsMaterials.push(child.material);
        }
    });
}

// --- HUD & UI Helfer ---
function updateLaunchHUD(isVisible, title, subtext, icon, progressPercent) {
    const hud = document.getElementById('launch-hud');
    if (!hud) return;

    if (!isVisible) {
        hud.classList.remove('hud-visible');
        hud.style.display = 'none';
        return;
    }

    hud.style.display = 'flex'; 
    hud.classList.add('hud-visible');

    if (title) document.getElementById('hud-title').textContent = title;
    if (subtext) document.getElementById('hud-sub').textContent = subtext;
    if (icon) document.getElementById('hud-icon').textContent = icon;
    
    const bar = document.getElementById('hud-bar');
    if (bar && progressPercent !== undefined) {
        bar.style.width = progressPercent + '%';
    }
}

function resetActiveIndicators() {
    if (earthAxisLine) earthAxisLine.visible = false;
    moonPhaseButtons.forEach(btn => btn.classList.remove('active'));

    const groups = [
        document.getElementById('focus-system').parentElement, 
        document.getElementById('planet-focus-buttons'),      
        document.getElementById('moon-focus-container'),    
        document.getElementById('seasons-group').querySelector('.btn-group'), 
        document.getElementById('human-objects-focus-buttons')
    ];
    
    try {
        groups.forEach(group => {
            if (group) {
                group.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            }
        });
    } catch (e) {
        console.warn("Fehler beim Zurücksetzen der Indikatoren:", e);
    }
}

// --- Sonnensystem Erstellung ---
function createSolarSystem() {
    const textureLoader = new THREE.TextureLoader(loadingManager);

    const sunTexture = textureLoader.load('ImagesGit/Objects/8k_sun.webp');
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
            dayTexture: { value: textureLoader.load('ImagesGit/Objects/earth_day.webp') },
            nightTexture: { value: textureLoader.load('ImagesGit/Objects/2k_earth_nightmap.webp') },
            uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uObjectWorldPosition: { value: new THREE.Vector3() }, uNightBrightness: { value: 0.3 },
            uSofiDemoActive: { value: false }, uMoonPosition: { value: new THREE.Vector3() }, uMoonRadius: { value: MOON_RADIUS }, uSunRadius: { value: SUN_RADIUS }, 

            uHasNightTexture: { value: true }
        }
    });
    earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 32, 32), earthMaterial);
    
    
    earth.userData.info = {
        name: 'Erde', earthCompareRadius: '1x Erde', radius_km: '6.371', distance_Mio_km: '149,6 Mio. km',
        planetType_de: 'Innerer Gesteinsplanet',
        umlaufzeit: '365,25 Tage', taglaenge: '23h 56min', temperatur: 'ca. +15°C',
        funFacts: [ 'Die Erde ist der einzige bekannte Planet mit flüssigem Wasser an der Oberfläche.', 'Unsere Atmosphäre schützt uns vor schädlicher Sonnenstrahlung und Meteoriten.']
    };
    clickableObjects.push(earth); 
    earthTiltPivot.add(earth); 
    
    //  Achsenlinie erstellen 
    const axisMat = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 }); 
    const axisPoints = [
        new THREE.Vector3(0, -EARTH_RADIUS * 1.5, 0),
        new THREE.Vector3(0, EARTH_RADIUS * 1.5, 0)
    ];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
    earthAxisLine = new THREE.Line(axisGeo, axisMat);
    earthAxisLine.visible = false; 
    earthTiltPivot.add(earthAxisLine); 
    

    //  Äquatorlinie erstellen 
    const equatorRadius = EARTH_RADIUS * 1.01; 
    const equatorPoints = [];
    const equatorSegments = 64;
    for (let i = 0; i <= equatorSegments; i++) {
        const angle = (i / equatorSegments) * Math.PI * 2;
        equatorPoints.push(new THREE.Vector3(Math.cos(angle) * equatorRadius, 0, Math.sin(angle) * equatorRadius)); 
    }
    const equatorGeo = new THREE.BufferGeometry().setFromPoints(equatorPoints);
    const equatorMat = new THREE.LineBasicMaterial({ color: 0xff0000 }); 
    earthEquatorLine = new THREE.Line(equatorGeo, equatorMat);
    earthEquatorLine.visible = false; 
    earthTiltPivot.add(earthEquatorLine); 
    

    moonPivot = new THREE.Group();
    moonPivot.rotation.x = MOON_TILT_RAD; 
    scene.add(moonPivot); 

    originalMoonMaterial = new THREE.ShaderMaterial({
        vertexShader: moonVertexShader, fragmentShader: moonFragmentShader,
        uniforms: {
            dayTexture: { value: textureLoader.load('ImagesGit/Objects/Moons/2k_moon.webp') },
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

        const isJupiter = (data.name === 'Jupiter');

        let material;
        // UPDATE: Generischer Check auf Ringe
        if (data.ring) {
                material = new THREE.ShaderMaterial({
                vertexShader: earthVertexShader, fragmentShader: planetWithRingFragmentShader, 
                uniforms: {
                    dayTexture: { value: textureLoader.load(data.texture) }, uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uObjectWorldPosition: { value: new THREE.Vector3() },
                    uNightBrightness: { value: 0.3 }, 
                    uRingNormal: { value: new THREE.Vector3(0, 1, 0) }, 
                    uRingInnerRadius: { value: data.radius * data.ring.innerRadius },
                    uRingOuterRadius: { value: data.radius * data.ring.outerRadius },
                    uRingShadowSoftness: { value: RING_SHADOW_SOFTNESS },
                    uShadowTransparency: { value: 1.0 }
                }
            });
            if (data.name === 'Uranus') {
                material.uniforms.uShadowTransparency.value = 0.0;
            }

            planetRingMaterials.push({ mat: material, pivot: planetTiltPivot });
        } else {

            material = new THREE.ShaderMaterial({
                vertexShader: earthVertexShader, fragmentShader: earthFragmentShader, 
                uniforms: {
                    dayTexture: { value: textureLoader.load(data.texture) }, 
                    uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, 
                    uObjectWorldPosition: { value: new THREE.Vector3() },
                    uNightBrightness: { value: 0.3 }, 
                    uSofiDemoActive: { value: false }, 
                    uMoonPosition: { value: new THREE.Vector3() }, 
                    uMoonRadius: { value: 0.1 }, 
                    uSunRadius: { value: SUN_RADIUS },
                    uHasNightTexture: { value: false },
                    uCastMoonShadows: { value: isJupiter },
                    uMoonPositions: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
                    uMoonRadii: { value: [0.0, 0.0, 0.0, 0.0] }
                }
            });
        }

        if (isJupiter) {
            jupiterMoonShadowUniforms = material.uniforms;
        }

        const planet = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 32, 32), material);
        planet.position.set(0, 0, 0); 

        planet.userData.info = { ...data }; 
        delete planet.userData.info.name; delete planet.userData.info.radius; delete planet.userData.info.distance; delete planet.userData.info.yearDays; delete planet.userData.info.texture; delete planet.userData.info.ring; delete planet.userData.info.axialTilt; delete planet.userData.info.orbitalInclination; delete planet.userData.info.rotationSpeed; delete planet.userData.info.moons; delete planet.userData.info.ecc; delete planet.userData.info.perihelionAngle;
        planet.userData.info.name = data.name_de;
        clickableObjects.push(planet);

        if (data.ring) {
            const ringTexture = textureLoader.load(data.ring.texture);
            ringTexture.wrapT = THREE.RepeatWrapping;
            
            const ringMat = new THREE.ShaderMaterial({
                vertexShader: ringVertexShader, fragmentShader: ringFragmentShader, 
                uniforms: {
                    ringTexture: { value: ringTexture }, uSunPosition: { value: new THREE.Vector3(0, 0, 0) }, uRingParentPosition: { value: new THREE.Vector3() },
                    uRingParentRadius: { value: data.radius }, uNightBrightness: { value: 0.3 }
                },
                transparent: true, side: THREE.DoubleSide
            });
            planetRingMaterials.push({ ringMat: ringMat, parentPlanet: planet });

            const ringGeometry = new THREE.RingGeometry(data.radius * data.ring.innerRadius, data.radius * data.ring.outerRadius, 64);
            ringGeometry.rotateX(Math.PI / 2); 
            const pos = ringGeometry.attributes.position; const uv = ringGeometry.attributes.uv; 
            const innerRadius = data.radius * data.ring.innerRadius; const outerRadius = data.radius * data.ring.outerRadius; 
            const repeatFactor = 10; 
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i); const z = pos.getZ(i);
                let angle = 1.0 - ((Math.atan2(z, x) / (Math.PI * 2)) + 0.5);
                let v = angle * repeatFactor; const r = Math.sqrt(x * x + z * z);
                let u = (r - innerRadius) / (outerRadius - innerRadius);
                uv.setXY(i, u, v);
            }
            const ringMesh = new THREE.Mesh(ringGeometry, ringMat);
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

                if (data.name === 'Jupiter') {
                    jupiterMoons.push(moonMesh);
                }
                
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

// Helper for animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
