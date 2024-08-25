import { useEffect, useRef } from 'react';

interface PathLegendProps {
  paths: Path[];
}

const PathLegend: React.FC<PathLegendProps> = ({ paths }) => {
  return (
    <div className="absolute top-4 right-4 p-4 bg-white rounded shadow-lg z-50">
      <h2 className="text-xl font-bold mb-4">Path Legend</h2>
      <ul>
        {paths.map((path) => (
          <li key={path.id} className="mb-2 flex items-center">
            <PathPreview path={path} />
            <span className="ml-2">{path.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PathPreview: React.FC<{ path: Path }> = ({ path }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the line style
    ctx.strokeStyle = `rgb(${path.color_r}, ${path.color_g}, ${path.color_b})`;
    ctx.lineWidth = path.thickness;

    // Set the line dash style
    if (path.style === 'dashed') {
      ctx.setLineDash([10, 10]);
    } else if (path.style === 'dotted') {
      ctx.setLineDash([4, 10]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [path]);

  return <canvas ref={canvasRef} width={100} height={20} />;
};

export default PathLegend;
