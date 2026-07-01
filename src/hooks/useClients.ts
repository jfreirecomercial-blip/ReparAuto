'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  subscribeClients,
  createClient,
  createClientsBatch,
  updateClient,
  deleteClient,
} from '@/lib/db';
import type { Client, ClientInput } from '@/types/client';

export default function useClients(ownerUid: string | null | undefined) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerUid) {
      setClients([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeClients(
      ownerUid,
      (list) => {
        setClients(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [ownerUid]);

  const add = useCallback(
    async (data: ClientInput): Promise<string> => {
      if (!ownerUid) throw new Error('Sem sessão');
      return createClient(ownerUid, data);
    },
    [ownerUid],
  );

  const importBatch = useCallback(
    async (list: ClientInput[]): Promise<number> => {
      if (!ownerUid) throw new Error('Sem sessão');
      return createClientsBatch(ownerUid, list);
    },
    [ownerUid],
  );

  const update = useCallback(async (id: string, data: Partial<Client>): Promise<void> => {
    await updateClient(id, data);
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteClient(id);
  }, []);

  return useMemo(
    () => ({ clients, loading, add, importBatch, update, remove }),
    [clients, loading, add, importBatch, update, remove],
  );
}
