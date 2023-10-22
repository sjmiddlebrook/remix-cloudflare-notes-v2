import {
  type ActionFunctionArgs,
  json,
  redirect,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { getNote, type Env, createEmptyNote } from '~/kv-notes';
import { getSession } from '~/sessions';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const categoryId = params.categoryId;
  const noteId = params.noteId;
  invariant(categoryId, 'Missing categoryId param');
  invariant(noteId, 'Missing noteId param');
  const env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  const note = await getNote({ userId, noteId, env });
  if (!note) {
    throw new Response('Not found', { status: 404 });
  }
  return json({ note });
}

export async function action({ params, context, request }: ActionFunctionArgs) {
  const categoryId = params.categoryId;
  invariant(categoryId, 'Missing categoryId param');
  const env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  const note = await createEmptyNote({ userId, categoryId, env });
  if (!note) {
    throw new Response('Error creating note', { status: 404 });
  }
  return redirect(`/categories/${categoryId}/notes/${note.id}/edit`);
}

export default function Categories() {
  const { note } = useLoaderData<typeof loader>();
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
        {note.title}
      </h2>
      <div className='py-4'>
        <p>{note.body}</p>
      </div>
    </div>
  );
}
