// ===========================================
// SHADER DEFINITIONEN
// ===========================================

// --- ERDE SHADER ---
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
    uniform sampler2D nightTexture; 
    uniform bool uHasNightTexture;
    uniform vec3 uSunPosition;
    uniform vec3 uObjectWorldPosition;
    uniform float uNightBrightness;
    uniform bool uSofiDemoActive;
    uniform vec3 uMoonPosition;
    uniform float uMoonRadius;
    uniform float uSunRadius;
    /*   FÜR JUPITERMONDE  */
    uniform bool uCastMoonShadows;
    uniform vec3 uMoonPositions[4]; /* Array für 4 Mondpositionen */
    uniform float uMoonRadii[4];   /* Array für 4 Mondradien */
    /*  ENDE   */
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
        
        float nightBrightness = uNightBrightness; // Slider-Wert 0.0 bis 0.9
        float lightMix = smoothstep(0.48, 0.59, intensity);
        vec4 dayColor = texture2D(dayTexture, vUv);
        
        /*  HIER STARTET DIE ÄNDERUNG  */
        
        vec4 finalColor; // Deklaration vorziehen

        if (uHasNightTexture) {
            // 1. () Tag/Nacht-Übergang nur für LICHTER (Nur für Erde)
            float lightsFade = smoothstep(0.43, 0.53, intensity); // 0.0 = Lichter an, 1.0 = Lichter aus

            // 3. Texturen laden
            vec4 nightMapColor = texture2D(nightTexture, vUv);

            // 4. Hintergrund (Land/Meer) berechnen
            vec4 ambientBackground = dayColor * nightBrightness; 

            // 5. () Lichter berechnen (mit Slider UND hartem Fade)
            float lightIntensity = 1.0 - nightBrightness;
            vec4 cityLights = nightMapColor * lightIntensity * (1.0 - lightsFade);

            // 6. Lichter-Maske (für "echt schwarz")
            float lightMask = smoothstep(0.1, 0.3, nightMapColor.r);

            // 7. Nacht-Textur zusammensetzen
            vec4 nightColor = mix(ambientBackground, cityLights, lightMask);
            
            // 8. Die fertige Nachtfarbe mit der Tagfarbe mischen
            finalColor = mix(nightColor, dayColor, lightMix);
            
        } else {
            // EINFACHE LOGIK FÜR ALLE ANDEREN PLANETEN
            // (keine Lichter, nur Abdunkeln)
            vec4 nightColor = dayColor * nightBrightness;
            finalColor = mix(nightColor, dayColor, lightMix);
        }
        
        /*  HIER ENDET DIE ÄNDERUNG  */

    
        
        // 9. (Unverändert) Sonnenfinsternis-Schatten
        if (uSofiDemoActive) {
            if (intensity > 0.01) { 
                float moonShadowIntensity = calculateMoonShadowIntensity(vWorldPosition, uMoonPosition, uMoonRadius, uSunPosition, uSunRadius);
                finalColor.rgb *= moonShadowIntensity;
            }
        }

        /*  Jupitermond-Schatten  */
        if (uCastMoonShadows) {
            float moonShadowIntensity = 1.0;
            
            /* Wende den Schatten für jeden der 4 Monde an */
            for(int i = 0; i < 4; i++) {
                if (uMoonRadii[i] > 0.0) {
                    
                    /*  KORREKTUR 2: Korrekte Tiefenberechnung  */
                    vec3 sunToMoon = uMoonPositions[i] - uSunPosition;
                    float moonDepth = length(sunToMoon);      // : Echte Distanz Sonne -> Mond
                    vec3 shadowAxis = sunToMoon / moonDepth;  // : Normalisieren über Distanz
                    
                    vec3 sunToPixel = vWorldPosition - uSunPosition;
                    float pixelDepth = dot(sunToPixel, shadowAxis); // : Echte Distanz Sonne -> Pixel (projiziert)
                    
                    /* * ALT WAR: if (depthInShadow > 0.0) { ... } 
                        * (depthInShadow war pixelDepth, aber der Check war falsch)
                        */
                    
                    // : Prüfen, ob der Pixel HINTER dem Mond ist (Sonne -> Mond -> Pixel)
                    if (pixelDepth > moonDepth) { 
                    
                        // ALT WAR: vec3 closestPointOnAxis = uSunPosition + shadowAxis * depthInShadow;
                        vec3 closestPointOnAxis = uSunPosition + shadowAxis * pixelDepth; // : pixelDepth verwenden
                        float pixelDistanceToAxis = distance(vWorldPosition, closestPointOnAxis);
                        
                        /*  KORREKTUR 1: Schärfere Schatten  */
                        // Wir setzen Umbra und Penumbra fast gleich für eine harte Kante
                        float umbraRadius = uMoonRadii[i] * 0.9;    // WAR: 0.4
                        float penumbraRadius = uMoonRadii[i] * 1.1; // WAR: 2.0 

                        if (pixelDistanceToAxis < penumbraRadius) {
                            if (pixelDistanceToAxis < umbraRadius) {
                                // Wir machen den Kernschatten auch dunkler
                                moonShadowIntensity *= 0.3; // WAR: 0.6 
                            } else {
                                float progress = (pixelDistanceToAxis - umbraRadius) / (penumbraRadius - umbraRadius);
                                moonShadowIntensity *= mix(0.3, 1.0, progress); // WAR: 0.6
                            }
                        }
                    }
                    /*  ENDE KORREKTUR 2  */
                }
            }
            
            /* Schatten nur auf der Tagseite anwenden */
            if (intensity > 0.48) { /* 0.48 ist der Start der "lightMix" */
                    finalColor.rgb *= moonShadowIntensity;
            }
        }
        /*  ENDE   */

        gl_FragColor = finalColor;
    }
