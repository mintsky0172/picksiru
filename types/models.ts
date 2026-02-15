import { EnergyTag, MoodTag, TimeTag } from "@/lib/pick/pro";

export type Group = {
  id: string;
  name: string;
  createdAt: number;
};

export type Task = {
  id: string;
  groupId: string;
  name: string;
  createdAt: number;

  timeTags?: TimeTag[];
  energyTags?: EnergyTag[];
  moodTags?: MoodTag[];
};

export type PickStateData = {
  groups: Group[];
  tasks: Task[];
};
