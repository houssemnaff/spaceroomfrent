import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderArchive, 
  Filter, 
  Download, 
  BookOpen 
} from 'lucide-react';

// Composant de Filtres
const ArchiveFilters = ({ years, onYearChange, onSearchChange }) => (
  <div className="flex space-x-4 mb-6">
    <div className="flex items-center space-x-2 w-full">
      <Filter className="text-gray-500" />
      <input 
        type="text"
        placeholder="Rechercher un cours..."
        className="flex-grow p-2 border rounded"
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    
    <select 
      className="w-[180px] p-2 border rounded"
      onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
    >
      <option value="">Année</option>
      {years.map(year => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>
);

// Composant de Carte de Cours Archivé
const ArchivedCourseCard = ({ course, onDownload }) => {
  const getResourceBadge = (type) => {
    switch (type) {
      case 'PDF': 
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">PDF</span>;
      case 'VIDEO': 
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Vidéo</span>;
      case 'NOTES': 
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Notes</span>;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">{course.title}</h3>
        {getResourceBadge(course.resourceType)}
      </div>
      
      <div className="flex items-center space-x-4 mb-3">
        <div className="flex-grow">
          <div className="text-sm text-gray-600">
            {course.professor.name} • {course.semester} {course.year}
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
            {course.description}
          </p>
        </div>
        
        <button 
          onClick={() => onDownload(course)}
          className="flex items-center bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </button>
      </div>
      
      <div className="flex space-x-2">
        {course.tags.slice(0,3).map(tag => (
          <span 
            key={tag} 
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// Page Principale des Archives
export const ArchivesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation de chargement des données
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Données mock - remplacer par votre appel API
        const mockCourses = [
          {
            id: '1',
            title: 'Développement Web Avancé',
            description: 'Cours approfondi sur les technologies web modernes',
            year: 2023,
            semester: 'Automne',
            professor: { name: 'Jean Dupont' },
            resourceType: 'PDF',
            archiveDate: '2024-01-15',
            tags: ['Web', 'Frontend', 'React']
          },
          {
            id: '2',
            title: 'Intelligence Artificielle',
            description: 'Introduction aux concepts d\'IA et apprentissage automatique',
            year: 2022,
            semester: 'Printemps',
            professor: { name: 'Marie Dubois' },
            resourceType: 'VIDEO',
            archiveDate: '2023-06-30',
            tags: ['IA', 'Machine Learning', 'Python']
          }
        ];
        setCourses(mockCourses);
      } catch (error) {
        console.error('Erreur de chargement', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filtrage des cours
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      (!selectedYear || course.year === selectedYear) &&
      (!searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [courses, selectedYear, searchTerm]);

  // Années uniques pour le filtre
  const uniqueYears = [...new Set(courses.map(course => course.year))].sort().reverse();

  // Téléchargement de ressources
  const handleDownload = (course) => {
    console.log(`Téléchargement du cours : ${course.title}`);
    // Logique de téléchargement à implémenter
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center mb-6">
        <FolderArchive className="mr-3 text-blue-600" size={32} />
        <h1 className="text-2xl font-bold">Archives de Cours</h1>
      </div>

      <ArchiveFilters 
        years={uniqueYears}
        onYearChange={setSelectedYear}
        onSearchChange={setSearchTerm}
      />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(item => (
            <div 
              key={item} 
              className="bg-gray-100 animate-pulse h-48 rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          {filteredCourses.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <BookOpen className="mx-auto mb-4" size={48} />
              <p>Aucun cours archivé trouvé</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <ArchivedCourseCard 
                  key={course.id} 
                  course={course} 
                  onDownload={handleDownload} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArchivesPage;