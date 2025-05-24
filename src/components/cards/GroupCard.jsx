import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserAvatarGroup from "../ui/UserAvatarGroup";

export const GroupCard = ({ icon, title, members, avatars }) => {
  return (
    <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto hover:shadow-lg transition-shadow duration-300 bg-green-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Avatar className="w-10 h-10">
            <AvatarImage src={icon} alt="Group Icon" />
            <AvatarFallback>GR</AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="bg-emerald-200 text-emerald-800">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          {members} membres
        </CardDescription>
      </CardContent>
      <CardFooter>
        <UserAvatarGroup avatars={avatars} />
      </CardFooter>
    </Card>
  );
};

export default GroupCard;