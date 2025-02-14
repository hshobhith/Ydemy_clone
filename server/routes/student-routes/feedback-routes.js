const express = require("express");

const {
 getCourseFeedback,
} = require("../../controllers/student-controller/feedback-controller");
const router = express.Router();




router.get("/feedback/:courseId", getCourseFeedback);

module.exports = router;