`;

// --- OBERFLÄCHEN-OBJEKTE SHADER (Lander, Flagge etc.) ---
const surfaceObjectVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
        vUv = uv;
        // Normale in Weltkoordinaten umrechnen (wichtig für Lichtberechnung bei Rotation)
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
`;

const surfaceObjectFragmentShader = `
    uniform sampler2D map;
    uniform vec3 uColor;
    uniform bool uHasTexture;
    uniform vec3 uSunPosition;
    uniform vec3 uMoonCenter;        // NEU: Position des Mond-Mittelpunkts
    uniform float uNightBrightness;  // Slider Wert
    uniform float uDirectSunIntensity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        // 1. Textur oder Farbe laden
        vec4 texColor = vec4(1.0, 1.0, 1.0, 1.0);
        if (uHasTexture) {
            texColor = texture2D(map, vUv);
        }
        vec3 baseColor = texColor.rgb * uColor;

        // 2. Wo ist die Sonne?
        vec3 sunDir = normalize(uSunPosition - vWorldPosition);

        // 3. GLOBALE TAG/NACHT ERKENNUNG
        // Wir berechnen den Vektor vom Mond-Kern zur Oberfläche (das ist "Oben")
        vec3 surfaceUp = normalize(vWorldPosition - uMoonCenter);
        
        // Zeigt der Boden an dieser Stelle zur Sonne? (1 = Mittag, 0 = Dämmerung, -1 = Mitternacht)
        float globalDayFactor = dot(surfaceUp, sunDir);
        
        // Weicher Übergang (Terminator), damit es nicht flackert
        // 0.0 bis 1.0 (0 = Nachtseite, 1 = Tagseite)
        float isDaySide = smoothstep(-0.2, 0.2, globalDayFactor);

        // 4. LICHT BERECHNUNG
        
        // A) Direktes Sonnenlicht (Sorgt für 3D-Effekt und Schattenwurf des Objekts selbst)
        float directLight = max(0.0, dot(vNormal, sunDir));

        // B) Umgebungslicht (Ambient)
        // Wenn Tag: Helles Ambient (0.6), damit man auch im Schatten was sieht.
        // Wenn Nacht: Dunkles Ambient (Slider-Wert), damit es ganz schwarz werden kann.
        float ambientIntensity = mix(uNightBrightness, 0.6, isDaySide);

        // Gesamthelligkeit = Ambient + (Direktes Licht * Boost * Tag-Faktor)
        float totalLight = ambientIntensity + (directLight * uDirectSunIntensity * isDaySide);

        gl_FragColor = vec4(baseColor * totalLight, texColor.a);
    }
`;

// --- RING SHADER ---
const ringFragmentShader = `
    uniform sampler2D ringTexture;
    uniform vec3 uSunPosition;
    uniform vec3 uRingParentPosition; // Genericized from uSaturnPosition
    uniform float uRingParentRadius;  // Genericized from uSaturnRadius
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
        float shadowIntensity = getShadow(vWorldPosition, uRingParentPosition, uRingParentRadius, uSunPosition);
        vec4 nightColor = vec4(texColor.rgb * uNightBrightness, texColor.a);
        gl_FragColor = mix(nightColor, texColor, shadowIntensity);
        gl_FragColor.a *= texColor.a;
    }
`;

const planetWithRingFragmentShader = `
    uniform sampler2D dayTexture;
    uniform vec3 uSunPosition;
    uniform vec3 uObjectWorldPosition; 
    uniform float uNightBrightness;
    uniform vec3 uRingNormal;
    uniform float uRingInnerRadius;
    uniform float uRingOuterRadius;
    uniform float uRingShadowSoftness;
    uniform float uShadowTransparency;
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
            
            // Multipliziert die Maske mit unserem en Transparenz-Wert
            float finalMask = ringShadowMask * uShadowTransparency; 
            
            // Verwendet die e "finalMask"
            vec3 shadowedColor = mix(finalColor.rgb, nightColor.rgb * uShadowIntensityFactor, finalMask); 
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

// --- MOND SHADER ---
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

// --- KOMET SHADER (Aus der Klasse extrahiert) ---
const cometVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
        vUv = uv;
        vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const cometFragmentShader = `
    uniform sampler2D map;
    uniform vec3 uSunPosition;
    uniform float uNightBrightness; 
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
        vec4 texColor = texture2D(map, vUv);
        vec3 lightDir = normalize(uSunPosition - vWorldPosition);
        float sunLight = max(0.0, dot(vNormal, lightDir));
        float finalLight = max(sunLight, uNightBrightness);
        gl_FragColor = vec4(texColor.rgb * finalLight * 1.2, texColor.a);
    }
`;
