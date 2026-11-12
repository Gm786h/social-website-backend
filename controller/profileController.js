const { User } = require('../models');
const cloudinary = require('../config/cloudinary');

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove the previous image from Cloudinary; a failure here should not block the upload.
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        console.warn('Failed to delete old profile image:', err.message);
      }
    }

    user.profileImageUrl = req.file.path;
    user.profileImagePublicId = req.file.filename;
    await user.save();

    return res.json({
      message: 'Profile image uploaded successfully',
      profileImageUrl: user.profileImageUrl,
    });
  } catch (err) {
    return next(err);
  }
};

const getProfileImage = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'email', 'profileImageUrl'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      username: user.username,
      email: user.email,
      profileImage: user.profileImageUrl || null,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { uploadProfileImage, getProfileImage };
