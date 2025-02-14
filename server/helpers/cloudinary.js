const cloudinary = require("cloudinary").v2;

//configure with env data
cloudinary.config({
  cloud_name: "dodotqz9q",
  api_key: "981411775964855",
  api_secret: "XgmHNO96FmyD1cApW3iQJaPMurs",
});

const uploadMediaToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading to cloudinary");
  }
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new Error("failed to delete assest from cloudinary");
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };