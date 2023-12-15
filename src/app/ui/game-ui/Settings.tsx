import React, { useContext, useEffect, useState } from "react";
import { ActionsContext, AtomsContext } from "../UI";
import { useQuery } from "@tanstack/react-query";
import {
  Armchair,
  Banknote,
  Bike,
  Bot,
  BusFront,
  Coffee,
  GraduationCap,
  HelpCircle,
  Landmark,
  Loader2,
  LucideIcon,
  Mail,
  Martini,
  Pizza,
  School,
  UtensilsCrossed,
} from "lucide-react";
import { FaToilet } from "react-icons/fa";
import OpenAI from "openai";
import { useAtom } from "jotai";
import { gmapsAtom, openaiAtom } from "./keys";

type ISettings = {
  open: boolean;
  setOpen: (e: boolean) => void;
};

const prettifyTag: (str: string) => string = (str) => {
  let temp = str.split("_");
  temp[0] = (temp[0].charAt(0) ?? "").toUpperCase() + temp[0].slice(1);
  return temp.join(" ");
};

export const Settings: React.FC<ISettings> = ({ open, setOpen }) => {
  const [openai, setOpenAI] = useAtom(openaiAtom);
  const [gmaps, setGMaps] = useAtom(gmapsAtom);

  if (open) {
    return (
      <div
        className="fixed inset-12 grid grid-cols-12 gap-2"
        style={{ zIndex: 9999 }}
      >
        <div className="col-span-12 relative rounded-md backdrop-blur-md bg-black/25 p-2 flex flex-col gap-2 overflow-y-hidden">
          <span className="text-white text-xl text-center p-2">
            Settings
          </span>
          <div className="p-2 flex flex-col gap-2">
            <div className="flex flex-row gap-2">
                <span className="text-white w-full">OpenAI Key</span>
                <input value={openai} className="p-1 w-full rounded-md" placeholder="Set OpenAI API key" onChange={(e) => setOpenAI(e.target.value)}></input>
            </div>
            <div className="flex flex-row gap-2">
                <span className="text-white w-full">Google Maps Key</span>
                <input value={gmaps} className="p-1 w-full rounded-md" placeholder="Set Google Maps API key" onChange={(e) => setGMaps(e.target.value)}></input>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <></>;
};
