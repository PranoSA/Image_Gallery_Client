import TripContext from '@/components/TripContext';

import React, { useState, useContext, useEffect } from 'react';
import '@/globals.css';
import {
  useQueryTrip,
  useAddTripCategory,
  useTripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { Image as Image, Trip, Category } from '@/definitions/Trip_View';
//add close out icon
import { FaTimes } from 'react-icons/fa';
import { useCompareViewStore, CompareViewStore } from './CompareStore';

const AddCategoryForm = () => {
  //get trip id from context
  const { id } = useContext(TripContext);

  const { data: trip, isLoading, isError } = useQueryTrip(id);

  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const addCategory = useAddTripCategory();
  //add listener for add category

  const { selected_date } = useTripViewStore();

  //on mount - set the start and end date to the selected date
  useEffect(() => {
    const current_date = trip?.start_date || '1970-01-01';
    const date_of = new Date(current_date);
    //add days
    date_of.setDate(date_of.getDate() + selected_date);
    //fix offset
    date_of.setMinutes(date_of.getMinutes() + date_of.getTimezoneOffset());

    //format date as the "date" input type
    const formatted_date = date_of.toISOString().split('T')[0];

    //set the start and end date
    setCategory((prevCategory) => ({
      ...prevCategory,
      start_date: formatted_date,
      end_date: formatted_date,
    }));

    return () => {
      //cleanup
    };
  }, [selected_date, trip]);

  const onAddCategory = async (category: Category) => {
    if (!trip) return;

    //refresh form errors
    setStartDateError(null);
    setEndDateError(null);
    setCategoryError(null);

    //verify  the start date is the same or after the trip start date
    //verify the end date is the same or before the trip end date

    const trip_start_date = new Date(trip.start_date);
    const trip_end_date = new Date(trip.end_date);

    const category_start_date = new Date(category.start_date);
    const category_end_date = new Date(category.end_date);

    let error_exists = false;

    if (category_start_date < trip_start_date) {
      setStartDateError('Start Date is before the trip start date');
      error_exists = true;
    }
    if (category_start_date > trip_end_date) {
      setStartDateError('Start Date is after the trip end date');
      error_exists = true;
    }

    if (category_end_date > trip_end_date) {
      setEndDateError('End Date is after the trip end date');
      error_exists = true;
    }

    if (category_start_date > category_end_date) {
      setEndDateError('End Date is before the start date');
      setStartDateError('Start Date is after the end date');
      error_exists = true;
    }

    if (category.category === '') {
      setCategoryError('Category name is required');
      error_exists = true;
    }

    //verify there is not already a category with the same name
    const category_exists = trip.categories.find(
      (trip_category) => trip_category.category === category.category
    );

    if (category_exists) {
      setCategoryError('Category with this name already exists');
    }

    if (error_exists) return;

    //add the category to the trip

    const new_trip = await addCategory.mutate({ trip, category });

    //check if successful
    if (addCategory.error) {
      //set the error in AddCategoryError
      console.error('Error adding category', addCategory.error);
    }

    //for now, just close the modal
    CompareViewStore.setState((state) => {
      return {
        ...state,
        add_category_modal_open: false,
      };
    });
  };

  const [category, setCategory] = useState<Category>({
    category: '',
    start_date: '',
    end_date: '',
    child_categories: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await onAddCategory(category);

    return;
    //clear the form
    setCategory({
      category: '',
      start_date: '',
      end_date: '',
      child_categories: [],
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="absolute top-5 right-5 flex ">
          <FaTimes
            size={30}
            className="text-2xl cursor-pointer dark:text-black"
            onClick={() => {
              CompareViewStore.setState((state) => {
                return {
                  ...state,
                  add_category_modal_open: false,
                };
              });
            }}
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-gray-700 font-bold mb-2"
            >
              Category
            </label>
            <input
              type="text"
              name="category"
              id="category"
              placeholder="Category"
              value={category.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                categoryError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            {categoryError && (
              <p className="text-red-500 text-sm mt-1">{categoryError}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="start_date"
              className="block text-gray-700 font-bold mb-2"
            >
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              id="start_date"
              value={category.start_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                startDateError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            {startDateError && (
              <p className="text-red-500 text-sm mt-1">{startDateError}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="end_date"
              className="block text-gray-700 font-bold mb-2"
            >
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              id="end_date"
              value={category.end_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                endDateError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            {endDateError && (
              <p className="text-red-500 text-sm mt-1">{endDateError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;
