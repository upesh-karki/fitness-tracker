import React, { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './datepicker.css';
import { exerciseToMuscle } from './BodyMap'; // Import exerciseToMuscle

// Full exercise list from your BodyMap.js (no typing duplication)
const exercises = [
  'bench press', 'push up', 'pull up', 'deadlift', 'squat', 'lunge', 'bicep curl', 'tricep dip',
  'shoulder press', 'plank', 'sit up', 'row', 'lat pulldown', 'leg press', 'calf raise',
  'lateral raise', 'front raise', 'crunch', 'russian twist', 'chest press', 'incline press',
  'hammer curl', 'tricep extension', 'leg extension', 'leg curl', 'hip thrust', 'face pull',
  'overhead press', 'dumbbell fly', 'reverse fly', 'shrug', 'upright row', 'good morning',
  'romanian deadlift', 'bulgarian split squat', 'hip abduction', 'hip adduction',
  'standing calf raise', 'seated calf raise', 'decline push up', 'diamond push up',
  'wide push up', 'pull down', 'seated row', 'bent over row', 't-bar row', 'inverted row',
  'dip', 'skull crusher', 'preacher curl', 'concentration curl', 'reverse curl', 'zottman curl',
  'overhead tricep extension', 'tricep pushdown', 'cable crossover', 'pec deck',
  'machine chest press', 'machine shoulder press', 'arnold press', 'reverse pec deck',
  'machine row', 'machine lat pulldown', 'machine leg press', 'machine leg extension',
  'machine leg curl', 'machine calf raise'
];

// Extract all unique muscle groups
const allMuscleGroups = [...new Set(Object.values(exerciseToMuscle).flat())].sort();

const CustomDateInput = forwardRef(({
  value,
  onClick,
  inputStyle
}, ref) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
    <input
      type="text"
      onClick={onClick}
      value={value}
      readOnly
      ref={ref}
      style={{
        ...inputStyle,
        cursor: 'pointer',
        paddingRight: '30px' // Make space for the icon
      }}
    />
    <span
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '10px',
        cursor: 'pointer',
        color: '#00f2fe' // Icon color
      }}
    >📅</span> {/* Calendar icon */}
  </div>
));

