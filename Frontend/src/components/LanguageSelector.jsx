import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../store/slices/languageSlice';

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const { currentLanguage } = useSelector((state) => state.language);

  const handleLanguageChange = (e) => {
    dispatch(setLanguage(e.target.value));
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <label className="text-sm font-medium text-gray-700">Language:</label>
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm text-sm"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>
  );
};

export default LanguageSelector;