/**
 * WebGL Fingerprint Collector
 * Captures GPU information and WebGL rendering characteristics
 */

import type { WebGLFingerprint } from '@panopticlick/types';
import { sha256 } from '../hash';

// Debug extension for vendor/renderer info
const DEBUG_EXTENSION = 'WEBGL_debug_renderer_info';

// Parameter constants
const UNMASKED_VENDOR = 0x9245;
const UNMASKED_RENDERER = 0x9246;

// Common WebGL parameters to collect
const WEBGL_PARAMS = [
  { name: 'MAX_TEXTURE_SIZE', pname: 0x0d33 },
  { name: 'MAX_VERTEX_ATTRIBS', pname: 0x8869 },
  { name: 'MAX_VERTEX_UNIFORM_VECTORS', pname: 0x8dfb },
  { name: 'MAX_VARYING_VECTORS', pname: 0x8dfc },
  { name: 'MAX_VERTEX_TEXTURE_IMAGE_UNITS', pname: 0x8b4c },
  { name: 'MAX_TEXTURE_IMAGE_UNITS', pname: 0x8872 },
  { name: 'MAX_FRAGMENT_UNIFORM_VECTORS', pname: 0x8dfd },
  { name: 'MAX_CUBE_MAP_TEXTURE_SIZE', pname: 0x851c },
  { name: 'MAX_RENDERBUFFER_SIZE', pname: 0x84e8 },
  { name: 'MAX_VIEWPORT_DIMS', pname: 0x0d3a },
  { name: 'ALIASED_LINE_WIDTH_RANGE', pname: 0x846e },
  { name: 'ALIASED_POINT_SIZE_RANGE', pname: 0x846d },
  { name: 'MAX_COMBINED_TEXTURE_IMAGE_UNITS', pname: 0x8b4d },
  { name: 'STENCIL_BITS', pname: 0x0d57 },
  { name: 'DEPTH_BITS', pname: 0x0d56 },
] as const;

/**
 * Collect WebGL fingerprint
 */
export async function collectWebGL(): Promise<WebGLFingerprint | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;

    // Try WebGL2 first, fallback to WebGL1
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let version = 'webgl';

    gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    if (gl) {
      version = 'webgl2';
    } else {
      gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (!gl) {
        gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        version = 'experimental-webgl';
      }
    }

    if (!gl) {
      return {
        hash: '',
        vendor: '',
        renderer: '',
        version: '',
        shadingLanguageVersion: '',
        extensions: [],
        maxTextureSize: 0,
        blocked: true,
      };
    }

    // Get vendor and renderer (unmasked if available)
    const debugExt = gl.getExtension(DEBUG_EXTENSION);
    let vendor = gl.getParameter(gl.VENDOR) as string || '';
    let renderer = gl.getParameter(gl.RENDERER) as string || '';

    if (debugExt) {
      vendor = gl.getParameter(UNMASKED_VENDOR) as string || vendor;
      renderer = gl.getParameter(UNMASKED_RENDERER) as string || renderer;
    }

    // Get WebGL version info
    const glVersion = gl.getParameter(gl.VERSION) as string || '';
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) as string || '';

    // Get extensions
    const extensions = gl.getSupportedExtensions() || [];

    // Collect all WebGL parameters
    const params: Record<string, unknown> = {};
    for (const param of WEBGL_PARAMS) {
      try {
        const value = gl.getParameter(param.pname);
        if (value instanceof Float32Array || value instanceof Int32Array) {
          params[param.name] = Array.from(value);
        } else {
          params[param.name] = value;
        }
      } catch {
        params[param.name] = null;
      }
    }

    const maxTextureSize = (params['MAX_TEXTURE_SIZE'] as number) || 0;

    // Render a fingerprint pattern and get the hash
    const imageHash = await renderFingerprintPattern(gl, canvas);

    // Combine all data for final hash
    const fingerprintData = {
      vendor,
      renderer,
      version: glVersion,
      shadingLanguageVersion,
      extensions: extensions.sort(),
      params,
      imageHash,
    };

    const hash = await sha256(JSON.stringify(fingerprintData));

    return {
      hash,
      vendor,
      renderer,
      version: glVersion,
      shadingLanguageVersion,
      extensions,
      maxTextureSize,
      blocked: false,
    };
  } catch (error) {
    return {
      hash: '',
      vendor: '',
      renderer: '',
      version: '',
      shadingLanguageVersion: '',
      extensions: [],
      maxTextureSize: 0,
      blocked: true,
    };
  }
}

