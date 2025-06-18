import React, { useCallback, useState, useEffect } from "react";
import "./ProductList.css";
import { useSearchParams } from "react-router-dom";

const FUNCTIONS = process.env.REACT_APP_FUNCTIONS_BASE_URL;

function ProductList() {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get("project");

  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [formData, setFormData] = useState({
    type: "subscription",
    name: "",
    price: "",
    description: "",
    frequency: "monthly",
    recurring: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchProducts = useCallback(async () => {
    if (!projectName) return;
    setFetchingProducts(true);
    try {
      const response = await fetch(`${FUNCTIONS}/getProducts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectName }),
      });
      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        console.error('Error fetching products:', result.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setFetchingProducts(false);
    }
  }, [projectName]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async () => {
    const { name, type, price, description, frequency, recurring } = formData;
    const parsedPrice = parseInt(price, 10);
    setFormErrors({});
    const errors = {};
    if (!name.trim()) errors.name = "Product name is required";
    if (!price.trim()) {
      errors.price = "Price is required";
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = "Price must be a positive number greater than 0";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const requestBody = {
        projectName,
        name: name.trim(),
        type,
        price: parsedPrice,
        description: description.trim() || "",
        ...(type === "subscription" && { frequency, recurring }),
      };
      const response = await fetch(`${FUNCTIONS}/addProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (result.success) {
        setShowModal(false);
        setFormData({
          type: "subscription",
          name: "",
          price: "",
          description: "",
          frequency: "monthly",
          recurring: false,
        });
        setFormErrors({});
        await fetchProducts();
      } else {
        setFormErrors({ general: result.error || 'Failed to add product' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setFormErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${FUNCTIONS}/deleteProduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, productId }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchProducts();
      } else {
        alert(result.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await fetch(`${FUNCTIONS}/updateProduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, productId, updates: { status: newStatus } }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchProducts();
      } else {
        alert(result.error || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Network error. Please try again.');
    }
  };

  const getStatusColor = (status) => status === "active" ? "#4CAF50" : "#f44336";
  const getStatusText = (status) => status === "active" ? "Active" : "Inactive";

  return (
    <div className="product-list">
      <h2>Products</h2>
      <button className="add-button" onClick={() => setShowModal(true)}>+</button>
      {fetchingProducts && <p>Loading products...</p>}
      <ul className="product-grid">
        {products.map((product) => (
          <li key={product.id} className="product-card">
            <div className="product-summary">
              <h3>{product.name}</h3>
              <p>{product.type} - ${product.price}</p>
              {product.type === "subscription" && (
                <p>{product.frequency} • {product.recurring ? "Recurring" : "One-Time"}</p>
              )}
              {product.description && <p>{product.description}</p>}
              <p className="status" style={{ color: getStatusColor(product.status) }}>
                {getStatusText(product.status)}
              </p>
            </div>
            <div className="product-actions">
              <button onClick={() => handleToggleStatus(product.id, product.status)}>
                {product.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => handleDeleteProduct(product.id)} className="delete-button">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowModal(false)}>✕</span>
            <h3>Add New Product</h3>

            {formErrors.general && <div className="error">{formErrors.general}</div>}

            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <div className="error">{formErrors.name}</div>}

            <label htmlFor="price">Price:</label>
            <input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            {formErrors.price && <div className="error">{formErrors.price}</div>}

            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <label htmlFor="type">Type:</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="subscription">Subscription</option>
              <option value="one-time">One-Time</option>
              <option value="repurchase">Re-Purchasable</option>
            </select>

            {formData.type === "subscription" && (
              <>
                <label htmlFor="frequency">Frequency:</label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  />
                  Recurring
                </label>
              </>
            )}

            <div className="modal-actions">
              <button onClick={handleAddProduct} disabled={loading}>
                {loading ? "Adding..." : "Add Product"}
              </button>
              <button onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
