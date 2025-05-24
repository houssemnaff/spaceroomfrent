import React from "react";

const UserAvatarGroup = ({ avatars }) => {
  return (
    <div className="flex items-stretch pr-[62px] max-md:pr-5">
      {avatars.map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt={`User ${index + 1}`}
          className="aspect-[1] object-contain w-8 shrink-0 rounded-full max-md:-mr-2"
        />
      ))}
    </div>
  );
};

export default UserAvatarGroup;  // Exportation par défaut
