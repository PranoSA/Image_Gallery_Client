import React from 'react';

interface Path {
  id: string;
  name: string;
  style: string;
  width: number;
  color_g: number;
  color_r: number;
  color_b: number;
}

interface PathLegendProps {
  paths: Path[];
}

const PathLegend: React.FC<PathLegendProps> = ({ paths }) => {
  return (
    <div className="p-4 bg-white rounded shadow-lg z-50">
      <h2 className="text-xl font-bold mb-4">Path Legend</h2>
      <ul>
        {paths.map((path) => (
          <li key={path.id} className="mb-2">
            <div
              className="flex items-center"
              style={{
                borderBottom: `${path.width}px ${path.style} rgb(${path.color_r}, ${path.color_g}, ${path.color_b})`,
              }}
            >
              <span className="ml-2">{path.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PathLegend;
