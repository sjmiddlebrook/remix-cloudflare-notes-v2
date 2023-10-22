import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import invariant from 'tiny-invariant';
import { type Env, deleteNote } from '~/kv-notes';
import { getSession } from '~/sessions';

export async function action({ params, context, request }: ActionFunctionArgs) {
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
  await deleteNote({ userId, noteId, env });
  return redirect(`/categories/${categoryId}`);
}
