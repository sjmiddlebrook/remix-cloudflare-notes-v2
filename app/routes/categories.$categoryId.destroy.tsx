import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import invariant from 'tiny-invariant';
import { type Env, deleteCategory } from '~/kv-notes';
import { getSession } from '~/sessions';

export async function action({ params, context, request }: ActionFunctionArgs) {
  const categoryId = params.categoryId;
  invariant(categoryId, 'Missing categoryId param');
  const env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  await deleteCategory({ userId, categoryId, env });
  return redirect('/categories');
}
