import {
  type ActionFunctionArgs,
  json,
  redirect,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import NotePreview from '~/components/NotePreview';
import { getCategory, type Env, createEmptyNote } from '~/kv-notes';
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

export default function CategoriesHome() {
  const { category } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="py-4">
        <Form method="POST">
          <button className="rounded-md bg-blue-600 px-3.5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Add note
          </button>
        </Form>
      </div>
      <h2 className="py-4 text-xl font-semibold leading-tight tracking-tight text-gray-900">
        Notes
      </h2>
      <div className="max-w-lg">
        <ul className="divide-y divide-gray-100">
          {category.notes.map((note) => (
            <NotePreview key={note.id} categoryId={category.id} note={note} />
          ))}
        </ul>
      </div>
    </>
  );
}
