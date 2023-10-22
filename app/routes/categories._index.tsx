import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import CategoryPreview from '~/components/CategoryPreview';
import { getNotesForUser, createEmptyCategory, type Env } from '~/kv-notes';
import { getSession } from '~/sessions';

export async function loader({ context, request }: LoaderFunctionArgs) {
  let env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  const data = await getNotesForUser({ userId, env });

  return json(data);
}

export async function action({ context, request }: ActionFunctionArgs) {
  const env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  const category = await createEmptyCategory({ userId, env });
  if (!category) {
    throw new Response('Error creating category', { status: 404 });
  }
  return redirect(`/categories/${category.id}/edit`);
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
        Categories
      </h1>
      <div className="py-4">
        <Form method="POST">
          <button className="rounded-md bg-blue-600 px-3.5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Add category
          </button>
        </Form>
      </div>
      <div className="max-w-lg">
        <ul className="divide-y divide-gray-100">
          {categories.map((category) => (
            <CategoryPreview key={category.id} category={category} />
          ))}
        </ul>
      </div>
    </>
  );
}
