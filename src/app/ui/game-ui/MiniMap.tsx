import { LatLngExpression, Map } from 'leaflet';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet';
import {useRecoilValue} from "recoil";
import {ActionsContext, AtomsContext} from "~/app/ui/UI";
import { Navigation, Navigation2 } from 'lucide-react';

export const MiniMap: React.FC = () => {
	const atoms = useContext(AtomsContext);
	const actions = useContext(ActionsContext);
	const direction = useRecoilValue(atoms.northDirection);
    const map = React.createRef<Map>()

    useEffect(() => {
        const intervalID = setInterval(() =>  {
            try {
                const hash = actions?.getControlsStateHash && actions.getControlsStateHash();
                if (hash && map?.current) {
                    const components = hash.split(',');
                    const lat = +components[0];
                    const lon = +components[1];

                    if (lat && lon) {
                        map?.current?.setView([lat, lon]);
                        map?.current?.invalidateSize();
                    }
                }
            } catch {
                // do nothing
            }
        }, 100);
    
        return () => clearInterval(intervalID);
    }, [map]);
    
    return <div className="absolute left-8 bottom-8 overflow-hidden w-64 h-64 rounded-full border border-solid border-4 border-black"
    style={{ transform: "rotate(" + direction + "deg)" }}>
        <div 
            className="absolute inset-0 flex items-center justify-center" 
            style={{ zIndex: 999, transform: "rotate(" + (0 - direction) + "deg)" }}>
                <Navigation2 size={24} />
            </div>
        <MapContainer 
            center={[51.505, -0.09]} 
            zoom={20}
            ref={map}
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full"
            dragging={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            attributionControl={false}
            zoomControl={false}
        >
            <TileLayer
            attribution=''
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
      </MapContainer>
    </div>
};