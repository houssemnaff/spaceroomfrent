import React from "react";

const TestimonialCard = ({ name, role, image, quote, stars }) => {
  return (
    <div className="w-1/3 max-md:w-full">
      <div className="bg-white rounded-2xl shadow-[0px_4px_6px_rgba(0,0,0,0.1)] p-8">
        <div className="flex items-stretch gap-4 pr-[65px] max-md:pr-5">
          <img
            src={image}
            alt={name}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <div className="text-base text-black">{name}</div>
            <div className="mt-3 text-base text-gray-600">{role}</div>
          </div>
        </div>
        <p className="mt-4 text-base text-gray-600">{quote}</p>
        <div className="mt-4 flex gap-1 pr-[65px] py-1 max-md:pr-5">
          {stars.map((star, index) => (
            <div
              key={index}
              className="flex h-4 items-center justify-center overflow-hidden"
            >
              <img
                src={star}
                alt="star"
                className="h-[18px] w-[18px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
