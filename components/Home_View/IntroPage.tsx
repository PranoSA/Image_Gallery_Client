import React from 'react';
import { signIn } from 'next-auth/react';

//intuitive looking icon for visiting a page
import { HiOutlineDocumentText } from 'react-icons/hi';
import { FaArrowRight } from 'react-icons/fa';
import NextImage from 'next/image';
import Link from 'next/link';

const exampleTrips = [
  {
    title: 'Trip To Budapest',
    //uuid (v4) generated for each trip
    id: 'b1b9b3b4-4b1b-4b3b-8b4b-1b9b3b4b1b9b',
    description:
      'A wonderful trip to Budapest with lots of sightseeing and fun activities.',
    dateRange: '2023-05-01 to 2023-05-10',
    images: [
      'image1.jpg',
      'image2.jpg',
      'image3.jpg',
      'image4.jpg',
      'image5.jpg',
      'image6.jpg',
    ],
  },
  {
    id: 'b1b9b3b4-4b1b-4b3b-8b4b-1b9b3b4b1b9c',
    title: 'Trip To Paris',
    description: 'Experience the romance and culture of Paris.',
    dateRange: '2023-06-15 to 2023-06-20',
    images: ['image4.jpg', 'image5.jpg', 'image6.jpg'],
  },
  {
    id: 'b1b9b3b4-4b1b-4b3b-8b4b-1b9b3b4b1b9d',
    title: 'Trip To Tokyo',
    description: 'Explore the vibrant city of Tokyo and its unique culture.',
    dateRange: '2023-07-10 to 2023-07-20',
    images: ['image7.jpg', 'image8.jpg', 'image9.jpg'],
  },
  {
    id: 'b1b9b3b4-4b1b-4b3b-8b4b-1b9b3b4b1b9e',
    title: 'Trip To New York',
    description:
      'Discover the bustling city of New York and its iconic landmarks.',
    dateRange: '2023-08-05 to 2023-08-15',
    images: ['image10.jpg', 'image11.jpg', 'image12.jpg'],
  },
];

const IntroPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to the Image Application
        </h1>
        <p className="text-lg text-gray-700">
          Manage and explore your trip images with ease.
        </p>
      </div>
      <button
        onClick={() => signIn('keycloak')}
        className="bg-blue-500 text-white px-6 py-3 rounded mb-12"
      >
        Sign Into Images App
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {exampleTrips.map((trip, index) => (
          <div key={index} className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold mb-2">{trip.title}</h2>
            <p className="text-gray-600 mb-2">{trip.dateRange}</p>
            <p className="text-gray-800 mb-4">{trip.description}</p>
            <div className="overflow-x-scroll flex space-x-2 mb-4">
              {trip.images.map((image, idx) => (
                <div key={idx} className="w-24 h-24 flex-shrink-0 relative">
                  <NextImage
                    src={`/images/${image}`}
                    alt={`${trip.title} image ${idx + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
              ))}
            </div>
            <Link href={`/trip/view/${trip.id}`} passHref>
              <button className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded">
                Visit <FaArrowRight className="ml-2" />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntroPage;
