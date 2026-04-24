import { useState, useEffect, useCallback } from 'react';
import { ProjectDocument } from '../types';

const DB_NAME = 'giornale-cantiere-docs';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(): Promise<(ProjectDocument & { projectId: string })[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result ?? []) as (ProjectDocument & { projectId: string })[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function idbPut(docs: (ProjectDocument & { projectId: string })[]): Promise<void> {
  if (!docs.length) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      docs.forEach((d) => store.put(d));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // silent — data will be stale but app won't crash
  }
}

async function idbDelete(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // silent
  }
}

export function useDocumentStorage() {
  const [allDocs, setAllDocs] = useState<Record<string, ProjectDocument[]>>({});

  useEffect(() => {
    idbGetAll().then((docs) => {
      const grouped: Record<string, ProjectDocument[]> = {};
      docs.forEach((d) => {
        if (!d.projectId) return;
        if (!grouped[d.projectId]) grouped[d.projectId] = [];
        grouped[d.projectId].push(d);
      });
      setAllDocs(grouped);
    });
  }, []);

  const getProjectDocs = useCallback(
    (projectId: string): ProjectDocument[] => allDocs[projectId] ?? [],
    [allDocs]
  );

  const setProjectDocs = useCallback(
    (projectId: string, updated: ProjectDocument[]) => {
      const prev = allDocs[projectId] ?? [];
      const updatedIds = new Set(updated.map((d) => d.id));
      const removedIds = prev.filter((d) => !updatedIds.has(d.id)).map((d) => d.id);
      const withProject = updated.map((d) => ({ ...d, projectId })) as (ProjectDocument & { projectId: string })[];

      idbPut(withProject);
      idbDelete(removedIds);

      setAllDocs((s) => ({ ...s, [projectId]: updated }));
    },
    [allDocs]
  );

  const deleteProjectDocs = useCallback(
    (projectId: string) => {
      const ids = (allDocs[projectId] ?? []).map((d) => d.id);
      idbDelete(ids);
      setAllDocs((s) => {
        const next = { ...s };
        delete next[projectId];
        return next;
      });
    },
    [allDocs]
  );

  return { getProjectDocs, setProjectDocs, deleteProjectDocs };
}
