import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, FileText, Edit, Trash2, Plus, Film, FileIcon, Link, Download, X, ListChecks, PlayCircle, BarChart2 } from "lucide-react";
import { deleteChapter, fetchChapterResources, updateChapter, deleteResource } from "@/services/chapterApi";
import { markResourceViewed } from "@/services/progressApi";
import AddResourceDialog from "../Popup/addressource/addResourceDialog";
import { useAuth } from "@/pages/auth/authContext";
import AddQuizDialog from "../Popup/quiechapitre/addquizchapitre";
import QuizService from "../../../services/quizchapitreapi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../pages/admin/componnents/themcontext"; // Import theme context
import EditQuizDialog from "../Popup/quiechapitre/editquizchapitre";

const ResourceIcon = ({ type }) => {
  switch (type) {
    case 'video':
      return <Film className="h-4 w-4 mr-2 flex-shrink-0 text-red-500" />;
    case 'pdf':
      return <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />;
    case 'file':
      return <FileIcon className="h-4 w-4 mr-2 flex-shrink-0 text-green-500" />;
    case 'quiz':
      return <ListChecks className="h-4 w-4 mr-2 flex-shrink-0 text-purple-500" />;
    default:
      return <Link className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />;
  }
};

const VideoPopup = ({ url, onClose }) => {
  const { theme } = useTheme(); // Get current theme
  
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(url);
  const isYouTube = videoId !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
      <div className="relative w-full max-w-screen-xl bg-black rounded-2xl overflow-hidden shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
        >
          <X className="h-7 w-7" />
        </button>

        <div className="aspect-video w-full h-full">
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-b-2xl"
              title="YouTube video player"
            ></iframe>
          ) : (
            <video
              controls
              autoPlay
              className="w-full h-full rounded-b-2xl"
              src={url}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ChapterCard = ({
  chapter,
  courseId,
  courseOwnerId,
  isOwner,
  isExpanded,
  onToggleExpand,
  onDelete,
  onEdit
}) => {
  const { _id, number, title, description } = chapter;
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editNumber, setEditNumber] = useState(number);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoPopup, setVideoPopup] = useState({ open: false, url: '' });
  const [quizzes, setQuizzes] = useState([]);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isTeacher, setIsTeacher] = useState(isOwner);
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [selectedQuizForEdit, setSelectedQuizForEdit] = useState(null);

  // Load resources and quizzes when chapter is expanded
  useEffect(() => {
    const loadChapterContent = async () => {
      if (isExpanded && _id) {
        setIsLoading(true);
        setError(null);
        try {
          // Load resources and quizzes
          const [resourcesResponse, quizzesResponse] = await Promise.all([
            fetchChapterResources(courseId, _id, token),
            QuizService.getChapterQuizzes(_id, courseId, token)
          ]);

          setResources(resourcesResponse);
          setQuizzes(Array.isArray(quizzesResponse) ? quizzesResponse :
            Array.isArray(quizzesResponse.data) ? quizzesResponse.data : []);
        } catch (err) {
          console.error("Error loading chapter content:", err);
          setError("Erreur lors du chargement du contenu");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadChapterContent();
  }, [isExpanded, courseId, _id, token]);

  // Responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle resource click with progress tracking
  const handleResourceClick = async (resource) => {
    try {
      // Mark resource as viewed if user is logged in
      if (user && user._id) {
        await markResourceViewed(
          user._id,
          courseId,
          resource._id,
          _id,
          token
        );
      }

      // Handle video resources differently
      if (resource.type === 'video') {
        setVideoPopup({ open: true, url: resource.url });
      } else {
        // For files and PDFs, trigger download
        const link = document.createElement('a');
        link.href = resource.url;
        link.target = '_blank';
        link.download = resource.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error marking resource as viewed:", error);
    }
  };

  // Handle quiz click
  const handleQuizClick = (quiz, e) => {
    e.stopPropagation();
    if (isTeacher) {
      navigate(`/home/course/${courseId}/note`);
    } else {
      // Pour l'étudiant, naviguer vers la page quiz
      navigate(`/home/course/${courseId}/chapter/${_id}/quiz/${quiz._id}`);
    }
  };

  // Handle quiz edit
  const handleQuizEdit = (quiz, e) => {
    e.stopPropagation();
    setSelectedQuizForEdit(quiz);
    setIsEditQuizOpen(true);
  };

  // Handle quiz updated
  const handleQuizUpdated = (updatedQuiz) => {
    setQuizzes(quizzes.map(q => q._id === updatedQuiz._id ? updatedQuiz : q));
    setIsEditQuizOpen(false);
  };

  // Handle resource deletion
  const handleResourceDelete = async (resourceId, e) => {
    e.stopPropagation();
    try {
      await deleteResource(courseId, _id, resourceId, token);
      setResources(resources.filter(r => r._id !== resourceId));
    } catch (error) {
      console.error("Error deleting resource:", error);
      setError("Impossible de supprimer la ressource");
    }
  };

  // Handle quiz deletion
  const handleQuizDelete = async (quizId, e) => {
    e.stopPropagation();
    try {
      await QuizService.deleteQuiz(quizId, token);
      setQuizzes(quizzes.filter(q => q._id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Impossible de supprimer le quiz");
    }
  };

  // Handle chapter edit
  const handleEdit = async () => {
    try {
      const updatedChapter = await updateChapter(courseId, _id, {
        number: editNumber,
        title: editedTitle,
        description: editedDescription,
      });

      if (updatedChapter) {
        onEdit({
          _id,
          number: editNumber,
          title: editedTitle,
          description: editedDescription,
        });
        setIsEditOpen(false);
      }
    } catch (error) {
      console.error("Error updating chapter:", error);
    }
  };

  // Dans le composant ChapterCard, remplacez la fonction handleDelete par celle-ci:

const handleDelete = async (e) => {
  e.stopPropagation();
  if (isDeleting) return;

  setIsDeleting(true);
  try {
    // Appeler l'API pour supprimer le chapitre
    //await deleteChapter(courseId, _id);
    
    // Appeler la fonction onDelete qui est passée depuis ChaptersList
    onDelete(_id);
  } catch (error) {
    console.error("Error deleting chapter:", error);
  } finally {
    setIsDeleting(false);
  }
};

  // Callback to add new resource
  const handleResourceAdded = (newResource) => {
    setResources(prev => [...prev, newResource]);
  };

  // Callback to add new quiz
  const handleQuizAdded = (newQuiz) => {
    setQuizzes(prev => [...prev, newQuiz]);
  };

  return (
    <div className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden`}>
      {/* Chapter Header */}
      <div
        className={`flex justify-between items-center p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} cursor-pointer`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          {isExpanded ?
            <ChevronUp className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /> :
            <ChevronDown className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          }
          <h3 className={`text-lg font-medium truncate ${isDark ? 'text-white' : ''}`}>{number}. {title}</h3>
        </div>

        {isOwner && (
          <div className="flex space-x-2">
            {isMobile ? (
              <>
                <Button
                  variant={isDark ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant={isDark ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${isDark ? 'text-red-400' : 'text-red-600'}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isDark ? "secondary" : "outline"}
                  size="sm"
                  className={isDark ? 'text-blue-400' : 'text-blue-600 border-blue-600'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Modifier
                </Button>
                <Button
                  variant={isDark ? "secondary" : "outline"}
                  size="sm"
                  className={isDark ? 'text-red-400' : 'text-red-600 border-red-600'}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chapter Content */}
      {isExpanded && (
        <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {/* Display the chapter objective first */}
          {description && (
            <div className="mb-4">
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Objectif du chapitre:</h4>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{description}</p>
            </div>
          )}

         

          {/* Resources Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Ressources</h4>
              {isOwner && (
                isMobile ? (
                  <Button
                    variant={isDark ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddResourceOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant={isDark ? "secondary" : "outline"}
                    size="sm"
                    className={isDark ? 'text-blue-400' : 'text-blue-600 border-blue-600'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddResourceOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter une ressource
                  </Button>
                )
              )}
            </div>

            {isLoading ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement des ressources...</p>
            ) : resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div
                    key={resource._id}
                    className={`flex items-center justify-between p-3 ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border hover:bg-gray-50'} rounded-md cursor-pointer`}
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="flex items-center">
                      <ResourceIcon type={resource.type} />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>{resource.name}</span>
                    </div>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={isDark ? 'text-red-400' : 'text-red-500'}
                        onClick={(e) => handleResourceDelete(resource._id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aucune ressource disponible</p>
            )}
          </div>
           {/* Quizzes Section */}
           <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quiz</h4>
              {isOwner && (
                isMobile ? (
                  <Button
                    variant={isDark ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddQuizOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant={isDark ? "secondary" : "outline"}
                    size="sm"
                    className={isDark ? 'text-purple-400' : 'text-purple-600 border-purple-600'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddQuizOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter un quiz
                  </Button>
                )
              )}
            </div>

            {isLoading ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement des quiz...</p>
            ) : quizzes.length > 0 ? (
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className={`flex items-center justify-between p-3 ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border hover:bg-gray-50'} rounded-md`}
                  >
                    <div className="flex items-center">
                      <ListChecks className="h-4 w-4 mr-2 text-purple-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>{quiz.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMobile ? (
                        <>
                          <Button
                            variant={isDark ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                            onClick={(e) => handleQuizClick(quiz, e)}
                          >
                            {isTeacher ? (
                              <BarChart2 className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </Button>
                          {isOwner && (
                            <>
                              <Button
                                variant={isDark ? "secondary" : "ghost"}
                                size="sm"
                                className={`h-8 w-8 p-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                onClick={(e) => handleQuizEdit(quiz, e)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={isDark ? 'text-red-400' : 'text-red-500'}
                                onClick={(e) => handleQuizDelete(quiz._id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Button
                            variant={isDark ? "secondary" : "outline"}
                            size="sm"
                            className={`flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                            onClick={(e) => handleQuizClick(quiz, e)}
                          >
                            {isTeacher ? (
                              <BarChart2 className="h-4 w-4 mr-1" />
                            ) : (
                              <PlayCircle className="h-4 w-4 mr-1" />
                            )}
                            {isTeacher ? "Voir les résultats" : "Commencer"}
                          </Button>
                          {isOwner && (
                            <>
                              <Button
                                variant={isDark ? "secondary" : "outline"}
                                size="sm"
                                className={`flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                onClick={(e) => handleQuizEdit(quiz, e)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={isDark ? 'text-red-400' : 'text-red-500'}
                                onClick={(e) => handleQuizDelete(quiz._id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aucun quiz disponible</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Chapter Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className={`sm:max-w-md ${isDark ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Modifier le chapitre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className={`text-right text-sm font-medium ${isDark ? 'text-gray-300' : ''}`}>Numéro</label>
              <Input
                className={`col-span-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                type="number"
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className={`text-right text-sm font-medium ${isDark ? 'text-gray-300' : ''}`}>Titre</label>
              <Input
                className={`col-span-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className={`text-right text-sm font-medium ${isDark ? 'text-gray-300' : ''}`}>Description</label>
              <Input
                className={`col-span-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant={isDark ? "secondary" : "outline"} 
              onClick={() => setIsEditOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleEdit}
              className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Resource Dialog */}
      {isAddResourceOpen && (
        <AddResourceDialog
          isOpen={isAddResourceOpen}
          onClose={() => setIsAddResourceOpen(false)}
          courseId={courseId}
          chapterId={_id}
          onResourceAdded={handleResourceAdded}
        />
      )}

      {/* Add Quiz Dialog */}
      {isAddQuizOpen && (
        <AddQuizDialog
          isOpen={isAddQuizOpen}
          onClose={() => setIsAddQuizOpen(false)}
          courseId={courseId}
          chapterId={_id}
          onQuizAdded={handleQuizAdded}
        />
      )}

      {/* Add Edit Quiz Dialog */}
      {isEditQuizOpen && selectedQuizForEdit && (

        <EditQuizDialog
          isOpen={isEditQuizOpen}
          onClose={() => setIsEditQuizOpen(false)}
          courseId={courseId}
          chapterId={_id}
          quiz={selectedQuizForEdit}
          onQuizUpdated={handleQuizUpdated}
        />
      )}

      {/* Video Popup */}
      {videoPopup.open && (
        <VideoPopup
          url={videoPopup.url}
          onClose={() => setVideoPopup({ open: false, url: '' })}
        />
      )}

      {/* Error display */}
      {error && (
        <div className={`p-3 mt-2 ${isDark ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-600'} rounded-md`}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ChapterCard;