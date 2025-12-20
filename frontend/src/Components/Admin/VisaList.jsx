import React, { useState } from 'react';
import { visaAPI } from '../../services/api';
import { toast } from 'react-toastify';

const VisaList = ({ visas, onDelete, onUpdate }) => {
  const [editingVisa, setEditingVisa] = useState(null);
  const [formData, setFormData] = useState({
    country: '',
    duration: '',
    price: '',
    description: '',
    coverImage: ''
  });

  const handleEditClick = (visa) => {
    setEditingVisa(visa._id);
    setFormData({
      country: visa.country,
      duration: visa.duration,
      price: visa.price,
      description: visa.description,
      coverImage: visa.coverImage
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await visaAPI.update(id, formData);
      toast.success('Visa updated successfully');
      setEditingVisa(null);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update visa');
    }
  };

  const handleCancel = () => {
    setEditingVisa(null);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Visa Management</h3>
        <button
          onClick={() => window.location.href = '/admin/visas/new'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Visa
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visas.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No visas found
                </td>
              </tr>
            ) : (
              visas.map((visa) => (
                <tr key={visa._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVisa === visa._id ? (
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{visa.country}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVisa === visa._id ? (
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{visa.duration}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingVisa === visa._id ? (
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">${visa.price}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingVisa === visa._id ? (
                      <>
                        <button
                          onClick={(e) => handleSubmit(e, visa._id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(visa)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(visa._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisaList;
