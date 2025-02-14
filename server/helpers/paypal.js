const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AXktA4KUwFivSTFsyenTatOP_7vORbN7j_kiQHyYIrR6hIKETAQdne2eeUvUx0Ny-eow1ZMwmrgKUKkj",
  client_secret: "EJRvHROLD1dIUVdzp6a6U7AguNjwcf5ex45XZ0KyrBONkPYU1kNCn_MB6w59_xtepfNouZ2D7PH098Ov",
});

module.exports = paypal;