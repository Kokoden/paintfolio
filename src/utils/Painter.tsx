import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PainterInterface {
  recordPoints?: boolean;
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

  function drawLine(p1: Coordinates, p2: Coordinates): void | null {
    if (!canvasRef.current) {
      return null;
    }

    const context = canvasRef.current.getContext("2d");
    if (context) {
      context.strokeStyle = "#000000";
      context.lineJoin = "round";
      context.lineWidth = 1;

      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.closePath();

      context.stroke();
    }
  }

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

  const onDown = useCallback((event: any) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setPosition(coordinates);
      setDrawing(true);
    }
  }, []);

  const onUp = useCallback(() => {
    setDrawing(false);
    setPosition(null);
  }, []);

  const onMove = useCallback(
    (event: any) => {
      if (drawing) {
        const newPosition = getCoordinates(event);
        if (position && newPosition) {
          drawLine(position, newPosition);
          setPosition(newPosition);
        }
      }
    },
    [drawing, position]
  );

  return (
    <canvas
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
