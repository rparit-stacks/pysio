"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AppointmentDatePicker({ selectedDate, onDateChange }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Select Date</p>
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        minDate={new Date()}
        dateFormat="dd/MM/yyyy"
        className="border border-emerald-500 rounded-md px-3 py-1 w-full text-sm"
      />
    </div>
  );
}
