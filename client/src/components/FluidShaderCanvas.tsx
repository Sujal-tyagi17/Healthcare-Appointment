import React, { useEffect, useRef } from 'react';

export const FluidShaderCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

// Simplex Noise 2D functions
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    float t = u_time * 0.4;
    
    // Interactive mouse distortion ripple
    float mouseDist = length(uv - mouse);
    vec2 mouseDisplacement = (uv - mouse) * exp(-mouseDist * 2.5) * 0.4;
    vec2 p = uv + mouseDisplacement;
    
    // Multi-octave domain warped fluid dynamics
    float f1 = snoise(p * 1.8 + vec2(t * 0.2, -t * 0.15));
    float f2 = snoise(p * 2.5 + vec2(-t * 0.1, t * 0.25) + vec2(f1 * 0.8, f1 * 0.6));
    float f3 = snoise(p * 3.5 + vec2(f2 * 0.9, -f2 * 0.7) + t * 0.15);
    
    // Bioluminescent Color Palette (Deep Oceanic Slate, Electric Cyan, Royal Violet, Emerald Glow)
    vec3 cBase = vec3(0.043, 0.075, 0.149);        // #0b1326 deep base
    vec3 cCyan = vec3(0.055, 0.647, 0.914);        // #0ea5e9 electric cyan
    vec3 cViolet = vec3(0.545, 0.361, 0.965);      // #8b5cf6 royal violet
    vec3 cEmerald = vec3(0.0, 0.945, 0.627);       // #00f1a0 emerald glow
    vec3 cDeepBlue = vec3(0.012, 0.216, 0.420);    // #03376b deep azure
    
    // Blend wave field layers
    vec3 col = mix(cBase, cDeepBlue, smoothstep(-0.6, 0.6, f1));
    col = mix(col, cCyan, smoothstep(0.0, 0.9, f2) * 0.75);
    col = mix(col, cViolet, smoothstep(0.1, 0.8, f3) * 0.65);
    
    // Subtle pulsating kinetic glowing light filaments
    float filaments = pow(abs(f3), 4.0) * 0.4;
    col += cEmerald * filaments;
    
    // Soft glowing radial focus
    float centerGlow = 1.0 - length(uv * 0.6);
    col += cCyan * clamp(centerGlow * 0.15, 0.0, 0.25);
    
    // Vignette for seamless dark-mode border integration
    float vig = 1.0 - length(v_texCoord - 0.5) * 0.85;
    col *= clamp(vig, 0.4, 1.0);
    
    gl_FragColor = vec4(col, 1.0);
}`;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let currentMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const syncSize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    syncSize();
    window.addEventListener('resize', syncSize);

    let animationFrameId: number;
    const render = (t: number) => {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Smooth mouse lerping with inertia
      currentMouse.x += (mouse.x - currentMouse.x) * 0.08;
      currentMouse.y += (mouse.y - currentMouse.y) * 0.08;

      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, currentMouse.x * (canvas.width / window.innerWidth), currentMouse.y * (canvas.height / window.innerHeight));
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', syncSize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-85 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
