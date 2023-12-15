import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ActionsContext, AtomsContext } from '../UI';
import { useQuery } from '@tanstack/react-query';
import { markersAtom } from './markers';
import { useAtom } from 'jotai';
import { MapPinned, Navigation, Trash } from 'lucide-react';


type IMarkedLocations = {
    open: boolean;
    setOpen: (e: boolean) => void;
}


const GpxGenerator: React.FC<{markers: any}> = ({ markers }) => {
    const createXmlString = () => {
      let result =
        '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="runtracker"><metadata/><trk><name></name><desc></desc>';
        result += '<trkseg>';
        result += Object.keys(markers).map((e) => 
            `<trkpt lat="${markers[e].latitude}" lon="${markers[e].longitude}">${markers[e].name ? `<ele>${markers[e].name}</ele>` : ''}</trkpt>`
        )
        result += '</trkseg></trk></gpx>';
      return result;
    };
  
    const downloadGpxFile = () => {
      const xml = createXmlString();
      const url = 'data:text/json;charset=utf-8,' + xml;
      const link = document.createElement('a');
      link.download = `mms.gpx`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
    };
  
    return (
      <div>
        {/* Add any additional JSX elements or components you may need */}
        <button className="w-full p-4 bg-white text-black rounded-md" onClick={downloadGpxFile}>Download GPX File</button>
      </div>
    );
  };

export const MarkedLocations: React.FC<IMarkedLocations> = ({
    open,
    setOpen
}) => {
	const [markers, setMarkers] = useAtom(markersAtom)
    const actions = useContext(ActionsContext);
    const [item, setItem] = useState<string>("")
    const mkeys = useMemo(() => Object.keys(markers), [markers]);

    if (open) {
        return (
            <div className="fixed inset-12 grid grid-cols-12 gap-2" style={{ zIndex: 9999 }}>
                        <div className="col-span-3 relative rounded-md backdrop-blur-md bg-black/25 p-2 flex flex-col gap-2 overflow-y-hidden">
                            <span className="text-white text-xl text-center p-2">Marked locations</span>
                            {!mkeys.length && <span className="text-gray-800">No locations marked yet.</span>}
                            <div className="flex flex-col p-1 gap-1 overflow-y-auto h-full text-white">
                                {mkeys.map((e) => <div className="p-3 rounded-md bg-gradient-to-t from-stone-900 to-stone-800 text-white flex flex-row items-center justify-between gap-2">
                                    <MapPinned size={24}/>
                                    <div className="flex flex-col gap-1 text-center">
                                        <span className="text-lg">{markers[e].name ?? "Geolocation"}</span>
                                        <span className="text-sm">{markers[e].latitude}, {markers[e].longitude}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 text-right">
                                        <button onClick={() => actions.goToLatLon(+markers[e].latitude, +markers[e].longitude)}><Navigation size={24}/></button>
                                        <button onClick={() => setMarkers((z) => {
                                            delete z[e];
                                            return z;
                                        }
                                        )}><Trash size={24}/></button>
                                    </div>
                                </div>)}
                            </div>
                        </div>
                        <div className="col-span-6 relative rounded-md backdrop-blur-md items-center justify-center flex flex-col gap-2 p-2 overflow-y-hidden bg-black/25">
                            { mkeys.length > 1 ? <>
                                <iframe width="100%" height="100%" src={
                                    `https://www.google.com/maps/embed/v1/directions?key=AIzaSyADyxTEE9ii8ZGpWSvfiwyTF8Dp0odrclk` +
                                    `&origin=${markers[mkeys[0]].latitude},${markers[mkeys[0]].longitude}` +
                                    `&destination=${markers[mkeys[mkeys.length - 1]].latitude},${markers[mkeys[mkeys.length - 1]].longitude}` +
                                    ((mkeys.length > 2) ? `&waypoints=${
                                        mkeys.slice(1, mkeys.length - 1).map((e) => {
                                            return `${markers[e].latitude},${markers[e].longitude}`
                                        }).join('|')
                                    }` : '')
                                }/>
                            </> : <span className="text-white text-lg">Mark at least two points</span>}
                        </div>
                        <div className="col-span-3 relative rounded-md backdrop-blur-md bg-black/25 p-2 flex flex-col gap-2 overflow-y-hidden">
                            <span className="text-white text-xl text-center p-2">Export GPX</span>
                            <GpxGenerator markers={markers}/>
                        </div>
            </div>
        );
    }

    return <></>;
};