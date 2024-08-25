import { Path } from '@/definitions/Trip_View';

import React, { useState } from 'react';
import { HiOutlinePencil } from 'react-icons/hi';

import axios from 'axios';

interface PathMapModalProps {
  path: Path;
  closeModal: () => void;
  position: { x: number; y: number };
}

// modal is not an elemenet
export const PathMapModal: React.FC<PathMapModalProps> = ({
  path,
  closeModal,
  position,
}) => {
  const [editPathName, setEditPathName] = useState(path.name);
  const [editPathDescription, setEditPathDescription] = useState(
    path.description
  );

  const [isEditing, setIsEditing] = useState(false);

  const submitEdit = () => {
    // send to server
    // update path
    axios
      .put(`${process.env.NEXT_PUBLIC_API_URL}/trip/1/path/${path.id}`, {
        name: editPathName,
        description: editPathDescription,
        //set other fields as they were
        color_g: path.color_g,
        color_b: path.color_b,
        color_r: path.color_r,
        style: path.style,
        thickness: path.thickness,
        start_date: path.start_date,
        end_date: path.end_date,
        tripid: path.tripid,
      })
      .then((res) => {
        console.log(res.data);
        setIsEditing(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div
      className="fixed bg-white p-4 rounded shadow-lg z-50"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        <div className="flex justify-between w- full">
          <HiOutlinePencil
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
          />
          {/* Input fields for editing path name and description */}
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editPathName}
                onChange={(e) => setEditPathName(e.target.value)}
              />
              <textarea
                value={editPathDescription}
                onChange={(e) => setEditPathDescription(e.target.value)}
              />
              <button onClick={submitEdit}>Submit</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <h2>Name : {path.name}</h2>
              <p>Description : {path.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathMapModal;
