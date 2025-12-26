import React, { useState, useEffect } from 'react';
import { visaAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';


const VisaList = () => {
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        country: '',
        duration: '',
        price: '',
        description: '',
        coverImage: null,
        imagePath: ''
    });
    const [imagePreview, setImagePreview] = useState('');

    // Fetch all visas
    const fetchVisas = async () => {
        try {
            console.log('Fetching visas...');
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                window.location.href = '/login';
                return;
            }
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/visas`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log('API Response:', response);
            console.log('Response data:', response.data);

            // Handle different response structures
            const visasData = Array.isArray(response.data) ? response.data :
                (response.data.visas || response.data.data || []);

            console.log('Processed visas data:', visasData);
            setVisas(visasData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching visas:', error);
            console.error('Error response:', error.response);
            toast.error('Failed to load visas');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisas();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                coverImage: file,
                imagePath: file.name
            }));

            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form Data:', {
        ...formData,
        coverImage: formData.coverImage ? 'File selected' : 'No file'
    });

    const formDataToSend = new FormData();
    formDataToSend.append('country', formData.country);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);

    if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
    }

    // Log FormData contents
    for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
    }

    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');

        if (!token) {
            toast.error('Authentication required. Please log in.');
            window.location.href = '/login';
            return;
        }

        const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/visas`,
            formDataToSend,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('Response:', response);
        toast.success('Visa added successfully');
        
        // Rest of your success handling...
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        
        if (error.response?.status === 400) {
            toast.error(`Validation error: ${JSON.stringify(error.response.data)}`);
        } else if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        } else {
            toast.error(error.response?.data?.message || 'Failed to add visa');
        }
    }
};
    // Handle delete visa
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this visa?')) {
            try {
                await visaAPI.delete(id);
                toast.success('Visa deleted successfully');
                fetchVisas();
            } catch (error) {
                console.error('Error deleting visa:', error);
                toast.error('Failed to delete visa');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Visa Management</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {isAdding ? 'Cancel' : 'Add New Visa'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Visa</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="e.g., 30 days"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                                <input
                                    id="coverImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full text-sm text-gray-500"
                                    required
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Save Visa
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (USD)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visas.length > 0 ? (
                                visas.map((visa) => (
                                    <tr key={visa._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {visa.coverImage && (
                                                <img
                                                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}${visa.coverImage}`}
                                                    alt={visa.country}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{visa.country}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{visa.duration}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${parseFloat(visa.price).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">{visa.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(visa._id)}
                                                className="text-red-600 hover:text-red-900 mr-4"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No visas found. Click "Add New Visa" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VisaList;
