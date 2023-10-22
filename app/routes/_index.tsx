import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import CategoryPreview from '~/components/CategoryPreview';
import NotePreview from '~/components/NotePreview';
import { getNotesForUser, type Env } from '~/kv-notes';
import { getSession } from '~/sessions';

export async function loader({ context, request }: LoaderFunctionArgs) {
  let env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  const data = await getNotesForUser({ userId, env });

  return json(data);
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>();
  return (
    <>
      <div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
          Categories
        </h2>
        <div className="max-w-lg">
          <ul className="divide-y divide-gray-100">
            {categories.map((category) => (
              <CategoryPreview key={category.id} category={category} />
            ))}
          </ul>
        </div>
      </div>
      <div className="py-4">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
          Notes
        </h2>
        <div className="max-w-lg">
          <ul className="divide-y divide-gray-100">
            {categories.map((category) => {
              return category.notes.map((note) => (
                <NotePreview
                  key={note.id}
                  categoryId={category.id}
                  note={note}
                />
              ));
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
