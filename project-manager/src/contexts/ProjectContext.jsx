import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ProjectContext = createContext({});

export const useProjects = () => useContext(ProjectContext);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isDemoMode } = useAuth();

  // Fetch projects in real-time
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // For demo mode, fetch all and filter client-side (no index needed)
    // For regular users, query by members array
    const q = isDemoMode
      ? collection(db, 'projects')
      : query(
          collection(db, 'projects'),
          where('members', 'array-contains', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter client-side for demo mode
      if (isDemoMode) {
        projectsData = projectsData
          .filter(p => p.createdBy === 'demo-user-id')
          .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt));
      }

      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching projects:', error);
      // Don't show error toast for demo mode permission errors
      if (!isDemoMode) {
        toast.error('Failed to load projects');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, isDemoMode]);

  // Create a new project
  async function createProject(projectData) {
    try {
      const newProject = {
        ...projectData,
        ownerId: currentUser.uid,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      toast.success('Project created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      throw error;
    }
  }

  // Update a project
  async function updateProject(projectId, updates) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  }

  // Delete a project
  async function deleteProject(projectId) {
    try {
      // First delete all tasks in the project
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const deletePromises = tasksSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Then delete the project
      await deleteDoc(doc(db, 'projects', projectId));
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  }

  // Add member to project
  async function addMember(projectId, userEmail) {
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', userEmail)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const userId = usersSnapshot.docs[0].id;
      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        members: arrayUnion(userId),
        updatedAt: Timestamp.now()
      });

      toast.success('Member added successfully!');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
      throw error;
    }
  }

  // Remove member from project
  async function removeMember(projectId, userId) {
    try {
      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        members: arrayRemove(userId),
        updatedAt: Timestamp.now()
      });

      toast.success('Member removed successfully!');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      throw error;
    }
  }

  const value = {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
