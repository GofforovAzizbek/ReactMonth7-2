import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProductApi,
  fetchProductApi,
  updateProductApi,
  uploadImageApi,
} from "../../services/api";

const INITIAL_FORM = {
  title: "",
  description: "",
  price: "",
  discountPercentage: "",
  type: "T-shirts",
  dressStyle: "Casual",
  size: "Medium",
  colorsText: "",
  rank: "",
  rating: "",
  stock: "",
  brand: "",
  category: "",
  thumbnail: "",
  images: [],
};

function toEditForm(product) {
  const gallery = (product.images || product.pictures || []).filter(Boolean);
  return {
    title: product.title || product.name || "",
    description: product.description || "",
    price: product.price ?? "",
    discountPercentage: product.discountPercentage ?? product.discount ?? "",
    type: product.type || product.category || "T-shirts",
    dressStyle: product.dressStyle || "Casual",
    size: product.size || (product.sizes && product.sizes[0]) || "Medium",
    colorsText: (product.colors || []).join(", "),
    rank: product.rank ?? 0,
    rating: product.rating ?? "",
    stock: product.stock ?? "",
    brand: product.brand || "",
    category: product.category || "",
    thumbnail: product.thumbnail || gallery[0] || "",
    images: gallery,
  };
}

function buildPayload(form) {
  const images = form.images.filter(Boolean);
  const colors = form.colorsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    title: form.title,
    name: form.title,
    description: form.description,
    price: form.price,
    discountPercentage: form.discountPercentage,
    type: form.type,
    category: form.type,
    dressStyle: form.dressStyle,
    size: form.size,
    colors,
    rank: form.rank,
    rating: form.rating,
    stock: form.stock,
    brand: form.brand,
    thumbnail: form.thumbnail,
    images,
    pictures: images.length ? images : form.thumbnail ? [form.thumbnail] : [],
  };
}

function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState("");

  // Edit bo'lsa mavjud ma'lumotni formga yuklaymiz
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEdit) return;
      try {
        const product = await fetchProductApi(id, { fromServer: true });
        if (!product) return;
        setForm(toEditForm(product));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      }
    };
    loadProduct();
  }, [id, isEdit]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Asosiy rasm upload
  const handleMainImageUpload = async (file) => {
    if (!file) return;
    setError("");
    setUploadingMain(true);
    try {
      const url = await uploadImageApi(file);
      updateField("thumbnail", url);
    } catch {
      setError("Main image upload failed");
    } finally {
      setUploadingMain(false);
    }
  };

  // Gallery rasmlar upload (multiple)
  const handleGalleryUpload = async (files) => {
    if (!files?.length) return;
    setError("");
    setUploadingGallery(true);

    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadImageApi(file));
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch {
      setError("Gallery upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = buildPayload(form);
      if (isEdit) await updateProductApi(id, payload);
      else await createProductApi(payload);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Product" : "Add Product"}
      </h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
        <input
          name="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="Price"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            value={form.discountPercentage}
            onChange={(e) => updateField("discountPercentage", e.target.value)}
            placeholder="Discount %"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="0.1"
            value={form.rating}
            onChange={(e) => updateField("rating", e.target.value)}
            placeholder="Rating"
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            placeholder="Stock"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            placeholder="Type (T-shirts, Jeans...)"
            className="w-full border p-2 rounded"
          />
          <input
            value={form.dressStyle}
            onChange={(e) => updateField("dressStyle", e.target.value)}
            placeholder="Dress Style (Casual, Formal...)"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.size}
            onChange={(e) => updateField("size", e.target.value)}
            placeholder="Size (Small, Medium...)"
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            value={form.rank}
            onChange={(e) => updateField("rank", e.target.value)}
            placeholder="Rank"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            value={form.colorsText}
            onChange={(e) => updateField("colorsText", e.target.value)}
            placeholder="Colors (comma): 00C12B, F50606"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.brand}
            onChange={(e) => updateField("brand", e.target.value)}
            placeholder="Brand"
            className="w-full border p-2 rounded"
          />
          <input
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            placeholder="Category (optional)"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Main Image (asosiy rasm)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleMainImageUpload(e.target.files?.[0])}
            className="w-full border p-2 rounded"
          />
          {uploadingMain && (
            <p className="text-sm text-blue-600">Uploading main image...</p>
          )}
          {form.thumbnail && (
            <img
              src={form.thumbnail}
              alt="main preview"
              className="w-28 h-28 object-cover rounded border"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Gallery Images (galereya)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleGalleryUpload(e.target.files)}
            className="w-full border p-2 rounded"
          />
          {uploadingGallery && (
            <p className="text-sm text-blue-600">Uploading gallery...</p>
          )}

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
              {form.images.map((img, idx) => (
                <div key={`${img}-${idx}`} className="relative">
                  <img
                    src={img}
                    alt={`gallery-${idx}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            disabled={loading || uploadingMain || uploadingGallery}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEditProduct;
