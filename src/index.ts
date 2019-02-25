import "!style-loader!css-loader?module=false!./index.css";

import * as twgl from "twgl.js";

const createContext = (width: number, height: number) => {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
  canvas.width = width;
  canvas.height = height;
  return gl;
};

const clear = (gl: WebGL2RenderingContext) => {
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

const createApp = () => {
  const gl = createContext(512, 512);

  const render = (t: number) => {
    clear(gl);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

  return gl.canvas;
};

document.body.appendChild(createApp());
