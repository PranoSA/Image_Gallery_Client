/**
 *
 * Create aCompare Store Type -> Then use tanstack store    to create a store
 *
 *
 *
 */

import { Store, useStore } from '@tanstack/react-store';

type CompareViewStoreType = {
  /**
   * sort -> Putting the Images into a folder
   * undated -> Helps User add dates to the images
   * unlocated -> Helps User add location to the images
   * view -> View the images [Helps Just find oens to throw away]
   * compare -> Select Images to go to the next stage to keep 1
   */
  mode: 'sort' | 'undated' | 'unlocated' | 'view' | 'compare';

  compare_or_filter_stage: 'compare' | 'filter'; //This only applies if mode is compare
  //filter means you've already selected the images you want to compare
  // When done with filter you can go back to compare to select more images

  compared_image_indexes: number[]; //This only applies if mode is compare

  filtered_image_indexes: number[]; //This only applies if mode is filter

  add_category_modal_open: boolean;

  untimed_trips_selected_date: Date;
};

const InitialValue: CompareViewStoreType = {
  mode: 'sort',
  compare_or_filter_stage: 'compare',
  compared_image_indexes: [],
  filtered_image_indexes: [],
  add_category_modal_open: false,
  untimed_trips_selected_date: new Date('1970-01-01'),
};

//create the store
export const CompareViewStore: Store<CompareViewStoreType> = new Store(
  InitialValue
);

//use the store in the component
export const useCompareViewStore = () => {
  return useStore(CompareViewStore);
};
/**
 *
 * React-Queries for stuff like adding categories to the trip,
 * adding dates to the trip, adding locations to the trip
 * deleting images from the trip
 *
 */
