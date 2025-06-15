import React, { useState, useEffect, useCallback, useMemo } from 'react';
import WorkoutInput from './WorkoutInput';
// import BodyMap from './BodyMap';  // Commented out for now
import WorkoutHistory from './WorkoutHistory';
import ProgressSummary from './ProgressSummary';
import { addWorkout as addWorkoutToDB, getWorkouts } from './db';
import watermarkImage from './assets/watermark.jpg';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [isWorkoutInputOpen, setIsWorkoutInputOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isCardioInputOpen, setIsCardioInputOpen] = useState(false);
  const [currentView, setCurrentView] = useState('exerciseSummary'); // New state for view management

  const loadWorkouts = async () => {
    const loadedWorkouts = await getWorkouts();
    setWorkouts(loadedWorkouts);
  };

  // Load workouts on initial render
  useEffect(() => {
    loadWorkouts();
  }, []);

  const addWorkout = async (workout) => {
    // Add date to the workout if not already present
    const workoutWithDate = {
      ...workout,
      date: workout.date || new Date().toISOString()
    };
    
    // Save to IndexedDB
    await addWorkoutToDB(workoutWithDate);
    
    // Update local state
    setWorkouts(prevWorkouts => [...prevWorkouts, workoutWithDate]);
  };

  const handleWorkoutDeleted = async () => {
    // Reload workouts after deletion
    await loadWorkouts();
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #1a2a6c, #2c3e50)',
      minHeight: '100vh',
      padding: '20px',
      color: '#fff',
      // Removed position and overflow styles as watermark is now a section
    }}>
      <h1 style={{
        textAlign: 'center',
        textShadow: '0 0 10px rgba(0, 242, 254, 0.7)',
        marginBottom: '30px'
      }}>
        Smart Fitness Tracker
      </h1>

      {/* Watermark Section */}
      <div style={{
        height: '350px', // Fixed height to show chest area
        backgroundImage: `linear-gradient(to top, rgba(26, 42, 108, 0.05), transparent), url(${watermarkImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        marginBottom: '30px',
        borderRadius: '15px',
        // Removed maskImage, we'll control fade with the gradient itself now
      }}>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <WorkoutHistory workouts={workouts} onWorkoutDeleted={handleWorkoutDeleted} addWorkout={addWorkout} />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <ProgressSummary workouts={workouts} />
        </div>
      </div>

      {/* Commented out BodyMap section for now
      <div style={{ marginTop: '40px' }}>
        <BodyMap workouts={workouts} />
      </div>
      */}
    </div>
  );
}

export default App;
