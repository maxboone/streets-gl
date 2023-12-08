import React, { useContext, useEffect, useState } from 'react'
import { ActionsContext, AtomsContext } from '../UI';
import { useQuery } from '@tanstack/react-query';
import { Armchair, Banknote, Bike, Bot, BusFront, Coffee, GraduationCap, HelpCircle, Landmark, Loader2, LucideIcon, Mail, Martini, Pizza, School, UtensilsCrossed } from 'lucide-react';
import { FaToilet } from 'react-icons/fa';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true,
});

type ILocationInfo = {
    open: boolean;
    setOpen: (e: boolean) => void;
}

const AmenityLogo: React.FC<{tags: any}> = ({tags}) => {
    const size = 32;

    if (tags?.public_transport) {
        return <BusFront size={size}/>
    }

    if (tags?.amenity == "restaurant") {
        return <UtensilsCrossed size={size}/>
    }

    if (tags?.amenity == "fast_food") {
        return <Pizza size={size}/>
    }
    
    if (tags?.amenity == "bench") {
        return <Armchair size={size}/>
    }

    if (tags?.amenity == "cafe") {
        return <Coffee size={size}/>
    }

    if (tags?.amenity == "bar") {
        return <Martini size={size}/>
    }

    if (`${tags?.amenity}`.includes("school")) {
        return <School size={size}/>
    }

    if (tags?.amenity == "university") {
        return <GraduationCap size={size}/>
    }

    if (tags?.amenity == "bank" || tags?.amenity == "atm" ) {
        return <Banknote size={size}/>
    }

    if (`${tags?.amenity}`.includes("post")) {
        return <Mail size={size}/>
    }

    if (tags?.amenity == "toilet") {
        return <FaToilet size={size}/>
    }

    if (tags?.historic) {
        return <Landmark size={size}/>
    }

    useEffect(() => {
        console.log(`Unknown Amenity: ${JSON.stringify(tags)}`)
    })

    return <HelpCircle size={size}/>
}


const prettifyTag: (str: string) => string = (str) => {
    let temp = str.split('_');
    temp[0] = (temp[0].charAt(0) ?? '').toUpperCase() + temp[0].slice(1);
    return temp.join(' ');
}

export const LocationInfo: React.FC<ILocationInfo> = ({
    open,
    setOpen
}) => {
	const atoms = useContext(AtomsContext);
	const actions = useContext(ActionsContext);
    const [
        [lat, lon], 
        setLocation
    ] = useState([0, 0]);

    const [item, setItem] = useState<any>()

    useEffect(() => {
        try {
            const hash = actions?.getControlsStateHash && actions.getControlsStateHash();
            if (hash) {
                const components = hash.split(',');
                const _lat = +components[0];
                const _lon = +components[1];
                setLocation([_lat, _lon]);
            }
        } catch {
        }
    }, [])

    const overpass = useQuery({
        enabled: !!lat && !!lon,
        queryKey: ['reverse', `${lat.toFixed(4)}`, `${lon.toFixed(4)}`],
        queryFn: async () => {
            const fromLat = (lat - 0.001).toFixed(4);
            const fromLon = (lon - 0.001).toFixed(4);
            const toLat = (lat + 0.001).toFixed(4);
            const toLon = (lon + 0.001).toFixed(4);
            const bbox = `${fromLat},${fromLon},${toLat},${toLon}`

            return (await fetch(
                "https://overpass-api.de/api/interpreter",
                {
                    method: "POST",
                    body: "data="+ encodeURIComponent(`
                        [out:json];
                        (
                            node["tourism"](${bbox});
                            node["historic"](${bbox});
                            node["amenity"](${bbox});
                            node["public_transport"](${bbox});
                        );
                        out;
                    `)
                },
            )).json();
        }
    })

    const bot_ai = useQuery({
        enabled: !!(overpass.data?.elements ?? []).length,
        queryKey: ['bot_ai', `${lat.toFixed(4)}`, `${lon.toFixed(4)}`],
        queryFn: async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                    "role": "user",
                    "content": `
                    You are a travel agent, a customer is inquiring about what to do close to their current location. 
                    You have the following data:
                    ${JSON.stringify((overpass.data?.elements ?? []).filter((e: any) => !!e.tags?.name))}
                    What do you recommend the client to do at this location?
                    Address the client informally, you are replying to their inquiry.
                    `},
                ],
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });

            return response;
        }
    })

    if (open) {
        return (
            <div className="fixed inset-12 grid grid-cols-12 gap-2" style={{ zIndex: 9999 }}>
                {overpass.isLoading && <>
                    <div className="flex flex-col col-span-3 gap-2 backdrop-blur-md bg-black/25 text-white rounded-md p-4 items-center justify-center">
                        <Loader2 className="animate-spin"/>
                        <span>Fetching info from OSM Overpass API</span>
                    </div>
                </>}
                {overpass.isSuccess && <>
                    <>
                        <div className="col-span-3 relative rounded-md backdrop-blur-md bg-black/25 p-2 flex flex-col gap-2 overflow-y-hidden">
                            <span className="text-white text-xl text-center p-2">Nearby Results</span>
                            {!overpass.data.elements && <span className="text-gray-800">No points of interest found.</span>}
                            <div className="flex flex-col p-1 gap-1 overflow-y-auto h-full text-white">
                                {overpass.data.elements.filter(
                                    ({tags} : any ) => !!tags.name && !(tags?.amenity ?? '').includes('parking')
                                ).map(({tags}: any) => <div onClick={(): void => setItem(tags)} className="p-3 cursor-pointer rounded-md hover:from-stone-800 hover:to-stone-700 bg-gradient-to-t from-stone-900 to-stone-800 text-white flex flex-row items-center justify-between gap-2">
                                    <AmenityLogo tags={tags}/>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-lg">{tags?.name ?? "Unnamed"}</span>
                                        <span className="text-sm">{prettifyTag(tags?.amenity ?? tags?.historic ?? tags?.tourism ?? tags?.public_transport ?? "")}</span>
                                    </div>
                                </div>)}
                            </div>
                        </div>
                        <div className="col-span-6 relative rounded-md backdrop-blur-md items-center justify-center flex flex-col gap-2 p-2 overflow-y-hidden bg-black/25">
                            { item ?  <>
                                
                                    <table className="min-w-full text-white border border-gray-300">
                                        <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">Key</th>
                                            <th className="py-2 px-4 border-b">Value</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Object.entries((item ?? {})).map(([key, value]) => (
                                            <tr key={`${key}`}>
                                                <td className="py-2 px-4 border-b">{`${key}`}</td>
                                                <td className="py-2 px-4 border-b">{`${value}`}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                            </> : <span className="text-white text-lg">Select a search result...</span>}
                        </div>
                        <div className="col-span-3 relative rounded-md backdrop-blur-md items-center flex flex-col gap-2 p-2 overflow-y-hidden bg-black/25">
                            <span className="text-white text-xl text-center flex flex-row items-center justify-center p-2 w-full"><Bot size={32}/></span>
                            {bot_ai.isLoading && <Loader2 className="animate-spin"/>}
                            {bot_ai.isError && <span className="text-red text-sm text-justify w-full p-2">
                                {`${JSON.stringify(bot_ai.error)}`}
                            </span>}
                            {bot_ai.isSuccess && <span className="text-white text-sm text-justify w-full p-2 overflow-y-auto">
                                {bot_ai.data.choices.map((e) => e.message.content)}
                            </span>}
                        </div>
                    </>
                </>}
            </div>
        );
    }

    return <></>;
};