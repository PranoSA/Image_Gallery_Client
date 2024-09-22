import { tripViewStore, useTripViewStore } from './Trip_View_Image_Store';

import TripContext from '../TripContext';

import { ColorResult, SketchPicker } from 'react-color';
import { useContext, useEffect, useState, useRef, useMemo } from 'react';

import { FaX } from 'react-icons/fa6';

import '@/form-modal.css';

const AddPathsForm: React.FC = () => {
  const { id } = useContext(TripContext);

  const handleCloseModal = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_paths: false,
      };
    });
  };

  const adding_paths = useTripViewStore().adding_path;

  const onSubmit = (formData: any) => {
    submitModal(formData);
  };

  const isOpen = useMemo(() => {
    return adding_paths;
  }, [adding_paths]);
  const onClose = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_paths: true,
      };
    });
  };

  const submitModal = (formData: any) => {
    const formDataObj = new FormData();
    formDataObj.append('kml_file', formData.file);
    formDataObj.append('description', formData.description);
    formDataObj.append('name', formData.name);
    formDataObj.append('color_r', formData.color_r);
    formDataObj.append('color_g', formData.color_g);
    formDataObj.append('color_b', formData.color_b);
    formDataObj.append('style', formData.style);
    formDataObj.append('thickness', formData.width);
    formDataObj.append('start_date', formData.start_date);
    formDataObj.append('end_date', formData.end_date);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/paths`, {
      method: 'POST',

      body: formDataObj,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        handleCloseModal();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const [formData, setFormData] = useState({
    file: null,
    description: '',
    name: '',
    color: { r: 0, g: 0, b: 0 },
    style: 'solid',
    width: '',
    start_date: '',
    end_date: '',
  });

  const handleChangeLineStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      style: e.target.value,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleColorChange = (color: ColorResult) => {
    setFormData({
      ...formData,
      color: {
        r: color.rgb.r,
        g: color.rgb.g,
        b: color.rgb.b,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      color_r: formData.color.r,
      color_g: formData.color.g,
      color_b: formData.color.b,
    });
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the line style
    ctx.strokeStyle = `rgb(${formData.color.r}, ${formData.color.g}, ${formData.color.b})`;
    ctx.lineWidth = parseInt(formData.width);

    // Set the line dash style
    if (formData.style === 'dashed') {
      ctx.setLineDash([10, 10]);
    } else if (formData.style === 'dotted') {
      ctx.setLineDash([4, 10]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [formData]);

  if (!isOpen)
    return (
      <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
        {/* 
        somethign to handle Opening Modal
      */}
        <button onClick={onClose}>Add Path</button>
      </div>
    );

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={(e) => handleCloseModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              <FaX size={24} />
            </button>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">KML File:</label>
                <input
                  type="file"
                  name="file"
                  accept=".kml"
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Color:</label>
                <SketchPicker
                  color={formData.color}
                  onChange={handleColorChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Style:</label>
                <select
                  name="style"
                  value={formData.style}
                  onChange={handleChangeLineStyle}
                  required
                  className="mt-1 block w-full"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Width:</label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Preview:</label>
                <canvas
                  ref={canvasRef}
                  width="300"
                  height="50"
                  className="mt-1 block w-full"
                ></canvas>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Start Date:</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">End Date:</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPathsForm;
