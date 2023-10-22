export interface Env {
  NOTES_KV: KVNamespace;
}

export type NoteItem = {
  id: string;
  title: string;
  body: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  notes: NoteItem[];
};

type NotesData = {
  categories: CategoryItem[];
};

function getUserKVKey(userId: string) {
  return `notes-${userId}`;
}

export async function getNotesForUser({
  userId,
  env,
}: {
  userId: string | undefined;
  env: Env;
}) {
  const emptyNotes: NotesData = {
    categories: [],
  };
  if (!userId) return emptyNotes;
  const key = getUserKVKey(userId);
  const notes = await env.NOTES_KV.get<NotesData>(key, {
    type: 'json',
  });
  return notes || emptyNotes;
}

export async function getCategory({
  userId,
  categoryId,
  env,
}: {
  userId: string | undefined;
  categoryId: string;
  env: Env;
}) {
  if (!userId) return;
  const notes = await getNotesForUser({ userId, env });
  return notes.categories.find((c) => c.id === categoryId);
}

export async function createEmptyCategory({
  userId,
  env,
}: {
  userId: string | undefined;
  env: Env;
}) {
  if (!userId) return;
  const category = {
    id: crypto.randomUUID(),
    name: '',
    notes: [],
  };
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  notes.categories.push(category);
  await env.NOTES_KV.put(key, JSON.stringify(notes));
  return category;
}

export async function addCategory({
  userId,
  name,
  env,
}: {
  userId: string;
  name: string;
  env: Env;
}) {
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  const newCategory: CategoryItem = {
    id: crypto.randomUUID(),
    name,
    notes: [],
  };
  notes.categories.push(newCategory);
  await env.NOTES_KV.put(key, JSON.stringify(notes));
  return newCategory;
}

export async function getNote({
  userId,
  noteId,
  env,
}: {
  userId: string | undefined;
  noteId: string;
  env: Env;
}) {
  if (!userId) return;
  const notes = await getNotesForUser({ userId, env });
  for (const category of notes.categories) {
    const note = category.notes.find((n) => n.id === noteId);
    if (note) return note;
  }
  throw new Error('Note not found');
}

export async function createEmptyNote({
  userId,
  categoryId,
  env,
}: {
  userId: string | undefined;
  categoryId: string;
  env: Env;
}) {
  if (!userId) return;
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  const category = notes.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error('Category not found');
  const newNote = {
    id: crypto.randomUUID(),
    title: '',
    body: '',
  };
  category.notes.push(newNote);
  await env.NOTES_KV.put(key, JSON.stringify(notes));
  return newNote;
}

export async function addNote({
  userId,
  categoryId,
  title,
  body,
  env,
}: {
  userId: string;
  categoryId: string;
  title: string;
  body: string;
  env: Env;
}) {
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  const category = notes.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error('Category not found');
  const newNote = {
    id: crypto.randomUUID(),
    title,
    body,
  };
  category.notes.push(newNote);
  await env.NOTES_KV.put(key, JSON.stringify(notes));
  return newNote;
}

export async function deleteNote({
  userId,
  noteId,
  env,
}: {
  userId: string | undefined;
  noteId: string;
  env: Env;
}) {
  if (!userId) return;
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  for (const category of notes.categories) {
    const noteIndex = category.notes.findIndex((n) => n.id === noteId);
    if (noteIndex !== -1) {
      category.notes.splice(noteIndex, 1);
      await env.NOTES_KV.put(key, JSON.stringify(notes));
      return;
    }
  }
}

export async function deleteCategory({
  userId,
  categoryId,
  env,
}: {
  userId: string | undefined;
  categoryId: string;
  env: Env;
}) {
  if (!userId) return;
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  const categoryIndex = notes.categories.findIndex((c) => c.id === categoryId);
  if (categoryIndex === -1) throw new Error('Category not found');
  notes.categories.splice(categoryIndex, 1);
  await env.NOTES_KV.put(key, JSON.stringify(notes));
}

export async function updateNote({
  userId,
  categoryId,
  noteId,
  title,
  body,
  env,
}: {
  userId: string | undefined;
  categoryId: string;
  noteId: string;
  title: string;
  body: string;
  env: Env;
}) {
  if (!userId) return;
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  const category = notes.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error('Category not found');
  const note = category.notes.find((n) => n.id === noteId);
  if (!note) throw new Error('Note not found');
  note.title = title;
  note.body = body;
  await env.NOTES_KV.put(key, JSON.stringify(notes));
}

export async function updateCategory({
  userId,
  categoryId,
  name,
  env,
}: {
  userId: string | undefined;
  categoryId: string;
  name: string;
  env: Env;
}) {
  if (!userId) return;
  const key = getUserKVKey(userId);
  const notes = await getNotesForUser({ userId, env });
  const category = notes.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error('Category not found');
  category.name = name;
  await env.NOTES_KV.put(key, JSON.stringify(notes));
}
