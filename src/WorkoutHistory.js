import React, { useState, useEffect } from 'react';
import { deleteWorkout } from './db';
import WorkoutInput from './WorkoutInput';
import WorkoutSuggestions from './WorkoutSuggestions';
import CardioInput from './CardioInput';

function WorkoutHistory({ workouts, onWorkoutDeleted, addWorkout }) {
  console.log('WorkoutHistory: workouts prop', workouts); // Log 1
  const [filterType, setFilterType] = useState('all'); // 'all', 'daily', 'weekly', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState(new Set());
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [prefilledExercise, setPrefilledExercise] = useState(null);
  const [showCardioInputModal, setShowCardioInputModal] = useState(false);
  const [currentView, setCurrentView] = useState('exerciseSummary'); // New state for view management

  console.log('WorkoutHistory: currentView state', currentView); // Log 2

  // Effect to manage body scroll when modals are open
  useEffect(() => {
    const isAnyModalOpen = showSuggestionsModal || showAddExerciseModal || showCardioInputModal;

    const preventScroll = (e) => {
      e.preventDefault();
    };

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.addEventListener('touchmove', preventScroll, { passive: false });
    } else {
      document.body.style.overflow = ''; // Reset to default
      document.body.removeEventListener('touchmove', preventScroll);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.removeEventListener('touchmove', preventScroll);
    };
  }, [showSuggestionsModal, showAddExerciseModal, showCardioInputModal]);

  const filterWorkouts = (workouts) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    switch (filterType) {
      case 'daily':
        return workouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= today;
        });
      case 'weekly':
        return workouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= weekAgo;
        });
      case 'custom':
        if (!startDate || !endDate) return workouts;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        return workouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= start && workoutDate <= end;
        });
      default:
        return workouts;
    }
  };

  const handleDeleteClick = () => {
    if (isDeleteMode) {
      // If already in delete mode and no workouts selected, exit delete mode
      if (selectedWorkouts.size === 0) {
        setIsDeleteMode(false);
        return;
      }

      // Confirm deletion
      if (window.confirm(`Are you sure you want to delete ${selectedWorkouts.size} workout(s)?`)) {
        // Delete selected workouts
        selectedWorkouts.forEach(async (workoutId) => {
          await deleteWorkout(workoutId);
        });
        // Notify parent component to refresh workouts
        onWorkoutDeleted();
        // Reset selection and exit delete mode
        setSelectedWorkouts(new Set());
        setIsDeleteMode(false);
      }
    } else {
      // Enter delete mode
      setIsDeleteMode(true);
    }
  };

  const toggleWorkoutSelection = (workoutId) => {
    const newSelection = new Set(selectedWorkouts);
    if (newSelection.has(workoutId)) {
      newSelection.delete(workoutId);
    } else {
      newSelection.add(workoutId);
    }
    setSelectedWorkouts(newSelection);
  };

  const handleShowSuggestions = () => {
    setShowSuggestionsModal(true);
  };

  const handleCloseSuggestions = () => {
    setShowSuggestionsModal(false);
  };

  const handleAddSuggestedWorkout = (exercise) => {
    setPrefilledExercise(exercise);
    setShowAddExerciseModal(true);
    setShowSuggestionsModal(false); // Close suggestions modal
  };

  const handleCloseAddExerciseModal = () => {
    setShowAddExerciseModal(false);
    setPrefilledExercise(null); // Clear pre-filled exercise
  };

  const handleShowCardioInput = () => {
    setShowCardioInputModal(true);
  };

  const handleCloseCardioInput = () => {
    setShowCardioInputModal(false);
  };

  const filteredWorkouts = filterWorkouts(workouts);

  // Group workouts by date
  const groupedWorkouts = filteredWorkouts.reduce((groups, workout) => {
    const date = new Date(workout.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {});

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Separate strength and cardio workouts
  const strengthWorkouts = workouts.filter(workout => workout.exercise && !workout.duration);
  console.log('WorkoutHistory: strengthWorkouts', strengthWorkouts); // Log 3
  const cardioWorkouts = workouts.filter(workout => workout.type === 'cardio');

  // Group strength workouts by date for display
  const groupedStrengthWorkouts = filterWorkouts(strengthWorkouts).reduce((groups, workout) => {
    const date = new Date(workout.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {});
  console.log('WorkoutHistory: groupedStrengthWorkouts', groupedStrengthWorkouts); // Log 4

  // Group cardio workouts by date for display
  const groupedCardioWorkouts = filterWorkouts(cardioWorkouts).reduce((groups, workout) => {
    const date = new Date(workout.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {});

  return (
    <div className="workout-history-container">
      <div className="history-header-controls">
        <h2 style={{ color: '#00f2fe', textAlign: 'center', margin: 0 }}>
          Workout History
        </h2>
        <div className="history-buttons-wrapper">
          <button
            onClick={() => setShowAddExerciseModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#00f2fe',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto'
            }}
          >
            Add Exercise
          </button>
          <button
            onClick={handleShowCardioInput}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Add Cardio
          </button>
          <button
            onClick={handleShowSuggestions}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Suggest Workout
          </button>
          <button
            onClick={handleDeleteClick}
            style={{
              padding: '8px 16px',
              backgroundColor: isDeleteMode ? '#dc3545' : '#3f51b5',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isDeleteMode ? (
              <>
                {selectedWorkouts.size > 0 ? `Delete Selected (${selectedWorkouts.size})` : 'Cancel'}
              </>
            ) : (
              'Delete Workouts'
            )}
          </button>
        </div>
      </div>

      <div className="summary-buttons-wrapper">
        <button
          onClick={() => setCurrentView('exerciseSummary')}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            backgroundColor: currentView === 'exerciseSummary' ? '#00f2fe' : '#3f51b5',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Exercise Summary
        </button>
        <button
          onClick={() => setCurrentView('cardioSummary')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'cardioSummary' ? '#00f2fe' : '#3f51b5',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Cardio Summary
        </button>
      </div>

      {currentView === 'exerciseSummary' && (
        <>
          <div className="filter-options-wrapper">
            {/* Filter Controls */}
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'all' ? '#00f2fe' : '#3f51b5',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterType('daily')}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'daily' ? '#00f2fe' : '#3f51b5',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setFilterType('weekly')}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'weekly' ? '#00f2fe' : '#3f51b5',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Weekly
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #00f2fe',
                  background: '#292944',
                  color: 'white'
                }}
              />
              <span style={{ color: 'white' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #00f2fe',
                  background: '#292944',
                  color: 'white'
                }}
              />
              <button
                onClick={() => setFilterType('custom')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filterType === 'custom' ? '#00f2fe' : '#3f51b5',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Apply Custom
              </button>
            </div>
          </div>

          {Object.keys(groupedStrengthWorkouts).length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center', marginTop: '30px' }}>No strength workouts recorded for this period.</p>
          ) : (
            <div style={{
              // overflowX: 'auto', // Temporarily remove this to debug click issue
              background: '#292944',
              borderRadius: '10px',
              padding: '15px'
            }}>
              {Object.entries(groupedStrengthWorkouts).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)).map(([date, dayWorkouts]) => (
                <div key={date} style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    color: '#00f2fe',
                    marginBottom: '10px',
                    padding: '5px 10px',
                    background: '#1e1e2f',
                    borderRadius: '5px'
                  }}>
                    {date}
                  </h3>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    color: '#fff',
                    marginBottom: '20px'
                  }}>
                    <thead>
                      <tr>
                        {isDeleteMode && (
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #00f2fe', width: '50px' }}>
                            Select
                          </th>
                        )}
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Date & Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Exercise</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Sets</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Reps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayWorkouts.map((workout, index) => (
                        <tr
                          key={workout.id || index}
                          style={{
                            borderBottom: '1px solid #444',
                            '&:hover': { background: '#333' },
                            backgroundColor: selectedWorkouts.has(workout.id) ? 'rgba(220, 53, 69, 0.1)' : 'transparent'
                          }}
                        >
                          {isDeleteMode && (
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={selectedWorkouts.has(workout.id)}
                                onChange={() => toggleWorkoutSelection(workout.id)}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer'
                                }}
                              />
                            </td>
                          )}
                          <td style={{ padding: '12px' }}>
                            {formatDateTime(workout.date)}
                          </td>
                          <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                            {workout.exercise}
                          </td>
                          <td style={{ padding: '12px' }}>{workout.sets}</td>
                          <td style={{ padding: '12px' }}>{workout.reps}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {currentView === 'cardioSummary' && (
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          padding: '20px',
          background: '#292944',
          borderRadius: '15px',
          color: '#fff',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <h3>Cardio Summary</h3>
          {Object.keys(groupedCardioWorkouts).length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center', marginTop: '30px' }}>No cardio workouts recorded for this period.</p>
          ) : (
            <div style={{
              overflowX: 'auto',
              background: '#292944',
              borderRadius: '10px',
              padding: '15px'
            }}>
              {Object.entries(groupedCardioWorkouts).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)).map(([date, dayWorkouts]) => (
                <div key={date} style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    color: '#00f2fe',
                    marginBottom: '10px',
                    padding: '5px 10px',
                    background: '#1e1e2f',
                    borderRadius: '5px'
                  }}>
                    {date}
                  </h3>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    color: '#fff',
                    marginBottom: '20px'
                  }}>
                    <thead>
                      <tr>
                        {isDeleteMode && (
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #00f2fe', width: '50px' }}>
                            Select
                          </th>
                        )}
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Date & Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Distance (km)</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Speed (km/h)</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #00f2fe' }}>Duration (mins)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayWorkouts.map((workout, index) => (
                        <tr
                          key={workout.id || index}
                          style={{
                            borderBottom: '1px solid #444',
                            '&:hover': { background: '#333' },
                            backgroundColor: selectedWorkouts.has(workout.id) ? 'rgba(220, 53, 69, 0.1)' : 'transparent'
                          }}
                        >
                          {isDeleteMode && (
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={selectedWorkouts.has(workout.id)}
                                onChange={() => toggleWorkoutSelection(workout.id)}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer'
                                }}
                              />
                            </td>
                          )}
                          <td style={{ padding: '12px' }}>
                            {formatDateTime(workout.date)}
                          </td>
                          <td style={{ padding: '12px' }}>{workout.distance ? `${workout.distance.toFixed(2)}` : 'N/A'}</td>
                          <td style={{ padding: '12px' }}>{workout.speed ? `${workout.speed.toFixed(1)}` : 'N/A'}</td>
                          <td style={{ padding: '12px' }}>{workout.duration ? `${workout.duration}` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSuggestionsModal && (
        <WorkoutSuggestions workouts={workouts} onClose={handleCloseSuggestions} onAddSuggestedWorkout={handleAddSuggestedWorkout} />
      )}

      {showAddExerciseModal && (
        <WorkoutInput
          addWorkout={addWorkout}
          initialExercise={prefilledExercise}
          onModalClose={handleCloseAddExerciseModal}
        />
      )}

      {showCardioInputModal && (
        <CardioInput addWorkout={addWorkout} onClose={handleCloseCardioInput} />
      )}
    </div>
  );
}

export default WorkoutHistory; 