import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/useAuth";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";

const AdminMenu = () => {
  const [menus, setMenus] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Burger",
    image: "",
    preparationTime: 20,
    isAvailable: true,
  });

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Protect Route - Admin Check
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (user.role !== "admin") {
        alert("Access Denied: Only Admins can view this page!");
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  // Fetch all menu items
  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      const res = await API.get("/getMenu");
      if (res.data.status === "success") {
        setMenus(res.data.menus || []);
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError(err.response?.data?.message || "Could not load menu items. Please try again.");
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      const fetchTimer = window.setTimeout(fetchMenu, 0);
      return () => window.clearTimeout(fetchTimer);
    }
  }, [user]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Burger",
      image: "",
      preparationTime: 20,
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category || "Burger",
      image: item.image || "",
      preparationTime: item.preparationTime || 20,
      isAvailable: item.isAvailable !== false,
    });
    setIsModalOpen(true);
  };

  // ছবি সিলেক্ট করার সাথে সাথে সার্ভারে আপলোড হয়ে যাবে, base64 আর ফর্মে যাবে না
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await API.post("/uploadMenuImage", fd);

      if (res.data.status === "success") {
        setFormData((prev) => ({ ...prev, image: res.data.image }));
      } else {
        throw new Error(res.data.message || "Image upload failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const description = formData.description.trim();
    if (!description) {
      alert("Please provide a description");
      return;
    }

    try {
      setSubmitting(true);
      const menuData = {
        ...formData,
        description,
        image: typeof formData.image === "string" ? formData.image : "",
      };
      if (editingItem) {
        const menuId = editingItem._id || editingItem.id;
        if (!menuId) {
          throw new Error("Food item ID is missing");
        }
        const res = await API.put(`/updateMenu/${menuId}`, menuData);
        if (res.data.status === "success") {
          setMenus((prev) =>
            prev.map((m) => ((m._id || m.id) === menuId ? res.data.data : m))
          );
          setIsModalOpen(false);
        } else {
          throw new Error(res.data.message || "Food update failed");
        }
      } else {
        // Create
        const res = await API.post("/createMenu", menuData);
        if (res.data.status === "success") {
          setMenus((prev) => [res.data.data, ...prev]);
          setIsModalOpen(false);
        } else {
          throw new Error(res.data.message || "Food creation failed");
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed!");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Food Item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      const res = await API.delete(`/deleteMenu/${id}`);
      if (res.data.status === "success") {
        setMenus((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item");
    }
  };

  if (loading || loadingMenu) {
    return <div className="text-center py-20 font-semibold text-gray-500">Loading Menu Items...</div>;
  }

  return (
    <div className="min-h-[90vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Food Menu</h1>
            <p className="text-sm text-gray-500 mt-1">Add, update prices, and organize your restaurant dishes</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Food</span>
          </button>
        </div>

        {/* Menu Grid */}
        {error ? (
          <div className="bg-red-50 text-red-600 rounded-2xl p-8 text-center">{error}</div>
        ) : menus.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-gray-400">No menu items found.</div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menus.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image.startsWith("/uploads") ? `${BACKEND_URL}${item.image}` : item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-amber-700 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                    {item.category || "Food"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                    <span className="font-bold text-amber-600 text-base whitespace-nowrap">৳{item.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description || "No description provided."}</p>
                  <p className="text-xs text-gray-400">⏱️ Prep: {item.preparationTime || 20} mins</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2 border-t border-gray-50 mt-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg border border-gray-200 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex items-center justify-center text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-2 rounded-lg border border-red-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Modal Form for Add / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Crispy Chicken Burger"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (৳)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="250"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                    >
                      <option value="Burger">Burger</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Rice">Rice & Meal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Food Image</label>

                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer bg-gray-50 overflow-hidden shrink-0"
                    >
                      {formData.image ? (
                        <img
                          src={formData.image.startsWith("/uploads") ? `${BACKEND_URL}${formData.image}` : formData.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingImage}
                      className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-200"
                    >
                      {uploadingImage ? "Uploading..." : formData.image ? "Change Image" : "Upload Image"}
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Prep Time (mins)</label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      placeholder="20"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      Available for Order
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="2"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short details about the dish..."
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-sm transition"
                  >
                    {submitting ? "Saving..." : editingItem ? "Update Food" : "Save Food"}
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

export default AdminMenu;