const NumberSelector = ({ value, onChange, min = 0, max = 100, label, step = 1 }) => {
  const scrollRef = useRef(null);
  const itemHeight = 35; // Height of each number item
  const visibleItems = 5; // Number of items visible in the scroll view (should be odd)
  const halfVisible = Math.floor(visibleItems / 2);

  // Helper to snap a number to the nearest step
  const snapToNearestStep = useCallback((num) => {
    return Math.round(num / step) * step;
  }, [step]);

  // Generate numbers to display around the current value
  const getDisplayNumbers = useCallback(() => {
    const numbers = [];
    // Start from `value - halfVisible * step`, clamped by `min`
    let startNum = Math.max(min, snapToNearestStep(value - halfVisible * step));

    // Adjust startNum to ensure 'value' is centered correctly, especially near min/max
    if (value + halfVisible * step > max) {
      startNum = Math.max(min, snapToNearestStep(max - (visibleItems - 1) * step));
    } else if (value - halfVisible * step < min) {
      startNum = min;
    }

    for (let i = 0; i < visibleItems; i++) {
      const num = parseFloat((startNum + i * step).toFixed(2)); // Use toFixed for precision
      if (num <= max) {
        numbers.push(num);
      } else {
        break; // Stop if we exceed max
      }
    }
    return numbers;
  }, [value, min, max, step, visibleItems, halfVisible, snapToNearestStep]);

  const displayNumbers = getDisplayNumbers();

  // Effect to scroll to the selected value when it changes
  useEffect(() => {
    if (scrollRef.current) {
      // Calculate the scroll position to center the current value
      const currentElementIndex = displayNumbers.indexOf(value);
      if (currentElementIndex !== -1) {
        scrollRef.current.scrollTop = currentElementIndex * itemHeight; // Scroll to center based on its index in *displayed* items
      }
    }
  }, [value, displayNumbers, itemHeight]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollY = scrollRef.current.scrollTop;
      // Determine which item is in the middle of the view
      const middleIndex = Math.round(scrollY / itemHeight);
      const newValue = displayNumbers[middleIndex];

      if (newValue !== undefined && newValue !== value) {
        onChange(newValue);
      }
    }
  }, [onChange, value, displayNumbers, itemHeight]);

  const handleNumberClick = useCallback((num) => {
    onChange(num);
  }, [onChange]);

  // Ensure value stays within min/max bounds when passed as prop initially or by external changes
  useEffect(() => {
    if (value < min || value > max) {
      onChange(Math.max(min, Math.min(max, value)));
    }
  }, [value, min, max, onChange]);

  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>{label}:</label>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: '8px',
        padding: '5px',
        width: '100%'
      }}>
        <button
          onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))}
          style={{
            padding: '8px 12px',
            backgroundColor: '#444',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          -
        </button>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={(e) => {
            e.preventDefault();
            const direction = Math.sign(e.deltaY); // -1 for up, 1 for down
            const newValue = parseFloat((value + direction * step).toFixed(2)); // Directly change by step, ensure precision
            onChange(Math.max(min, Math.min(max, newValue)));
          }}
          style={{
            height: itemHeight * visibleItems, 
            overflowY: 'scroll',
            width: '80px',
            textAlign: 'center',
            margin: '0 10px',
            border: '1px solid #444',
            borderRadius: '4px',
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            position: 'relative', // For centering highlight
          }}>
          {/* Custom Scrollbar hiding */}
          <style>{`
            ::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {displayNumbers.map((num) => (
            <div
              key={num}
              style={{
                height: itemHeight,
                lineHeight: `${itemHeight}px`,
                color: num === value ? '#00f2fe' : '#fff',
                fontWeight: num === value ? 'bold' : 'normal',
                backgroundColor: num === value ? '#444' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onClick={() => handleNumberClick(num)}
            >
              {num.toFixed(step % 1 !== 0 ? 1 : 0)} {/* Format based on step */}
            </div>
          ))}

          {/* Visual highlight for the center selected item */}
          <div style={{
            position: 'absolute',
            top: halfVisible * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
            borderTop: '1px solid #00f2fe',
            borderBottom: '1px solid #00f2fe',
            pointerEvents: 'none', // Allow clicks to pass through
          }} />
        </div>
        <button
          onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))}
          style={{
            padding: '8px 12px',
            backgroundColor: '#444',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

function AddExerciseModal({ addWorkout, initialExercise, onModalClose }) {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState(1);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]); // New state for selected muscle groups

  const setsInputRef = useRef(null);

  useEffect(() => {
    if (initialExercise) {
      setSelectedExercise(initialExercise);
      setIsCustomExercise(false); // Assume it's a known exercise for now
    }
  }, [initialExercise]);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsCustomExercise(false);
  };

  const handleCustomExercise = () => {
    setIsCustomExercise(true);
    setSelectedExercise('');
  };

  const handleAdd = async () => {
    if (!selectedExercise && !customExerciseName) return;
    if (!sets || !reps) return;
    if (isCustomExercise && selectedMuscleGroups.length === 0) {
      alert('Please select at least one muscle group for the custom exercise.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addWorkout({
        exercise: isCustomExercise ? customExerciseName : selectedExercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        date: selectedDate.toISOString(),
        muscleGroups: isCustomExercise ? selectedMuscleGroups : exerciseToMuscle[selectedExercise.toLowerCase()] || []
      });

      // Reset and close modal
      setSelectedExercise('');
      setCustomExerciseName('');
      setSets(1);
      setReps(1);
      setSelectedDate(new Date());
      setSelectedMuscleGroups([]); // Reset selected muscle groups
      if (onModalClose) onModalClose();
      setIsCustomExercise(false);
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onModalClose) onModalClose();
    setSelectedExercise('');
    setCustomExerciseName('');
    setSets(1);
    setReps(1);
    setSelectedDate(new Date());
    setIsCustomExercise(false);
  };

  const datePickerInputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    marginTop: '5px',
    backgroundColor: '#333',
    color: '#fff',
    boxSizing: 'border-box'
  };

  // Render the modal directly as its visibility is controlled by the parent
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#222',
        borderRadius: '12px',
        padding: '20px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh', // Limit height to 90% of viewport height
        overflowY: 'auto', // Enable internal scrolling for modal content
      }} onWheel={(e) => e.stopPropagation()}>
        {!selectedExercise && !isCustomExercise ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '70%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none'
                }}
              />
              <button
                onClick={handleCustomExercise}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#4CAF50',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                + Custom Exercise
              </button>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'scroll' }}>
              {exercises
                .filter(e => e.includes(search.toLowerCase()))
                .map((exercise, idx) => (
                  <div key={idx}
                    style={{
                      padding: '12px',
                      margin: '5px 0',
                      backgroundColor: '#333',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleExerciseClick(exercise)}
                  >
                    {exercise}
                  </div>
                ))}
            </div>
          </>
        ) : (
          <>
            <h3 style={{ color: '#00f2fe', textTransform: 'capitalize' }}>
              {isCustomExercise ? 'Custom Exercise' : selectedExercise}
            </h3>

            {isCustomExercise && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ color: '#fff' }}>Exercise Name:</label>
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Enter exercise name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    marginTop: '5px'
                  }}
                />
              </div>
            )}

            {/* Add Muscle Group Selection for Custom Exercise */}
            {isCustomExercise && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Select Muscle Groups:</label>
                <div style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto', 
                  border: '1px solid #444', 
                  borderRadius: '8px', 
                  padding: '10px',
                  backgroundColor: '#333'
                }}>
                  {allMuscleGroups.map((muscle) => (
                    <div key={muscle} style={{ marginBottom: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#fff' }}>
                        <input
                          type="checkbox"
                          checked={selectedMuscleGroups.includes(muscle)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMuscleGroups([...selectedMuscleGroups, muscle]);
                            } else {
                              setSelectedMuscleGroups(selectedMuscleGroups.filter(m => m !== muscle));
                            }
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        {muscle}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <NumberSelector
              value={sets}
              onChange={setSets}
              min={1}
              max={100}
              label="Sets"
            />
            <NumberSelector
              value={reps}
              onChange={setReps}
              min={1}
              max={1000}
              label="Reps"
            />

            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Date:</label>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                customInput={<CustomDateInput inputStyle={datePickerInputStyle} />}
                dateFormat="MM/dd/yyyy h:mm aa"
                showTimeSelect
                timeFormat="h:mm aa"
                timeIntervals={15}
                className="react-datepicker-custom-input"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#00f2fe',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Workout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AddExerciseModal;
