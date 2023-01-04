import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AddOperation, MeshDistanceMaterial } from "three";
import useWindowSize from "./useWindowResize";

interface PainterInterface {
  recordPoints?: boolean;
  threshold: number;
  lineWidth: number;
}

type Coordinates = {
  x: number;
  y: number;
};

/**
 * Allows the user to paint over the website.
 *
 * @param recordPoints when true, the canvas will return
 * a list of coordinates in the console.
 * @returns A 2D HTML canvas you can paint on
 */
export default function Painter(props: PainterInterface) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [data, setData] = useState<Coordinates[]>([]);

  const size = useWindowSize();

  /**
   * Resizes the canvas to set client bounds.
   * @param canvas the current canvas
   * @returns null in case of an error
   */
  function resizeCanvas(canvas: HTMLCanvasElement): void | null {
    const { width, height } = canvas.getBoundingClientRect();

    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio: ratio = 1 } = window;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.scale(ratio, ratio);

        // Redraws points after rescale
        redraw();
      } else {
        return null;
      }
    }
  }

  /**
   * Redraws data points saved in state.
   */
  function redraw() {
    for (let i = 0; i < data.length - 1; i++) {
      drawLine(data[i], data[i + 1]);
    }
  }

  /**
   * Draws a line from p1 to p2, linewidth is set by the props
   * @param p1 Original point
   * @param p2 Destination point
   * @returns null in case of an error
   */
  function drawLine(p1: Coordinates, p2: Coordinates): void | null {
    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (context) {
      context.strokeStyle = "#000000";
      context.lineJoin = "round";
      context.lineWidth = props.lineWidth;

      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.closePath();

      context.stroke();
    }
  }

  /**
   * Gets the coordinates of the user's mouse at time of event
   * @param event click or touch event
   * @returns mouse or touch coordinates, null in case the
   * current canvas can't be referenced.
   */
  function getCoordinates(event: any): Coordinates | null {
    if (!canvasRef.current) {
      return null;
    }

    let x, y;

    if (event.type === "touchstart" || event.type === "touchmove") {
      x = event.touches[0].pageX;
      y = event.touches[0].pageY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    return {
      x: x - canvasRef.current.offsetLeft,
      y: y - canvasRef.current.offsetTop,
    };
  }

  /**
   * Gets the distance from p1 to p2
   * @param p1 coordinates on the canvas
   * @param p2 coordinates on the canvas
   * @returns the distance calculated
   */
  function getDistance(p1: Coordinates, p2: Coordinates): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  /**
   * Start drawing when user clicks on the canvas
   */
  const onDown = useCallback((event: any) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setPosition(coordinates);
      setDrawing(true);
    }
  }, []);

  /**
   * Stop drawing
   */
  const onUp = useCallback(() => {
    setDrawing(false);
    setPosition(null);
  }, []);

  /**
   * Draws and updates the data points drawn on canvas.
   * If @threshold is used, the points drawn on canvas will
   * have a minimum distance of said variable to increase performance.
   */
  const onMove = useCallback(
    (event: any) => {
      if (drawing) {
        const newPosition = getCoordinates(event);
        if (
          position &&
          newPosition &&
          getDistance(position, newPosition) > props.threshold
        ) {
          drawLine(position, newPosition);
          setPosition(newPosition);
          const newData = [...data];
          setData(newData.concat(newPosition));
        }
      }
    },
    [drawing, position]
  );

  /**
   * Resizes canvas on WindowResize event
   */
  useEffect(() => {
    resizeCanvas(canvasRef.current!);
  }, [size]);

  /**
   * For debugging purposes, if @recordPoints is true then will log
   * the points drawn in the console.
   */
  useEffect(() => {
    if (props.recordPoints && !drawing && data != []) {
      console.log(data);
    }
  }, [drawing]);

  return (
    <canvas
      style={{ display: "block", height: "100vh", width: "100vw" }}
      ref={canvasRef}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseMove={onMove}
      onTouchStart={onDown}
      onTouchEnd={onUp}
      onTouchMove={onMove}
    />
  );
}
