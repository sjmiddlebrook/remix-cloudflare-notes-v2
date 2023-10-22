import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';
import invariant from 'tiny-invariant';
import {
  getCategory,
  type Env,
  updateCategory,
  deleteCategory,
} from '~/kv-notes';
import { getSession } from '~/sessions';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const categoryId = params.categoryId;
  invariant(categoryId, 'Missing categoryId param');
  let env = context.env as Env;
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

export const action = async ({
  params,
  context,
  request,
}: ActionFunctionArgs) => {
  const categoryId = params.categoryId;
  invariant(categoryId, 'Missing categoryId param');
  const env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const userId = session.get('userId');
  const formData = await request.formData();
  const action = formData.get('action');
  if (action === 'cancel') {
    await deleteCategory({ userId, categoryId, env });
    return redirect('/categories');
  }
  const name = formData.get('name');
  invariant(typeof name === 'string', 'Missing name param');
  await updateCategory({ userId, categoryId, name, env });
  return redirect(`/categories/${categoryId}`);
};

export default function Categories() {
  const navigate = useNavigate();
  const { category } = useLoaderData<typeof loader>();
  const isNew = category.name === '';

  return (
    <Form method="post">
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
        Category
      </h1>
      <div className="max-w-xl py-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Category Name
        </label>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
            <input
              defaultValue={category.name}
              type="text"
              name="name"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder={'Category Name'}
            />
          </div>
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
