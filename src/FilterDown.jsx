import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

const FilterDropdown = ({ filters, setFilters, ISRAEL_REGIONS, user, isAddingWinery, setIsAddingWinery }) => {
  return (
    <Disclosure className="text-2xl font-bold mb-4 text-burgundy-800">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full justify-between rounded-lg bg-burgundy-100 px-4 py-2 text-left text-sm font-medium text-burgundy-900 hover:bg-burgundy-200 focus:outline-none focus-visible:ring focus-visible:ring-burgundy-500 focus-visible:ring-opacity-75">
            <span>Filters</span>
            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } h-5 w-5 text-burgundy-500`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Min Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Regions</label>
                <div className="mt-1 max-h-40 overflow-y-auto">
                  {ISRAEL_REGIONS.map(region => (
                    <div key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        id={region}
                        value={region}
                        checked={filters.regions.includes(region)}
                        onChange={(e) => {
                          const updatedRegions = e.target.checked
                            ? [...filters.regions, region]
                            : filters.regions.filter(r => r !== region);
                          setFilters({...filters, regions: updatedRegions});
                        }}
                        className="h-4 w-4 text-burgundy-600 focus:ring-burgundy-500 border-gray-300 rounded"
                      />
                      <label htmlFor={region} className="ml-2 block text-sm text-gray-900">
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default FilterDropdown;