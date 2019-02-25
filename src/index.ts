import "!style-loader!css-loader?module=false!./index.css";

import * as twgl from "twgl.js";

const VertexShaderSource = `#version 300 es

in vec3 position;

void main()
{
  gl_Position = vec4(position, 1.0);
}
`;

const FragmentShaderSource = `#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;

out vec4 fragColor;

void main()
{
  vec2 p = gl_FragCoord.xy / resolution;
  fragColor = vec4(p, 0.0, 1.0);
}
`;

const createContext = (width: number, height: number) => {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
  canvas.width = width;
  canvas.height = height;
  return gl;
};

const viewport = (gl: WebGL2RenderingContext) => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

const clear = (gl: WebGL2RenderingContext) => {
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

const createProgram = (gl: WebGL2RenderingContext) => {
  return twgl.createProgramInfo(gl, [VertexShaderSource, FragmentShaderSource]);
};

const createBuffer = (gl: WebGL2RenderingContext) => {
  return twgl.createBufferInfoFromArrays(gl, {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  });
};

const draw = (
  gl: WebGL2RenderingContext,
  programInfo: twgl.ProgramInfo,
  bufferInfo: twgl.BufferInfo,
  uniforms: { [key: string]: any }) => {
  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);
};

const readPixelsFromPbo = (
  gl: WebGL2RenderingContext,
  pixelBuffers: ReadonlyArray<WebGLBuffer>,
  readIndex: number,
  writeIndex: number,
  dstBuffer: Uint8Array): [number, number] => {

  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pixelBuffers[writeIndex]);
  gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, 0);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pixelBuffers[readIndex]);
  gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, dstBuffer);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

  return [writeIndex, readIndex];
};

const readPixels = (
  gl: WebGL2RenderingContext,
  dstBuffer: Uint8Array) => {
  gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, dstBuffer);
};

const createApp = () => {
  const gl = createContext(1024, 1024);

  const programInfo = createProgram(gl);
  const bufferInfo = createBuffer(gl);

  const pixelBuffers: WebGLBuffer[] = [];
  for (let i = 0; i < 2; i++) {
    const pixelBuffer = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pixelBuffer);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, gl.canvas.width * gl.canvas.height * 4, gl.STREAM_DRAW);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    pixelBuffers.push(pixelBuffer);
  }

  const usePbo = true;
  const dstBuffer = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
  let readIndex = 0;
  let writeIndex = 1;

  const render = (t: number) => {
    requestAnimationFrame(render);

    viewport(gl);
    clear(gl);

    const uniforms = {
      resolution: [gl.canvas.width, gl.canvas.height],
    };

    draw(gl, programInfo, bufferInfo, uniforms);

    if (usePbo) {
      [readIndex, writeIndex] = readPixelsFromPbo(gl, pixelBuffers, readIndex, writeIndex, dstBuffer);
    } else {
      readPixels(gl, dstBuffer);
    }
  };

  requestAnimationFrame(render);

  return gl.canvas;
};

document.body.appendChild(createApp());
