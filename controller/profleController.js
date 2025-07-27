const { User } = require('../models');
const cloudinary = require('cloudinary').v2;

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; 
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No image uploaded' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    user.profileImageUrl = file.path;
    user.profileImagePublicId = file.filename;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImageUrl: user.profileImageUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
  
};
const getProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['username', 'email', 'profileImageUrl']
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      username: user.username,
      email: user.email,
      profileImage: user.profileImageUrl || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve profile', error: err.message });
  }
};

module.exports = { uploadProfileImage,getProfileImage};
