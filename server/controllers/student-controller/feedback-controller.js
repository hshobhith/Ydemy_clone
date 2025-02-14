const Feedback = require('../../models/feedback'); 

const getCourseFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const feedbacks = await Feedback.find({ courseId });

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          feedbackCount: 0,
          feedback: [],
        },
      });
    }

    const totalRatings = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    const averageRating = (totalRatings / feedbacks.length).toFixed(1);

    res.status(200).json({
      success: true,
      data: {
        averageRating,
        feedbackCount: feedbacks.length,
        feedback: feedbacks,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
    getCourseFeedback,
  };