/**
 * Render a unique pattern using WebGL shaders
 */
async function renderFingerprintPattern(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  canvas: HTMLCanvasElement
): Promise<string> {
  try {
    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with deterministic pattern
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 vUv;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv;
        float n = noise(uv * 10.0);
        vec3 color = vec3(
          sin(uv.x * 6.28 + n),
          cos(uv.y * 6.28 + n * 2.0),
          sin((uv.x + uv.y) * 3.14 + n * 3.0)
        ) * 0.5 + 0.5;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      return '';
    }

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) {
      return '';
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create buffer for full-screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Render
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Read pixels
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Clean up
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);

    // Hash the pixel data
    return await sha256(String.fromCharCode(...pixels.slice(0, 1000)));
  } catch {
    return '';
  }
}

/**
 * Detect if WebGL fingerprint might be spoofed
 */
export function detectWebGLSpoofing(fingerprint: WebGLFingerprint): boolean {
  // Check for suspicious patterns

  // Generic or masked vendor/renderer
  const genericPatterns = [
    /^google/i,
    /^mozilla/i,
    /swiftshader/i,
    /llvmpipe/i,
    /software/i,
    /mesa/i,
  ];

  if (genericPatterns.some(p => p.test(fingerprint.vendor) || p.test(fingerprint.renderer))) {
    // These could be legitimate software renderers, not necessarily spoofing
    // Return false but this could be flagged for additional analysis
    return false;
  }

  // Mismatched version info
  if (fingerprint.version && !fingerprint.version.includes('WebGL')) {
    return true;
  }

  // Suspiciously few extensions (real browsers have many)
  if (fingerprint.extensions.length < 5 && !fingerprint.blocked) {
    return true;
  }

  // Unrealistically small max texture size
  if (fingerprint.maxTextureSize > 0 && fingerprint.maxTextureSize < 1024) {
    return true;
  }

  return false;
}

/**
 * Get GPU tier based on WebGL capabilities
 */
export function getGPUTier(fingerprint: WebGLFingerprint): 'low' | 'medium' | 'high' | 'unknown' {
  if (fingerprint.blocked || !fingerprint.maxTextureSize) {
    return 'unknown';
  }

  // Check for high-end GPU indicators
  const highEndPatterns = [
    /nvidia.*rtx/i,
    /nvidia.*gtx\s*(10[6789]0|1[1-9]|[2-9])/i,
    /radeon.*rx\s*(5[6789]00|6[0-9]00)/i,
    /apple.*m[123]/i,
    /adreno\s*(6|7)/i,
  ];

  const lowEndPatterns = [
    /intel.*hd\s*([1-5])/i,
    /intel.*uhd\s*[1-5]/i,
    /mali-[gt][1-5]/i,
    /adreno\s*[1-3]/i,
    /powervr/i,
  ];

  const renderer = fingerprint.renderer.toLowerCase();

  if (highEndPatterns.some(p => p.test(renderer))) {
    return 'high';
  }

  if (lowEndPatterns.some(p => p.test(renderer))) {
    return 'low';
  }

  // Use max texture size as fallback indicator
  if (fingerprint.maxTextureSize >= 16384) {
    return 'high';
  } else if (fingerprint.maxTextureSize >= 4096) {
    return 'medium';
  }

  return 'low';
}
