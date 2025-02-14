import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { Star } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  feedbackFormSubmision,
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const { id } = useParams();

  async function fetchCurrentCourseProgress() {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);

          return;
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          console.log("logging here");
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[
              lastIndexOfViewedAsTrue + 1
            ]
          );
        }
      }
    }
  }

  async function updateCourseProgress() {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  const certificateRef = useRef(null);
  const downloadCertificate = () => {
    const input = certificateRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      pdf.addImage(imgData, "PNG", 10, 10, 280, 180);
      pdf.save("Certificate.pdf");
    });
  };

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

    const handleFeedbackSubmit = () => {
      if (rating === 0) {
        alert("Please provide a rating before submitting.");
        return;
      }
      if (feedback.trim().length < 3) {
        alert("Please provide detailed feedback (at least 5 characters).");
        return;
      }
      // setIsFeedbackSubmitted(true);

      const feedbackData = {
        username: auth?.user?.userName,
        email: auth?.user?.userEmail,
        rating,
        feedbackText: feedback,
        courseId: studentCurrentCourseProgress?.courseDetails?._id,
      };
    
      try {
        const response =feedbackFormSubmision(feedbackData);
        // alert("Feedback submitted successfully!");
        setIsFeedbackSubmitted(true);
      } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("Failed to submit feedback. Try again later.");
      }
    };
  

  console.log(currentLecture, "currentLecture");
  console.log(auth, "username");
  console.log(studentCurrentCourseProgress?.courseDetails?.instructorName,"studentCurrentCourseProgress");
  
  

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-black"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses Page
          </Button>
          <h1 className="text-lg font-bold hidden md:block">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300`}
        >
          <VideoPlayer
            width="100%"
            height="500px"
            url={currentLecture?.videoUrl}
            onProgressUpdate={setCurrentLecture}
            progressData={currentLecture}
          />
          <div className="p-6 bg-[#1c1d1f]">
            <h2 className="text-2xl font-bold mb-2">{currentLecture?.title}</h2>
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-2 p-0 h-14">
              <TabsTrigger
                value="content"
                className=" text-black rounded-none h-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className=" text-black rounded-none h-full"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <div
                        className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer"
                        key={item._id}
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Play className="h-4 w-4 " />
                        )}
                        <span>{item?.title}</span>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
      <DialogContent showOverlay={false} className="flex flex-col sm:w-[900px] bg-white p-10 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">🎉 Congratulations! 🎉</DialogTitle>
          <DialogDescription className="flex flex-col items-center gap-3"> 
            {!isFeedbackSubmitted && (
              <div className="w-full text-center">
              <h3 className="text-lg font-semibold">We'd love your feedback!</h3>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    className={`cursor-pointer transition ${
                      (hover || rating) >= star ? "text-yellow-500" : "text-gray-400"
                    }`}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              {rating > 0 && <p className="text-gray-700 mt-1">You rated this {rating} out of 5</p>}
              <textarea
                className="w-full p-2 border rounded mt-2"
                rows="3"
                placeholder="Write your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Button onClick={handleFeedbackSubmit} className="bg-blue-500 text-white px-4 py-2 mt-2">
                Submit Feedback
              </Button>
            </div>
            )}
            {isFeedbackSubmitted && (
              <>
                <div
                  ref={certificateRef}
                  className="w-[800px] h-[600px] bg-white text-black p-10 border-2 border-gray-500 shadow-lg text-center relative"
                  style={{
                    fontFamily: "Georgia, serif",
                    borderRadius: "10px",
                    backgroundImage: "url('/public/vite.svg')",
                    backgroundSize: "400px",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    opacity: 0.9,
                  }}
                >
                  <h1 className="text-4xl font-extrabold text-purple-700 uppercase tracking-wide">Ydemy</h1>
                  <p className="text-lg text-gray-500 uppercase font-semibold">Certificate of Completion</p>

                  <h2 className="text-3xl font-semibold mt-4 text-gray-800">
                    {studentCurrentCourseProgress?.courseDetails?.title}
                  </h2>
                  <p className="text-md text-gray-700 italic">
                    Instructor: {studentCurrentCourseProgress?.courseDetails?.instructorName}
                  </p>
                  
                  <div className="mt-6 text-left px-10">
                    <p className="text-lg">This is to certify that</p>
                    <h3 className="text-2xl font-bold uppercase text-gray-900">{auth?.user?.userName}</h3>
                    <p className="text-md text-gray-700">has successfully completed the course</p>
                    <h3 className="text-xl font-semibold text-black">{studentCurrentCourseProgress?.courseDetails?.title}</h3>
                    <p className="text-md text-gray-700">on {new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="mt-6 text-left px-10">
                    <p className="text-md font-semibold text-gray-900">Email: {auth?.user?.userEmail}</p>
                  </div>

                  <div className="border-t border-gray-500 mt-5"></div>
                  <p className="text-sm text-gray-500 mt-2">This certificate is awarded for successful completion of the course on Ydemy.</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-row gap-3 mt-6">
                  <Button onClick={downloadCertificate} className="bg-blue-500 text-white px-4 py-2 rounded">
                    📜 Download Certificate
                  </Button>
                  <Button onClick={() => navigate("/student-courses")} className="bg-gray-500 text-white px-4 py-2 rounded">
                    📚 My Courses
                  </Button>
                  <Button onClick={handleRewatchCourse} className="bg-green-500 text-white px-4 py-2 rounded">
                    🔁 Rewatch Course
                  </Button>
                </div>
              </>
            )}
            
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;