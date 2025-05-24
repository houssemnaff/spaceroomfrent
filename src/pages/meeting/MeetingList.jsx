import React from "react";
import MeetingListItem from "./MeetingListItem";

const MeetingList = ({
  meetings,
  isOwner,
  onJoin,
  onEdit,
  onDelete,
  onSetRecording,
  isPast = false,
  isMeetingLive,
  isMeetingSoonAvailable,
  formatDate,
  formatTime
}) => {
  // Handle empty meetings list with a responsive message
  if (!meetings || meetings.length === 0) {
    return (
      <div className="w-full py-6 text-center rounded-lg bg-gray-50">
        <p className="text-sm sm:text-base text-gray-500">
          {isPast ? "No past meetings found" : "No upcoming meetings scheduled"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <ul className="divide-y divide-gray-100 w-full">
        {meetings.map((meeting) => (
          <MeetingListItem
            key={meeting._id}
            meeting={meeting}
            isLive={isPast ? false : isMeetingLive && isMeetingLive(meeting)}
            isSoonAvailable={
              isPast ? false : isMeetingSoonAvailable && isMeetingSoonAvailable(meeting)
            }
            isPast={isPast}
            onJoin={onJoin ? () => onJoin(meeting) : undefined}
            onEdit={() => onEdit(meeting)}
            onDelete={() => onDelete(meeting)}
            onSetRecording={onSetRecording ? () => onSetRecording(meeting) : undefined}
            isOwner={isOwner}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        ))}
      </ul>
    </div>
  );
};

export default MeetingList;