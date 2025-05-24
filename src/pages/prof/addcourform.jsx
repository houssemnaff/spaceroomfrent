import React, { useState } from "react";
import CourseForm from "@/components/course/CourseForm";
import CoursePreview from "@/components/course/CoursePreview";

const Index = () => {
  const [previewData, setPreviewData] = useState({
    title: "",
    subject: "",
    imageUrl: "",
  });

  const handlePreviewUpdate = (data) => {
    setPreviewData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      subject: data.subject || prev.subject,
    }));

    if (data.image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData((prev) => ({
          ...prev,
          imageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(data.image);
    }
  };

  const handleSubmit = (data) => {
    console.log("Form submitted:", data);
    // Handle form submission
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  return (
    <div className="bg-white overflow-hidden rounded-lg border-[rgba(206,212,218,1)] border-solid border-2">
      <div className="w-full">
        <div className="bg-[rgba(0,0,0,0.5)] flex w-full flex-col items-center justify-center px-20 py-[304px] max-md:max-w-full max-md:px-5 max-md:py-[100px]">
          <div className="bg-white shadow-[0px_25px_50px_rgba(0,0,0,0.25)] mb-[-61px] w-full max-w-[1000px] px-[31px] py-8 rounded-xl max-md:max-w-full max-md:mb-2.5 max-md:px-5">
            <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
              <div className="w-6/12 max-md:w-full max-md:ml-0">
                <CourseForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  onPreviewUpdate={handlePreviewUpdate}
                />
              </div>
              <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0">
                <CoursePreview
                  title={previewData.title}
                  subject={previewData.subject}
                  imageUrl={previewData.imageUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
