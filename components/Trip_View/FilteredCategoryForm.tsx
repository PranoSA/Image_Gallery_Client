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
        className="relative max-w-md mx-auto p-4 bg-white shadow-md rounded-lg z-10"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          <FaTimes className="text-2xl" size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Select Categories</h2>
        <ul>
          {categories.map((category) => (
            <li key={category.category} className="flex items-center mb-2">
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
        </ul>
      </div>
    </div>
  );
};

export default FilteredCategoryForm;
