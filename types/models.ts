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
};

export type PickStateData = {
  groups: Group[];
  tasks: Task[];
};
