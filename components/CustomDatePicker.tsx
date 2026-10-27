'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full p-3 border rounded-lg text-left flex items-center justify-between text-sm outline-none focus:border-black transition ${
          value ? 'text-gray-900 bg-white' : 'text-gray-400 bg-gray-50'
        }`}
      >
        {value ? format(value, 'dd/MM/yyyy') : 'Select Date of Birth'}
        <CalendarIcon size={16} className="text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-sm overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-sm font-black text-gray-900">Select Date</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black"><X size={18} /></button>
              </div>

              <div className="flex justify-center">
                <DayPicker
                  mode="single"
                  selected={value}
                  onSelect={handleSelect}
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                  captionLayout="dropdown"
                  style={{
                    // Override CSS variables for a black/white theme
                    '--rdp-accent-color': '#000000',
                    '--rdp-background-color': '#f3f4f6',
                    '--rdp-outline': '2px solid black',
                    '--rdp-outline-selected': '2px solid white',
                  } as React.CSSProperties}
                  classNames={{
                    month_caption: 'flex justify-center pt-1 relative items-center mb-2',
                    caption_label: 'text-sm font-bold text-gray-900',
                    nav: 'flex items-center',
                    button_previous: 'h-7 w-7 bg-transparent p-0 text-gray-500 hover:text-black flex items-center justify-center absolute left-1',
                    button_next: 'h-7 w-7 bg-transparent p-0 text-gray-500 hover:text-black flex items-center justify-center absolute right-1',
                    month_grid: 'w-full border-collapse space-y-1',
                    weekdays: 'flex',
                    weekday: 'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
                    week: 'flex w-full mt-2',
                    day: 'h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 transition text-center text-sm relative focus-within:relative focus-within:z-20',
                    day_button: 'h-9 w-9 rounded-md',
                    selected: 'bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white',
                    today: 'bg-gray-100 text-gray-900 font-bold',
                    outside: 'text-gray-300 opacity-50',
                    disabled: 'text-gray-300 opacity-50',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
