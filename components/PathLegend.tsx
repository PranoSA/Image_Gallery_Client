import { useContext, useEffect, useRef, useMemo } from 'react';

interface PathLegendProps {
  paths: Path[];
}

//central store for all the paths
import {
  useQueryTripPaths,
  useTripViewStore,
  useQueryTrip,
} from './Trip_View/Trip_View_Image_Store';

import TripContext from './TripContext';

const PathLegend: React.FC<PathLegendProps> = () => {
  const { id } = useContext(TripContext);

  const { data: paths, isLoading, isError } = useQueryTripPaths(id);

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useQueryTrip(id);

  //get store state
  const { selected_date, paths_open } = useTripViewStore();

  //useMemo to get filtered paths based on the selected date
  const filteredPaths = useMemo(() => {
    if (!trip) return [];

    if (!paths) return [];
    const current_date = new Date(trip.start_date);
    //add selected_date to the current date, in number of days
    current_date.setDate(current_date.getDate() + selected_date);

    return paths.filter((path) => {
      const start = new Date(path.start_date).getTime();
      const end = new Date(path.end_date).getTime();
      return start <= current_date.getTime() && end >= current_date.getTime();
    });
  }, [paths, selected_date, trip]);

  ``;

  if (tripLoading) {
    return <div>Loading...</div>;
  }

  if (tripError) {
    return <div>Error loading trip</div>;
  }

  if (isError) {
    return <div>Error loading paths</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (paths_open === false) {
    return null;
  }

  if (filteredPaths.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 p-4 bg-white rounded shadow-lg z-50">
      <h2 className="text-xl font-bold mb-4">Path Legend</h2>
      <ul>
        {filteredPaths.map((path) => (
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
