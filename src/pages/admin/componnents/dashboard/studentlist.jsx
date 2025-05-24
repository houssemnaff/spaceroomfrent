import { ArrowUpDown, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Static student data
const staticStudents = [
  {
    id: 1,
    name: "Jean Dupont",
    avatar: "JD",
    performance: 92,
    grade: "Licence 2",
    attendance: 95,
    lastActivity: "Aujourd'hui"
  },
  {
    id: 2,
    name: "Marie Martin",
    avatar: "MM",
    performance: 87,
    grade: "Master 1",
    attendance: 89,
    lastActivity: "Hier"
  },
  {
    id: 3,
    name: "Pierre Bernard",
    avatar: "PB",
    performance: 78,
    grade: "Licence 3",
    attendance: 82,
    lastActivity: "Il y a 2 jours"
  },
  {
    id: 4,
    name: "Sophie Petit",
    avatar: "SP",
    performance: 65,
    grade: "Licence 1",
    attendance: 75,
    lastActivity: "Il y a 3 jours"
  },
  {
    id: 5,
    name: "Luc Durand",
    avatar: "LD",
    performance: 81,
    grade: "Master 2",
    attendance: 88,
    lastActivity: "Aujourd'hui"
  }
];

// Score color utility
function getScoreColor(score) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-green-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 60) return "text-orange-600";
  return "text-red-600";
}

// Score emoji utility
function getScoreEmoji(score) {
  if (score >= 90) return "🌟";
  if (score >= 80) return "👍";
  if (score >= 70) return "👌";
  if (score >= 60) return "🤔";
  return "❌";
}

export function StudentList({ students = staticStudents, title = "Étudiants", limit }) {
  const displayedStudents = limit ? students.slice(0, limit) : students;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8 flex gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Trier par</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Performance (élevée-basse)</DropdownMenuItem>
              <DropdownMenuItem>Performance (basse-élevée)</DropdownMenuItem>
              <DropdownMenuItem>Assiduité (élevée-basse)</DropdownMenuItem>
              <DropdownMenuItem>Activité récente</DropdownMenuItem>
              <DropdownMenuItem>Ordre alphabétique</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                  {student.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {student.name}
                    <span>{getScoreEmoji(student.performance)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Badge variant="outline" className="px-1 py-0 h-4 text-[10px]">
                      {student.grade}
                    </Badge>
                    <span>Assiduité {student.attendance}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={cn("text-sm font-medium", getScoreColor(student.performance))}>
                    {student.performance}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {student.lastActivity}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <UserRound className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                    <DropdownMenuItem>Messagerie</DropdownMenuItem>
                    <DropdownMenuItem>Rapport détaillé</DropdownMenuItem>
                    <DropdownMenuItem>Ajouter une note</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {limit && students.length > limit && (
            <Button variant="outline" className="w-full mt-2">
              Voir tous les étudiants ({students.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}