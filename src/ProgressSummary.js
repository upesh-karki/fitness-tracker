import React, { useMemo } from 'react';
import BodyMap from './BodyMap';

function ProgressSummary({ workouts }) {
  const filterWorkoutsForWeek = (allWorkouts) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start of week
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    return allWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek && workoutDate < endOfWeek;
    });
  };

  const weeklyWorkouts = useMemo(() => filterWorkoutsForWeek(workouts), [workouts]);

  return (
    <div style={{
      padding: '20px',
      background: '#1e1e2f',
      borderRadius: '15px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#00f2fe', textAlign: 'center', margin: 0 }}>Weekly Progress Summary</h2>
      </div>
      
      {weeklyWorkouts.length > 0 ? (
        <BodyMap workouts={weeklyWorkouts} />
      ) : (
        <p style={{ color: '#fff', textAlign: 'center' }}>No workouts recorded for this week.</p>
      )}
    </div>
  );
}

export default ProgressSummary; 