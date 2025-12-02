import React from 'react';

const ExcelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25V6.75c0-1.105.895-2 2-2h14c1.105 0 2 .895 2 2v10.5c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75v10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
  </svg>
);

export default ExcelIcon;
