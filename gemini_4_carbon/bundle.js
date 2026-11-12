(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn2, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to2, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to2, key) && key !== except)
          __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to2;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/common-glsl-BEuQF3CN.js
  function m() {
    if (d) return d;
    const o = new Uint8Array(a * a * a);
    let e = 0;
    for (let t = 0; t < a; t++) {
      const p = t * 0.0973 - Math.floor(t * 0.0973);
      for (let r = 0; r < a; r++) {
        const u = r * 0.103 - Math.floor(r * 0.103);
        for (let i = 0; i < a; i++) {
          let l = i * 0.1031 - Math.floor(i * 0.1031), c = u, n = p;
          const f = l * (c + 33.33) + c * (n + 33.33) + n * (l + 33.33);
          l += f, c += f, n += f;
          const s = (l + c) * n;
          o[e++] = Math.round((s - Math.floor(s)) * 255);
        }
      }
    }
    return d = o, o;
  }
  function w(o) {
    return o.acquirePlugin("element:noise3d-lut", (e) => {
      const t = e.createTexture();
      return t ? (e.bindTexture(e.TEXTURE_3D, t), e.pixelStorei(e.UNPACK_ALIGNMENT, 1), e.texImage3D(e.TEXTURE_3D, 0, e.R8, a, a, a, 0, e.RED, e.UNSIGNED_BYTE, m()), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_WRAP_T, e.REPEAT), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_WRAP_R, e.REPEAT), e.bindTexture(e.TEXTURE_3D, null), t) : null;
    }, (e, t) => {
      e.deleteTexture(t);
    });
  }
  var a, d, x;
  var init_common_glsl_BEuQF3CN = __esm({
    "../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/common-glsl-BEuQF3CN.js"() {
      init_script();
      a = 64;
      d = null;
      x = `
uniform vec2 u_res;
uniform float u_time;
uniform mat3 u_invRot;
uniform vec3 u_boundRadii;
uniform float u_scale;
uniform vec2 u_centerShift;   // xy shift in aspect-normalized NDC units
uniform float u_dof;          // [0..1] macro Depth-of-Field blur intensity
uniform float u_fog;          // [0..1] directional camera depth fog / aerial fade
uniform float u_bloom;        // [0..1] directional backlit lens bloom / halation
uniform float u_refraction;   // [0..1] refraction, dispersion & internal TIR scale
uniform float u_detail;       // [0..1] surface micro-texture & internal fracture detail
uniform vec2 u_pointer;
uniform float u_isLightBackdrop;
uniform vec4 u_wake0;         // xy = head wake NDC, zw = pointer velocity in NDC/sec
uniform vec4 u_wake1;         // xy = mid wake NDC, z = wakeStrength, w = speed01
uniform vec2 u_wake2;         // xy = tail wake NDC
uniform vec4 u_tap;           // xy = tap anchor NDC, z = tapAgeSec, w = tapStrength
uniform highp sampler3D u_noise3D;

${Kn}

float sq(float x) {
  return x * x;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / max(k, 0.0001);
  return min(a, b) - h * h * k * 0.25;
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

// Hardware-accelerated Hermite-filtered 3D value noise via shared 64^3 R8 LUT
float valueNoise3D(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return textureLod(u_noise3D, (i + u + 0.5) * 0.015625, 0.0).r;
}

// Orthonormal 3D octave rotation prevents axis-aligned grid artifacts in FBM
const mat3 OCTAVE_ROT = mat3(
  0.00,  0.80,  0.60,
 -0.80,  0.36, -0.48,
 -0.60, -0.48,  0.64
);

float fbm3D(vec3 p) {
  float v = 0.0;
  float amp = 0.52;
  for (int i = 0; i < 3; i++) {
    v += amp * valueNoise3D(p);
    p = OCTAVE_ROT * p * 2.07 + vec3(3.17, 7.41, 1.93);
    amp *= 0.48;
  }
  return v;
}

/**
 * Multi-octave ridged 3D FBM with hyperbolic cusp rounding so crystalline striations
 * and cliff micro-ledges stay crisp without non-Lipschitz derivative discontinuities.
 */
float ridgedFbm3D(vec3 p) {
  float sum = 0.0;
  float amp = 0.56;
  float prev = 1.0;
  for (int i = 0; i < 3; i++) {
    float d = valueNoise3D(p) * 2.0 - 1.0;
    float n = 1.0 - sqrt(d * d + 0.014) * 0.993;
    n = n * n;
    sum += n * amp * prev;
    prev = clamp(n * 1.35, 0.25, 1.0);
    p = OCTAVE_ROT * p * 2.13 + vec3(5.23, 2.89, 8.11);
    amp *= 0.46;
  }
  return clamp(sum, 0.0, 1.0);
}

/** Lightweight 2-octave smooth-cusp ridged FBM for micro-normal taps. */
float ridgedFbm2(vec3 p) {
  float d0 = valueNoise3D(p) * 2.0 - 1.0;
  float n0 = 1.0 - sqrt(d0 * d0 + 0.014) * 0.993;
  n0 = n0 * n0;
  float sum = n0 * 0.62;
  float prev = clamp(n0 * 1.35, 0.25, 1.0);
  p = OCTAVE_ROT * p * 2.13 + vec3(5.23, 2.89, 8.11);
  float d1 = valueNoise3D(p) * 2.0 - 1.0;
  float n1 = 1.0 - sqrt(d1 * d1 + 0.014) * 0.993;
  sum += n1 * n1 * 0.34 * prev;
  return clamp(sum, 0.0, 1.0);
}

vec4 voronoiCell3D(vec3 x) {
  vec3 n = floor(x);
  vec3 f = fract(x);
  float f1 = 8.0;
  float f2 = 8.0;
  vec3 r1 = vec3(0.0);
  vec3 r2 = vec3(0.0);
  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash33(n + g);
        vec3 r = g + (0.15 + 0.70 * o) - f;
        float d = dot(r, r);
        if (d < f1) {
          f2 = f1;
          r2 = r1;
          f1 = d;
          r1 = r;
        } else if (d < f2) {
          f2 = d;
          r2 = r;
        }
      }
    }
  }
  float d1 = sqrt(f1);
  float d2 = sqrt(f2);
  float ridge = d2 - d1;
  vec3 smoothTilt = mix(0.5 * (r1 + r2), r1, smoothstep(0.0, 0.14, ridge));
  return vec4(smoothTilt, ridge);
}

/**
 * Returns C-infinity Boltzmann-blended 3D facet normal (xyz, unit length) and
 * continuous border distance (w = d2 - d1) so internal/back crystal walls refract
 * across flat polyhedral facets without 2-cell or 3-cell Voronoi seam jumps.
 */
vec4 voronoiFacet3D(vec3 x, float bevelWidth) {
  vec3 n = floor(x);
  vec3 f = fract(x);
  float f1 = 8.0;
  float f2 = 8.0;
  float invSharp = 1.0 / max(0.018, bevelWidth * 0.62);
  vec3 weightedN = vec3(0.0);
  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 cellId = n + g;
        vec3 o = hash33(cellId);
        vec3 r = g + (0.16 + 0.68 * o) - f;
        float d = dot(r, r);
        if (d < f1) {
          f2 = f1;
          f1 = d;
        } else if (d < f2) {
          f2 = d;
        }
        if (d < 1.85) {
          float dist = sqrt(d);
          float w = exp((0.65 - dist) * invSharp) * smoothstep(1.85, 1.40, d);
          if (w > 1e-4) {
            vec3 nCell = normalize(hash33(cellId + 17.3) * 2.0 - 1.0);
            weightedN += nCell * w;
          }
        }
      }
    }
  }
  float ridge = sqrt(f2) - sqrt(f1);
  return vec4(normalize(weightedN + vec3(0.0, 0.0, 1e-5)), ridge);
}

vec2 intersectEllipsoid(vec3 ro, vec3 rd, vec3 radii) {
  vec3 ocn = ro / radii;
  vec3 rdn = rd / radii;
  float a = dot(rdn, rdn);
  float b = dot(ocn, rdn);
  float c = dot(ocn, ocn) - 1.0;
  float h = b * b - a * c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2((-b - h) / a, (-b + h) / a);
}

vec4 calcInternalThicknessAndNormal(vec3 pFront, vec3 rdIn, vec3 geomNormal, vec3 coreScale) {
  vec3 coreRadii = u_boundRadii * coreScale;
  vec3 ocn = pFront / coreRadii;
  vec3 rdn = rdIn / coreRadii;
  float a = max(0.001, dot(rdn, rdn));
  float b = dot(ocn, rdn);
  float c = dot(ocn, ocn) - 1.0;
  float h = sqrt(max(0.01, b * b - a * c));
  float tChord = clamp((-b + h) / a, 0.06, 0.82);

  vec3 pBack = pFront + rdIn * tChord;
  vec3 nBack = normalize(pBack / (coreRadii * coreRadii) - geomNormal * 0.26);
  return vec4(nBack, tChord);
}

/**
 * Optically continuous refraction + total-internal-reflection blend for internal
 * crystal exit interfaces (eta > 1). Eliminates GLSL refract()'s binary k = 0
 * critical-angle step cliff that otherwise draws 1px jagged TIR contour rings.
 */
vec3 refractSmooth(vec3 I, vec3 N, float eta, out float tirWeight) {
  float c = max(0.0, dot(-I, N));
  float k = 1.0 - eta * eta * (1.0 - c * c);
  tirWeight = 1.0 - smoothstep(-0.01, 0.11, k);
  vec3 reflDir = reflect(I, N);
  if (k <= 0.0001) {
    return reflDir;
  }
  vec3 refrDir = normalize(eta * I + (eta * c - sqrt(k)) * N);
  return normalize(mix(refrDir, reflDir, tirWeight));
}

/**
 * Evaluates virtual macro camera metrics at pLocal:
 * - x (coc): Circle-of-Confusion [0..1] relative to front focal plane focalZ
 * - y (depthFog): Directional aerial depth fog [0..1] strictly on receding
 *   regions (pWorld.z < focalZ), keeping front ridges crystal-clear while
 *   distant flanks & plateaus fade mistily into the tonal backdrop
 * - z (pWorld.z): Camera-facing world depth (+Z = closer to lens)
 */
vec3 evalVirtualCamera(vec3 pLocal, float focalZ, float dofAmt, float fogAmt) {
  vec3 pWorld = transpose(u_invRot) * pLocal;
  float zDelta = focalZ - pWorld.z; // > 0 when receding behind focal plane
  float radial = max(0.0, length(pWorld.xy) - 0.24);

  float defocusDist = abs(zDelta) + radial * 0.38;
  float coc = dofAmt > 0.001
    ? clamp(smoothstep(0.035, 0.44, defocusDist) * dofAmt, 0.0, 1.0)
    : 0.0;

  float recedeDist = max(0.0, zDelta) + radial * 0.24 * smoothstep(-0.08, 0.22, zDelta);
  float depthFog = fogAmt > 0.001
    ? clamp(smoothstep(0.03, 0.46, recedeDist) * fogAmt, 0.0, 1.0)
    : 0.0;

  return vec3(coc, depthFog, pWorld.z);
}

float calcMacroCoC(vec3 pLocal, float dofAmount) {
  return evalVirtualCamera(pLocal, 0.16, dofAmount, 0.0).x;
}

float evalMacroSilhouetteAlpha(
  float dRayMin,
  float pixelWidth,
  float coc,
  float cocSpread
) {
  float coneWidth = pixelWidth * 0.92 + coc * cocSpread;
  return 1.0 - smoothstep(-coneWidth * 0.85, coneWidth, dRayMin);
}

struct ElementWake {
  float strength; // localized 3-node wake intensity [0..1.5]
  float head;     // tight focal spot right under live cursor [0..1]
  float tail;     // cooling / re-freezing wake trail [0..1]
  float speed;    // normalized pointer sweep speed [0..1]
  vec2 dir;       // unit screen/NDC flow direction
  vec2 toHead;    // scale-normalized vector from wake head to pixel
};

/**
 * Evaluates the 3-node spring-lagged pointer wake in aspect-normalized crystal
 * NDC space. Uniform early-out costs 0.00 ms when unhovered or disabled.
 */
ElementWake evalElementWake(vec2 ndc, vec3 pWorld, float elemScale) {
  ElementWake w;
  w.strength = 0.0;
  w.head = 0.0;
  w.tail = 0.0;
  w.speed = 0.0;
  w.dir = vec2(0.0, 1.0);
  w.toHead = vec2(0.0);

  if (u_wake1.z <= 0.001) {
    return w;
  }

  float invS = 1.0 / max(0.45, elemScale);
  vec2 d0 = (ndc - u_wake0.xy) * invS;
  vec2 d1 = (ndc - u_wake1.xy) * invS;
  vec2 d2 = (ndc - u_wake2.xy) * invS;

  float h0 = exp(-dot(d0, d0) / (0.165 * 0.165));
  float h1 = exp(-dot(d1, d1) / (0.215 * 0.215));
  float h2 = exp(-dot(d2, d2) / (0.260 * 0.260));

  float frontGate = 0.58 + 0.42 * smoothstep(-0.26, 0.18, pWorld.z);
  w.head = h0 * min(1.35, u_wake1.z);
  w.tail = max(h1 * 0.85, h2 * 0.65) * min(1.35, u_wake1.z);
  w.strength = clamp((h0 * 0.64 + h1 * 0.34 + h2 * 0.22) * u_wake1.z * frontGate, 0.0, 1.45);
  w.speed = u_wake1.w;
  w.toHead = d0;

  vec2 radial = d0 + vec2(0.0, 0.04);
  vec2 flowVec = u_wake0.zw * 0.65 + radial * 1.15 + vec2(0.0, 0.12);
  w.dir = normalize(flowVec + vec2(0.0001, 0.0001));
  return w;
}

struct CrystalTapWave {
  float isLive;   // 0.0 when idle (uniform-gated zero-cost path)
  float ring;     // primary + harmonic acoustic wave crest [0..1.5]
  float flash;    // brief focal impact glint at tap origin [0..1.5]
  float dist;     // scale-normalized radial distance from tap origin
  float front;    // current wave front radius in scale-normalized NDC
  vec2 dir;       // unit radial direction away from tap origin
};

/**
 * Evaluates an expanding 3D acoustic shockwave through the crystal from u_tap.xy.
 * Uniform early-out costs 0.00 ms whenever u_tap.z >= 2.8 or disabled.
 */
CrystalTapWave evalCrystalTap(vec2 ndc, vec3 pWorld, float elemScale) {
  CrystalTapWave tw;
  tw.isLive = 0.0;
  tw.ring = 0.0;
  tw.flash = 0.0;
  tw.dist = 0.0;
  tw.front = 0.0;
  tw.dir = vec2(0.0, 1.0);

  if (u_tap.z >= 2.8 || u_tap.w <= 0.002) {
    return tw;
  }

  tw.isLive = 1.0;
  float invS = 1.0 / max(0.45, elemScale);
  vec2 delta = (ndc - u_tap.xy) * invS;
  float dist = length(delta) + max(0.0, 0.18 - pWorld.z) * 0.08;
  float front = 0.025 + 0.72 * (1.0 - exp(-u_tap.z * 2.25));
  float width = 0.052 + u_tap.z * 0.042;
  float onset = smoothstep(0.0, 0.025, u_tap.z);
  float decay = exp(-u_tap.z * 1.75) * onset * u_tap.w;

  float primary = exp(-sq((dist - front) / width));
  float echoFront = max(0.0, front - 0.13);
  float echo = exp(-sq((dist - echoFront) / (width * 0.85))) * 0.38 * smoothstep(0.06, 0.22, u_tap.z);

  tw.dist = dist;
  tw.front = front;
  tw.dir = normalize(delta + vec2(0.0001, 0.0001));
  tw.ring = (primary + echo) * decay;
  tw.flash = exp(-dot(delta, delta) / (0.135 * 0.135)) * exp(-u_tap.z * 5.2) * onset * u_tap.w;
  return tw;
}
`;
    }
  });

  // ../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/carbon-CpW-bJkR.js
  var carbon_CpW_bJkR_exports = {};
  __export(carbon_CpW_bJkR_exports, {
    carbonSpec: () => ye
  });
  function d2(a2, t) {
    const e = Math.hypot(a2, t) || 1;
    return [a2 / e, t / e];
  }
  function _(a2, t, e) {
    const s = Math.hypot(a2, t, e) || 1;
    return [a2 / s, t / s, e / s];
  }
  var g, F, k, de, B, P, fe, ue, ve, he, ye;
  var init_carbon_CpW_bJkR = __esm({
    "../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/carbon-CpW-bJkR.js"() {
      init_script();
      init_common_glsl_BEuQF3CN();
      g = Math.PI / 180;
      F = 12;
      k = 6;
      de = 8;
      B = 8;
      P = 7;
      fe = [[0.0749, 0.0274, 0.9968, 0.24], [0.0749, 0.0274, 0.9968, 0.24], [0.8891, 0.3499, 0.295, 0.269], [0.9575, 0.0373, 0.2859, 0.222], [-0.9617, 0.2186, 0.1654, 0.319], [-0.6829, -0.7164, 0.1431, 0.35], [-0.4981, 0.8378, 0.2235, 0.47], [0.547, 0.7849, 0.2911, 0.402], [-0.5096, -0.8474, 0.149, 0.39], [0.7622, -0.5991, 0.2451, 0.388], [-0.282, 0.125, -0.951, 0.218], [0.436, -0.059, -0.898, 0.218]];
      ue = [[0.52, 0.64, 0.56, 0.02], [-0.64, 0.5, 0.58, -0.03], [0.3, -0.76, 0.57, 0.04], [-0.7, -0.42, 0.57, -0.02], [0.77, 0.18, 0.61, 0.01], [-0.36, 0.81, 0.46, -0.04], [0.54, -0.54, -0.64, 0.03], [-0.58, 0.52, -0.63, -0.02]];
      ve = [[0.03, -0.04, -0.01], [0.22, -0.14, 0.011], [-0.23, 0.14, 0.011], [-0.2, -0.16, 0.013], [0.21, 0.15, 0.013], [0.05, -0.27, 0.036], [-0.05, 0.26, 0.038]];
      he = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

${x}

uniform vec3 u_chipPhase;
uniform vec4 u_subdivPhase;
uniform vec4 u_hullPlanes[12];
uniform vec4 u_chiselPlanes[8];
uniform vec4 u_internalPlanes01[2];
uniform vec4 u_pavilionPlanes[7];

const float CARBON_IOR = 2.04;

// Orthonormal transform mapping local crystal space p into upright canonical
// reference coordinates u = transpose(R_defaultPose) * p (strictly rigid in 3D!).
const mat3 CANON_WORLD = mat3(
   0.9718, -0.2266, -0.0668,
   0.2244,  0.9735, -0.0436,
   0.0749,  0.0274,  0.9968
);
const vec3 CANON_AXIS_X = vec3(0.9718, 0.2244, 0.0749);
const vec3 CANON_AXIS_Y = vec3(-0.2266, 0.9735, 0.0274);

const vec2 N_CR_L = vec2(-0.1400279, 0.9901475);
const vec2 N_CR_HEX = vec2(0.6198605, 0.7847120);
const vec2 N_NOTCH_315 = vec2(-0.5602307, 0.8283366);
const vec2 N_FAULT_VEC = vec2(-0.2960858, 0.9551613);
const vec2 N_UP_STEP = vec2(-0.9622703, 0.2720953);

float crystalBellCs(vec2 p, vec2 c, vec2 invR, vec2 cs) {
  vec2 d = p - c;
  vec2 q = vec2(cs.x * d.x + cs.y * d.y, -cs.y * d.x + cs.x * d.y) * invR;
  return exp(-dot(q, q) * 1.45);
}

float crystalBell2D(vec2 p, vec2 c, vec2 r, float angleRad) {
  return crystalBellCs(p, c, 1.0 / r, vec2(cos(angleRad), sin(angleRad)));
}

// Lightweight 2-octave FBM sharing fbm3D's exact first two octaves (centered at ~0.48)
// for blurred coordinate warps and soft cloud veils where octave 3 contributes < 1/255.
float fbm2(vec3 p) {
  float v = 0.52 * valueNoise3D(p);
  p = OCTAVE_ROT * p * 2.07 + vec3(3.17, 7.41, 1.93);
  v += 0.2496 * valueNoise3D(p) + 0.058;
  return v;
}

vec3 unpackCellOffset(int idx) {
  int k = idx / 9;
  int rem = idx - k * 9;
  int j = rem / 3;
  int i = rem - j * 3;
  return vec3(float(i - 1), float(j - 1), float(k - 1));
}

// Exact 27-cell 3D Voronoi matching voronoiFacet3D bit-for-bit on cell sites and border
// distance while storing only 3 compact integer indices in the inner loop (saving 13 live
// VGPRs for higher GPU occupancy) and evaluating sqrt/exp/normal-hash only 3 times.
vec4 voronoiFacet3DFast(vec3 x, float bevelWidth) {
  vec3 n = floor(x);
  vec3 f = fract(x);
  float d1 = 8.0, d2 = 8.0, d3 = 8.0;
  int idx1 = 13, idx2 = 13, idx3 = 13;
  int flatIdx = 0;
  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash33(n + g);
        vec3 r = g + (0.16 + 0.68 * o) - f;
        float d = dot(r, r);
        if (d < d1) {
          d3 = d2; idx3 = idx2;
          d2 = d1; idx2 = idx1;
          d1 = d;  idx1 = flatIdx;
        } else if (d < d2) {
          d3 = d2; idx3 = idx2;
          d2 = d;  idx2 = flatIdx;
        } else if (d < d3) {
          d3 = d;  idx3 = flatIdx;
        }
        flatIdx++;
      }
    }
  }
  float invSharp = 1.0 / max(0.018, bevelWidth * 0.62);
  float s1 = sqrt(d1);
  float s2 = sqrt(d2);
  vec3 c1 = n + unpackCellOffset(idx1);
  vec3 weightedN = normalize(hash33(c1 + 17.3) * 2.0 - 1.0) * smoothstep(1.85, 1.40, d1);
  if (d2 < 1.85) {
    float w2 = exp(max(-24.0, (s1 - s2) * invSharp)) * smoothstep(1.85, 1.40, d2);
    vec3 c2 = n + unpackCellOffset(idx2);
    weightedN += normalize(hash33(c2 + 17.3) * 2.0 - 1.0) * w2;
  }
  if (d3 < 1.85) {
    float s3 = sqrt(d3);
    float w3 = exp(max(-24.0, (s1 - s3) * invSharp)) * smoothstep(1.85, 1.40, d3);
    if (w3 > 2e-4) {
      vec3 c3 = n + unpackCellOffset(idx3);
      weightedN += normalize(hash33(c3 + 17.3) * 2.0 - 1.0) * w3;
    }
  }
  return vec4(normalize(weightedN + vec3(0.0, 0.0, 1e-5)), s2 - s1);
}

// Closed-form Cyrus-Beck slab intersection with the expanded 12-plane convex hull.
// Conservative per-plane expansion covers worst-case FBM + seed jitter across all 99 seeds
// while discarding ~80% of scissored background rays in 12 dot products.
vec2 intersectCarbonHull(vec3 ro, vec3 rd, float polyBand) {
  float tEnter = 0.0;
  float tExit = 100.0;
  for (int i = 0; i < 12; i++) {
    vec4 pl = u_hullPlanes[i];
    float pad = (i <= 1 || i >= 10) ? (0.024 + polyBand) : (0.042 + polyBand);
    float num = (pl.w + pad) - dot(ro, pl.xyz);
    float den = dot(rd, pl.xyz);
    if (abs(den) < 1e-6) {
      if (num < 0.0) return vec2(1.0, -1.0);
    } else {
      float tHitPlane = num / den;
      if (den < 0.0) {
        tEnter = max(tEnter, tHitPlane);
      } else {
        tExit = min(tExit, tHitPlane);
      }
      if (tExit < tEnter) return vec2(1.0, -1.0);
    }
  }
  return vec2(tEnter, tExit);
}

/**
 * Spatially intermittent fracture subdivision field S(u) in [0..1]:
 * Provides subtle baseline mineral facet relief across the collar while concentrating
 * intricate prism splinters & stepped cleavage chips in the 3:15-5:00 right pocket,
 * the 10:00-11:20 upper-left steps, and conchoidal flutes at 9:35 & 7:30.
 */
float evalSubdivisionMask(vec3 u) {
  // Gate right prism splinters above y = -0.25 so the 5:15 -> 6:00 base stays solid pearlescent quartz!
  float midRightPrism  = crystalBell2D(u.xy, vec2(0.105, -0.118), vec2(0.088, 0.125), -0.10) * smoothstep(-0.27, -0.18, u.y);
  float innerLeftSteps = crystalBell2D(u.xy, vec2(-0.135, 0.215), vec2(0.078, 0.150), 0.22);
  float midLeftFlutes  = crystalBell2D(u.xy, vec2(-0.265, 0.095), vec2(0.068, 0.105), 0.40);
  float lowLeftFlutes  = crystalBell2D(u.xy, vec2(-0.215, -0.215), vec2(0.058, 0.088), -0.52);

  float calmInner800   = crystalBell2D(u.xy, vec2(-0.175, -0.140), vec2(0.070, 0.085), -0.55);
  float calmBottomB1   = crystalBell2D(u.xy, vec2(-0.005, -0.355), vec2(0.115, 0.095), -0.35);
  float calmWall215    = crystalBell2D(u.xy, vec2(0.175, 0.165), vec2(0.080, 0.125), -0.22);

  float baseMask = clamp(
    0.22 +
    midRightPrism * 1.48 +
    innerLeftSteps * 1.32 +
    midLeftFlutes * 0.80 +
    lowLeftFlutes * 0.56 -
    calmInner800 * 0.65 -
    calmBottomB1 * 0.88 -
    calmWall215 * 0.62,
    0.0,
    1.0
  );

  float varied = baseMask;
  if (u_subdivPhase.w > 0.001) {
    float seedMod = valueNoise3D(u * 3.8 + u_subdivPhase.xyz);
    varied = mix(
      baseMask,
      clamp(baseMask * (0.65 + 0.78 * seedMod) + (seedMod - 0.56) * 0.26, 0.0, 1.0),
      u_subdivPhase.w
    );
  }
  return varied * (0.42 + 0.58 * u_detail);
}

struct ChiselSurface {
  float targetZ;
  float collarMask;     // 0 on central cleavage table & upper basin, 1 on chiseled bevels
  float semiClearBevel; // [0..1] translucency on 8:00-7:00, 9:15, 6:00 trapezoid & 3:20 shard
  float ridgeCrest;     // [0..1] crisp ~1.1px optical cleavage & convex ridge edge catch
  float dFault;         // signed distance to the 10:00 -> 2:00 central cleavage step
  vec3 normalU;         // analytic beveled piecewise-planar normal in canonical upright space
  vec3 macroNormalU;    // analytic macro SDF normal without fault/step lip Perturbation
};

/**
 * Evaluates the chiseled crystal architecture of the Carbon monolith:
 * - Sleek, open upper & lower cleavage windows separated by a razor-crisp ~1.1px fault step
 *   from (-0.128, +0.096) to (+0.136, +0.178)
 * - Exact trihedral Y-junctions at 8:35 (-0.222, -0.036 -> sharp -0.354, -0.054 hull apex!),
 *   7:00 (-0.074, -0.275), 5:30 (+0.068, -0.355), 10:00 (-0.128, +0.096 -> -0.215, +0.305),
 *   and 3:15 (+0.048, -0.042)
 * - Concave min-blend at the 10:00 inner left corner eliminates any unwanted 9:20 ridge!
 */
ChiselSurface evalChiseledCrystal(vec3 u, float bevelScale, float subdiv) {
  vec4 cp0 = u_chiselPlanes[0];
  vec4 cp1 = u_chiselPlanes[1];
  vec4 cp2 = u_chiselPlanes[2];
  vec4 cp3 = u_chiselPlanes[3];
  vec4 cp4 = u_chiselPlanes[4];
  vec4 cp5 = u_chiselPlanes[5];
  vec4 cp6 = u_chiselPlanes[6];
  vec4 cp7 = u_chiselPlanes[7];

  float zTableBase = 0.194 - 0.012 * u.x - 0.008 * u.y;
  float faultLine = cp0.w + cp1.w * u.x +
                    (valueNoise3D(vec3(u.xy * 3.6, u.z * 0.8) + u_chipPhase) - 0.5) * 0.0022;
  float dFault = u.y - faultLine;

  // --- PART A: Chiseled Left, Top & Bottom Gemstone Crown Cuts (c_k > 0 outside window) ---
  // 1) LL1 (8:35 -> 7:00 semi-translucent aqua bevel): (-0.222,-0.036) -> (-0.074,-0.275)
  vec2 nLL1 = cp0.xy;
  float rawLL1 = dot(nLL1, u.xy) - cp0.z;
  float cLL1 = 0.380 * rawLL1;

  // 2) UL1 (8:35 -> 10:00 seafoam/lit bevel) & UL2 (10:00 -> 11:10 stepped cliff):
  // Combined via concave min-blend (-smax) at the 10:00 inner bend so cLL1 == cUL1 runs
  // dead-straight to (-0.354, -0.054) while cUL1 == cUL2 rises steeply up-left to 10:35!
  vec2 nUL1 = cp1.xy;
  float fluteGate = smoothstep(0.015, 0.080, u.y) * smoothstep(0.018, 0.070, dot(nUL1, u.xy) - 0.160);
  float flutePhase = u.y * 42.0 + u.x * 18.0 + u_chipPhase.y;
  float flute930 = sin(flutePhase) * 0.0028 * fluteGate;
  float rawUL1 = dot(nUL1, u.xy) - cp1.z + flute930;
  float cUL1 = 0.476 * rawUL1;
  vec2 gUL1 = 0.476 * nUL1 + vec2(0.03, 0.08) * cos(flutePhase) * fluteGate;

  vec2 nUL2 = cp2.xy;
  float zig1 = exp(-sq((u.y - 0.205) * 26.31579)) * 0.007 -
               exp(-sq((u.y - 0.285) * 27.77778)) * 0.006;
  float stepCoord = u.y * 16.0 - u.x * 4.5 + u_chipPhase.x;
  float stepFrac = fract(stepCoord);
  float stepLedge = (floor(stepCoord) + smoothstep(0.16, 0.48, stepFrac) - stepCoord) * 0.0042 * (0.40 + 0.60 * subdiv);
  float rawUL2 = dot(nUL2, u.xy) - (cp2.z - zig1);
  float cUL2 = 0.831 * rawUL2 - stepLedge;
  vec2 gUL2 = 0.831 * nUL2 - vec2(-0.03, 0.09) * exp(-sq((stepFrac - 0.32) * 6.66667)) * subdiv;

  float ulBevel = max(0.0011, bevelScale * 0.60);
  float cUL = -smax(-cUL1, -cUL2, ulBevel * 2.0);
  float ulBlend = smoothstep(-ulBevel * 1.8, ulBevel * 1.8, cUL1 - cUL2);
  vec2 gUL = mix(gUL1, gUL2, ulBlend);
  float ulRidgeDist = (cUL > 0.0) ? abs(cUL1 - cUL2) / max(0.25, length(gUL1 - gUL2)) * 2.10 : 10.0;

  // 4) B1 (7:00 -> 5:30 bottom-center periwinkle trapezoid): (-0.074,-0.275) -> (+0.068,-0.355)
  vec2 nB1 = cp3.xy;
  float rawB1 = dot(nB1, u.xy) - cp3.z;
  float cB1 = 0.32 * rawB1;

  // 5) B2 (6:35 -> 6:00 lower-left specular rim facet): catches focused 6:35 wet-ice flash
  vec2 nB2 = cp4.xy;
  float rawB2 = dot(nB2, u.xy) - cp4.z;
  float cB2 = 0.52 * rawB2;

  // 6) BR (5:30 -> 5:00 lower-right collar facet): slopes so cB1 == cBR angles down-left to the 6:00 tip!
  vec2 nBR = cp5.xy;
  float rawBR = dot(nBR, u.xy) - cp5.z;
  float cBR = 0.58 * rawBR;

  // 7) Organic cellular summit crown (11:10 -> 12:35) & 1:00 concave slate-blue hexagonal pocket:
  float nCrown = (fbm3D(vec3(u.xy * vec2(7.6, 6.8), u.z * 1.2) + u_chipPhase) - 0.48) * 1.45;
  float cCrownL = 0.44 * (dot(N_CR_L, u.xy) - (0.382 - nCrown * 0.038));
  float hexPocket = crystalBellCs(u.xy, vec2(0.140, 0.340), vec2(20.0, 18.51852), vec2(0.9492354, -0.3145666));
  float cCrownHex = 0.54 * (dot(N_CR_HEX, u.xy) - (0.382 - nCrown * 0.026)) + hexPocket * 0.018;

  float cArr[8];
  vec2 cgArr[8];
  cArr[0] = 0.0;       cgArr[0] = vec2(0.0);
  cArr[1] = cLL1;      cgArr[1] = 0.380 * nLL1;
  cArr[2] = cUL;       cgArr[2] = gUL;
  cArr[3] = cB1;       cgArr[3] = 0.32 * nB1;
  cArr[4] = cB2;       cgArr[4] = 0.52 * nB2;
  cArr[5] = cBR;       cgArr[5] = 0.58 * nBR;
  cArr[6] = cCrownL;   cgArr[6] = 0.44 * N_CR_L;
  cArr[7] = cCrownHex; cgArr[7] = 0.54 * N_CR_HEX;

  float c1 = -10.0;
  float c2 = -10.0;
  int cIdx1 = 0;
  int cIdx2 = 0;
  for (int k = 0; k < 8; k++) {
    float ck = cArr[k];
    if (ck > c1) {
      c2 = c1; cIdx2 = cIdx1;
      c1 = ck; cIdx1 = k;
    } else if (ck > c2) {
      c2 = ck; cIdx2 = k;
    }
  }

  // Continuous C-infinity cloud melt in the upper summit (u.y > 0.24) prevents any cIdx swap seam!
  float crownSoft = smoothstep(0.23, 0.36, u.y) * smoothstep(-0.12, 0.08, u.x) * 0.036;
  float cBevel = max(0.00075 + crownSoft, bevelScale * 0.42);
  float invCB = 1.0 / cBevel;
  vec2 cGradSum = vec2(0.0);
  float cwSum = 0.0;
  for (int k = 0; k < 8; k++) {
    float w = exp(max(-26.0, (cArr[k] - c1) * invCB));
    cGradSum += cgArr[k] * w;
    cwSum += w;
  }
  vec2 cGrad = cGradSum / max(1e-6, cwSum);
  float cutSmooth = smax(c1, c2, cBevel * 1.6);

  // Outer convex bevel-to-bevel ridges stay crisp; inner table edge (cIdx==0) is 2.6x subtler so it
  // reads through real tonal/refractive contrast rather than drawn white lines!
  float isTopEdge = (cIdx1 >= 6 || cIdx2 >= 6) ? 1.0 : 0.0;
  float rawCrownDist = (c1 - c2) / max(0.20, length(cgArr[cIdx1] - cgArr[cIdx2]));
  float crownRidgeDist = isTopEdge > 0.5
    ? 10.0
    : min(ulRidgeDist, (cIdx1 == 0 || cIdx2 == 0) ? rawCrownDist * 2.50 : rawCrownDist);

  // --- PART B: Two-Sided Sculpted Right Frosted Ridge & 3:15 Prow (1:20 -> 3:15 -> 5:30) ---
  vec2 nRUp = cp6.xy;
  float dRUp = dot(nRUp, u.xy) - cp6.z;

  vec2 nRLow = cp7.xy;
  float dRLow = dot(nRLow, u.xy) - cp7.z;

  float rBevel = max(0.00085, bevelScale * 0.44);
  float dRightIn = -smax(-dRUp, -dRLow, rBevel * 1.9);
  vec2 nRightIn = normalize(mix(nRUp, nRLow, smoothstep(-rBevel * 1.7, rBevel * 1.7, dRUp - dRLow)));

  // Iconic diagonal fracture step running from the 3:15 prow (+0.044, -0.042) up-right to 2:45!
  float dNotch315 = dot(N_NOTCH_315, u.xy - vec2(0.044, -0.042));
  float notchMask = smoothstep(-0.004, 0.014, dRightIn) * exp(-sq((u.y + 0.01) * 7.40741));
  float notchStep = -0.0085 * smoothstep(-rBevel * 1.5, rBevel * 1.5, -dNotch315) * notchMask;
  float notchDen = max(0.0020, rBevel * 1.9);
  vec2 notchGrad = 0.0085 * N_NOTCH_315 * exp(-sq(dNotch315 / notchDen)) / notchDen * notchMask;
  float notchRidgeDist = (dRightIn > 0.0) ? abs(dNotch315) * 1.45 : 10.0;

  // Hyperbolic quartz crest across the right ridge:
  // - Inner half (0 < xR < 0.070) faces inward/up-left in cool lavender-periwinkle
  // - Outer half (xR > 0.074) faces right/up-right into the 1:30 key-rim light
  float topTerminate = 1.0 - smoothstep(0.265, 0.315, u.y);
  float xR = max(0.0, dRightIn) * topTerminate;
  float sCrest = xR - 0.070;
  float crestHyp = sqrt(sCrest * sCrest + 0.00042);
  float crest0 = 0.07294; // sqrt((-0.070)^2 + 0.00042)
  float rHeight = (-0.08 * xR + 0.45 * (crest0 - crestHyp) + notchStep) * topTerminate;
  float drDx = (-0.08 - 0.45 * (sCrest / crestHyp)) * topTerminate;

  float onRightRidge = smoothstep(-rBevel * 0.55, rBevel * 1.15, dRightIn) * topTerminate;
  vec2 rSlopeGrad = (drDx * nRightIn + notchGrad) * onRightRidge;

  // Crisp ~1.1px cleavage step across the 10:00 -> 2:00 central fault + 10:00 -> 11:00 inner glass step
  float inWindow = 1.0 - clamp(max(smoothstep(0.0, 0.006, c1), onRightRidge), 0.0, 1.0);
  float faultW = max(0.0011, bevelScale * 0.60);
  float faultBlend = smoothstep(-faultW, faultW, dFault) * inWindow;
  float faultLip = exp(-sq(dFault / (faultW * 1.30))) * inWindow;

  float dUpStep = dot(N_UP_STEP, u.xy - vec2(-0.128, 0.096));
  float upStepMask = smoothstep(-0.002, 0.008, dFault) * exp(-sq((u.y - 0.18) * 10.52632)) * inWindow;
  float upStepLip = exp(-sq(dUpStep / (faultW * 1.40))) * upStepMask;

  vec2 tableSlope = mix(vec2(-0.012, -0.008), vec2(-0.046, 0.135), faultBlend)
                    - N_FAULT_VEC * (0.16 * faultLip)
                    - N_UP_STEP * (0.16 * upStepLip);

  float zCombined = zTableBase - cutSmooth + rHeight;
  vec2 totalDzDxy = tableSlope - cGrad + rSlopeGrad;

  float topCrownBlend = smoothstep(0.24, 0.36, u.y) * smoothstep(-0.12, 0.08, u.x);
  float collar = clamp(max(
    mix(smoothstep(-bevelScale * 0.50, bevelScale * 1.10, c1), smoothstep(-0.045, 0.052, c1), topCrownBlend),
    onRightRidge
  ), 0.0, 1.0);

  // Subtle ~1.0px optical edge catch on physical ridges (reduced on inner table frame to avoid chalk outlines)
  float rightCliffLip = (topTerminate > 0.25) ? abs(dRightIn - 0.0018) * 1.55 / max(0.25, topTerminate) : 10.0;
  float faultEdgeDist = (inWindow > 0.25) ? min(abs(dFault) * 2.10, (upStepMask > 0.15 ? abs(dUpStep) * 2.10 : 10.0)) : 10.0;
  float minConvexRidge = min(min(crownRidgeDist, notchRidgeDist), min(rightCliffLip, faultEdgeDist));
  float ridgeW = max(0.0012, bevelScale * 0.95);
  float ridgeCrest = exp(-minConvexRidge / ridgeW);

  // Semi-translucent inner frosted bevels (lets seafoam, aqua, cobalt & violet shine through!)
  float semiClear = 0.0;
  if (cIdx1 == 1 && onRightRidge < 0.3) {
    semiClear = (1.0 - smoothstep(0.024, 0.092, rawLL1)) * 0.92;
  } else if (cIdx1 == 2 && onRightRidge < 0.3) {
    float rawActiveUL = mix(rawUL1, rawUL2, ulBlend);
    semiClear = (1.0 - smoothstep(0.020, 0.082, rawActiveUL)) * 0.82;
  } else if (cIdx1 == 3 && onRightRidge < 0.3) {
    semiClear = (1.0 - smoothstep(0.022, 0.084, rawB1)) * 0.78;
  }
  float prism320 = crystalBellCs(u.xy, vec2(0.090, -0.042), vec2(20.0, 17.85714), vec2(0.9393727, -0.3428978));
  semiClear = max(semiClear, prism320 * onRightRidge * 0.86);

  vec2 macroSlope = vec2(-0.012, -0.008) - cGrad + rSlopeGrad;
  ChiselSurface cs;
  cs.targetZ = zCombined;
  cs.collarMask = collar;
  cs.semiClearBevel = semiClear;
  cs.ridgeCrest = ridgeCrest;
  cs.dFault = dFault;
  cs.normalU = normalize(vec3(-totalDzDxy.x, -totalDzDxy.y, 1.0));
  cs.macroNormalU = normalize(vec3(-macroSlope.x, -macroSlope.y, 1.0));
  return cs;
}

// SDF-only evaluation of evalChiseledCrystal(..., 0.0024, subdiv).targetZ.
// Uses CPU-precomputed normalized facet planes (u_chiselPlanes) for zero per-step inversesqrt!
float evalChiseledTargetZ(vec3 u, float subdiv, bool withFbm) {
  float zTableBase = 0.194 - 0.012 * u.x - 0.008 * u.y;

  vec4 cp0 = u_chiselPlanes[0];
  float cLL1 = 0.380 * (dot(cp0.xy, u.xy) - cp0.z);

  float cUL = -1.0;
  if (u.x < -0.03) {
    vec4 cp1 = u_chiselPlanes[1];
    float fluteGate = smoothstep(0.015, 0.080, u.y) * smoothstep(0.018, 0.070, dot(cp1.xy, u.xy) - 0.160);
    float flute930 = fluteGate > 0.0
      ? sin(u.y * 42.0 + u.x * 18.0 + u_chipPhase.y) * 0.0028 * fluteGate
      : 0.0;
    float cUL1 = 0.476 * (dot(cp1.xy, u.xy) - cp1.z + flute930);

    vec4 cp2 = u_chiselPlanes[2];
    float dy205 = (u.y - 0.205) * 26.3158;
    float dy285 = (u.y - 0.285) * 27.7778;
    float zig1 = exp(-dy205 * dy205) * 0.007 - exp(-dy285 * dy285) * 0.006;
    float stepCoord = u.y * 16.0 - u.x * 4.5 + u_chipPhase.x;
    float stepFrac = fract(stepCoord);
    float stepLedge = (floor(stepCoord) + smoothstep(0.16, 0.48, stepFrac) - stepCoord) * 0.0042 * (0.40 + 0.60 * subdiv);
    float cUL2 = 0.831 * (dot(cp2.xy, u.xy) - (cp2.z - zig1)) - stepLedge;

    cUL = -smax(-cUL1, -cUL2, 0.00288);
  }

  vec4 cp3 = u_chiselPlanes[3];
  vec4 cp4 = u_chiselPlanes[4];
  vec4 cp5 = u_chiselPlanes[5];
  float cB1 = 0.32 * (dot(cp3.xy, u.xy) - cp3.z);
  float cB2 = 0.52 * (dot(cp4.xy, u.xy) - cp4.z);
  float cBR = 0.58 * (dot(cp5.xy, u.xy) - cp5.z);

  float c1 = 0.0;
  float c2 = -10.0;
  float cSmall[5] = float[5](cLL1, cUL, cB1, cB2, cBR);
  for (int k = 0; k < 5; k++) {
    float ck = cSmall[k];
    if (ck > c1) {
      c2 = c1;
      c1 = ck;
    } else if (ck > c2) {
      c2 = ck;
    }
  }

  if (u.y > 0.18) {
    float nCrown = withFbm
      ? (fbm3D(vec3(u.xy * vec2(7.6, 6.8), u.z * 1.2) + u_chipPhase) - 0.48) * 1.45
      : 0.0;
    float cCrownL = 0.44 * (dot(N_CR_L, u.xy) - (0.382 - nCrown * 0.038));
    if (cCrownL > c1) {
      c2 = c1;
      c1 = cCrownL;
    } else if (cCrownL > c2) {
      c2 = cCrownL;
    }

    float hexPocket = crystalBellCs(u.xy, vec2(0.140, 0.340), vec2(20.0, 18.51852), vec2(0.9492354, -0.3145666));
    float cCrownHex = 0.54 * (dot(N_CR_HEX, u.xy) - (0.382 - nCrown * 0.026)) + hexPocket * 0.018;
    if (cCrownHex > c1) {
      c2 = c1;
      c1 = cCrownHex;
    } else if (cCrownHex > c2) {
      c2 = cCrownHex;
    }
  }

  float crownSoft = smoothstep(0.23, 0.36, u.y) * smoothstep(-0.12, 0.08, u.x) * 0.036;
  float cBevel = max(0.00075 + crownSoft, 0.001008);
  float cutSmooth = smax(c1, c2, cBevel * 1.6);

  float rHeight = 0.0;
  if (u.x > -0.015 && u.y < 0.32) {
    vec4 cp6 = u_chiselPlanes[6];
    vec4 cp7 = u_chiselPlanes[7];
    float dRUp = dot(cp6.xy, u.xy) - cp6.z;
    float dRLow = dot(cp7.xy, u.xy) - cp7.z;
    float rBevel = 0.001056;
    float dRightIn = -smax(-dRUp, -dRLow, rBevel * 1.9);
    if (dRightIn > -0.004) {
      float dNotch315 = dot(N_NOTCH_315, u.xy - vec2(0.044, -0.042));
      float ny = (u.y + 0.01) * 7.4074;
      float notchMask = smoothstep(-0.004, 0.014, dRightIn) * exp(-ny * ny);
      float notchStep = -0.0085 * smoothstep(-rBevel * 1.5, rBevel * 1.5, -dNotch315) * notchMask;

      float topTerminate = 1.0 - smoothstep(0.265, 0.315, u.y);
      float xR = max(0.0, dRightIn) * topTerminate;
      float sCrest = xR - 0.070;
      float crestHyp = sqrt(sCrest * sCrest + 0.00042);
      rHeight = (-0.08 * xR + 0.45 * (0.07294 - crestHyp) + notchStep) * topTerminate;
    }
  }

  return zTableBase - cutSmooth + rHeight;
}

/**
 * Evaluates signed distance to the chiseled silhouette girdle in canonical space.
 * When withFbm is false, omits 3D strata texture fetches (bounded by +-0.0105).
 */
float evalGirdleRimEx(vec3 p, vec3 u, float subdiv, bool withFbm) {
  float chipScale = 0.54 + 0.65 * u_detail;
  float dxFlow = 0.0;

  if (u.x < 0.0) {
    if (u.y > -0.24) {
      float sPhase = u_subdivPhase.x * u_subdivPhase.w;
      float leftTooth11  =  0.016 * exp(-abs(u.y - 0.428) * 41.66667) * smoothstep(0.00, -0.09, u.x);
      float leftDip1035  = -0.015 * exp(-sq((u.y - 0.335) * 23.80952)) * smoothstep(-0.04, -0.20, u.x);
      float leftSwell935 =  0.015 * exp(-sq((u.y - 0.145 + sPhase * 0.02) * 13.88889)) * smoothstep(-0.14, -0.28, u.x);
      float leftScallops = (0.0074 * sin(u.y * 37.0 + u_chipPhase.x * 2.0) +
                            0.0042 * sin(u.y * 73.0 - u_chipPhase.y * 1.7)) *
                           exp(-sq((u.y - 0.16) * 7.14286)) * smoothstep(-0.12, -0.26, u.x) * chipScale;
      float leftDip900   = -0.012 * exp(-sq((u.y - 0.012) * 31.25)) * smoothstep(-0.18, -0.32, u.x);
      float leftApex835  =  0.008 * exp(-abs(u.y + 0.054) * 50.0) * smoothstep(-0.22, -0.34, u.x);
      dxFlow -= (leftTooth11 + leftDip1035 + leftSwell935 + leftScallops + leftDip900 + leftApex835);
    }
    if (u.y < 0.05) {
      float leftBite755   = -0.017 * exp(-sq((u.y + 0.165) * 22.72727)) * smoothstep(-0.14, -0.28, u.x);
      float leftKnuck720  =  0.013 * exp(-sq((u.y + 0.275) * 26.31579)) * smoothstep(-0.10, -0.22, u.x);
      float leftIndent635 = -0.010 * exp(-sq((u.y + 0.365) * 33.33333)) * smoothstep(-0.04, -0.15, u.x);
      float leftTaper615  = -0.007 * exp(-sq((u.y + 0.438) * 38.46154)) * smoothstep(0.00, -0.10, u.x);
      dxFlow -= (leftBite755 + leftKnuck720 + leftIndent635 + leftTaper615);
    }
  } else if (u.x > 0.05) {
    if (u.y > -0.28) {
      float rightLobe1255 =  0.011 * exp(-sq((u.y - 0.422) * 25.0)) * smoothstep(0.05, 0.15, u.x);
      float rightDip110   = -0.006 * exp(-sq((u.y - 0.362) * 27.77778)) * smoothstep(0.08, 0.18, u.x);
      float rightLobe125  =  0.010 * exp(-sq((u.y - 0.305) * 23.80952)) * smoothstep(0.08, 0.20, u.x);
      float rightSwell2   =  0.013 * exp(-sq((u.y - 0.155) * 10.52632)) * smoothstep(0.10, 0.22, u.x);
      float rightWaist325 = -0.016 * exp(-sq((u.y + 0.055) * 15.625)) * smoothstep(0.10, 0.22, u.x);
      dxFlow -= (rightLobe1255 + rightDip110 + rightLobe125 + rightSwell2 + rightWaist325);
    }
    if (u.y < 0.82) {
      float rightKnuck355 =  0.012 * exp(-sq((u.y + 0.145) * 31.25)) * smoothstep(0.10, 0.20, u.x);
      float rightKnuck425 =  0.009 * exp(-sq((u.y + 0.218) * 33.33333)) * smoothstep(0.10, 0.20, u.x);
      float rightKnuck500 =  0.011 * exp(-sq((u.y + 0.328) * 29.41176)) * smoothstep(0.06, 0.16, u.x);
      float rightScallop  = (0.0048 * sin(u.y * 30.0 + u_chipPhase.z * 2.2) +
                             0.0016 * sin(u.y * 58.0 + u_chipPhase.x)) *
                            exp(-sq((u.y + 0.10) * 5.26316)) * smoothstep(0.10, 0.22, u.x) * chipScale;
      dxFlow -= (rightKnuck355 + rightKnuck425 + rightKnuck500 + rightScallop);
    }
  }

  float dyFlow = 0.0;
  if (u.y > 0.28) {
    float crownPeak1225 =  0.018 * exp(-sq((u.x - 0.072) * 21.73913)) -
                           0.006 * exp(-sq((u.x - 0.024) * 38.46154)) +
                           0.016 * exp(-sq((u.x + 0.022) * 26.31579)) -
                           0.012 * exp(-sq((u.x + 0.072) * 35.71429));
    dyFlow = -crownPeak1225 * smoothstep(0.28, 0.41, u.y);
  }

  vec3 q = p + CANON_AXIS_X * dxFlow + CANON_AXIS_Y * dyFlow;

  float baseRelief = 0.0;
  if (withFbm) {
    vec3 uSil = vec3(u.xy * vec2(4.2, 3.4), u.z * 0.25);
    float strataMacro = fbm3D(uSil + u_chipPhase) - 0.48;
    float subRelief = subdiv > 0.001
      ? (valueNoise3D(vec3(u.xy * vec2(9.5, 6.0), u.z * 0.35) + u_chipPhase.zxy) - 0.50) * subdiv
      : 0.0;
    baseRelief = (strataMacro * 0.011 + subRelief * 0.006) * chipScale;
  }

  float dy835 = (u.y + 0.054) * 22.2222;
  float calm835Val = 1.0 - 0.85 * exp(-dy835 * dy835);

  float hRim1 = -10.0;
  float hRim2 = -10.0;
  for (int i = 2; i < 12; i++) {
    vec4 pl = u_hullPlanes[i];
    float flankAmp = (i >= 10) ? 0.20 : 1.0;
    float calm835 = (i == 4 || i == 5) ? calm835Val : 1.0;
    float d = dot(q, pl.xyz) - pl.w + baseRelief * flankAmp * calm835;
    if (d > hRim1) {
      hRim2 = hRim1;
      hRim1 = d;
    } else if (d > hRim2) {
      hRim2 = d;
    }
  }
  float tipSoft = smoothstep(-0.38, -0.47, u.y) * 0.010 +
                  smoothstep(0.42, 0.48, u.y) * smoothstep(-0.04, 0.03, u.x) * 0.009;
  return smax(hRim1, hRim2, 0.0018 + tipSoft);
}

float evalGirdleRim(vec3 p, vec3 u, float subdiv) {
  return evalGirdleRimEx(p, u, subdiv, true);
}

float mapCarbonMacro(vec3 p, vec3 u, float subdiv) {
  float dFrontSculpted = u.z - evalChiseledTargetZ(u, subdiv, false);
  float dPerimeter = evalGirdleRimEx(p, u, subdiv, false);
  float summitDomeRound = 0.015 * smoothstep(0.35, 0.44, u.y) * smoothstep(-0.095, -0.025, u.x);
  return smax(dFrontSculpted, dPerimeter, 0.0042 + summitDomeRound);
}

float mapCarbonFastU(vec3 p, vec3 u, float subdiv) {
  float dFrontSculpted = u.z - evalChiseledTargetZ(u, subdiv, true);
  float dPerimeter = evalGirdleRimEx(p, u, subdiv, true);
  float summitDomeRound = 0.015 * smoothstep(0.35, 0.44, u.y) * smoothstep(-0.095, -0.025, u.x);
  return smax(dFrontSculpted, dPerimeter, 0.0042 + summitDomeRound);
}

float mapCarbonFast(vec3 p, float subdiv) {
  return mapCarbonFastU(p, CANON_WORLD * p, subdiv);
}

float mapCarbon(vec3 p) {
  vec3 u = CANON_WORLD * p;
  float subdiv = evalSubdivisionMask(u);
  return mapCarbonFast(p, subdiv);
}

vec3 calcSmoothNormal(vec3 p, vec3 u, float eps, float subdiv) {
  vec2 e = vec2(1.0, -1.0) * 0.57735027 * eps;
  vec3 uXyy = CANON_WORLD * e.xyy;
  vec3 uYyx = CANON_WORLD * e.yyx;
  vec3 uYxy = CANON_WORLD * e.yxy;
  vec3 uXxx = CANON_WORLD * e.xxx;
  return normalize(
    e.xyy * mapCarbonFastU(p + e.xyy, u + uXyy, subdiv) +
    e.yyx * mapCarbonFastU(p + e.yyx, u + uYyx, subdiv) +
    e.yxy * mapCarbonFastU(p + e.yxy, u + uYxy, subdiv) +
    e.xxx * mapCarbonFastU(p + e.xxx, u + uXxx, subdiv)
  );
}

vec3 sculptCarbonNormal(
  vec3 u,
  vec3 baseNormal,
  float geomNdotV,
  vec3 keyDir,
  vec3 topDir,
  float coc,
  float pixelWidth,
  float subdiv,
  float dGirdle,
  ChiselSurface cs,
  out float signedRidgeStep,
  out float asymmetricFrostCatch,
  out float cleavageCrest,
  out float collarMask,
  out float outSemiClear,
  out float outSubPocket,
  out float outRimProximity,
  out vec3 cellNormal1
) {
  float detailAmt = 0.50 + 0.72 * u_detail;
  float grazingFade = smoothstep(0.03, 0.24, geomNdotV);

  outRimProximity = smoothstep(-0.044, -0.002, dGirdle);
  collarMask = cs.collarMask;
  outSemiClear = cs.semiClearBevel;

  vec3 nChiselLocal = normalize(transpose(CANON_WORLD) * cs.normalU);
  float outerRoll = smoothstep(0.04, 0.28, geomNdotV);
  vec3 facetedNormal = normalize(mix(baseNormal, nChiselLocal, mix(outerRoll * 0.96, 1.0, 1.0 - collarMask)));

  float subStepEdge = 0.0;
  float subPocket = 0.0;
  vec3 lightVec = normalize(keyDir * 0.52 + topDir * 0.48);

  // Crisp, planar chiseled crystal splinters in the 3:15-5:00 right pocket & 10:00-11:20 left steps
  if (subdiv > 0.03) {
    vec3 uSubWarp = vec3(u.xy, u.z * 0.22) + vec3(
      fbm2(vec3(u.xy * 5.4, u.z * 0.7) + u_chipPhase) - 0.48,
      fbm2(vec3(u.xy * 5.4, u.z * 0.7) - u_chipPhase.yzx) - 0.48,
      0.0
    ) * 0.018;
    vec2 rotXY = mat2(0.95, -0.31, 0.31, 0.95) * uSubWarp.xy;
    vec3 sp1 = vec3(rotXY * vec2(12.8, 4.8), uSubWarp.z * 2.8) + u_chipPhase;

    // Tight ~1.0px bevels produce genuinely chiseled flat crystal faces rather than soft pillows!
    vec4 sub1 = voronoiFacet3DFast(sp1, max(0.0055 + coc * 0.006, pixelWidth * 0.95));
    vec4 sub2 = vec4(0.0, 0.0, 0.0, 1.0);
    if (subdiv > 0.14) {
      vec3 sp2 = OCTAVE_ROT * vec3(rotXY * vec2(25.0, 9.6), uSubWarp.z * 4.6) - u_chipPhase.yzx * 1.3;
      sub2 = voronoiFacet3DFast(sp2, max(0.0085 + coc * 0.008, pixelWidth * 1.25));
    }

    float nyqSub = 1.0 / (1.0 + pixelWidth * 240.0);
    float subSurfaceGate = mix(0.28, 1.0, collarMask);
    vec3 shardTilt = sub1.xyz * (0.50 * subdiv) + sub2.xyz * (0.32 * subdiv * subdiv);
    facetedNormal = normalize(facetedNormal + shardTilt * detailAmt * subSurfaceGate * outerRoll * nyqSub);

    float shardLight = dot(normalize(sub1.xyz + sub2.xyz * 0.50), lightVec);
    float innerBand = exp(-max(0.0, abs(u.x) - 0.135) * 11.5);
    subPocket = clamp(
      smoothstep(-0.06, -0.56, shardLight) * 0.84 * innerBand *
      smoothstep(0.06, 0.46, subdiv) * subSurfaceGate,
      0.0,
      1.0
    );

    float shardEdge1 = exp(-sub1.w / max(0.014, pixelWidth * 5.5));
    float shardEdge2 = subdiv > 0.14 ? exp(-sub2.w / max(0.018, pixelWidth * 7.5)) * subdiv : 0.0;
    float litFace = smoothstep(0.26, 0.70, shardLight) * 0.28;
    subStepEdge = clamp((max(0.0, shardLight + 0.20) * (shardEdge1 * 0.88 + shardEdge2 * 0.58) + litFace) * subdiv * subSurfaceGate * outerRoll, 0.0, 1.0);
  }

  // Medium-scale hand-chiseled mineral facets across the entire frosted collar (zero grain speckles!)
  if (collarMask > 0.04) {
    vec4 collarFacet = voronoiFacet3DFast(
      vec3(u.xy * vec2(5.4, 4.6), u.z * 0.6) + u_chipPhase.zxy * 0.7,
      max(0.018 + coc * 0.010, pixelWidth * 1.6)
    );
    facetedNormal = normalize(facetedNormal + collarFacet.xyz * (0.17 * collarMask * outerRoll * detailAmt));
    subStepEdge = max(subStepEdge, exp(-collarFacet.w / max(0.028, pixelWidth * 9.0)) * 0.20 * collarMask * outerRoll);
  }

  // Sculpted cellular quartz domes across the summit crown (11:10 -> 1:05)
  float crownZone = smoothstep(0.26, 0.39, u.y) * collarMask;
  if (crownZone > 0.01) {
    vec4 crownVoro = voronoiCell3D(vec3(u.xy * vec2(8.2, 7.4), u.z * 1.2) + u_chipPhase * 0.8);
    vec3 crownScoop = transpose(CANON_WORLD) * normalize(vec3(crownVoro.xy * 1.45, 0.84));
    facetedNormal = normalize(mix(facetedNormal, crownScoop, crownZone * 0.44));
    subStepEdge = max(subStepEdge, exp(-crownVoro.w / 0.075) * crownZone * 0.38);
  }

  outSubPocket = subPocket;
  cellNormal1 = nChiselLocal;

  float ridgeLightDelta = dot(facetedNormal - baseNormal, lightVec);
  signedRidgeStep = (cs.ridgeCrest * 0.13 + ridgeLightDelta * cs.ridgeCrest * 0.28) * grazingFade;
  asymmetricFrostCatch = clamp(
    cs.ridgeCrest * (0.14 + 0.32 * max(0.0, ridgeLightDelta)) +
    subStepEdge * 0.54,
    0.0,
    1.0
  ) * grazingFade;
  cleavageCrest = clamp(cs.ridgeCrest * 0.76 + subStepEdge * 0.88, 0.0, 1.0);

  return facetedNormal;
}

float evalCarbonSpectrumCh(
  vec4 p0,
  vec4 p1,
  float cyanWave,
  float violetDispersion,
  float orchidIridescence,
  float emeraldPocket,
  float warmAmberFringe,
  float deepSapphirePocket,
  float softPeriwinkle
) {
  float v = mix(p0.x, p0.y, softPeriwinkle * 0.86);
  v = mix(v, p0.z, deepSapphirePocket * 0.94);
  v = mix(v, p0.w, cyanWave * 0.92);
  v = mix(v, p1.x, emeraldPocket * 0.88);
  v = mix(v, p1.y, violetDispersion * 0.88);
  v = mix(v, p1.z, orchidIridescence * 0.62);
  v = mix(v, p1.w, warmAmberFringe * 0.78);
  return v;
}

vec4 evalGemPavilion(vec2 p, float bevel) {
  float h1 = -10.0;
  float h2 = -10.0;
  float invBevel = 1.0 / max(0.0045, bevel * 0.72);
  vec2 slopeSum = vec2(0.0);
  float wSum = 0.0;

  for (int k = 0; k < 7; k++) {
    vec4 pv = u_pavilionPlanes[k];
    vec2 slope = pv.xy;
    float h = -dot(slope, p) - pv.z;
    if (h > h1) {
      h2 = h1;
      h1 = h;
    } else if (h > h2) {
      h2 = h;
    }
    float w = exp(clamp((h + 0.04) * invBevel, -32.0, 32.0));
    slopeSum += slope * w;
    wSum += w;
  }

  float seam = h1 - h2;
  vec2 blendedSlope = slopeSum / max(1e-6, wSum);
  return vec4(normalize(vec3(blendedSlope, 1.0)), seam);
}

vec3 sampleCarbonInterior(
  vec3 pFront,
  vec3 rd,
  vec3 nFront,
  float thickness,
  vec3 keyDir,
  float dispAmt,
  float coc,
  float subPocket,
  float dFault,
  float collarMask,
  vec3 ptrLightLocal,
  float ptrActive,
  out float outPavilionTIR,
  out vec3 outPtrInternalFire
) {
  float etaBase = 1.0 / CARBON_IOR;
  float dispSpread = dispAmt * 0.130;

  vec3 rdR = refract(rd, nFront, etaBase * (1.0 - dispSpread));
  vec3 rdG = refract(rd, nFront, etaBase);
  vec3 rdB = refract(rd, nFront, etaBase * (1.0 + dispSpread));
  if (dot(rdR, rdR) < 0.001) rdR = reflect(rd, nFront);
  if (dot(rdG, rdG) < 0.001) rdG = reflect(rd, nFront);
  if (dot(rdB, rdB) < 0.001) rdB = reflect(rd, nFront);

  vec3 uFront = CANON_WORLD * pFront;
  vec3 uRdR = CANON_WORLD * rdR;
  vec3 uRdG = CANON_WORLD * rdG;
  vec3 uRdB = CANON_WORLD * rdB;

  vec4 ip0 = u_internalPlanes01[0];
  vec4 ip1 = u_internalPlanes01[1];

  float stepShift = smoothstep(-0.004, 0.004, dFault) * (1.0 - collarMask * 0.85) * 0.036;
  vec3 pSheetR = uFront + uRdR * (thickness * 0.52) + vec3(-stepShift, stepShift * 0.65, 0.0);
  vec3 pSheetG = uFront + uRdG * (thickness * 0.52) + vec3(-stepShift, stepShift * 0.65, 0.0);
  vec3 pSheetB = uFront + uRdB * (thickness * 0.52) + vec3(-stepShift, stepShift * 0.65, 0.0);

  vec3 pBackG = pFront + rdG * thickness;
  float pavBlur = 0.34 + coc * 0.08;
  vec3 pavWarp = vec3(fbm2(pBackG * 2.8 + u_chipPhase) - 0.48) * 0.088;
  vec4 pavG = voronoiFacet3D((pBackG + pavWarp) * vec3(2.35, 1.75, 2.35) - u_chipPhase.yzx * 0.4, pavBlur);
  vec3 nBackPlanar = normalize(mix(vec3(0.0, 0.0, -1.0), -pavG.xyz, 0.40));

  vec4 rearGem = evalGemPavilion(pSheetG.xy * 1.18, 0.022 + coc * 0.018);
  float gemCaustic = clamp(0.5 + 0.82 * dot(rearGem.xyz, normalize(vec3(-0.42, 0.58, 0.70))), 0.0, 1.0);

  vec3 bounceDirG = reflect(rdG, -nBackPlanar);
  outPavilionTIR = pow(max(0.0, dot(bounceDirG, keyDir)), 2.2) * 0.36;

  outPtrInternalFire = vec3(0.0);
  if (ptrActive > 0.001) {
    float ptrEnergy = 1.0 - exp(-ptrActive * 0.62);
    vec3 toPtrFront = ptrLightLocal - pFront;
    float ptrDistSq = dot(toPtrFront, toPtrFront);
    vec3 ptrLDir = toPtrFront * inversesqrt(max(0.0004, ptrDistSq));
    float ptrAtten = ptrEnergy / (1.0 + ptrDistSq * 2.35);

    vec3 ptrRayIn = refract(-ptrLDir, nFront, etaBase);
    if (dot(ptrRayIn, ptrRayIn) < 0.001) ptrRayIn = -ptrLDir;

    float gemBevel = 0.0045 + coc * 0.010;
    vec4 gemG = evalGemPavilion(pBackG.xy, gemBevel);
    vec2 dispDelta = (pSheetB.xy - pSheetR.xy) * 1.55;
    vec3 gemRNorm = normalize(gemG.xyz - vec3(dispDelta, 0.0));
    vec3 gemBNorm = normalize(gemG.xyz + vec3(dispDelta, 0.0));

    float alR = max(0.0, dot(reflect(rdR, gemRNorm), -ptrRayIn));
    float alG = max(0.0, dot(reflect(rdG, gemG.xyz), -ptrRayIn));
    float alB = max(0.0, dot(reflect(rdB, gemBNorm), -ptrRayIn));

    vec3 pavFlash = vec3(
      pow(alR, 18.0) * 0.16 + pow(alR, 54.0) * 0.48,
      pow(alG, 18.0) * 0.19 + pow(alG, 54.0) * 0.52,
      pow(alB, 18.0) * 0.24 + pow(alB, 54.0) * 0.58
    );
    float pavSeamCatch = exp(-gemG.w / (0.0030 + coc * 0.006)) * pow(alG, 6.0) * 0.24;

    vec3 pMid = pFront + rdG * (thickness * 0.46);
    vec3 nCleavageSheet = normalize(vec3(ip0.xy * 0.24, 1.0));
    vec3 hMid = normalize(normalize(ptrLightLocal - pMid) - rdG);
    float sheetNdotH = max(0.0, dot(nCleavageSheet, hMid));
    float dInternalStep = dot(pMid.xy, normalize(ip1.xy)) - ip1.w * 0.40;
    float sheetStepMask = 0.52 + 0.48 * smoothstep(-0.006, 0.006, dInternalStep);
    float sheetEdge = exp(-abs(dInternalStep) / (0.0040 + coc * 0.008)) * pow(sheetNdotH, 10.0);
    vec3 internalSheetLight = vec3(0.64, 0.89, 1.00) * (pow(sheetNdotH, 52.0) * sheetStepMask * 0.22 + sheetEdge * 0.18);

    vec3 fireTint = vec3(
      pavFlash.r * 0.90 + pavFlash.g * 0.10,
      pavFlash.g * 0.86 + pavFlash.r * 0.14 + pavFlash.b * 0.08,
      pavFlash.b * 0.98 + pavFlash.g * 0.06
    );
    outPtrInternalFire = (fireTint + vec3(0.76, 0.92, 1.00) * pavSeamCatch + internalSheetLight) *
                         ptrAtten * (0.48 + 0.50 * u_refraction);
  }

  vec2 flowWarp = vec2(
    fbm2(pSheetG * 4.2 + u_chipPhase) - 0.48,
    fbm2(pSheetG * 4.2 - u_chipPhase.yzx) - 0.48
  ) * 0.044;
  // Pavilion angular dispersion splits long (R) and short (B) wavelengths across rear facet slopes
  vec2 prismAngularShift = (rearGem.xy * 0.80 + pavG.xy * 0.35) * (0.018 * dispAmt);
  vec2 baseDeflect = pavG.xy * 0.044 + rearGem.xy * 0.052 + flowWarp;
  vec2 qR = pSheetR.xy + baseDeflect - prismAngularShift;
  vec2 qG = pSheetG.xy + baseDeflect;
  vec2 qB = pSheetB.xy + baseDeflect + prismAngularShift;
  float pavDapple = clamp(0.45 + 0.55 * dot(pavG.xyz, normalize(vec3(-0.35, 0.65, 0.68))), 0.0, 1.0);

  // Crisp cobalt refractive shadow step immediately above the 10:00 -> 2:00 fault line
  float aboveFaultShadow = smoothstep(-0.002, 0.010, dFault) * exp(-max(0.0, dFault) * 16.0) * (1.0 - collarMask) * 0.42;

  float softPeriwinkle = clamp(
    1.28 * crystalBell2D(qG, vec2(-0.102, 0.022), vec2(0.080, 0.105), -0.32) +
    0.76 * crystalBell2D(qG, vec2(0.015, 0.082), vec2(0.105, 0.045), 0.34),
    0.0,
    1.0
  );

  float deepSapphire = clamp(
    1.55 * crystalBell2D(qG, vec2(-0.075, 0.225), vec2(0.050, 0.098), 0.48) +
    1.68 * crystalBell2D(qG, vec2(0.002, -0.155), vec2(0.145, 0.038), 0.62) +
    1.32 * crystalBell2D(qG, vec2(0.068, -0.095), vec2(0.044, 0.115), -0.18) +
    1.18 * crystalBell2D(qG, vec2(-0.088, -0.055), vec2(0.095, 0.036), 0.64) +
    aboveFaultShadow +
    (1.0 - gemCaustic) * 0.20 +
    subPocket * 0.68,
    0.0,
    1.0
  );

  float upperAquaWash = 1.58 * crystalBell2D(qG, vec2(-0.002, 0.208), vec2(0.095, 0.074), 0.35);
  float bevel745Glow  = 1.65 * crystalBell2D(qG, vec2(-0.155, -0.158), vec2(0.068, 0.125), -0.52);
  float prism320Glint = 1.70 * crystalBell2D(qG, vec2(0.080, -0.040), vec2(0.044, 0.052), -0.25);
  float dappleBoost   = 0.84 + 0.46 * (pavDapple * 0.55 + gemCaustic * 0.45);

  float coreWaveR = crystalBell2D(qR, vec2(-0.020, -0.038), vec2(0.142, 0.056), 0.60);
  float coreWaveG = crystalBell2D(qG, vec2(-0.020, -0.038), vec2(0.142, 0.056), 0.60);
  float coreWaveB = crystalBell2D(qB, vec2(-0.020, -0.038), vec2(0.142, 0.056), 0.60);

  float cyanR = (upperAquaWash + bevel745Glow + prism320Glint + 1.52 * coreWaveR) * dappleBoost;
  float cyanG = (upperAquaWash + bevel745Glow + prism320Glint + 1.52 * coreWaveG) * dappleBoost;
  float cyanB = (upperAquaWash + bevel745Glow + prism320Glint + 1.52 * coreWaveB) * dappleBoost;

  float cR = clamp(cyanR * 0.86 * (1.0 - deepSapphire * 0.68), 0.0, 1.0);
  float cG = clamp(cyanG * 0.86 * (1.0 - deepSapphire * 0.68), 0.0, 1.0);
  float cB = clamp(cyanB * 0.86 * (1.0 - deepSapphire * 0.68), 0.0, 1.0);

  float prismWaveR = sin(qR.x * 42.0 + qR.y * 14.0 + rearGem.x * 3.2);
  float prismWaveG = sin(qG.x * 42.0 + qG.y * 14.0 + rearGem.x * 3.2);
  float prismWaveB = sin(qB.x * 42.0 + qB.y * 14.0 + rearGem.x * 3.2);

  float emeraldPocket = clamp(
    (1.62 * crystalBell2D(qG, vec2(0.026, -0.222), vec2(0.068, 0.048), 0.54) +
     1.54 * crystalBell2D(qG, vec2(-0.082, 0.165), vec2(0.050, 0.090), 0.36) +
     1.50 * crystalBell2D(qG, vec2(-0.194, 0.015), vec2(0.048, 0.078), 0.38) +
     0.58 * crystalBell2D(qG, vec2(-0.045, 0.008), vec2(0.058, 0.072), -0.22) +
     1.42 * crystalBell2D(qG, vec2(0.058, -0.105), vec2(0.046, 0.105), -0.14) * (0.42 + 0.58 * max(0.0, prismWaveG))) *
    (1.0 - deepSapphire * 0.32) * min(1.36, dispAmt),
    0.0,
    1.0
  );

  float dichroicViolet = clamp(
    (1.78 * crystalBell2D(qB, vec2(0.080, -0.145), vec2(0.052, 0.114), -0.14) * (0.54 + 0.58 * max(0.0, -prismWaveB)) +
     1.32 * crystalBell2D(qB, vec2(-0.078, 0.105), vec2(0.050, 0.064), 0.36) +
     1.22 * crystalBell2D(qB, vec2(0.012, -0.155), vec2(0.068, 0.042), 0.58) +
     1.12 * crystalBell2D(qB, vec2(-0.135, -0.155), vec2(0.048, 0.085), -0.45) +
     subPocket * 0.78) *
    min(1.38, dispAmt),
    0.0,
    1.0
  );

  // Tucked orchid-lilac iridescence along the 10:00 fault bend & 4:15 prism shards (leaves central aqua crisp!)
  float orchidIridescence = clamp(
    (0.86 * crystalBell2D(qB, vec2(-0.092, 0.074), vec2(0.044, 0.054), -0.26) +
     1.18 * crystalBell2D(qB, vec2(0.084, -0.128), vec2(0.040, 0.084), -0.16) * (0.45 + 0.55 * max(0.0, -prismWaveB)) +
     0.68 * crystalBell2D(qB, vec2(-0.188, -0.025), vec2(0.042, 0.058), 0.32)) *
    min(1.35, dispAmt),
    0.0,
    1.0
  );

  // Subtle warm peach/amber/orange Cauchy dispersion fringe along internal facet seams & prism edges
  float seamDispersion = exp(-rearGem.w / 0.024);
  float opticalWarmEdge = clamp((coreWaveR - coreWaveB) * 2.05 + max(0.0, prismWaveR - prismWaveB) * 0.30, 0.0, 1.0);
  float warmAmberFringe = clamp(
    (0.32 * crystalBell2D(qR, vec2(-0.096, 0.058), vec2(0.044, 0.056), -0.28) +
     0.38 * crystalBell2D(qR, vec2(-0.196, -0.008), vec2(0.040, 0.060), 0.35) +
     0.42 * crystalBell2D(qR, vec2(0.086, -0.076), vec2(0.036, 0.068), -0.18) +
     0.36 * crystalBell2D(qR, vec2(0.046, -0.206), vec2(0.050, 0.040), 0.52) +
     0.28 * crystalBell2D(qR, vec2(-0.106, 0.190), vec2(0.040, 0.058), 0.32) +
     opticalWarmEdge * (0.16 + 0.28 * seamDispersion)) *
    (1.0 - deepSapphire * 0.42) * min(1.34, dispAmt),
    0.0,
    0.46
  );

  float specR = evalCarbonSpectrumCh(
    vec4(0.28, 0.58, 0.11, 0.26),
    vec4(0.40, 0.54, 0.76, 0.98),
    cR * 0.90,
    dichroicViolet * 0.84,
    orchidIridescence * 0.90,
    emeraldPocket * 0.36,
    min(1.0, warmAmberFringe * 1.32),
    deepSapphire,
    softPeriwinkle
  );
  float specG = evalCarbonSpectrumCh(
    vec4(0.51, 0.75, 0.27, 0.88),
    vec4(0.94, 0.27, 0.42, 0.68),
    cG,
    dichroicViolet * 0.28,
    orchidIridescence * 0.32,
    emeraldPocket,
    warmAmberFringe * 0.82,
    deepSapphire * 0.74,
    softPeriwinkle
  );
  float specB = evalCarbonSpectrumCh(
    vec4(0.92, 0.97, 0.89, 0.97),
    vec4(0.60, 0.95, 0.89, 0.42),
    cB,
    min(1.0, dichroicViolet * 1.22),
    orchidIridescence,
    emeraldPocket * 0.50,
    warmAmberFringe * 0.18,
    deepSapphire,
    softPeriwinkle
  );

  vec3 rawPrism = clamp(vec3(specR, specG, specB), 0.0, 1.0);

  float opalMist = fbm2(pSheetG * 3.8 + u_chipPhase * 0.6);
  vec3 opalTint = vec3(0.76, 0.87, 0.98);
  float opalWeight = (0.06 + 0.08 * opalMist) * (1.0 - deepSapphire * 0.58);
  return mix(rawPrism, opalTint, opalWeight);
}

void main() {
  vec2 screenUv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 ptrOffset = u_pointer - 0.5;

  float rayScale = max(0.35, u_scale * 0.92);
  vec2 ndc = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y) - u_centerShift;
  vec3 roWorld = vec3(0.0, 0.0, 2.75);
  vec3 rdWorld = normalize(vec3(ndc / rayScale, -1.85));

  vec3 ro = u_invRot * roWorld;
  vec3 rd = normalize(u_invRot * rdWorld);

  float ptrActive = clamp(u_wake1.z, 0.0, 1.35);
  float wakeHaloBoost = ptrActive > 0.001 ? min(0.015, ptrActive * 0.009) : 0.0;
  float haloSpread = 0.010 + u_bloom * 0.011 + u_dof * 0.006 + wakeHaloBoost;
  float haloCutoff = haloSpread * 2.25;
  float polyEnterBand = haloCutoff + 0.006;

  // Exact O(1) Cyrus-Beck slab cull against the 12-plane expanded convex hull discards ~82%
  // of scissored background rays in 12 dot products and bounds [tEnter, tExit] tightly.
  vec2 hullSpan = intersectCarbonHull(ro, rd, polyEnterBand);
  if (hullSpan.y <= 0.0 || hullSpan.y < hullSpan.x) {
    discard;
  }

  float t = max(0.0, hullSpan.x);
  float tMax = hullSpan.y;
  float dClosest = 100.0;
  float dMacroMin = 100.0;
  float tClosest = t;
  float tHit = -1.0;
  float tPrevOutside = t;
  float pixelSpread = 1.35 / (min(u_res.x, u_res.y) * max(0.5, u_scale));

  vec3 ptrLightWorld = vec3((u_wake0.xy / rayScale) * 1.35, 0.92);
  vec3 ptrLightLocal = u_invRot * ptrLightWorld;

  vec3 uRo = CANON_WORLD * ro;
  vec3 uRd = CANON_WORLD * rd;

  const float SURF_DIST = 0.00010;
  float raySubdiv = evalSubdivisionMask(uRo + uRd * min(tMax, t + 0.04));
  float tSubdiv = -10.0;
  float dPrev = 100.0;
  float prevStep = 0.01;
  for (int i = 0; i < 148; i++) {
    if (t > tMax) break;
    vec3 p = ro + rd * t;
    vec3 uStep = uRo + uRd * t;
    float dMacro = mapCarbonMacro(p, uStep, raySubdiv);
    if (dMacro < dMacroMin) {
      dMacroMin = dMacro;
      if (dClosest > 50.0) {
        tClosest = t;
      }
    } else if (dMacro - 0.014 > haloCutoff + (tMax - t) * 1.65) {
      // Lipschitz-exact exit: remaining hull chord cannot reach haloCutoff even at max slope
      break;
    }
    // Since |dExact - dMacro| <= 0.013 everywhere, skip 3D FBM texture fetches until near surface!
    if (dMacro > 0.022) {
      float mStep = max(0.0020, (dMacro - 0.0125) * 0.78);
      tPrevOutside = t;
      dPrev = dMacro;
      prevStep = mStep;
      t += mStep;
      continue;
    }
    if (t - tSubdiv > 0.022) {
      raySubdiv = evalSubdivisionMask(uStep);
      tSubdiv = t;
    }
    float d = mapCarbonFastU(p, uStep, raySubdiv);
    if (d < dClosest) {
      dClosest = d;
      tClosest = t;
    }
    if (d < SURF_DIST) {
      tHit = t;
      break;
    }
    // Rays skimming nearly parallel to a flat facet (|dd/dt| < 0.14) or diverging past a
    // front protrusion into a concave valley otherwise burn >100 tiny steps before reaching
    // a receding lobe behind it, which would punch a step-exhaustion gap at oblique angles.
    float ddDt = (d - dPrev) / max(1e-5, prevStep);
    float stepLen = ddDt > 0.0
      ? max(0.0024, d * 0.90)
      : ((ddDt > -0.14 && d > 0.00025) ? max(0.0022, d * 1.28) : max(0.00070, d * 0.78));
    tPrevOutside = t;
    dPrev = d;
    prevStep = stepLen;
    t += stepLen;
  }

  if (tHit < 0.0) {
    if (dMacroMin - 0.013 > haloCutoff) {
      discard;
    }
    float t0 = tClosest;
    float closestSubdiv = evalSubdivisionMask(uRo + uRd * t0);
    const float H_STEP = 0.022;
    float dM = mapCarbonFastU(ro + rd * (t0 - H_STEP), uRo + uRd * (t0 - H_STEP), closestSubdiv);
    float d0 = mapCarbonFastU(ro + rd * t0, uRo + uRd * t0, closestSubdiv);
    float dP = mapCarbonFastU(ro + rd * (t0 + H_STEP), uRo + uRd * (t0 + H_STEP), closestSubdiv);
    float denom = 2.0 * (dM - 2.0 * d0 + dP);
    float dtMin = abs(denom) > 0.0001
      ? clamp(H_STEP * (dM - dP) / denom, -H_STEP, H_STEP)
      : (dM < dP ? -H_STEP * 0.5 : H_STEP * 0.5);
    tClosest = t0 + dtMin;

    float hFine = max(0.0014, tClosest * pixelSpread * 1.4);
    float dFM = mapCarbonFastU(ro + rd * (tClosest - hFine), uRo + uRd * (tClosest - hFine), closestSubdiv);
    float dF0 = mapCarbonFastU(ro + rd * tClosest, uRo + uRd * tClosest, closestSubdiv);
    float dFP = mapCarbonFastU(ro + rd * (tClosest + hFine), uRo + uRd * (tClosest + hFine), closestSubdiv);
    float denomF = 2.0 * (dFM - 2.0 * dF0 + dFP);
    float dtFine = abs(denomF) > 0.00005
      ? clamp(hFine * (dFM - dFP) / denomF, -hFine, hFine)
      : 0.0;
    tClosest += dtFine;
    dClosest = min(min(dFM, dFP), min(dF0, mapCarbonFastU(ro + rd * tClosest, uRo + uRd * tClosest, closestSubdiv)));
    if (dClosest > haloCutoff) {
      discard;
    }
  }

  float tSurf = tHit > 0.0 ? tHit : tClosest;
  if (tHit > 0.0) {
    float tLo = tPrevOutside;
    float tHi = tHit;
    for (int k = 0; k < 4; k++) {
      float tMid = 0.5 * (tLo + tHi);
      if (mapCarbonFastU(ro + rd * tMid, uRo + uRd * tMid, raySubdiv) < 0.0) {
        tHi = tMid;
      } else {
        tLo = tMid;
      }
    }
    tSurf = 0.5 * (tLo + tHi);
  }

  vec3 pFront = ro + rd * tSurf;
  vec3 pWorldFront = transpose(u_invRot) * pFront;
  vec3 uFront = uRo + uRd * tSurf;
  CrystalTapWave tapWave = evalCrystalTap(ndc, pWorldFront, u_scale);

  vec3 camMetrics = evalVirtualCamera(pFront, 0.14, u_dof, u_fog);
  float coc = camMetrics.x;
  float depthFog = camMetrics.y;
  float pixelWidth = tSurf * pixelSpread;

  float directionalRimWeight = 0.18 + 0.82 * clamp(
    smoothstep(0.36, 0.58, uFront.y) +
    smoothstep(-0.36, -0.56, uFront.y) * 0.55,
    0.0,
    1.0
  );

  float dOut = max(0.0, dClosest);
  float haloFade = 1.0 - smoothstep(haloSpread * 1.15, haloSpread * 2.25, dOut);
  float haloAlpha = exp(-dOut / max(0.0025, haloSpread)) * haloFade *
                    (0.004 + 0.048 * u_bloom) * directionalRimWeight;
  if (ptrActive > 0.001) {
    float ptrRimProx = exp(-dot(ndc - u_wake0.xy, ndc - u_wake0.xy) / (0.045 * max(0.5, u_scale)));
    float wakeRimFlare = exp(-dOut / max(0.005, haloSpread * 1.25)) * haloFade * ptrRimProx * min(1.0, ptrActive) * 0.10;
    haloAlpha = clamp(haloAlpha + wakeRimFlare, 0.0, 0.50);
  }
  if (tapWave.isLive > 0.5) {
    float tapHalo = exp(-dOut / max(0.005, haloSpread * 1.40)) * haloFade *
                    (tapWave.ring * 0.16 + tapWave.flash * 0.12);
    haloAlpha = clamp(haloAlpha + tapHalo, 0.0, 0.60);
  }

  // Pure outer-halo rays exit here before any normal, grazing-chord, or shading work.
  if (tHit < 0.0 && evalMacroSilhouetteAlpha(dClosest, pixelWidth, coc, 0.0020) <= 0.0015) {
    if (haloAlpha <= 0.0015) {
      discard;
    }
    vec3 backdropHalo = sampleTonalGradient(screenUv, ptrOffset);
    vec3 pureHaloCol = mix(
      backdropHalo * 0.58 + vec3(0.52, 0.80, 1.00) * 0.48,
      vec3(0.88, 0.96, 1.00),
      u_isLightBackdrop * 0.60
    );
    outColor = vec4(pureHaloCol * haloAlpha, haloAlpha);
    return;
  }

  float subdivFront = evalSubdivisionMask(uFront);
  float dGirdleFront = evalGirdleRim(pFront, uFront, subdivFront);

  float dRayMin = dClosest;
  float coneW = pixelWidth * 0.90 + coc * 0.0020;
  if (tHit > 0.0) {
    if (dGirdleFront < -0.020) {
      dRayMin = -coneW * 2.0;
    } else {
      float satThresh = -coneW * 1.5;
      vec3 pB2 = pFront + rd * 0.036;
      vec3 uB2 = uFront + uRd * 0.036;
      if (mapCarbonMacro(pB2, uB2, subdivFront) < satThresh - 0.013) {
        dRayMin = -coneW * 2.0;
      } else {
        float dBody2 = mapCarbonFastU(pB2, uB2, subdivFront);
        if (dBody2 < satThresh) {
          dRayMin = -coneW * 2.0;
        } else {
          float dBody3 = mapCarbonFastU(pFront + rd * 0.085, uFront + uRd * 0.085, subdivFront);
          if (dBody3 < satThresh) {
            dRayMin = -coneW * 2.0;
          } else {
            dRayMin = min(0.0, min(dBody2, dBody3));
            float chordOffsets[7] = float[7](coneW * 0.70, coneW * 1.65, 0.0032, 0.0068, 0.0145, 0.0235, 0.0560);
            for (int s = 0; s < 7; s++) {
              float ts = chordOffsets[s];
              dRayMin = min(dRayMin, mapCarbonFastU(pFront + rd * ts, uFront + uRd * ts, subdivFront));
              if (dRayMin < satThresh) break;
            }

            // When a ray barely grazes a front ridge/lobe across a concave indentation, a solid
            // receding flank may still lie > 0.085 units further back along the ray; continuing
            // across [0.090, tMax - tSurf] keeps overlapping self-occlusion seams 100% opaque.
            if (dRayMin > -coneW * 1.35 && tMax > tSurf + 0.090) {
              float tCont = tSurf + 0.090;
              float contSubdiv = subdivFront;
              float tContSub = tSurf;
              for (int k = 0; k < 28; k++) {
                if (tCont > tMax) break;
                vec3 pC = ro + rd * tCont;
                vec3 uC = uRo + uRd * tCont;
                float dMacC = mapCarbonMacro(pC, uC, contSubdiv);
                if (dMacC > 0.022) {
                  tCont += max(0.0080, (dMacC - 0.0125) * 0.85);
                  continue;
                }
                if (tCont - tContSub > 0.035) {
                  contSubdiv = evalSubdivisionMask(uC);
                  tContSub = tCont;
                }
                float dC = mapCarbonFastU(pC, uC, contSubdiv);
                dRayMin = min(dRayMin, dC);
                if (dRayMin < satThresh) {
                  break;
                }
                tCont += max(0.0075, abs(dC) * 0.85);
              }
            }
          }
        }
      }
    }
  }

  float bevelScale = max(0.0014 + coc * 0.0018, pixelWidth * 1.15);
  ChiselSurface csFront = evalChiseledCrystal(uFront, bevelScale, subdivFront);
  vec3 geomNormal = (dGirdleFront < -0.026 && uFront.y < 0.20)
    ? normalize(transpose(CANON_WORLD) * csFront.macroNormalU)
    : calcSmoothNormal(pFront, uFront, max(0.0009, pixelWidth * 0.78) + coc * 0.0010, subdivFront);
  float geomNdotV = max(0.0, dot(-rd, geomNormal));

  float edgeAlpha = evalMacroSilhouetteAlpha(dRayMin, pixelWidth, coc, 0.0020);
  float outerSilhouetteMask = smoothstep(-coneW * 1.4, -coneW * 0.3, dRayMin);
  edgeAlpha *= (1.0 - depthFog * 0.06 * (1.0 - geomNdotV) * outerSilhouetteMask);

  if (edgeAlpha <= 0.0015 && haloAlpha <= 0.0015) {
    discard;
  }

  vec3 backdropHere = sampleTonalGradient(screenUv, ptrOffset);
  vec3 haloCol = mix(
    backdropHere * 0.58 + vec3(0.52, 0.80, 1.00) * 0.48,
    vec3(0.88, 0.96, 1.00),
    u_isLightBackdrop * 0.60
  );
  if (edgeAlpha <= 0.0015) {
    outColor = vec4(haloCol * haloAlpha, haloAlpha);
    return;
  }

  // Studio light rig calibrated to the target reference:
  // - topLight (12:45/1:15 softbox): lights 12:25 summit domes & outer 1:30-3:00 frosted flank while
  //   leaving the inner 1:30-3:15 cliff slope in cool lavender-periwinkle
  // - keyLight (9:15 left rim-key): lights 9:30 bevel & sharp 8:35 apex, crisp step into 8:00 aqua bevel
  // - kickLight (6:35 lower-left): creates signature 6:35 wet-ice rim hotspot & pearlescent 6:00 tip
  // - rimLight (4:15 lower-right): catches 4:05, 4:40 & 5:05 chiseled right knuckles
  vec3 keyLightWorld  = normalize(vec3(-0.70 + ptrOffset.x * 0.22, 0.44 - ptrOffset.y * 0.20, 0.56));
  vec3 topLightWorld  = normalize(vec3( 0.28 + ptrOffset.x * 0.15, 0.84 - ptrOffset.y * 0.16, 0.46));
  vec3 kickLightWorld = normalize(vec3(-0.68, -0.64, 0.36));
  vec3 rimLightWorld  = normalize(vec3( 0.76, -0.36, 0.54));

  vec3 keyDir  = u_invRot * keyLightWorld;
  vec3 topDir  = u_invRot * topLightWorld;
  vec3 kickDir = u_invRot * kickLightWorld;
  vec3 rimDir  = u_invRot * rimLightWorld;

  float signedRidgeStep = 0.0;
  float asymmetricFrostCatch = 0.0;
  float cleavageCrest = 0.0;
  float collarMask = 0.0;
  float semiClearBevel = 0.0;
  float subPocket = 0.0;
  float rimProximity = 0.0;
  vec3 cellNormal1 = vec3(0.0, 0.0, 1.0);

  vec3 nFront = sculptCarbonNormal(
    uFront,
    geomNormal,
    geomNdotV,
    keyDir,
    topDir,
    coc,
    pixelWidth,
    subdivFront,
    dGirdleFront,
    csFront,
    signedRidgeStep,
    asymmetricFrostCatch,
    cleavageCrest,
    collarMask,
    semiClearBevel,
    subPocket,
    rimProximity,
    cellNormal1
  );

  float dispAmt = mix(0.36, 1.18, u_refraction);
  float eta = 1.0 / CARBON_IOR;
  vec3 nOptic = normalize(mix(nFront, cellNormal1, (1.0 - collarMask) * 0.62));
  float opticCos = dot(-rd, nOptic);
  if (opticCos < 0.22) {
    nOptic = normalize(mix(-rd, nOptic, clamp(opticCos / 0.22, 0.18, 1.0)));
  }
  vec3 rdIn = refract(rd, nOptic, eta);
  if (dot(rdIn, rdIn) < 0.001) rdIn = reflect(rd, nOptic);

  vec4 backInfo = calcInternalThicknessAndNormal(pFront, rdIn, geomNormal, vec3(0.72, 0.80, 0.72));
  vec3 nBack = backInfo.xyz;
  float thickness = backInfo.w;

  float NdotV = max(0.0, dot(-rd, nFront));
  float f0 = pow((1.0 - CARBON_IOR) / (1.0 + CARBON_IOR), 2.0);
  float omN = 1.0 - NdotV;
  float omN2 = omN * omN;
  float fresnel = f0 + (1.0 - f0) * (omN2 * omN2);

  float dFaultMain = uFront.y - (0.136 + 0.31 * uFront.x);
  float pavilionTIR = 0.0;
  vec3 ptrInternalFire = vec3(0.0);
  vec3 internalCaustics = sampleCarbonInterior(
    pFront,
    rd,
    nOptic,
    thickness,
    topDir,
    dispAmt,
    coc,
    subPocket,
    dFaultMain,
    collarMask,
    ptrLightLocal,
    ptrActive,
    pavilionTIR,
    ptrInternalFire
  );

  float exitTir = 0.0;
  vec3 rdExit = refractSmooth(rdIn, -nBack, CARBON_IOR, exitTir);
  vec3 worldExit = transpose(u_invRot) * rdExit;
  float refractSpread = 0.14 * (CARBON_IOR - 1.0);
  float scatterR = 0.095 + 0.045 * collarMask;
  vec2 uvCenter = clamp(mix(screenUv, vec2(0.58, 0.44), 0.36) + worldExit.xy * refractSpread, 0.08, 0.92);
  vec3 refractedBg = 0.25 * sampleTonalGradient(clamp(uvCenter + vec2( scatterR,  scatterR * 0.65), 0.0, 1.0), ptrOffset) +
                     0.25 * sampleTonalGradient(clamp(uvCenter + vec2(-scatterR, -scatterR * 0.65), 0.0, 1.0), ptrOffset) +
                     0.25 * sampleTonalGradient(clamp(uvCenter + vec2(-scatterR * 0.65,  scatterR), 0.0, 1.0), ptrOffset) +
                     0.25 * sampleTonalGradient(clamp(uvCenter + vec2( scatterR * 0.65, -scatterR), 0.0, 1.0), ptrOffset);

  vec3 beerLambert = exp(-vec3(0.76, 0.16, 0.03) * thickness * 1.22);
  vec3 transmittedBg = refractedBg * (0.68 + 0.54 * beerLambert);

  float causticMix = clamp(0.76 + u_refraction * 0.21, 0.0, 0.96);
  vec3 deepCore = mix(transmittedBg, internalCaustics, causticMix);
  deepCore += vec3(0.45, 0.89, 0.99) * pavilionTIR * 0.16 * dispAmt + ptrInternalFire;

  if (tapWave.isLive > 0.5) {
    vec2 pPavTap = pFront.xy + rdIn.xy * thickness;
    vec4 tapGem = evalGemPavilion(pPavTap, 0.0045 + coc * 0.010);
    float facetPhase = dot(tapGem.xy, tapWave.dir) * 0.42;
    float wWidth = 0.050 + u_tap.z * 0.038;
    float wDecay = exp(-u_tap.z * 1.75) * smoothstep(0.0, 0.025, u_tap.z) * u_tap.w;
    float dispStep = 0.022 + 0.018 * u_refraction;

    float wR = exp(-sq((tapWave.dist + facetPhase - dispStep - tapWave.front) / wWidth));
    float wG = exp(-sq((tapWave.dist + facetPhase - tapWave.front) / wWidth));
    float wB = exp(-sq((tapWave.dist + facetPhase + dispStep - tapWave.front) / wWidth));

    vec3 prismSweep = (
      vec3(0.56, 0.34, 1.00) * wR * 0.68 +
      vec3(0.08, 0.94, 1.00) * wG * 0.78 +
      vec3(0.24, 1.00, 0.80) * wB * 0.64
    ) * wDecay;
    float seamFlash = exp(-tapGem.w / (0.0034 + coc * 0.006)) * (wG * wDecay * 0.75 + tapWave.flash * 0.45);
    deepCore += (prismSweep * 0.48 + vec3(0.86, 0.96, 1.00) * seamFlash) * (0.55 + 0.55 * u_refraction);
  }

  float keyDiff  = max(0.0, dot(nFront, keyDir));
  float topDiff  = max(0.0, dot(nFront, topDir));
  float kickDiff = max(0.0, dot(nFront, kickDir));
  float rimDiff  = max(0.0, dot(nFront, rimDir));

  // Self-shadowing on the inward-facing 1:30 -> 3:15 right cliff keeps its recessed
  // slope in cool slate-periwinkle shadow while the outer crest catches soft lavender-pearl light.
  vec3 nCanon = CANON_WORLD * nFront;
  float rightInwardCliff = smoothstep(-0.01, 0.10, uFront.x) * smoothstep(0.14, -0.14, nCanon.x);
  float rightSideAtten = 1.0 - 0.22 * smoothstep(0.05, 0.21, uFront.x);

  // Smooth C-infinity thin-wall rim subsurface scattering: moderated slightly on the
  // right fill flank so it reads as cool lavender-pearl rather than chalky white.
  float thinEdgeGlow = rimProximity * (0.52 + 0.48 * pow(clamp(1.0 - NdotV, 0.0, 1.0), 0.82)) * rightSideAtten;

  float facetLight = clamp(
    topDiff * 0.52 * (1.0 - 0.22 * rightInwardCliff) +
    keyDiff * 0.41 * (1.0 - 0.62 * rightInwardCliff) +
    kickDiff * 0.31 * smoothstep(-0.18, -0.40, uFront.y) * rimProximity +
    rimDiff * 0.20 * smoothstep(0.04, 0.22, uFront.x) +
    thinEdgeGlow * 0.29,
    0.0,
    1.0
  );

  float softCloud = fbm2(vec3(uFront.xy * 4.2, uFront.z * 1.2) - u_chipPhase.yzx);

  float windowSatinVeil = 0.088 + 0.024 * softCloud;
  float baseCollarVeil = 0.63 + 0.095 * softCloud - semiClearBevel * 0.40 - subPocket * 0.36;
  float rimFrostVeil = collarMask * max(0.24, baseCollarVeil) +
                       thinEdgeGlow * 0.28 +
                       asymmetricFrostCatch * 0.15;
  float frostVeil = clamp(max(windowSatinVeil, rimFrostVeil), 0.08, 0.88);

  // High-contrast frosted-glass tonal ramp: deeper slate-periwinkle shadows & cool
  // lavender-periwinkle midtones paired with luminous pearlescent crests for 3D contrast.
  vec3 frostShadow = mix(vec3(0.39, 0.48, 0.83), internalCaustics * 0.32 + vec3(0.34, 0.44, 0.80), 0.36);
  vec3 frostMid    = mix(vec3(0.68, 0.74, 0.92), internalCaustics * 0.17 + vec3(0.63, 0.70, 0.90), 0.22);
  vec3 frostBright = vec3(0.946, 0.968, 0.996);

  float frostTone = clamp(
    facetLight * 0.77 +
    asymmetricFrostCatch * 0.26 +
    signedRidgeStep * 0.19 +
    (softCloud - 0.48) * 0.09 -
    subPocket * 0.31 -
    rightInwardCliff * 0.09,
    0.0,
    1.0
  );
  vec3 mineralFrost = mix(frostShadow, frostMid, smoothstep(0.08, 0.52, frostTone));
  mineralFrost = mix(mineralFrost, frostBright, smoothstep(0.52, 0.90, frostTone));

  vec3 crystalCol = mix(deepCore, mineralFrost, frostVeil);

  crystalCol += vec3(0.86, 0.94, 1.00) * max(0.0, signedRidgeStep) * 0.13;
  crystalCol *= clamp(0.97 + signedRidgeStep * 0.12, 0.82, 1.14);

  vec3 reflWorld = transpose(u_invRot) * reflect(rd, nFront);
  vec2 reflUv = clamp(vec2(0.64, 0.36) + reflWorld.xy * 0.18, 0.42, 0.92);
  vec3 envReflection = sampleTonalGradient(reflUv, ptrOffset) * 1.05 +
                       vec3(0.44, 0.60, 0.89) * pow(max(0.0, reflWorld.y * 0.68 + reflWorld.x * 0.32), 1.9);
  float satinPolish = mix(0.24, 0.09, frostVeil) * (1.0 - coc * 0.28);
  crystalCol = mix(crystalCol, envReflection, clamp(fresnel * satinPolish, 0.0, 0.25));

  // Focal, jewel-like specularity matching the 7 target hotspots:
  // (12:25 & 11:50 summit domes, 11:10 tooth, 8:35 apex, focused 6:35 wet-ice rim, 3:15 prow, 4:05/5:05 knuckles)
  vec3 halfKey  = normalize(keyDir - rd);
  vec3 halfTop  = normalize(topDir - rd);
  vec3 halfKick = normalize(kickDir - rd);
  vec3 halfRim  = normalize(rimDir - rd);

  float ndhKey  = max(0.0, dot(nFront, halfKey));
  float ndhTop  = max(0.0, dot(nFront, halfTop));
  float ndhKick = max(0.0, dot(nFront, halfKick));
  float ndhRim  = max(0.0, dot(nFront, halfRim));

  float spot1225 = crystalBell2D(uFront.xy, vec2(0.068, 0.465), vec2(0.041, 0.033), -0.18);
  float spot1150 = crystalBell2D(uFront.xy, vec2(-0.015, 0.415), vec2(0.045, 0.039), 0.14);
  float tightRim635 = smoothstep(0.46, 0.96, rimProximity);
  float spot635  = crystalBell2D(uFront.xy, vec2(-0.142, -0.372), vec2(0.041, 0.025), -0.66) * tightRim635;
  float spot835  = crystalBell2D(uFront.xy, vec2(-0.342, -0.054), vec2(0.045, 0.030), 0.16);
  float spot1110 = crystalBell2D(uFront.xy, vec2(-0.112, 0.428), vec2(0.035, 0.030), 0.35);
  float spot315  = crystalBell2D(uFront.xy, vec2(0.046, -0.042), vec2(0.032, 0.032), -0.25);

  // 1) Silky satin sheen focused on summit domes, 8:35 left apex & 6:35 rim
  float specSatin = pow(ndhTop, 24.0) * 0.13 * smoothstep(0.25, 0.46, uFront.y) +
                    0.17 * spot1150 * (0.40 + 0.60 * pow(ndhTop, 12.0)) +
                    pow(ndhKey, 26.0) * 0.08 * spot835 +
                    pow(ndhKick, 25.0) * 0.14 * spot635 +
                    pow(ndhRim, 28.0) * 0.045 * smoothstep(0.14, 0.25, uFront.x) * rimProximity;

  // 2) Crisp wet-ice specular glints at the exact target landmarks
  float sharpExp = mix(195.0, 65.0, coc);
  float specCrisp = pow(ndhTop, 104.0) * 0.30 * smoothstep(0.31, 0.48, uFront.y) +
                    0.36 * spot1225 * (0.38 + 0.62 * pow(ndhTop, 30.0)) +
                    0.21 * spot1150 * pow(ndhTop, 26.0) +
                    0.33 * spot1110 * (0.28 + 0.72 * pow(max(ndhTop, ndhKey), 38.0)) +
                    0.34 * spot835 * (0.32 + 0.68 * pow(ndhKey, sharpExp * 0.36)) +
                    0.40 * spot635 * (0.42 + 0.58 * pow(ndhKick, 56.0)) +
                    0.23 * spot315 * cleavageCrest * (0.40 + 0.60 * pow(max(ndhTop, ndhRim), 18.0)) +
                    pow(ndhRim, 96.0) * 0.17 * smoothstep(0.15, 0.25, uFront.x) * smoothstep(0.02, -0.32, uFront.y) * rimProximity;

  // 3) Tight directional glints along chiseled ridges & secondary crystal steps
  float ridgeSpec = cleavageCrest * (
    pow(ndhTop, 26.0) * 0.14 +
    pow(ndhKey, 26.0) * 0.14 +
    pow(ndhKick, 24.0) * 0.13 +
    pow(ndhRim, 30.0) * 0.08
  );

  // Apply aerial depth fog to body & satin scatter before crisp front-surface speculars
  // so distant flanks recede mistily without muting focal 12:25 / 6:35 wet-ice glints.
  vec3 aerialMistCol = mix(backdropHere * 1.10 + vec3(0.08, 0.15, 0.30), haloCol, 0.20);
  crystalCol = mix(crystalCol, aerialMistCol, depthFog * (0.12 + 0.08 * (1.0 - geomNdotV)));
  crystalCol += vec3(0.96, 0.982, 1.00) * (specSatin * (1.0 - depthFog * 0.22) + (specCrisp + ridgeSpec) * (1.0 - coc * 0.38));

  // Ultra-subtle 1-pixel TPDF optical frosting micro-dither (zero visible individual grains)
  vec2 ditherA = hash22(floor(gl_FragCoord.xy) + fract(uFront.xy * 64.0) * 0.01);
  vec2 ditherB = hash22(floor(gl_FragCoord.xy) + vec2(37.0, 17.0));
  float tpdfFrost = (ditherA.x + ditherB.x) * 0.25;
  crystalCol += vec3(0.86, 0.92, 1.00) * tpdfFrost * (0.008 + 0.005 * u_detail);

  if (ptrActive > 0.001) {
    // Soft-saturate wake energy during rapid cursor sweeps and gate mirror specularity
    // off the frosted collar so moving the cursor beside the right wall catches only
    // crisp facet edges rather than bleaching the frosted quartz white.
    float ptrEnergy = 1.0 - exp(-ptrActive * 0.56);
    vec3 toPtr = ptrLightLocal - pFront;
    float ptrDistSq = dot(toPtr, toPtr);
    vec3 ptrLDir = toPtr * inversesqrt(max(0.0004, ptrDistSq));
    float ptrAtten = ptrEnergy / (1.0 + ptrDistSq * 2.65);

    float ptrRightGuard = 1.0 - 0.45 * smoothstep(0.03, 0.18, uFront.x);
    float ptrDiff = max(0.0, dot(nFront, ptrLDir));
    float collarSubsurf = smoothstep(0.22, 0.05, thickness) * ptrDiff;
    crystalCol += vec3(0.52, 0.73, 0.97) * frostVeil * (ptrDiff * 0.045 + collarSubsurf * 0.035) * ptrAtten * ptrRightGuard;

    vec3 halfPtr = normalize(ptrLDir - rd);
    float ptrNdotH = max(0.0, dot(nFront, halfPtr));
    float windowOnly = 1.0 - collarMask * 0.82;
    float windowSpec = pow(ptrNdotH, mix(195.0, 65.0, coc)) * windowOnly * 0.36;
    float broadSheen = pow(ptrNdotH, 42.0) * windowOnly * 0.04;
    float stepGlint = (cleavageCrest * 0.88 + subPocket * 0.40) * pow(ptrNdotH, 24.0) * 0.20 * ptrRightGuard;
    crystalCol += vec3(0.92, 0.97, 1.00) * (windowSpec + broadSheen + stepGlint) * ptrAtten * (1.0 - coc * 0.42);
  }
  if (tapWave.isLive > 0.5) {
    float windowGlint = (1.0 - collarMask * 0.72) * (tapWave.ring * 0.18 + tapWave.flash * 0.22);
    float ridgeGlint = (cleavageCrest * 0.65 + subPocket * 0.45 + frostVeil * (0.14 + 0.40 * asymmetricFrostCatch)) * tapWave.ring * 0.30;
    crystalCol += vec3(0.91, 0.97, 1.00) * (windowGlint + ridgeGlint) * (1.0 - coc * 0.38);
  }

  // Subtle S-curve contrast + filmic highlight shoulder above 0.78 preserves full
  // midtone vibrancy while rolling off overlapping studio + pointer glints below 0.985.
  vec3 contrastCurve = mix(crystalCol, crystalCol * crystalCol * (3.0 - 2.0 * crystalCol), 0.10);
  vec3 overKnee = max(vec3(0.0), contrastCurve - 0.78);
  crystalCol = clamp((contrastCurve - overKnee) + overKnee / (1.0 + overKnee * 4.20), 0.0, 1.0);

  float outAlpha = edgeAlpha + haloAlpha * (1.0 - edgeAlpha);
  vec3 premulRgb = crystalCol * edgeAlpha + haloCol * haloAlpha * (1.0 - edgeAlpha);
  outColor = vec4(premulRgb, outAlpha);
}
`;
      ye = { id: "carbon", defaultPose: [4 * g, -2.5 * g, 13 * g], reactive: { mode: "shards", hoverRate: 3.6, sweepRate: 10.5, buoyancy: 0.018, radialPush: 0.042, lifeRange: [1.35, 2.4], sizePxRange: [0.65, 1.95] }, fragSrc: he, buildInstance({ seed: a2 }) {
        const t = a2 === 12, e = pe(a2), s = t ? 0 : 0.26, L = t ? 0 : 1, h = t ? 0 : 0.85, u = new Float32Array(F * 4);
        for (let o = 0; o < F; o++) {
          const r = fe[o], i = o <= 1 ? 0.35 : 1, p = (e() - 0.5) * 0.18 * s * i, y = (e() - 0.5) * 0.18 * s * i, f = (e() - 0.5) * 0.12 * s * i, re2 = (e() - 0.5) * 0.028 * s, [ce2, ie, se2] = _(r[0] + p, r[1] + y, r[2] + f), m2 = o * 4;
          u[m2] = ce2, u[m2 + 1] = ie, u[m2 + 2] = se2, u[m2 + 3] = Math.max(0.16, r[3] + re2);
        }
        const l = new Float32Array(k * 4);
        for (let o = 0; o < k * 4; o++) l[o] = (e() - 0.5) * 2 * L;
        const c = new Float32Array(de * 4), x2 = l[0], b = l[1], D = l[2], C = l[3], S = l[4], R = l[5], A = l[6], N2 = l[7], G2 = l[8], M = l[9], z = l[10], W = l[11], w2 = l[12], U = l[13], I = l[14], O2 = l[15], [T, q] = d2(-0.8502 + x2 * 0.04, -0.5265 + b * 0.04);
        c.set([T, q, 0.2077 + D * 0.012, 0.136 + C * 0.015], 0);
        const [E, H] = d2(-0.8146 + b * 0.04, 0.5801 - x2 * 0.04);
        c.set([E, H, 0.16 + C * 0.012, 0.31 + x2 * 0.04], 4);
        const [V, j2] = d2(-0.9935 + S * 0.03, 0.1134 + R * 0.04);
        c.set([V, j2, 0.142 + A * 0.012, 0], 8);
        const [K3, X2] = d2(-0.49 + R * 0.04, -0.872 + S * 0.04);
        c.set([K3, X2, 0.276 + N2 * 0.012, 0], 12);
        const [Y2, Z2] = d2(-0.755, -0.656);
        c.set([Y2, Z2, 0.326 + G2 * 0.012, 0], 16);
        const [J3, $3] = d2(0.56 + M * 0.04, -0.828);
        c.set([J3, $3, 0.332 + z * 0.012, 0], 20);
        const [Q2, ee] = d2(0.93 + W * 0.04, -0.367 + w2 * 0.04);
        c.set([Q2, ee, 0.056 + U * 0.012, 0], 24);
        const [te, ae2] = d2(0.998 + I * 0.04, 0.064 + O2 * 0.04);
        c.set([te, ae2, 0.0412 + w2 * 0.012, 0], 28);
        const n = new Float32Array(B * 4);
        for (let o = 0; o < B; o++) {
          const r = ue[o], [i, p, y] = _(r[0] + (e() - 0.5) * 0.45 * h, r[1] + (e() - 0.5) * 0.45 * h, r[2] + (e() - 0.5) * 0.35 * h), f = o * 4;
          n[f] = i, n[f + 1] = p, n[f + 2] = y, n[f + 3] = r[3] + (e() - 0.5) * 1.2 * h;
        }
        const v = new Float32Array(P * 4);
        for (let o = 0; o < P; o++) {
          const r = ve[o], i = (o + 1) * 4, p = o * 4;
          v[p] = r[0] + n[i] * 0.055, v[p + 1] = r[1] + n[i + 1] * 0.055, v[p + 2] = r[2] + n[i + 3] * 0.12, v[p + 3] = 0;
        }
        const oe = t ? [0.42, 1.78, 3.15] : [e() * 6.28318, e() * 6.28318, e() * 6.28318], le2 = t ? [0.85, 2.14, 4.02, 0] : [e() * 6.28318, e() * 6.28318, e() * 6.28318, 0.55];
        return { hullPlanes: u, chiselJitter: l, chiselPlanes: c, internalPlanes: n, pavilionPlanes: v, chipPhase: oe, subdivPhase: le2, boundRadii: [0.8, 1.02, 0.68], scissorRadii: [0.36, 0.5, 0.25] };
      }, getUniforms(a2, t) {
        return { uChipPhase: a2.getUniformLocation(t, "u_chipPhase"), uSubdivPhase: a2.getUniformLocation(t, "u_subdivPhase"), uHullPlanes: a2.getUniformLocation(t, "u_hullPlanes"), uChiselPlanes: a2.getUniformLocation(t, "u_chiselPlanes"), uInternalPlanes01: a2.getUniformLocation(t, "u_internalPlanes01"), uPavilionPlanes: a2.getUniformLocation(t, "u_pavilionPlanes"), lastGeom: null };
      }, uploadUniforms(a2, t, e) {
        t.lastGeom !== e && (t.lastGeom = e, a2.uniform3f(t.uChipPhase, e.chipPhase[0], e.chipPhase[1], e.chipPhase[2]), a2.uniform4f(t.uSubdivPhase, e.subdivPhase[0], e.subdivPhase[1], e.subdivPhase[2], e.subdivPhase[3]), a2.uniform4fv(t.uHullPlanes, e.hullPlanes), a2.uniform4fv(t.uChiselPlanes, e.chiselPlanes), a2.uniform4fv(t.uInternalPlanes01, e.internalPlanes, 0, 8), a2.uniform4fv(t.uPavilionPlanes, e.pavilionPlanes));
      } };
    }
  });

  // ../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/harness-VbPrAQ-R.js
  var harness_VbPrAQ_R_exports = {};
  __export(harness_VbPrAQ_R_exports, {
    buildInvRotMatrix: () => $t,
    composeElementInvRot: () => Wt,
    createElementMotionController: () => Ot,
    createReactiveEmitterState: () => jt,
    drawReactiveEmitter: () => Zt,
    renderElementSpec: () => Jt,
    stepCriticallyDamped2D: () => et,
    stepReactiveEmitter: () => Ht,
    triggerReactiveTapBurst: () => Kt
  });
  function mt(t, e, o) {
    const n = Math.max(0, Math.min(1, (o - t) / (e - t)));
    return n * n * (3 - 2 * n);
  }
  function et(t, e, o, n, u) {
    if (u <= 0) return;
    const s = Math.exp(-n * u), c = t.x - e, h = t.vx + n * c;
    t.x = e + (c + h * u) * s, t.vx = (t.vx - h * n * u) * s;
    const a2 = t.y - o, r = t.vy + n * a2;
    t.y = o + (a2 + r * u) * s, t.vy = (t.vy - r * n * u) * s;
  }
  function st(t, e, o) {
    const n = t[0], u = t[1], s = t[2], c = t[3], h = t[4], a2 = t[5], r = t[6], l = t[7], y = t[8], A = e[0], P2 = e[1], R = e[2], M = e[3], m2 = e[4], f = e[5], d3 = e[6], i = e[7], p = e[8];
    o[0] = n * A + u * M + s * d3, o[1] = n * P2 + u * m2 + s * i, o[2] = n * R + u * f + s * p, o[3] = c * A + h * M + a2 * d3, o[4] = c * P2 + h * m2 + a2 * i, o[5] = c * R + h * f + a2 * p, o[6] = r * A + l * M + y * d3, o[7] = r * P2 + l * m2 + y * i, o[8] = r * R + l * f + y * p;
  }
  function dt(t, e, o, n) {
    const u = Math.cos(t), s = Math.sin(t), c = Math.cos(e), h = Math.sin(e), a2 = Math.cos(o), r = Math.sin(o);
    n[0] = a2 * u - r * h * s, n[1] = -r * c, n[2] = a2 * s + r * h * u, n[3] = r * u + a2 * h * s, n[4] = a2 * c, n[5] = r * s - a2 * h * u, n[6] = -c * s, n[7] = h, n[8] = c * u;
  }
  function qt(t) {
    let e = t[0], o = t[1], n = t[2];
    const u = 1 / (Math.hypot(e, o, n) || 1);
    e *= u, o *= u, n *= u;
    let s = t[3], c = t[4], h = t[5];
    const a2 = e * s + o * c + n * h;
    s -= a2 * e, c -= a2 * o, h -= a2 * n;
    const r = 1 / (Math.hypot(s, c, h) || 1);
    s *= r, c *= r, h *= r;
    const l = o * h - n * c, y = n * s - e * h, A = e * c - o * s;
    t[0] = e, t[1] = o, t[2] = n, t[3] = s, t[4] = c, t[5] = h, t[6] = l, t[7] = y, t[8] = A;
  }
  function Wt(t, e, o, n, u, s, c, h) {
    dt(t, e, -o, ot);
    const a2 = n ? (st(n, ot, pt), pt) : ot;
    if (Math.abs(u) < 1e-7 && Math.abs(s) < 1e-7 && Math.abs(c) < 1e-7) {
      h.set(a2);
      return;
    }
    dt(u, s, c, xt), st(xt, a2, h);
  }
  function Ot() {
    const t = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), e = { yaw: 0, pitch: 0, roll: 0, vy: 0, vp: 0, vr: 0, ambientScale: 1 }, o = { x: 0, y: 0, vx: 0, vy: 0 }, n = { x: 0, y: 0, vx: 0, vy: 0 }, u = { x: 0, y: 0, vx: 0, vy: 0 }, s = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
    let c = false, h = 0, a2 = 0, r = 0, l = 0, y = 0, A = false, P2 = 0, R = 0;
    const M = [0.32, 0.42], m2 = { wake0X: 0, wake0Y: 0, wake1X: 0, wake1Y: 0, wake2X: 0, wake2Y: 0, velX: 0, velY: 0, speed01: 0, strength: 0 }, f = { tapNdcX: 0, tapNdcY: 0, age: 10, strength: 0 };
    function d3(i, p) {
      if (Math.abs(i) < 1e-7 && Math.abs(p) < 1e-7) return;
      const v = Math.cos(i), x2 = Math.sin(i), b = Math.cos(p), _2 = Math.sin(p);
      F2[0] = v, F2[1] = x2 * _2, F2[2] = x2 * b, F2[3] = 0, F2[4] = b, F2[5] = -_2, F2[6] = -x2, F2[7] = v * _2, F2[8] = v * b, st(F2, t, nt), qt(nt), t.set(nt);
    }
    return { dragMat: t, fluidTilt: e, wake: m2, tap: f, crystalHalfNdc: M, get crystalProximity() {
      return R;
    }, addDragPixels(i, p, v, x2) {
      a2 += i / Math.max(220, v) * Math.PI * 1.55, r += p / Math.max(220, x2) * Math.PI * 1.35;
    }, freezeOrbitForLoop() {
      d3(a2, r), a2 = 0, r = 0, l = 0, y = 0;
    }, triggerTap(i) {
      const p = Math.max(1, Math.min(i.width, i.height)), v = (i.ptrX - 0.5) * i.width / p - i.shiftNdcX, x2 = (i.ptrY - 0.5) * i.height / p - i.shiftNdcY, b = Math.hypot(v / (M[0] * 1.08), x2 / (M[1] * 1.08)), _2 = Math.max(0, Math.min(1, (1.65 - b) / 0.85)), w2 = _2 * _2 * (3 - 2 * _2), L = w2 * i.effectScale;
      if (f.tapNdcX = v, f.tapNdcY = x2, f.age = 0, f.strength = L, w2 > 0.02 && i.tiltScale > 1e-3) {
        const D = i.allowTorque ? 1 : 0.28, g2 = Math.max(-1.25, Math.min(1.25, v / Math.max(0.14, M[0]))), Y2 = Math.max(-1.25, Math.min(1.25, x2 / Math.max(0.16, M[1]))), T = w2 * i.tiltScale * D;
        e.vy = Math.max(-1.35, Math.min(1.35, e.vy + (g2 * 0.68 + 0.08) * T)), e.vp = Math.max(-1.35, Math.min(1.35, e.vp + (-Y2 * 0.62 - 0.14) * T)), e.vr = Math.max(-0.75, Math.min(0.75, e.vr + (-g2 * Y2 * 0.28 + g2 * 0.09) * T));
      }
      return L;
    }, step(i, p) {
      const { dt: v } = i, x2 = i.interactionEnabled && i.cursorInside && !i.isDragging, b = i.interactionEnabled ? i.tiltScale : 0;
      if (v > 0) {
        let S = 0;
        if (x2) {
          c ? (et(s, i.targetPtrX, i.targetPtrY, 9, v), S = Math.hypot(s.vx, s.vy), (S > 1e-4 || h > 5e-3) && (h += (1 - h) * (1 - Math.exp(-10.5 * v)))) : (s.x = i.targetPtrX, s.y = i.targetPtrY, s.vx = 0, s.vy = 0, h = 0);
          const E = i.invertTilt ?? true ? -1 : 1, k3 = h * b, q = E * (s.x - 0.5) * 0.62 * k3, H = -E * (s.y - 0.5) * 0.5 * k3, W = (-E * (s.x - 0.5) * 0.12 - (s.y - 0.5) * e.yaw * 0.24) * k3, Z2 = q - e.yaw, $3 = H - e.pitch, wt2 = W - e.roll, rt2 = Math.hypot(Z2, $3), Rt = mt(0.02, 0.16, rt2), it2 = mt(0.12, 1.15, S), ct2 = Math.max(Rt, it2), I = 5.1 + 2 * ct2, ft2 = 2 * (1.06 - 0.04 * ct2) * I, tt = Math.exp(-ft2 * v), at2 = (1 - tt) / ft2, At2 = 0.25 * Math.max(0.35, b), ht2 = 1 / Math.hypot(1, rt2 / At2), St = Z2 * ht2, Lt = $3 * ht2, ut2 = 1 / Math.hypot(1, S / 1.25), lt2 = s.vx * ut2, gt = s.vy * ut2, vt2 = (0.08 + 0.16 * it2) * k3, Et = E * lt2 * vt2, Dt = -E * gt * vt2 * 0.85, Ct2 = -E * lt2 * 0.1 * k3;
          e.vy = e.vy * tt + (I * I * St + I * Et * 0.6) * at2, e.vp = e.vp * tt + (I * I * Lt + I * Dt * 0.6) * at2, e.vr = e.vr * tt + (I * I * wt2 + I * Ct2 * 0.5) * at2;
        } else {
          h = 0, s.vx = 0, s.vy = 0;
          const E = 0.72, k3 = 1 + e.yaw / 0.5 * (e.yaw / 0.5) * 2.2, q = 1 + e.pitch / 0.4 * (e.pitch / 0.4) * 2.2, H = 1 + e.roll / 0.25 * (e.roll / 0.25) * 2, W = Math.exp(-2.15 * v);
          e.vy = (e.vy - E * k3 * e.yaw * v) * W, e.vp = (e.vp - E * q * e.pitch * v) * W, e.vr = (e.vr - E * 1.25 * H * e.roll * v) * W;
        }
        c = x2, e.yaw += e.vy * v, e.pitch += e.vp * v, e.roll += e.vr * v, !x2 && Math.abs(e.vy) < 1e-4 && Math.abs(e.yaw) < 1e-4 && (e.vy = 0, e.yaw = 0), !x2 && Math.abs(e.vp) < 1e-4 && Math.abs(e.pitch) < 1e-4 && (e.vp = 0, e.pitch = 0), !x2 && Math.abs(e.vr) < 1e-4 && Math.abs(e.roll) < 1e-4 && (e.vr = 0, e.roll = 0);
        const z = 1 - 0.72 * Math.min(1, S * 0.9 + Math.hypot(e.vy, e.vp) * 1.35 + (i.isDragging ? 1 : 0)), V = z < e.ambientScale ? 5 : 0.72;
        e.ambientScale += (z - e.ambientScale) * (1 - Math.exp(-V * v));
      }
      if (v > 0) {
        const S = 1 - Math.exp(-22 * v), X2 = a2 * S, z = r * S;
        if (a2 -= X2, r -= z, i.isDragging) {
          d3(X2, z);
          const V = 1 / Math.max(4e-3, v), E = Math.max(-5.5, Math.min(5.5, X2 * V)), k3 = Math.max(-5.5, Math.min(5.5, z * V)), q = 1 - Math.exp(-14 * v);
          l += (E - l) * q, y += (k3 - y) * q;
        } else {
          const V = Math.exp(-2.8 * v), E = X2 + l * v, k3 = z + y * v;
          d3(E, k3), l *= V, y *= V, Math.abs(l) < 1e-4 && (l = 0), Math.abs(y) < 1e-4 && (y = 0);
        }
      }
      const _2 = i.boundRadii[0], w2 = i.boundRadii[1], L = i.boundRadii[2], D = Math.hypot(p[0] * _2, p[1] * w2, p[2] * L), g2 = Math.hypot(p[3] * _2, p[4] * w2, p[5] * L), Y2 = 1.85 / 2.55 * Math.max(0.35, i.scale * 0.94);
      M[0] = Math.max(0.14, D * Y2), M[1] = Math.max(0.16, g2 * Y2);
      const T = Math.max(1, Math.min(i.width, i.height)), U = (i.targetPtrX - 0.5) * i.width / T - i.shiftNdcX, B3 = (i.targetPtrY - 0.5) * i.height / T - i.shiftNdcY, N2 = i.cursorInside && i.interactionEnabled && i.effectScale > 1e-3;
      if (N2 && !A && P2 < 0.03 && (o.x = n.x = u.x = U, o.y = n.y = u.y = B3, o.vx = o.vy = n.vx = n.vy = u.vx = u.vy = 0), A = N2, v > 0) {
        if (N2) et(o, U, B3, 14.5, v);
        else {
          const S = Math.exp(-3.6 * v);
          o.x += o.vx * v, o.y += o.vy * v, o.vx *= S, o.vy *= S;
        }
        et(n, o.x, o.y, 7.5, v), et(u, n.x, n.y, 3.8, v);
      }
      const C = Math.hypot(o.x / (M[0] * 1.05), o.y / (M[1] * 1.05)), O2 = Math.max(0, Math.min(1, (1.52 - C) / 0.76));
      if (R = N2 ? O2 * O2 * (3 - 2 * O2) : 0, v > 0) {
        const S = R > P2 ? 8.5 : 2.2;
        P2 += (R - P2) * (1 - Math.exp(-S * v)), P2 < 1e-4 && !N2 && (P2 = 0), f.age < 10 && (f.age += v);
      }
      const j2 = Math.hypot(o.vx, o.vy);
      m2.wake0X = o.x, m2.wake0Y = o.y, m2.wake1X = n.x, m2.wake1Y = n.y, m2.wake2X = u.x, m2.wake2Y = u.y, m2.velX = o.vx, m2.velY = o.vy, m2.speed01 = Math.min(1, j2 / 1.55), m2.strength = P2 * i.effectScale;
    }, isSettling() {
      const i = Math.hypot(e.vy, e.vp, e.vr) > 0.022, p = Math.hypot(l, y) > 0.015 || Math.hypot(a2, r) > 1e-4, v = f.strength > 5e-3 && f.age < 2.8;
      return i || p || P2 > 2e-3 || v;
    } };
  }
  function bt(t) {
    const e = cn(t, "gemini-4-elements:reactive-emitter", Ut, Bt);
    if (!e) return null;
    const o = t.createVertexArray(), n = t.createBuffer();
    if (!o || !n) return o && t.deleteVertexArray(o), n && t.deleteBuffer(n), t.deleteProgram(e), null;
    t.bindVertexArray(o), t.bindBuffer(t.ARRAY_BUFFER, n), t.bufferData(t.ARRAY_BUFFER, K * Q * 4, t.DYNAMIC_DRAW);
    const u = Q * 4;
    t.enableVertexAttribArray(0), t.vertexAttribPointer(0, 4, t.FLOAT, false, u, 0), t.vertexAttribDivisor(0, 1), t.enableVertexAttribArray(1), t.vertexAttribPointer(1, 4, t.FLOAT, false, u, 16), t.vertexAttribDivisor(1, 1), t.bindVertexArray(null), t.bindBuffer(t.ARRAY_BUFFER, null);
    const s = t.getUniformLocation(e, "u_noise3D");
    return t.useProgram(e), t.uniform1i(s, 0), t.useProgram(null), { program: e, vao: o, instanceVbo: n, uRes: t.getUniformLocation(e, "u_res"), uCenterShift: t.getUniformLocation(e, "u_centerShift"), uMode: t.getUniformLocation(e, "u_mode"), uIsLightBackdrop: t.getUniformLocation(e, "u_isLightBackdrop"), uIntensity: t.getUniformLocation(e, "u_intensity"), uNoise3d: s };
  }
  function Xt(t) {
    t.acquirePlugin("element:reactive-emitter", bt, Pt);
  }
  function Pt(t, e) {
    t.deleteBuffer(e.instanceVbo), t.deleteVertexArray(e.vao), t.deleteProgram(e.program);
  }
  function jt(t) {
    const e = new Float32Array(K * G);
    for (let o = 0; o < K; o++) e[o * G + 11] = -1;
    return { slots: e, gpuBuffer: new Float32Array(K * Q), rand: pe(t * 4999 + 73), activeCount: 0, pendingBurst: false, spawnAccum: 0, cursorSlot: 0 };
  }
  function Ht(t, e, o, n, u, s, c, h) {
    if (!e || o <= 0) return;
    const { slots: a2, rand: r } = t, l = e.mode === "shards", y = l ? K : _t;
    if (n.strength > 0.04 && u > 0.08) {
      const f = Math.hypot(n.velX, n.velY), d3 = (e.hoverRate + f * e.sweepRate) * Math.min(1.45, n.strength) * u;
      t.spawnAccum = Math.min(6, t.spawnAccum + d3 * o);
      const i = Math.max(0.12, s[0] * 0.92), p = Math.max(0.14, s[1] * 0.92);
      for (; t.spawnAccum >= 1; ) {
        t.spawnAccum -= 1;
        const v = t.cursorSlot % y;
        t.cursorSlot = (v + 1) % y;
        const x2 = v * G;
        let b = n.wake0X, _2 = n.wake0Y;
        const w2 = Math.hypot(b / i, _2 / p);
        if (w2 > 0.96) {
          const q = 0.96 / w2;
          b *= q, _2 *= q;
        } else if (l || r() < 0.48) {
          let q = w2 > 0.05 ? b / i / w2 : 0, H = w2 > 0.05 ? _2 / p / w2 : 0;
          if (w2 <= 0.05) {
            const $3 = r() * Math.PI * 2;
            q = Math.cos($3), H = Math.sin($3);
          }
          const W = l ? 0.56 + 0.38 * r() : 0.74 + 0.22 * r(), Z2 = l ? 0.38 + 0.42 * r() : 0.45 + 0.35 * r();
          b += (q * i * W - b) * Z2, _2 += (H * p * W - _2) * Z2;
        }
        const L = r() * Math.PI * 2, D = (l ? 0.014 + 0.036 * r() : 0.025 + 0.075 * r()) * Math.max(0.5, c);
        b += Math.cos(L) * D, _2 += Math.sin(L) * D;
        const g2 = Math.hypot(b, _2) || 1, Y2 = b / g2, T = _2 / g2, U = l ? 0.12 : 0.16, B3 = e.radialPush * (0.55 + 0.75 * r()), N2 = r() * Math.PI * 2, C = (l ? 0.022 : 0.032) * (0.4 + 0.6 * r()), O2 = n.velX * U + Y2 * B3 + Math.cos(N2) * C, j2 = n.velY * U + T * B3 + Math.sin(N2) * C + (l ? 0.012 : 0.052), S = e.lifeRange[0], X2 = e.lifeRange[1], z = S + (X2 - S) * r(), V = l ? Math.pow(r(), 1.35) : r(), E = r();
        let k3 = e.sizePxRange[0] + (e.sizePxRange[1] - e.sizePxRange[0]) * V;
        !l && E >= 0.76 && (k3 = 2.6 + 3.4 * r()), a2[x2] = b, a2[x2 + 1] = _2, a2[x2 + 2] = O2, a2[x2 + 3] = j2, a2[x2 + 4] = 0, a2[x2 + 5] = z, a2[x2 + 6] = k3, a2[x2 + 7] = r() * Math.PI * 2, a2[x2 + 8] = (r() - 0.5) * (l ? 1.8 : 0.9), a2[x2 + 9] = r() * Math.PI * 2, a2[x2 + 10] = (l ? 1.8 : 1.4) + r() * (l ? 2.6 : 1.6), a2[x2 + 11] = r() + Math.floor(E * 1e3) * 2;
      }
    } else t.spawnAccum = 0;
    if (t.activeCount === 0 && !t.pendingBurst && n.strength <= 0.04) return;
    t.pendingBurst = false;
    const A = Math.exp(-(l ? 1.45 : 1.25) * o), P2 = h / 900 * Math.max(0.55, c), R = l ? 0.48 : 1.5, { gpuBuffer: M } = t;
    let m2 = 0;
    for (let f = 0; f < y; f++) {
      const d3 = f * G, i = a2[d3 + 11];
      if (i < 0) continue;
      const p = a2[d3 + 4] + o, v = a2[d3 + 5];
      if (p >= v) {
        a2[d3 + 11] = -1;
        continue;
      }
      const x2 = i % 1, b = Math.min(0.999, Math.floor(i / 2) / 1e3);
      let _2 = a2[d3 + 2] * A, w2 = (a2[d3 + 3] + e.buoyancy * o) * A;
      const L = p * 3.1 + x2 * 6.28318;
      _2 += Math.sin(L) * (l ? 0.028 : 0.072) * o, w2 += Math.cos(L * 0.8) * (l ? 0.018 : 0.028) * o;
      const D = a2[d3] + _2 * o, g2 = a2[d3 + 1] + w2 * o, Y2 = a2[d3 + 7] + a2[d3 + 8] * o, T = a2[d3 + 9] + a2[d3 + 10] * o;
      a2[d3] = D, a2[d3 + 1] = g2, a2[d3 + 2] = _2, a2[d3 + 3] = w2, a2[d3 + 4] = p, a2[d3 + 7] = Y2, a2[d3 + 9] = T;
      const U = p / v, B3 = !l && b < 0.76 ? 0.72 + 0.72 * U : 1 - 0.12 * U, N2 = Math.max(R, a2[d3 + 6] * P2 * B3), C = m2 * Q;
      M[C] = D, M[C + 1] = g2, M[C + 2] = N2, M[C + 3] = Y2, M[C + 4] = U, M[C + 5] = T, M[C + 6] = x2, M[C + 7] = b, m2++;
    }
    t.activeCount = m2;
  }
  function Kt(t, e, o, n, u, s, c) {
    if (!e || c <= 0.06) return;
    const { slots: h, rand: a2 } = t, r = e.mode === "shards", l = r ? K : _t, y = r ? Math.min(11, Math.round(5 + 4 * Math.min(1.4, c))) : Math.min(8, Math.round(4 + 3 * Math.min(1.4, c))), A = Math.max(0.12, u[0] * 0.94), P2 = Math.max(0.14, u[1] * 0.94), R = Math.min(1.4, c);
    for (let M = 0; M < y; M++) {
      const m2 = t.cursorSlot % l;
      t.cursorSlot = (m2 + 1) % l;
      const f = m2 * G;
      let d3 = o, i = n;
      const p = Math.hypot(d3 / A, i / P2);
      if (p > 0.96) {
        const X2 = 0.96 / p;
        d3 *= X2, i *= X2;
      }
      const v = M / y * Math.PI * 2 + (a2() - 0.5) * 0.65, x2 = (r ? 0.016 + 0.048 * a2() : 0.022 + 0.068 * a2()) * Math.max(0.5, s);
      d3 += Math.cos(v) * x2, i += Math.sin(v) * x2;
      const b = Math.cos(v), _2 = Math.sin(v), w2 = Math.hypot(d3, i) || 1, L = b * 0.62 + d3 / w2 * 0.38, D = _2 * 0.62 + i / w2 * 0.38, g2 = Math.hypot(L, D) || 1, Y2 = e.radialPush * (1.15 + 1.05 * a2()) * (0.75 + 0.35 * R), T = L / g2 * Y2, U = D / g2 * Y2 + (r ? 0.018 : 0.068), B3 = e.lifeRange[0], N2 = e.lifeRange[1], C = (B3 + (N2 - B3) * a2()) * 0.95, O2 = r ? Math.pow(a2(), 1.25) : a2(), j2 = !r && M % 5 >= 3 ? 0.78 + 0.2 * a2() : a2() * 0.74;
      let S = e.sizePxRange[0] + (e.sizePxRange[1] - e.sizePxRange[0]) * O2;
      !r && j2 >= 0.76 && (S = 2.8 + 3.6 * a2()), h[f] = d3, h[f + 1] = i, h[f + 2] = T, h[f + 3] = U, h[f + 4] = 0, h[f + 5] = C, h[f + 6] = S, h[f + 7] = a2() * Math.PI * 2, h[f + 8] = (a2() - 0.5) * (r ? 2.2 : 1.1), h[f + 9] = a2() * Math.PI * 2, h[f + 10] = (r ? 2.2 : 1.6) + a2() * (r ? 2.8 : 1.8), h[f + 11] = a2() + Math.floor(j2 * 1e3) * 2;
    }
    t.pendingBurst = true;
  }
  function Zt(t, e, o, n, u, s, c, h, a2, r) {
    if (!n || o.activeCount <= 0 || r <= 1e-3) return;
    const l = e.acquirePlugin("element:reactive-emitter", bt, Pt);
    if (!l) return;
    const y = w(e);
    y && (t.enable(t.BLEND), t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA), t.useProgram(l.program), t.bindVertexArray(l.vao), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_3D, y), t.bindBuffer(t.ARRAY_BUFFER, l.instanceVbo), t.bufferSubData(t.ARRAY_BUFFER, 0, o.gpuBuffer, 0, o.activeCount * Q), t.uniform2f(l.uRes, u, s), t.uniform2f(l.uCenterShift, c, h), t.uniform1f(l.uMode, n.mode === "shards" ? 1 : 0), t.uniform1f(l.uIsLightBackdrop, a2 ? 1 : 0), t.uniform1f(l.uIntensity, r), t.drawArraysInstanced(t.TRIANGLES, 0, 6, o.activeCount), t.bindVertexArray(null), t.disable(t.BLEND));
  }
  function $t(t, e, o, n) {
    const u = Math.cos(-t), s = Math.sin(-t), c = Math.cos(-e), h = Math.sin(-e), a2 = Math.cos(o), r = Math.sin(o), l = u * a2 + s * h * r, y = -u * r + s * h * a2, A = s * c, P2 = c * r, R = c * a2, M = -h, m2 = -s * a2 + u * h * r, f = s * r + u * h * a2, d3 = u * c;
    n[0] = l, n[1] = P2, n[2] = m2, n[3] = y, n[4] = R, n[5] = f, n[6] = A, n[7] = M, n[8] = d3;
  }
  function It(t, e, o, n, u, s, c, h, a2, r) {
    const l = a2 < 2.8 && r > 0.01 ? Math.min(0.035, r * 0.025) : 0, y = 0.068 + Math.min(0.025, h * 0.018) + l, A = t[0] + y, P2 = t[1] + y, R = t[2] + y, M = Math.hypot(e[0] * A, e[1] * P2, e[2] * R), m2 = Math.hypot(e[3] * A, e[4] * P2, e[5] * R), f = Math.hypot(e[6] * A, e[7] * P2, e[8] * R), i = 1.85 / Math.max(1.1, 2.75 - f) * Math.max(0.35, o * 0.92) * 1.05, p = M * i, v = m2 * i, x2 = Math.min(s, c), b = 0.5 * s + n * x2, _2 = 0.5 * c + u * x2, w2 = Math.max(0, Math.floor(b - p * x2)), L = Math.min(s, Math.ceil(b + p * x2)), D = Math.max(0, Math.floor(_2 - v * x2)), g2 = Math.min(c, Math.ceil(_2 + v * x2));
    return L <= w2 || g2 <= D ? null : (J[0] = w2, J[1] = D, J[2] = L - w2, J[3] = g2 - D, J);
  }
  function Jt(t, e, o, n, u, s) {
    const c = e.acquirePlugin(`element:${n.id}`, (m2) => {
      const f = cn(m2, `gemini-4-elements:${n.id}`, jn, n.fragSrc);
      if (!f) return null;
      const d3 = m2.getUniformLocation(f, "u_noise3D");
      return m2.useProgram(f), m2.uniform1i(d3, 0), m2.useProgram(null), { program: f, bgLocs: ro(m2, f), uRes: m2.getUniformLocation(f, "u_res"), uTime: m2.getUniformLocation(f, "u_time"), uInvRot: m2.getUniformLocation(f, "u_invRot"), uBoundRadii: m2.getUniformLocation(f, "u_boundRadii"), uScale: m2.getUniformLocation(f, "u_scale"), uCenterShift: m2.getUniformLocation(f, "u_centerShift"), uDof: m2.getUniformLocation(f, "u_dof"), uFog: m2.getUniformLocation(f, "u_fog"), uBloom: m2.getUniformLocation(f, "u_bloom"), uRefraction: m2.getUniformLocation(f, "u_refraction"), uDetail: m2.getUniformLocation(f, "u_detail"), uPointer: m2.getUniformLocation(f, "u_pointer"), uIsLightBackdrop: m2.getUniformLocation(f, "u_isLightBackdrop"), uWake0: m2.getUniformLocation(f, "u_wake0"), uWake1: m2.getUniformLocation(f, "u_wake1"), uWake2: m2.getUniformLocation(f, "u_wake2"), uTap: m2.getUniformLocation(f, "u_tap"), uNoise3d: d3, custom: n.getUniforms(m2, f) };
    }, (m2, f) => {
      m2.deleteProgram(f.program);
    });
    if (!c) return;
    n.reactive && Xt(e);
    const { width: h, height: a2, wake: r, tap: l } = s, y = Math.max(1, Math.min(h, a2)), A = s.offsetX * h / y, P2 = -s.offsetY * a2 / y + s.bobY, R = It(u.scissorRadii ?? u.boundRadii, s.invRot, s.scale, A, P2, h, a2, r.strength, l.age, l.strength);
    if (!R) return;
    const M = w(e);
    M && (t.enable(t.SCISSOR_TEST), t.scissor(R[0], R[1], R[2], R[3]), t.enable(t.BLEND), t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA), t.useProgram(c.program), t.bindVertexArray(o), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_3D, M), co(t, c.bgLocs, s.gradientFrame), t.uniform2f(c.uRes, h, a2), t.uniform1f(c.uTime, s.timeSec), t.uniformMatrix3fv(c.uInvRot, false, s.invRot), t.uniform3f(c.uBoundRadii, u.boundRadii[0], u.boundRadii[1], u.boundRadii[2]), t.uniform1f(c.uScale, s.scale), t.uniform2f(c.uCenterShift, A, P2), t.uniform1f(c.uDof, s.dof01), t.uniform1f(c.uFog, s.fog01), t.uniform1f(c.uBloom, s.bloom01), t.uniform1f(c.uRefraction, s.refraction01), t.uniform1f(c.uDetail, s.detail01), t.uniform2f(c.uPointer, s.ptrX, s.ptrY), t.uniform1f(c.uIsLightBackdrop, s.gradientFrame.spec.isLightBackdrop ? 1 : 0), t.uniform4f(c.uWake0, r.wake0X, r.wake0Y, r.velX, r.velY), t.uniform4f(c.uWake1, r.wake1X, r.wake1Y, r.strength, r.speed01), t.uniform2f(c.uWake2, r.wake2X, r.wake2Y), t.uniform4f(c.uTap, l.tapNdcX, l.tapNdcY, l.age, l.strength), n.uploadUniforms(t, c.custom, u, s), t.drawArrays(t.TRIANGLES, 0, 3), t.bindVertexArray(null), t.disable(t.BLEND), t.disable(t.SCISSOR_TEST));
  }
  var ot, xt, pt, F2, nt, K, _t, Q, Ut, Bt, G, J;
  var init_harness_VbPrAQ_R = __esm({
    "../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/harness-VbPrAQ-R.js"() {
      init_script();
      init_common_glsl_BEuQF3CN();
      ot = new Float32Array(9);
      xt = new Float32Array(9);
      pt = new Float32Array(9);
      F2 = new Float32Array(9);
      nt = new Float32Array(9);
      K = 48;
      _t = 28;
      Q = 8;
      Ut = `#version 300 es
precision highp float;

layout(location = 0) in vec4 a_inst0; // xy = crystal NDC, z = radiusPx, w = rotRad
layout(location = 1) in vec4 a_inst1; // x = age01, y = tumblePhase, z = seed01, w = variant01

uniform vec2 u_res;
uniform vec2 u_centerShift;
uniform float u_mode;

out vec2 v_quad;
out float v_radPx;
out float v_age;
out float v_tumble;
out float v_seed;
out float v_variant;

void main() {
  int vid = gl_VertexID;
  vec2 corner = vec2(
    (vid == 1 || vid == 2 || vid == 4) ? 1.0 : -1.0,
    (vid == 2 || vid == 4 || vid == 5) ? 1.0 : -1.0
  );

  float cr = cos(a_inst0.w);
  float sr = sin(a_inst0.w);

  vec2 qLocal;
  vec2 offsetPx;
  if (u_mode > 0.5) {
    // Sub-pixel dust grains get a +1.25px filter skirt so 0.5-2px specks never clip or alias
    float quadHalfPx = max(1.8, a_inst0.z + 1.25);
    qLocal = corner * quadHalfPx;
    offsetPx = vec2(cr * qLocal.x - sr * qLocal.y, sr * qLocal.x + cr * qLocal.y);
  } else {
    // Tight ellipse fit trims 24% of empty discarded fragments on elongated vapor wisps
    qLocal = (a_inst1.w < 0.76) ? vec2(corner.x * 0.76, corner.y) : corner;
    offsetPx = vec2(cr * qLocal.x - sr * qLocal.y, sr * qLocal.x + cr * qLocal.y) * a_inst0.z;
  }

  float minDim = min(u_res.x, u_res.y);
  vec2 centerPx = 0.5 * u_res + (a_inst0.xy + u_centerShift) * minDim;
  vec2 posPx = centerPx + offsetPx;
  vec2 clip = (posPx / u_res) * 2.0 - 1.0;

  v_quad = qLocal;
  v_radPx = a_inst0.z;
  v_age = a_inst1.x;
  v_tumble = a_inst1.y;
  v_seed = a_inst1.z;
  v_variant = a_inst1.w;

  gl_Position = vec4(clip, 0.0, 1.0);
}
`;
      Bt = `#version 300 es
precision highp float;

in vec2 v_quad;
in float v_radPx;
in float v_age;
in float v_tumble;
in float v_seed;
in float v_variant;

uniform float u_mode; // 0.0 = vapor, 1.0 = subtle mineral dust
uniform float u_isLightBackdrop;
uniform float u_intensity;
uniform highp sampler3D u_noise3D;

out vec4 outColor;

float fastWispNoise(vec2 p, float zSlice) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * (3.0 - 2.0 * f);
  return textureLod(u_noise3D, vec3((i + u + 0.5) * 0.015625, zSlice), 0.0).r;
}

void main() {
  vec2 q = v_quad;

  if (u_mode > 0.5) {
    // --- CARBON: Subtle Solid Mineral Dust Specks (0.5 - 2.0 px) ---
    float foreshorten = 0.66 + 0.34 * abs(cos(v_tumble));
    vec2 pPx = vec2(q.x / foreshorten, q.y);
    float distPx = length(pPx);

    float grainR = max(0.45, v_radPx);
    float coverage = clamp(grainR + 0.5 - distPx, 0.0, 1.0);
    if (coverage <= 0.002) discard;

    // Sub-pixel energy conservation keeps 0.5-1.0 px dust grains gentle and flicker-free
    float subPxEnergy = clamp(v_radPx / 0.90, 0.40, 1.0);
    float twCos = 0.5 + 0.5 * cos(v_tumble * 1.9 + v_seed * 6.28318);
    float twinkle = 0.58 + 0.42 * (twCos * twCos);
    float lifeEnv = smoothstep(0.0, 0.12, v_age) * pow(max(0.0, 1.0 - v_age), 1.30);
    float alpha = clamp(coverage * subPxEnergy * lifeEnv * (0.46 + 0.42 * twinkle) * min(1.25, u_intensity), 0.0, 0.92);
    if (alpha <= 0.002) discard;

    vec3 dustRgb = mix(vec3(0.84, 0.92, 1.00), vec3(0.992, 0.997, 1.00), twinkle);
    outColor = vec4(dustRgb * alpha, alpha);
    return;
  }

  // --- VAPOR MODE: Mist Wisps & Rising Motes ---
  if (v_variant >= 0.76) {
    // Delicate rising mote diffusing into air
    float rSq = dot(q, q);
    if (rSq > 1.0) discard;
    float twinkle = 0.68 + 0.32 * sin(v_tumble * 2.6 + v_seed * 6.28318);
    float lifeEnv = smoothstep(0.0, 0.10, v_age) * pow(max(0.0, 1.0 - v_age), 1.40);
    float moteAlpha = exp(-rSq * 3.4) * lifeEnv * twinkle * 0.64 * min(1.35, u_intensity);
    if (moteAlpha <= 0.002) discard;
    vec3 moteCol = vec3(0.97, 0.994, 1.00);
    outColor = vec4(moteCol * moteAlpha, moteAlpha);
    return;
  }

  // Billowing domain-warped vapor wisp (hardware 3D LUT noise)
  vec2 qWisp = vec2(q.x * 1.32, q.y * 0.82);
  float rSq = dot(qWisp, qWisp);
  if (rSq > 1.0) discard;
  vec2 nCoord = qWisp * 1.85 + vec2(v_seed * 11.3, v_tumble * 0.32);
  float n1 = fastWispNoise(nCoord, v_seed);
  float n2 = fastWispNoise(nCoord * 2.15 + vec2(n1 * 1.5 - 0.75, -v_tumble * 0.24), v_seed + 0.37);
  float wisp = smoothstep(0.24, 0.78, n1 * 0.58 + n2 * 0.42);

  float radial = exp(-rSq * 3.10) * (1.0 - smoothstep(0.54, 1.0, sqrt(rSq)));
  float lifeEnv = sin(clamp(v_age, 0.0, 1.0) * 3.14159265) * pow(max(0.0, 1.0 - v_age), 0.75);
  float vapAlpha = radial * wisp * lifeEnv * 0.19 * min(1.4, u_intensity);
  if (vapAlpha <= 0.0015) discard;

  vec3 vapCol = mix(
    vec3(0.78, 0.91, 1.00),
    vec3(0.965, 0.992, 1.00),
    0.45 + 0.45 * u_isLightBackdrop
  );
  outColor = vec4(vapCol * vapAlpha, vapAlpha);
}
`;
      G = 12;
      J = new Int32Array(4);
    }
  });

  // ../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/index-viUVYb1p.js
  var index_viUVYb1p_exports = {};
  __export(index_viUVYb1p_exports, {
    drawMotifFocal: () => bt2,
    prepareMotifAsset: () => _t2,
    selectMotifQualityTier: () => wt
  });
  function wt(t) {
    if (t.lowPower || t.viewportMinEdge !== void 0 && t.viewportMinEdge > 0 && t.viewportMinEdge <= 480) return "compact";
    const e = Math.min(t.cssWidth, t.cssHeight), i = Math.max(t.cssWidth, t.cssHeight);
    return e < 340 || i < 560 ? "compact" : "high";
  }
  function O(t, e) {
    if (B2.has(t)) B2.delete(t);
    else if (B2.size >= rt) {
      const i = B2.keys().next().value;
      i !== void 0 && B2.delete(i);
    }
    B2.set(t, e);
  }
  function Y(t, e, i, r, n) {
    i[0] = 0, r[0] = -k2, r[1] = k2;
    let a2 = 0;
    for (let o = 1; o < n; o++) {
      let c = (t[o] + o * o - (t[i[a2]] + i[a2] * i[a2])) / (2 * o - 2 * i[a2]);
      for (; c <= r[a2]; ) a2--, c = (t[o] + o * o - (t[i[a2]] + i[a2] * i[a2])) / (2 * o - 2 * i[a2]);
      a2++, i[a2] = o, r[a2] = c, r[a2 + 1] = k2;
    }
    a2 = 0;
    for (let o = 0; o < n; o++) {
      for (; r[a2 + 1] < o; ) a2++;
      const c = o - i[a2];
      e[o] = c * c + t[i[a2]];
    }
  }
  function $(t, e, i, r, n, a2) {
    for (let o = 0; o < e; o++) {
      for (let c = 0; c < e; c++) i[c] = t[c * e + o];
      Y(i, r, n, a2, e);
      for (let c = 0; c < e; c++) t[c * e + o] = r[c];
    }
    for (let o = 0; o < e; o++) {
      const c = o * e;
      for (let l = 0; l < e; l++) i[l] = t[c + l];
      Y(i, r, n, a2, e);
      for (let l = 0; l < e; l++) t[c + l] = Math.sqrt(r[l]);
    }
  }
  function st2(t, e, i, r, n) {
    if (n < 0.5) {
      e.set(t);
      return;
    }
    const a2 = n >= 2.5 ? 0.98711 * n - 0.9633 : 3.97156 - 4.14554 * Math.sqrt(Math.max(0.01, 1 - 0.26891 * n)), o = a2 * a2, c = o * a2, l = 1.57825 + 2.44413 * a2 + 1.4281 * o + 0.422205 * c, T = (2.44413 * a2 + 2.85619 * o + 1.26661 * c) / l, u = -(1.4281 * o + 1.26661 * c) / l, E = 0.422205 * c / l, y = 1 - (T + u + E);
    for (let w2 = 0; w2 < r; w2++) {
      const s = w2 * r;
      let m2 = t[s], x2 = m2, _2 = m2, b = m2;
      for (let v = 0; v < r; v++) m2 = y * t[s + v] + T * x2 + u * _2 + E * b, i[s + v] = m2, b = _2, _2 = x2, x2 = m2;
      m2 = i[s + r - 1], x2 = m2, _2 = m2, b = m2;
      for (let v = r - 1; v >= 0; v--) m2 = y * i[s + v] + T * x2 + u * _2 + E * b, i[s + v] = m2, b = _2, _2 = x2, x2 = m2;
    }
    for (let w2 = 0; w2 < r; w2++) {
      let s = i[w2], m2 = s, x2 = s, _2 = s;
      for (let b = 0; b < r; b++) {
        const v = b * r + w2;
        s = y * i[v] + T * m2 + u * x2 + E * _2, e[v] = s, _2 = x2, x2 = m2, m2 = s;
      }
      s = e[(r - 1) * r + w2], m2 = s, x2 = s, _2 = s;
      for (let b = r - 1; b >= 0; b--) {
        const v = b * r + w2;
        s = y * e[v] + T * m2 + u * x2 + E * _2, e[v] = s, _2 = x2, x2 = m2, m2 = s;
      }
    }
  }
  function ct(t, e) {
    const i = e * e, r = new Float32Array(i), n = new Float32Array(i), a2 = new Float64Array(e), o = new Float64Array(e), c = new Float64Array(e + 1), l = new Int32Array(e);
    for (let f = 0; f < i; f++) {
      const p = t[f * 4 + 3] / 255;
      if (p <= 4e-3) r[f] = k2, n[f] = 0;
      else if (p >= 0.996) r[f] = 0, n[f] = k2;
      else {
        const h = 0.5 - p, d3 = Math.max(0, h), S = Math.max(0, -h);
        r[f] = d3 * d3, n[f] = S * S;
      }
    }
    $(r, e, a2, o, l, c), $(n, e, a2, o, l, c);
    const T = r;
    for (let f = 0; f < i; f++) T[f] = r[f] - n[f];
    const u = n, E = 8 * (e / 1024);
    for (let f = 0; f < 2; f++) {
      for (let p = 0; p < e; p++) {
        const h = p * e;
        for (let d3 = 0; d3 < e; d3++) {
          const S = T[h + d3];
          if (Math.abs(S) > E) {
            u[h + d3] = S;
            continue;
          }
          const g2 = T[h + Math.max(0, d3 - 2)], M = T[h + Math.max(0, d3 - 1)], C = T[h + Math.min(e - 1, d3 + 1)], R = T[h + Math.min(e - 1, d3 + 2)];
          u[h + d3] = (g2 + 4 * M + 6 * S + 4 * C + R) * 0.0625;
        }
      }
      for (let p = 0; p < e; p++) {
        const h = p * e, d3 = Math.max(0, p - 2) * e, S = Math.max(0, p - 1) * e, g2 = Math.min(e - 1, p + 1) * e, M = Math.min(e - 1, p + 2) * e;
        for (let C = 0; C < e; C++) {
          const R = u[h + C];
          if (Math.abs(R) > E) {
            T[h + C] = R;
            continue;
          }
          T[h + C] = (u[d3 + C] + 4 * u[S + C] + 6 * R + 4 * u[g2 + C] + u[M + C]) * 0.0625;
        }
      }
    }
    const y = new Uint8Array(i * 2), w2 = e * 0.5;
    for (let f = 0; f < i; f++) {
      const p = Math.max(0, Math.min(1, 0.5 + T[f] / w2)), h = Math.round(p * 65535), d3 = f * 2;
      y[d3] = h >> 8 & 255, y[d3 + 1] = h & 255;
    }
    const s = Math.max(64, e >> 1), m2 = new Float32Array(s * s);
    for (let f = 0; f < s; f++) {
      const p = f * 2 * e, h = (f * 2 + 1) * e, d3 = f * s;
      for (let S = 0; S < s; S++) {
        const g2 = S * 2, M = g2 + 1;
        m2[d3 + S] = (t[(p + g2) * 4 + 3] + t[(p + M) * 4 + 3] + t[(h + g2) * 4 + 3] + t[(h + M) * 4 + 3]) / 1020;
      }
    }
    const x2 = new Float32Array(s * s), _2 = new Float32Array(s * s), b = new Uint8Array(s * s * 4), v = s / 512, D = 0.48 / 255;
    let A = s, I = s, P2 = -1, G2 = -1;
    for (let f = 0; f < 4; f++) {
      const p = it[f] * v;
      st2(m2, x2, _2, s, p);
      const h = f === 3;
      for (let d3 = 0; d3 < s; d3++) {
        const S = d3 * s;
        for (let g2 = 0; g2 < s; g2++) {
          const M = x2[S + g2], C = (g2 * 73 + d3 * 151 + f * 37 & 255) - (g2 * 199 + d3 * 53 + f * 89 & 255), R = M > 1e-3 && M < 0.999 ? C * D : 0, U = Math.max(0, Math.min(255, Math.round(M * 255 + R)));
          b[(S + g2) * 4 + f] = U, h && U > 0 && (g2 < A && (A = g2), g2 > P2 && (P2 = g2), d3 < I && (I = d3), d3 > G2 && (G2 = d3));
        }
      }
    }
    const L = P2 >= A && G2 >= I ? [Math.max(-0.48, (Math.max(0, A - 2) / s - 0.5) * 0.96), Math.max(-0.48, (Math.max(0, I - 2) / s - 0.5) * 0.96), Math.min(0.48, (Math.min(s, P2 + 3) / s - 0.5) * 0.96), Math.min(0.48, (Math.min(s, G2 + 3) / s - 0.5) * 0.96)] : [-0.48, -0.48, 0.48, 0.48];
    return { blurSize: s, rgBytes: y, blurRgbaBytes: b, isoBounds: L };
  }
  function lt(t, e, i, r, n, a2) {
    const o = document.createElement("canvas");
    o.width = t, o.height = t, o.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:32px;height:32px;opacity:0;pointer-events:none;z-index:-1;", o.style.fontFamily = e, o.style.fontOpticalSizing = "none", r && (o.style.fontFeatureSettings = '"liga" 1'), o.style.fontVariationSettings = i, n && typeof window < "u" && (n.append(o), o.offsetWidth, window.getComputedStyle(o).fontVariationSettings);
    try {
      const c = o.getContext("2d", { willReadFrequently: true });
      if (c.clearRect(0, 0, t, t), "fontVariationSettings" in c) try {
        c.fontVariationSettings = i;
      } catch {
      }
      return a2(c, o);
    } finally {
      o.remove(), o.width = 0, o.height = 0;
    }
  }
  function Z(t, e) {
    const i = document.createElement("canvas");
    i.width = t, i.height = t;
    try {
      const r = i.getContext("2d", { willReadFrequently: true });
      r.clearRect(0, 0, t, t), r.save();
      const n = t * 0.665, a2 = (t - n) * 0.5;
      r.translate(a2, a2), r.scale(n / 820, n / 820), r.translate(-70, 890), r.scale(1, -1);
      const o = new Path2D(nt2);
      return e ? (r.strokeStyle = "#ffffff", r.lineWidth = 58, r.lineJoin = "round", r.stroke(o)) : (r.fillStyle = "#ffffff", r.fill(o)), r.restore(), r.getImageData(0, 0, t, t).data;
    } finally {
      i.width = 0, i.height = 0;
    }
  }
  function ft(t, e) {
    let i = e, r = e, n = -1, a2 = -1;
    for (let o = 0; o < e; o++) {
      const c = o * e;
      for (let l = 0; l < e; l++) t[(c + l) * 4 + 3] > 16 && (l < i && (i = l), l > n && (n = l), o < r && (r = o), o > a2 && (a2 = o));
    }
    return n >= i && a2 >= r ? { minX: i, maxX: n, minY: r, maxY: a2 } : null;
  }
  function K2(t, e, i, r, n, a2, o, c) {
    let l = n ? 168 : 164;
    return lt(F3, i, r, n, c, (u, E) => {
      if (u.fillStyle = "#ffffff", u.textAlign = "center", u.textBaseline = "middle", u.font = "10px sans-serif", u.font = `${e} ${l}px ${i}`, !n) {
        const A = u.measureText(t).width;
        A > 216 && (l = Math.max(28, Math.floor(l * (216 / A))), u.font = `${e} ${l}px ${i}`);
      }
      u.fillText(t, F3 * 0.5, F3 * 0.5);
      const y = ft(u.getImageData(0, 0, F3, F3).data, F3);
      if (!y) return null;
      const w2 = Math.max(1, y.maxX - y.minX + 1), s = Math.max(1, y.maxY - y.minY + 1), m2 = !n && w2 > s * 1.15 ? 0.725 : 0.668, _2 = o * m2 / Math.max(w2, s), b = l * _2, v = (y.minX + y.maxX) * 0.5 - F3 * 0.5, D = (y.minY + y.maxY) * 0.5 - F3 * 0.5;
      if (E.width = o, E.height = o, "fontVariationSettings" in u) try {
        u.fontVariationSettings = r;
      } catch {
      }
      return u.fillStyle = "#ffffff", u.textAlign = "center", u.textBaseline = "middle", u.font = "10px sans-serif", u.font = `${e} ${b.toFixed(2)}px ${i}`, u.fillText(t, o * 0.5 - v * _2, o * 0.5 - D * _2), u.getImageData(0, 0, o, o).data;
    }) ?? Z(o, a2);
  }
  function ut(t) {
    if (typeof document > "u" || !document.fonts) return false;
    const e = t.replace(/['"]/g, "").trim().toLowerCase();
    for (const i of document.fonts) if (i.family.replace(/['"]/g, "").trim().toLowerCase() === e) return true;
    return false;
  }
  async function mt2(t, e) {
    if (typeof document > "u" || ut(t)) return;
    const i = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((r) => !r.sheet);
    i.length !== 0 && await Promise.all(i.map((r) => new Promise((n) => {
      const a2 = () => n();
      r.addEventListener("load", a2, { once: true, signal: e }), r.addEventListener("error", a2, { once: true, signal: e });
    })));
  }
  async function j(t, e, i, r) {
    if (typeof document > "u" || !document.fonts) return;
    r == null || r.throwIfAborted();
    let n;
    try {
      await Promise.race([(async () => {
        await mt2(t, r), await document.fonts.load(e, i);
      })(), new Promise((a2) => {
        n = setTimeout(a2, 1400);
      })]);
    } catch {
    } finally {
      n !== void 0 && clearTimeout(n);
    }
    r == null || r.throwIfAborted();
  }
  async function dt2(t, e, i, r, n) {
    const a2 = e === "high" ? ot2 : at, o = t.cacheKey === "txt:4";
    let c;
    if (t.kind === "symbol" && t.value === "spark" && t.symbolFill) c = Z(a2, false);
    else if (t.kind === "symbol") {
      const w2 = t.value, m2 = `'FILL' ${t.symbolFill ? 1 : 0}, 'wght' 600, 'GRAD' 0, 'ROND' 100, 'opsz' 48`, x2 = '"Google Symbols", "Material Symbols Rounded"';
      await j("Google Symbols", '600 256px "Google Symbols"', w2, r), c = K2(w2, 600, x2, m2, true, !t.symbolFill, a2, n);
    } else {
      const w2 = Array.from(new Set(t.value)).join(""), s = '"Google Sans Flex", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      await j("Google Sans Flex", '500 256px "Google Sans Flex"', w2, r), c = K2(t.value, 500, s, "'wght' 500", false, false, a2, n);
    }
    const { blurSize: l, rgBytes: T, blurRgbaBytes: u, isoBounds: E } = ct(c, a2), y = { key: i, tier: e, isNumeralFour: o, sdfSize: a2, blurSize: l, rgBytes: T, blurRgbaBytes: u, isoBounds: E };
    return O(i, y), y;
  }
  async function _t2(t, e, i, r) {
    const n = `${t.cacheKey}@${e}`, a2 = B2.get(n);
    if (a2) return O(n, a2), a2;
    if (e === "compact") {
      const l = B2.get(`${t.cacheKey}@high`);
      if (l) return O(`${t.cacheKey}@high`, l), l;
    }
    let o = N.get(n);
    o || (o = dt2(t, e, n, i, r).finally(() => {
      N.delete(n);
    }), N.set(n, o));
    const c = await o;
    return i == null || i.throwIfAborted(), c;
  }
  function xt2(t) {
    const e = cn(t, "gemini-4-elements:motif", jn, vt);
    if (!e) return null;
    const i = t.getUniformLocation(e, "u_sdfTex"), r = t.getUniformLocation(e, "u_blurTex");
    return t.useProgram(e), t.uniform1i(i, 0), t.uniform1i(r, 1), t.useProgram(null), { program: e, entries: /* @__PURE__ */ new Map(), uRes: t.getUniformLocation(e, "u_res"), uCenter: t.getUniformLocation(e, "u_center"), uScale: t.getUniformLocation(e, "u_scale"), uMotifPhase: t.getUniformLocation(e, "u_motifPhase"), uMotionGate: t.getUniformLocation(e, "u_motionGate"), uFlowSpeed: t.getUniformLocation(e, "u_flowSpeed"), uCursorPos: t.getUniformLocation(e, "u_cursorPos"), uCursorActive: t.getUniformLocation(e, "u_cursorActive"), uTap: t.getUniformLocation(e, "u_tap"), uOpacity: t.getUniformLocation(e, "u_opacity"), uDiffusion: t.getUniformLocation(e, "u_diffusion"), uStyleMode: t.getUniformLocation(e, "u_styleMode"), uIsNumeralFour: t.getUniformLocation(e, "u_isNumeralFour"), uSdfSize: t.getUniformLocation(e, "u_sdfSize"), uIsoBounds: t.getUniformLocation(e, "u_isoBounds"), uSdfTex: i, uBlurTex: r, uCoreTint: t.getUniformLocation(e, "u_coreTint"), uGlowTint: t.getUniformLocation(e, "u_glowTint"), uIsLightBackdrop: t.getUniformLocation(e, "u_isLightBackdrop") };
  }
  function J2(t, e) {
    t.deleteTexture(e.sdfTex), t.deleteTexture(e.blurTex);
  }
  function ht(t, e) {
    for (const i of e.entries.values()) J2(t, i);
    e.entries.clear(), t.deleteProgram(e.program);
  }
  function yt(t, e, i) {
    const r = e.entries.get(i.key);
    if (r) return e.entries.delete(i.key), e.entries.set(i.key, r), r;
    const n = t.createTexture(), a2 = t.createTexture();
    if (!n || !a2) return n && t.deleteTexture(n), a2 && t.deleteTexture(a2), null;
    if (t.pixelStorei(t.UNPACK_ALIGNMENT, 1), t.bindTexture(t.TEXTURE_2D, n), t.texImage2D(t.TEXTURE_2D, 0, t.RG8, i.sdfSize, i.sdfSize, 0, t.RG, t.UNSIGNED_BYTE, i.rgBytes), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.bindTexture(t.TEXTURE_2D, a2), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA8, i.blurSize, i.blurSize, 0, t.RGBA, t.UNSIGNED_BYTE, i.blurRgbaBytes), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.bindTexture(t.TEXTURE_2D, null), e.entries.size >= pt2) {
      const c = e.entries.keys().next().value;
      if (c !== void 0) {
        const l = e.entries.get(c);
        l && J2(t, l), e.entries.delete(c);
      }
    }
    const o = { sdfTex: n, blurTex: a2 };
    return e.entries.set(i.key, o), o;
  }
  function bt2(t, e, i, r, n, a2) {
    const o = e.acquirePlugin("focal:motif", xt2, ht);
    if (!o) return;
    const c = yt(t, o, a2.asset);
    if (!c) return;
    const l = 0.5 + a2.offsetX, T = 0.5 + a2.offsetY, u = r / Math.max(1, n), E = Math.max(0.25, u), y = Math.max(0.35, a2.scale * 0.84), w2 = u > 1.35 ? 1 + (u / 1.35 - 1) * 0.42 : 1, s = a2.tapAge < 3.5 && a2.tapStrength > 1e-3, [m2, x2, _2, b] = a2.asset.isoBounds;
    let v, D;
    if (a2.style === "blur") v = 0.018 + (s ? 0.016 : 0), D = v;
    else {
      const V = Math.min(1, a2.diffusion01 * 100 / 58 * 1.65), W = a2.cursorActive > 2e-3 ? Math.min(1, a2.cursorActive * 1.46) : 0, q = s ? Math.min(1, a2.tapStrength) : 0, H = (0.056 * V + 0.04 * W + 0.036 * q) * 1.85 + 0.025 * (V * 0.84 + W + q * 0.72);
      v = H * 1.78 + 0.016, D = H + 0.016;
    }
    const A = Math.max(-0.73, m2 - v), I = Math.min(0.73, _2 + v), P2 = Math.max(-0.73, x2 - D), G2 = Math.min(0.73, b + D), L = y * w2, f = L / E, p = 0.01, h = l + A * f - p, d3 = l + I * f + p, S = T + P2 * L - p, g2 = T + G2 * L + p, M = Math.max(0, Math.floor(h * r)), C = Math.min(r, Math.ceil(d3 * r)), R = Math.max(0, Math.floor((1 - g2) * n)), U = Math.min(n, Math.ceil((1 - S) * n));
    if (C <= M || U <= R) return;
    t.enable(t.SCISSOR_TEST), t.scissor(M, R, C - M, U - R), t.enable(t.BLEND), t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA), t.useProgram(o.program), t.bindVertexArray(i), t.uniform2f(o.uRes, r, n), t.uniform2f(o.uCenter, l, T), t.uniform1f(o.uScale, a2.scale), t.uniform1f(o.uMotifPhase, a2.motifPhase01), t.uniform1f(o.uMotionGate, a2.motionGate), t.uniform1f(o.uFlowSpeed, a2.flowSpeed), t.uniform2f(o.uCursorPos, a2.cursorTopLeftX, a2.cursorTopLeftY), t.uniform1f(o.uCursorActive, a2.cursorActive), t.uniform4f(o.uTap, a2.tapTopLeftX, a2.tapTopLeftY, a2.tapAge, a2.tapStrength), t.uniform1f(o.uOpacity, a2.opacity01), t.uniform1f(o.uDiffusion, a2.diffusion01), t.uniform1f(o.uStyleMode, a2.style === "blur" ? 1 : 0), t.uniform1f(o.uIsNumeralFour, a2.asset.isNumeralFour ? 1 : 0), t.uniform1f(o.uSdfSize, a2.asset.sdfSize), t.uniform4f(o.uIsoBounds, m2, x2, _2, b);
    const { motifCoreTint: Q2, motifGlowTint: X2, isLightBackdrop: z } = a2.gradientSpec;
    t.uniform3f(o.uCoreTint, Q2[0], Q2[1], Q2[2]), t.uniform3f(o.uGlowTint, X2[0], X2[1], X2[2]), t.uniform1f(o.uIsLightBackdrop, z ? 1 : 0), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, c.sdfTex), t.activeTexture(t.TEXTURE1), t.bindTexture(t.TEXTURE_2D, c.blurTex), t.drawArrays(t.TRIANGLES, 0, 3), t.activeTexture(t.TEXTURE0), t.bindVertexArray(null), t.disable(t.BLEND), t.disable(t.SCISSOR_TEST);
  }
  var ot2, at, it, F3, k2, rt, nt2, B2, N, pt2, vt;
  var init_index_viUVYb1p = __esm({
    "../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/assets/index-viUVYb1p.js"() {
      init_script();
      ot2 = 1024;
      at = 512;
      it = [3.4, 7.8, 17.2, 33];
      F3 = 256;
      k2 = 1e8;
      rt = 3;
      nt2 = "M480 80Q474 80 469.0 84.0Q464 88 462 94Q445 161 411.0 220.0Q377 279 328 328Q279 377 220.0 411.0Q161 445 94 462Q88 464 84.0 469.0Q80 474 80.0 480.0Q80 486 84.0 491.0Q88 496 94 498Q161 515 220.0 549.0Q279 583 328 632Q377 681 411.0 740.0Q445 799 462 866Q464 872 469.0 876.0Q474 880 480.0 480.0Q486 880 490.5 876.0Q495 872 497 866Q515 799 549.0 740.0Q583 681 632.0 632.0Q681 583 740.0 549.0Q799 515 866 498Q872 496 876.0 491.0Q880 486 880.0 480.0Q880 474 876.0 469.0Q872 464 866 462Q799 445 740.0 411.0Q681 377 632 328Q583 279 549.0 220.0Q515 161 498 94Q496 88 491.0 84.0Q486 80 480 80Z";
      B2 = /* @__PURE__ */ new Map();
      N = /* @__PURE__ */ new Map();
      pt2 = 3;
      vt = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_res;
uniform vec2 u_center;
uniform float u_scale;
uniform float u_motifPhase;     // [0..1) over 15s cycle (8 cycles per 120s loop)
uniform float u_motionGate;     // 0 when paused/static, 1 when animated
uniform float u_flowSpeed;      // [0..200] Motif Evaporation Flow Speed
uniform vec2 u_cursorPos;       // smoothed cursor, top-left [0..1]
uniform float u_cursorActive;   // hoverAmount * hoverScale [0..1.6]
uniform vec4 u_tap;             // xy = tapPos top-left [0..1], z = tapAgeSec, w = tapStrength
uniform float u_opacity;        // [0..1]
uniform float u_diffusion;      // [0..1] Motif Idle Evaporation / Blur
uniform float u_styleMode;      // 0 = gas, 1 = blur
uniform float u_isNumeralFour;  // 1 = "4" zone tuning, 0 = generic text/symbol
uniform float u_sdfSize;        // 1024.0 (high) or 512.0 (compact)
uniform vec4 u_isoBounds;       // [minGx, minGy, maxGx, maxGy] tight non-zero motif bounds
uniform sampler2D u_sdfTex;     // 16-bit RG8 faired Euclidean SDF
uniform sampler2D u_blurTex;    // RGBA8 4-octave Young-van Vliet 2D Gaussian stack
uniform vec3 u_coreTint;
uniform vec3 u_glowTint;
uniform float u_isLightBackdrop;

float sq(float x) {
  return x * x;
}

float bell(vec2 p, vec2 c, vec2 r) {
  vec2 q = (p - c) / r;
  return exp(-dot(q, q) * 2.0);
}

float rotBellCs(vec2 p, vec2 c, vec2 r, vec2 cs) {
  vec2 d = p - c;
  vec2 q = vec2(cs.x * d.x + cs.y * d.y, -cs.y * d.x + cs.x * d.y) / r;
  return exp(-dot(q, q) * 2.0);
}

void blendOver(inout vec3 baseC, inout float baseA, vec3 srcC, float srcA) {
  float a = clamp(srcA, 0.0, 1.0);
  float outA = a + baseA * (1.0 - a);
  baseC = (srcC * a + baseC * baseA * (1.0 - a)) / max(outA, 0.0001);
  baseA = outA;
}

vec2 isoToTc(vec2 g) {
  return g / 0.96 + 0.5;
}

vec2 p4ToIsoDelta(vec2 dp4) {
  return vec2(dp4.x * 1.7778, dp4.y);
}

float fetchRgSdf(ivec2 coord, int maxIdx) {
  ivec2 c = clamp(coord, ivec2(0), ivec2(maxIdx));
  vec2 rg = texelFetch(u_sdfTex, c, 0).rg;
  return ((rg.r * 255.0 * 256.0 + rg.g * 255.0) / 65535.0 - 0.5) * 0.48;
}

float sdTexIso(vec2 g) {
  vec2 tc = isoToTc(g);
  vec2 boxD = abs(tc - 0.5) - 0.494;
  float outsideBox = length(max(boxD, 0.0)) * 0.96;
  if (outsideBox > 0.015) {
    return 0.24 + outsideBox;
  }
  vec2 pix = tc * u_sdfSize - 0.5;
  vec2 i = floor(pix);
  vec2 f = pix - i;
  ivec2 base = ivec2(i);
  int maxIdx = int(u_sdfSize) - 1;
  float d00 = fetchRgSdf(base, maxIdx);
  float d10 = fetchRgSdf(base + ivec2(1, 0), maxIdx);
  float d01 = fetchRgSdf(base + ivec2(0, 1), maxIdx);
  float d11 = fetchRgSdf(base + ivec2(1, 1), maxIdx);
  float d = mix(mix(d00, d10, f.x), mix(d01, d11, f.x), f.y);
  return d + outsideBox;
}

float uvEdgeFade(vec2 tc) {
  return smoothstep(0.496, 0.446, max(abs(tc.x - 0.5), abs(tc.y - 0.5)));
}

float evalBlurChannel(vec4 b, float lvl) {
  if (lvl < 2.0) return mix(b.r, b.g, clamp(lvl - 1.0, 0.0, 1.0));
  if (lvl < 3.0) return mix(b.g, b.b, lvl - 2.0);
  return mix(b.b, b.a, clamp(lvl - 3.0, 0.0, 1.0));
}

// Samples only the 4-octave true 2D IIR Gaussian stack (for lvl in [0.9..4])
float sampleBlurStackOnly(vec2 tc, float lvl) {
  float win = uvEdgeFade(tc);
  if (win <= 0.0005) return 0.0;
  vec4 b = texture(u_blurTex, clamp(tc, 0.002, 0.998)) * win;
  return evalBlurChannel(b, lvl);
}

// Continuous scale-space interpolation from razor-sharp 16-bit SDF (lvl = 0)
// into the 4-octave 2D Gaussian convolution stack (lvl = 1..4), avoiding wide
// SDF smoothstep thresholds that would expose interior medial-axis joins.
float sampleGaussianMotif(vec2 tc, float dSharp, float pixelAa, float lvl) {
  float safeAa = pixelAa + clamp(lvl, 0.0, 1.0) * 0.0026;
  float l0 = smoothstep(safeAa, -safeAa, dSharp);
  if (lvl <= 0.001) return l0;
  float win = uvEdgeFade(tc);
  vec4 b = texture(u_blurTex, clamp(tc, 0.002, 0.998)) * win;
  if (lvl < 1.0) return mix(l0, b.r, lvl);
  return evalBlurChannel(b, lvl);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  ) * 0.5 + 0.5;
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += amp * gnoise(p);
    p = rot * p * 2.03 + vec2(13.7, 29.3);
    amp *= 0.5;
  }
  return v * 1.0714286;
}

void main() {
  vec2 screen = vec2(v_uv.x, 1.0 - v_uv.y);
  float aspect = u_res.x / max(1.0, u_res.y);

  // Convert screen UV into isotropic stage coordinates centered on u_center
  // (zero pointer parallax so the motif never translates with cursor motion)
  float minSpan = max(0.35, u_scale * 0.84);
  float wideDiv = aspect > 1.35 ? mix(1.0, aspect / 1.35, 0.42) : 1.0;
  vec2 rel = screen - u_center;
  vec2 isoRaw = vec2(rel.x * aspect, rel.y) / wideDiv;

  float a = u_motifPhase * 6.2831853;
  float effFlow = u_flowSpeed * u_motionGate;
  vec2 drift = vec2(sin(a), cos(a) - 1.0) * (min(effFlow, 35.0) * 0.00010);
  vec2 g = (isoRaw + drift) / minSpan;

  // Return transparent zero rather than discard to preserve TBDR early-fragment optimizations
  if (abs(g.x) > 0.72 || abs(g.y) > 0.72) {
    outColor = vec4(0.0);
    return;
  }

  vec2 curRel = u_cursorPos - u_center;
  vec2 curIso = vec2(curRel.x * aspect, curRel.y) / wideDiv;
  vec2 gCursor = curIso / minSpan;
  vec2 fromCursor = (g - gCursor) * minSpan;
  float distCursor = length(fromCursor);

  float pixelAa = max(0.0010, 1.05 / (min(u_res.x, u_res.y) * minSpan));
  vec2 tcExact = isoToTc(g);

  vec3 fgCol = vec3(0.0);
  float fgAlpha = 0.0;

  if (u_styleMode > 0.5) {
    // --- PROGRESSIVE OPTICAL BLUR MODE ('blur') ---
    vec2 gBlur = g;
    bool hasTapWave = u_tap.z < 3.5 && u_tap.w > 0.001;
    if (hasTapWave) {
      vec2 tapRel = u_tap.xy - u_center;
      vec2 tapIso = vec2(tapRel.x * aspect, tapRel.y) / wideDiv;
      vec2 gTap = tapIso / minSpan;
      vec2 fromTap = (g - gTap) * minSpan;
      float tapDist = length(fromTap);
      float tapWave = sin(tapDist * 32.0 - u_tap.z * 7.0) * exp(-u_tap.z * 2.4) *
                      smoothstep(0.0, 0.03, u_tap.z) * u_tap.w;
      gBlur += normalize(fromTap + vec2(0.00001)) * (tapWave * 0.0028 / minSpan);
    }

    if (
      gBlur.x < u_isoBounds.x - 0.006 ||
      gBlur.x > u_isoBounds.z + 0.006 ||
      gBlur.y < u_isoBounds.y - 0.006 ||
      gBlur.y > u_isoBounds.w + 0.006
    ) {
      outColor = vec4(0.0);
      return;
    }

    float dBlur = sdTexIso(gBlur);
    if (dBlur > 0.222) {
      outColor = vec4(0.0);
      return;
    }
    vec2 tcBlur = hasTapWave ? isoToTc(gBlur) : tcExact;

    float orbitAng = -0.785398 + a;
    float breathAmp = 1.0 + 0.18 * sin(orbitAng * 2.0 + 0.7) * clamp(effFlow / 60.0, 0.0, 1.3);
    vec2 idleFocusG = vec2(0.055, -0.065) + vec2(0.24 * cos(orbitAng), 0.26 * sin(orbitAng)) * breathAmp;

    float hoverMix = clamp(u_cursorActive * 0.72, 0.0, 1.0);
    float presence = hoverMix * hoverMix * (3.0 - 2.0 * hoverMix);
    vec2 activeFocusG = mix(idleFocusG, gCursor, presence);

    float distFocus = length(gBlur - activeFocusG);
    float lensRadius = mix(0.56, 0.44, presence);
    float blurStrength = mix(u_diffusion * 0.92, clamp(max(u_diffusion, hoverMix * 0.95), 0.0, 1.0), presence);
    float rNorm = clamp((distFocus - (1.0 - blurStrength) * 0.34) / lensRadius, 0.0, 1.0);
    float lvl = clamp(rNorm * 4.0 * (0.25 + 0.85 * blurStrength), 0.0, 4.0);

    float alpha = sampleGaussianMotif(tcBlur, dBlur, pixelAa, lvl);
    float blurNorm = lvl * 0.25;
    float glowMix = clamp(blurNorm * 0.58 + smoothstep(-0.01, 0.08, dBlur) * 0.42, 0.0, 1.0);
    float topSheen = smoothstep(0.18, -0.34, gBlur.y) * (1.0 - glowMix * 0.55);
    vec3 blurTint = mix(u_coreTint, u_glowTint, glowMix * (u_isLightBackdrop > 0.5 ? 0.35 : 0.52));
    blurTint = mix(blurTint, vec3(1.0), topSheen * 0.22);
    fgCol = blurTint;
    fgAlpha = alpha * u_opacity;
  } else {
    // --- GASEOUS EVAPORATION MODE ('gas') ---
    // Evaluate cheap analytical zone bells, cursor proximity, and tap envelope BEFORE
    // running the 7 domain-warped 3-octave Perlin FBMs so empty & crisp-interior pixels
    // skip unused noise octaves with zero visual difference.
    vec2 p4 = vec2(0.54 + g.x * 0.5625, 0.50 + g.y);

    float idleScale = clamp((u_diffusion * 100.0) / 58.0, 0.0, 1.65);
    float symCrispCore = bell(p4, vec2(0.565, 0.405), vec2(0.095, 0.155));
    float structuralLock = clamp(symCrispCore * 0.85, 0.0, 0.92);
    float symLowerLeft = rotBellCs(p4, vec2(0.445, 0.585), vec2(0.168, 0.208), vec2(0.8364567, -0.5480258));
    float symLowerRight = bell(p4, vec2(0.615, 0.635), vec2(0.128, 0.148)) * 0.80;
    float symTopRim = smoothstep(0.32, 0.16, p4.y) * bell(p4, vec2(0.535, 0.215), vec2(0.135, 0.095)) * 0.45;
    float zoneSum = symLowerLeft * 1.02 + symLowerRight + symTopRim;
    float idleDiffMax = clamp(zoneSum * 1.85 * (1.0 - structuralLock) * idleScale, 0.0, 1.0);

    float activeHover = 0.0;
    if (u_cursorActive > 0.002 && distCursor < 0.25) {
      float dCursorToMotif = max(sdTexIso(gCursor), 0.0) * minSpan;
      float cursorProximity = exp(-sq(dCursorToMotif / 0.18));
      activeHover = u_cursorActive * cursorProximity;
    }
    float hoverMax = activeHover > 0.001 ? min(1.0, activeHover * 1.46) : 0.0;

    bool tapCandidate = false;
    vec2 gTap = vec2(0.0);
    vec2 fromTap = vec2(0.0);
    float waveRadius = 0.0;
    float ringWidth = 0.0;
    if (u_tap.z < 3.5 && u_tap.w > 0.001) {
      vec2 tapRel = u_tap.xy - u_center;
      vec2 tapIso = vec2(tapRel.x * aspect, tapRel.y) / wideDiv;
      gTap = tapIso / minSpan;
      fromTap = (g - gTap) * minSpan;
      waveRadius = 0.02 + 0.55 * (1.0 - exp(-u_tap.z * 1.4));
      ringWidth = 0.05 + u_tap.z * 0.028;
      tapCandidate = abs(length(fromTap) - waveRadius) < ringWidth * 3.5 + 0.028;
    }
    float tapMax = tapCandidate ? min(1.0, u_tap.w) : 0.0;

    float maxRawShift = (0.056 * idleDiffMax + 0.040 * hoverMax + 0.036 * tapMax) * 1.85 +
                        0.025 * (idleDiffMax * 0.84 + hoverMax + tapMax * 0.72);
    float maxShiftX = maxRawShift * 1.78 + 0.006;
    float maxShiftY = maxRawShift + 0.006;
    if (
      g.x < u_isoBounds.x - maxShiftX ||
      g.x > u_isoBounds.z + maxShiftX ||
      g.y < u_isoBounds.y - maxShiftY ||
      g.y > u_isoBounds.w + maxShiftY
    ) {
      outColor = vec4(0.0);
      return;
    }

    float dExact = sdTexIso(g);
    if (dExact > 0.32) {
      outColor = vec4(0.0);
      return;
    }
    float maxBoxCoord = max(abs(tcExact.x - 0.5), abs(tcExact.y - 0.5));
    float maxShiftLen = length(vec2(maxShiftX, maxShiftY));
    if (maxBoxCoord <= 0.494 && dExact > 0.218 + maxShiftLen) {
      outColor = vec4(0.0);
      return;
    }

    float maxTotalDiff = idleDiffMax + hoverMax * 0.82 + tapMax * 0.65;
    if (maxTotalDiff < 0.0005 && dExact > 0.015) {
      vec4 bEarly = texture(u_blurTex, clamp(tcExact, 0.002, 0.998));
      if (bEarly.b <= 0.002 && bEarly.a <= 0.002) {
        outColor = vec4(0.0);
        return;
      }
    }

    float flowRate = (effFlow / 75.0) * 1.155;
    vec2 loopVec = vec2(cos(a), sin(a)) * flowRate;
    vec2 idleFlowCoord = g * 3.6 + loopVec * 0.85;
    float silkFbm1 = fbm(idleFlowCoord);

    vec2 warpQ = vec2(0.0);
    vec2 warpR = vec2(0.0);
    float gasBillows = 0.5;
    float gasTendrils = 0.5;
    vec2 curlV = vec2(0.0);
    float silkFbm2 = silkFbm1;
    float idleDiffusion = 0.0;
    float hoverGasField = 0.0;
    float tapWisp = 0.0;

    if (maxTotalDiff >= 0.0005) {
      vec2 loopVec2 = vec2(sin(a * 2.0), -cos(a * 2.0)) * (flowRate * 0.55);
      vec2 gasCoord = g * 5.8 + loopVec * 1.35;
      warpQ = vec2(
        fbm(gasCoord),
        fbm(gasCoord + vec2(5.2, 1.3))
      ) - 0.5;
      warpR = vec2(
        fbm(gasCoord * 1.85 + 1.6 * warpQ + vec2(1.7, 9.2) + loopVec2),
        fbm(gasCoord * 1.85 + 1.6 * warpQ + vec2(8.3, 2.8) - loopVec2)
      ) - 0.5;

      gasBillows = fbm(gasCoord * 1.4 + 1.25 * warpR);
      gasTendrils = smoothstep(0.28, 0.78, fbm(gasCoord * 2.9 - 1.4 * warpQ + loopVec2));
      curlV = vec2(warpR.y - warpQ.y, -(warpR.x - warpQ.x)) * 2.2;

      silkFbm2 = clamp(silkFbm1 * 0.62 + (warpQ.x + 0.5) * 0.38, 0.0, 1.0);
      float silkMod = mix(0.76, 1.26, silkFbm1 * 0.55 + silkFbm2 * 0.45);
      float idleGasTexture = 0.52 + 0.52 * gasBillows + 0.38 * gasTendrils;

      idleDiffusion = clamp(
        zoneSum * silkMod * idleGasTexture * (1.0 - structuralLock) * idleScale,
        0.0,
        1.0
      );

      if (activeHover > 0.0005) {
        vec2 warpedFromCursor = fromCursor + warpQ * 0.055 + warpR * 0.032;
        float gasEnvelope = exp(-dot(warpedFromCursor, warpedFromCursor) / (0.145 * 0.145)) *
                            (1.0 - smoothstep(0.11, 0.25, distCursor));
        hoverGasField = clamp(
          gasEnvelope * (0.45 + 0.55 * gasBillows + 0.45 * gasTendrils) * activeHover,
          0.0,
          1.0
        );
      }

      if (tapCandidate) {
        float tapDist = length(fromTap + warpQ * 0.035);
        if (abs(tapDist - waveRadius) < ringWidth * 3.5) {
          float dTapToMotif = max(sdTexIso(gTap), 0.0) * minSpan;
          float tapOnMotif = 1.0 - smoothstep(0.01, 0.24, dTapToMotif);
          float tapRings = exp(-sq((tapDist - waveRadius) / ringWidth));
          tapWisp = clamp(
            tapRings * exp(-u_tap.z * 1.25) * smoothstep(0.0, 0.03, u_tap.z) * tapOnMotif * u_tap.w,
            0.0,
            1.0
          );
        }
      }
    }

    float totalDiffusion = clamp(idleDiffusion + hoverGasField * 0.82 + tapWisp * 0.65, 0.0, 1.0);
    float diffSq = totalDiffusion * totalDiffusion;
    float activeVapor = clamp(hoverGasField + tapWisp * 0.65, 0.0, 1.15);

    vec2 gCore = g;
    float dCore = dExact;
    float densityS1 = 0.0;
    float densityS2 = 0.0;
    float densityS3 = 0.0;
    vec2 tc2 = tcExact;
    float outerHalo;

    if (totalDiffusion >= 0.012) {
      vec2 idleFlowDir = mix(vec2(-0.56, -0.36), vec2(0.46, -0.44), smoothstep(0.46, 0.62, p4.x));
      vec2 idleBuoyantCurl = normalize(curlV * 0.88 + idleFlowDir * 0.92 + vec2(0.0001));
      vec2 idleAdvect = (idleBuoyantCurl * (0.46 + 0.54 * gasTendrils) + warpQ * 0.52 + warpR * 0.56) * 0.034 * idleDiffusion;

      vec2 hoverAdvect = vec2(0.0);
      if (hoverGasField > 0.001) {
        vec2 buoyantCurl = normalize(curlV + vec2(fromCursor.x * 1.2, -0.55) + vec2(0.0001));
        hoverAdvect = (buoyantCurl * (0.45 + 0.55 * gasTendrils) + warpR * 0.65) * 0.028 * hoverGasField;
      }

      vec2 tapAdvect = vec2(0.0);
      if (tapWisp > 0.001) {
        vec2 tapOutCurl = normalize(fromTap * 2.2 + curlV * 0.75 + vec2(0.0, -0.42) + vec2(0.0001));
        tapAdvect = (tapOutCurl * (0.45 + 0.55 * gasTendrils) + warpR * 0.55) * 0.026 * tapWisp;
      }

      vec2 advIso = p4ToIsoDelta(idleAdvect + hoverAdvect + tapAdvect);
      float warpScale = idleDiffusion * 0.84 + hoverGasField + tapWisp * 0.72;
      vec2 wQIso = p4ToIsoDelta(warpQ * (0.009 * warpScale));
      vec2 wQPerpIso = p4ToIsoDelta(vec2(-warpQ.y, warpQ.x) * (0.015 * warpScale));
      vec2 wRIso = p4ToIsoDelta(warpR * (0.022 * warpScale));

      gCore = g + advIso * 0.24;
      dCore = sdTexIso(gCore);

      vec2 tc1 = isoToTc(g + advIso * 0.68 + wQIso);
      tc2 = isoToTc(g + advIso * 1.22 + wQPerpIso);
      vec2 tc3 = isoToTc(g + advIso * 1.85 + wRIso);

      // Slope-matched Gaussian blur stack levels matching gemini-4-carbon sigmaS1..S3 (soft=1.34)
      // while remaining 100% free of interior medial-axis stroke joins.
      densityS1 = sampleBlurStackOnly(tc1, 0.90 + totalDiffusion * 2.15) * smoothstep(0.02, 0.32, totalDiffusion);

      float win2 = uvEdgeFade(tc2);
      vec4 b2 = win2 > 0.0005 ? texture(u_blurTex, clamp(tc2, 0.002, 0.998)) * win2 : vec4(0.0);
      densityS2 = evalBlurChannel(b2, 1.55 + totalDiffusion * 2.35) * smoothstep(0.06, 0.50, totalDiffusion) * (0.68 + 0.32 * silkFbm2);
      outerHalo = evalBlurChannel(b2, 2.45 + totalDiffusion * 1.55) * (0.18 + 0.82 * totalDiffusion) * (0.72 + 0.28 * silkFbm1);

      densityS3 = sampleBlurStackOnly(tc3, 2.25 + totalDiffusion * 1.75) * smoothstep(0.12, 0.70, totalDiffusion) * (0.55 + 0.45 * gasBillows);
    } else {
      outerHalo = sampleBlurStackOnly(tc2, 2.45) * 0.18 * (0.72 + 0.28 * silkFbm1);
    }

    float lvlCore = diffSq * 2.38;
    float dCoreBlended = mix(dExact, dCore, smoothstep(0.04, 0.38, totalDiffusion));
    float densityCore = sampleGaussianMotif(isoToTc(gCore), dCoreBlended, pixelAa, lvlCore);

    float pocketMask = smoothstep(0.22, 0.76, 1.0 - gasBillows * 0.65 - gasTendrils * 0.35);
    float gasPocketErosion = activeVapor * pocketMask * 0.46;
    float idlePocketErosion = idleDiffusion * pocketMask * 0.34 + idleDiffusion * idleDiffusion * 0.14;
    float coreRetention = clamp(1.0 - gasPocketErosion - idlePocketErosion, 0.30, 1.0);

    float innerDepth = max(-dCoreBlended, 0.0);
    float rimWidth = 0.016 + totalDiffusion * 0.024;
    float rimFade = 1.0 - smoothstep(0.32, 0.86, totalDiffusion) * 0.65;
    float rimHighlight = exp(-(innerDepth * innerDepth) / (rimWidth * rimWidth)) * rimFade;
    float s1Contour = 4.0 * densityS1 * (1.0 - densityS1);
    float gasCaustic = (idleDiffusion * 0.60 + activeVapor) * gasTendrils * s1Contour * 0.55;

    float bodyLuminance =
      mix(0.82, 1.0, rimHighlight) * (1.0 - 0.18 * (idleDiffusion * 0.65 + activeVapor) * (1.0 - gasBillows)) +
      gasCaustic;

    vec2 shadeP = p4 - vec2(0.595, 0.595);
    vec2 shadeRot = vec2(shadeP.x * 0.78 + shadeP.y * 0.62, -shadeP.x * 0.62 + shadeP.y * 0.78);
    float stemShade = exp(-(shadeRot.x * shadeRot.x) / (0.062 * 0.062) - (shadeRot.y * shadeRot.y) / (0.155 * 0.155)) *
                      mix(0.35, 1.0, u_isNumeralFour);
    float shadeAtten = 1.0 - 0.42 * stemShade;

    float compositeBody = mix(
      densityCore * bodyLuminance,
      densityCore * bodyLuminance * 0.52 + densityS1 * 0.34 + densityS2 * 0.22 + densityS3 * 0.14,
      smoothstep(0.0, 0.65, totalDiffusion)
    ) * coreRetention * shadeAtten;

    float compositeGlow = (outerHalo * 0.48 + densityS2 * 0.24 + densityS3 * 0.28 + gasCaustic * 0.35) * shadeAtten;

    if (u_isLightBackdrop > 0.5) {
      vec3 bodyColLight = mix(u_glowTint, u_coreTint, 0.46 + 0.54 * rimHighlight);
      blendOver(fgCol, fgAlpha, u_coreTint, compositeGlow * 0.50 * u_opacity);
      blendOver(fgCol, fgAlpha, bodyColLight, compositeBody * 0.96 * u_opacity);
    } else {
      vec3 baseFrost = mix(u_glowTint, u_coreTint, 0.55);
      vec3 coreCol = mix(baseFrost, u_coreTint, 0.50 + 0.50 * rimHighlight * (1.0 - totalDiffusion * 0.35));
      coreCol = mix(coreCol, u_glowTint * 0.86, stemShade * 0.58);
      vec3 gasCol = mix(u_glowTint, mix(u_glowTint, u_coreTint, 0.72), 0.45 + 0.55 * gasTendrils);
      vec3 bodyCol = mix(coreCol, gasCol, clamp(activeVapor, 0.0, 1.0) * 0.55);
      vec3 glowCol = mix(u_glowTint * 0.86, mix(u_glowTint, u_coreTint, 0.65), smoothstep(0.68, 0.18, p4.y));
      blendOver(fgCol, fgAlpha, glowCol, compositeGlow * 0.40 * u_opacity);
      blendOver(fgCol, fgAlpha, bodyCol, compositeBody * 0.88 * u_opacity);
    }
  }

  if (fgAlpha <= 0.001) {
    outColor = vec4(0.0);
    return;
  }
  // Sub-LSB TPDF Interleaved Gradient Noise dither eliminates 8-bit contour banding
  float ign1 = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float ign2 = fract(52.9829189 * fract(dot(gl_FragCoord.xy + vec2(17.3, 31.7), vec2(0.06711056, 0.00583715))));
  float tpdf = ign1 - ign2;
  vec3 colorDither = vec3(tpdf, (ign1 + ign2 - 1.0), fract(ign1 + 0.37) - fract(ign2 + 0.73)) * (1.35 / 255.0);

  float finalAlpha = clamp(fgAlpha + tpdf * (0.85 / 255.0), 0.0, 1.0);
  vec3 finalCol = clamp(fgCol + colorDither, 0.0, 1.0);

  // Premultiplied alpha output over Pass 0 (Gradient) + Pass 1 (Particles)
  outColor = vec4(finalCol * finalAlpha, finalAlpha);
}
`;
    }
  });

  // ../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/script.js
  function Ve(t) {
    if (typeof t != "string") return null;
    const e = t.trim();
    if (!e) return null;
    const n = Date.parse(an.test(e) ? `${e}T00:00` : e);
    return Number.isNaN(n) ? null : n;
  }
  function Dn(t) {
    if (typeof t != "string") return null;
    const e = In.exec(t.trim());
    return e ? +e[1] * 3600 + +e[2] * 60 + +(e[3] ?? 0) : null;
  }
  function We(t) {
    if (typeof t != "string") return null;
    const e = t.trim();
    if (!e) return null;
    try {
      const { protocol: n } = new URL(e, "https://relative.invalid");
      return /^(?:https?|blob):$/.test(n) ? e : null;
    } catch {
      return null;
    }
  }
  function kn(t, e) {
    var c;
    const n = typeof e == "string" ? e.trim() : "";
    switch (t.type) {
      case "string":
      case "text":
      case "richtext":
        return n || null;
      case "number":
      case "integer": {
        if (typeof e != "number" || !Number.isFinite(e)) return null;
        const a2 = t.type === "integer" ? Math.round(e) : e;
        return Math.min(t.max ?? 1 / 0, Math.max(t.min ?? -1 / 0, a2));
      }
      case "boolean":
        return typeof e == "boolean" ? e : null;
      case "color":
        return Ln.test(n) ? n : null;
      case "choice":
        return (c = t.choices.find(([a2]) => a2 === e)) == null ? void 0 : c[0];
      case "multichoice": {
        if (!Array.isArray(e)) return null;
        const a2 = t.choices.map(([l]) => l).filter((l) => e.includes(l));
        return a2.length ? a2 : null;
      }
      case "date":
        return an.test(n) && Ve(n) !== null ? n : null;
      case "time":
        return Dn(n) !== null ? n : null;
      case "datetime":
        return Ve(n) !== null ? n : null;
      case "url":
      case "file":
      case "document":
      case "page":
        return We(e);
      case "image":
      case "media": {
        const a2 = We(e == null ? void 0 : e.url);
        return a2 ? { ...e, url: a2 } : null;
      }
    }
  }
  function Yn(t, e) {
    const n = e && typeof e == "object" ? e : {}, c = {};
    for (const [a2, l] of Object.entries(t)) {
      const d3 = kn(l, n[a2]) ?? l.default ?? (l.type === "boolean" ? false : l.type === "multichoice" ? [] : null);
      c[a2] = l.transform ? l.transform(d3) : d3;
    }
    return c;
  }
  function Bn(t) {
    const e = t.config;
    return { ...t, mount(n) {
      return t.mount({ ...n, colorMode: n.colorMode === "dark" ? "dark" : "light", reducedMotion: !!n.reducedMotion, lowPower: !!n.lowPower, priority: !!n.priority, hasPoster: !!n.hasPoster, channel: n.channel ?? (() => Fn), emit: n.emit ?? (() => {
      }), config: e ? Yn(e, n.config) : n.config });
    } };
  }
  function Wn(t) {
    const e = String(t ?? "").trim();
    if (!e) return { kind: "text", value: "4", symbolFill: false, cacheKey: "txt:4" };
    if (e.startsWith(":")) {
      const a2 = e.slice(1).trim().toLowerCase().split(":").filter(Boolean), l = (a2[0] || "spark").replace(/[^a-z0-9_]/g, "") || "spark", d3 = a2[1], h = d3 === "fill" || d3 === "filled" ? true : d3 === "outline" || d3 === "outlined" ? false : l === "spark" || l === "gemini";
      return { kind: "symbol", value: l, symbolFill: h, cacheKey: `sym:${l}:${h ? 1 : 0}` };
    }
    const n = Array.from(e).slice(0, 12).join("");
    return { kind: "text", value: n, symbolFill: false, cacheKey: `txt:${n}` };
  }
  function pe(t) {
    let e = (Math.imul(t | 0, 2654435769) ^ 1831565813) >>> 0;
    return () => {
      e = e + 1831565749 >>> 0;
      let n = e;
      return n = Math.imul(n ^ n >>> 15, n | 1), n ^= n + Math.imul(n ^ n >>> 7, n | 61), ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function $2(t, e, n, c, a2, l, d3 = 0.96) {
    return { color: t, center: e, radii: n, angleRad: c, cosAngle: Math.cos(c), sinAngle: Math.sin(c), weight: a2, beamModulated: l, maxAlpha: d3 };
  }
  function re(t, e, n = $n) {
    const c = n[t] ?? n.tier_l;
    return e === "dark" && c.dark ? c.dark : c.default;
  }
  function cn(t, e, n, c) {
    const a2 = t.createShader(t.VERTEX_SHADER), l = t.createShader(t.FRAGMENT_SHADER), d3 = t.createProgram();
    return !a2 || !l || !d3 ? (a2 && t.deleteShader(a2), l && t.deleteShader(l), d3 && t.deleteProgram(d3), null) : (t.shaderSource(a2, n), t.compileShader(a2), t.shaderSource(l, c), t.compileShader(l), t.attachShader(d3, a2), t.attachShader(d3, l), t.linkProgram(d3), t.getProgramParameter(d3, t.LINK_STATUS) ? (t.deleteShader(a2), t.deleteShader(l), d3) : (console.warn(`[${e}] Shader link failed:`, t.getProgramInfoLog(d3), t.getShaderInfoLog(a2), t.getShaderInfoLog(l)), t.deleteShader(a2), t.deleteShader(l), t.deleteProgram(d3), null));
  }
  function Zn(t, e, n = 1.5, c = 16e5) {
    const a2 = Math.max(1, t), l = Math.max(1, e), d3 = typeof window < "u" && window.devicePixelRatio || 1, p = Math.min(d3, n), h = a2 * p * (l * p), s = h > c ? Math.sqrt(c / h) : 1, S = p * s;
    return { width: Math.max(1, Math.round(a2 * S)), height: Math.max(1, Math.round(l * S)), dpr: S };
  }
  function Qn(t) {
    const e = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "default", preserveDrawingBuffer: false, ...t.contextAttributes };
    let n = null, c = null, a2 = null, l = false;
    const d3 = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Map();
    let s = null;
    const S = () => {
      if (!n || p.size === 0) return;
      let u = 1, M = 1;
      for (const _2 of p) _2.width > u && (u = _2.width), _2.height > M && (M = _2.height);
      (n.width > u || n.height > M) && (n.width = u, n.height = M);
    }, v = { acquirePlugin(u, M, _2) {
      if (!c || l) return null;
      const A = h.get(u);
      if (A) return A.instance === null && (A.instance = A.create(c)), A.instance;
      const w2 = M(c);
      return w2 ? (h.set(u, { instance: w2, create: M, dispose: _2 }), w2) : null;
    } }, b = () => {
      if (c) return true;
      n = document.createElement("canvas"), n.width = 1, n.height = 1;
      const u = n.getContext("webgl2", e);
      if (!u) return console.warn(`[${t.id}] WebGL2 is not available.`), n.width = 0, n.height = 0, n = null, false;
      c = u, l = false, s == null || s.abort(), s = new AbortController();
      const { signal: M } = s;
      return n.addEventListener("webglcontextlost", (_2) => {
        _2.preventDefault(), l = true, a2 = null;
        for (const A of h.values()) A.instance = null;
      }, { signal: M }), n.addEventListener("webglcontextrestored", () => {
        if (c && (l = false, a2 = t.setup(c), !!a2)) {
          for (const _2 of h.values()) _2.instance = _2.create(c);
          for (const _2 of d3) _2();
        }
      }, { signal: M }), a2 = t.setup(c), a2 ? true : (r(), false);
    }, r = () => {
      var u, M, _2;
      if (s == null || s.abort(), s = null, c) {
        if (!l) {
          for (const A of h.values()) A.instance !== null && ((u = A.dispose) == null || u.call(A, c, A.instance), A.instance = null);
          a2 && ((M = t.dispose) == null || M.call(t, c, a2));
        }
        c.isContextLost() || (_2 = c.getExtension("WEBGL_lose_context")) == null || _2.loseContext();
      }
      h.clear(), n && (n.width = 0, n.height = 0), c = null, n = null, a2 = null, l = false;
    };
    return { mount(u, M) {
      const _2 = u.getContext("2d", { alpha: !!e.alpha });
      if (!_2) return console.warn(`[${t.id}] Canvas 2D context is not available.`), null;
      if (!b()) return null;
      const A = M ?? (() => {
      });
      d3.add(A), p.add(u);
      let w2 = false;
      return { render(g2) {
        if (w2 || l || !c || !n || !a2) return;
        if (c.isContextLost()) {
          l = true;
          return;
        }
        const x2 = u.width, R = u.height;
        if (x2 < 1 || R < 1) return;
        (n.width < x2 || n.height < R) && (n.width = Math.max(n.width, x2), n.height = Math.max(n.height, R)), c.disable(c.SCISSOR_TEST), c.viewport(0, 0, x2, R), g2(c, a2, v, x2, R), c.disable(c.SCISSOR_TEST), e.alpha && _2.clearRect(0, 0, x2, R);
        const D = n.height - R;
        _2.drawImage(n, 0, D, x2, R, 0, 0, x2, R);
      }, trim() {
        w2 || S();
      }, destroy() {
        w2 || (w2 = true, d3.delete(A), p.delete(u), d3.size === 0 ? r() : S());
      } };
    } };
  }
  function no() {
    if (Ae) return Ae;
    const t = de2 * de2, e = new Uint8Array(t * 2);
    let n = 1831565813;
    const c = () => {
      n = n + 2654435769 | 0;
      let a2 = n;
      return a2 = Math.imul(a2 ^ a2 >>> 16, 569420461), a2 = Math.imul(a2 ^ a2 >>> 15, 1935289751), (a2 ^ a2 >>> 15) >>> 24 & 255;
    };
    for (let a2 = 0; a2 < t; a2++) e[a2 * 2] = c(), e[a2 * 2 + 1] = c(), c();
    return Ae = e, e;
  }
  function io(t) {
    const e = He.get(t);
    if (e) return e;
    const n = new Float32Array(12), { topLeft: c, topRight: a2, bottomLeft: l, bottomRight: d3 } = t.corners;
    n[0] = c[0], n[1] = c[1], n[2] = c[2], n[3] = a2[0], n[4] = a2[1], n[5] = a2[2], n[6] = l[0], n[7] = l[1], n[8] = l[2], n[9] = d3[0], n[10] = d3[1], n[11] = d3[2];
    const p = Math.min(zt, t.lobes.length), h = new Float32Array(zt * 3), s = new Float32Array(zt * 2);
    for (let v = 0; v < p; v++) {
      const b = t.lobes[v];
      h[v * 3] = b.color[0], h[v * 3 + 1] = b.color[1], h[v * 3 + 2] = b.color[2], s[v * 2] = b.cosAngle, s[v * 2 + 1] = b.sinAngle;
    }
    const S = { lobeCount: p, corners: n, lobeColors: h, lobeCosSin: s };
    return He.set(t, S), S;
  }
  function ro(t, e) {
    return { uBgViewScale: t.getUniformLocation(e, "u_bgViewScale"), uBgPreOffset: t.getUniformLocation(e, "u_bgPreOffset"), uBgRotZoom: t.getUniformLocation(e, "u_bgRotZoom"), uBgPostCenter: t.getUniformLocation(e, "u_bgPostCenter"), uBgWave: t.getUniformLocation(e, "u_bgWave"), uBgTap: t.getUniformLocation(e, "u_bgTap"), uBgCorners: t.getUniformLocation(e, "u_bgCorners[0]"), uBgLobeCount: t.getUniformLocation(e, "u_bgLobeCount"), uBgLobeColors: t.getUniformLocation(e, "u_bgLobeColors[0]"), uBgLobeCentersInvRadii: t.getUniformLocation(e, "u_bgLobeCentersInvRadii[0]"), uBgLobeCosSin: t.getUniformLocation(e, "u_bgLobeCosSin[0]"), uBgLobeParams: t.getUniformLocation(e, "u_bgLobeParams[0]"), lastSpec: null, lastEffSoft: -1, lastEffBeam: -1 };
  }
  function ae(t) {
    const e = Math.sin(t * 127.1 + 311.7) * 43758.5453;
    return e - Math.floor(e);
  }
  function ao(t) {
    const e = t | 0;
    if (!e || e === 12) return so;
    const n = Re.get(e);
    if (n) return n;
    const c = ae(e * 1.13 + 0.7) - 0.5, a2 = ae(e * 2.41 + 1.9) - 0.5, l = ae(e * 3.89 + 4.3) - 0.5, d3 = ae(e * 5.17 + 7.1) - 0.5, p = Math.max(0.24, Math.min(0.76, De + c * 0.16)), h = Math.max(0.16, Math.min(0.46, ke + a2 * 0.12)), s = Math.max(0.42, Math.min(0.88, ln + l * 0.16)), S = Math.max(0.44, Math.min(0.84, un + d3 * 0.14)), v = s - p, b = S - h, r = Math.atan2(b, v) - to, u = Math.max(0.82, 1 + (Math.hypot(v, b) - eo) * 0.22), M = { shiftX: (p - De) * 0.44, shiftY: (h - ke) * 0.44, rotCos: Math.cos(r), rotSin: Math.sin(r), zoom: u, invZoom: 1 / u };
    return Re.size < 128 && Re.set(e, M), M;
  }
  function qe(t, e, n, c, a2, l, d3, p) {
    const h = e / Math.max(1, n), s = h / (16 / 9), S = s < 1 ? s : 1, v = s < 1 ? 1 : 1 / s, { shiftX: b, shiftY: r, rotCos: u, rotSin: M, zoom: _2, invZoom: A } = ao(l), w2 = (d3 == null ? void 0 : d3.softness) ?? 80, g2 = w2 <= 80 ? 0.76 + (1.34 - 0.76) * Math.max(0, (w2 - 15) / 65) : 1.34 + 0.24 * Math.min(1, (w2 - 80) / 20), x2 = Math.max(0.35, g2 * t.softScale), R = (d3 == null ? void 0 : d3.bloom) ?? 20, [D, k3] = t.beamRange, L = R < 20 ? D * (0.82 + 0.18 * Math.max(0, R / 20)) : D + (k3 - D) * Math.min(1, (R - 20) / 80), W = (c % se + se) % se / se * Math.PI * 2, H = Math.max(0, a2) * 100, it2 = Math.max(0, H - 75), at2 = H + it2 * 1.65, nt3 = at2 * 32e-5, ct2 = nt3 > 0 ? (Math.sin(W) * 1.15 + 0.35 * Math.cos(W * 2)) * nt3 : 0, et2 = nt3 > 0 ? (Math.cos(W) * 0.95 - 0.3 * Math.sin(W * 2)) * nt3 : 0, V = at2 * 45e-5, U = it2 * 55e-5, G2 = Math.max(0, Math.min(1, (d3 == null ? void 0 : d3.focusAmount) ?? 0));
    let lt2 = 0, gt = 0;
    if (G2 > 1e-4) {
      const O2 = (((d3 == null ? void 0 : d3.focusX) ?? 0.5) - 0.5) * S + 0.5, K3 = (((d3 == null ? void 0 : d3.focusY) ?? 0.5) - 0.5) * v + 0.5;
      lt2 = (O2 - 0.5) * G2 * 0.026, gt = (K3 - 0.5) * G2 * 0.026;
    }
    const Q2 = d3 == null ? void 0 : d3.tap;
    return p ? (p.spec = t, p.viewScaleX = S, p.viewScaleY = v, p.shiftX = b, p.shiftY = r, p.flowOffsetX = ct2, p.flowOffsetY = et2, p.rotCos = u, p.rotSin = M, p.zoom = _2, p.invZoom = A, p.focusShiftX = lt2, p.focusShiftY = gt, p.phaseRad = W, p.rayAmp = V, p.crossAmp = U, p.effSoft = x2, p.effBeam = L, p.stageAspect = h, p.tapX = Q2 ? Q2.x : 0.5, p.tapY = Q2 ? Q2.y : 0.5, p.tapAge = Q2 ? Q2.age : 10, p.tapStrength = Q2 ? Q2.strength : 0, p) : { spec: t, viewScaleX: S, viewScaleY: v, shiftX: b, shiftY: r, flowOffsetX: ct2, flowOffsetY: et2, rotCos: u, rotSin: M, zoom: _2, invZoom: A, focusShiftX: lt2, focusShiftY: gt, phaseRad: W, rayAmp: V, crossAmp: U, effSoft: x2, effBeam: L, stageAspect: h, tapX: Q2 ? Q2.x : 0.5, tapY: Q2 ? Q2.y : 0.5, tapAge: Q2 ? Q2.age : 10, tapStrength: Q2 ? Q2.strength : 0 };
  }
  function co(t, e, n) {
    const { spec: c } = n;
    t.uniform2f(e.uBgViewScale, n.viewScaleX, n.viewScaleY), t.uniform2f(e.uBgPreOffset, n.flowOffsetX - n.shiftX, n.flowOffsetY - n.shiftY), t.uniform3f(e.uBgRotZoom, n.rotCos, n.rotSin, n.invZoom), t.uniform2f(e.uBgPostCenter, 0.5 - n.focusShiftX, 0.5 - n.focusShiftY), t.uniform4f(e.uBgWave, n.phaseRad, n.rayAmp, n.crossAmp, n.stageAspect), t.uniform4f(e.uBgTap, n.tapX, n.tapY, n.tapAge, n.tapStrength);
    const a2 = e.lastSpec !== c;
    if (a2) {
      const l = io(c);
      t.uniform3fv(e.uBgCorners, l.corners), t.uniform1i(e.uBgLobeCount, l.lobeCount), t.uniform3fv(e.uBgLobeColors, l.lobeColors), t.uniform2fv(e.uBgLobeCosSin, l.lobeCosSin), e.lastSpec = c;
    }
    if (a2 || Math.abs(e.lastEffSoft - n.effSoft) > 1e-6 || Math.abs(e.lastEffBeam - n.effBeam) > 1e-6) {
      const l = Math.min(zt, c.lobes.length), d3 = Jn / n.effSoft;
      for (let p = 0; p < l; p++) {
        const h = c.lobes[p], s = p * 4;
        qt2[s] = h.center[0], qt2[s + 1] = h.center[1], qt2[s + 2] = d3 / Math.max(0.05, h.radii[0]), qt2[s + 3] = d3 / Math.max(0.05, h.radii[1]);
        const S = p * 2;
        Ee[S] = h.weight * (h.beamModulated ? n.effBeam : 1), Ee[S + 1] = h.maxAlpha;
      }
      t.uniform4fv(e.uBgLobeCentersInvRadii, qt2), t.uniform2fv(e.uBgLobeParams, Ee), e.lastEffSoft = n.effSoft, e.lastEffBeam = n.effBeam;
    }
  }
  function lo(t) {
    const e = cn(t, "gemini-4-elements:gradient", jn, oo);
    if (!e) return null;
    const n = t.createTexture();
    if (!n) return t.deleteProgram(e), null;
    t.bindTexture(t.TEXTURE_2D, n), t.pixelStorei(t.UNPACK_ALIGNMENT, 1), t.texImage2D(t.TEXTURE_2D, 0, t.RG8, de2, de2, 0, t.RG, t.UNSIGNED_BYTE, no()), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.REPEAT), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.REPEAT), t.bindTexture(t.TEXTURE_2D, null);
    const c = t.getUniformLocation(e, "u_noiseMap");
    return t.useProgram(e), t.uniform1i(c, 0), t.useProgram(null), { program: e, noiseTex: n, bgLocs: ro(t, e), uRes: t.getUniformLocation(e, "u_res"), uPointer: t.getUniformLocation(e, "u_pointer"), uGrain: t.getUniformLocation(e, "u_grain"), uGrainOffset: t.getUniformLocation(e, "u_grainOffset"), uGrainOffsetNext: t.getUniformLocation(e, "u_grainOffsetNext"), uGrainWeights: t.getUniformLocation(e, "u_grainWeights"), uNoiseMap: c };
  }
  function $e(t, e) {
    t.deleteTexture(e.noiseTex), t.deleteProgram(e.program);
  }
  function Ze(t, e, n) {
    if (e === 0) return n;
    let c = (Math.imul(e + 4099, 3266489909) ^ Math.imul((t | 0) ^ 668265263, 374761393)) >>> 0;
    return c = Math.imul(c ^ c >>> 16, 569420461) >>> 0, n + (c & 511) & 511;
  }
  function Qe(t, e, n) {
    if (e === 0) return n;
    let c = (Math.imul(e + 4099, 3266489909) ^ Math.imul((t | 0) ^ 668265263, 374761393)) >>> 0;
    return c = Math.imul(c ^ c >>> 16, 569420461) >>> 0, n + (c >>> 10 & 511) & 511;
  }
  function fo(t, e = 0, n = false, c = 8, a2 = 120, l) {
    const d3 = !t || t === 12, p = d3 ? 0 : t * 37 & 511, h = d3 ? 0 : t * 91 & 511, s = d3 ? 0 : t * 173 + 29 & 511, S = d3 ? 0 : t * 251 + 113 & 511;
    if (!n) return l ? (l.ox1 = p, l.oy1 = h, l.ox2 = s, l.oy2 = S, l.nextOx2 = s, l.nextOy2 = S, l.wBase = 0.65, l.wCurr = 0.65, l.wNext = 0, l) : { ox1: p, oy1: h, ox2: s, oy2: S, nextOx2: s, nextOy2: S, wBase: 0.65, wCurr: 0.65, wNext: 0 };
    const v = Math.max(1, Math.min(24, Math.round(c))), b = Math.max(0.1, a2), r = Math.max(1, Math.round(v * b)), M = (e % b + b) % b / b * r, _2 = Math.floor(M), A = _2 % r, w2 = (A + 1) % r, g2 = M - _2, x2 = Ze(t, A, s), R = Qe(t, A, S), D = Ze(t, w2, s), k3 = Qe(t, w2, S), L = Math.max(0, Math.min(1, (g2 - 0.45) / 0.55)), j2 = L * L * (3 - 2 * L), W = 1 / Math.sqrt(Math.max(0.5, 1 - 2 * j2 * (1 - j2))), H = je * (1 - j2) * W, it2 = je * j2 * W;
    return l ? (l.ox1 = p, l.oy1 = h, l.ox2 = x2, l.oy2 = R, l.nextOx2 = D, l.nextOy2 = k3, l.wBase = fe2, l.wCurr = H, l.wNext = it2, l) : { ox1: p, oy1: h, ox2: x2, oy2: R, nextOx2: D, nextOy2: k3, wBase: fe2, wCurr: H, wNext: it2 };
  }
  function Ke(t, e, n, c, a2, l, d3, p, h, s, S = 0, v = false, b = 8, r = 120) {
    t.disable(t.BLEND), t.useProgram(e.program), t.bindVertexArray(n), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, e.noiseTex), co(t, e.bgLocs, l), t.uniform2f(e.uRes, c, a2), t.uniform2f(e.uPointer, d3, p), t.uniform1f(e.uGrain, h);
    const u = fo(s, S, v, b, r, uo);
    t.uniform4f(e.uGrainOffset, u.ox1, u.oy1, u.ox2, u.oy2), t.uniform2f(e.uGrainOffsetNext, u.nextOx2, u.nextOy2), t.uniform3f(e.uGrainWeights, u.wBase, u.wCurr, u.wNext), t.drawArrays(t.TRIANGLES, 0, 3);
  }
  function ce(t, e, n, c, a2, l) {
    const d3 = Math.abs(t - n) - a2, p = Math.abs(e - c) - l, h = Math.max(d3, 0), s = Math.max(p, 0);
    return Math.hypot(h, s) + Math.min(Math.max(d3, p), 0);
  }
  function ho(t, e, n, c, a2, l) {
    const d3 = t - n, p = e - c, h = a2 - n, s = l - c, S = Math.max(0, Math.min(1, (d3 * h + p * s) / (h * h + s * s)));
    return Math.hypot(d3 - h * S, p - s * S);
  }
  function po(t, e) {
    const n = ce(t, e, 0.088, 0, 0.044, 0.355), c = ce(t, e, -5e-3, 0.125, 0.245, 0.041), a2 = ce(t, e, 0.056, -0.314, 0.076, 0.041), l = ce(t, e, -0.206, 0.095, 0.044, 0.071), d3 = ho(t, e, 0.048, -0.318, -0.208, 0.092) - 0.043, p = Math.max(-0.355 - e, e - 0.166, -0.25 - t, t - 0.132), h = Math.max(d3, p);
    return Math.min(n, c, a2, l, h);
  }
  function mo() {
    if (Te) return Te;
    const t = Ye, e = new Uint8Array(t * t), n = 0.22;
    for (let c = 0; c < t; c++) {
      const a2 = (c + 0.5) / t - 0.5;
      for (let l = 0; l < t; l++) {
        const d3 = (l + 0.5) / t - 0.5, p = po(d3, a2), h = Math.max(0, Math.min(1, 0.5 - p / (n * 2)));
        e[c * t + l] = Math.round(h * 255);
      }
    }
    return Te = e, e;
  }
  function So(t, e) {
    const n = Math.max(10, Math.min(100, e)), c = n <= 45 ? 15 + (n - 10) / 35 * 30 : 45 + (n - 45) / 55 * 115, a2 = Math.max(6, Math.round(le * (c / 100)));
    if (t === 0 && a2 <= le) {
      const b = new Float32Array(a2 * 2), r = 53;
      for (let u = 0; u < a2; u++) {
        const M = u * r % le * 2;
        b[u * 2] = jt2[M] * 0.5, b[u * 2 + 1] = jt2[M + 1] * 0.5;
      }
      return b;
    }
    const l = [];
    if (t === 0) for (let b = 0; b < le; b++) l.push(jt2[b * 2] * 0.5, jt2[b * 2 + 1] * 0.5);
    const d3 = pe(t === 0 ? 2654435769 : t * 2654435761 >>> 0), p = 12, h = new Float32Array(p * 4);
    for (let b = 0; b < p; b++) h[b * 4] = 28 + d3() * (Zt2 - 56), h[b * 4 + 1] = 28 + d3() * (At - 56), h[b * 4 + 2] = 22 + d3() * 54, h[b * 4 + 3] = 18 + d3() * 44;
    const s = a2 - (l.length >> 1), S = Math.max(0, s) * 45 + 200;
    let v = 0;
    for (; l.length >> 1 < a2 && v < S; ) {
      v++;
      let b, r;
      if (d3() < 0.72) {
        const w2 = Math.floor(d3() * p) * 4;
        b = h[w2] + (d3() + d3() - 1) * h[w2 + 2], r = h[w2 + 1] + (d3() + d3() - 1) * h[w2 + 3];
      } else b = 18 + d3() * (Zt2 - 36), r = 20 + d3() * (At - 40);
      b = Math.round(Math.max(16, Math.min(Zt2 - 10, b)) * 2) * 0.5, r = Math.round(Math.max(18, Math.min(At - 18, r)) * 2) * 0.5;
      const u = v > s * 20 ? 0.65 : 1, M = 15.5 * u, _2 = 8.2 * u;
      let A = false;
      for (let w2 = 0; w2 < l.length; w2 += 2) if (Math.abs(l[w2 + 1] - r) < _2 && Math.abs(l[w2] - b) < M) {
        A = true;
        break;
      }
      A || l.push(b, r);
    }
    return new Float32Array(l);
  }
  function hn(t) {
    const e = t.particleSeed > 0 ? t.particleSeed : t.sceneSeed === 12 ? 0 : t.sceneSeed, n = t.maxParticles;
    return { maxParticles: n, tilePoints: So(e, t.density), jitterRng: pe(e * 1597334677 + t.sceneSeed * 7919 + 101 >>> 0), gx: new Float32Array(n), gy: new Float32Array(n), shareRoll: new Float32Array(n), stepDur: new Float32Array(n), stepPhase: new Float32Array(n), stepCells: new Int8Array(n), side: new Int8Array(n), curO: new Int16Array(n), targetO: new Int16Array(n), wantO: new Int16Array(n), solvedT: new Int16Array(n), avoidO: new Int16Array(n), prio: new Uint8Array(n), eff: new Float32Array(n), fast: new Uint8Array(n), nextStepSec: new Float64Array(n), renderO: new Float32Array(n), pairL: new Uint16Array($t2), pairR: new Uint16Array($t2), pairM: new Int16Array($t2), adjStart: new Uint16Array(n + 1), adjPairIdx: new Uint16Array($t2 * 2), count: -1, pairCount: 0, builtAspect: -1, elapsedSec: 0, stepClockSec: 0, dodgeCooldownSec: 0, settlingDodge: false, hasPendingSteps: false, lastGpuData: null, lastHalfSizePx: -1, lastAlpha: -1, lastPackedCount: -1 };
  }
  function me(t, e) {
    const { pairCount: n, pairL: c, pairR: a2, pairM: l, solvedT: d3, eff: p } = t;
    if (!(n === 0 || e === 0)) for (let h = 0; h < 12; h++) {
      let s = false;
      for (let S = 0; S < n; S++) {
        const v = c[S], b = a2[S], r = l[S] - (d3[b] - d3[v]);
        r <= 0 || (s = true, p[v] > p[b] ? (d3[b] += r, p[v] - 0.01 > p[b] && (p[b] = p[v] - 0.01)) : p[b] > p[v] ? (d3[v] -= r, p[b] - 0.01 > p[v] && (p[v] = p[b] - 0.01)) : (d3[b] += Math.ceil(r * 0.5), d3[v] -= Math.floor(r * 0.5)));
      }
      if (!s) break;
    }
  }
  function pn(t, e, n) {
    const c = At * e, a2 = Math.ceil(c / Zt2) + 1, l = 2, d3 = t.tilePoints, p = d3.length >> 1, h = [];
    let s = 0;
    for (let g2 = 0; g2 < l; g2++) for (let x2 = -1; x2 < a2; x2++) {
      const R = (x2 + g2 * yo % 1) * Zt2, D = g2 * At;
      for (let k3 = 0; k3 < p; k3++) {
        const L = R + d3[k3 * 2], j2 = D + d3[k3 * 2 + 1];
        if (s++, L >= -Nt && L <= c + Nt && j2 >= -Nt && j2 <= At + Nt) {
          const W = pe(s * 1664525 + 1013904223 >>> 0);
          h.push({ x: L, y: j2, shareRoll: W(), stepCells: (W() < 0.5 ? -1 : 1) * (1 + Math.floor(W() * 4)), stepDur: 3 + W() * 5, stepPhase: W(), side: W() < 0.5 ? -1 : 1 });
        }
      }
    }
    let S = h;
    if (h.length > t.maxParticles) {
      S = [];
      const g2 = h.length / t.maxParticles;
      for (let x2 = 0; x2 < t.maxParticles; x2++) S.push(h[Math.floor(x2 * g2)]);
    }
    S.sort((g2, x2) => g2.x - x2.x);
    const v = S.length;
    t.count = v, t.builtAspect = e;
    for (let g2 = 0; g2 < v; g2++) {
      const x2 = S[g2];
      t.gx[g2] = x2.x, t.gy[g2] = x2.y, t.shareRoll[g2] = x2.shareRoll, t.stepCells[g2] = x2.stepCells, t.stepDur[g2] = x2.stepDur, t.stepPhase[g2] = x2.stepPhase, t.side[g2] = x2.side, t.nextStepSec[g2] = 0, t.fast[g2] = 0, t.avoidO[g2] = 0;
    }
    const b = Nt + bo, r = b + 48 * Yt, u = [];
    for (let g2 = 0; g2 < v; g2++) {
      const x2 = t.gx[g2], R = t.gy[g2];
      for (let D = g2 + 1; D < v; D++) {
        const k3 = t.gx[D] - x2;
        if (k3 > r) break;
        Math.abs(t.gy[D] - R) >= go || u.push({ l: g2, r: D, dx: k3, m: Math.ceil((b - k3) / Yt) });
      }
    }
    u.sort((g2, x2) => g2.dx - x2.dx);
    const M = Math.min($t2, u.length);
    t.pairCount = M;
    const _2 = new Uint16Array(v);
    for (let g2 = 0; g2 < M; g2++) {
      const x2 = u[g2];
      t.pairL[g2] = x2.l, t.pairR[g2] = x2.r, t.pairM[g2] = x2.m, _2[x2.l]++, _2[x2.r]++;
    }
    let A = 0;
    for (let g2 = 0; g2 < v; g2++) t.adjStart[g2] = A, A += _2[g2];
    t.adjStart[v] = A;
    const w2 = new Uint16Array(t.adjStart.subarray(0, v));
    for (let g2 = 0; g2 < M; g2++) {
      const x2 = t.pairL[g2], R = t.pairR[g2];
      t.adjPairIdx[w2[x2]++] = g2, t.adjPairIdx[w2[R]++] = g2;
    }
    for (let g2 = 0; g2 < v; g2++) {
      const x2 = t.shareRoll[g2] < n, R = (t.stepClockSec / t.stepDur[g2] + t.stepPhase[g2]) % 1, D = x2 && R < 0.5 ? t.stepCells[g2] : 0;
      t.wantO[g2] = D, t.solvedT[g2] = D, t.prio[g2] = D !== 0 ? 2 : 1, t.eff[g2] = t.prio[g2];
    }
    me(t, v);
    for (let g2 = 0; g2 < v; g2++) {
      const x2 = t.solvedT[g2];
      t.curO[g2] = x2, t.targetO[g2] = x2, t.renderO[g2] = x2;
    }
    t.hasPendingSteps = false, t.lastPackedCount = -1;
  }
  function vo(t, e, n, c, a2, l, d3, p, h, s, S) {
    const v = Math.max(0.2, a2 / Math.max(1, l)), b = c > 1e-3, r = b ? Math.min(0.92, 0.35 + c * 1.55) : 0, u = b ? 0.33 + c * 1.35 : 0.21;
    (t.count < 0 || Math.abs(v - t.builtAspect) > 0.015) && pn(t, v, r);
    const M = t.count;
    if (M === 0) return t.settlingDodge = false, 0;
    const _2 = At * v, A = Math.max(0, p / 100), w2 = Math.max(8, h), g2 = w2 * w2, x2 = Math.max(1, Math.round(8 * Math.min(1.5, A))), R = s !== null && A > 5e-3, D = R ? s[0] * _2 : -1e9, k3 = R ? (1 - s[1]) * At : -1e9, L = S != null && S.age < 0.42 && S.strength > 0.01 && A > 5e-3, j2 = L ? S.x * _2 : -1e9, W = L ? S.y * At : -1e9, H = w2 * 1.38, it2 = H * H, at2 = L ? Math.min(1.4, S.strength) * (1 - S.age / 0.42) : 0;
    if (n > 0) {
      t.elapsedSec += n, b && (t.stepClockSec += n * u);
      const V = t.elapsedSec, U = t.stepClockSec;
      let G2 = false, lt2 = false;
      for (let O2 = 0; O2 < M; O2++) {
        let K3 = 0;
        if (R) {
          const E = t.gx[O2] - D, N2 = t.gy[O2] - k3;
          if (Math.abs(E) < w2 && Math.abs(N2) < w2 && E * E + N2 * N2 < g2) {
            const m2 = Math.sign(E + t.curO[O2] * Yt) || Math.sign(E) || t.side[O2], o = Math.sqrt(g2 - N2 * N2) - m2 * E;
            K3 = m2 * Math.min(x2, Math.max(1, Math.ceil(o / Yt * A))), G2 = true;
          }
        }
        if (L) {
          const E = t.gx[O2] - j2, N2 = t.gy[O2] - W;
          if (Math.abs(E) < H && Math.abs(N2) < H && E * E + N2 * N2 < it2) {
            const m2 = Math.sign(E + t.curO[O2] * Yt) || Math.sign(E) || t.side[O2], o = Math.sqrt(it2 - N2 * N2) - m2 * E, i = m2 * Math.min(x2 + 2, Math.max(1, Math.ceil(o / Yt * A * at2)));
            Math.abs(i) > Math.abs(K3) && (K3 = i), G2 = true;
          }
        }
        t.avoidO[O2] = K3;
        let ot3 = 0;
        t.shareRoll[O2] < r && (ot3 = (U / t.stepDur[O2] + t.stepPhase[O2]) % 1 < 0.5 ? t.stepCells[O2] : 0);
        const yt2 = K3 !== 0 ? K3 : ot3, xt3 = K3 !== 0 ? 3 : ot3 !== 0 ? 2 : 1;
        (yt2 !== t.wantO[O2] || xt3 !== t.prio[O2]) && (t.wantO[O2] = yt2, t.prio[O2] = xt3, lt2 = true);
      }
      if (G2 ? t.dodgeCooldownSec = 1.6 : t.dodgeCooldownSec = Math.max(0, t.dodgeCooldownSec - n), lt2) {
        for (let O2 = 0; O2 < M; O2++) t.eff[O2] = t.prio[O2], t.solvedT[O2] = t.wantO[O2];
        me(t, M);
      }
      if (lt2 || t.hasPendingSteps) {
        const O2 = 0.16 / Math.max(0.25, A), K3 = 1 / Math.max(0.35, A), ot3 = 1 / Math.max(0.15, u), yt2 = t.jitterRng;
        let xt3 = false;
        for (let E = 0; E < M; E++) {
          if (lt2) {
            const N2 = t.solvedT[E];
            if (N2 !== t.targetO[E]) {
              if (t.curO[E] === t.targetO[E]) {
                const i = t.avoidO[E];
                if (i !== 0 && N2 === i) {
                  const f = R ? Math.hypot(t.gx[E] - D, t.gy[E] - k3) / w2 : 1, y = L ? Math.hypot(t.gx[E] - j2, t.gy[E] - W) / H : 1, P2 = Math.min(1, f, y);
                  t.nextStepSec[E] = Math.max(t.nextStepSec[E], V + P2 * O2);
                } else N2 !== t.wantO[E] ? t.nextStepSec[E] = Math.max(t.nextStepSec[E], V + yt2() * 0.04 * K3) : t.prio[E] === 1 && (t.nextStepSec[E] = Math.max(t.nextStepSec[E], V + yt2() * 0.43));
              }
              const o = t.shareRoll[E] < r && (t.curO[E] === 0 || t.curO[E] === t.stepCells[E]);
              t.fast[E] = t.prio[E] !== 3 && N2 === t.wantO[E] && o ? 0 : 1, t.targetO[E] = N2;
            }
          }
          if (t.curO[E] !== t.targetO[E]) {
            if (V >= t.nextStepSec[E]) {
              const N2 = Math.sign(t.targetO[E] - t.curO[E]);
              let m2 = false;
              const o = t.adjStart[E], i = t.adjStart[E + 1];
              for (let f = o; f < i; f++) {
                const y = t.adjPairIdx[f], P2 = t.pairL[y], I = t.pairR[y], C = t.curO[I] - t.curO[P2], T = P2 === E ? C - N2 : C + N2;
                if (T < t.pairM[y] && T < C) {
                  m2 = true;
                  break;
                }
              }
              if (m2) t.nextStepSec[E] = V + 0.016;
              else {
                t.curO[E] += N2;
                const f = t.fast[E] !== 0, y = f ? 0.045 * K3 : 0.14 * ot3, P2 = f ? 0.095 * K3 : 0.26 * ot3;
                t.nextStepSec[E] = V + y + yt2() * (P2 - y);
              }
            }
            t.curO[E] !== t.targetO[E] && (xt3 = true);
          }
        }
        t.hasPendingSteps = xt3;
      }
      const gt = 1 - Math.exp(-22.8 * n);
      let Q2 = t.hasPendingSteps;
      for (let O2 = 0; O2 < M; O2++) {
        const K3 = t.curO[O2], ot3 = K3 - t.renderO[O2];
        ot3 !== 0 && (Math.abs(ot3) < 2e-3 ? t.renderO[O2] = K3 : (t.renderO[O2] += ot3 * gt, Q2 = true));
      }
      t.settlingDodge = t.dodgeCooldownSec > 0 && Q2;
    }
    const nt3 = Math.max(4.1, Math.min(11.5, l * 65e-4)), ct2 = Math.max(0, Math.min(1, d3)), et2 = 1 / _2;
    if (t.lastGpuData !== e || t.lastPackedCount !== M || t.lastHalfSizePx !== nt3 || t.lastAlpha !== ct2) {
      const V = 1 / At;
      for (let U = 0; U < M; U++) {
        const G2 = U * 5;
        e[G2] = (t.gx[U] + t.renderO[U] * Yt) * et2, e[G2 + 1] = t.gy[U] * V, e[G2 + 2] = nt3, e[G2 + 3] = ct2, e[G2 + 4] = 0;
      }
      t.lastGpuData = e, t.lastPackedCount = M, t.lastHalfSizePx = nt3, t.lastAlpha = ct2;
    } else for (let V = 0; V < M; V++) e[V * 5] = (t.gx[V] + t.renderO[V] * Yt) * et2;
    return M;
  }
  function Ce(t) {
    let e = t + 1831565813 >>> 0;
    return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
  }
  function mn(t, e) {
    const { state: n, nextStepFrame: c, cycles: a2, loopIdleShare: l, fps: d3, dtSec: p, stepScale: h, maxReturnDelayFrames: s, maxStepFrames: S } = t, v = n.count;
    if (v <= 0 || l <= 0) return;
    const b = t.stepCounter++;
    for (let u = 0; u < v; u++) {
      let M = 0;
      n.shareRoll[u] < l && (M = (e * a2 + n.stepPhase[u]) % 1 < 0.5 ? n.stepCells[u] : 0);
      const _2 = M !== 0 ? 2 : 1;
      n.wantO[u] = M, n.prio[u] = _2, n.eff[u] = _2, n.solvedT[u] = M;
    }
    me(n, v);
    for (let u = 0; u < v; u++) {
      const M = n.solvedT[u];
      if (M !== n.targetO[u]) {
        if (n.curO[u] === n.targetO[u]) {
          if (M !== n.wantO[u]) {
            const w2 = Math.max(1, Math.round(Ce(u * 4099 + (M & 255) * 131) * 0.04 * d3));
            c[u] = Math.max(c[u], b + w2);
          } else if (n.prio[u] === 1) {
            const w2 = Math.min(s, Math.round(Ce(u * 7919 + 17) * 0.36 * d3));
            c[u] = Math.max(c[u], b + w2);
          }
        }
        const A = n.shareRoll[u] < l && (n.curO[u] === 0 || n.curO[u] === n.stepCells[u]);
        n.fast[u] = M === n.wantO[u] && A ? 0 : 1, n.targetO[u] = M;
      }
      if (n.curO[u] !== n.targetO[u] && b >= c[u]) {
        const _2 = Math.sign(n.targetO[u] - n.curO[u]);
        let A = false;
        const w2 = n.adjStart[u], g2 = n.adjStart[u + 1];
        for (let x2 = w2; x2 < g2; x2++) {
          const R = n.adjPairIdx[x2], D = n.pairL[R], k3 = n.pairR[R], L = n.curO[k3] - n.curO[D], j2 = D === u ? L - _2 : L + _2;
          if (j2 < n.pairM[R] && j2 < L) {
            A = true;
            break;
          }
        }
        if (A) c[u] = b + 1;
        else {
          n.curO[u] += _2;
          const x2 = n.fast[u] !== 0, R = Ce(u * 1597 + (n.curO[u] + 32 & 63) * 97 + (_2 > 0 ? 1 : 0)), D = x2 ? 0.045 : 0.14 * h, k3 = x2 ? 0.095 : 0.24 * h, L = Math.max(1, Math.min(S, Math.round((D + R * (k3 - D)) * d3)));
          c[u] = b + L;
        }
      }
    }
    const r = 1 - Math.exp(-22.8 * p);
    for (let u = 0; u < v; u++) {
      const M = n.curO[u] - n.renderO[u];
      Math.abs(M) < 1e-6 ? n.renderO[u] = n.curO[u] : n.renderO[u] += M * r;
    }
  }
  function xo(t) {
    const e = hn({ sceneSeed: t.sceneSeed, particleSeed: t.particleSeed, density: t.density, maxParticles: t.maxParticles }), n = Math.max(0.2, t.widthPx / Math.max(1, t.heightPx)), c = t.motionSpeed01 > 1e-3, a2 = c ? Math.min(0.92, 0.35 + t.motionSpeed01 * 1.55) : 0, l = c ? 0.33 + t.motionSpeed01 * 1.35 : 0.21, d3 = 1, p = t.duration, h = Math.min(1, Math.max(0.52, (t.duration - 1) / 5.5)), s = a2 * 0.73 * Math.min(1, p * l / 7) * h;
    if (e.stepClockSec = 0, pn(e, n, s), t.duration <= 6) {
      const A = t.duration <= 3 ? 1 : t.duration <= 5 ? 2 : 3;
      for (let w2 = 0; w2 < e.count; w2++) {
        e.stepCells[w2] = Math.sign(e.stepCells[w2]) * Math.min(A, Math.abs(e.stepCells[w2]));
        const x2 = e.shareRoll[w2] < s && e.stepPhase[w2] % 1 < 0.5 ? e.stepCells[w2] : 0;
        e.wantO[w2] = x2, e.solvedT[w2] = x2, e.prio[w2] = x2 !== 0 ? 2 : 1, e.eff[w2] = e.prio[w2];
      }
      me(e, e.count);
      for (let w2 = 0; w2 < e.count; w2++) {
        const g2 = e.solvedT[w2];
        e.curO[w2] = g2, e.targetO[w2] = g2, e.renderO[w2] = g2;
      }
    }
    const S = Math.max(1, t.fps), v = 1 / S, b = Math.min(1.85, 1.3 / Math.max(0.32, l)), r = p * 0.5, u = Math.max(1, Math.floor(Math.min(0.32, r * 0.16) * S)), M = Math.max(1, Math.floor(Math.min(0.24, r * 0.55 / 4) * S)), _2 = { state: e, nextStepFrame: new Int32Array(t.maxParticles), cycles: d3, loopIdleShare: s, fps: S, dtSec: v, stepScale: b, maxReturnDelayFrames: u, maxStepFrames: M, stepCounter: 0 };
    if (s > 0 && t.totalFrames > 0) for (let w2 = 0; w2 < 3; w2++) for (let g2 = 0; g2 < t.totalFrames; g2++) mn(_2, g2 / t.totalFrames);
    return _2;
  }
  function Mo(t, e, n, c, a2, l) {
    const { state: d3 } = t, p = d3.count;
    if (p <= 0) return 0;
    mn(t, n);
    const h = Math.max(0.2, c / Math.max(1, a2)), s = At * h, S = Math.max(4.1, Math.min(11.5, a2 * 65e-4)), v = Math.max(0, Math.min(1, l)), b = 1 / s, r = 1 / At;
    for (let u = 0; u < p; u++) {
      const M = u * 5;
      e[M] = (d3.gx[u] + d3.renderO[u] * Yt) * b, e[M + 1] = d3.gy[u] * r, e[M + 2] = S, e[M + 3] = v, e[M + 4] = 0;
    }
    return p;
  }
  function tn(t) {
    const e = t.reactivity ?? 85, n = t.dodgeRadius ?? 48, c = t.particleSeed ?? 0;
    if (t.mode === "x_step") return { mode: "x_step", count: 0, anchors: [], repelX: new Float32Array(0), repelY: new Float32Array(0), gpuData: new Float32Array(he2 * 5), reactivity: e, dodgeRadius: n, xStep: hn({ sceneSeed: t.seed, particleSeed: c, density: t.density, maxParticles: he2 }), settlingRepel: false };
    const a2 = c > 0 ? c : t.seed, l = Math.max(0, Math.min(1, (t.density - 10) / 90)), d3 = t.mode === "halo" ? 18 : 22, p = t.mode === "halo" ? 68 : Je, h = Math.min(Je, Math.max(8, Math.round(d3 + l * (p - d3)))), s = pe(a2 * 7919 + (t.mode === "halo" ? 17 : 53)), S = 0.5 + t.focalOffsetX / 100, v = 0.5 + t.focalOffsetY / 100, b = Math.max(0.55, Math.min(1.6, t.focalScalePct / 100)), r = [];
    if (t.mode === "halo") {
      const _2 = [2.45, 2.88, 3.32, 2.08, -0.42, -0.12, 0.24, -0.78].map((x2) => {
        const R = (s() - 0.5) * 0.28, D = x2 + R, k3 = (0.25 + s() * 0.085) * b;
        return { x: S + Math.cos(D) * k3 * 1.06, y: v - Math.sin(D) * k3 * 0.92, spreadX: 0.048 + s() * 0.045, spreadY: 0.044 + s() * 0.05 };
      }), A = 0.026 * 0.026;
      let w2 = 0;
      const g2 = h * 36;
      for (; r.length < h && w2 < g2; ) {
        w2++;
        const x2 = _2[Math.floor(s() * _2.length)], R = s() + s() - 1, D = s() + s() - 1, k3 = x2.x + R * x2.spreadX, L = x2.y + D * x2.spreadY;
        if (k3 < 0.06 || k3 > 0.94 || L < 0.14 || L > 0.82) continue;
        const j2 = (k3 - S) / (0.17 * b), W = (L - v) / (0.21 * b);
        if (j2 * j2 + W * W < 1) continue;
        const H = w2 > h * 18 ? 0.55 : 1;
        let it2 = false;
        for (let et2 = 0; et2 < r.length; et2++) {
          const V = r[et2].ax - k3, U = r[et2].ay - L;
          if (V * V + U * U < A * H) {
            it2 = true;
            break;
          }
        }
        if (it2) continue;
        const at2 = s(), nt3 = s() * Math.PI * 2, ct2 = s() * Math.PI * 2;
        r.push({ ax: k3, ay: L, depth: at2, phaseX: nt3, phaseY: ct2, sinPhaseX: Math.sin(nt3), cosPhaseY: Math.cos(ct2), sizeScale: 1.1 - at2 * 0.28, depthAlpha: 1 - at2 * 0.48, blur: at2 > 0.58 ? (at2 - 0.58) / 0.42 : 0, freqMult: 1 + Math.floor(s() * 3), amp: 6e-3 + s() * 0.011 });
      }
    } else {
      const _2 = [];
      for (let x2 = 0; x2 < 10; x2++) _2.push({ x: 0.08 + s() * 0.84, y: 0.08 + s() * 0.84, sx: 0.05 + s() * 0.08, sy: 0.05 + s() * 0.08 });
      const A = 0.032 * 0.032;
      let w2 = 0;
      const g2 = h * 32;
      for (; r.length < h && w2 < g2; ) {
        w2++;
        let x2, R;
        if (s() < 0.72) {
          const H = _2[Math.floor(s() * 10)];
          x2 = H.x + (s() + s() - 1) * H.sx, R = H.y + (s() + s() - 1) * H.sy;
        } else x2 = 0.05 + s() * 0.9, R = 0.06 + s() * 0.88;
        if (x2 < 0.04 || x2 > 0.96 || R < 0.05 || R > 0.95) continue;
        const D = w2 > h * 16 ? 0.55 : 1;
        let k3 = false;
        for (let H = 0; H < r.length; H++) {
          const it2 = r[H].ax - x2, at2 = r[H].ay - R;
          if (it2 * it2 + at2 * at2 < A * D) {
            k3 = true;
            break;
          }
        }
        if (k3) continue;
        const L = s(), j2 = s() * Math.PI * 2, W = s() * Math.PI * 2;
        r.push({ ax: x2, ay: R, depth: L, phaseX: j2, phaseY: W, sinPhaseX: Math.sin(j2), cosPhaseY: Math.cos(W), sizeScale: 1.1 - L * 0.28, depthAlpha: 1 - L * 0.48, blur: L > 0.58 ? (L - 0.58) / 0.42 : 0, freqMult: 1 + Math.floor(s() * 3), amp: 8e-3 + s() * 0.014 });
      }
    }
    const u = r.length;
    return { mode: t.mode, count: u, anchors: r, repelX: new Float32Array(u), repelY: new Float32Array(u), gpuData: new Float32Array(u * 5), reactivity: e, dodgeRadius: n, xStep: null, settlingRepel: false };
  }
  function Po(t) {
    return t.xStep !== null ? t.xStep.settlingDodge : t.settlingRepel;
  }
  function Ao(t, e, n, c, a2, l, d3, p, h) {
    if (t.xStep !== null) {
      t.count = vo(t.xStep, t.gpuData, e, c, a2, l, d3, t.reactivity, t.dodgeRadius, p, h);
      return;
    }
    const s = t.count;
    if (s === 0) return;
    const S = a2 / Math.max(1, l), v = Math.max(0, t.reactivity / 85), b = 3.5 + 5 * Math.min(1.3, v), r = e > 0 ? 1 - Math.exp(-b * e) : 0, u = Math.min(a2, l), M = Math.max(3.6, Math.min(10.5, u * 82e-4)), _2 = Math.PI * 2 / 20, A = c, w2 = Math.max(20, t.dodgeRadius) / 608 * 1.71, g2 = 0.052 * v, x2 = p !== null && v > 5e-3, R = x2 ? p[0] : -10, D = x2 ? 1 - p[1] : -10, k3 = h != null && h.age < 1.25 && h.strength > 0.01 && v > 5e-3, L = k3 ? h.x : -10, j2 = k3 ? h.y : -10, W = k3 ? 0.02 + 0.52 * (1 - Math.exp(-h.age * 2.2)) : 0, H = k3 ? 0.075 + h.age * 0.035 : 0.1, it2 = k3 ? Math.exp(-h.age * 2.1) * 0.034 * v * Math.min(1.4, h.strength) : 0, { anchors: at2, repelX: nt3, repelY: ct2, gpuData: et2 } = t;
    let V = false;
    for (let U = 0; U < s; U++) {
      const G2 = at2[U], lt2 = _2 * G2.freqMult, gt = A > 0 ? (Math.sin(n * lt2 + G2.phaseX) - G2.sinPhaseX) * G2.amp * A : 0, Q2 = A > 0 ? (Math.cos(n * lt2 * 0.5 + G2.phaseY) - G2.cosPhaseY) * G2.amp * A : 0, O2 = G2.ax + gt, K3 = G2.ay + Q2;
      let ot3 = 0, yt2 = 0;
      if (x2) {
        const N2 = (O2 - R) * S, m2 = K3 - D, o = N2 * N2 + m2 * m2;
        if (o < w2 * w2 && o > 1e-8) {
          const i = Math.sqrt(o), f = Math.pow(1 - i / w2, 1.6) * g2;
          ot3 = N2 / i * f / Math.max(0.4, S), yt2 = m2 / i * f;
        }
      }
      if (k3) {
        const N2 = (O2 - L) * S, m2 = K3 - j2, o = Math.hypot(N2, m2);
        if (Math.abs(o - W) < H * 3 && o > 1e-4) {
          const i = (o - W) / H, f = Math.exp(-i * i) * it2;
          ot3 += N2 / o * f / Math.max(0.4, S), yt2 += m2 / o * f;
        }
      }
      r > 0 && (nt3[U] += (ot3 - nt3[U]) * r, ct2[U] += (yt2 - ct2[U]) * r), !x2 && !k3 && nt3[U] * nt3[U] + ct2[U] * ct2[U] > 36e-8 && (V = true);
      const xt3 = A > 0 ? 1 - 0.16 * A * (0.5 - 0.5 * Math.cos(n * lt2 + G2.phaseX * 1.7)) : 1, E = U * 5;
      et2[E] = O2 + nt3[U], et2[E + 1] = K3 + ct2[U], et2[E + 2] = M * G2.sizeScale, et2[E + 3] = Math.max(0, Math.min(1, d3 * G2.depthAlpha * xt3)), et2[E + 4] = G2.blur;
    }
    t.settlingRepel = V;
  }
  function Eo(t, e, n, c, a2, l, d3, p) {
    if (t.mode === "x_step") {
      p && (t.count = Mo(p, t.gpuData, e, a2, l, d3));
      return;
    }
    const h = t.count;
    if (h === 0) return;
    const s = Math.min(a2, l), S = Math.max(3.6, Math.min(10.5, s * 82e-4)), v = e * Math.PI * 2, b = Math.min(1, Math.max(0.52, (n - 1) / 5.5)), r = c > 1e-3 ? c * Math.min(0.9, n / 24 * 1.05) * b : 0, { anchors: u, gpuData: M } = t;
    for (let _2 = 0; _2 < h; _2++) {
      const A = u[_2], w2 = r > 0 ? (Math.sin(v + A.phaseX) - A.sinPhaseX) * A.amp * r : 0, g2 = r > 0 ? (Math.cos(v + A.phaseY) - A.cosPhaseY) * A.amp * r : 0, x2 = 1 - 0.14 * r * (0.5 - 0.5 * Math.cos(v + A.phaseX * 1.7)), R = _2 * 5;
      M[R] = A.ax + w2, M[R + 1] = A.ay + g2, M[R + 2] = S * A.sizeScale, M[R + 3] = Math.max(0, Math.min(1, d3 * A.depthAlpha * x2)), M[R + 4] = A.blur;
    }
  }
  function Ro(t) {
    const e = cn(t, "gemini-4-elements:particles", wo, _o);
    if (!e) return null;
    const n = t.createVertexArray(), c = t.createBuffer(), a2 = t.createTexture();
    if (!n || !c || !a2) return t.deleteProgram(e), n && t.deleteVertexArray(n), c && t.deleteBuffer(c), a2 && t.deleteTexture(a2), null;
    t.bindVertexArray(n), t.bindBuffer(t.ARRAY_BUFFER, c), t.bufferData(t.ARRAY_BUFFER, he2 * 5 * Float32Array.BYTES_PER_ELEMENT, t.DYNAMIC_DRAW);
    const l = 5 * Float32Array.BYTES_PER_ELEMENT;
    t.enableVertexAttribArray(0), t.vertexAttribPointer(0, 4, t.FLOAT, false, l, 0), t.vertexAttribDivisor(0, 1), t.enableVertexAttribArray(1), t.vertexAttribPointer(1, 1, t.FLOAT, false, l, 4 * Float32Array.BYTES_PER_ELEMENT), t.vertexAttribDivisor(1, 1), t.bindVertexArray(null), t.bindBuffer(t.ARRAY_BUFFER, null);
    const d3 = mo();
    t.bindTexture(t.TEXTURE_2D, a2), t.pixelStorei(t.UNPACK_ALIGNMENT, 1), t.texImage2D(t.TEXTURE_2D, 0, t.R8, Ye, Ye, 0, t.RED, t.UNSIGNED_BYTE, d3), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.bindTexture(t.TEXTURE_2D, null);
    const p = t.getUniformLocation(e, "u_sdfTex");
    return t.useProgram(e), t.uniform1i(p, 0), t.useProgram(null), { program: e, vao: n, instanceBuffer: c, sdfTexture: a2, uRes: t.getUniformLocation(e, "u_res"), uSdfTex: p, uTint: t.getUniformLocation(e, "u_tint") };
  }
  function To(t, e) {
    t.deleteTexture(e.sdfTexture), t.deleteBuffer(e.instanceBuffer), t.deleteVertexArray(e.vao), t.deleteProgram(e.program);
  }
  function en(t, e, n, c, a2, l) {
    n.count < 1 || (t.enable(t.BLEND), t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA), t.useProgram(e.program), t.bindVertexArray(e.vao), t.bindBuffer(t.ARRAY_BUFFER, e.instanceBuffer), t.bufferSubData(t.ARRAY_BUFFER, 0, n.gpuData, 0, n.count * 5), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, e.sdfTexture), t.uniform2f(e.uRes, c, a2), t.uniform3f(e.uTint, l[0], l[1], l[2]), t.drawArraysInstanced(t.TRIANGLE_STRIP, 0, 4, n.count), t.bindVertexArray(null), t.disable(t.BLEND));
  }
  function Lo(t, e, n) {
    const c = t.buildInstance({ seed: e }), a2 = n.createElementMotionController(), l = n.createReactiveEmitterState(e), d3 = new Float32Array(9);
    let p = 0;
    n.buildInvRotMatrix(t.defaultPose[0], t.defaultPose[1], t.defaultPose[2], d3);
    const h = { dt: 0, cursorInside: false, targetPtrX: 0.5, targetPtrY: 0.5, isDragging: false, interactionEnabled: true, tiltScale: 1, invertTilt: true, effectScale: 1, width: 1, height: 1, shiftNdcX: 0, shiftNdcY: 0, scale: 1, boundRadii: c.boundRadii }, s = { width: 1, height: 1, timeSec: 0, invRot: d3, offsetX: 0, offsetY: 0, bobY: 0, scale: 1, dof01: 0.55, fog01: 0.55, bloom01: 0.55, refraction01: 0.65, detail01: 0.7, ptrX: 0.5, ptrY: 0.5, wake: rn, tap: Le, gradientFrame: null };
    return { addDragPixels(S, v, b, r) {
      a2.addDragPixels(S, v, b, r);
    }, prepareLoop() {
      a2.freezeOrbitForLoop();
    }, triggerTap(S, v, b, r, u, M, _2, A, w2, g2) {
      const x2 = Math.max(1, Math.min(b, r)), R = u * b / x2, D = -M * r / x2 + p, k3 = a2.triggerTap({ ptrX: S, ptrY: v, width: b, height: r, shiftNdcX: R, shiftNdcY: D, tiltScale: A, effectScale: w2, allowTorque: g2 });
      n.triggerReactiveTapBurst(l, t.reactive, a2.tap.tapNdcX, a2.tap.tapNdcY, a2.crystalHalfNdc, _2, k3);
    }, isSettling() {
      return a2.isSettling() || l.activeCount > 0 || l.pendingBurst;
    }, getAmbientScale() {
      return a2.fluidTilt.ambientScale;
    }, render(S, v, b, r) {
      p = r.bobY;
      const u = Math.max(1, Math.min(r.width, r.height)), M = r.offsetX * r.width / u, _2 = -r.offsetY * r.height / u + r.bobY;
      h.dt = r.dtSec, h.cursorInside = r.cursorInside, h.targetPtrX = r.targetPtrX, h.targetPtrY = r.targetPtrY, h.isDragging = r.isDragging, h.interactionEnabled = r.interactionEnabled, h.tiltScale = r.tiltScale, h.invertTilt = r.invertTilt, h.effectScale = r.effectScale, h.width = r.width, h.height = r.height, h.shiftNdcX = M, h.shiftNdcY = _2, h.scale = r.scale, a2.step(h, d3);
      const [A, w2, g2] = t.defaultPose, x2 = A + r.crystalYawOffsetRad + r.animYaw, R = w2 + r.animPitch, D = g2 + r.crystalTiltOffsetRad + r.animRoll;
      n.composeElementInvRot(x2, R, D, a2.dragMat, a2.fluidTilt.yaw, a2.fluidTilt.pitch, a2.fluidTilt.roll, d3), n.stepReactiveEmitter(l, t.reactive, r.dtSec, a2.wake, a2.crystalProximity, a2.crystalHalfNdc, r.scale, u), s.width = r.width, s.height = r.height, s.timeSec = r.timeSec, s.offsetX = r.offsetX, s.offsetY = r.offsetY, s.bobY = r.bobY, s.scale = r.scale, s.dof01 = r.dof01, s.fog01 = r.fog01, s.bloom01 = r.bloom01, s.refraction01 = r.refraction01, s.detail01 = r.detail01, s.ptrX = r.curPtrX, s.ptrY = r.curPtrY, s.wake = a2.wake, s.tap = r.rippleEnabled ? a2.tap : Le, s.gradientFrame = r.gradientFrame, n.renderElementSpec(S, v, b, t, c, s), n.drawReactiveEmitter(S, v, l, t.reactive, r.width, r.height, M, _2, r.gradientFrame.spec.isLightBackdrop, r.interactionEnabled ? r.effectScale : 0);
    }, renderLoop(S, v, b, r) {
      const [u, M, _2] = t.defaultPose, A = u + r.crystalYawOffsetRad + r.animYaw, w2 = M + r.animPitch, g2 = _2 + r.crystalTiltOffsetRad + r.animRoll;
      n.composeElementInvRot(A, w2, g2, a2.dragMat, 0, 0, 0, d3), s.width = r.width, s.height = r.height, s.timeSec = r.timeSec, s.offsetX = r.offsetX, s.offsetY = r.offsetY, s.bobY = r.bobY, s.scale = r.scale, s.dof01 = r.dof01, s.fog01 = r.fog01, s.bloom01 = r.bloom01, s.refraction01 = r.refraction01, s.detail01 = r.detail01, s.ptrX = 0.5, s.ptrY = 0.5, s.wake = rn, s.tap = Le, s.gradientFrame = r.gradientFrame, n.renderElementSpec(S, v, b, t, c, s);
    } };
  }
  function Bo(t) {
    return Fo.has(t) ? `c.${t}` : t;
  }
  function Fe(t) {
    if (t === "true" || t === "1") return true;
    if (t === "false" || t === "0") return false;
  }
  function Xo(t, e) {
    switch (t.type) {
      case "richtext":
      case "url":
      case "file":
      case "document":
      case "page":
      case "image":
      case "media":
        return { valid: false };
      case "boolean": {
        const n = Fe(e);
        return n !== void 0 ? { valid: true, value: n } : { valid: false };
      }
      case "number":
      case "integer": {
        const n = e.trim(), c = n === "" ? NaN : Number(n);
        if (!Number.isFinite(c)) return { valid: false };
        const a2 = t.type === "integer" ? Math.round(c) : c;
        return { valid: true, value: Math.min(t.max ?? 1 / 0, Math.max(t.min ?? -1 / 0, a2)) };
      }
      case "color": {
        const n = e.trim();
        return Do.test(n) ? { valid: true, value: n } : { valid: false };
      }
      case "choice":
        return t.choices.some(([n]) => n === e) ? { valid: true, value: e } : !t.required && t.default === void 0 && e === "" ? { valid: true, value: null } : { valid: false };
      case "multichoice": {
        const n = new Set(e === "" ? [] : e.split(",")), c = t.choices.filter(([a2]) => n.has(a2)).map(([a2]) => a2);
        return e !== "" && c.length === 0 ? { valid: false } : { valid: true, value: c };
      }
      case "date": {
        const n = e.trim();
        return ko.test(n) && !Number.isNaN(Date.parse(`${n}T00:00`)) ? { valid: true, value: n } : { valid: false };
      }
      case "time": {
        const n = e.trim();
        return Yo.test(n) ? { valid: true, value: n } : { valid: false };
      }
      case "datetime": {
        const n = e.trim();
        return n !== "" && !Number.isNaN(Date.parse(n)) ? { valid: true, value: n } : { valid: false };
      }
      case "string":
      case "text":
        return e.trim().toLowerCase().startsWith("blob:") ? { valid: false } : { valid: true, value: e };
    }
  }
  function No(t, e, n) {
    const c = n.get("colorMode") ?? ("theme" in t ? null : n.get("theme")), a2 = c === "light" || c === "dark" || c === "system" ? c : void 0, l = Fe(n.get("reducedMotion")), d3 = Fe(n.get("lowPower")), p = { ...e };
    let h = false;
    for (const [s, S] of Object.entries(t)) {
      const v = n.get(Bo(s));
      if (v === null) continue;
      const b = Xo(S, v);
      b.valid && JSON.stringify(p[s]) !== JSON.stringify(b.value) && (p[s] = b.value, h = true);
    }
    return { config: p, configChanged: h, ...a2 !== void 0 ? { themeBehavior: a2 } : {}, ...l !== void 0 ? { reducedMotion: l } : {}, ...d3 !== void 0 ? { lowPower: d3 } : {} };
  }
  function Ie(t) {
    It2.dataset.colorMode = t, It2.classList.add("deepai"), It2.classList.toggle("deepai--dark", t === "dark"), It2.classList.toggle("deepai--light", t === "light"), It2.classList.toggle("is-dark", t === "dark"), window.dispatchEvent(new CustomEvent("deepai:mode-change", { detail: { mode: t } }));
  }
  var Rn, Tn, X, Ln, an, In, Fn, Xn, Nn, Un, Gn, zn, Vn, Hn, qn, zt, F4, Ct, $n, jn, Kn, de2, se, Jn, De, ke, ln, un, dn, fn, to, eo, Ae, oo, He, qt2, Ee, so, Re, fe2, je, uo, Ye, Te, Zt2, At, Nt, Yt, bo, go, yo, $t2, jt2, le, he2, Je, wo, _o, nn, ue2, Oe, on, Xt2, Co, Le, rn, Oo, Io, Do, ko, Yo, Fo, bn, It2, Ut2, Qt, sn;
  var init_script = __esm({
    "../../../../Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/gemini_4_carbon/script.js"() {
      Rn = Object.defineProperty;
      Tn = (t, e, n) => e in t ? Rn(t, e, { enumerable: true, configurable: true, writable: true, value: n }) : t[e] = n;
      X = (t, e, n) => Tn(t, typeof e != "symbol" ? e + "" : e, n);
      (() => {
        var N2;
        class t extends Event {
          constructor(o, i, f) {
            super("context-request", { bubbles: true, composed: true }), this.context = o, this.callback = i, this.subscribe = f;
          }
        }
        class e extends Event {
          constructor(o) {
            super("context-provider", { bubbles: true, composed: true }), this.context = o;
          }
        }
        function n(m2, o, i) {
          let f, y;
          const P2 = /* @__PURE__ */ new Set(), I = (T, J3) => {
            if (J3 !== y && (y == null || y()), y = J3, Object.is(T, f)) return;
            const q = T;
            f = q, P2.forEach((z) => z(q));
          }, C = () => {
            m2.dispatchEvent(new t(o, I, true));
          };
          return m2.ownerDocument.addEventListener("context-provider", (T) => {
            T.context === o && C();
          }, { signal: i }), i.addEventListener("abort", () => {
            y == null || y(), P2.clear();
          }, { once: true }), i.aborted || C(), { get current() {
            return f;
          }, subscribe: (T) => (P2.add(T), () => {
            P2.delete(T);
          }) };
        }
        class c extends HTMLElement {
          constructor() {
            super();
            X(this, "internals", typeof this.attachInternals == "function" ? this.attachInternals() : void 0);
            X(this, "fallbackStates", /* @__PURE__ */ new Set());
            X(this, "connection", new AbortController());
            X(this, "isFirstConnect", true);
          }
          static register() {
            const i = this.tagName;
            if (!i) throw new Error(`[BaseElement] Cannot register ${this.name}: static tagName is not defined.`);
            window.customElements.get(i) || window.customElements.define(i, this);
          }
          connectedCallback() {
            this.connection.signal.aborted && (this.connection = new AbortController()), this.isFirstConnect && (this.setup(), this.isFirstConnect = false), this.connect(), this.setElementState("connected", true);
          }
          disconnectedCallback() {
            this.setElementState("connected", false), this.disconnect(), this.connection.abort();
          }
          get signal() {
            return this.connection.signal;
          }
          setup() {
          }
          connect() {
          }
          disconnect() {
          }
          setElementState(i, f = true) {
            this.internals && this.internals.states ? f ? this.internals.states.add(i) : this.internals.states.delete(i) : f ? this.fallbackStates.add(i) : this.fallbackStates.delete(i);
          }
          hasElementState(i) {
            return this.internals && this.internals.states ? this.internals.states.has(i) : this.fallbackStates.has(i);
          }
          emit(i, ...[f]) {
            this.dispatchEvent(new CustomEvent(`${this.localName}:${i}`, { detail: f, bubbles: true, composed: true }));
          }
          listen(i, f, y, P2) {
            const I = typeof P2 == "boolean" ? { capture: P2 } : P2;
            i.addEventListener(f, y, { ...I, signal: this.signal });
          }
          provide(i, f) {
            return (function(y, P2, I, C) {
              let T = I;
              const J3 = /* @__PURE__ */ new Map();
              return y.addEventListener("context-request", (q) => {
                if (q.context !== P2 || q.composedPath()[0] === y) return;
                q.stopImmediatePropagation();
                const { callback: z } = q;
                q.subscribe ? (J3.has(z) || J3.set(z, () => {
                  J3.delete(z);
                }), z(T, J3.get(z))) : z(T);
              }, { signal: C }), C.addEventListener("abort", () => J3.clear(), { once: true }), y.dispatchEvent(new e(P2)), { get current() {
                return T;
              }, set(q) {
                C.aborted || Object.is(q, T) || (T = q, J3.forEach((z, ut2) => ut2(T, z)));
              } };
            })(this, i, f, this.signal);
          }
          consume(i) {
            return n(this, i, this.signal);
          }
          $(i) {
            return this.querySelector(i);
          }
          $required(i) {
            const f = this.querySelector(i);
            if (!f) throw new Error(`[BaseElement] Required child element "${i}" not found in <${this.tagName.toLowerCase()}>.`);
            return f;
          }
          $$(i) {
            return this.querySelectorAll(i);
          }
          getAttributeAsString(i, f) {
            return this.getAttribute(i) ?? f;
          }
          getAttributeAsBoolean(i) {
            const f = this.getAttribute(i);
            return f !== null && f !== "false";
          }
          getAttributeAsNumber(i, f) {
            const y = this.getAttribute(i);
            if (y === null) return f;
            const P2 = parseFloat(y);
            return isNaN(P2) ? f : P2;
          }
        }
        let a2 = (function(m2) {
          return m2[m2.DEBUG = 0] = "DEBUG", m2[m2.INFO = 1] = "INFO", m2[m2.WARN = 2] = "WARN", m2[m2.ERROR = 3] = "ERROR", m2;
        })({});
        class l {
          log(o, i, f, ...y) {
            const P2 = `[${i}] ${f}`;
            switch (o) {
              case a2.DEBUG:
                console.debug(P2, ...y);
                break;
              case a2.INFO:
                console.log(P2, ...y);
                break;
              case a2.WARN:
                console.warn(P2, ...y);
                break;
              case a2.ERROR:
                console.error(P2, ...y);
            }
          }
        }
        class d3 {
          constructor(o) {
            X(this, "level", a2.INFO);
            X(this, "handler", new l());
            this.namespace = o, this.level = a2.WARN;
          }
          setLevel(o) {
            return this.level = o, this;
          }
          setHandler(o) {
            return this.handler = o, this;
          }
          debug(o, ...i) {
            this.level <= a2.DEBUG && this.handler.log(a2.DEBUG, this.namespace, o, ...i);
          }
          info(o, ...i) {
            this.level <= a2.INFO && this.handler.log(a2.INFO, this.namespace, o, ...i);
          }
          warn(o, ...i) {
            this.level <= a2.WARN && this.handler.log(a2.WARN, this.namespace, o, ...i);
          }
          error(o, ...i) {
            this.level <= a2.ERROR && this.handler.log(a2.ERROR, this.namespace, o, ...i);
          }
        }
        new d3("ABC");
        const p = /* @__PURE__ */ Symbol("Scroll"), h = { scrollY: 0, deltaY: 0, direction: "idle", viewportHeight: 0, scrollHeight: 0, isProgrammatic: false }, E = class E2 {
          constructor(o) {
            X(this, "listeners", { scroll: /* @__PURE__ */ new Set(), scrollend: /* @__PURE__ */ new Set(), resize: /* @__PURE__ */ new Set() });
            X(this, "observer", null);
            X(this, "idleTimeout", null);
            X(this, "isListening", false);
            X(this, "currentState", h);
            X(this, "onScroll", () => {
              this.syncScroll(window.scrollY), this.scheduleIdleScrollEnd();
              const o2 = this.currentState;
              for (const i of [...this.listeners.scroll]) this.listeners.scroll.has(i) && i(o2);
            });
            X(this, "onScrollEnd", () => {
              this.clearIdleTimeout(), this.currentState = { ...this.currentState, deltaY: 0, direction: "idle" };
              const o2 = this.currentState;
              for (const i of [...this.listeners.scrollend]) this.listeners.scrollend.has(i) && i(o2);
            });
            X(this, "onResize", () => {
              this.syncDimensions();
              const o2 = this.currentState;
              for (const i of [...this.listeners.resize]) this.listeners.resize.has(i) && i(o2);
              for (const i of [...this.listeners.scroll]) this.listeners.scroll.has(i) && i(o2);
            });
            if (o !== p) throw new Error("Use Scroll.getInstance() instead of new Scroll().");
          }
          static getInstance() {
            return E2.instance || (E2.instance = new E2(p)), E2.instance;
          }
          static resetInstance() {
            E2.instance && (E2.instance.cleanup(), E2.instance = null);
          }
          get state() {
            return this.isListening || this.syncDimensions(), this.currentState;
          }
          setProgrammaticState(o) {
            this.currentState.isProgrammatic !== o && (this.currentState = { ...this.currentState, isProgrammatic: o }, o && this.scheduleIdleScrollEnd());
          }
          on(o, i) {
            return this.attachListeners(), this.listeners[o].add(i), () => this.off(o, i);
          }
          off(o, i) {
            this.listeners[o].delete(i), this.hasListeners() || this.detachListeners();
          }
          cleanup() {
            this.detachListeners(), this.listeners.scroll.clear(), this.listeners.resize.clear(), this.listeners.scrollend.clear(), this.currentState = h;
          }
          hasListeners() {
            return this.listeners.scroll.size > 0 || this.listeners.resize.size > 0 || this.listeners.scrollend.size > 0;
          }
          attachListeners() {
            this.isListening || (this.isListening = true, this.syncDimensions(), this.syncScroll(window.scrollY), window.addEventListener("scroll", this.onScroll, { passive: true }), window.addEventListener("scrollend", this.onScrollEnd, { passive: true }), window.addEventListener("resize", this.onResize), this.observer = new ResizeObserver(this.onResize), this.observer.observe(document.body));
          }
          detachListeners() {
            var o;
            this.isListening && (this.isListening = false, this.clearIdleTimeout(), window.removeEventListener("scroll", this.onScroll), window.removeEventListener("scrollend", this.onScrollEnd), window.removeEventListener("resize", this.onResize), (o = this.observer) == null || o.disconnect(), this.observer = null);
          }
          clearIdleTimeout() {
            this.idleTimeout !== null && (clearTimeout(this.idleTimeout), this.idleTimeout = null);
          }
          scheduleIdleScrollEnd() {
            this.clearIdleTimeout(), this.idleTimeout = setTimeout(this.onScrollEnd, 140);
          }
          syncScroll(o) {
            const i = o - this.currentState.scrollY;
            let f = this.currentState.direction;
            i > 0 ? f = "down" : i < 0 && (f = "up"), this.currentState = { ...this.currentState, scrollY: o, deltaY: i, direction: f };
          }
          syncDimensions() {
            const o = window.innerHeight, i = document.documentElement.scrollHeight;
            this.currentState = { ...this.currentState, scrollY: window.scrollY, viewportHeight: o, scrollHeight: i };
          }
        };
        X(E, "instance", null);
        let s = E;
        const S = { tracks: {}, collections: {}, components: [] };
        let v = null, b = null, r = null;
        function u() {
          const m2 = document.getElementById("abc-page-config");
          if (b && m2 === v) return b;
          if (v = m2, r = null, !m2 || !m2.textContent) return b = S, b;
          try {
            const o = JSON.parse(m2.textContent);
            b = { tracks: o.tracks && typeof o.tracks == "object" ? o.tracks : {}, collections: o.collections && typeof o.collections == "object" ? o.collections : {}, components: Array.isArray(o.components) ? o.components : [] };
          } catch {
            b = S;
          }
          return b;
        }
        function M() {
          if (u(), r) return r;
          const m2 = /* @__PURE__ */ new Map(), o = document.querySelectorAll("[data-marker], [data-marker-end]");
          for (const i of o) {
            const f = i.getAttribute("data-marker");
            f && m2.set(f, { id: f, element: i, edge: "top" });
            const y = i.getAttribute("data-marker-end");
            y && m2.set(y, { id: y, element: i, edge: "bottom" });
          }
          return r = m2, m2;
        }
        function _2(m2, o, i) {
          var y;
          const f = i.get(m2);
          return f && ((y = f.element) != null && y.isConnected) ? f : { id: m2, element: null, edge: f ? f.edge : o };
        }
        function A(m2) {
          var y;
          const o = u().tracks[m2];
          if (!o) return null;
          let i = M();
          const f = o.start_marker || o.end_marker;
          if (f) {
            const P2 = i.get(f);
            P2 && ((y = P2.element) != null && y.isConnected) || (r = null, i = M());
          }
          return { id: m2, start: o.start_marker ? _2(o.start_marker, "top", i) : null, end: o.end_marker ? _2(o.end_marker, "bottom", i) : null, markers: Array.isArray(o.markers) ? o.markers.map((P2) => _2(P2, "top", i)) : [] };
        }
        function w2(m2) {
          const o = m2.start !== null && m2.end !== null && m2.start.id === m2.end.id && m2.start.edge === m2.end.edge && m2.markers.length === 0;
          return [m2.start, ...m2.markers, o ? null : m2.end].filter((i) => i !== null);
        }
        class g2 {
          constructor(o, i) {
            X(this, "listeners", /* @__PURE__ */ new Set());
            X(this, "measuredPoints", []);
            X(this, "startScrollY", 0);
            X(this, "endScrollY", 0);
            X(this, "state", null);
            X(this, "resized", (o2) => {
              var T, J3;
              if (this.measuredPoints = [this.measure(o2)].flat(), this.measuredPoints.length === 0) return;
              const i2 = this.measuredPoints[0], f2 = this.measuredPoints[this.measuredPoints.length - 1], { viewportHeight: y, scrollHeight: P2 } = o2, I = this.range === "cover" || ((T = i2.marker) == null ? void 0 : T.edge) === "bottom" ? i2.y - y : i2.y, C = this.range !== "cover" && ((J3 = f2.marker) == null ? void 0 : J3.edge) === "bottom" ? f2.y - y : f2.y;
              if (P2 > y) {
                const q = P2 - y;
                this.startScrollY = Math.min(I, q), this.endScrollY = Math.min(C, q);
              } else this.startScrollY = I, this.endScrollY = C;
            });
            X(this, "scrolled", (o2) => {
              if (this.measuredPoints.length === 0) return;
              const i2 = this.computeState(o2.scrollY, o2.viewportHeight);
              if (!this.state || this.state.progress !== i2.progress || !(function(f2, y) {
                for (const P2 in y) if (f2[P2] !== y[P2]) return false;
                for (const P2 in f2) if (!(P2 in y)) return false;
                return true;
              })(this.state.markers, i2.markers)) {
                this.state = i2;
                for (const f2 of this.listeners) f2(this.state);
              }
            });
            this.measure = o, this.range = (i == null ? void 0 : i.range) ?? "contain";
            const f = s.getInstance();
            f.on("resize", this.resized), f.on("scroll", this.scrolled), this.resized(f.state), this.scrolled(f.state);
          }
          static fromResolvedTrack(o) {
            if (!o) return null;
            const i = w2(o);
            if (!i.some((y) => !!y.element)) return null;
            const f = i.some((y) => {
              var P2;
              return ((P2 = y.element) == null ? void 0 : P2.getAttribute("data-track-range")) === "cover";
            });
            return new g2((function(y) {
              const P2 = w2(y).map((I) => ({ y: 0, marker: I }));
              return (I) => {
                var J3, q;
                const C = /* @__PURE__ */ new Map(), T = [];
                for (const z of P2) {
                  const ut2 = (J3 = z.marker) == null ? void 0 : J3.element;
                  if (!ut2) continue;
                  let pt3 = C.get(ut2);
                  pt3 || (pt3 = ut2.getBoundingClientRect(), C.set(ut2, pt3)), z.y = (((q = z.marker) == null ? void 0 : q.edge) === "bottom" ? pt3.bottom : pt3.top) + I.scrollY, T.push(z);
                }
                return T;
              };
            })(o), { range: f ? "cover" : "contain" });
          }
          static byId(o) {
            return g2.fromResolvedTrack(A(o));
          }
          static forElement(o) {
            return g2.fromResolvedTrack((function(i) {
              const f = i.closest("[data-track]"), y = f == null ? void 0 : f.getAttribute("data-track");
              return y ? A(y) : null;
            })(o));
          }
          get points() {
            return this.measuredPoints;
          }
          get current() {
            return this.state;
          }
          subscribe(o) {
            return this.listeners.add(o), this.state && o(this.state), () => this.listeners.delete(o);
          }
          destroy() {
            const o = s.getInstance();
            o.off("resize", this.resized), o.off("scroll", this.scrolled), this.listeners.clear();
          }
          computeMarkerPositions(o, i) {
            var y;
            const f = {};
            for (const P2 of this.measuredPoints) {
              const I = (y = P2.marker) == null ? void 0 : y.id;
              if (!I) continue;
              const C = i > 0 ? (o + i - P2.y) / i : o >= P2.y ? 1 : 0;
              f[I] = C === 0 ? 0 : C;
            }
            return f;
          }
          computeState(o, i) {
            const f = this.computeMarkerPositions(o, i);
            if (o < this.startScrollY) return { progress: 0, markers: f };
            const y = this.endScrollY - this.startScrollY;
            return o >= this.endScrollY || y <= 0 ? { progress: 1, markers: f } : { progress: (o - this.startScrollY) / y, markers: f };
          }
        }
        const x2 = "(prefers-reduced-motion: reduce)", R = "(prefers-color-scheme: dark)", D = new d3("ABCCanvasContext");
        class k3 {
          constructor(o, i, f, y, P2) {
            X(this, "channels", /* @__PURE__ */ new Map());
            X(this, "catchUps", /* @__PURE__ */ new Set());
            this.host = o, this.signal = f, this.definition = y, this.callbacks = P2;
            const I = j2(o, y);
            this.live = at2(o, I.colorModes), this.value = { root: i, config: W(o), ...this.live, priority: o.hasAttribute("priority"), hasPoster: L(o), signal: f, channel: (C, T) => this.channel(C, T), emit: (C, T) => {
              f.aborted || P2.onMessage(C, T);
            } };
          }
          diff() {
            const { colorModes: o } = j2(this.host, this.definition), i = at2(this.host, o), f = (function(y, P2) {
              const I = Object.keys(P2).filter((T) => P2[T] !== y[T]);
              if (I.length === 0) return null;
              const C = {};
              for (const T of I) C[T] = P2[T];
              return C;
            })(this.live, i);
            return f ? (this.live = i, f) : null;
          }
          catchUpChannels() {
            this.catchUps.forEach((o) => o());
          }
          channel(o, i) {
            const f = typeof i == "string" ? i.trim() : "", y = f ? `${o}:${f}` : o, P2 = this.channels.get(y);
            if (P2) return P2;
            const I = this.createChannelSource(o, f), C = { get current() {
              return I.current;
            }, subscribe: (T) => {
              let J3 = I.current;
              const q = () => {
                const ut2 = I.current;
                this.callbacks.isRunning() && ut2 !== void 0 && !Object.is(ut2, J3) && (J3 = ut2, T(ut2));
              }, z = I.subscribe(() => {
                try {
                  q();
                } catch (ut2) {
                  this.callbacks.onError(ut2);
                }
              });
              return this.catchUps.add(q), () => {
                this.catchUps.delete(q), z();
              };
            } };
            return this.channels.set(y, C), C;
          }
          createChannelSource(o, i) {
            if (o === "track" && i) {
              const y = this.signal.aborted ? null : g2.byId(i);
              if (y) return this.signal.addEventListener("abort", () => y.destroy(), { once: true }), { get current() {
                return y.current ?? void 0;
              }, subscribe: (P2) => y.subscribe(P2) };
            }
            const f = i ? `${o}:${i}` : o;
            return n(this.host, f, this.signal);
          }
        }
        function L(m2) {
          return !!m2.querySelector(":scope > .poster");
        }
        function j2(m2, o) {
          const i = o == null ? void 0 : o.capabilities, { capabilitiesColorModes: f, capabilitiesPoster: y, capabilitiesReducedMotion: P2, capabilitiesLowPower: I } = m2.dataset;
          let C = ["light", "dark"];
          if (f) {
            const T = f.split(/[\s,]+/).filter((J3) => J3 === "light" || J3 === "dark");
            T.length > 0 && (C = T);
          } else i != null && i.colorModes && i.colorModes.length > 0 && (C = i.colorModes);
          return { colorModes: C, poster: nt3(y, i == null ? void 0 : i.poster, false), reducedMotion: nt3(P2, i == null ? void 0 : i.reducedMotion, false), lowPower: nt3(I, i == null ? void 0 : i.lowPower, true) };
        }
        function W(m2) {
          const o = m2.querySelector(':scope > script[type="application/json"]');
          if (!(o != null && o.textContent)) return {};
          try {
            const f = JSON.parse(o.textContent);
            if (typeof (i = f) == "object" && i !== null && !Array.isArray(i)) return Object.freeze({ ...f });
            D.warn("Canvas config must be a JSON object; ignoring it.");
          } catch (f) {
            D.warn("Failed to parse canvas config JSON:", f);
          }
          var i;
          return {};
        }
        function H() {
          const m2 = document.documentElement.dataset.reducedMotion;
          return m2 === "true" || m2 !== "false" && window.matchMedia(x2).matches;
        }
        function it2() {
          var P2, I, C, T;
          const m2 = document.documentElement.dataset.lowPower;
          if (m2 === "true") return true;
          if (m2 === "false") return false;
          const { connection: o, deviceMemory: i = 0, hardwareConcurrency: f = 0 } = navigator;
          if (o != null && o.saveData || (o == null ? void 0 : o.effectiveType) === "slow-2g" || (o == null ? void 0 : o.effectiveType) === "2g" || i > 0 && i <= 4 || f > 0 && f <= 4) return true;
          if (!((I = (P2 = window.matchMedia) == null ? void 0 : P2.call(window, "(pointer: coarse) and (hover: none)")) != null && I.matches) || i > 4 && f > 4) return false;
          const y = Math.min(((C = window.screen) == null ? void 0 : C.width) || 0, ((T = window.screen) == null ? void 0 : T.height) || 0);
          return !(i === 0 && f >= 8 && y >= 768);
        }
        function at2(m2, o) {
          const i = (function(f) {
            var P2, I;
            const y = getComputedStyle(f).getPropertyValue("--abc-color-scheme").trim();
            return y === "light" || y === "dark" ? y : (I = (P2 = window.matchMedia) == null ? void 0 : P2.call(window, R)) != null && I.matches ? "dark" : "light";
          })(m2);
          return { colorMode: o.length > 0 && !o.includes(i) ? o[0] : i, reducedMotion: H(), lowPower: it2() };
        }
        function nt3(m2, o, i) {
          return m2 !== void 0 ? m2 === "true" : o ?? i;
        }
        const ct2 = /* @__PURE__ */ new WeakMap(), et2 = /* @__PURE__ */ new Map();
        let V = null;
        function U(m2) {
          const o = et2.get(m2) ?? 0;
          et2.set(m2, o + 1), o > 0 || (document.adoptedStyleSheets = [...document.adoptedStyleSheets, m2]);
        }
        function G2(m2) {
          const o = (et2.get(m2) ?? 1) - 1;
          o > 0 ? et2.set(m2, o) : (et2.delete(m2), document.adoptedStyleSheets = document.adoptedStyleSheets.filter((i) => i !== m2));
        }
        const lt2 = new d3("ABCCanvasScene");
        class gt extends Error {
          constructor(o) {
            super(`Canvas module at ${o} does not default-export a CanvasDefinition (missing mount()).`), this.name = "CanvasModuleError";
          }
        }
        class Q2 {
          constructor(o, i, f) {
            X(this, "stage", document.createElement("div"));
            X(this, "controller", new AbortController());
            X(this, "resolved", null);
            X(this, "instance", null);
            X(this, "context", null);
            X(this, "releaseStyles", () => {
            });
            X(this, "running", false);
            this.source = o, this.host = i, this.callbacks = f, this.src = typeof o == "string" ? o : "", this.stage.className = "stage", i.append(this.stage);
          }
          get isMounted() {
            return this.instance !== null;
          }
          get isRunning() {
            return this.running;
          }
          async resolve() {
            const { signal: o } = this.controller, i = await (async function(f) {
              if (typeof f == "string") {
                const y = new URL(f, document.baseURI).href;
                return { definition: await (async function(I) {
                  var T;
                  const C = await Promise.reject(new Error(I));
                  if (typeof ((T = C.default) == null ? void 0 : T.mount) != "function") throw new gt(I);
                  return C.default;
                })(y), url: y };
              }
              if (typeof (f == null ? void 0 : f.mount) != "function") throw new gt("<definition>");
              return { definition: f, url: document.baseURI };
            })(this.source);
            return o.throwIfAborted(), this.resolved = i, i.definition;
          }
          async mount() {
            if (!this.resolved) throw new Error("CanvasScene.mount() called before resolve().");
            const { signal: o } = this.controller, { definition: i, url: f } = this.resolved;
            o.throwIfAborted();
            const y = i.renderRoot === "light" ? this.stage : this.stage.attachShadow({ mode: "open" });
            this.releaseStyles = (function(C, T, J3) {
              const q = (function(z, ut2) {
                let pt3 = ct2.get(z);
                return pt3 || (pt3 = (z.styles ?? []).map((Ot2) => {
                  if (typeof Ot2 != "string") return Ot2;
                  const Et = new CSSStyleSheet({ baseURL: ut2 });
                  return Et.replaceSync(Ot2), Et;
                }), ct2.set(z, pt3)), pt3;
              })(T, J3);
              return C instanceof ShadowRoot ? (C.adoptedStyleSheets = [...q, (V || (V = new CSSStyleSheet(), V.replaceSync(":host { position: absolute; inset: 0; }")), V)], () => {
              }) : (q.forEach(U), () => q.forEach(G2));
            })(y, i, f);
            const P2 = new k3(this.host, y, o, i, { ...this.callbacks, isRunning: () => this.running });
            this.context = P2;
            const I = await i.mount(P2.value);
            return o.aborted && (O2(I, false), o.throwIfAborted()), I ? (this.instance = I, true) : (this.destroy(), false);
          }
          setRunning(o) {
            var i;
            return !(!this.instance || o === this.running || (o ? this.instance.resume() : this.instance.pause(), this.running = o, o && ((i = this.context) == null || i.catchUpChannels()), 0));
          }
          updateContext() {
            var i, f;
            if (!this.instance || !this.context) return;
            const o = this.context.diff();
            o && ((f = (i = this.instance).update) == null || f.call(i, o));
          }
          destroy() {
            this.controller.abort();
            const o = this.running;
            this.running = false, O2(this.instance, o), this.instance = null, this.context = null, this.releaseStyles(), this.releaseStyles = () => {
            }, this.stage.remove();
          }
        }
        function O2(m2, o) {
          if (m2) {
            if (o) try {
              m2.pause();
            } catch (i) {
              lt2.error("Error pausing canvas scene before destroy:", i);
            }
            try {
              m2.destroy();
            } catch (i) {
              lt2.error("Error destroying canvas scene:", i);
            }
          }
        }
        const K3 = /* @__PURE__ */ new Map();
        function ot3(m2, o, i, f = 0) {
          const y = `${o}:${f}`, P2 = (function(I, C, T) {
            const J3 = K3.get(I);
            if (J3) return J3;
            const q = /* @__PURE__ */ new Map(), z = { observer: new IntersectionObserver((ut2) => {
              var pt3;
              for (const Ot2 of ut2) {
                const Et = Ot2.isIntersecting && (T <= 0 || Ot2.intersectionRatio >= T);
                (pt3 = q.get(Ot2.target)) == null || pt3(Et);
              }
            }, { rootMargin: C, threshold: T }), callbacks: q };
            return K3.set(I, z), z;
          })(y, o, f);
          return P2.callbacks.set(m2, i), P2.observer.observe(m2), () => {
            P2.callbacks.get(m2) === i && (P2.callbacks.delete(m2), P2.observer.unobserve(m2), P2.callbacks.size > 0 || (P2.observer.disconnect(), K3.delete(y)));
          };
        }
        const yt2 = /* @__PURE__ */ new Set(["autoplay", "hibernate", "data-poster-mode"]), xt3 = new d3("ABCCanvas");
        (N2 = class extends c {
          constructor() {
            super(...arguments);
            X(this, "scene", null);
            X(this, "explicitDefinition", null);
            X(this, "loadedDefinition", null);
            X(this, "failedSource", null);
            X(this, "declinedSource", null);
            X(this, "explicitPaused", null);
            X(this, "announcedPaused", true);
            X(this, "hasCurrentScenePlayed", false);
            X(this, "isNearViewport", false);
            X(this, "isInViewport", false);
            X(this, "isUpdateQueued", false);
            X(this, "unobserveViewport", []);
          }
          get src() {
            return this.getAttributeAsString("src", "");
          }
          set src(o) {
            this.setAttribute("src", o);
          }
          get definition() {
            return this.explicitDefinition ?? this.loadedDefinition;
          }
          set definition(o) {
            this.explicitDefinition !== o && (this.explicitDefinition = o, this.resetPlayback(), this.requestUpdate());
          }
          get autoplay() {
            return this.getAttributeAsBoolean("autoplay");
          }
          set autoplay(o) {
            this.toggleAttribute("autoplay", o);
          }
          get hibernate() {
            return this.getAttributeAsBoolean("hibernate");
          }
          set hibernate(o) {
            this.toggleAttribute("hibernate", o);
          }
          get priority() {
            return this.getAttributeAsBoolean("priority");
          }
          set priority(o) {
            this.toggleAttribute("priority", o);
          }
          get posterMode() {
            return this.getAttributeAsString("data-poster-mode", "eager") === "fallback" ? "fallback" : "eager";
          }
          set posterMode(o) {
            this.setAttribute("data-poster-mode", o);
          }
          get paused() {
            if (this.explicitPaused !== null) return this.explicitPaused;
            if (!this.autoplay) return true;
            const o = j2(this, this.definition);
            return !(!H() || o.reducedMotion) || !(!it2() || o.lowPower);
          }
          get state() {
            const o = this.scene;
            return o ? o.isMounted ? o.isRunning ? "running" : "ready" : "loading" : this.failedSource !== null ? "error" : "idle";
          }
          get wantedSource() {
            return this.isConnected ? this.explicitDefinition ?? this.src : "";
          }
          get shouldMountScene() {
            const o = j2(this, this.definition).poster && !L(this);
            return !this.paused || o;
          }
          get isPosterHidden() {
            var o, i;
            return this.posterMode === "eager" ? !!((o = this.scene) != null && o.isMounted) : !!((i = this.scene) != null && i.isMounted && this.hasCurrentScenePlayed) || !this.paused && this.failedSource === null && this.declinedSource === null;
          }
          play() {
            this.explicitPaused = false, this.requestUpdate();
          }
          pause() {
            this.explicitPaused = true, this.requestUpdate();
          }
          load() {
            this.unload(), this.resetPlayback(), this.requestUpdate();
          }
          attributeChangedCallback(o, i, f) {
            i !== f && (o === "src" ? this.resetPlayback() : yt2.has(o) || (this.declinedSource = null), this.requestUpdate());
          }
          connect() {
            this.observeViewport(), this.listen(document, "visibilitychange", () => this.requestUpdate());
            const o = () => {
              this.declinedSource = null, this.requestUpdate();
            };
            for (const i of [x2, R]) this.listen(window.matchMedia(i), "change", o);
            this.listen(window, "deepai:mode-change", o), this.requestUpdate();
          }
          disconnect() {
            this.unobserveViewport.forEach((o) => o()), this.unobserveViewport = [], this.requestUpdate();
          }
          requestUpdate() {
            this.isUpdateQueued || (this.isUpdateQueued = true, queueMicrotask(() => {
              this.isUpdateQueued = false, this.update();
            }));
          }
          update() {
            this.unloadStaleScene(), this.announceIntent(), this.loadWantedScene(), this.updateContext(), this.updatePlayback(), this.reflectState();
          }
          unloadStaleScene() {
            const o = this.scene;
            o && (o.source !== this.wantedSource || !this.isNearViewport && this.hibernate) && this.unload();
          }
          announceIntent() {
            const o = this.paused;
            o !== this.announcedPaused && (this.announcedPaused = o, this.emit(o ? "pause" : "play", { src: this.src }));
          }
          loadWantedScene() {
            if (this.scene) return;
            const o = this.wantedSource;
            o !== "" && o !== this.failedSource && o !== this.declinedSource && this.isNearViewport && this.shouldMountScene && this.loadScene(o);
          }
          updateContext() {
            const o = this.scene;
            if (o != null && o.isMounted) try {
              o.updateContext();
            } catch (i) {
              this.fail(o, i);
            }
          }
          updatePlayback() {
            const o = this.scene;
            if (!o) return;
            const i = o.isMounted && !this.paused && this.isInViewport && document.visibilityState === "visible";
            try {
              if (!o.setRunning(i)) return;
            } catch (f) {
              return void this.fail(o, f);
            }
            i ? (this.hasCurrentScenePlayed = true, this.emit("playing", { src: o.src })) : this.paused || this.emit("waiting", { src: o.src });
          }
          reflectState() {
            this.toggleAttribute("data-poster-hidden", this.isPosterHidden);
            const o = this.state, i = this.dataset.state;
            i !== o && (this.dataset.state = o, i && xt3.debug(`${i} -> ${o}`, { src: this.src, element: this }));
          }
          async loadScene(o) {
            const i = new Q2(o, this, { onMessage: (y, P2) => this.emit("message", { src: i.src, type: y, data: P2 }), onError: (y) => this.fail(i, y) });
            this.scene = i, this.emit("loadstart", { src: i.src });
            let f = false;
            try {
              this.loadedDefinition = await i.resolve(), this.shouldMountScene && (f = await i.mount());
            } catch (y) {
              return void (this.scene === i && this.fail(i, y));
            }
            f ? (this.emit("load", { src: i.src }), this.requestUpdate()) : this.scene === i && (this.shouldMountScene && (this.declinedSource = i.source), this.unload(), this.requestUpdate());
          }
          fail(o, i) {
            xt3.error(`Canvas scene at ${o.src || "<definition>"} failed:`, i), this.failedSource = o.source, this.destroyScene(), this.emit("error", { src: o.src, error: i }), this.requestUpdate();
          }
          unload() {
            const o = this.scene;
            if (!o) return;
            const i = o.isMounted ? "unload" : "abort";
            this.destroyScene(), this.emit(i, { src: o.src });
          }
          destroyScene() {
            const o = this.scene;
            this.scene = null, this.hasCurrentScenePlayed = false, o == null || o.destroy();
          }
          resetPlayback() {
            this.loadedDefinition = null, this.explicitPaused = null, this.failedSource = null, this.declinedSource = null, this.hasCurrentScenePlayed = false;
          }
          observeViewport() {
            this.unobserveViewport = [ot3(this, "100%", (o) => {
              this.isNearViewport = o, this.requestUpdate();
            }), ot3(this, "0px", (o) => {
              this.isInViewport = o, this.requestUpdate();
            }, 0.15)];
          }
        }, X(N2, "tagName", "abc-canvas"), X(N2, "observedAttributes", ["src", "autoplay", "hibernate", "priority", "data-poster-mode", "data-capabilities-color-modes", "data-capabilities-poster", "data-capabilities-reduced-motion", "data-capabilities-low-power"]), N2).register();
      })();
      Ln = /^#(?:[\da-f]{3}){1,2}$/i;
      an = /^\d{4}-\d\d-\d\d$/;
      In = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
      Fn = Object.freeze({ current: void 0, subscribe: () => () => {
      } });
      Xn = [["tier_l", "Model Tier L"], ["tier_m", "Model Tier M"], ["tier_s", "Model Tier S"], ["tier_xs", "Model Tier XS"]];
      Nn = [["carbon", "3D Element: Carbon"], ["motif", "2D Motif (Text or :symbol)"], ["none", "None (Gradient & Particles Only)"]];
      Un = [["interactive", "Pointer Reactive (Tilt / Blur / Repel)"], ["orbit", "3D Drag Orbit + Pointer Reactive"], ["off", "Off (Ambient Only)"]];
      Gn = [["float", "Gentle 3D Float & Sway"], ["orbit", "Continuous 3D Turntable"], ["still", "Poised Still + Pointer Tilt"]];
      zn = [["gas", "Gas (Evaporating Mist)"], ["blur", "Progressive Blur"]];
      Vn = [["halo", "Focal Halo (Around Centerpiece)"], ["scatter", "Wide Drift (Soft 2D Float)"], ["x_step", "Scattered X-Step (Carbon Grid)"]];
      Hn = { palette: { type: "choice", label: "Brand Tonal Palette", description: "Selects the Gemini 4 tonal brand background (Model Tiers L, M, S, and XS).", choices: Xn, default: "tier_l" }, gradient_motion: { type: "number", label: "Gradient Motion", description: "Volumetric diagonal wave and orbital breathing intensity (0 = static poster, 75 = studio default).", default: 75, min: 0, max: 100, step: 1 }, gradient_softness: { type: "number", label: "Gradient Softness", description: "Atmospheric spread and blend radius across the volumetric Gaussian colour lobes (80 = studio default).", default: 80, min: 15, max: 100, step: 1 }, gradient_bloom: { type: "number", label: "Gradient Bloom", description: "Highlight intensity of the upper-right volumetric bloom and lower-right rim lobes (20 = studio default).", default: 20, min: 0, max: 100, step: 1 }, grain: { type: "number", label: "Film Grain", description: "Screen-space 1px TPDF photographic film grain intensity (35 = studio default).", default: 35, min: 0, max: 100, step: 1 }, grain_animate: { type: "boolean", label: "Animate Film Grain", description: "Adds a subtle low-framerate organic shimmer over an anchored base grain texture while playing (stays static when paused).", default: false }, grain_fps: { type: "number", label: "Grain Cadence (FPS)", description: "Independent stepped frame rate for animated film grain while the main scene runs at 60/120 Hz (6\u20138 FPS = subtle tactile texture).", default: 8, min: 1, max: 24, step: 1 }, focal: { type: "choice", label: "Focal Layer", description: "Selects a 3D periodic-element crystal, a 2D gaseous/blurred motif, or no focal centerpiece.", choices: Nn, default: "carbon" }, focal_scale: { type: "number", label: "Focal Scale (%)", description: "Overall scale of the active 3D crystal or 2D motif.", default: 100, min: 40, max: 180, step: 1 }, focal_offset_x: { type: "number", label: "Focal Offset X (%)", description: "Horizontal framing offset of the focal layer (-50..50%).", default: 0, min: -50, max: 50, step: 1 }, focal_offset_y: { type: "number", label: "Focal Offset Y (%)", description: "Vertical framing offset of the focal layer (-50..50%).", default: 0, min: -50, max: 50, step: 1 }, seed: { type: "integer", label: "Variation Seed", description: "Seeds crystal cleavage geometry, internal fractures/flecks, and particle constellations (12 = reference).", default: 12, min: 1, max: 99, step: 1 }, motion_speed: { type: "number", label: "Motion Speed", description: "Speed of crystal movement, motif evaporation, and particle drift (0 = poised still).", default: 35, min: 0, max: 100, step: 1 }, interaction: { type: "choice", label: "Pointer Interaction", description: "Hover reactivity (crystal tilt & phase response, motif smoke/blur, particle repel), 360\xB0 drag orbit, or ambient-only.", choices: Un, default: "interactive" }, interaction_effect: { type: "number", label: "Pointer Effect Intensity", description: "Scales the per-element pointer phase effect (Carbon prismatic flare & micro-shards, Motif smoke/blur).", default: 65, min: 0, max: 100, step: 1 }, interaction_tilt: { type: "number", label: "Pointer Tilt", description: "Scales physical 3D crystal tilt and 2D motif parallax in response to pointer movement.", default: 55, min: 0, max: 100, step: 1 }, interaction_tilt_invert: { type: "boolean", label: "Invert Pointer Tilt Axes", description: "Flips horizontal and vertical 3D crystal pointer-tilt axes (enabled: pointer left tilts right and up tilts down; disabled: tilts toward pointer).", default: true }, interaction_ripple: { type: "boolean", label: "Click / Tap Ripple & Pulse", description: "Emits a surface wave ripple and per-element click response (Motif vapor ring or Carbon prismatic cleavage wave) on click or tap.", default: true }, crystal_motion: { type: "choice", label: "Crystal Motion Mode", description: "Gentle 3D levitation & sway, continuous 360\xB0 turntable orbit, or poised still.", choices: Gn, default: "float" }, crystal_tilt: { type: "number", label: "Crystal Roll Offset (\xB0)", description: "In-plane roll rotation offset added to the element crystal canonical pose.", default: 0, min: -45, max: 45, step: 1 }, crystal_yaw: { type: "number", label: "Crystal Yaw Offset (\xB0)", description: "Base 3D Y-axis rotation offset in degrees.", default: 0, min: -180, max: 180, step: 1 }, crystal_dof: { type: "number", label: "Camera Depth of Field", description: "Macro shallow Depth-of-Field blur on receding contours, surface micro-facets, and deep inclusions.", default: 55, min: 0, max: 100, step: 1 }, crystal_fog: { type: "number", label: "Camera Depth Fog", description: "Aerial mist & contrast attenuation on receding 3D crystal regions so distant flanks fade softly into the backdrop.", default: 55, min: 0, max: 100, step: 1 }, crystal_bloom: { type: "number", label: "Camera Lens Bloom", description: "Directional optical lens halation bleeding outward from backlit rims and bright specular ridges.", default: 55, min: 0, max: 100, step: 1 }, crystal_refraction: { type: "number", label: "Crystal Refraction & Glow", description: "Scales internal 3D facet refraction, chromatic dispersion, TIR caustics, and subsurface glow.", default: 65, min: 0, max: 100, step: 1 }, crystal_detail: { type: "number", label: "Surface & Fracture Detail", description: "Scales organic conchoidal mineral chipping, crystalline surface texture, and internal micro-fractures.", default: 70, min: 0, max: 100, step: 1 }, motif: { type: "string", label: "Motif Text or :Symbol", description: 'Text string (e.g. "4", "Gemini") or ":"-prefixed Google Symbol (e.g. ":spark", ":shield", ":shield:fill").', default: "4" }, motif_style: { type: "choice", label: "Motif Optical Style", description: "Gas (domain-warped FBM & curl evaporation) or Blur (progressive radial lens blur).", choices: zn, default: "gas" }, motif_opacity: { type: "number", label: "Motif Opacity (%)", description: "Opacity percentage of the 2D motif.", default: 40, min: 5, max: 100, step: 1 }, motif_diffusion: { type: "number", label: "Motif Idle Evaporation / Blur", description: "Autonomous idle gaseous evaporation or progressive lens blur intensity (0..100, default 100).", default: 100, min: 0, max: 100, step: 1 }, motif_flow_speed: { type: "number", label: "Motif Evaporation Flow Speed", description: "Flow speed of the motif evaporation or progressive blur orbit (0..200, default 20).", default: 20, min: 0, max: 200, step: 1 }, particles: { type: "boolean", label: 'Show "4" Particles', description: 'Displays the scattered "4" glyph constellation layer.', default: true }, particle_mode: { type: "choice", label: "Particle Mode", description: "Focal Halo frames the centerpiece with soft depth drift; Wide Drift floats across the stage; Scattered X-Step tiles the stage and slides along the X-axis.", choices: Vn, default: "x_step" }, particle_seed: { type: "integer", label: "Particle Seed", description: 'Independent seed for the "4" particle constellation (0 = follow Variation Seed / canonical layout; 1..99 = custom variant).', default: 0, min: 0, max: 99, step: 1 }, particle_density: { type: "number", label: "Particle Density", description: 'Controls the density of "4" particles across the active arrangement.', default: 45, min: 10, max: 100, step: 1 }, particle_opacity: { type: "number", label: "Particle Opacity (%)", description: 'Overall opacity of the "4" particle constellation.', default: 85, min: 5, max: 100, step: 1 }, particle_reactivity: { type: "number", label: "Particle Dodge Reactivity", description: 'How strongly and quickly "4" particles dodge or repel from the cursor (0 = off).', default: 85, min: 0, max: 100, step: 1 }, particle_dodge_radius: { type: "number", label: "Particle Dodge Radius", description: "Cleared cursor radius in reference pixels around the pointer (20..150, default 48).", default: 48, min: 20, max: 150, step: 1 } };
      qn = ":host{display:block;width:100%;height:100%;overflow:hidden}canvas{display:block;width:100%;height:100%;touch-action:pan-y}canvas[data-orbit=true]{cursor:grab;touch-action:none}canvas[data-orbit=true]:active{cursor:grabbing}";
      zt = 9;
      F4 = (t, e, n) => [t / 255, e / 255, n / 255];
      Ct = (t) => [(t >> 16 & 255) / 255, (t >> 8 & 255) / 255, (t & 255) / 255];
      $n = { tier_l: { id: "tier_l", label: "Model Tier L", default: { softScale: 1 / 1.34, beamRange: [1, 1.22], corners: { topLeft: F4(32.1, 69, 161.1), topRight: F4(129, 217.7, 252.2), bottomLeft: F4(9.8, 36, 78), bottomRight: F4(0, 32.5, 135.9) }, lobes: [$2(F4(14, 68, 162), [0.681, 0.203], [0.329, 0.349], 1.117, 0.662, true), $2(F4(115.9, 206.6, 255), [0.945, 0.144], [0.388, 0.42], 0.033, 0.712, true), $2(F4(0, 66.2, 252.1), [0.853, 0.693], [0.55, 0.729], -0.437, 0.334, true), $2(F4(3, 34, 112), [0.308, 0.57], [0.444, 0.414], -0.062, 0.86, false), $2(F4(2, 18, 62), [0.21, 0.825], [0.393, 0.619], -0.689, 0.8, false), $2(F4(2, 22, 72), [0.658, 0.941], [0.491, 0.395], -0.359, 0.72, false), $2(F4(83.5, 208.7, 255), [1.173, 0.898], [0.242, 0.808], 0.033, 0.96, true)], particleTint: Ct(16054783), motifCoreTint: Ct(16054783), motifGlowTint: Ct(7649535), isLightBackdrop: false } }, tier_m: { id: "tier_m", label: "Model Tier M", default: { softScale: 1 / 1.34, beamRange: [1, 1.2], corners: { topLeft: F4(53.8, 90.2, 209.3), topRight: F4(174.3, 246.4, 255), bottomLeft: F4(0, 77, 137.1), bottomRight: F4(0, 88.6, 255) }, lobes: [$2(F4(21.2, 158.5, 255), [0.409, 0.022], [0.324, 0.499], 0.579, 0.96, true), $2(F4(150.7, 205.5, 250.8), [0.483, -0.023], [0.451, 0.233], -0.856, 0.96, true), $2(F4(209.1, 249.4, 255), [0.949, 0.25], [0.349, 0.547], -0.072, 0.897, true), $2(F4(69.8, 189.2, 255), [0.618, 0.501], [0.22, 0.599], 0.103, 0.834, true), $2(F4(0, 52.5, 165.6), [0.321, 0.639], [0.409, 0.318], 0.696, 0.958, false), $2(F4(2, 23, 82), [0.19, 0.845], [0.291, 0.489], -0.377, 0.935, false), $2(F4(0, 27, 102), [0.665, 0.939], [0.484, 0.308], -0.271, 0.934, false), $2(F4(13.4, 182.2, 238.3), [-0.069, 1.128], [0.85, 0.22], 0.175, 0.801, false), $2(F4(61.6, 212.7, 255), [1.055, 0.843], [0.22, 0.584], -0.047, 0.833, true)], particleTint: Ct(16777215), motifCoreTint: Ct(16777215), motifGlowTint: Ct(12903935), isLightBackdrop: false } }, tier_s: { id: "tier_s", label: "Model Tier S", default: { softScale: 1 / 1.34, beamRange: [1, 1.19], corners: { topLeft: F4(56, 148, 236), topRight: F4(206, 246, 255), bottomLeft: F4(8, 56, 146), bottomRight: F4(18, 96, 214) }, lobes: [$2(F4(84, 184, 248), [0.42, 0.08], [0.42, 0.39], 0.42, 0.9, true), $2(F4(224, 250, 255), [0.935, 0.195], [0.38, 0.5], -0.14, 0.9, true), $2(F4(86, 186, 252), [0.665, 0.445], [0.29, 0.54], -0.18, 0.86, true), $2(F4(36, 118, 218), [0.315, 0.535], [0.41, 0.35], 0.54, 0.9, false), $2(F4(60, 155, 242), [0.515, 0.485], [0.33, 0.36], -0.36, 0.78, true), $2(F4(7, 54, 144), [0.22, 0.855], [0.36, 0.44], -0.35, 0.92, false), $2(F4(11, 62, 152), [0.64, 0.94], [0.49, 0.31], -0.25, 0.91, false), $2(F4(104, 216, 255), [1.06, 0.82], [0.24, 0.56], -0.06, 0.84, true)], particleTint: Ct(16777215), motifCoreTint: Ct(16777215), motifGlowTint: Ct(14217471), isLightBackdrop: false } }, tier_xs: { id: "tier_xs", label: "Model Tier XS", default: { softScale: 1 / 1.34, beamRange: [1, 1.18], corners: { topLeft: F4(118, 198, 252), topRight: F4(246, 253, 255), bottomLeft: F4(42, 124, 206), bottomRight: F4(96, 184, 246) }, lobes: [$2(F4(176, 232, 255), [0.49, 0.09], [0.46, 0.34], -0.28, 0.92, true), $2(F4(250.5, 253.5, 255), [0.895, 0.185], [0.44, 0.45], -0.38, 0.92, true), $2(F4(232, 248, 255), [0.695, 0.335], [0.38, 0.3], -0.44, 0.85, true), $2(F4(148, 212, 253.5), [0.535, 0.515], [0.45, 0.28], -0.37, 0.88, true), $2(F4(96, 186, 252), [0.31, 0.495], [0.39, 0.32], 0.26, 0.88, false), $2(F4(44, 126, 208), [0.225, 0.875], [0.39, 0.38], -0.34, 0.9, false), $2(F4(56, 142, 218), [0.585, 0.945], [0.48, 0.27], -0.24, 0.86, false), $2(F4(168, 228, 255), [1.02, 0.76], [0.32, 0.48], -0.42, 0.88, true)], particleTint: Ct(2121936), motifCoreTint: Ct(16777215), motifGlowTint: Ct(7647999), isLightBackdrop: true } } };
      jn = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;
      Kn = `
uniform vec2 u_bgViewScale;              // 16:9 cover camera scale
uniform vec2 u_bgPreOffset;              // flowOffset - shift * 0.55
uniform vec3 u_bgRotZoom;                // x = cos(rot), y = sin(rot), z = 1.0 / zoom
uniform vec2 u_bgPostCenter;             // vec2(0.5) - focusShift
uniform vec4 u_bgWave;                   // x = phaseRad, y = rayAmp, z = crossAmp, w = stageAspect
uniform vec4 u_bgTap;                    // xy = tap screenUv (top-left), z = tapAgeSec, w = tapStrength
uniform vec3 u_bgCorners[4];             // 0: topLeft, 1: topRight, 2: bottomLeft, 3: bottomRight
uniform int u_bgLobeCount;
uniform vec3 u_bgLobeColors[9];
uniform vec4 u_bgLobeCentersInvRadii[9]; // xy = center, zw = sqrt(2.0) / (radii * effSoft)
uniform vec2 u_bgLobeCosSin[9];          // x = cos(angle), y = sin(angle)
uniform vec2 u_bgLobeParams[9];          // x = effectiveGain, y = maxAlpha

float bgRotBellSq(vec2 p, vec2 c, vec2 invRSqrt2, vec2 cs) {
  vec2 d = p - c;
  vec2 q = vec2(cs.x * d.x + cs.y * d.y, -cs.y * d.x + cs.x * d.y) * invRSqrt2;
  return dot(q, q);
}

vec3 sampleTonalGradient(vec2 screenUv, vec2 ptrOffset) {
  vec2 p = (screenUv - 0.5) * u_bgViewScale + 0.5;
  float tapCrest = 0.0;

  if (u_bgTap.w > 0.001 && u_bgTap.z < 3.8) {
    vec2 fromTapIso = vec2((screenUv.x - u_bgTap.x) * u_bgWave.w, screenUv.y - u_bgTap.y);
    float dTap = length(fromTapIso);
    float onset = smoothstep(0.0, 0.03, u_bgTap.z);
    float damp = exp(-u_bgTap.z * 2.4) * onset * u_bgTap.w;
    float wave = sin(dTap * 35.0 - u_bgTap.z * 7.0) * damp;
    vec2 tapScene = (u_bgTap.xy - 0.5) * u_bgViewScale + 0.5;
    p += normalize(p - tapScene + vec2(0.00001)) * (wave * 0.0028);
    // Subtle traveling caustic packet keeps the wave perceptible across deep nocturnal basins
    float front = 0.02 + 0.68 * (1.0 - exp(-u_bgTap.z * 1.45));
    float pktQ = (dTap - front) / (0.16 + u_bgTap.z * 0.08);
    float packet = exp(-pktQ * pktQ);
    tapCrest = wave * packet * 0.016;
  }

  p += vec2(ptrOffset.x, -ptrOffset.y) * u_bgViewScale * 0.018 + u_bgPreOffset;
  mat2 rotM = mat2(u_bgRotZoom.x, -u_bgRotZoom.y, u_bgRotZoom.y, u_bgRotZoom.x);
  vec2 pSky = rotM * (p - 0.5) * u_bgRotZoom.z + u_bgPostCenter;

  float diagCoord = pSky.x * 0.78 + pSky.y * 0.62;
  float rayDrift = sin(u_bgWave.x + diagCoord * 2.6) * u_bgWave.y;
  vec2 pWave = pSky + vec2(rayDrift, -rayDrift * 0.75);
  if (u_bgWave.z > 0.00001) {
    float crossCoord = pSky.x * 0.62 - pSky.y * 0.78;
    float crossDrift = cos(u_bgWave.x * 2.0 - crossCoord * 3.1) * u_bgWave.z;
    pWave += vec2(crossDrift, crossDrift * 0.65);
  }

  // 1. 4-corner bilinear atmospheric base canvas
  float pxClamped = clamp(pWave.x, 0.0, 1.0);
  vec3 topRow = mix(u_bgCorners[0], u_bgCorners[1], pxClamped);
  vec3 botRow = mix(u_bgCorners[2], u_bgCorners[3], pxClamped);
  vec3 col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));

  // 2. Multi-lobe rotated Gaussian volumetric colour field
  for (int i = 0; i < 9; i++) {
    if (i >= u_bgLobeCount) break;
    vec4 cr = u_bgLobeCentersInvRadii[i];
    float q2 = bgRotBellSq(pWave, cr.xy, cr.zw, u_bgLobeCosSin[i]);
    if (q2 > 9.2) continue;
    vec2 pr = u_bgLobeParams[i];
    float lobeAlpha = min(exp(-q2) * pr.x, pr.y);
    col = mix(col, u_bgLobeColors[i], lobeAlpha);
  }

  if (tapCrest != 0.0) {
    vec3 waveTint = mix(u_bgCorners[1], vec3(0.72, 0.92, 1.0), 0.35);
    col = clamp(col + (waveTint - col * 0.35) * tapCrest, 0.0, 1.0);
  }
  return col;
}
`;
      de2 = 512;
      se = 15;
      Jn = Math.SQRT2;
      De = 0.5;
      ke = 0.26;
      ln = 0.75;
      un = 0.68;
      dn = ln - De;
      fn = un - ke;
      to = Math.atan2(fn, dn);
      eo = Math.hypot(dn, fn);
      Ae = null;
      oo = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_res;
uniform vec2 u_pointer;
uniform float u_grain;
uniform vec4 u_grainOffset;
uniform vec2 u_grainOffsetNext;
uniform vec3 u_grainWeights;
uniform sampler2D u_noiseMap;

${Kn}

float smooth01(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  vec2 screenUv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 ptrOffset = u_pointer - 0.5;

  vec3 col = sampleTonalGradient(screenUv, ptrOffset);

  // Sub-bit TPDF Interleaved Gradient Noise dither eliminates 8-bit Mach banding
  float ign1 = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float ign2 = fract(52.9829189 * fract(dot(gl_FragCoord.xy + vec2(17.3, 31.7), vec2(0.06711056, 0.00583715))));
  vec3 dither = vec3(
    ign1 - ign2,
    (ign2 - 0.5) + (ign1 - 0.5),
    fract(ign1 + 0.37) - fract(ign2 + 0.73)
  ) * (1.35 / 255.0);

  // Screen-space pixel-locked TPDF film grain with prime tile-ID decorrelation
  if (u_grain > 0.001) {
    float pxScale = max(1.0, max(u_res.x, u_res.y) / 2560.0);
    vec2 grainPx = floor(gl_FragCoord.xy / pxScale);
    vec2 tileId = floor(grainPx / 512.0);
    vec2 tileShift = floor(vec2(tileId.x * 173.0 + tileId.y * 311.0, tileId.x * 257.0 - tileId.y * 139.0));
    vec2 noiseUV1 = (grainPx + u_grainOffset.xy + 0.5) / 512.0;
    vec2 noiseUV2 = (grainPx + u_grainOffset.zw + tileShift + 0.5) / 512.0;
    float n1 = texture(u_noiseMap, noiseUV1).r - 0.5;
    float n2 = texture(u_noiseMap, noiseUV2).g - 0.5;
    float grainSignal = n1 * u_grainWeights.x + n2 * u_grainWeights.y;
    if (u_grainWeights.z > 0.0001) {
      vec2 noiseUV3 = (grainPx + u_grainOffsetNext + tileShift + 0.5) / 512.0;
      float n3 = texture(u_noiseMap, noiseUV3).g - 0.5;
      grainSignal += n3 * u_grainWeights.z;
    }
    float grainAmp = u_grain * 0.24; // grain = 35 (0.35) -> 0.084 (= 35 * 0.0024 in Studio)
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float lumShift = -0.30 * smooth01(0.92, 0.995, lum) + 0.30 * smooth01(0.08, 0.005, lum);
    col = clamp(col + vec3((grainSignal + lumShift) * grainAmp), 0.0, 1.0);
  }

  outColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
}
`;
      He = /* @__PURE__ */ new WeakMap();
      qt2 = new Float32Array(zt * 4);
      Ee = new Float32Array(zt * 2);
      so = { shiftX: 0, shiftY: 0, rotCos: 1, rotSin: 0, zoom: 1, invZoom: 1 };
      Re = /* @__PURE__ */ new Map();
      fe2 = 0.76;
      je = Math.sqrt(2 * 0.65 * 0.65 - fe2 * fe2);
      uo = { ox1: 0, oy1: 0, ox2: 0, oy2: 0, nextOx2: 0, nextOy2: 0, wBase: 0.65, wCurr: 0.65, wNext: 0 };
      Ye = 64;
      Te = null;
      Zt2 = 600;
      At = 608;
      Nt = 10.484 * (At / 836);
      Yt = 0.75 * Nt;
      bo = 1;
      go = 0.95 * Nt;
      yo = 0.382;
      $t2 = 1280;
      jt2 = new Uint16Array([252, 42, 574, 44, 536, 46, 1183, 56, 861, 57, 895, 62, 932, 66, 609, 68, 1148, 72, 285, 76, 38, 91, 322, 114, 216, 129, 1114, 148, 502, 153, 824, 153, 968, 163, 178, 165, 789, 171, 396, 173, 364, 189, 643, 192, 680, 253, 144, 279, 756, 283, 466, 305, 74, 310, 1072, 317, 431, 361, 755, 368, 1038, 385, 1002, 397, 1035, 426, 722, 468, 108, 498, 397, 505, 1002, 559, 713, 581, 73, 611, 112, 617, 317, 617, 432, 640, 37, 699, 1112, 701, 1074, 708, 677, 709, 966, 723, 40, 776, 355, 780, 356, 811, 469, 859, 71, 862, 645, 861, 675, 863, 932, 883, 791, 887, 389, 931, 319, 949, 607, 955, 107, 999, 713, 999, 894, 1039, 827, 1051, 1148, 1051, 429, 1054, 1034, 1058, 574, 1071, 287, 1072, 1182, 1075, 747, 1103, 145, 1107, 249, 1123, 861, 1139, 1071, 1141, 1186, 1145, 465, 1146, 535, 1157, 1146, 1160, 787, 1161, 177, 1163, 215, 1167, 824, 1167, 503, 1173, 1105, 1173]);
      le = jt2.length >> 1;
      he2 = 320;
      Je = 96;
      wo = `#version 300 es
precision highp float;

layout(location = 0) in vec4 a_particle; // xy = screen pos [0..1] top-left, z = halfSizePx, w = alpha
layout(location = 1) in float a_blur;    // optical DoF softness [0..1]

uniform vec2 u_res;

out vec2 v_tc;
out float v_alpha;
out float v_blur;

void main() {
  int vid = gl_VertexID & 3;
  vec2 corner = vec2(float(vid & 1), float((vid >> 1) & 1)); // (0,0), (1,0), (0,1), (1,1)
  v_tc = corner;
  v_alpha = a_particle.w;
  v_blur = a_blur;

  vec2 centerPx = vec2(a_particle.x * u_res.x, (1.0 - a_particle.y) * u_res.y);
  // Flip corner.y so v_tc.y = 0 maps to top of glyph and v_tc.y = 1 maps to bottom
  vec2 offsetPx = vec2(corner.x - 0.5, 0.5 - corner.y) * (a_particle.z * 2.0);
  vec2 clip = ((centerPx + offsetPx) / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;
      _o = `#version 300 es
precision highp float;

in vec2 v_tc;
in float v_alpha;
in float v_blur;

uniform sampler2D u_sdfTex;
uniform vec3 u_tint;

out vec4 outColor;

void main() {
  float sdf = texture(u_sdfTex, v_tc).r;
  // Screen-space derivative gives crisp 1px AA when v_blur = 0, widening smoothly for DoF depth particles
  float aa = max(0.012, fwidth(sdf) * 0.92) + v_blur * 0.11;
  float mask = smoothstep(0.5 - aa, 0.5 + aa * 0.65, sdf);
  float a = mask * v_alpha;
  if (a <= 0.002) discard;
  // Premultiplied alpha output
  outColor = vec4(u_tint * a, a);
}
`;
      nn = Math.PI / 180;
      ue2 = 120;
      Oe = 15;
      on = 3.8;
      Xt2 = Math.PI * 2 / ue2;
      Co = Qn({ id: "gemini-4-elements", setup(t) {
        const e = t.createVertexArray();
        if (!e) return null;
        const n = lo(t);
        if (!n) return t.deleteVertexArray(e), null;
        const c = Ro(t);
        return c ? { emptyVao: e, gradientPass: n, particlePass: c } : ($e(t, n), t.deleteVertexArray(e), null);
      }, dispose(t, e) {
        To(t, e.particlePass), $e(t, e.gradientPass), t.deleteVertexArray(e.emptyVao);
      } });
      Le = { tapNdcX: 0, tapNdcY: 0, age: 10, strength: 0 };
      rn = { wake0X: 0, wake0Y: 0, wake1X: 0, wake1Y: 0, wake2X: 0, wake2Y: 0, velX: 0, velY: 0, speed01: 0, strength: 0 };
      Oo = { x: 0.5, y: 0.5, age: 10, strength: 0 };
      Io = Bn({ styles: [qn], capabilities: { colorModes: ["light", "dark"], poster: true, lowPower: true }, defaults: { aspectRatio: "16-9", hibernate: true, isPresentational: true }, loop: { durations: [3, 4, 5, 6, 10, 15], defaultSeconds: 4 }, config: Hn, async mount(t) {
        const e = t.config, n = e.seed, c = new AbortController(), { signal: a2 } = c, l = a2, d3 = e.interaction !== "off", p = d3 ? e.interaction_tilt / 55 : 0, h = d3 ? e.interaction_effect / 65 : 0;
        let s = null, S = null, v = null, b = null;
        if (e.focal === "carbon") {
          const [{ carbonSpec: Y2 }, B3] = await Promise.all([Promise.resolve().then(() => (init_carbon_CpW_bJkR(), __toCommonJS(carbon_CpW_bJkR_exports))), Promise.resolve().then(() => (init_harness_VbPrAQ_R(), __toCommonJS(harness_VbPrAQ_R_exports)))]);
          t.signal.throwIfAborted(), s = Lo(Y2, n, B3);
        } else if (e.focal === "motif") {
          const Y2 = Wn(e.motif), B3 = await Promise.resolve().then(() => (init_index_viUVYb1p(), __toCommonJS(index_viUVYb1p_exports))), tt = typeof ShadowRoot < "u" && t.root instanceof ShadowRoot ? t.root.host : t.root, rt2 = (tt == null ? void 0 : tt.clientWidth) || 1280, ht2 = (tt == null ? void 0 : tt.clientHeight) || 720, Z2 = () => typeof window < "u" && window.innerWidth > 0 && window.innerHeight > 0 ? Math.min(window.innerWidth, window.innerHeight) : void 0, bt3 = B3.selectMotifQualityTier({ lowPower: t.lowPower, cssWidth: rt2, cssHeight: ht2, viewportMinEdge: Z2() });
          let dt3 = await B3.prepareMotifAsset(Y2, bt3, t.signal, t.root);
          t.signal.throwIfAborted();
          const ft2 = e.focal_scale / 100, St = e.focal_offset_x / 100, Mt = e.focal_offset_y / 100, Tt = e.motif_opacity / 100, wt2 = e.motif_diffusion / 100, _t3 = e.motif_flow_speed, Lt = d3 ? Math.min(1.6, e.interaction_effect / 65 * (75 / 54)) : 0, st3 = { asset: dt3, style: e.motif_style, scale: ft2, offsetX: St, offsetY: Mt, opacity01: Tt, diffusion01: wt2, motifPhase01: 0, motionGate: 0, flowSpeed: _t3, cursorTopLeftX: 0.5, cursorTopLeftY: 0.5, cursorActive: 0, tapTopLeftX: 0.5, tapTopLeftY: 0.5, tapAge: 10, tapStrength: 0, gradientSpec: re(e.palette, t.colorMode) };
          S = (Pt2, kt, Bt2, Gt, Ht2, xe, Me, ie, we, _e, Mn, wn, _n, Pn, An, En) => {
            st3.asset = dt3, st3.motifPhase01 = xe, st3.motionGate = Me, st3.flowSpeed = En ?? _t3, st3.cursorTopLeftX = ie, st3.cursorTopLeftY = we, st3.cursorActive = _e * Lt, st3.tapTopLeftX = Mn, st3.tapTopLeftY = wn, st3.tapAge = _n, st3.tapStrength = Pn, st3.gradientSpec = An, B3.drawMotifFocal(Pt2, kt, Bt2, Gt, Ht2, st3);
          };
          let vt2 = false;
          v = (Pt2, kt, Bt2) => {
            dt3.tier === "high" || vt2 || B3.selectMotifQualityTier({ lowPower: Bt2, cssWidth: Pt2, cssHeight: kt, viewportMinEdge: Z2() }) !== "high" || (vt2 = true, B3.prepareMotifAsset(Y2, "high", l, t.root).then((Ht2) => {
              l.aborted || (dt3 = Ht2, Wt2(0));
            }).catch(() => {
            }).finally(() => {
              vt2 = false;
            }));
          }, b = async (Pt2, kt) => {
            if (!(dt3.tier === "high" || Math.max(Pt2, kt) < 960)) try {
              const Bt2 = await B3.prepareMotifAsset(Y2, "high", l, t.root);
              l.aborted || (dt3 = Bt2);
            } catch {
            }
          };
        }
        const r = document.createElement("canvas");
        r.setAttribute("aria-hidden", "true");
        const u = e.interaction === "orbit" && s !== null;
        u && r.setAttribute("data-orbit", "true"), t.root.append(r);
        let M = t.colorMode, _2 = t.lowPower;
        const A = e.gradient_motion / 100, w2 = e.gradient_softness, g2 = e.gradient_bloom, x2 = e.grain / 100, R = e.focal_scale / 100, D = e.focal_offset_x / 100, k3 = e.focal_offset_y / 100, L = e.motion_speed / 100, j2 = e.crystal_tilt * nn, W = e.crystal_yaw * nn, H = e.crystal_dof / 100, it2 = e.crystal_fog / 100, at2 = e.crystal_bloom / 100, nt3 = e.crystal_refraction / 100, ct2 = e.crystal_detail / 100, et2 = e.particle_opacity / 100, V = e.particles ? tn({ seed: n, particleSeed: e.particle_seed, mode: e.particle_mode, density: e.particle_density, focalScalePct: e.focal_scale, focalOffsetX: e.focal_offset_x, focalOffsetY: e.focal_offset_y, reactivity: e.particle_reactivity, dodgeRadius: e.particle_dodge_radius }) : null;
        let U = 1, G2 = 1, lt2 = 0.5, gt = 0.5, Q2 = 0.5, O2 = 0.5, K3 = 0, ot3 = 0, yt2 = 0.5, xt3 = 0.5, E = 0.5, N2 = 0.5, m2 = false, o = 0, i = 0.5, f = 0.5, y = 10;
        const P2 = { x: 0.5, y: 0.5, age: 10, strength: 0 }, I = { softness: w2, bloom: g2, focusX: 0.5, focusY: 0.5, focusAmount: 0, tap: P2 };
        let C = false, T = 0, J3 = 0;
        const q = L > 1e-3 && e.motif_flow_speed > 1e-3;
        let z = 0, ut2 = 0, pt3 = 0, Ot2 = 0, Et = false, Ft = 0, Kt2 = 0, be = 0;
        const ge = [0.5, 0.5], Rt = n === 12 ? 0 : n * 0.381966011 % 1 * Math.PI * 2, ye2 = Math.sin(Rt), gn = Math.sin(0.6 + Rt), Be = Math.sin(Rt * 0.5), yn = Math.sin(Rt + 0.38), Sn = Math.sin(Rt - 0.55), Se = { spec: re(e.palette, M), viewScaleX: 1, viewScaleY: 1, shiftX: 0, shiftY: 0, flowOffsetX: 0, flowOffsetY: 0, rotCos: 1, rotSin: 0, zoom: 1, invZoom: 1, focusShiftX: 0, focusShiftY: 0, phaseRad: 0, rayAmp: 0, crossAmp: 0, effSoft: 1, effBeam: 1, stageAspect: 16 / 9, tapX: 0.5, tapY: 0.5, tapAge: 10, tapStrength: 0 }, Xe = { ...Se }, mt3 = { width: 1, height: 1, dtSec: 0, timeSec: 0, animYaw: 0, animPitch: 0, animRoll: 0, crystalYawOffsetRad: W, crystalTiltOffsetRad: j2, offsetX: D, offsetY: k3, bobY: 0, scale: R, dof01: H, fog01: it2, bloom01: at2, refraction01: nt3, detail01: ct2, cursorInside: false, targetPtrX: 0.5, targetPtrY: 0.5, isDragging: false, interactionEnabled: d3, rippleEnabled: false, tiltScale: p, invertTilt: e.interaction_tilt_invert, effectScale: h, curPtrX: 0.5, curPtrY: 0.5, gradientFrame: Se }, Dt = { width: 1, height: 1, timeSec: 0, animYaw: 0, animPitch: 0, animRoll: 0, crystalYawOffsetRad: W, crystalTiltOffsetRad: j2, offsetX: D, offsetY: k3, bobY: 0, scale: R, dof01: H, fog01: it2, bloom01: at2, refraction01: nt3, detail01: ct2, gradientFrame: Xe }, Ne = Co.mount(r, () => Wt2(0));
        if (!Ne) return r.remove(), r.width = 0, r.height = 0, null;
        const Vt = Ne;
        function Wt2(Y2) {
          const B3 = re(e.palette, M), tt = d3 && e.interaction_ripple && !_2, rt2 = tt ? Math.min(1.5, h) : 0;
          P2.x = i, P2.y = f, P2.age = y, P2.strength = rt2, I.focusX = E, I.focusY = N2, I.focusAmount = o, Vt.render((ht2, Z2, bt3, dt3, ft2) => {
            const St = qe(B3, dt3, ft2, pt3, A, n, I, Se);
            if (Ke(ht2, Z2.gradientPass, Z2.emptyVao, dt3, ft2, St, Q2, O2, _2 ? x2 * 0.65 : x2, n, Ot2, e.grain_animate, e.grain_fps), V) {
              let Mt = null;
              m2 && d3 && (ge[0] = lt2, ge[1] = gt, Mt = ge), Ao(V, Y2, z, L, dt3, ft2, et2, Mt, rt2 > 1e-3 && y < 1.3 ? P2 : null), en(ht2, Z2.particlePass, V, dt3, ft2, B3.particleTint);
            }
            if (s) {
              let Mt = 0, Tt = 0, wt2 = 0, _t3 = 0;
              if (e.crystal_motion === "orbit") Mt = z * Xt2 * 2, Tt = Math.sin(z * Xt2 * 3) * 0.11, wt2 = (Math.cos(z * Xt2 * 2) - 1) * 0.035;
              else if (e.crystal_motion === "float") {
                const Lt = z * Xt2 * 5 + Rt, st3 = z * Xt2 * 3 + 0.6 + Rt, vt2 = z * Xt2 * 2 + Rt * 0.5;
                Mt = (Math.sin(Lt) - ye2) * 0.21, Tt = (Math.sin(st3) - gn) * 0.095, wt2 = (Math.sin(vt2) - Be) * 0.045, _t3 = (Math.sin(z * Xt2 * 4 + Rt) - ye2) * 0.014;
              }
              mt3.width = dt3, mt3.height = ft2, mt3.dtSec = Y2, mt3.timeSec = z, mt3.animYaw = Mt, mt3.animPitch = Tt, mt3.animRoll = wt2, mt3.bobY = _t3, mt3.cursorInside = m2, mt3.targetPtrX = lt2, mt3.targetPtrY = gt, mt3.isDragging = C, mt3.rippleEnabled = tt, mt3.curPtrX = Q2, mt3.curPtrY = O2, mt3.gradientFrame = St, s.render(ht2, bt3, Z2.emptyVao, mt3);
            } else S && S(ht2, bt3, Z2.emptyVao, dt3, ft2, ut2 / Oe, Et && q && !_2 ? 1 : 0, E, N2, o, i, f, y, rt2, B3);
          });
        }
        let ve2 = false, Jt2 = 0, te = 0, ee = null, ne = null;
        const vn = { softness: w2, bloom: g2, focusX: 0.5, focusY: 0.5, focusAmount: 0, tap: Oo };
        function xn(Y2, B3) {
          const tt = re(e.palette, M), rt2 = Math.min(1, Math.max(0.62, (B3 - 1) / 5.5)), ht2 = A * Math.min(0.95, B3 / 15 * 0.91) * rt2;
          Vt.render((Z2, bt3, dt3, ft2, St) => {
            const Mt = qe(tt, ft2, St, Y2 * 15, ht2, n, vn, Xe);
            Ke(Z2, bt3.gradientPass, bt3.emptyVao, ft2, St, Mt, 0.5, 0.5, x2, n, Y2 * B3, e.grain_animate, e.grain_fps, B3);
            const Tt = ee ?? V;
            if (Tt && (Eo(Tt, Y2, B3, L, ft2, St, et2, ne), en(Z2, bt3.particlePass, Tt, ft2, St, tt.particleTint)), s) {
              let wt2 = 0, _t3 = 0, Lt = 0, st3 = 0;
              if (L > 1e-3) {
                const vt2 = Y2 * Math.PI * 2;
                if (e.crystal_motion === "orbit") wt2 = vt2, _t3 = Math.sin(vt2) * 0.049, Lt = (Math.cos(vt2) - 1) * 0.017;
                else if (e.crystal_motion === "float") {
                  const Pt2 = L / 0.35, kt = Math.min(1, 0.56 + 0.44 * Math.max(0, (B3 - 3) / 9)), Bt2 = 0.0435 * Pt2 * kt, Gt = Math.min(0.115 * Math.max(0.5, Pt2), Bt2 * B3 / (Math.PI * 2)), Ht2 = Math.min(1, 0.72 + 0.28 * Math.max(0, (B3 - 3) / 9)), xe = 44e-4 * Pt2 * Ht2, Me = Math.min(0.0105 * Math.max(0.5, Pt2), xe * B3 / (Math.PI * 2)), ie = Rt, we = Rt + 0.38, _e = Rt - 0.55;
                  wt2 = (Math.sin(vt2 + ie) - ye2) * Gt, _t3 = (Math.sin(vt2 + we) - yn) * (Gt * 0.32), Lt = (Math.sin(vt2 + ie * 0.5) - Be) * (Gt * 0.12), st3 = (Math.sin(vt2 + _e) - Sn) * Me;
                }
              }
              Dt.width = ft2, Dt.height = St, Dt.timeSec = Y2 * B3, Dt.animYaw = wt2, Dt.animPitch = _t3, Dt.animRoll = Lt, Dt.bobY = st3, Dt.gradientFrame = Mt, s.renderLoop(Z2, dt3, bt3.emptyVao, Dt);
            } else if (S) {
              const wt2 = 0.3 + L / 0.35 * 0.7, _t3 = e.motif_flow_speed * 0.84 * Math.min(1, Math.max(0.21, B3 * wt2 / Oe));
              S(Z2, dt3, bt3.emptyVao, ft2, St, Y2, q ? 1 : 0, 0.5, 0.5, 0, 0.5, 0.5, 10, 0, tt, _t3);
            }
          });
        }
        function oe() {
          if (ve2) return;
          U = Math.max(1, r.clientWidth), G2 = Math.max(1, r.clientHeight);
          const Y2 = typeof window < "u" ? Math.min(window.innerWidth || 9999, window.innerHeight || 9999) : 9999, B3 = typeof navigator < "u" && navigator.maxTouchPoints > 0 && Y2 <= 900, tt = _2 || B3 || Y2 <= 540, rt2 = tt ? 1.25 : 1.75, ht2 = tt ? 11e5 : s !== null ? 285e4 : 24e5, { width: Z2, height: bt3 } = Zn(U, G2, rt2, ht2), dt3 = Z2 < r.width || bt3 < r.height;
          (r.width !== Z2 || r.height !== bt3) && (r.width = Z2, r.height = bt3, dt3 && Vt.trim()), v == null || v(U, G2, _2), Wt2(0);
        }
        const Ue = new ResizeObserver(oe);
        if (Ue.observe(r), oe(), d3 && (r.addEventListener("pointermove", (Y2) => {
          const B3 = Math.max(0, Math.min(1, Y2.offsetX / U)), tt = Math.max(0, Math.min(1, Y2.offsetY / G2));
          if (!m2 && o < 0.01 && (E = B3, N2 = tt), lt2 = B3, gt = 1 - tt, yt2 = B3, xt3 = tt, m2 = true, C && u && s) {
            const rt2 = Y2.clientX - T, ht2 = Y2.clientY - J3;
            T = Y2.clientX, J3 = Y2.clientY, s.addDragPixels(rt2, ht2, U, G2);
          }
        }, { signal: a2, passive: true }), r.addEventListener("pointerleave", () => {
          m2 = false, C = false, r.removeAttribute("data-dragging");
        }, { signal: a2, passive: true }), r.addEventListener("pointerdown", (Y2) => {
          const B3 = Math.max(0, Math.min(1, Y2.offsetX / U)), tt = Math.max(0, Math.min(1, Y2.offsetY / G2)), rt2 = 1 - tt;
          if (!m2 && o < 0.01 && (E = B3, N2 = tt), lt2 = B3, gt = rt2, yt2 = B3, xt3 = tt, e.interaction_ripple && !_2 && (i = B3, f = tt, y = 0, s == null || s.triggerTap(B3, rt2, U, G2, D, k3, R, p, h, !u)), u) {
            C = true, T = Y2.clientX, J3 = Y2.clientY, r.setAttribute("data-dragging", "true");
            try {
              r.setPointerCapture(Y2.pointerId);
            } catch {
            }
          }
        }, { signal: a2 }), u)) {
          const Y2 = (B3) => {
            if (C) {
              C = false, r.removeAttribute("data-dragging");
              try {
                r.hasPointerCapture(B3.pointerId) && r.releasePointerCapture(B3.pointerId);
              } catch {
              }
            }
          };
          r.addEventListener("pointerup", Y2, { signal: a2 }), r.addEventListener("pointercancel", Y2, { signal: a2 });
        }
        const Ge = (Y2) => {
          if (!Et) return;
          Ft = requestAnimationFrame(Ge);
          const B3 = e.interaction_ripple && !_2 && y < on, tt = C || m2 || o > 5e-3 || B3 || s !== null && s.isSettling() || V !== null && Po(V), rt2 = C || !_2 && tt ? 0 : 30;
          if (rt2 > 0 && Y2 - be < rt2) return;
          const ht2 = Kt2 > 0 ? (Y2 - Kt2) / 1e3 : 1 / 60, Z2 = Math.max(0, Math.min(0.1, ht2));
          if (Kt2 = Y2, be = Y2, y < on && (y += Z2), L > 1e-3) {
            const Pt2 = 0.35 + L * 1.45, kt = s ? s.getAmbientScale() : 1;
            z = (z + Z2 * Pt2 * kt) % ue2;
          }
          if (q) {
            const Pt2 = 0.3 + L / 0.35 * 0.7;
            ut2 = (ut2 + Z2 * Pt2) % Oe;
          }
          A > 1e-3 && (pt3 = (pt3 + Z2) % ue2), e.grain_animate && x2 > 1e-3 && (Ot2 = (Ot2 + Z2) % ue2);
          const bt3 = m2 ? lt2 : 0.5, dt3 = m2 ? gt : 0.5, ft2 = m2 ? 3.4 : 0.82, St = Math.exp(-ft2 * Z2), Mt = Q2 - bt3, Tt = K3 + ft2 * Mt;
          Q2 = bt3 + (Mt + Tt * Z2) * St, K3 = (K3 - Tt * ft2 * Z2) * St;
          const wt2 = O2 - dt3, _t3 = ot3 + ft2 * wt2;
          O2 = dt3 + (wt2 + _t3 * Z2) * St, ot3 = (ot3 - _t3 * ft2 * Z2) * St, !m2 && Math.abs(K3) < 1e-4 && Math.abs(Q2 - 0.5) < 1e-4 && (K3 = 0, Q2 = 0.5), !m2 && Math.abs(ot3) < 1e-4 && Math.abs(O2 - 0.5) < 1e-4 && (ot3 = 0, O2 = 0.5);
          const Lt = 1 - Math.exp(-6.2 * Z2);
          E += (yt2 - E) * Lt, N2 += (xt3 - N2) * Lt;
          const st3 = m2 && d3 ? 1 : 0, vt2 = 1 - Math.exp(-(st3 > 0 ? 5.5 : 2) * Z2);
          o += (st3 - o) * vt2, o < 1e-4 && st3 === 0 && (o = 0), Wt2(Z2);
        };
        return { resume() {
          Et || (Et = true, Kt2 = performance.now(), be = 0, Ft = requestAnimationFrame(Ge));
        }, pause() {
          Et && (Et = false, Ft && (cancelAnimationFrame(Ft), Ft = 0));
        }, update(Y2) {
          const B3 = _2;
          Y2.colorMode !== void 0 && (M = Y2.colorMode), Y2.lowPower !== void 0 && (_2 = Y2.lowPower), B3 !== _2 ? oe() : Wt2(0);
        }, loop: { async begin({ duration: Y2, totalFrames: B3, fps: tt, width: rt2, height: ht2 }) {
          ve2 = true, Jt2 = r.width, te = r.height, (r.width !== rt2 || r.height !== ht2) && (r.width = rt2, r.height = ht2), await (b == null ? void 0 : b(rt2, ht2)), s == null || s.prepareLoop(), e.particles ? (ee = tn({ seed: n, particleSeed: e.particle_seed, mode: e.particle_mode, density: e.particle_density, focalScalePct: e.focal_scale, focalOffsetX: e.focal_offset_x, focalOffsetY: e.focal_offset_y, reactivity: e.particle_reactivity, dodgeRadius: e.particle_dodge_radius }), ne = e.particle_mode === "x_step" ? xo({ sceneSeed: n, particleSeed: e.particle_seed, density: e.particle_density, maxParticles: he2, widthPx: rt2, heightPx: ht2, motionSpeed01: L, duration: Y2, totalFrames: B3, fps: tt }) : null) : (ee = null, ne = null);
        }, renderFrame({ progress: Y2, duration: B3 }) {
          xn(Y2, B3);
        }, end() {
          ve2 = false, ee = null, ne = null, Jt2 > 0 && te > 0 && (r.width !== Jt2 || r.height !== te) && (r.width = Jt2, r.height = te), Vt.trim(), oe();
        } }, destroy() {
          Et = false, Ft && (cancelAnimationFrame(Ft), Ft = 0), c.abort(), Ue.disconnect(), Vt.destroy(), r.remove(), r.width = 0, r.height = 0;
        } };
      } });
      Do = /^#(?:[\da-f]{3}){1,2}$/i;
      ko = /^\d{4}-\d\d-\d\d$/;
      Yo = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
      Fo = /* @__PURE__ */ new Set(["layout", "colorMode", "reducedMotion", "lowPower"]);
      bn = Io;
      It2 = document.documentElement;
      Ut2 = document.querySelector("abc-canvas");
      Qt = It2.dataset.themeBehavior;
      if (It2.hasAttribute("data-url-params") && window.location.search) {
        const t = Ut2 == null ? void 0 : Ut2.querySelector(':scope > script[type="application/json"]');
        let e = {};
        if (t != null && t.textContent) try {
          const c = JSON.parse(t.textContent);
          c && typeof c == "object" && !Array.isArray(c) && (e = c);
        } catch {
        }
        const n = No(bn.config ?? {}, e, new URLSearchParams(window.location.search));
        n.themeBehavior && (Qt = n.themeBehavior, It2.dataset.themeBehavior = Qt), n.reducedMotion !== void 0 && (It2.dataset.reducedMotion = String(n.reducedMotion)), n.lowPower !== void 0 && (It2.dataset.lowPower = String(n.lowPower)), n.configChanged && Ut2 && t && (t.textContent = JSON.stringify(n.config), Ut2.posterMode = "fallback");
      }
      sn = window.matchMedia("(prefers-color-scheme: dark)");
      Qt === "light" || Qt === "dark" ? Ie(Qt) : (Ie(sn.matches ? "dark" : "light"), sn.addEventListener("change", (t) => {
        Ie(t.matches ? "dark" : "light");
      }));
      Ut2 && (Ut2.definition = bn);
    }
  });
  init_script();
})();
