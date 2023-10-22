import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  type LinksFunction,
} from '@remix-run/cloudflare';
import { cssBundleHref } from '@remix-run/css-bundle';
import { Fragment, useState } from 'react';
import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  DocumentDuplicateIcon,
  HomeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { commitSession, getSession } from '~/sessions';
import tailwindStyles from './tailwind.css';
import { type Env, getNotesForUser } from './kv-notes';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Notes Demo v2' },
    {
      name: 'description',
      content: 'Notes app build with Remix and Cloudflare',
    },
  ];
};

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  {
    name: 'Categories',
    href: '/categories',
    icon: DocumentDuplicateIcon,
  },
];

export async function loader({ context, request }: LoaderFunctionArgs) {
  let env = context.env as Env;
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('userId')) {
    const newUserId = crypto.randomUUID();
    session.set('userId', newUserId);
  }
  const userId = session.get('userId');
  const data = await getNotesForUser({ userId, env });

  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export default function App() {
  const { categories } = useLoaderData<typeof loader>();
  const categoryNotes = categories.flatMap((category) => {
    return category.notes.map((note) => {
      return {
        ...note,
        categoryName: category.name,
        categoryId: category.id,
      };
    });
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en" className="h-full bg-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-600 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center space-x-4">
                      <div className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#FFFFFF"
                          viewBox="0 0 128 128"
                        >
                          <rect width="128" height="128" rx="10" />
                        </svg>
                      </div>
                      <span className="text-base font-semibold text-white">
                        Remix Notes
                      </span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.href}>
                                <NavLink
                                  end
                                  to={item.href}
                                  className={({ isActive, isPending }) => {
                                    return classNames(
                                      isActive
                                        ? 'bg-blue-700 text-white'
                                        : 'text-blue-200 hover:bg-blue-700 hover:text-white',
                                      isPending ? 'opacity-75' : '',
                                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                                    );
                                  }}
                                >
                                  {({ isActive, isPending }) => (
                                    <>
                                      <item.icon
                                        className={classNames(
                                          isActive
                                            ? 'text-white'
                                            : 'text-blue-200 group-hover:text-white',
                                          'h-6 w-6 shrink-0',
                                        )}
                                        aria-hidden="true"
                                      />
                                      <span>{item.name}</span>
                                    </>
                                  )}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-blue-200">
                            Your categories
                          </div>
                          <ul className="-mx-2 mt-2 space-y-1">
                            {categories.map((category) => (
                              <li key={category.id}>
                                <NavLink
                                  to={`/categories/${category.id}`}
                                  className={({ isActive, isPending }) => {
                                    return classNames(
                                      isActive
                                        ? 'bg-blue-700 text-white'
                                        : 'text-blue-200 hover:bg-blue-700 hover:text-white',
                                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                                    );
                                  }}
                                >
                                  <span className="truncate">
                                    {category.name}
                                  </span>
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-blue-200">
                            Your notes
                          </div>
                          <ul className="-mx-2 mt-2 space-y-1">
                            {categoryNotes.map((note) => (
                              <li key={note.id}>
                                <NavLink
                                  to={`/categories/${note.categoryId}/notes/${note.id}`}
                                  className={({ isActive, isPending }) => {
                                    return classNames(
                                      isActive
                                        ? 'bg-blue-700 text-white'
                                        : 'text-blue-200 hover:bg-blue-700 hover:text-white',
                                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                                    );
                                  }}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-blue-400 bg-blue-500 text-[0.625rem] font-medium text-white">
                                    {note.categoryName
                                      .split(' ')
                                      .map((word) => {
                                        return word[0];
                                      })
                                      .join('')
                                      .toUpperCase()}
                                  </span>
                                  <span className="truncate">{note.title}</span>
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-600 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center space-x-4">
              <div className="h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#FFFFFF"
                  viewBox="0 0 128 128"
                >
                  <rect width="128" height="128" rx="10" />
                </svg>
              </div>
              <span className="text-base font-semibold text-white">
                Remix Notes
              </span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.href}>
                        <NavLink
                          end
                          to={item.href}
                          className={({ isActive, isPending }) => {
                            return classNames(
                              isActive
                                ? 'bg-blue-700 text-white'
                                : 'text-blue-200 hover:bg-blue-700 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            );
                          }}
                        >
                          {({ isActive, isPending }) => (
                            <>
                              <item.icon
                                className={classNames(
                                  isActive
                                    ? 'text-white'
                                    : 'text-blue-200 group-hover:text-white',
                                  'h-6 w-6 shrink-0',
                                )}
                                aria-hidden="true"
                              />
                              <span>{item.name}</span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-blue-200">
                    Your categories
                  </div>
                  <ul className="-mx-2 mt-2 space-y-1">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <NavLink
                          to={`/categories/${category.id}`}
                          className={({ isActive, isPending }) => {
                            return classNames(
                              isActive
                                ? 'bg-blue-700 text-white'
                                : 'text-blue-200 hover:bg-blue-700 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            );
                          }}
                        >
                          <span className="truncate">{category.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-blue-200">
                    Your notes
                  </div>
                  <ul className="-mx-2 mt-2 space-y-1">
                    {categoryNotes.map((note) => (
                      <li key={note.id}>
                        <NavLink
                          to={`/categories/${note.categoryId}/notes/${note.id}`}
                          className={({ isActive, isPending }) => {
                            return classNames(
                              isActive
                                ? 'bg-blue-700 text-white'
                                : 'text-blue-200 hover:bg-blue-700 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            );
                          }}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-blue-400 bg-blue-500 text-[0.625rem] font-medium text-white">
                            {note.categoryName
                              .split(' ')
                              .map((word) => {
                                return word[0];
                              })
                              .join('')
                              .toUpperCase()}
                          </span>
                          <span className="truncate">{note.title}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold text-gray-900">
              Remix Notes
            </span>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
