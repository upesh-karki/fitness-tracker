import React, { useMemo } from 'react';
import { exerciseToMuscle } from './BodyMap'; // Import the mapping

function WorkoutSuggestions({ workouts, onClose, onAddSuggestedWorkout }) {
  const underworkedMuscles = useMemo(() => {
    const muscleFrequency = {};
    const allMuscles = new Set();

    // Initialize all muscles from the mapping
    for (const exercise in exerciseToMuscle) {
      exerciseToMuscle[exercise].forEach(muscle => {
        allMuscles.add(muscle);
        muscleFrequency[muscle] = 0; // Initialize frequency to 0
      });
    }

    // Calculate frequency of worked muscles from workouts
    workouts.forEach(workout => {
      const exerciseName = workout.exercise.toLowerCase();
      const muscles = exerciseToMuscle[exerciseName];
      if (muscles) {
        muscles.forEach(muscle => {
          muscleFrequency[muscle] += 1;
        });
      }
    });

    // Identify underworked muscles (e.g., worked less than X times, or not at all)
    const threshold = 1; // You can adjust this threshold
    const underworked = [];
    allMuscles.forEach(muscle => {
      if (muscleFrequency[muscle] <= threshold) {
        underworked.push(muscle);
      }
    });

    return underworked;
  }, [workouts]);

  const suggestedWorkouts = useMemo(() => {
    const suggestions = new Set();
    underworkedMuscles.forEach(muscle => {
      for (const exercise in exerciseToMuscle) {
        if (exerciseToMuscle[exercise].includes(muscle)) {
          suggestions.add(exercise); // Add exercise that targets this muscle
        }
      }
    });
    return Array.from(suggestions);
  }, [underworkedMuscles]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000 // Ensure it's on top of other modals
    }}>
      <div style={{
        backgroundColor: '#222',
        borderRadius: '12px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#00f2fe', margin: 0 }}>Workout Suggestions</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {suggestedWorkouts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {suggestedWorkouts.map((suggestion, index) => (
              <li key={index} style={{
                padding: '10px',
                margin: '5px 0',
                background: '#333',
                borderRadius: '8px',
                textTransform: 'capitalize',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  {suggestion}
                  <span style={{ fontSize: '0.8em', color: '#aaa', marginLeft: '10px' }}>
                    ({exerciseToMuscle[suggestion.toLowerCase()] ? exerciseToMuscle[suggestion.toLowerCase()].join(', ') : 'N/A'})
                  </span>
                </div>
                <button
                  onClick={() => {
                    onAddSuggestedWorkout(suggestion); // Call the new handler
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#00f2fe',
                    border: 'none',
                    borderRadius: '5px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Great job! All muscles seem to be well-worked. No specific suggestions at this time.</p>
        )}
      </div>
    </div>
  );
}

export default WorkoutSuggestions; 