export interface Run {
  id: string;
  name: string;
  agent: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  // Add more fields as needed
}

export interface Event {
  id: string;
  timestamp: string;
  type: string;
  data: any;
}

export interface FileChange {
  path: string;
  changeType: 'created' | 'modified' | 'deleted';
  content?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
}
