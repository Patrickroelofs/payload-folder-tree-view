import React from 'react'

import './styles.scss'

export const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={[className, 'icon icon--loading'].filter(Boolean).join(' ')}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)