import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";

const FeedbackSection = ({ courseId }) => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axiosInstance.get(`/student/feedback/${courseId}`);
        const data = response.data.data;
        setAverageRating(data.averageRating);
        setFeedbackCount(data.feedback.length);
        setFeedbackData(data.feedback);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    if (courseId) {
      fetchFeedback();
    }
  }, [courseId]);

  return (
    <span
      className="text-sm text-gray-500 cursor-pointer relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {averageRating}/5 ({feedbackCount})⭐
      {hovered && (
        <div className="absolute top-6 right-0 bg-white shadow-lg p-3 rounded-lg w-64 border border-gray-300 z-50">
          <h3 className="text-md font-bold mb-2">Student Feedback</h3>
          <div className="max-h-40 overflow-y-auto">
            {feedbackData.length > 0 ? (
              feedbackData.map((fb, index) => (
                <div key={index} className="mb-2 border-b pb-2">
                  <p className="text-sm font-bold">{fb.username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(fb.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    ⭐ {fb.rating}/5 - {fb.feedbackText}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No feedback available</p>
            )}
          </div>
        </div>
      )}
    </span>
  );
};

export default FeedbackSection;
