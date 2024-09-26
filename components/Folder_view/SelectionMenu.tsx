import React, { useState, useEffect } from 'react';
import { FaFolder } from 'react-icons/fa';

import FilteredCategoryForm from '@/components/Trip_View/FilteredCategoryForm';

interface Category {
  id: number;
  name: string;
}

const CategorySelector: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    // Fetch the list of categories from the API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
        // By default, select all categories
        setSelectedCategories(
          new Set(data.map((category: Category) => category.id))
        );
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCheckboxChange = (id: number) => {
    setSelectedCategories((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Select Categories</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id} className="flex items-center mb-2">
            <FaFolder className="mr-2 text-gray-500" />
            <input
              type="checkbox"
              checked={selectedCategories.has(category.id)}
              onChange={() => handleCheckboxChange(category.id)}
              className="mr-2"
            />
            <span>{category.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySelector;
