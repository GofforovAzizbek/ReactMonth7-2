import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProductApi,
  fetchProductApi,
  updateProductApi,
  uploadImageApi,
} from "../../services/api";
import { showError, showSuccess } from "../../services/toast";

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

const productSchema = Yup.object({
  title: Yup.string().trim().required("Title is required."),
  description: Yup.string().trim().required("Description is required."),
  price: Yup.number()
    .typeError("Price must be a number.")
    .min(0, "Price cannot be negative.")
    .required("Price is required."),
  discountPercentage: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .typeError("Discount must be a number.")
    .min(0, "Discount cannot be less than 0.")
    .max(100, "Discount cannot be greater than 100."),
  type: Yup.string().trim().required("Type is required."),
  dressStyle: Yup.string().trim().required("Dress style is required."),
  size: Yup.string().trim().required("Size is required."),
  rank: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .typeError("Rank must be a number.")
    .min(0, "Rank cannot be negative."),
  rating: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .typeError("Rating must be a number.")
    .min(0, "Rating cannot be less than 0.")
    .max(5, "Rating cannot be greater than 5."),
  stock: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .typeError("Stock must be a number.")
    .min(0, "Stock cannot be negative."),
  brand: Yup.string().trim().required("Brand is required."),
  category: Yup.string().trim().required("Category is required."),
  thumbnail: Yup.string().url("Image URL is invalid.").nullable(),
});

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
    category: form.category,
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-black/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialForm, setInitialForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!isEdit) return;

      try {
        setLoadingProduct(true);
        const product = await fetchProductApi(id, { fromServer: true });
        if (!product) return;
        setInitialForm(toEditForm(product));
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load product";
        setError(message);
        showError(message, "Product load failed");
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, isEdit]);

  const formik = useFormik({
    initialValues: initialForm,
    enableReinitialize: true,
    validationSchema: productSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        const payload = buildPayload(values);
        if (isEdit) await updateProductApi(id, payload);
        else await createProductApi(payload);
        showSuccess(isEdit ? "Product updated." : "Product created.");
        navigate("/admin");
      } catch (err) {
        const message = err.response?.data?.message || "Save failed";
        setError(message);
        showError(message, "Save failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const hasFieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";

  const handleMainImageUpload = async (file) => {
    if (!file) return;

    setError("");
    setUploadingMain(true);
    try {
      const url = await uploadImageApi(file);
      // Uploaded image is saved directly so preview stays in sync with the form.
      formik.setFieldValue("thumbnail", url, true);
      showSuccess("Main image uploaded.");
    } catch {
      setError("Main image upload failed");
      showError("Main image upload failed");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleGalleryUpload = async (files) => {
    if (!files?.length) return;

    setError("");
    setUploadingGallery(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadImageApi(file));
      }
      formik.setFieldValue("images", [...formik.values.images, ...urls], false);
      showSuccess("Gallery updated.");
    } catch {
      setError("Gallery upload failed");
      showError("Gallery upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index) => {
    formik.setFieldValue(
      "images",
      formik.values.images.filter((_, imageIndex) => imageIndex !== index),
      false,
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="text-sm text-black/60">
          <Link to="/admin" className="transition hover:text-black">
            Admin
          </Link>{" "}
          &gt;{" "}
          <span className="text-black">
            {isEdit ? "Edit Product" : "Add Product"}
          </span>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-black/40">
              Product Editor
            </p>
            <h1 className="mt-2 text-4xl font-black text-black">
              {isEdit ? "Edit Product" : "Add Product"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-black/60">
              Manage product details, images, and storefront presentation in a
              cleaner responsive form.
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black transition hover:border-black"
          >
            Back to Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={formik.handleSubmit}
          className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="card-surface p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Product Information
                </h2>
                <p className="text-sm text-black/50">
                  Basic storefront content and product metadata.
                </p>
              </div>
              {loadingProduct ? (
                <span className="rounded-full bg-[#f0f0f0] px-3 py-1 text-sm text-black/50">
                  Loading...
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Title">
                  <input
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Premium oversized t-shirt"
                    className={`admin-input ${hasFieldError("title") ? "border-red-300" : ""}`}
                  />
                  <FieldError message={hasFieldError("title")} />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Short product description"
                    className={`admin-textarea ${hasFieldError("description") ? "border-red-300" : ""}`}
                  />
                  <FieldError message={hasFieldError("description")} />
                </Field>
              </div>

              <Field label="Price">
                <input
                  name="price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="120"
                  className={`admin-input ${hasFieldError("price") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("price")} />
              </Field>
              <Field label="Discount %">
                <input
                  name="discountPercentage"
                  type="number"
                  value={formik.values.discountPercentage}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="15"
                  className={`admin-input ${hasFieldError("discountPercentage") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("discountPercentage")} />
              </Field>

              <Field label="Rating">
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  value={formik.values.rating}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="4.8"
                  className={`admin-input ${hasFieldError("rating") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("rating")} />
              </Field>
              <Field label="Stock">
                <input
                  name="stock"
                  type="number"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="18"
                  className={`admin-input ${hasFieldError("stock") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("stock")} />
              </Field>

              <Field label="Type">
                <input
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="T-shirts"
                  className={`admin-input ${hasFieldError("type") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("type")} />
              </Field>
              <Field label="Dress Style">
                <input
                  name="dressStyle"
                  value={formik.values.dressStyle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Casual"
                  className={`admin-input ${hasFieldError("dressStyle") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("dressStyle")} />
              </Field>

              <Field label="Size">
                <input
                  name="size"
                  value={formik.values.size}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Medium"
                  className={`admin-input ${hasFieldError("size") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("size")} />
              </Field>
              <Field label="Rank">
                <input
                  name="rank"
                  type="number"
                  value={formik.values.rank}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="10"
                  className={`admin-input ${hasFieldError("rank") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("rank")} />
              </Field>

              <Field label="Brand">
                <input
                  name="brand"
                  value={formik.values.brand}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Shop.co"
                  className={`admin-input ${hasFieldError("brand") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("brand")} />
              </Field>
              <Field label="Category">
                <input
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="T-shirts"
                  className={`admin-input ${hasFieldError("category") ? "border-red-300" : ""}`}
                />
                <FieldError message={hasFieldError("category")} />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Colors">
                  <input
                    name="colorsText"
                    value={formik.values.colorsText}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="00C12B, F50606, 000000"
                    className="admin-input"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-surface p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-black">Main Image</h2>
              <p className="mt-2 text-sm text-black/50">
                Upload the primary storefront image.
              </p>

              <div className="mt-5 space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleMainImageUpload(event.target.files?.[0])
                  }
                  className="admin-input h-auto py-3"
                />
                {uploadingMain ? (
                  <p className="text-sm text-black/50">
                    Uploading main image...
                  </p>
                ) : null}
                <div className="flex min-h-[220px] items-center justify-center rounded-[24px] bg-[#f2f0f1] p-4">
                  {formik.values.thumbnail ? (
                    <img
                      src={formik.values.thumbnail}
                      alt="main preview"
                      className="max-h-[220px] w-full object-contain"
                    />
                  ) : (
                    <p className="text-sm text-black/40">
                      No main image selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-surface p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-black">Gallery</h2>
              <p className="mt-2 text-sm text-black/50">
                Add extra product shots for the detail page gallery.
              </p>

              <div className="mt-5 space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleGalleryUpload(event.target.files)}
                  className="admin-input h-auto py-3"
                />
                {uploadingGallery ? (
                  <p className="text-sm text-black/50">
                    Uploading gallery images...
                  </p>
                ) : null}

                {formik.values.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {formik.values.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative overflow-hidden rounded-[20px] bg-[#f2f0f1] p-2"
                      >
                        <img
                          src={image}
                          alt={`gallery-${index}`}
                          className="h-28 w-full rounded-2xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-white transition hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-black/10 px-4 py-6 text-center text-sm text-black/40">
                    No gallery images yet
                  </div>
                )}
              </div>
            </div>

            <div className="card-surface p-5 sm:p-6">
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingMain ||
                    uploadingGallery ||
                    !formik.isValid ||
                    !formik.dirty
                  }
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : isEdit
                      ? "Save Changes"
                      : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black transition hover:border-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditProduct;
