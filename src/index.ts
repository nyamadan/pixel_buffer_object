import "!style-loader!css-loader?modules=false!./index.css";

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

const createBufferInfo = (gl: WebGL2RenderingContext) => {
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

const readAndWritePbo = (
  gl: WebGL2RenderingContext,
  dstPixels: Uint8Array,
  readBuffer: WebGLBuffer,
  writeBuffer: WebGLBuffer) => {

  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, writeBuffer);
  gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, 0);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, readBuffer);
  gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, dstPixels);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
};

const readPixels = (
  gl: WebGL2RenderingContext,
  dstBuffer: Uint8Array) => {
  gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, dstBuffer);
};

const createPixelBuffers = (gl: WebGL2RenderingContext) => {
  const pixelBuffers: WebGLBuffer[] = [];
  for (let i = 0; i < 2; i++) {
    const pixelBuffer = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pixelBuffer);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, gl.canvas.width * gl.canvas.height * 4, gl.STREAM_DRAW);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    pixelBuffers.push(pixelBuffer);
  }

  return pixelBuffers;
};

const createCanvasPixelArray = (gl: WebGL2RenderingContext) => {
  return new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
};

const createApp = () => {
  const gl = createContext(1024, 1024);

  const programInfo = createProgram(gl);
  const bufferInfo = createBufferInfo(gl);
  const pixelBuffers = createPixelBuffers(gl);

  const pixels = createCanvasPixelArray(gl);
  let [readIndex, writeIndex] = [0, 1];

  const usePbo = true;

  const render = (t: number) => {
    requestAnimationFrame(render);

    viewport(gl);
    clear(gl);

    draw(gl, programInfo, bufferInfo, { resolution: [gl.canvas.width, gl.canvas.height] });

    if (usePbo) {
      readAndWritePbo(gl, pixels, pixelBuffers[readIndex], pixelBuffers[writeIndex]);
      [readIndex, writeIndex] = [writeIndex, readIndex]; // swap
    } else {
      readPixels(gl, pixels);
    }
  };

  requestAnimationFrame(render);

  return gl.canvas;
};

document.body.appendChild(createApp() as Node);
