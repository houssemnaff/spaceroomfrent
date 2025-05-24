import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ParticipantsList = ({ submissions, quizId }) => {
  const [loading, setLoading] = useState(false);
  const [sortedSubmissions, setSortedSubmissions] = useState([]);

  // Sort submissions by score in descending order
  useEffect(() => {
    if (submissions && submissions.length > 0) {
      const sorted = [...submissions].sort((a, b) => {
        // First, sort by completion status (completed first)
        if (a.completed !== b.completed) {
          return a.completed ? -1 : 1;
        }
        // Then sort by score (highest first)
        return (b.score || 0) - (a.score || 0);
      });
      setSortedSubmissions(sorted);
    } else {
      setSortedSubmissions([]);
    }
  }, [submissions]);
 // console.log("user quiz ",submissions[_id].userId?.name);

  // Format date safely
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date inconnue";
      }
      return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date inconnue";
    }
  };

  // Export results to CSV
  const exportResults = () => {
    setLoading(true);
    
    try {
      // Create CSV content
      let csvContent = "Participant,Email,Status,Score,Completion Time\n";
      
      sortedSubmissions.forEach(submission => {
        const name = submission.student?.name || "Anonymous";
        const email = submission.student?.email || "N/A";
        const status = submission.completed ? "Completed" : "In Progress";
        const score = submission.completed ? submission.score : "N/A";
        const time = submission.submittedAt ? formatDate(submission.submittedAt) : "N/A";
        
        csvContent += `"${name}","${email}","${status}","${score}","${time}"\n`;
      });
      
      // Create downloadable link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `quiz_results_${quizId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!sortedSubmissions || sortedSubmissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Aucun participant n'a encore répondu à ce quiz.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Participants ({sortedSubmissions.length})
        </h3>
        <Button variant="outline" onClick={exportResults} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Exporter les résultats
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Score</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubmissions.map((submission, index) => (
                <TableRow key={submission._id || `submission-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.userId?.name || "Utilisateur anonyme"}</p>
                      <p className="text-xs text-muted-foreground">{submission.userId?.email || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {submission.completed ? (
                      <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        <span>Terminé</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3" />
                        <span>En cours</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.status== "graded" ? (
                      <span className="font-bold">{submission.totalPoints}/{submission.maxPoints}</span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
               { /*  <TableCell>
                    {submission.submittedAt ? (
                      formatDate(submission.submittedAt)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>*/}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsList;