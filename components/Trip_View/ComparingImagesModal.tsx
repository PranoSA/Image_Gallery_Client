import { HiOutlinePencil } from 'react-icons/hi';
import NextImage from 'next/image';
import { Image } from '@/definitions/Trip_View';

type ComparingModalImagesProps = {
  imagesForDay: Image[];
  handleComparePhotosSelection: (image: Image) => void;
  setComparingPhotos: (value: boolean) => void;
  setDoneSelectedImages: (value: boolean) => void;
  selectedImages: Image[];
};

export default function ComparingImagesModal({
  imagesForDay,
  handleComparePhotosSelection,
  setComparingPhotos,
  setDoneSelectedImages,
  selectedImages,
}: ComparingModalImagesProps) {
  return (
    <div className="">
      <div className="gallery mt-4">
        {imagesForDay.map((image) => (
          <div key={image.id}>
            <HiOutlinePencil />
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              width={100}
              height={100}
              onClick={() => {
                handleComparePhotosSelection(image);
              }}
              style={{
                cursor: 'pointer',
                margin: '10px',
                width: '100px',
                height: '100px',
                border: selectedImages.includes(image)
                  ? '5px solid blue'
                  : 'none',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center">
        <button onClick={() => setComparingPhotos(false)}>Cancel</button>
      </div>
      <div className="flex justify-center items-center">
        <button onClick={() => setDoneSelectedImages(true)}>
          Finish Selecting Images
        </button>
      </div>
    </div>
  );
}
