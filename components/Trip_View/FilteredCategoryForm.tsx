import {
  useTripViewStore,
  tripViewStore,
  useQueryTrip,
} from './Trip_View_Image_Store';
import TripContext from '../TripContext';

import { useContext } from 'react';
import { FaFolder } from 'react-icons/fa';

//close icon
import { FaTimes } from 'react-icons/fa';

const FilteredCategoryForm: React.FC = () => {
  const { id } = useContext(TripContext);

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  const categories = trip?.categories || [];
  const categories_strings = [
    'All',
    'Food',
    'Accommodation',
    'Transportation',
    'Activities',
    'Miscellaneous',
    'Shopping',
    'sightseeing',
    'Entertainment',
    'Nightlife',
    'Culture',
  ];

  const categoriess = categories_strings.map((category) => {
    return {
      category: category,
    };
  });

  const { filtered_categories } = useTripViewStore();

  const handleCheckboxChange = (name: string) => {
    //if the category is in filtered_categories, remove it
    if (filtered_categories.includes(name)) {
      tripViewStore.setState((state) => {
        return {
          ...state,
          filtered_categories: state.filtered_categories.filter(
            (category) => category !== name
          ),
        };
      });
    } else {
      tripViewStore.setState((state) => {
        return {
          ...state,
          filtered_categories: [...state.filtered_categories, name],
        };
      });
    }
  };

  const handleClose = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        filtering_categories: false,
        selecting_category: false,
      };
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div
        id="category-modal"
        className="relative  mx-auto p-4 bg-white shadow-md rounded-lg z-10 max-h-[50vh] flex flex-row flex-wrap"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          <FaTimes className="text-2xl" size={24} />
        </button>
        <h2 className="text-xl font-bold mt-4 w-full">Select Categories</h2>
        <div className="h-0.5 bg-gray-200 dark:bg-gray-700 mb-3 w-full"></div>

        <ul>
          <div className="w-full flex flex-col flex-wrap max-h-[40vh]">
            {categories.map((category) => (
              <li
                key={category.category}
                className="flex items-center mb-2 dark:font-black dark:text-black mr-5"
              >
                <FaFolder className="mr-2 text-gray-500" />
                <input
                  type="checkbox"
                  checked={!filtered_categories.includes(category.category)}
                  onChange={() => handleCheckboxChange(category.category)}
                  className="mr-2"
                />
                <span>{category.category}</span>
              </li>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
};

export default FilteredCategoryForm;
