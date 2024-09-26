interface Image {
  id: string;
  file_path: string;
  created_at: string;
  long: string;
  lat: string;
  ol_id?: string;
  name: string;
  description: string;
  category?: string;
}

type Category = {
  category: string;
  start_date: string;
  end_date: string;
};

interface Trip {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  categories: Category[];
  //images: Image[];
  //paths: Path[];
}

interface Path {
  id: number;
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
