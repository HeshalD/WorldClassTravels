import React, { useState, useEffect } from 'react';
import { visaAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Plus, X, Trash2, Clock } from 'lucide-react';


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
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryBlue"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-gilroyMedium text-slate-800">All Visas</h2>
                    <p className="text-sm text-slate-500 font-gilroyRegular">Manage the visa packages shown to travellers</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white px-4 py-2.5 rounded-xl font-gilroyMedium text-sm shadow-md hover:shadow-lg transition-all"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Cancel' : 'Add New Visa'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
                    <h3 className="text-lg font-gilroyMedium text-slate-800 mb-4">Add New Visa</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                                    placeholder="e.g., 30 days"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Price (Rs.)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Cover Image</label>
                                <input
                                    id="coverImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primaryBlue/10 file:text-primaryBlue file:font-gilroyMedium"
                                    required
                                />
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-lg" />
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-gilroyMedium text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white font-gilroyMedium text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
                            >
                                Save Visa
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3.5 text-right text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visas.length > 0 ? (
                                visas.map((visa) => (
                                    <tr key={visa._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {visa.coverImage && (
                                                <img
                                                    src={visa.coverImage}
                                                    alt={visa.country}
                                                    className="h-11 w-11 rounded-xl object-cover"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-gilroyMedium text-slate-800">{visa.country}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 text-xs font-gilroyMedium text-slate-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                                <Clock className="w-3 h-3" />
                                                {visa.duration}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-gilroyMedium text-primaryBlue">Rs. {parseFloat(visa.price).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 font-gilroyRegular max-w-xs truncate">{visa.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDelete(visa._id)}
                                                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-gilroyMedium transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500 font-gilroyRegular">
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
