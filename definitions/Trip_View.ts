interface Image {
  id: string;
  file_path: string;
  created_at: Date;
  long: string;
  lat: string;
  ol_id?: string;
  tripid?: string;
  name: string;
  description: string;
  category?: string;
}

type Category = {
  category: string;
  start_date: string;
  end_date: string;
  child_categories: Category[];
};

type DaySummary = {
  day: string;
  summary: string;
  tripid: string;
};

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  images: Image[];
  paths: Path[];
  categories: Category[];
  untimed_trips: boolean;
}

interface Path {
  id: string;
  kml_file: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  color_g: number;
  color_b: number;
  color_r: number;
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
  tripid: number;
}

type History = {
  type:
    | 'mapWithTimeView'
    | 'mapWithDateView'
    | 'compareView'
    | 'categorizeView'
    | 'undatedView'
    | 'unLocatedView'
    | 'PlainView';
  tripId: string;
  scrolled_date: Date | null;
  setZoom: number | null;
  setCenter: { lat: number; lng: number } | null;
  link: string;
};

export type { Image, Trip, Path, Category, DaySummary, History };
