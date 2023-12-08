import React, { useContext, useEffect, useState } from 'react'
import { ActionsContext, AtomsContext } from '../UI';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

type ISearchLocation = {
    open: boolean;
    setOpen: (e: boolean) => void;
}

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
  }
  
  
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const fetchResults = async (query: string) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data: SearchResult[] = await response.json();
    return data;
  };
  

export const SearchLocation: React.FC<ISearchLocation> = ({
    open,
    setOpen
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { data, isLoading, isError } = useQuery<SearchResult[], Error>({
        queryKey: ['nominatim', searchQuery],
        queryFn: async () => await fetchResults(searchQuery),
        enabled: !!searchQuery
    });
	const actions = useContext(ActionsContext);

    if (open) {
        return (
            <div className="fixed inset-12 flex items-center justify-center" style={{zIndex: 9999}}>
                <div className="flex flex-col p-4 gap-2 w-full h-full bg-black/25 backdrop-blur-md text-white items-center rounded-md">
                    <h2>Search Results</h2>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Enter your search query"
                        value={searchQuery}
                        className="text-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 block text-black bg-white w-full sm:text-sm border-gray-300 rounded-md"
                        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isLoading && <Loader2 className="text-white animate-spin"/>}
                    {data && (
                        <div className="w-full flex flex-col gap-1 p-1">
                            {data.slice(0, 5).map((result) => (
                                <button className="rounded-md p-2 bg-gradient-to-t from-black to-stone-900 text-white hover:from-stone-800" onClick={(): void => {
                                    actions.goToState(+result.lat, +result.lon, 0, 0, 1);
                                }}key={result.place_id}>{result.display_name}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return <></>;
};