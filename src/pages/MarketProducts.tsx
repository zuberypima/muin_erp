import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

interface Product {
  ProductName: string;
  PostedtBy: string;
  AvaialbeKg: number;
  PricePerKg: number;
  ImageURL?: string;
}

const MarketProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/marketproducts/');
        setProducts(res.data || []);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log("MarketProducts endpoint not yet implemented on the Django backend.");
        } else {
          console.error("Error fetching product details:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container-fluid py-2 fade-in" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Market Products</h2>
          <p className="text-muted">Browse currently available agricultural products.</p>
        </div>
      </div>

      {loading ? (
        <div className="row">
          {[1, 2, 3, 4].map((i) => (
            <div className="col-md-6 col-lg-3 mb-4" key={i}>
              <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
                <div className="bg-secondary opacity-25 placeholder-wave" style={{ height: '200px' }}></div>
                <div className="card-body">
                  <h5 className="card-title placeholder-glow"><span className="placeholder col-6"></span></h5>
                  <p className="card-text placeholder-glow"><span className="placeholder col-4"></span></p>
                  <p className="card-text placeholder-glow"><span className="placeholder col-8"></span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {products.map((product, index) => (
            <div className="col-md-6 col-lg-3 mb-4" key={index}>
              <div className="card h-100 border-0" style={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
              }}
              >
                <div className="position-relative">
                  <img
                    src={product.ImageURL || 'https://res.cloudinary.com/dbj1lhuje/image/upload/v1742116139/i_7_vtyf9c.webp'}
                    className="card-img-top"
                    alt={product.ProductName}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                  <span className="badge bg-success position-absolute top-0 end-0 m-3 px-3 py-2" style={{ borderRadius: '8px' }}>
                    {product.PricePerKg} TZS / Kg
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold text-dark mb-3">
                    {product.ProductName}
                  </h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted"><i className="fas fa-user-circle me-2"></i>Seller</span>
                    <span className="fw-medium text-dark">{product.PostedtBy}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted"><i className="fas fa-box me-2"></i>Stock</span>
                    <span className="fw-medium text-dark">{product.AvaialbeKg} Kg</span>
                  </div>
                  <button className="btn mt-auto w-100" style={{ 
                    backgroundColor: '#ecfdf5', 
                    color: '#10b981', 
                    fontWeight: 600,
                    borderRadius: '8px' 
                  }}>
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketProducts;
