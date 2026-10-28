'use client';

import { ChangeEvent } from 'react';

interface CustomDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  maxDate?: Date;
}

export function CustomDatePicker({ value, onChange, maxDate }: CustomDatePickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      onChange(new Date(dateValue));
    } else {
      onChange(undefined);
    }
  };

  const formattedValue = value ? value.toISOString().split('T')[0] : '';
  const maxFormatted = maxDate ? maxDate.toISOString().split('T')[0] : undefined;

  return (
    <input
      type="date"
      value={formattedValue}
      onChange={handleChange}
      max={maxFormatted}
      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black text-sm"
      required
    />
  );
}
