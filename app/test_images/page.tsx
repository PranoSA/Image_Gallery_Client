'use client';

import NextImage from 'next/image';
const image_Url_base = process.env.NEXT_PUBLIC_STATIC_IMAGE_URL;
/**
 *
 * Image Names are :
 * 1729307172711-IMG_3609.JPG
 * output-125x125.jp
 * output-125x250.jpg server/src/images/output-250x125.jpg server/src/images/output-250x250.jpg server/src/images/output-250x500.jpg server/src/images/output-500x250.jpg server/src/images/output-500x500.jpg server/src/images/output-500x1000.jpg server/src/images/output-1000x500.jpg
 */

type ImageSelection = {
  image: string;
};

type Size = {
  width: number;
  height: number;
};

const Page: React.FC = () => {
  const image_urls: ImageSelection[] = [
    { image: 'output-125x125.jpg' },
    { image: 'output-125x250.jpg' },
    { image: 'output-250x125.jpg' },
    { image: 'output-250x250.jpg' },
    { image: 'output-250x500.jpg' },
    { image: 'output-500x250.jpg' },
    { image: 'output-500x500.jpg' },
    { image: 'output-500x1000.jpg' },
    { image: 'output-1000x500.jpg' },
  ];

  const sizes: Size[] = [
    { width: 125, height: 125 },
    { width: 125, height: 250 },
    { width: 250, height: 125 },
    { width: 250, height: 250 },
    { width: 250, height: 500 },
    { width: 500, height: 250 },
    { width: 500, height: 500 },
    { width: 500, height: 1000 },
    { width: 1000, height: 500 },
  ];

  //render an improperly sized list of images assuming they are all 500 x 500

  const firstComponent = () => {
    return (
      <div>
        <div className="flex flex-wrap">
          {image_urls.map((image, i) => {
            return (
              <div
                key={i}
                className="relative flex flex-col items-center justify-end bg-white rounded-lg shadow-lg border border-gray-300"
              >
                <h1> {image.image} </h1>
                <div className="w-full flex items-center justify-center bg-gray-100 p-1 min-h-[500px] border border-gray-300">
                  <div className="relative w-full h-full flex items-center justify-center max-w-full m-5 max-h-[500px]">
                    <NextImage
                      src={`${image_Url_base}/${image.image}`}
                      alt={`Image for ${image.image}`}
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        GHOULASHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
        {/* Now do 1000x1000 */}
        <div className="flex flex-wrap justify-between">
          {image_urls.map((image, i) => {
            return (
              <div
                key={i}
                className="justify-end bg-white rounded-lg shadow-lg border-4 border-red-300"
              >
                {' '}
                <h1> {image.image} </h1>
                <NextImage
                  src={`${image_Url_base}/${image.image}`}
                  alt={`Image for ${image.image}`}
                  height={1000}
                  width={1000}
                />
              </div>
            );
          })}
        </div>
        FLEXX COLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
        <div className="">
          {image_urls.map((image, i) => {
            return (
              <div
                key={i}
                className="justify-end bg-white rounded-lg shadow-lg border-4 border-red-300"
              >
                {' '}
                <h1> {image.image} </h1>
                <NextImage
                  src={`${image_Url_base}/${image.image}`}
                  alt={`Image for ${image.image}`}
                  height={1000}
                  width={1000}
                />
              </div>
            );
          })}
        </div>
        {/* Now request the same one1729307172711-IMG_3609.JPG[0]
      
        USING different sizes 

        Hoping the server will resize the image for me
        with the following sizes:
        125x125
        125x250
        250x125
        250x250
        250x500
        500x250
        500x500
        500x1000
        1000x500

      */}
        SIZZESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
        {sizes.map((size, i) => {
          return (
            <div key={i}>
              <h1>
                {' '}
                {size.width} x {size.height}{' '}
              </h1>
              <div className="flex flex-wrap">
                <NextImage
                  src={`${image_Url_base}/${image_urls[0].image}`}
                  alt={`Image for ${image_urls[0].image}`}
                  width={size.width}
                  height={size.height}
                />
              </div>
            </div>
          );
        })}
        RESPONSIVE
        {sizes.map((size, i) => {
          return (
            <div key={i} className="flex flex-wrap flex-row">
              <h1>
                {' '}
                {size.width} x {size.height}{' '}
              </h1>
              <div className="flex flex-wrap w-1/2">
                <NextImage
                  src={`${image_Url_base}/1729307172711-IMG_3609.JPG`}
                  alt={`Image for ${image_urls[0].image}`}
                  width={size.width}
                  height={size.height}
                  layout="responsive"
                />
              </div>
            </div>
          );
        })}
        {/* Now for each aspect ratio -> Render differnet height with type FILL*/}
        FILLLLLLLLLLL
        {image_urls.map((image, i) => {
          return (
            <div key={i} className="relative w-full flex flex-wrap">
              <h1> {image.image} </h1>
              <div className="relative  h-[500px]  w-full">
                <NextImage
                  src={`${image_Url_base}/${image.image}`}
                  alt={`Image for ${image.image}`}
                  layout="fill"
                  sizes="(max-width: 500px) 100vw, 500px"
                />
              </div>
            </div>
          );
        })}
        RESPONSIVE WITH SIZES
        <div className="w-full flex flex-wrap justify-around">
          {image_urls.reverse().map((image, i) => {
            return (
              <div key={i} className="">
                <h1> {image.image} </h1>
                <NextImage
                  src={`${image_Url_base}/${image.image}`}
                  alt={`Image for ${image.image}`}
                  layout="responsive"
                  width={1050} // Specify the intrinsic width of the image
                  height={1050} // Specify the intrinsic height of the image
                  sizes="(max-width: 500px) 100vw, 10vw"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap">
      {image_urls.map((image, i) => {
        return (
          <div key={i} className="relative  flex flex-wrap w-1/4">
            <h1> {image.image} </h1>
            <div className="relative  h-[500px]  w-full">
              <NextImage
                src={`${image_Url_base}/${image.image}`}
                alt={`Image for ${image.image}`}
                fill
                sizes="(max-width: 500px) 100vw, 33vw"
              />
            </div>
          </div>
        );
      })}
      <div className="w-full"></div>
      {image_urls.map((image, i) => {
        return (
          <div key={i} className="relative flex flex-wrap w-1/4">
            <h1> {image.image} </h1>
            <div className="relative  h-[500px]  w-full">
              <NextImage
                src={`${image_Url_base}/${image.image}`}
                alt={`Image for ${image.image}`}
                fill
              />
            </div>
          </div>
        );
      })}
      <div className="w-full h-[20px]"></div>
      {image_urls.map((image, i) => {
        return (
          <div className=" w-full " key={i}>
            <NextImage
              src={`${image_Url_base}/${image.image}`}
              alt="Example Image"
              width={1000} // Specify the intrinsic width of the image
              height={1000} // Specify the intrinsic height of the image
              sizes="(max-width: 500px) 100vw, 50vw"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Page;
