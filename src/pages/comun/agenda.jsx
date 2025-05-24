import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Check, Loader2, User, Book, FileText, List } from "lucide-react";
import { fetchMyCourses, fetchJoinedCourses } from "../../services/coursapi";
import axios from "axios";
import { useAuth } from "../auth/authContext";

// Configuration du localizer pour la langue française
moment.locale("fr");


// Types d'événements éducatifs
const eventTypes = [
  'Cours',
  'Devoir',
  'Meeting',
  'Assignment',
];

// Couleurs par type d'événement
const getEventColor = (eventType) => {
  const colors = {
    'Cours': 'bg-blue-500',
    'Examen': 'bg-red-500',
    'Réunion': 'bg-green-500',
    'Atelier': 'bg-yellow-500',
    'Conférence': 'bg-purple-500',
    'Devoir': 'bg-orange-500',
    'Projet': 'bg-pink-500',
    'Meeting': 'bg-teal-500',
    'Assignment': 'bg-indigo-500',
    'default': 'bg-gray-500'
  };
  return colors[eventType] || colors.default;
};

const EducationCalendar = () => {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [showTodayEvents, setShowTodayEvents] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [joinedCourses, setJoinedCourses] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'today'

  // Vérifier si l'écran est petit (mobile)
  const isMobile = true;

  // Récupérer les cours de l'utilisateur
  useEffect(() => {
    const loadCourses = async () => {
      if (!token) return;

      try {
        const myCoursesData = await fetchMyCourses(token);
        const joinedCoursesData = await fetchJoinedCourses(token);

        setMyCourses(myCoursesData);
        setJoinedCourses(joinedCoursesData);
        setCourses([...myCoursesData, ...joinedCoursesData]);
      } catch (err) {
        console.error("Erreur lors du chargement des cours:", err);
        setError("Impossible de charger les cours");
      }
    };

    if (token) {
      loadCourses();
    }
  }, [token]);

  // Récupérer les événements
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      let allEvents = [];
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

      for (const course of courses) {
        try {
          // Récupérer les meetings
          const meetingsResponse = await axios.get(
            `${API_BASE_URL}/meetings/course/${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const allMeetings = [
            ...(meetingsResponse.data.pastMeetings || []),
            ...(meetingsResponse.data.upcomingMeetings || [])
          ];

          if (allMeetings.length > 0) {
            const meetingEvents = allMeetings.map(meeting => ({
              id: meeting._id,
              title: meeting.title,
              start: new Date(meeting.startTime),
              end: new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000),
              type: "Meeting",
              description: meeting.description,
              location: meeting.location,
              courseId: meeting.courseId,
              courseName: course.title,
              hostName: meeting.hostName,
              sourceType: "meeting",
              sourceId: meeting._id
            }));

            allEvents = [...allEvents, ...meetingEvents];
          }

          // Récupérer les devoirs
          const assignmentsResponse = await axios.get(
            `${API_BASE_URL}/courseassignment/course/${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (assignmentsResponse.data) {
            const assignmentEvents = assignmentsResponse.data.map(assignment => ({
              id: assignment._id,
              title: assignment.title,
              start: new Date(assignment.createdAt ),
              end: new Date(assignment.dueDate),
              type: "Assignment",
              description: assignment.description,
              maxPoints: assignment.maxPoints,
              courseId: assignment.courseId,
              courseName: course.title,
              allDay: true,
              sourceType: "assignment",
              sourceId: assignment._id
            }));

            allEvents = [...allEvents, ...assignmentEvents];
          }
        } catch (err) {
          console.error(`Erreur lors de la récupération des événements pour le cours ${course._id}:`, err);
        }
      }

      // Trier les événements par date
      allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

      // Séparer les événements passés et à venir
      const now = new Date();
      const past = allEvents.filter(event => new Date(event.end) < now);
      const upcoming = allEvents.filter(event => new Date(event.start) >= now);

      setPastEvents(past);
      setUpcomingEvents(upcoming);
      setEvents(allEvents);

      // Filtrer les événements d'aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayEventsList = allEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= today && eventDate < tomorrow;
      });

      setTodayEvents(todayEventsList);
    } catch (err) {
      console.error("Erreur lors de la récupération des événements:", err);
      setError("Impossible de charger les événements");
    } finally {
      setLoading(false);
    }
  }, [courses, token]);

  useEffect(() => {
    if (courses.length > 0 && token) {
      fetchEvents();
    }
  }, [courses, token, fetchEvents]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const EventComponent = ({ event }) => (
    <div className={`${getEventColor(event.type)} text-white p-1 rounded overflow-hidden text-ellipsis whitespace-nowrap`}>
      <strong>{event.title}</strong>
      {!isMobile && event.courseName && (
        <div className="text-xs">{event.courseName}</div>
      )}
    </div>
  );

  // Filtrer les événements en fonction du mode de vue
  const getFilteredEvents = useCallback((eventsList) => {
    if (viewMode === 'all') return eventsList;

    return eventsList.filter(event => {
      if (viewMode === 'owner') {
        return myCourses.some(course => course._id === event.courseId);
      } else if (viewMode === 'student') {
        return joinedCourses.some(course => course._id === event.courseId);
      }
      return true;
    });
  }, [viewMode, myCourses, joinedCourses]);

  const formatDate = (date) => {
    const months = {
      'January': 'Janvier',
      'February': 'Février',
      'March': 'Mars',
      'April': 'Avril',
      'May': 'Mai',
      'June': 'Juin',
      'July': 'Juillet',
      'August': 'Août',
      'September': 'Septembre',
      'October': 'Octobre',
      'November': 'Novembre',
      'December': 'Décembre'
    };

    const days = {
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi',
      'Saturday': 'Samedi',
      'Sunday': 'Dimanche'
    };

    let formattedDate = moment(date).format("dddd DD MMMM YYYY");
    
    // Remplacer les jours et mois en anglais par leurs équivalents français
    Object.entries(days).forEach(([eng, fr]) => {
      formattedDate = formattedDate.replace(eng, fr);
    });
    
    Object.entries(months).forEach(([eng, fr]) => {
      formattedDate = formattedDate.replace(eng, fr);
    });

    return formattedDate;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Agenda Éducatif</h1>
          <p className="text-sm text-gray-500 mt-1">
            {myCourses.length > 0 && joinedCourses.length > 0
              ? "Vous êtes à la fois propriétaire et étudiant de cours"
              : myCourses.length > 0
                ? "Vous êtes propriétaire de cours"
                : "Vous êtes étudiant"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {(myCourses.length > 0 || joinedCourses.length > 0) && (
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choisir la vue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                {myCourses.length > 0 && (
                  <SelectItem value="owner">Mes cours (Propriétaire)</SelectItem>
                )}
                {joinedCourses.length > 0 && (
                  <SelectItem value="student">Mes cours (Étudiant)</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setActiveTab('upcoming')}>
          <CardHeader>
            <CardTitle className="text-lg">Événements à venir</CardTitle>
            <p className="text-2xl font-bold text-primary">{getFilteredEvents(upcomingEvents).length}</p>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setActiveTab('past')}>
          <CardHeader>
            <CardTitle className="text-lg">Événements passés</CardTitle>
            <p className="text-2xl font-bold text-primary">{getFilteredEvents(pastEvents).length}</p>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setActiveTab('today')}>
          <CardHeader>
            <CardTitle className="text-lg">Événements aujourd'hui</CardTitle>
            <p className="text-2xl font-bold text-primary">{getFilteredEvents(todayEvents).length}</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeTab === 'upcoming' ? 'Événements à venir' :
                activeTab === 'past' ? 'Événements passés' : 'Événements aujourd\'hui'}
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {viewMode === 'all' ? 'Tous les événements' :
                viewMode === 'owner' ? 'Vue Propriétaire' : 'Vue Étudiant'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'upcoming' ? getFilteredEvents(upcomingEvents) :
                activeTab === 'past' ? getFilteredEvents(pastEvents) :
                  getFilteredEvents(todayEvents)).map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-500">{event.courseName}</p>
                          <p className="text-xs text-gray-400">
                            {myCourses.some(course => course._id === event.courseId)
                              ? "Vous êtes propriétaire de ce cours"
                              : "Vous êtes étudiant de ce cours"}
                          </p>
                        </div>
                        <Badge className={getEventColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          {formatDate(event.start)}
                          {moment(event.start).isSame(event.end, 'day') ? (
                            ` de ${moment(event.start).format("HH:mm")} à ${moment(event.end).format("HH:mm")}`
                          ) : (
                            ` à ${moment(event.start).format("HH:mm")} jusqu'au ${formatDate(event.end)} à ${moment(event.end).format("HH:mm")}`
                          )}
                        </p>

                        {event.location && (
                          <p className="text-sm text-gray-500">Lieu: {event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
              {((activeTab === 'upcoming' && getFilteredEvents(upcomingEvents).length === 0) ||
                (activeTab === 'past' && getFilteredEvents(pastEvents).length === 0) ||
                (activeTab === 'today' && getFilteredEvents(todayEvents).length === 0)) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {activeTab === 'upcoming' ? "Aucun événement à venir" :
                        activeTab === 'past' ? "Aucun événement passé" :
                          "Aucun événement aujourd'hui"}
                    </p>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'affichage des détails de l'événement */}
      {selectedEvent && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Détails de l'événement</DialogTitle>
                <Badge variant="outline" className="text-sm">
                  {myCourses.some(course => course._id === selectedEvent.courseId)
                    ? "Vous êtes propriétaire de ce cours"
                    : "Vous êtes étudiant de ce cours"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Titre</h3>
                <p>{selectedEvent.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Date de début</h3>
                  <p>{formatDate(selectedEvent.start)} à {moment(selectedEvent.start).format("HH:mm")}</p>
                </div>
                <div>
                  <h3 className="font-medium">Date de fin</h3>
                  <p>{formatDate(selectedEvent.end)} à {moment(selectedEvent.end).format("HH:mm")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <h3 className="font-medium">Type</h3>
                <Badge className={getEventColor(selectedEvent.type)}>
                  {selectedEvent.type}
                </Badge>
              </div>

              {selectedEvent.courseName && (
                <div>
                  <h3 className="font-medium">Cours</h3>
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    <p>{selectedEvent.courseName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <h3 className="font-medium">Lieu</h3>
                  <p>{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.hostName && (
                <div>
                  <h3 className="font-medium">Organisateur</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <p>{selectedEvent.hostName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.maxPoints && (
                <div>
                  <h3 className="font-medium">Points maximum</h3>
                  <p>{selectedEvent.maxPoints}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="whitespace-pre-line">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EducationCalendar;