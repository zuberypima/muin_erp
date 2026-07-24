import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import muinLogo from '../assets/muin-logo.png';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('https://muinerpapi-production.up.railway.app/api/token/', {
        username,
        password,
      });

      login(response.data.access, response.data.refresh);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="login-card">
        <div className="text-center mb-4">
          <img src={muinLogo} alt="Logo" style={{ height: '80px', objectFit: 'contain', marginBottom: '1rem' }} />
          <h3 className="fw-bold text-dark">Muin <span className="text-primary-green">ERP</span></h3>
          <p className="text-muted mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2" role="alert" style={{ fontSize: '14px' }}>
            <i className="fas fa-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-muted fw-semibold small">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="fas fa-user text-muted"></i></span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label text-muted fw-semibold small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="fas fa-lock text-muted"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control bg-light border-start-0 border-end-0 ps-0"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Hide password" : "Show password"}
                style={{ cursor: 'pointer', border: '1px solid #ced4da' }}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn w-100 fw-bold py-2 shadow-sm login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
