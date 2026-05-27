const QUEUE_KEY = 'offline_queue';

export interface QueuedAction {
  id: string;
  type: 'favorito_add' | 'favorito_remove' | 'mensagem';
  payload: Record<string, unknown>;
  timestamp: number;
}

function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch {}
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
  const queue = getQueue();
  queue.push({
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function dequeueAll(): QueuedAction[] {
  const queue = getQueue();
  saveQueue([]);
  return queue;
}

export function peekQueue(): QueuedAction[] {
  return getQueue();
}

export function hasQueued(): boolean {
  return getQueue().length > 0;
}
