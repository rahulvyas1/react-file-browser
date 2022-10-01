import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import React from 'react';

/**
 * Arrow which is on the left of the folder
 * It is a controlled component and is controlled from the parent.
 * @param {object} props
 * @returns
 */
export default function AccordionArrow(props) {
  return (
    <span>
      {props.isOpen && <ChevronDownIcon className="h-6 w-6 text-gray-700" />}
      {!props.isOpen && <ChevronRightIcon className="h-6 w-6 text-gray-700" />}
    </span>
  );
}
