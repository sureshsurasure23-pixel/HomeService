import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Layers,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Service, ServiceCategory } from '../../types.ts';

export const ManageServicesPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useNotifications();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('599');
  const [durationMins, setDurationMins] = useState('60');
  const [imageUrl, setImageUrl] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const [allCats, allServs] = await Promise.all([
        api.getCategories(),
        api.getServices({ provider_id: profile?.id }),
      ]);
      setCategories(allCats);
      setServices(allServs);
      if (allCats.length > 0 && !categoryId) {
        setCategoryId(allCats[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [profile?.id]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setPrice('75');
    setDurationMins('60');
    setImageUrl('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80');
    setFeatures(['Certified tools included', '100% satisfaction guarantee']);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description);
    setCategoryId(service.category_id);
    setPrice(String(service.price));
    setDurationMins(String(service.duration_mins));
    setImageUrl(service.image_url);
    setFeatures(service.features || []);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures((prev) => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        category_id: categoryId,
        price: Number(price),
        duration_mins: Number(durationMins),
        image_url:
          imageUrl ||
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
        features,
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
        showToast('success', 'Service updated successfully!');
      } else {
        await api.createService(payload);
        showToast('success', 'New service added to your catalog!');
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, serviceTitle: string) => {
    if (confirm(`Are you sure you want to delete "${serviceTitle}"?`)) {
      try {
        await api.deleteService(id);
        showToast('success', `Service "${serviceTitle}" removed.`);
        fetchServices();
      } catch (err: any) {
        showToast('error', err.message || 'Failed to delete service.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Manage Service Catalog</h1>
            <p className="text-xs text-slate-400 mt-1">
              Add new services, adjust pricing, and detail the features you provide to customers.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading catalog...</div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No services published yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Add your first service to start receiving customer bookings.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
            >
              + Create Service Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="relative h-44">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full text-[10px] font-semibold text-blue-300">
                      {service.category?.name || 'Service'}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-900/90 px-3 py-1 rounded-xl text-xs font-bold text-emerald-400">
                      ₹{service.price}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-white">{service.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{service.description}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {service.duration_mins} mins
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        {service.features?.length || 0} features
                      </span>
                    </div>

                    {service.features && service.features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {service.features.slice(0, 2).map((f, idx) => (
                          <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-1">
                {editingService ? 'Edit Service Offering' : 'Add New Service Offering'}
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Fill in the service details below to display in the marketplace catalog.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Service Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Master Pipe Leak Repair & Hydro Jetting"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Fixed Price (₹) *</label>
                    <input
                      type="number"
                      min="10"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Mins) *</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={durationMins}
                      onChange={(e) => setDurationMins(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Detailed explanation of the workflow, scope, and guarantees..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Features Builder */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Included Features / Checklist
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="e.g. 90-day warranty, camera inspection..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 text-xs text-slate-200"
                      >
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-slate-400 hover:text-rose-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : editingService
                      ? 'Save Changes'
                      : 'Publish Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
