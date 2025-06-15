import React, { useState, useCallback, useMemo } from 'react';
import Model from 'react-body-highlighter';

// FULL exercise to muscle mapping
export const exerciseToMuscle = {
  'bench press': ['chest', 'triceps', 'front-deltoids'],
  'push up': ['chest', 'triceps', 'front-deltoids', 'abs'],
  'pull up': ['upper-back', 'biceps', 'back-deltoids'],
  'deadlift': ['lower-back', 'gluteal', 'hamstring'],
  'squat': ['quadriceps', 'gluteal', 'hamstring'],
  'bicep curl': ['biceps'],
  'tricep dip': ['triceps', 'chest'],
  'shoulder press': ['front-deltoids', 'triceps'],
  'plank': ['abs'],
  'sit up': ['abs'],
  'row': ['upper-back', 'biceps'],
  'lat pulldown': ['upper-back', 'biceps'],
  'calf raise': ['calves'],
  'lateral raise': ['front-deltoids'],
  'hip thrust': ['gluteal'],
  'leg press': ['quadriceps', 'gluteal', 'hamstring'],
  'leg curl': ['hamstring'],
  'leg extension': ['quadriceps'],
  'shrug': ['trapezius'],
  'sprinting': ['quadriceps', 'hamstring', 'gluteal', 'calves', 'abs', 'obliques', 'lower-back', 'front-deltoids', 'back-deltoids', 'biceps', 'triceps'],
  'running': ['quadriceps', 'hamstring', 'gluteal', 'calves', 'abs', 'obliques','front-deltoids', 'back-deltoids'],
  'jogging': ['quadriceps', 'hamstring', 'gluteal', 'calves', 'abs', 'front-deltoids'],
  'walking': ['quadriceps', 'hamstring', 'gluteal', 'calves']
};

// Calories = MET × weight(kg) × time(hours)
const calculateRunningCalories = (workout, userWeight) => {
  // MET values based on speed (source: Compendium of Physical Activities)
  const metValues = {
    walking: 3.5,       // < 5 km/h
    jogging: 7.0,       // 5-8 km/h
    running: 9.8,       // 8-10 km/h
    sprinting: 12.8     // > 10 km/h
  };

  // Estimate intensity if not provided
  let met = metValues.jogging; // Default
  if (workout.speed) {
    if (workout.speed < 5) met = metValues.walking;
    else if (workout.speed <= 8) met = metValues.jogging;
    else if (workout.speed <= 10) met = metValues.running;
    else met = metValues.sprinting;
  }

  // Calculate calories
  const timeHours = workout.duration / 60; // Convert minutes to hours
  return met * userWeight * timeHours;
};

// Simulated "workout sessions" - this would normally come from DB
const workoutSessions = [
  { exercise: 'bench press', sets: 5, reps: 10 },
  { exercise: 'bench press', sets: 5, reps: 10 },
  { exercise: 'bench press', sets: 5, reps: 10 },
  { exercise: 'pull up', sets: 3, reps: 8 },
  { exercise: 'pull up', sets: 3, reps: 8 },
  { exercise: 'deadlift', sets: 4, reps: 5 }
];

// Aggregation function
function aggregateWorkouts(workouts, exerciseToMuscle) {
  const map = {};

  workouts.forEach(({ exercise }) => {
    if (!exercise) return;

    const name = exercise.toLowerCase();
    const muscles = exerciseToMuscle[name];
    if (!muscles) {
      console.warn(`Unknown exercise: ${name}`);
      return;
    }

    if (!map[name]) {
      map[name] = { name, muscles, frequency: 1 };
    } else {
      map[name].frequency += 1;
    }
  });

  return Object.values(map);
}

function BodyMap({ workouts }) {
  const [view, setView] = useState('anterior');
  const [selectedMuscleInfo, setSelectedMuscleInfo] = useState(null);

  // Aggregate data from workout sessions (simulate DB result)
  const formattedData = useMemo(
    () => aggregateWorkouts(workouts, exerciseToMuscle),
    [workouts]
  );

  const handleClick = useCallback(({ muscle, data }) => {
    const { exercises, frequency } = data;
    setSelectedMuscleInfo({ muscle, frequency, exercises });
  }, []);

  return (
    <div style={{ padding: 20, background: '#1e1e2f', borderRadius: 15 }}>
      <h2 style={{ color: '#00f2fe', textAlign: 'center' }}>Muscle Activation Map</h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <button
          onClick={() => setView('anterior')}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            backgroundColor: view === 'anterior' ? '#00f2fe' : '#3f51b5',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Front View
        </button>
        <button
          onClick={() => setView('posterior')}
          style={{
            padding: '10px 20px',
            backgroundColor: view === 'posterior' ? '#00f2fe' : '#3f51b5',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Back View
        </button>
      </div>

      <div style={{ maxWidth: 320, margin: '0 auto' }}>
        <Model
          data={formattedData}
          type={view}
          style={{ width: '100%', maxWidth: 320, padding: '2rem' }}
          onClick={handleClick}
        />
      </div>

      {selectedMuscleInfo && (
        <div style={{ 
          marginTop: 20, 
          padding: 20, 
          background: '#292944', 
          borderRadius: 10, 
          color: '#fff',
          border: '1px solid #00f2fe'
        }}>
          <h3 style={{ color: '#00f2fe', margin: '0 0 10px 0', textTransform: 'capitalize' }}>
            {selectedMuscleInfo.muscle}
          </h3>
          <p style={{ margin: '0 0 10px 0' }}>
            You've worked out this muscle <b>{selectedMuscleInfo.frequency}</b> times through the following exercises:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {selectedMuscleInfo.exercises.map((exercise, index) => (
              <li key={index} style={{ padding: '3px 0', textTransform: 'capitalize' }}>
                {exercise}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setSelectedMuscleInfo(null)}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Close Details
          </button>
        </div>
      )}

      <div style={{ marginTop: 20, padding: 10, background: '#292944', borderRadius: 10, color: '#00f2fe' }}>
        <p>Total Workouts: <b>{workouts.length}</b></p>
        <p>Unique Exercises: <b>{formattedData.length}</b></p>
      </div>
    </div>
  );
}

export default BodyMap;
