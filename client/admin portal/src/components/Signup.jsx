



////////////////// python signup 


// import React, { useState } from 'react';
// import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Gavel } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// const AdminSignup = ({ onSignupSuccess, onBackToLogin, userType = 'admin' }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     expertise: '',
//     bio: ''
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     // Validation
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       return;
//     }

//     setLoading(true);

//     try {
//       let endpoint, requestBody;

//       if (userType === 'admin') {
//         endpoint = `${API_BASE_URL}/admin/register`;
//         requestBody = {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           role: 'admin'
//         };
//       } else if (userType === 'judge') {
//         endpoint = `${API_BASE_URL}/judge/register`;
//         // Generate a simple ID for the judge (backend will handle proper ID generation)
//         const judgeId = `judge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//         requestBody = {
//           id: judgeId,
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           expertise: formData.expertise.split(',').map(item => item.trim()).filter(item => item),
//           bio: formData.bio || '',
//           assigned_teams: [],
//           rounds: []
//         };
//       }

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || `Failed to create ${userType} account`);
//       }

//       setSuccess(`${userType.charAt(0).toUpperCase() + userType.slice(1)} account created successfully! You can now login.`);
//       setFormData({
//         name: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         expertise: '',
//         bio: ''
//       });

//       // Auto-redirect to login after 2 seconds
//       setTimeout(() => {
//         if (onSignupSuccess) onSignupSuccess();
//       }, 2000);

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
//       <div className="card" style={{ width: '100%', maxWidth: 450 }}>
//         <div className="card-header">
//           <h3>
//             {userType === 'admin' ? 'Create Admin Account' : 'Create Judge Account'}
//           </h3>
//           <p className="page-subtitle">
//             {userType === 'admin' 
//               ? 'Set up your administrator account' 
//               : 'Set up your judge account for evaluations'
//             }
//           </p>
//         </div>
//         <div className="card-body">
//           {error && (
//             <div className="alert alert-error" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
//               <AlertCircle size={16} />
//               <span>{error}</span>
//             </div>
//           )}

//           {success && (
//             <div className="alert alert-success" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
//               <CheckCircle size={16} />
//               <span>{success}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label className="form-label">Full Name</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <User size={18} className="search-icon" />
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Your full name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="form-input"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Email</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <Mail size={18} className="search-icon" />
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder={userType === 'admin' ? 'admin@example.com' : 'judge@example.com'}
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="form-input"
//                   required
//                 />
//               </div>
//             </div>

//             {userType === 'judge' && (
//               <>
//                 <div className="form-group">
//                   <label className="form-label">Expertise (comma-separated)</label>
//                   <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <Gavel size={18} className="search-icon" />
//                     <input
//                       type="text"
//                       name="expertise"
//                       placeholder="e.g., Web Development, AI, Blockchain"
//                       value={formData.expertise}
//                       onChange={handleChange}
//                       className="form-input"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Bio (Optional)</label>
//                   <textarea
//                     name="bio"
//                     placeholder="Brief introduction about yourself..."
//                     value={formData.bio}
//                     onChange={handleChange}
//                     className="form-input"
//                     rows="3"
//                     style={{ resize: 'vertical' }}
//                   />
//                 </div>
//               </>
//             )}

//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <Lock size={18} className="search-icon" />
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="form-input"
//                   required
//                   minLength={6}
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Confirm Password</label>
//               <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <Lock size={18} className="search-icon" />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   placeholder="••••••••"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="form-input"
//                   required
//                   minLength={6}
//                 />
//               </div>
//             </div>

//             <div className="action-buttons" style={{ marginTop: 16 }}>
//               <button 
//                 type="submit" 
//                 className="btn btn-primary" 
//                 style={{ width: '100%' }}
//                 disabled={loading}
//               >
//                 {userType === 'admin' ? <UserPlus size={16} /> : <Gavel size={16} />}
//                 {loading 
//                   ? `Creating ${userType} Account...` 
//                   : `Create ${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`
//                 }
//               </button>
//             </div>
//           </form>

//           <div style={{ marginTop: 16, textAlign: 'center' }}>
//             <button 
//               type="button" 
//               className="btn btn-secondary" 
//               style={{ width: '100%' }}
//               onClick={onBackToLogin}
//             >
//               Back to Login
//             </button>
//           </div>

//           {userType === 'admin' && (
//             <div style={{ marginTop: 12, textAlign: 'center' }}>
//               <p style={{ marginBottom: 8 }}>Need to create a judge account?</p>
//               <button 
//                 type="button" 
//                 className="btn btn-outline" 
//                 style={{ width: '100%' }}
//                 onClick={() => window.location.href = '/judge-signup'}
//               >
//                 Go to Judge Signup
//               </button>
//             </div>
//           )}

//           {userType === 'judge' && (
//             <div style={{ marginTop: 12, textAlign: 'center' }}>
//               <p style={{ marginBottom: 8 }}>Need to create an admin account?</p>
//               <button 
//                 type="button" 
//                 className="btn btn-outline" 
//                 style={{ width: '100%' }}
//                 onClick={() => window.location.href = '/admin-signup'}
//               >
//                 Go to Admin Signup
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminSignup;












//////////////////// node js 




import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';


const AdminSignup = ({ onSignupSuccess, onBackToLogin, userType = 'admin' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create admin account');
      }

      setSuccess('Admin account created successfully! You can now login.');
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        if (onSignupSuccess) onSignupSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card" style={{
      maxWidth: '450px',
      margin: '2rem auto',
      padding: '2rem'
    }}>
      <div className="page-header">
        <h3 className="page-title">
          {userType === 'admin' ? 'Create Admin Account' : 'Create Judge Account'}
        </h3>
        <p className="page-subtitle">
          {userType === 'admin'
            ? 'Set up your administrator account'
            : 'Set up your judge account for evaluations'
          }
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee',
          color: '#c33',
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#efe',
          color: '#363',
          border: '1px solid #cfc',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input"
              required
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="email"
              name="email"
              placeholder={userType === 'admin' ? 'admin@example.com' : 'judge@example.com'}
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              minLength={6}
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
              minLength={6}
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div className="action-buttons" style={{ marginTop: '16px' }}>
          <button
            type="submit"
            className="btn-upload"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            <UserPlus size={16} />
            {loading
              ? `Creating ${userType} Account...`
              : `Create ${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`
            }
          </button>
        </div>
      </form>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          type="button"
          className="btn-upload"
          style={{
            width: '100%',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '1px solid #667eea'
          }}
          onClick={onBackToLogin}
        >
          Back to Login
        </button>
      </div>

      {userType === 'admin' && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <p style={{ marginBottom: '8px', color: '#666' }}>Need to create a judge account?</p>
          <button
            type="button"
            className="btn-upload"
            style={{
              width: '100%',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea'
            }}
            onClick={() => window.location.href = '/judge-signup'}
          >
            Go to Judge Signup
          </button>
        </div>
      )}

      {userType === 'judge' && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <p style={{ marginBottom: '8px', color: '#666' }}>Need to create an admin account?</p>
          <button
            type="button"
            className="btn-upload"
            style={{
              width: '100%',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea'
            }}
            onClick={() => window.location.href = '/admin-signup'}
          >
            Go to Admin Signup
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSignup;