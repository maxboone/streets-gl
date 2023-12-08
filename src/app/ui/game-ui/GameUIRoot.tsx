import React, { useContext, useEffect, useState } from "react";
import { SearchLocation } from "./SearchLocation";
import { MiniMap } from "./MiniMap";
import KeyBindings from "./KeyBindings";
import { LocationInfo } from "./LocationInfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ActionsContext } from "../UI";
import { useAtom } from "jotai";
import { markersAtom } from "./markers";

export const queryClient = new QueryClient();

export const GameUIRoot: React.FC = () => {
    const [search, setSearch] = useState(false);
    const [info, setInfo] = useState(false);
    const actions = useContext(ActionsContext);
    const [_, setMarkers] = useAtom(markersAtom);

    const mark: () => void = async () => {
        try {
            const hash = actions?.getControlsStateHash && actions.getControlsStateHash();
            if (hash) {
                const components = hash.split(',');
                let _lat = (+components[0]).toFixed(4);
                let _lon = (+components[1]).toFixed(4);

                const urlParams = new URLSearchParams({
                    format: 'json',
                    addressdetails: '1',
                    lat: _lat,
                    lon: _lon
                });
                
                const res = await (await fetch("https://nominatim.openstreetmap.org/reverse?" + urlParams.toString()))?.json()
                if (res.lat && res.lon) {
                    _lat = (+res.lat).toFixed(4);
                    _lon = (+res.lon).toFixed(4);
                }

                setMarkers((e) => {
                    if (e[`${_lat}:${_lon}`]) {
                        e[`${_lat}:${_lon}`] = undefined;
                        return {...e}
                    }

                    e[`${_lat}:${_lon}`] = {
                        name: res.name,
                        id: res.place_id,
                        latitude: _lat,
                        longitude: _lon,
                    }

                    return e;
                })
            }
        } catch {
        }

    }

    useEffect(() => {
        const handleKeyUp: (e: KeyboardEvent) => void = (e) => {
            e.preventDefault();
            console.log(e.key);
            if (e.key == 'p') {
                setSearch(true);
                setInfo(false);
            }
            if (e.key == 'k') {
                setSearch(false);
                setInfo(true);
            }
            if (e.key == 'm') {
                if (!search && !info) {
                    mark();
                }
            }
            if (e.key == 'Escape') {
                setSearch(false);
                setInfo(false);
            }
        }
        
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        }
    })

    return <QueryClientProvider client={queryClient}>
        <>
        { search && <SearchLocation open={search} setOpen={setSearch} /> }
        { info && <LocationInfo open={info} setOpen={setInfo} /> }
        <KeyBindings />
        <MiniMap/>
        </>
    </QueryClientProvider>
}