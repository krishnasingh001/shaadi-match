import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProfileBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname === '/profile/edit';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(isEditMode);
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    height: '',
    // Family & Background
    religion: '',
    caste: '',
    sub_caste: '',
    marital_status: 'never_married',
    diet: 'vegetarian',
    drinking: 'no',
    smoking: 'no',
    // Education & Career
    education: '',
    profession: '',
    annual_income: '',
    // Location
    city: '',
    state: '',
    country: 'India',
    // Additional
    about_me: '',
    family_details: '',
    father_name: '',
    mother_name: '',
    siblings: '',
    native_place: '',
    languages_spoken: '',
  });

  useEffect(() => {
    if (isEditMode) {
      fetchProfile();
    }
  }, [isEditMode]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profile = response.data;
      
      // Format date for input field
      const dateOfBirth = profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '';
      
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        date_of_birth: dateOfBirth,
        gender: profile.gender || '',
        height: profile.height || '',
        religion: profile.religion || '',
        caste: profile.caste || '',
        sub_caste: profile.sub_caste || '',
        marital_status: profile.marital_status || 'never_married',
        diet: profile.diet || 'vegetarian',
        drinking: profile.drinking || 'no',
        smoking: profile.smoking || 'no',
        education: profile.education || '',
        profession: profile.profession || '',
        annual_income: profile.annual_income || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'India',
        about_me: profile.about_me || '',
        family_details: profile.family_details || '',
        father_name: profile.father_name || '',
        mother_name: profile.mother_name || '',
        siblings: profile.siblings || '',
        native_place: profile.native_place || '',
        languages_spoken: profile.languages_spoken || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put('/profiles/current', { profile: formData });
        toast.success('Profile updated successfully!');
        navigate('/profile');
      } else {
        await api.post('/profiles', { profile: formData });
        toast.success('Profile created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      if (isEditMode) {
        toast.error(error.response?.data?.errors?.[0] || 'Failed to update profile');
      } else {
        toast.error(error.response?.data?.errors?.[0] || 'Failed to create profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required className="input-field">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm) *</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Family & Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Religion *</label>
                <input type="text" name="religion" value={formData.religion} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caste *</label>
                <input type="text" name="caste" value={formData.caste} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Caste</label>
                <input type="text" name="sub_caste" value={formData.sub_caste} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status *</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} required className="input-field">
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diet</label>
                <select name="diet" value={formData.diet} onChange={handleChange} className="input-field">
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drinking</label>
                <select name="drinking" value={formData.drinking} onChange={handleChange} className="input-field">
                  <option value="no">No</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Smoking</label>
                <select name="smoking" value={formData.smoking} onChange={handleChange} className="input-field">
                  <option value="no">No</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Education & Career</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education *</label>
                <input type="text" name="education" value={formData.education} onChange={handleChange} required className="input-field" placeholder="e.g., B.Tech, MBA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession *</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                <input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">Additional Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                <textarea name="about_me" value={formData.about_me} onChange={handleChange} rows="4" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Details</label>
                <textarea name="family_details" value={formData.family_details} onChange={handleChange} rows="4" className="input-field" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                  <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                  <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Siblings</label>
                  <input type="text" name="siblings" value={formData.siblings} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Native Place</label>
                  <input type="text" name="native_place" value={formData.native_place} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                  <input type="text" name="languages_spoken" value={formData.languages_spoken} onChange={handleChange} className="input-field" placeholder="e.g., Hindi, English" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            {isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-gray-600">Step {step} of 5</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-pink-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {step < 5 ? (
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || loadingProfile} className="btn-primary">
                {loading ? 'Saving...' : isEditMode ? 'Update Profile' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBuilder;

