import { useEffect, useState } from 'react';

type ImageGalleryProps = {};

const ImageGallery: React.FC<ImageGalleryProps> = () => {
  const [images, setImages] = useState<string[]>([]);

  //hours is 0..23
  const hours = new Date().getHours();

  useEffect(() => {
    fetch('/api/images')
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  //render hour by hour scrollable with times on the side

  return (
    <div>
      {images.map((image) => (
        <img src={image} key={image} />
      ))}
    </div>
  );
};
