// Génère un tableau de nombres aléatoires
export function generateRandomArray(length, min, max) {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  }
  
  // Génère des données pour un graphique avec plusieurs séries
  export function generateChartData(days = 7, series = 3) {
    const today = new Date();
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1) + i);
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    });
  
    const colors = ['#2563EB', '#4F46E5', '#10B981', '#F59E0B', '#EC4899'];
    const names = ['Participation', 'Exercices complétés', 'Quiz réussis', 'Temps de connexion', 'Projets soumis'];
  
    const datasets = Array.from({ length: series }, (_, i) => ({
      name: names[i % names.length],
      data: generateRandomArray(days, 10, 100),
      color: colors[i % colors.length],
    }));
  
    return { labels, datasets };
  }
  
  // Génère des données pour un graphique en barres
  export function generateBarChartData(categories, max = 100) {
    const data = categories.map(() => Math.floor(Math.random() * max));
    return { labels: categories, data };
  }
  
  // Génère des données d'activité pour une heatmap
  export function generateHeatmapData(days = 7, hours = 12) {
    const result = [];
    for (let i = 0; i < days; i++) {
      const dayData = [];
      for (let j = 0; j < hours; j++) {
        dayData.push(Math.floor(Math.random() * 10));
      }
      result.push(dayData);
    }
    return result;
  }
  
  // Génère des données pour le radar chart des compétences
  export function generateRadarData(skills) {
    const subjects = ['Mathématiques', 'Littérature', 'Sciences', 'Langues'];
  
    return subjects.map(subject => ({
      subject,
      data: skills.map(skill => ({
        skill,
        value: Math.floor(Math.random() * 100),
      })),
    }));
  }
  
  // Détermine la couleur en fonction du score
  export function getScoreColor(score) {
    if (score >= 80) return 'mastery-excellent';
    if (score >= 60) return 'mastery-good';
    if (score >= 40) return 'mastery-average';
    return 'mastery-poor';
  }
  
  // Détermine l'icône en fonction du score
  export function getScoreEmoji(score) {
    if (score >= 80) return '🔵';
    if (score >= 60) return '🟢';
    if (score >= 40) return '🟡';
    return '🔴';
  }
  
  // Génère des données pour les alertes
  export function generateAlerts(count = 5) {
    const types = ['warning', 'info', 'critical'];
    const messages = [
      'Absence non justifiée',
      'Chute de performance',
      'Devoirs non rendus',
      'Progression rapide',
      'Comportement inquiétant',
      "Besoin d'aide supplémentaire",
      'Performance excellente',
    ];
    const students = [
      'Thomas Martin',
      'Sophie Dubois',
      'Lucas Bernard',
      'Emma Petit',
      'Hugo Moreau',
      'Chloé Lefebvre',
      'Nathan Leroy',
    ];
  
    return Array.from({ length: count }, (_, i) => {
      const daysAgo = Math.floor(Math.random() * 7);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
  
      return {
        id: i + 1,
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        student: students[Math.floor(Math.random() * students.length)],
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      };
    });
  }
  
  // Génère des données pour les étudiants
  export function generateStudents(count = 20) {
    const firstNames = ['Thomas', 'Sophie', 'Lucas', 'Emma', 'Hugo', 'Chloé', 'Nathan', 'Léa', 'Jules', 'Manon'];
    const lastNames = ['Martin', 'Dubois', 'Bernard', 'Petit', 'Moreau', 'Lefebvre', 'Leroy', 'Roux', 'Garcia', 'Lambert'];
    const grades = ['6ème A', '5ème B', '4ème C', '3ème A', '2nde B', '1ère S', 'Terminale L'];
  
    return Array.from({ length: count }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const daysAgo = Math.floor(Math.random() * 7);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
  
      return {
        id: i + 1,
        name: `${firstName} ${lastName}`,
        avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`,
        grade: grades[Math.floor(Math.random() * grades.length)],
        performance: Math.floor(Math.random() * 100),
        attendance: 70 + Math.floor(Math.random() * 30),
        lastActivity: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      };
    });
  }
  
  // Génère des données pour les cours
  export function generateCourses(count = 12) {
    const subjects = [
      { name: 'math', titles: ['Algèbre', 'Géométrie', 'Statistiques', 'Probabilités'] },
      { name: 'literature', titles: ['Poésie', 'Roman', 'Théâtre', 'Dissertation'] },
      { name: 'science', titles: ['Physique', 'Chimie', 'Biologie', 'SVT'] },
      { name: 'language', titles: ['Anglais', 'Espagnol', 'Allemand', 'Latin'] },
    ];
  
    const teachers = ['Mme Bernard', 'M. Dupont', 'Mme Legrand', 'M. Petit', 'Mme Dubois', 'M. Moreau'];
  
    return Array.from({ length: count }, (_, i) => {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const title = subject.titles[Math.floor(Math.random() * subject.titles.length)];
      const daysAgo = Math.floor(Math.random() * 14);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
  
      return {
        id: i + 1,
        title,
        subject: subject.name,
        teacher: teachers[Math.floor(Math.random() * teachers.length)],
        students: 15 + Math.floor(Math.random() * 15),
        progress: Math.floor(Math.random() * 100),
        lastUpdate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      };
    });
  }
  