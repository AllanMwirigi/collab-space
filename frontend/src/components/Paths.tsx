import React from "react";
import { Point, CanvasPath } from "react-sketch-canvas";

const svgPath = (
  paths: Point[],
  id: string,
  strokeWidth: number,
  strokeColor: string,
  command: (point: Point, i: number, a: Point[]) => string
): JSX.Element => {
  const d = paths.reduce(
    (acc, point: any, i, a) =>
      i === 0 ? `M ${point.get('x')},${point.get('y')}` : `${acc} ${command(point, i, a)}`,
    ""
  );

  return (
    <path
      key={id}
      d={d}
      fill="none"
      strokeLinecap="round"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
};

const line = (pointA: any, pointB: any) => {
  const lengthX = pointB.get('x') - (pointA?.get('x') || 0);
  const lengthY = pointB.get('y') - (pointA?.get('y') || 0);
  //   const lengthX = pointB.x - pointA.x;
  //   const lengthY = pointB.y - pointA.y;

  return {
    length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
    angle: Math.atan2(lengthY, lengthX),
  };
};

type ControlPoints = {
  current: Point;
  previous?: Point;
  next?: Point;
  reverse?: boolean;
};

const controlPoint = (controlPoints: any): [number, number] => {
  const { current, next, previous, reverse } = controlPoints;
  // console.log('control points', controlPoints);

  const p = previous || current;
  const n = next || current;

  const smoothing = 0.2;

  const o = line(p, n);

  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;

  // const x = current.x + Math.cos(angle) * length;
  // const y = current.y + Math.sin(angle) * length;
  const x = ( current?.get('x') || 0 ) + Math.cos(angle) * length;
  const y = ( current?.get('y') || 0 ) + Math.sin(angle) * length;

  return [x, y];
};

const bezierCommand = (point: Point, i: number, a: Point[]): string => {
  let cpsX = null;
  let cpsY = null;

  switch (i) {
    case 0:
      [cpsX, cpsY] = controlPoint({
        current: point,
      });
      break;
    case 1:
      [cpsX, cpsY] = controlPoint({
        current: a[i - 1],
        next: point,
      });
      break;
    default:
      [cpsX, cpsY] = controlPoint({
        current: a[i - 1],
        previous: a[i - 2],
        next: point,
      });
      break;
  }

  const [cpeX, cpeY] = controlPoint({
    current: point,
    previous: a[i - 1],
    next: a[i + 1],
    reverse: true,
  });

  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x}, ${point.y}`;
};

type PathProps = {
  paths: CanvasPath[];
};

const Paths = ({ paths }: PathProps): JSX.Element => (
  <React.Fragment>
    {paths.map((path: any, id: number) => {
      console.log('currentPath', path)
      return svgPath(
        // path.get('paths'),
        path.paths,
        id.toString(),
        path.strokeWidth,
        path.strokeColor,
        bezierCommand
      )
    })}
  </React.Fragment>
);

export default Paths;