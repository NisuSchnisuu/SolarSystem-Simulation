// ===========================================
// DATEN & ASSETS LADEN
// ===========================================

function definePlanetData() {
    const textureBasePath = 'ImagesGit/Objects/';
    const moonTextureBasePath = 'ImagesGit/Objects/Moons/';
    const degToRad = Math.PI / 180;
    
    planetsData = [
        { 
            name: 'Mercury', 
            radius: 0.95 * SCENE_SCALE, 
            distance: 110 * SCENE_SCALE, 
            yearDays: 88, 
            texture: textureBasePath + '2k_mercury.webp', 
            axialTilt: 0.03, 
            rotationSpeed: 0.017,
            ecc: 0.205, 
            perihelionAngle: 77.45 * degToRad, 
            orbitalInclination: 7.0,
            planetType_de: 'Innerer Gesteinsplanet',
            //Fakten
            name_de: 'Merkur', earthCompareRadius: '0,38x Erde', radius_km: '2.439', distance_Mio_km: '57,9 Mio. km', umlaufzeit: '88 Erdtage', taglaenge: '176 Erdtage', temperatur: 'ca. 167°C',
            funFacts: ['Auf Merkur dauert ein Tag (176 Erdtage) länger als ein Jahr (88 Erdtage).', 'Er hat keine Monde und keine nennenswerte Atmosphäre.', 'Trotz seiner Nähe zur Sonne ist er nicht der heisseste Planet.']
        },
        { 
            name: 'Venus', 
            radius: 2.4 * SCENE_SCALE, 
            distance: 200 * SCENE_SCALE, 
            yearDays: 225, 
            texture: textureBasePath + '2k_venus_surface.webp', 
            axialTilt: 177.0, rotationSpeed: -0.0041,
            ecc: 0.007, 
            perihelionAngle: 131.53 * degToRad, 
            orbitalInclination: 3.39,
            planetType_de: 'Innerer Gesteinsplanet',
            //Fakten
            name_de: 'Venus', earthCompareRadius: '0,95x Erde', radius_km: '6.051', distance_Mio_km: '108,2 Mio. km', umlaufzeit: '225 Erdtage', taglaenge: '243 Erdtage (rückwärts!)', temperatur: 'ca. 464°C (heissester Planet)',
            funFacts: ['Die Venus dreht sich "rückwärts" (retrograd).', 'Ein Tag auf der Venus ist länger als ihr Jahr (Umlauf um die Sonne).', 'Ihre dichte CO2-Atmosphäre erzeugt einen extremen Treibhauseffekt.']
        },
        { 
            name: 'Mars', 
            radius: 1.3 * SCENE_SCALE, 
            distance: 415 * SCENE_SCALE, 
            yearDays: 687, 
            texture: textureBasePath + '2k_mars.webp', 
            axialTilt: 25.19, 
            rotationSpeed: 0.97,
            ecc: 0.094, 
            perihelionAngle: 336.04 * degToRad, 
            orbitalInclination: 1.85,
            planetType_de: 'Innerer Gesteinsplanet',
            //Fakten
            name_de: 'Mars', earthCompareRadius: '0,53x Erde', radius_km: '3.389', distance_Mio_km: '227,9 Mio. km', umlaufzeit: '687 Erdtage', taglaenge: '24h 37min', temperatur: 'ca. -63°C',
            funFacts: ['Der Mars hat den höchsten Vulkan im Sonnensystem (Olympus Mons, 22km hoch).', 'Er hat zwei kleine Monde: Phobos und Deimos.', 'Seine rote Farbe kommt von Eisenoxid (Rost) im Boden.']
        },
        { 
            name: 'Jupiter', 
            radius: 28.0 * SCENE_SCALE, 
            distance: 900 * SCENE_SCALE, 
            yearDays: 4333, 
            texture: textureBasePath + '2k_jupiter.webp', 
            axialTilt: 3.13, 
            rotationSpeed: 2.43,
            ecc: 0.049, 
            perihelionAngle: 14.75 * degToRad, 
            orbitalInclination: 1.3,
            planetType_de: 'Äusserer Gasriese',
            moons: [
                { 
                    name: 'Io', 
                    radius: 0.715 * SCENE_SCALE, 
                    distance: 49.5 * SCENE_SCALE, 
                    speed: 0.565,
                    startAngle: Math.random() * Math.PI * 2, 
                    texture: moonTextureBasePath + 'jupiter_io.webp', 
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
                    texture: moonTextureBasePath + 'jupiter_europa.webp', 
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
                    texture: moonTextureBasePath + 'jupiter_ganymede.webp', 
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
                    texture: moonTextureBasePath + 'jupiter_callisto.webp', 
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
            texture: textureBasePath + '2k_saturn.webp', 
            axialTilt: 26.73, 
            rotationSpeed: 2.22,
            ecc: 0.057, 
            perihelionAngle: 92.43 * degToRad, 
            orbitalInclination: 2.49,
            planetType_de: 'Äusserer Gasriese',
            // UPDATE: Ring-Daten nun generisch hier
            ring: {
                texture: textureBasePath + 'Rings/2k_saturn_ring.webp',
                innerRadius: 1.2, 
                outerRadius: 2.7, 
            },
            moons: [
                { 
                    name: 'Titan', 
                    radius: 1.01 * SCENE_SCALE, 
                    distance: 144.9 * SCENE_SCALE, 
                    speed: 0.063, 
                    texture: moonTextureBasePath + 'saturn_titan.webp', 
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
            texture: textureBasePath + '2k_uranus_dunkler.webp', 
            axialTilt: 97.77, rotationSpeed: 1.38,
            ecc: 0.046, 
            perihelionAngle: 170.96 * degToRad, 
            orbitalInclination: 0.77,
            planetType_de: 'Äusserer Eisriese',
            // UPDATE: Uranus hat jetzt auch Ringe!
            ring: {
                texture: textureBasePath + 'Rings/uranus_ring_2.webp', 
                innerRadius: 1.05, 
                outerRadius: 3.4, 
            },
            //Fakten
            name_de: 'Uranus', earthCompareRadius: '4,0x Erde', radius_km: '25.362', distance_Mio_km: '2,87 Mrd. km', umlaufzeit: '84 Jahre', taglaenge: '17h 14min', temperatur: 'ca. -197°C',
            funFacts: ['Uranus "rollt" auf seiner Bahn, da seine Achse um fast 98 Grad geneigt ist.', 'Er ist ein Eisriese und erscheint durch Methan in seiner Atmosphäre blau-grün.', 'Auch Uranus hat Ringe, sie sind aber viel dunkler und dünner als die des Saturn.']
        },
        { 
            name: 'Neptune', 
            radius: 9.8 * SCENE_SCALE, 
            distance: 1980 * SCENE_SCALE, 
            yearDays: 60190, 
            texture: textureBasePath + '2k_neptune.webp', 
            axialTilt: 28.32, 
            rotationSpeed: 1.49,
            ecc: 0.009, 
            perihelionAngle: 44.97 * degToRad, 
            orbitalInclination: 1.77,
            planetType_de: 'Äusserer Eisriese',
            //Fakten
            name_de: 'Neptun', earthCompareRadius: '3,9x Erde', radius_km: '24.622', distance_Mio_km: '4,50 Mrd. km', umlaufzeit: '165 Jahre', taglaenge: '16h 6min', temperatur: 'ca. -201°C',
            funFacts: ['Auf Neptun wehen die schnellsten Winde im Sonnensystem (bis zu 2.100 km/h).', 'Er wurde 1846 durch mathematische Berechnungen entdeckt, bevor man ihn im Teleskop sah.']
        },
        {
            name: 'Pluto', 
            radius: 0.19 * SCENE_SCALE, 
            distance: 2340 * SCENE_SCALE, 
            yearDays: 90582, texture: textureBasePath + '2k_pluto.webp', 
            axialTilt: 122.5, 
            rotationSpeed: -0.156,
            ecc: 0.244, 
            perihelionAngle: 224.07 * degToRad, 
            orbitalInclination: 17.16, 
            planetType_de: 'Zwergplanet (Kuipergürtel)',
            //Fakten
            name_de: 'Pluto (Zwergplanet)', earthCompareRadius: '0,19x Erde', radius_km: '1.188', distance_Mio_km: '5,9 Mrd. km (im Schnitt)', umlaufzeit: '248 Jahre', taglaenge: '6,4 Tage', temperatur: 'ca. -229°C',
            funFacts: ['Pluto wurde 2006 vom Planeten zum "Zwergplaneten" umklassifiziert.', 'Seine Bahn ist so elliptisch, dass er zeitweise näher an der Sonne ist als Neptun.']
        }
    ];
}

function load3DModels() {
    
    // 1. Definiere alle Modelle, die wir laden wollen
    const modelsToLoad = [
        {
            id: 'comet',
            url: 'ImagesGit/3D-Models/comet_ice_compressed.glb',
            type: 'template', // Ein Schalter, damit wir wissen, dass dies eine Vorlage ist
            scale: EARTH_RADIUS * 0.15
        },

        {
            id: 'ufo',
            url: 'ImagesGit/3D-Models/ufo_spaceship.glb', 
            type: 'template'
        },

        {
            id: 'iss',
            url: 'ImagesGit/3D-Models/iss-mid_c.glb',
            label: 'ISS',
            scale: 1.3, // Sehr klein, wie gewünscht
            orbitTarget: 'earth', // (Reserviert für später)
            altitude: EARTH_RADIUS + 0.5, // 0.5 Einheiten über der Erde
            ambientIntensity: 0.7,
            inclination: 51.6, // Grad
            orbitsPerDay: 15.6, // Umkreisungen pro Tag
            updateType: 'earth_orbit', // Logik-Schalter für updatePositions
            focusDistance: 0.4
        },

        {
            id: 'hubble',
            url: 'ImagesGit/3D-Models/hubble_telescope-v1.glb', 
            label: 'Hubble', 
            scale: 0.00001, 
            altitude: EARTH_RADIUS + 1.0, // ~540 km (etwas höher als ISS)
            ambientIntensity: 0.7,
            inclination: 28.5, 
            orbitsPerDay: 15.2, 
            updateType: 'earth_orbit', 
            focusDistance: 0.2 
        },

        {
            id: 'voyager1',
            url: 'ImagesGit/3D-Models/nasa_voyager_space_probe.glb', 
            label: 'Voyager 1',
            scale: 0.01, 
            ambientIntensity: 15.0,
            updateType: 'static_rotation', 
            focusDistance: 0.3
        },

        {
            id: 'rocket_full', 
            url: 'ImagesGit/3D-Models/saturn_v.glb', 
            type: 'template',
            scale: ROCKET_SIZE_SCALE * 0.001
        },
        {
            id: 'rocket_stage2', 
            url: 'ImagesGit/3D-Models/saturn_v_1.glb', 
            type: 'template',
            scale: ROCKET_SIZE_SCALE * 0.001
        },
        {
            id: 'debris_stage1', 
            url: 'ImagesGit/3D-Models/saturn_v_1_dis.glb', 
            type: 'template',
            scale: ROCKET_SIZE_SCALE * 0.001
        },
        {
            id: 'debris_stage2', 
            url: 'ImagesGit/3D-Models/saturn_v_2_dis.glb', 
            type: 'template',
            scale: ROCKET_SIZE_SCALE * 0.001
        },
        {
            id: 'capsule', 
            url: 'ImagesGit/3D-Models/saturn_v_cockpit.glb', 
            type: 'template',
            scale: ROCKET_SIZE_SCALE * 0.00005
        },

        {
            id: 'astronaut',
            url: 'ImagesGit/3D-Models/astronaut_shadow.glb', 
            type: 'template',
            scale: 0.000015 * SCENE_SCALE 
        },

        {
            id: 'flag',
            url: 'ImagesGit/3D-Models/us_flag_shadow.glb', 
            type: 'template',
            scale: 0.004 * SCENE_SCALE 
        },

        {
            id: 'lander',
            url: 'ImagesGit/3D-Models/lunar_module_shadow.glb', 
            type: 'template',
            scale: 0.003 * SCENE_SCALE
        }
    ];

    
    // Draco Loader initialisieren 
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
    
    const loader = new THREE.GLTFLoader(loadingManager);
    loader.setDRACOLoader(dracoLoader);

    modelsToLoad.forEach(modelData => {
        loader.load(modelData.url, (gltf) => {

            //  Prüfen, ob es eine Vorlage ist 
            if (modelData.type === 'template') {
                if (modelData.scale) {
                    gltf.scene.scale.set(modelData.scale, modelData.scale, modelData.scale);
                }
                if (modelData.id === 'comet') {
                    cometModelTemplate = gltf.scene;
                    console.log("3D-Modell-Vorlage 'Komet' erfolgreich geladen.");
                }
                else if (modelData.id === 'ufo') {
                    ufoModelTemplate = gltf.scene;
                    ufoModelTemplate.traverse((child) => {
                        if (child.isMesh) {
                            child.material = child.material.clone();
                            child.material.emissive = new THREE.Color(0x555555); 
                            child.material.emissiveIntensity = 100;
                            if (child.material.metalness > 0.5) child.material.metalness = 0.4;
                            if (child.material.roughness < 0.5) child.material.roughness = 0.6;
                        }
                    });
                    console.log("Vorlage 'UFO' geladen.");
                }
                else if (modelData.id === 'rocket_full') { rocketFullTemplate = gltf.scene; }
                else if (modelData.id === 'rocket_stage2') { rocketStage2Template = gltf.scene; }
                else if (modelData.id === 'debris_stage1') { debris1Template = gltf.scene; }
                else if (modelData.id === 'debris_stage2') { debris2Template = gltf.scene; }
                else if (modelData.id === 'capsule') { capsuleModelTemplate = gltf.scene; }
                else if (modelData.id === 'astronaut') { astronautTemplate = gltf.scene; }
                else if (modelData.id === 'lander') { landerTemplate = gltf.scene; }
                else if (modelData.id === 'flag') { flagTemplate = gltf.scene; }

                return; 
            }
            
            const modelScene = gltf.scene;
            modelScene.scale.set(modelData.scale, modelData.scale, modelData.scale);
            
            if (modelData.id === 'iss') {
                modelScene.rotation.z = -(Math.PI / 2); 
                modelScene.traverse(child => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.metalness = 0.7; 
                    }
                });
            }

            if (modelData.id === 'hubble') {
                modelScene.rotation.z = -(Math.PI / 1.2); 
                modelScene.traverse(child => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.roughness = 0.8; 
                    }
                });
            }

            if (modelData.id === 'voyager1') {
                const dist = 3500 * SCENE_SCALE; 
                modelScene.lookAt(0, 0, 0);
                modelScene.traverse(child => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.metalness = 0.8; 
                        child.material.roughness = 0.4; 
                    }
                });

                modelScene.userData.info = {
                    name: 'Voyager 1',
                    earthCompareRadius: 'ca. 3,7m Durchmesser (Antenne)',
                    radius_km: '24,4 Mrd. km', 
                    umlaufzeit: 'N/A (Verlässt Sonnensystem)',
                    taglaenge: 'Seit 1977 unterwegs', 
                    parentName: 'Erde',
                    funFacts: [
                        'Ist das am weitesten entfernte von Menschen gebaute Objekt.',
                        'Hat das Sonnensystem verlassen und befindet sich im interstellaren Raum.',
                        'Trägt eine "Golden Record" mit Geräuschen und Bildern der Erde für Ausserirdische.'
                    ]
                };
                
                clickableObjects.push(modelScene);
            }

            if (modelData.id === 'iss') {
                modelScene.userData.info = {
                    name: 'ISS (Internationale Raumstation)',
                    earthCompareRadius: 'ca. 109m Spannweite', 
                    radius_km: 'ca. 400 km', 
                    umlaufzeit: 'ca. 90 Minuten', 
                    taglaenge: '16 pro Tag', 
                    parentName: 'Erde', 
                    funFacts: [
                        'Die ISS umkreist die Erde mit ca. 28.000 km/h.',
                        'Sie ist das größte künstliche Objekt im Erdorbit.',
                        'Astronauten an Bord erleben 16 Sonnenauf- und -untergänge pro Tag.'
                    ]
                };
                clickableObjects.push(modelScene);
            }

            if (modelData.id === 'hubble') {
                modelScene.userData.info = {
                    name: 'Hubble-Weltraumteleskop (HST)',
                    earthCompareRadius: 'ca. 13,2m lang', 
                    radius_km: 'ca. 540 km', 
                    umlaufzeit: 'ca. 95 Minuten', 
                    taglaenge: '15.2 pro Tag', 
                    parentName: 'Erde',
                    funFacts: [
                        'Startete 1990 und hat unser Bild vom Universum revolutioniert.',
                        'Fliegt außerhalb der Erdatmosphäre für gestochen scharfe Bilder.',
                        'Hat die berühmten "Deep Fields" mit Tausenden Galaxien fotografiert.'
                    ]
                };
                clickableObjects.push(modelScene);
            }
            
            const pivot = new THREE.Group();
            modelScene.position.x = modelData.altitude;

            if (modelData.id === 'voyager1') {
                const dist = 3500 * SCENE_SCALE;
                pivot.position.set(dist * 0.5, dist * 0.3, -dist * 0.8);
                modelScene.position.set(0, 0, 0); 
            }
            
            pivot.add(modelScene);

            if (modelData.id === 'iss' || modelData.id === 'hubble') {
                const intensity = modelData.ambientIntensity !== undefined ? modelData.ambientIntensity : 0.4;
                const localLight = new THREE.PointLight(0xffffff, intensity * 1.5, 50 * SCENE_SCALE);
                localLight.position.copy(modelScene.position);
                localLight.position.y += 2 * SCENE_SCALE; 
                localLight.position.z += 2 * SCENE_SCALE;
                pivot.add(localLight);
            }
            
            scene.add(pivot);

            const modelObject = {
                scene: modelScene, 
                pivot: pivot,      
                data: modelData    
            };
            loaded3DModels.push(modelObject);

            if (modelData.label) {
                const btnContainer = document.getElementById('human-objects-focus-buttons');
                const btn = document.createElement('button');
                btn.className = 'btn btn-planet'; 
                btn.textContent = modelData.label;
                
                btn.addEventListener('click', () => {
                    checkAndEndDemo();
                    setFocus(modelObject.scene); 
                });
                
                modelObject.focusButton = btn; 
                btnContainer.appendChild(btn);
            }
            
            if (humanObjectsCheckbox) {
                const isChecked = humanObjectsCheckbox.checked;
                modelScene.visible = isChecked;
                pivot.visible = isChecked; 
            }
            const asteroidsCheckbox = document.getElementById('asteroids-checkbox');
            asteroidsCheckbox.addEventListener('change', (e) => {
                if (asteroidInstancedMesh) {
                    asteroidInstancedMesh.visible = e.target.checked;
                }
            });
            
            if (asteroidInstancedMesh) {
                asteroidInstancedMesh.visible = asteroidsCheckbox.checked;
            }

            console.log(`3D-Modell '${modelData.id}' erfolgreich geladen.`);

        }, undefined, (error) => {
            console.error(`Fehler beim Laden des Modells '${modelData.id}':`, error);
        });
    });
}
