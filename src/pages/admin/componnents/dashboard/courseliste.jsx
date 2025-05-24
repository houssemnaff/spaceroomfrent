import { BookOpen, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";


export function CourseList({ courses, title = "Cours", limit }) {
  const displayedCourses = limit ? courses.slice(0, limit) : courses;
  
  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'math':
        return "text-subject-math";
      case 'literature':
        return "text-subject-literature";
      case 'science':
        return "text-subject-science";
      case 'language':
        return "text-subject-language";
    }
  };
  
  const getSubjectBgColor = (subject) => {
    switch (subject) {
      case 'math':
        return "bg-subject-math";
      case 'literature':
        return "bg-subject-literature";
      case 'science':
        return "bg-subject-science";
      case 'language':
        return "bg-subject-language";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {displayedCourses.map((course) => (
            <div key={course.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className={cn("h-9 w-9", getSubjectBgColor(course.subject))}>
                    <AvatarFallback className="text-white">
                      <BookOpen className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-1.5">
                      {course.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className={getSubjectColor(course.subject)}>
                        {course.teacher}
                      </span>
                      <span>•</span>
                      <span>{course.students} étudiants</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>Détails du cours</DropdownMenuItem>
                    <DropdownMenuItem>Éditer le cours</DropdownMenuItem>
                    <DropdownMenuItem>Voir les étudiants</DropdownMenuItem>
                    <DropdownMenuItem>Assigner des devoirs</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
              
              <div className="text-xs text-right text-muted-foreground">
                Mis à jour le {course.lastUpdate}
              </div>
            </div>
          ))}
          
          {limit && courses.length > limit && (
            <Button variant="outline" className="w-full mt-2">
              Voir tous les cours ({courses.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}