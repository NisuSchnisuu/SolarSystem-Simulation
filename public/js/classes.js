// ===========================================
// KLASSEN DEFINITIONEN (Komet & Rakete)
// ===========================================

class Comet {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGeometry = new THREE.PlaneGeometry(1, 1);
        this.group = new THREE.Group();
        scene.add(this.group);
        
        this.baseSpeed = 8.0 * SCENE_SCALE; 
        this.color = new THREE.Color(0.6, 0.9, 1.0); 

        // 3D-Modell Logik
        if (cometModelTemplate) {
            this.mesh = cometModelTemplate.clone();
            
            const fixedVisualScale = 0.11; 
            this.mesh.scale.set(fixedVisualScale, fixedVisualScale, fixedVisualScale);
            this.radius = fixedVisualScale * 0.5; 
            
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    const tex = child.material.map || cometRockTexture;
                    const currentBrightness = parseFloat(document.getElementById('darkness-slider').value);

                    child.material = new THREE.ShaderMaterial({
                        vertexShader: cometVertexShader,
                        fragmentShader: cometFragmentShader,
                        uniforms: {
                            map: { value: tex },
                            uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
                            uNightBrightness: { value: currentBrightness }
                        }
                    });
                    this.material = child.material; 
                }
            });
        } else {
            // Fallback
            this.radius = 0.02; 
            const cometGeo = new THREE.DodecahedronGeometry(this.radius, 1);
            this.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            this.mesh = new THREE.Mesh(cometGeo, this.material);
        }

        this.mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        this.group.add(this.mesh);

        // Bounding Box Fix
        const box = new THREE.Box3().setFromObject(this.mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);
        this.visualRadius = maxDimension / 2;

        // --- STARTPOSITION (Vertikaler Spawn) ---
        const startAngle = THREE.MathUtils.randFloat(0, Math.PI * 2);
        const startX = Math.cos(startAngle) * COMET_SPAWN_DIST;
        const startZ = Math.sin(startAngle) * COMET_SPAWN_DIST;
        
        const spawnSign = Math.random() < 0.5 ? 1 : -1;
        const startY = spawnSign * THREE.MathUtils.randFloat(500 * SCENE_SCALE, 800 * SCENE_SCALE);

        const startPos = new THREE.Vector3(startX, startY, startZ);
        this.group.position.copy(startPos);
        
        const centerTargetOffset = 100 * SCENE_SCALE;
        let target = new THREE.Vector3(
            THREE.MathUtils.randFloat(-centerTargetOffset, centerTargetOffset),
            THREE.MathUtils.randFloat(-centerTargetOffset, centerTargetOffset),
            THREE.MathUtils.randFloat(-centerTargetOffset, centerTargetOffset)
        );
        
        const initialDirection = new THREE.Vector3().subVectors(target, startPos).normalize();
        const perpendicularOffset = new THREE.Vector3().crossVectors(startPos, initialDirection).normalize();
        perpendicularOffset.multiplyScalar(MIN_PERIHELION_DISTANCE * THREE.MathUtils.randFloat(1.1, 1.5)); 
        target.add(perpendicularOffset);
        const finalDirection = new THREE.Vector3().subVectors(target, startPos).normalize();
        
        this.velocity = finalDirection.multiplyScalar(this.baseSpeed);

        this.tailGroup = new THREE.Group();
        this.scene.add(this.tailGroup); 
        this.age = 0;
        
        // Komet-Info für Popup
        const hitboxGeo = new THREE.SphereGeometry(this.radius * 6.0, 8, 8); 
        const hitboxMat = new THREE.MeshBasicMaterial({ 
            visible: false, // Unsichtbar
            wireframe: true 
        });
        
        this.hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        this.group.add(this.hitbox); 

        // Info an die HITBOX hängen
        this.hitbox.userData.info = {
            name: 'Komet 67P (Tschurjumow-Gerassimenko)', type: 'comet', radius_km: `ca. 4,1 × 3,3 km`, velocity: `bis zu 135.000 km/h (Perihel)`, umlaufzeit: '6,44 Jahre',
            funFacts: [
                'Kometen sind "schmutzige Schneebälle" aus Eis, Staub und Gestein.',
                'Ihr Schweif entsteht erst in Sonnennähe, wenn das Eis verdampft (sublimiert).',
                'Der Schweif zeigt immer von der Sonne weg (Sonnenwind).'
            ]
        };

        // Nur die Hitbox klickbar machen
        clickableObjects.push(this.hitbox);
    }

    update(deltaTime) {
        const cometDelta = deltaTime * cometTimeScale;
        const sunPos = new THREE.Vector3(0,0,0);
        const toSun = new THREE.Vector3().subVectors(sunPos, this.group.position);
        const distanceSq = toSun.lengthSq();
        const distance = Math.sqrt(distanceSq);
        
        // Gravitation
        const safeDistanceSq = Math.max(distanceSq, (SUN_RADIUS * 2) * (SUN_RADIUS * 2));
        let acceleration = toSun.normalize().multiplyScalar(GRAVITY_STRENGTH / safeDistanceSq);
        acceleration.multiplyScalar(GRAVITY_FACTOR); 
        this.velocity.add(acceleration.multiplyScalar(cometDelta));
        this.group.position.add(this.velocity.clone().multiplyScalar(cometDelta));

        this.mesh.rotation.x += cometDelta * 0.1; 
        this.mesh.rotation.y += cometDelta * 0.15;

        if (this.material && this.material.uniforms) {
            const sliderVal = parseFloat(document.getElementById('darkness-slider').value);
            this.material.uniforms.uNightBrightness.value = sliderVal;
        }

        // --- SCHWEIF LOGIK ---
        const activeDist = 2300 * SCENE_SCALE; 
        let rawIntensity = Math.max(0, 1.0 - (distance / activeDist)); 
        const intensity = rawIntensity; 

        this.generateTail(distance, intensity, cometDelta); 
        this.updateTail(cometDelta);
        
        const isMovingAway = this.group.position.dot(this.velocity) > 0;
        if (distance > COMET_CAMERA_RESET_DIST && isMovingAway) {
            if (cameraFocus === this.mesh) setFocus(sun, 3.0);
            if (cometControls) cometControls.style.display = 'none';
        }
        
        if (distance > COMET_DESTROY_DIST && isMovingAway) {
            this.destroy();
            return true; 
        }
        this.age += cometDelta;
        
        // Distanz zwischen Kamera und Komet messen
        const distToCamera = camera.position.distanceTo(this.group.position);
        const hideThreshold = this.visualRadius * 15.0; 

        if (distToCamera < hideThreshold) {
            this.tailGroup.visible = false;
        } else {
            this.tailGroup.visible = true;
        }
        return false; 
    }
    
    destroy() {
        if (cameraFocus === this.mesh) setFocus(sun, 3.0);
        if (cometControls) cometControls.style.display = 'none';
        if (this.particleGeometry) {
            this.particleGeometry.dispose();
        }

        this.particles.forEach(p => {
            this.tailGroup.remove(p.mesh);
            if(p.mesh.geometry) p.mesh.geometry.dispose();
            if(p.mesh.material) p.mesh.material.dispose();
        });
        this.particles = [];
        
        this.group.remove(this.mesh);
        if (this.hitbox) {
            this.group.remove(this.hitbox);
            this.hitbox.geometry.dispose();
            this.hitbox.material.dispose();
        }
        this.scene.remove(this.group);
        this.scene.remove(this.tailGroup); 
        
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                        else child.material.dispose();
                    }
                }
            });
        }

        const index = clickableObjects.indexOf(this.hitbox); 
        if (index > -1) clickableObjects.splice(index, 1);
    }
    
    generateTail(sunDistance, intensity, cometDelta) {
        if (intensity <= 0.05) return; 

        let loopCount = Math.ceil(intensity * 2.0); 
        const spawnChance = (intensity + 0.1) * cometTimeScale; 
        
        for(let k=0; k<loopCount; k++) {
            if (Math.random() > spawnChance) continue; 

            const spawnOffset = new THREE.Vector3(
                THREE.MathUtils.randFloat(-0.5, 0.5),
                THREE.MathUtils.randFloat(-0.5, 0.5),
                THREE.MathUtils.randFloat(-0.5, 0.5)
            ).normalize().multiplyScalar(this.radius * 1.2);

            const spawnPos = this.group.position.clone().add(spawnOffset);
            const particleSize = THREE.MathUtils.randFloat(0.15, 0.23) * SCENE_SCALE; 

            const particleMat = new THREE.MeshBasicMaterial({ 
                color: this.color.clone().lerp(new THREE.Color(0xffffff), 0.4), 
                transparent: true, 
                opacity: intensity * 0.7, 
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending 
            });
            
            const particleMesh = new THREE.Mesh(this.particleGeometry, particleMat);
            particleMesh.scale.set(particleSize, particleSize, 1);
            
            particleMesh.position.copy(spawnPos);
            particleMesh.lookAt(camera.position);
            
            const fromSun = this.group.position.clone().normalize(); 
            const oppositeVelocity = this.velocity.clone().normalize().negate(); 
            
            const tailDir = new THREE.Vector3().addVectors(
                oppositeVelocity.multiplyScalar(1.0), 
                fromSun.multiplyScalar(0.5)           
            ).normalize();

            tailDir.x += THREE.MathUtils.randFloat(-0.1, 0.1); 
            tailDir.y += THREE.MathUtils.randFloat(-0.1, 0.1);
            tailDir.z += THREE.MathUtils.randFloat(-0.1, 0.1);

            this.particles.push({
                mesh: particleMesh,
                velocity: tailDir.multiplyScalar(THREE.MathUtils.randFloat(10 * SCENE_SCALE, 20 * SCENE_SCALE)),
                drift: new THREE.Vector3( 
                    THREE.MathUtils.randFloat(-0.2, 0.2),
                    THREE.MathUtils.randFloat(-0.2, 0.2),
                    THREE.MathUtils.randFloat(-0.2, 0.2)
                ).multiplyScalar(2.0 * SCENE_SCALE), 
                lifetime: THREE.MathUtils.randFloat(12.0, 16.0), 
                age: 0,
                initialOpacity: particleMat.opacity,
                initialScale: particleSize
            });
            this.tailGroup.add(particleMesh);
        }
    }

    updateTail(cometDelta) {
        const newParticles = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            p.velocity.add(p.drift.clone().multiplyScalar(cometDelta * 0.1));
            p.mesh.position.add(p.velocity.clone().multiplyScalar(cometDelta));
            p.mesh.lookAt(camera.position);

            p.age += cometDelta;
            const lifeRatio = p.age / p.lifetime;
            
            if (lifeRatio >= 1.0) {
                this.tailGroup.remove(p.mesh);
                p.mesh.material.dispose();
            } else {
                p.mesh.material.opacity = p.initialOpacity * (1.0 - lifeRatio);
                
                const growthFactor = 1.0 + (lifeRatio * 1.5); 
                const currentScale = p.initialScale * growthFactor;
                
                p.mesh.scale.set(currentScale, currentScale, 1); 
                
                newParticles.push(p);
            }
        }
        this.particles = newParticles;
    }
}

