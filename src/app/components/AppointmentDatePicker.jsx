"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getTherapistAvailableDatesForMonth } from "../../lib/actions/availability";

export default function AppointmentDatePicker({ 
  selectedDate, 
  onDateChange, 
  therapistId, 
  className = "",
  disabled = false 
}) {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState([]);

  // Fetch available dates for the current month
  const fetchAvailableDates = useCallback(async (year, month) => {
    if (!therapistId) return;
    
    setLoading(true);
    try {
      const result = await getTherapistAvailableDatesForMonth(therapistId, year, month);
      if (result.success) {
        setAvailableDates(result.data);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  // Generate calendar dates for the current month
  const generateCalendarDates = useCallback((year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month - 1;
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isAvailable = availableDates.includes(dateString);
      const isSelected = selectedDate === dateString;

      dates.push({
        date,
        dateString,
        isCurrentMonth,
        isToday,
        isPast,
        isAvailable,
        isSelected
      });

      if (date > lastDay && i > 6) break;
    }

    setCalendarDates(dates);
  }, [availableDates, selectedDate]);

  // Handle month change
  const changeMonth = useCallback((direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  // Handle date selection
  const handleDateClick = useCallback((dateString, isAvailable, isPast) => {
    if (!isAvailable || isPast || disabled) return;
    onDateChange(dateString);
  }, [onDateChange, disabled]);

  // Initialize calendar
  useEffect(() => {
    if (therapistId) {
      fetchAvailableDates(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    }
  }, [therapistId, currentMonth, fetchAvailableDates]);

  // Update calendar dates when available dates change
  useEffect(() => {
    generateCalendarDates(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }, [currentMonth, generateCalendarDates]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => changeMonth('prev')}
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        
        <button
          onClick={() => changeMonth('next')}
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Dates */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {calendarDates.map((dateInfo, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dateInfo.dateString, dateInfo.isAvailable, dateInfo.isPast)}
            disabled={!dateInfo.isAvailable || dateInfo.isPast || disabled}
            className={`
              relative p-2 text-sm rounded-lg transition-all duration-200
              ${!dateInfo.isCurrentMonth ? 'text-gray-300' : ''}
              ${dateInfo.isPast ? 'text-gray-400 cursor-not-allowed' : ''}
              ${dateInfo.isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
              ${dateInfo.isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
              ${dateInfo.isAvailable && !dateInfo.isPast && !dateInfo.isSelected && dateInfo.isCurrentMonth 
                ? 'hover:bg-blue-50 text-gray-900 cursor-pointer' 
                : ''
              }
              ${!dateInfo.isAvailable && dateInfo.isCurrentMonth && !dateInfo.isPast 
                ? 'text-gray-400 cursor-not-allowed' 
                : ''
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span>{dateInfo.date.getDate()}</span>
            
            {/* Availability indicator */}
            {dateInfo.isAvailable && dateInfo.isCurrentMonth && !dateInfo.isPast && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
              </div>
            )}
            
            {/* Unavailable indicator */}
            {!dateInfo.isAvailable && dateInfo.isCurrentMonth && !dateInfo.isPast && (
              <div className="absolute -top-1 -right-1">
                <XCircle className="h-3 w-3 text-red-400" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-3 w-3 text-red-400" />
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
