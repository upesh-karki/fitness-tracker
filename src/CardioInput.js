import React, { useState, useRef, forwardRef, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './datepicker.css'; // Reusing your existing datepicker styles

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
            scrollbarWidth: 'none', // For Firefox
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

function CardioInput({ addWorkout, onClose }) {
  const [duration, setDuration] = useState(30);
  const [speed, setSpeed] = useState(8);
  const [incline, setIncline] = useState('');   // % grade
  const [distance, setDistance] = useState(''); // km
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCardio = async () => {
    if (!duration || !speed) return;

    try {
      setIsSubmitting(true);
      await addWorkout({
        exercise: "Running", // Default for cardio, can be extended later
        duration: duration,
        speed: speed,
        incline: incline ? parseInt(incline) : undefined,
        distance: distance ? parseFloat(distance) : undefined,
        date: selectedDate.toISOString(),
        type: "cardio" // Add a type to distinguish from strength workouts
      });

      // Reset and close modal
      setDuration(30);
      setSpeed(8);
      setIncline('');
      setDistance('');
      setSelectedDate(new Date());
      onClose();
    } catch (error) {
      console.error('Error adding cardio workout:', error);
      alert('Failed to add cardio workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    setDuration(30);
    setSpeed(8);
    setSelectedDate(new Date());
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
        color: '#fff'
      }} onWheel={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#00f2fe', textAlign: 'center', marginBottom: '20px' }}>Add Cardio Workout</h2>

        <NumberSelector
          value={duration}
          onChange={setDuration}
          min={1}
          max={300}
          label="Duration (minutes)"
        />

        <NumberSelector
          value={speed}
          onChange={setSpeed}
          min={1}
          max={30}
          step={0.1}
          label="Speed (km/h)"
        />

        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Incline (% grade - optional):</label>
          <input
            type="number"
            value={incline}
            onChange={(e) => setIncline(e.target.value)}
            placeholder="e.g., 5"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#333',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Distance (km - optional):</label>
          <input
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g., 5.2"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#333',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Workout Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            maxDate={new Date()}
            dateFormat="MMM d, yyyy h:mm aa"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            popperClassName="custom-datepicker-popper"
            customInput={<CustomDateInput inputStyle={datePickerInputStyle} />}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAddCardio}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#666' : '#00f2fe',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Cardio'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardioInput; 