class Rocket {
    constructor(scene) {
        this.scene = scene;
        this.state = 'ready'; 
        this.timer = 0;
        
        // --- EINSTELLUNGEN ---
        this.TOTAL_FLIGHT_TIME = 40.0; 
        this.launchSpeed = 0.5;       
        this.moonCruiseSpeed = 1.0;   
        
        this.VERTICAL_PHASE_END = 0.10; 
        this.TRANS_LUNAR_INJECTION_START = 0.75; 

        this.VERTICAL_HEIGHT_TARGET = 0.3 * SCENE_SCALE; 
        this.ORBIT_HEIGHT_ADD = 2.5 * SCENE_SCALE; 
        this.ORBIT_ROTATIONS = -630 * (Math.PI / 180); 
        
        this.rawProgress = 0; 
        
        this.startRelPos = new THREE.Vector3(); 
        this.startAngle = 0;
        this.startRadius = 0;
        this.startY = 0; 
        
        this.hasStaged1 = false; 
        this.hasStaged2 = false; 

        this.isOnboardCamera = false;  
        this.camButtonVisible = false; 
        
        // Animations-Variablen für die Kamerafahrt
        this.camCurrentZ = -2.5;   
        this.camCurrentDist = 2.0; 

        this.camCurrentHeight = 0.3; 
        this.camCurrentLook = 0.0;   

        // ---  Kamera-Variablen ---
        this.isOnboardCamera = false;  
        this.camButtonVisible = false; 

        this.group = new THREE.Group();
        this.group.userData.isRocket = true; 
        this.effScale = 0.0030; 
        
        this.group.userData.info = {
            name: 'Apollo Mission (Saturn V)', type: 'rocket', radius_km: '110,6 m', velocity: 'max. 39.000 km/h',
            funFacts: [
                'Mit 110 Metern Höhe überragt sie die Freiheitsstatue und ist die größte jemals geflogene Rakete.',
                'Die Triebwerke der ersten Stufe verbrauchten pro Sekunde 13 Tonnen Treibstoff – so viel wie ein Pool voll Benzin.',
                'Sie bestand aus über 3 Millionen Einzelteilen. Selbst bei 99,9% Zuverlässigkeit hätte es noch 3.000 Fehler gegeben.',
                'Der Start war so laut, dass er als künstliches Erdbeben registriert wurde und Beton zum Schmelzen brachte.'
            ]
        };
        clickableObjects.push(this.group);

        this.smokeParticles = [];
        this.smokeTexture = this.createSmokeTexture();
        this.smokeGroup = new THREE.Group();
        this.scene.add(this.smokeGroup); 

        // 1. Container für Wackeln
        this.shakerContainer = new THREE.Group();
        this.group.add(this.shakerContainer);
        // 2. Container für Kamera-Anker (Stabil)
        this.meshCapsule = new THREE.Group(); 
        this.group.add(this.meshCapsule); 
        // 3. Container für Optik
        this.visualCapsule = new THREE.Group();
        this.meshCapsule.add(this.visualCapsule);

        this.meshFull = new THREE.Group();
        this.shakerContainer.add(this.meshFull); 
        this.meshStage2 = new THREE.Group();
        this.shakerContainer.add(this.meshStage2);
        
        this.debrisBooster = new THREE.Group();
        this.group.add(this.debrisBooster); 
        this.debrisStage2 = new THREE.Group();
        this.group.add(this.debrisStage2); 
        
        this.meshFull.visible = true;       
        this.meshStage2.visible = false;
        this.debrisBooster.visible = false;
        this.debrisStage2.visible = false;
        this.meshCapsule.visible = false; 

        // Hilfsfunktion zum Laden der Templates
        const setupModel = (template, container) => {
            if (template) {
                const m = template.clone();
                m.rotation.x = Math.PI / 2; 
                container.add(m);
            }
        };
        
        // Modelle einfügen 
        if(typeof rocketFullTemplate !== 'undefined') setupModel(rocketFullTemplate, this.meshFull); 
        if(typeof rocketStage2Template !== 'undefined') setupModel(rocketStage2Template, this.meshStage2); 
        if(typeof debris1Template !== 'undefined') setupModel(debris1Template, this.debrisBooster); 
        if(typeof debris2Template !== 'undefined') setupModel(debris2Template, this.debrisStage2); 
        if(typeof capsuleModelTemplate !== 'undefined') setupModel(capsuleModelTemplate, this.visualCapsule);

        this.meshCapsule.position.z = 0.1; 

        // Lichter
        this.engineLight = new THREE.PointLight(0xffffff, 2.0, 100);
        this.engineLight.position.set(5, 10, 5); 
        this.group.add(this.engineLight);
        
        const glowTexture = this.createSmokeTexture();
        const mat = new THREE.SpriteMaterial({ map: glowTexture, color: 0xffaa00, blending: THREE.AdditiveBlending, depthWrite: false });
        
        this.engineGlow = new THREE.Sprite(mat);
        const fireSize = this.effScale * 20.0; 
        this.engineGlow.scale.set(fireSize, fireSize, 1);
        this.engineGlow.position.z = -0.005; 
        this.meshFull.add(this.engineGlow); 

        this.engineGlow2 = this.engineGlow.clone();
        this.engineGlow2.position.z = 0.06; 
        this.engineGlow2.scale.set(fireSize * 0.9, fireSize * 0.9, 1);
        this.meshStage2.add(this.engineGlow2);

        this.capsuleEngine = this.engineGlow.clone();
        this.capsuleEngine.scale.set(fireSize * 0.2, fireSize * 0.2, 1);
        this.visualCapsule.add(this.capsuleEngine);

        // --- KINO-KAMERA DATEN ---
        this.cinematicKeyframes = [
            { p: 0.001, h: 0.05, d: -8.79, z: 0.38, l: 0.1 },
            { p: 0.020, h: 0.05, d: -8.44, z: 1.36, l: 0.1 },
            { p: 0.040, h: 0.05, d: -8.44, z: 1.36, l: 0.1 },
            { p: 0.060, h: 0.05, d: -8.44, z: 1.36, l: 0.1 },
            { p: 0.080, h: 0.05, d: -8.44, z: 1.36, l: 0.1 },
            
            // DER SCHWUNG (9% - 15%)
            { p: 0.091, h: 0.08, d: -8.44, z: 1.36, l: 0.1 },
            { p: 0.093, h: 0.47, d: -8.43, z: 1.36, l: 0.1 },
            { p: 0.095, h: 1.27, d: -8.35, z: 1.36, l: 0.1 },
            { p: 0.097, h: 2.37, d: -8.02, z: 1.54, l: 0.1 },
            { p: 0.099, h: 3.52, d: -7.34, z: 2.04, l: 0.1 },
            { p: 0.101, h: 4.95, d: -6.09, z: 2.58, l: 0.1 },
            { p: 0.103, h: 6.54, d: -4.30, z: 2.62, l: 0.1 },
            { p: 0.105, h: 7.54, d: -2.64, z: 2.32, l: 0.1 },
            { p: 0.107, h: 8.23, d: -1.14, z: 1.67, l: 0.1 },
            { p: 0.109, h: 8.72, d: 0.30, z: 0.55, l: 0.1 },
            { p: 0.111, h: 8.93, d: 1.31, z: -0.90, l: 0.1 },
            { p: 0.113, h: 8.88, d: 1.93, z: -2.26, l: 0.1 },
            { p: 0.115, h: 8.44, d: 2.80, z: -3.90, l: 0.1 },
            { p: 0.117, h: 7.71, d: 3.28, z: -5.52, l: 0.1 },
            { p: 0.119, h: 6.91, d: 3.26, z: -6.93, l: 0.1 },
            { p: 0.121, h: 5.57, d: 2.97, z: -8.55, l: 0.1 },
            { p: 0.123, h: 4.43, d: 2.67, z: -9.48, l: 0.1 },
            { p: 0.125, h: 3.37, d: 1.76, z: -10.27, l: 0.1 },
            { p: 0.127, h: 2.43, d: 0.30, z: -10.76, l: 0.1 },
            { p: 0.130, h: 1.79, d: -1.06, z: -10.86, l: 0.1 },
            { p: 0.135, h: 1.04, d: -2.35, z: -10.73, l: 0.1 },
            { p: 0.140, h: 0.12, d: -2.85, z: -10.64, l: 0.1 },
            
            // BOOSTER ABWURF & ÜBERGANG (15% - 20%)
            { p: 0.145, h: -0.73, d: -3.32, z: -10.44, l: 0.1 },
            { p: 0.150, h: -1.10, d: -3.74, z: -10.22, l: 0.1 },
            { p: 0.155, h: -1.09, d: -3.82, z: -9.18, l: 0.1 },
            { p: 0.160, h: -0.85, d: -3.08, z: -7.12, l: 0.1 },
            { p: 0.165, h: -0.67, d: -2.47, z: -5.63, l: 0.1 },
            { p: 0.170, h: -0.70, d: -2.66, z: -5.48, l: 0.1 },
            { p: 0.175, h: -0.69, d: -2.67, z: -5.18, l: 0.1 },
            { p: 0.180, h: -0.72, d: -2.83, z: -5.03, l: 0.1 },
            { p: 0.185, h: -0.74, d: -2.96, z: -4.90, l: 0.1 },
            { p: 0.190, h: -0.76, d: -3.11, z: -4.73, l: 0.1 },
            { p: 0.195, h: -0.83, d: -3.24, z: -4.55, l: 0.1 },
            { p: 0.200, h: -1.01, d: -4.15, z: -4.90, l: 0.1 },
            { p: 0.214, h: -1.86, d: -6.07, z: -5.80, l: 0.1 },
            { p: 0.229, h: -2.36, d: -7.97, z: -5.67, l: 0.1 },
            { p: 0.245, h: -2.42, d: -8.47, z: -4.22, l: 0.1 },
            { p: 0.260, h: -2.42, d: -8.73, z: -2.74, l: 0.1 },
            { p: 0.275, h: -2.38, d: -8.73, z: -1.11, l: 0.1 },
            { p: 0.291, h: -2.25, d: -8.78, z: -1.31, l: 0.1 },
            { p: 0.306, h: -0.90, d: -6.76, z: -7.96, l: 0.1 },
            { p: 0.321, h: 0.04, d: -2.96, z: -10.53, l: 0.1 },
            { p: 0.336, h: 0.13, d: -2.88, z: -10.55, l: 0.1 },
            { p: 0.352, h: 0.00, d: -3.65, z: -10.23, l: 0.1 },
            { p: 0.367, h: -0.20, d: -4.62, z: -9.72, l: 0.1 },
            { p: 0.382, h: -0.56, d: -6.23, z: -8.48, l: 0.1 },
            { p: 0.397, h: -0.82, d: -7.77, z: -6.50, l: 0.1 },
            { p: 0.413, h: -0.96, d: -8.75, z: -4.10, l: 0.1 },
            { p: 0.428, h: -1.26, d: -8.97, z: -2.54, l: 0.1 },
            { p: 0.443, h: -1.64, d: -10.07, z: -4.68, l: 0.1 },
            { p: 0.458, h: -1.95, d: -9.89, z: -5.07, l: 0.1 },
            { p: 0.475, h: -1.63, d: -8.93, z: -7.25, l: 0.1 },
            { p: 0.490, h: -1.34, d: -8.14, z: -8.42, l: 0.1 },

            // --- STATISCHER HOLD ---
            { p: 0.650, h: -1.34, d: -8.14, z: -8.42, l: 0.1 },

            // --- ACTION START (Kapsel & Landung) ---
            { p: 0.651, h: -1.46, d: -8.40, z: -4.68, l: 0.1 },
            { p: 0.667, h: -1.47, d: -8.47, z: -4.45, l: 0.1 },
            { p: 0.683, h: -1.06, d: -8.67, z: -4.01, l: 0.1 },
            { p: 0.699, h: -1.04, d: -8.99, z: -1.12, l: 0.1 },
            { p: 0.715, h: -0.19, d: -8.17, z: -5.49, l: 0.1 },
            { p: 0.731, h: 0.18, d: -7.12, z: -7.21, l: 0.1 },
            { p: 0.746, h: 0.60, d: -5.82, z: -8.54, l: 0.1 },
            { p: 0.761, h: 1.60, d: -3.37, z: -10.07, l: 0.1 },
            { p: 0.776, h: 1.23, d: -2.07, z: -10.56, l: 0.1 },
            { p: 0.791, h: 1.33, d: -1.67, z: -10.66, l: 0.1 },
            { p: 0.806, h: 1.32, d: -1.95, z: -10.62, l: 0.1 },
            { p: 0.822, h: 0.38, d: -3.30, z: -7.27, l: 0.1 },
            { p: 0.837, h: 0.14, d: -2.76, z: -5.06, l: 0.1 },
            { p: 0.852, h: -0.21, d: -4.13, z: -2.66, l: 0.1 },
            { p: 0.867, h: 0.04, d: 0.52, z: 2.26, l: 0.1 },
            { p: 0.882, h: 0.00, d: 4.43, z: 1.71, l: 0.1 },
            { p: 0.897, h: 0.47, d: 6.26, z: 1.99, l: 0.1 },
            { p: 0.912, h: 0.13, d: 5.78, z: 2.69, l: 0.1 },
            { p: 0.927, h: 0.27, d: 0.40, z: 3.20, l: 0.1 },
            { p: 0.943, h: 0.07, d: 0.07, z: 1.84, l: 0.1 },
            { p: 0.958, h: 0.10, d: 0.29, z: 1.82, l: 0.1 },
            { p: 0.999, h: -0.08, d: 5.89, z: 33.83, l: 0.1 },
            { p: 0.999, h: -0.08, d: 5.89, z: 33.83, l: 0.1 },
            { p: 1.000, h: -0.08, d: 6.20, z: 35.71, l: 0.1 },
        ];

        scene.add(this.group);

        // TRICK: Shader "Vorwärmen"
        this.meshStage2.visible = true;
        this.debrisBooster.visible = true;
        this.debrisStage2.visible = true;
        this.meshCapsule.visible = true;
        
        this.needsReset = true;
    }

