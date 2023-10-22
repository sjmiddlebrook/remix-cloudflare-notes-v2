import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { getCategory, type Env } from '~/kv-notes';
import { getSession } from '~/sessions';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const categoryId = params.categoryId;
  invariant(categoryId, 'Missing categoryId param');
  const env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  const category = await getCategory({ userId, categoryId, env });
  if (!category) {
    throw new Response('Not found', { status: 404 });
  }
  return json({ category });
}

export default function Categories() {
  const { category } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
        {category.name}
      </h1>
      <Outlet />
    </div>
  );
}
