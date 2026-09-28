import React, { useState, useEffect } from 'react';
import { visaAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Plus, X, Trash2, Clock, Pencil } from 'lucide-react';

const VisaList = () => {
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add form state
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [addForm, setAddForm] = useState({
        country: '', duration: '', price: '', description: '', coverImage: null
    });
    const [addImagePreview, setAddImagePreview] = useState('');

    // Edit form state
    const [editingId, setEditingId] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        country: '', duration: '', price: '', description: '', coverImage: null
    });
    const [editImagePreview, setEditImagePreview] = useState('');

    const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

    // ── Fetch all visas ──────────────────────────────────────────────────────
    const fetchVisas = async () => {
        try {
            const token = getToken();
            if (!token) { window.location.href = '/login'; return; }

            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/visas`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = Array.isArray(response.data)
                ? response.data
                : (response.data.visas || response.data.data || []);
            setVisas(data);
        } catch (error) {
            console.error('Error fetching visas:', error);
            toast.error('Failed to load visas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVisas(); }, []);

    // ── Add form helpers ─────────────────────────────────────────────────────
    const resetAddForm = () => {
        setAddForm({ country: '', duration: '', price: '', description: '', coverImage: null });
        setAddImagePreview('');
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAddForm(prev => ({ ...prev, coverImage: file }));
        const reader = new FileReader();
        reader.onloadend = () => setAddImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = getToken();
        if (!token) { toast.error('Authentication required.'); return; }

        const fd = new FormData();
        fd.append('country', addForm.country);
        fd.append('duration', addForm.duration);
        fd.append('price', addForm.price);
        fd.append('description', addForm.description);
        if (addForm.coverImage) fd.append('coverImage', addForm.coverImage);

        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/visas`,
                fd,
                { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
            );
            toast.success(`${addForm.country} visa added successfully`);
            resetAddForm();
            setIsAdding(false);
            fetchVisas();
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token'); localStorage.removeItem('adminToken');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.message || 'Failed to add visa');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ── Edit form helpers ────────────────────────────────────────────────────
    const openEdit = (visa) => {
        setEditingId(visa._id);
        setEditForm({
            country: visa.country,
            duration: visa.duration,
            price: visa.price,
            description: visa.description,
            coverImage: null
        });
        setEditImagePreview(visa.coverImage || '');
        // Close add form if open
        setIsAdding(false);
        resetAddForm();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ country: '', duration: '', price: '', description: '', coverImage: null });
        setEditImagePreview('');
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditForm(prev => ({ ...prev, coverImage: file }));
        const reader = new FileReader();
        reader.onloadend = () => setEditImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const token = getToken();
        if (!token) { toast.error('Authentication required.'); return; }

        const fd = new FormData();
        fd.append('country', editForm.country);
        fd.append('duration', editForm.duration);
        fd.append('price', editForm.price);
        fd.append('description', editForm.description);
        if (editForm.coverImage) fd.append('coverImage', editForm.coverImage);

        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/visas/${editingId}`,
                fd,
                { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
            );
            toast.success(`${editForm.country} visa updated successfully`);
            cancelEdit();
            fetchVisas();
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token'); localStorage.removeItem('adminToken');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.message || 'Failed to update visa');
            }
        } finally {
            setUpdating(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this visa?')) return;
        try {
            await visaAPI.delete(id);
            toast.success('Visa deleted successfully');
            if (editingId === id) cancelEdit();
            fetchVisas();
        } catch (error) {
            console.error('Error deleting visa:', error);
            toast.error('Failed to delete visa');
        }
    };

    // ── Shared form fields renderer ──────────────────────────────────────────
    const FormFields = ({ form, onChangeText, onChangeImage, imagePreview, isEdit }) => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Country</label>
                    <input
                        type="text" name="country" value={form.country}
                        onChange={onChangeText} required
                        placeholder="e.g., Malaysia"
                        className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Duration</label>
                    <input
                        type="text" name="duration" value={form.duration}
                        onChange={onChangeText} required
                        placeholder="e.g., 30 days"
                        className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Price (Rs.)</label>
                    <input
                        type="number" name="price" value={form.price}
                        onChange={onChangeText} required min="0" step="0.01"
                        placeholder="e.g., 15000"
                        className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">
                        Cover Image {isEdit && <span className="text-slate-400 font-gilroyRegular">(leave blank to keep current)</span>}
                    </label>
                    <input
                        type="file" accept="image/*"
                        onChange={onChangeImage}
                        required={!isEdit}
                        className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primaryBlue/10 file:text-primaryBlue file:font-gilroyMedium"
                    />
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-lg" />
                    )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-gilroyMedium text-slate-700 mb-1.5">Description</label>
                <textarea
                    name="description" value={form.description}
                    onChange={onChangeText} required rows="3"
                    placeholder="Brief description of the visa and what's included"
                    className="block w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                />
            </div>
        </>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryBlue"></div>
            </div>
        );
    }

    return (
        <div>
            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-gilroyMedium text-slate-800">All Visas</h2>
                    <p className="text-sm text-slate-500 font-gilroyRegular">Manage the visa packages shown to travellers</p>
                </div>
                <button
                    onClick={() => {
                        if (isAdding) { resetAddForm(); setIsAdding(false); }
                        else { cancelEdit(); setIsAdding(true); }
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white px-4 py-2.5 rounded-xl font-gilroyMedium text-sm shadow-md hover:shadow-lg transition-all"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Cancel' : 'Add New Visa'}
                </button>
            </div>

            {/* ── Add Form ── */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border-l-4 border-primaryBlue">
                    <h3 className="text-lg font-gilroyMedium text-slate-800 mb-4">Add New Visa</h3>
                    <form onSubmit={handleAddSubmit} className="space-y-5">
                        <FormFields
                            form={addForm}
                            onChangeText={handleAddChange}
                            onChangeImage={handleAddImageChange}
                            imagePreview={addImagePreview}
                            isEdit={false}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => { resetAddForm(); setIsAdding(false); }}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-gilroyMedium text-sm hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting}
                                className="px-5 py-2.5 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white font-gilroyMedium text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {submitting ? 'Saving...' : 'Save Visa'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Edit Form ── */}
            {editingId && (
                <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border-l-4 border-amber-400">
                    <h3 className="text-lg font-gilroyMedium text-slate-800 mb-1">Edit Visa</h3>
                    <p className="text-sm text-slate-500 font-gilroyRegular mb-4">
                        Editing: <span className="font-gilroyMedium text-slate-700">{editForm.country}</span>
                    </p>
                    <form onSubmit={handleEditSubmit} className="space-y-5">
                        <FormFields
                            form={editForm}
                            onChangeText={handleEditChange}
                            onChangeImage={handleEditImageChange}
                            imagePreview={editImagePreview}
                            isEdit={true}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={cancelEdit}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-gilroyMedium text-sm hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={updating}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-gilroyMedium text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {updating ? 'Updating...' : 'Update Visa'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Table ── */}
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
                                    <tr
                                        key={visa._id}
                                        className={`hover:bg-gray-50/80 transition-colors ${editingId === visa._id ? 'bg-amber-50/40' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {visa.coverImage && (
                                                <img src={visa.coverImage} alt={visa.country}
                                                    className="h-11 w-11 rounded-xl object-cover" />
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
                                            <div className="text-sm font-gilroyMedium text-primaryBlue">
                                                Rs. {parseFloat(visa.price).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 font-gilroyRegular max-w-xs truncate">
                                                {visa.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => editingId === visa._id ? cancelEdit() : openEdit(visa)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-gilroyMedium transition-colors ${
                                                        editingId === visa._id
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                            : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    {editingId === visa._id
                                                        ? <><X className="w-3.5 h-3.5" /> Cancel</>
                                                        : <><Pencil className="w-3.5 h-3.5" /> Edit</>
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(visa._id)}
                                                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-gilroyMedium transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </div>
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
