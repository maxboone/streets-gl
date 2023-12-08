import React from 'react'

export const KeyBindings: React.FC = () => {
  return (
    <div className="fixed top-8 right-8 flex flex-col gap-2 bg-black/25 backdrop-blur-md p-2 rounded-md text-sm text-gray-200">
        <div className="flex flex-row gap-2 items-center">
            <span>Press</span>
            <span className="p-1 pr-3 pb-3 flex items-center justify-center w-8 border-solid border border-white rounded-sm text-white">K</span>
            <span>to search current location</span>
        </div>
        <div className="flex flex-row gap-2 items-center">
            <span>Press</span>
            <span className="p-1 pr-3 pb-3 flex items-center justify-center w-8 border-solid border border-white rounded-sm text-white">M</span>
            <span>to (un)mark waypoint for route</span>
        </div>
        <div className="flex flex-row gap-2 items-center">
            <span>Press</span>
            <span className="p-1 pr-3 pb-3 flex items-center justify-center w-8 border-solid border border-white rounded-sm text-white">L</span>
            <span>to show marked waypoints</span>
        </div>
        <div className="flex flex-row gap-2 items-center">
            <span>Press</span>
            <span className="p-1 pr-3 pb-3 flex items-center justify-center w-8 border-solid border border-white rounded-sm text-white">P</span>
            <span>to open search prompt</span>
        </div>
    </div>
  )
}

export default KeyBindings