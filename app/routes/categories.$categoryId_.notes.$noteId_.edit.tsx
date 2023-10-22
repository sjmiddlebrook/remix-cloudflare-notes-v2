import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { getNote, type Env, updateNote, deleteNote } from '~/kv-notes';
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

export const action = async ({
  params,
  context,
  request,
}: ActionFunctionArgs) => {
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
  const formData = await request.formData();
  const action = formData.get('action');
  if (action === 'cancel') {
    await deleteNote({ userId, noteId, env });
    return redirect(`/categories/${categoryId}`);
  }
  const title = formData.get('title');
  const body = formData.get('body');
  invariant(typeof title === 'string', 'Missing title param');
  invariant(typeof body === 'string', 'Missing body param');
  await updateNote({ userId, categoryId, noteId, title, body, env });
  return redirect(`/categories/${categoryId}`);
};

export default function Categories() {
  const navigate = useNavigate();
  const { note } = useLoaderData<typeof loader>();
  const isNew = note.title === '';
  return (
    <Form method="post">
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
        Note
      </h1>
      <div className="max-w-xl space-y-4 py-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Note Title
          </label>
          <div className="mt-2">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
              <input
                className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                defaultValue={note.title}
                aria-label="Note Title"
                name="title"
                type="text"
                placeholder="Note Title"
              />
            </div>
          </div>
        </div>
        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Body
          </label>
          <textarea
            defaultValue={note.body}
            rows={3}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            aria-label="Note Body"
            name="body"
            placeholder="Note ..."
          />
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          {isNew ? (
            <button
              type="submit"
              name="action"
              value="cancel"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              onClick={() => {
                // go back to the previous page
                navigate(-1);
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            name="action"
            value="save"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}