    createSmokeTexture() {
        const size = 512; 
        const canvas = document.createElement('canvas');
        canvas.width = size; 
        canvas.height = size;
        
        const context = canvas.getContext('2d');
        const center = size / 2;
        
        const gradient = context.createRadialGradient(center, center, 0, center, center, center);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false; 
        
        return texture;
    }

    spawnSmoke(isSpace) {
        let sourcePos = new THREE.Vector3();
        let activeGlow = null;
        if (this.meshFull.visible) activeGlow = this.engineGlow;
        else if (this.meshStage2.visible) activeGlow = this.engineGlow2;
        else if (this.meshCapsule.visible) activeGlow = this.capsuleEngine;
        if (!activeGlow) return;
        activeGlow.getWorldPosition(sourcePos);
        const material = new THREE.SpriteMaterial({ 
            map: this.smokeTexture, 
            color: isSpace ? new THREE.Color(0xdddddd) : new THREE.Color(0x555555),
            transparent: true, opacity: isSpace ? 0.15 : 0.6, depthWrite: false 
        });
        const particle = new THREE.Sprite(material);
        particle.position.copy(sourcePos);
        const spread = this.effScale * (isSpace ? 0.1 : 0.5); 
        particle.position.add(new THREE.Vector3((Math.random()-0.5)*spread, (Math.random()-0.5)*spread, (Math.random()-0.5)*spread));
        let baseSize = isSpace ? 1.5 : 6.0; 
        let size = baseSize * this.effScale; 
        particle.scale.set(size, size, 1);
        this.smokeGroup.add(particle);
        this.smokeParticles.push({
            mesh: particle, age: 0, lifetime: isSpace ? 0.5 : 3.0,
            growth: isSpace ? (0.1 * this.effScale) : (4.0 * this.effScale), 
            velocity: new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5)).multiplyScalar(0.01 * SCENE_SCALE)
        });
    }

    updateSmoke(deltaTime) {
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.age += deltaTime;
            if (p.age >= p.lifetime) {
                this.smokeGroup.remove(p.mesh);
                p.mesh.material.dispose();
                this.smokeParticles.splice(i, 1);
                continue;
            }
            p.mesh.material.opacity *= 0.95; 
            const currentScale = p.mesh.scale.x + (p.growth * deltaTime);
            p.mesh.scale.set(currentScale, currentScale, 1);
            p.mesh.position.add(p.velocity.clone().multiplyScalar(deltaTime));
        }
    }

    launch() {
        if (this.state !== 'ready') return;

        updateLaunchHUD(true, "SEQUENZ START", "Kamera-Positionierung...", "🎥", 0);
        setLaunchModeUI(true); 

        const dismissBtn = document.getElementById('rocket-dismiss-btn');
        if (dismissBtn) dismissBtn.style.display = 'none'; 
        const abortBtn = document.getElementById('rocket-abort-btn');
        if(abortBtn) abortBtn.style.display = 'block';

        const dSlider = document.getElementById('darkness-slider');
        const dLabel = document.getElementById('darkness-label');
        if (dSlider) {
            dSlider.value = 0.10;
            dSlider.dispatchEvent(new Event('input')); 
            if (dLabel) dLabel.textContent = "0.10";
        }

        const uiContainer = document.getElementById('ui-container');
        const toggleBtn = document.getElementById('toggle-ui');
        if (uiContainer && toggleBtn) {
            uiContainer.classList.add('minimized');
            toggleBtn.textContent = '☰'; 
            toggleBtn.title = 'Menü anzeigen';
        }

        currentDay = 0.8; 
        const daySlider = document.getElementById('day-slider');
        if (daySlider) { daySlider.value = currentDay; }
        updatePositions(currentDay); 
        this.updatePositionOnEarth();

        const sSlider = document.getElementById('speed-slider');
        if (sSlider) { sSlider.value = 1; sSlider.dispatchEvent(new Event('input')); }

        const startH = 0.0;
        const startD = -8.79;
        const startZ = -1.5;
        const startL = 0.1;

        this.group.updateMatrixWorld(); 
        
        const factor = 15 * SCENE_SCALE * this.effScale * 1.1;
        
        const idealOffset = new THREE.Vector3(startH, -startD, -startZ).multiplyScalar(factor); 
        const idealCamPos = idealOffset.applyMatrix4(this.group.matrixWorld);

        const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion).normalize();
        const idealTarget = this.group.position.clone().add(forwardDir.multiplyScalar(startL * SCENE_SCALE));

        otherPlanetOrbits.forEach(orbit => orbit.visible = false);
        if (earthOrbitLine) earthOrbitLine.visible = false;
        if (moonOrbitLine) moonOrbitLine.visible = false;
        if (asteroidInstancedMesh) asteroidInstancedMesh.visible = false;
        
        flyTo(idealCamPos, idealTarget, 3.0, null, () => {
            this.state = 'countdown';
            this.timer = 5.0; 

            this.isOnboardCamera = true; 
            controls.enabled = false;

            const camBtn = document.getElementById('rocket-cam-btn');
            if(camBtn) camBtn.textContent = "🔄 Freie Ansicht";
            
            const earthPos = new THREE.Vector3(); earth.getWorldPosition(earthPos);
            this.startRelPos.subVectors(this.group.position, earthPos);
            this.startY = this.startRelPos.y;
            this.startAngle = Math.atan2(this.startRelPos.z, this.startRelPos.x);
            this.startRadius = Math.hypot(this.startRelPos.x, this.startRelPos.z); 

            cameraFocus = this.group; 
        });
    }
    
    updatePositionOnEarth() {
        if (!earth || !sun) return;
        const earthPos = new THREE.Vector3(); earth.getWorldPosition(earthPos);
        const sunPos = new THREE.Vector3(); sun.getWorldPosition(sunPos);
        const dir = new THREE.Vector3().subVectors(sunPos, earthPos).normalize();
        dir.y += 0.3; dir.normalize(); 
        const finalPos = earthPos.clone().add(dir.multiplyScalar(EARTH_RADIUS));
        this.group.position.copy(finalPos);
        this.group.lookAt(finalPos.clone().add(dir));
    }

    calculateTrajectory(p) {
            const earthPos = new THREE.Vector3(); earth.getWorldPosition(earthPos);
        if (p < this.VERTICAL_PHASE_END) {
            const localP = p / this.VERTICAL_PHASE_END;
            const riseP = localP * localP; 
            const currentR = this.startRadius + (this.VERTICAL_HEIGHT_TARGET * riseP * 0.5);
            const currentAngle = this.startAngle; 
            const x = Math.cos(currentAngle) * currentR;
            const z = Math.sin(currentAngle) * currentR;
            return new THREE.Vector3(x, this.startY, z).add(earthPos);
        } else if (p < this.TRANS_LUNAR_INJECTION_START) {
            const sectionDuration = this.TRANS_LUNAR_INJECTION_START - this.VERTICAL_PHASE_END;
            const localP = (p - this.VERTICAL_PHASE_END) / sectionDuration;
            const startR = this.startRadius + (this.VERTICAL_HEIGHT_TARGET * 0.5);
            const endR = this.startRadius + this.ORBIT_HEIGHT_ADD;
            const currentR = THREE.MathUtils.lerp(startR, endR, Math.sin(localP * Math.PI / 2));
            const orbitEndAngle = this.startAngle + this.ORBIT_ROTATIONS;
            const angleP = 1.0 - Math.cos((localP * Math.PI) / 2); 
            const currentAngle = THREE.MathUtils.lerp(this.startAngle, orbitEndAngle, angleP);
            const x = Math.cos(currentAngle) * currentR;
            const z = Math.sin(currentAngle) * currentR;
            return new THREE.Vector3(x, this.startY, z).add(earthPos);
        } else {
            const sectionDuration = 1.0 - this.TRANS_LUNAR_INJECTION_START;
            const localP = (p - this.TRANS_LUNAR_INJECTION_START) / sectionDuration;
            const orbitEndAngle = this.startAngle + this.ORBIT_ROTATIONS;
            const orbitR = this.startRadius + this.ORBIT_HEIGHT_ADD;
            const startVec = new THREE.Vector3(
                Math.cos(orbitEndAngle) * orbitR, 
                this.startY, 
                Math.sin(orbitEndAngle) * orbitR
            ).add(earthPos);
            const moonPos = new THREE.Vector3(); 
            moon.getWorldPosition(moonPos);
            const vecEarthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos).normalize();
            const targetPos = earthPos.clone().add(vecEarthToMoon.multiplyScalar(moonPos.distanceTo(earthPos) - (MOON_RADIUS * 1.05))); 
            const pos = new THREE.Vector3().lerpVectors(startVec, targetPos, localP);
            const curveIntensity = 5.0 * SCENE_SCALE * Math.sin(localP * Math.PI); 
            const flightDir = new THREE.Vector3().subVectors(targetPos, startVec).normalize();
            const up = new THREE.Vector3(0, 1, 0);
            const side = new THREE.Vector3().crossVectors(flightDir, up).normalize();
            pos.add(side.multiplyScalar(curveIntensity));
            return pos;
        }
    }

    toggleOnboardCamera() {
        this.isOnboardCamera = !this.isOnboardCamera;
        const btn = document.getElementById('rocket-cam-btn');
        
        if (this.isOnboardCamera) {
            if(btn) btn.textContent = "🔄 Zurück zur freien Ansicht";
            controls.enabled = false;
        } else {
            if(btn) btn.textContent = "🎥 Kino-Modus";
            controls.enabled = true;
            
            setFocus(this.group, 0); 

            otherPlanetOrbits.forEach(orbit => orbit.visible = false);
            if (earthOrbitLine) earthOrbitLine.visible = false;
            if (moonOrbitLine) moonOrbitLine.visible = false;
            if (asteroidInstancedMesh) asteroidInstancedMesh.visible = false;
        }
    }

    update(deltaTime) {

        if (this.needsReset) {
            this.meshStage2.visible = false;
            this.debrisBooster.visible = false;
            this.debrisStage2.visible = false;
            this.meshCapsule.visible = false;
            this.needsReset = false;
        }
        
        this.updateSmoke(deltaTime);

        if (this.state === 'ready') { return false; }
        
        // Countdown...
        if (this.state === 'countdown') {
            this.timer -= deltaTime;

            updateLaunchHUD(true, "T-MINUS", `T- ${this.timer.toFixed(1)} Sekunden`, "⏱️", (1.0 - (this.timer/5.0))*100);
            
            if (this.timer < 2.0 && this.timer > 0) {
                const intensity = (2.0 - this.timer) * 0.002 * SCENE_SCALE; 
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                const z = (Math.random() - 0.5) * intensity;
                this.shakerContainer.position.set(x, y, z);
                this.visualCapsule.position.set(x, y, z); 
            } else {
                this.shakerContainer.position.set(0, 0, 0);
                this.visualCapsule.position.set(0, 0, 0);
            }
            const statusEl = document.getElementById('rocket-status');
            if (statusEl) statusEl.textContent = `T- ${this.timer.toFixed(1)} s`;
            if (this.timer < 1.5) { this.spawnSmoke(false); }
            if (this.timer <= 0) {
                this.state = 'flying';
                if (statusEl) statusEl.textContent = "LIFTOFF!";
            }
            return false;
        }

        if (this.state === 'flying') {
            const wobbleEnd = 0.25; 
            if (this.rawProgress < wobbleEnd) {
                const fade = 1.0 - (this.rawProgress / wobbleEnd);
                const intensity = 0.002 * SCENE_SCALE * fade;
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                const z = (Math.random() - 0.5) * intensity;
                this.shakerContainer.position.set(x, y, z);
                this.visualCapsule.position.set(x, y, z);
            } else {
                this.shakerContainer.position.set(0, 0, 0);
                this.visualCapsule.position.set(0, 0, 0);
            }

            let currentSpeedFactor = this.launchSpeed;
            const accelStart = 0.30; 
            const accelEnd = this.TRANS_LUNAR_INJECTION_START;
            
            if (this.rawProgress >= accelEnd) {
                currentSpeedFactor = this.moonCruiseSpeed;

                const landingPhaseStart = 0.70; 

                if (this.rawProgress > landingPhaseStart) {
                    const t = (this.rawProgress - landingPhaseStart) / (1.0 - landingPhaseStart);
                    currentSpeedFactor = THREE.MathUtils.lerp(this.moonCruiseSpeed, this.moonCruiseSpeed * 0.05, t);
                }

            } else if (this.rawProgress > accelStart) {
                let t = (this.rawProgress - accelStart) / (accelEnd - accelStart);
                t = 1.0 - Math.pow(1.0 - t, 3); 
                currentSpeedFactor = this.launchSpeed + (this.moonCruiseSpeed - this.launchSpeed) * t;
            }
            
            this.rawProgress += (deltaTime / this.TOTAL_FLIGHT_TIME) * currentSpeedFactor;

            const pct = this.rawProgress * 100;
            const p = this.rawProgress;

            if (p < 0.15) {
                const phasePercent = (p / 0.15) * 100;
                updateLaunchHUD(true, "MAXIMALER SCHUB", `Höhe gewinnen... (${phasePercent.toFixed(0)}%)`, "🔥", phasePercent);
            } 
            else if (p >= 0.15 && p < 0.18) {
                updateLaunchHUD(true, "STUFENTRENNUNG", "Booster abgeworfen", "⛓️‍💥", 100);
            }
            else if (p >= 0.18 && p < 0.40) {
                updateLaunchHUD(true, "ORBIT ERREICHT", "Parkbahn um die Erde", "🌍", pct);
            }
            else if (p >= 0.40 && p < 0.75) {
                updateLaunchHUD(true, "TLI MANÖVER", "Reise zum Mond läuft", "🌌", pct);
            }
            else if (p >= 0.75 && p < 0.80) {
                updateLaunchHUD(true, "KAPSEL SEPARATION", "Landeanflug initiiert", "🛰️", pct);
            }
            else if (p >= 0.80) {
                updateLaunchHUD(true, "LANDESSEQUENZ", "Bremsmanöver aktiv", "🌖", pct);
            }

            if (this.rawProgress >= 1.0) { this.finish(); return true; }


            const newPos = this.calculateTrajectory(p);
            this.group.position.copy(newPos);
            
            const futureP = Math.min(1.0, p + 0.01); 
            const lookTarget = this.calculateTrajectory(futureP);
            
            const dummy = new THREE.Object3D();
            dummy.position.copy(this.group.position);

            const earthPos = new THREE.Vector3();
            earth.getWorldPosition(earthPos);

            const upVector = new THREE.Vector3().subVectors(this.group.position, earthPos).normalize();

            dummy.up.copy(upVector);
            dummy.lookAt(lookTarget);
            
            this.group.quaternion.slerp(dummy.quaternion, 0.1); 

            if (p > this.VERTICAL_PHASE_END && !this.camButtonVisible) {
                this.camButtonVisible = true;
                const btn = document.getElementById('rocket-cam-btn');
                if(btn) btn.style.display = 'block';
            }

            if (this.isOnboardCamera) {
                
                const prog = this.rawProgress;
                const frames = this.cinematicKeyframes;
                
                let nextIdx = frames.findIndex(k => k.p >= prog);
                
                if (nextIdx === -1) nextIdx = frames.length - 1; 
                let prevIdx = Math.max(0, nextIdx - 1);

                const prevKey = frames[prevIdx];
                const nextKey = frames[nextIdx];

                let localT = 0;
                const range = nextKey.p - prevKey.p;
                if (range > 0.00001) {
                    localT = (prog - prevKey.p) / range;
                }

                localT = THREE.MathUtils.smoothstep(localT, 0.0, 1.0);

                const currentH = THREE.MathUtils.lerp(prevKey.h, nextKey.h, localT);
                const currentD = THREE.MathUtils.lerp(prevKey.d, nextKey.d, localT);
                const currentZ = THREE.MathUtils.lerp(prevKey.z, nextKey.z, localT);
                const currentL = THREE.MathUtils.lerp(prevKey.l, nextKey.l, localT);

                const factor = 15 * SCENE_SCALE * this.effScale * 1.1;
                const idealOffset = new THREE.Vector3(currentH, -currentD, -currentZ).multiplyScalar(factor); 
                const idealCamPos = idealOffset.applyMatrix4(this.group.matrixWorld);

                const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion).normalize();
                const idealTarget = this.group.position.clone();
                idealTarget.add(forwardDir.multiplyScalar(currentL * SCENE_SCALE));

                const smoothness = deltaTime * 0.75; 

                camera.position.lerp(idealCamPos, smoothness);
                controls.target.lerp(idealTarget, smoothness);
                
                camera.lookAt(controls.target);
            }
            
            const STAGE_1_POINT = 0.15; 
            if (p > STAGE_1_POINT && !this.hasStaged1) {
                this.hasStaged1 = true;
                this.meshFull.visible = false;
                this.meshStage2.visible = true;
                this.debrisBooster.visible = true; 
                for(let k=0; k<5; k++) this.spawnSmoke(false);
                if (document.getElementById('rocket-status')) document.getElementById('rocket-status').textContent = "Stufentrennung 1 (Booster)";
            }
            const STAGE_2_POINT = this.TRANS_LUNAR_INJECTION_START;
            if (p > STAGE_2_POINT && !this.hasStaged2) {
                this.hasStaged2 = true;
                this.meshStage2.visible = false;
                this.meshCapsule.visible = true;
                this.debrisStage2.visible = true; 
                for(let k=0; k<8; k++) this.spawnSmoke(true);
                if (document.getElementById('rocket-status')) document.getElementById('rocket-status').textContent = "TLI - Kapsel separiert";
            }
                if (this.debrisBooster.visible) {
                this.debrisBooster.position.z -= deltaTime * 0.5 * SCENE_SCALE;
                this.debrisBooster.rotation.x += deltaTime;
                this.debrisBooster.scale.multiplyScalar(0.98); 
                
                if (this.debrisBooster.scale.x < 0.001) {
                    this.debrisBooster.visible = false;
                    
                    disposeObject(this.debrisBooster);
                    this.group.remove(this.debrisBooster); 
                }
            }

            if (this.debrisStage2.visible) {
                this.debrisStage2.position.z -= deltaTime * 0.3 * SCENE_SCALE;
                this.debrisStage2.rotation.z += deltaTime * 0.5;
                this.debrisStage2.scale.multiplyScalar(0.99);
                
                if (this.debrisStage2.scale.x < 0.001) {
                    this.debrisStage2.visible = false;
                    
                    disposeObject(this.debrisStage2);
                    this.group.remove(this.debrisStage2);
                }
            }
            const statusEl = document.getElementById('rocket-status');
            if (statusEl && !this.hasStaged1 && p < STAGE_1_POINT) {
                if (p < this.VERTICAL_PHASE_END) statusEl.textContent = `Vertikaler Aufstieg... ${(p/this.VERTICAL_PHASE_END*100).toFixed(0)}%`;
                else statusEl.textContent = "Gravity Turn (Neigung)...";
            }
            if (p < 0.2 || (p > this.TRANS_LUNAR_INJECTION_START && p < 0.6)) {
                    this.spawnSmoke(p > 0.2);
            }
            if (this.rawProgress > 0.8 && this.smokeGroup && this.smokeParticles.length === 0) {
                
                console.log("Reinige Rauch-Speicher...");
                
                if (this.smokeTexture) {
                    this.smokeTexture.dispose();
                    this.smokeTexture = null;
                }

                this.scene.remove(this.smokeGroup);
                this.smokeGroup = null; 
            }
        }

    if (!this.isOnboardCamera && this.state === 'flying') {
        
        if (!this.debugTimer) this.debugTimer = 0;
        this.debugTimer += deltaTime;

        if (this.debugTimer > 0.15) {
            this.debugTimer = 0;

            const holdStart = 0.50;
            const holdEnd = 0.65;

            if (this.rawProgress > holdStart && this.rawProgress < holdEnd) {
                if (!this.hasLoggedHold) {
                    console.log(`// --- HOLD START (Kamera friert ein) ---`);
                    this.hasLoggedHold = true;
                }
                return; 
            }
            
            if (this.rawProgress >= holdEnd) {
                if (this.hasLoggedHold) {
                    console.log(`// --- HOLD ENDE (Action!) ---`);
                    this.hasLoggedHold = false;
                }
            }

            const factor = 15 * SCENE_SCALE * this.effScale * 1.1;

            let localPos = camera.position.clone().sub(this.group.position);
            localPos.applyQuaternion(this.group.quaternion.clone().invert());

            const h = (localPos.x / factor).toFixed(2);
            const d = (-(localPos.y / factor)).toFixed(2);
            const z = (-(localPos.z / factor)).toFixed(2);

            let localTarget = controls.target.clone().sub(this.group.position);
            localTarget.applyQuaternion(this.group.quaternion.clone().invert());
            const l = (localTarget.z / SCENE_SCALE).toFixed(1);
            
            const prog = this.rawProgress.toFixed(3);

            console.log(`{ p: ${prog}, h: ${h}, d: ${d}, z: ${z}, l: ${l} },`);
        }
    }
        return false;
    }

    finish() {
        this.state = 'landed';
        hasMoonMissionLanded = true;

        if (typeof moonSurfaceObjects !== 'undefined') {
            moonSurfaceObjects.forEach(obj => {
                obj.visible = true; 
            });
        }

        updateLaunchHUD(true, "THE EAGLE HAS LANDED", "Mission erfolgreich beendet.", "🦅", 100);
        
        setTimeout(() => updateLaunchHUD(false), 6000);

        document.getElementById('rocket-status').textContent = "Mondlandung erfolgreich.";
        const index = clickableObjects.indexOf(this.group); 
        if (index > -1) clickableObjects.splice(index, 1);
        disposeObject(this.group);       
        disposeObject(this.smokeGroup);  
        this.scene.remove(this.group); 
        this.scene.remove(this.smokeGroup);
        
        rocketSpawnAllowed = false;
        setLaunchModeUI(false); 

        document.getElementById('rocket-controls').style.display = 'none';
        
        const abortBtn = document.getElementById('rocket-abort-btn');
        if(abortBtn) abortBtn.style.display = 'none';

        const uiContainer = document.getElementById('ui-container');
        const toggleBtn = document.getElementById('toggle-ui');
        if (uiContainer && toggleBtn) {
            uiContainer.classList.remove('minimized');
            toggleBtn.textContent = '✕'; 
            toggleBtn.title = 'Menü verbergen';
        }

        const btn = document.getElementById('rocket-cam-btn');
        if(btn) {
            btn.style.display = 'none';
            btn.textContent = "🎥 Bordkamera aktivieren"; 
        }
        this.isOnboardCamera = false;
        controls.enabled = true; 
        
        setFocus(moon, 2.0); 

        const planetsOrbitCb = document.getElementById('planets-orbit-checkbox');
        const showPlanetsOrbit = planetsOrbitCb ? planetsOrbitCb.checked : true;
        otherPlanetOrbits.forEach(orbit => orbit.visible = showPlanetsOrbit);
        const earthOrbitCb = document.getElementById('orbit-checkbox');
        const showEarthOrbit = earthOrbitCb ? earthOrbitCb.checked : true;
        if (earthOrbitLine) earthOrbitLine.visible = showEarthOrbit;
        if (moonOrbitLine) moonOrbitLine.visible = showEarthOrbit;
        const asteroidsCb = document.getElementById('asteroids-checkbox');
        const showAsteroids = asteroidsCb ? asteroidsCb.checked : false; 
        if (asteroidInstancedMesh) asteroidInstancedMesh.visible = showAsteroids;
    }

    abort() {

        updateLaunchHUD(true, "SYSTEM CHECK", "Warte auf Startfreigabe...", "⏱️", 0);

        this.state = 'aborted';
        hasMoonMissionLanded = false;

        if (typeof moonSurfaceObjects !== 'undefined') {
            moonSurfaceObjects.forEach(obj => {
                obj.visible = false;
            });
        }
        document.getElementById('rocket-status').textContent = "Mission abgebrochen.";

        const index = clickableObjects.indexOf(this.group); 
        if (index > -1) clickableObjects.splice(index, 1);
        disposeObject(this.group);       
        disposeObject(this.smokeGroup); 
        this.scene.remove(this.group); 
        this.scene.remove(this.smokeGroup);

        const dismissBtn = document.getElementById('rocket-dismiss-btn');
        if (dismissBtn) dismissBtn.style.display = 'block'; 

        setLaunchModeUI(false); 

        const launchBtn = document.getElementById('launch-rocket-btn');
        if (launchBtn) {
            launchBtn.disabled = false;
            launchBtn.textContent = "🚀 Raketenstart verfügbar!";
            launchBtn.classList.add('btn-pulse');
        }
        
        const abortBtn = document.getElementById('rocket-abort-btn');
        if (abortBtn) abortBtn.style.display = 'none';

        const camBtn = document.getElementById('rocket-cam-btn');
        if(camBtn) {
            camBtn.style.display = 'none';
            camBtn.textContent = "🎥 Bordkamera aktivieren";
        }

        this.isOnboardCamera = false;
        controls.enabled = true; 
        
        setFocus(earth, 1.5); 

        const planetsOrbitCb = document.getElementById('planets-orbit-checkbox');
        const showPlanetsOrbit = planetsOrbitCb ? planetsOrbitCb.checked : true;
        otherPlanetOrbits.forEach(orbit => orbit.visible = showPlanetsOrbit);
        
        const earthOrbitCb = document.getElementById('orbit-checkbox');
        const showEarthOrbit = earthOrbitCb ? earthOrbitCb.checked : true;
        if (earthOrbitLine) earthOrbitLine.visible = showEarthOrbit;
        if (moonOrbitLine) moonOrbitLine.visible = showEarthOrbit;
        
        const asteroidsCb = document.getElementById('asteroids-checkbox');
        if (asteroidInstancedMesh) asteroidInstancedMesh.visible = (asteroidsCb && asteroidsCb.checked);
    }
}
