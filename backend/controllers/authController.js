const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'creditbook_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });

// @desc    Register with name + email + phone + password + businessName
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, businessName, businessType } = req.body;

    // Validation
    if (!name?.trim())     return res.status(400).json({ success: false, message: 'Full name is required.' });
    if (!email?.trim())    return res.status(400).json({ success: false, message: 'Email address is required.' });
    if (!phone?.trim())    return res.status(400).json({ success: false, message: 'Phone number is required.' });
    if (!password)         return res.status(400).json({ success: false, message: 'Password is required.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    if (confirmPassword && password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });

    // Check if email already exists
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing)
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' });

    const user = await User.create({
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      phone:        phone.trim(),
      password,
      businessName: businessName?.trim() || 'My Business',
      businessType: businessType?.trim() || ''
    });

    const token = genToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }
    res.status(500).json({ success: false, message: e.message });
  }
};

// @desc    Login with email + password
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!password)      return res.status(400).json({ success: false, message: 'Password is required.' });

    // Find user by email, include password for comparison
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with this email. Please register first.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });

    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    const token = genToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update
const updateProfile = async (req, res) => {
  try {
    const { name, phone, businessName, businessType, currency } = req.body;
    const updates = {};
    if (name)         updates.name = name.trim();
    if (phone)        updates.phone = phone.trim();
    if (businessName) updates.businessName = businessName.trim();
    if (businessType !== undefined) updates.businessType = businessType.trim();
    if (currency)     updates.currency = currency;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password is required.' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
