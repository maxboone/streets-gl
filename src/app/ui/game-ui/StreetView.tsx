import { APIProvider, Map } from '@vis.gl/react-google-maps';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {useRecoilValue} from "recoil";
import {ActionsContext, AtomsContext} from "~/app/ui/UI";
import {
  useMap,
  useStreetViewPanorama
} from '@vis.gl/react-google-maps';

export const StreetView: React.FC = () => {
	const atoms = useContext(AtomsContext);
	const actions = useContext(ActionsContext);
	const direction = useRecoilValue(atoms.northDirection);
    const [lat, setLat] = useState(46.41)
    const [lon, setLon] = useState(10.01)
    const [divContainer, setDivContainer] = useState<HTMLDivElement | null>(null);
  
    const divRef = useCallback(
      (node: React.SetStateAction<HTMLDivElement | null>) => {
        node && setDivContainer(node);
      },
      []
    );

    const position = { lat: lat, lng: lon };
    const pov = { heading: direction ?? 0, pitch: 5 };


    const panorama = useStreetViewPanorama({
      divElement: divContainer,
      position,
      pov
    });

    useEffect(() => {
        const intervalID = setInterval(() =>  {
            try {
                const hash = actions?.getControlsStateHash && actions.getControlsStateHash();
                if (hash) {
                    const components = hash.split(',');
                    const _lat = +components[0] || 0;
                    const _lon = +components[1] || 0;

                    if (_lat && _lon) {
                        setLat(_lat)
                        setLon(_lon)
                        panorama.setPosition({ lat: lat, lng: lon })
                        panorama.setPov({ heading: direction ?? 0, pitch: 5 })
                    }
                }
            } catch {
                // do nothing
            }
        }, 3000);
    
        return () => clearInterval(intervalID);
    }, []);
    
    return <div className="absolute left-8 top-8 overflow-hidden w-[16vw] h-[16vh] rounded-md">
        <div className="w-full h-full" ref={divRef} />
    </div>
};