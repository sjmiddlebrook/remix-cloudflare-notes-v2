import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import type { NoteItem } from '~/kv-notes';
import { Form, Link } from '@remix-run/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NotePreview({
  note,
  categoryId,
}: {
  categoryId: string;
  note: NoteItem;
}) {
  return (
    <li className="flex items-center justify-between gap-x-6 py-5">
      <div className="min-w-0">
        <div className="flex items-start gap-x-3">
          <p className="font-semibold leading-6 text-gray-900">{note.title}</p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-x-4">
        <Link
          to={`/categories/${categoryId}/notes/${note.id}`}
          className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
        >
          View note<span className="sr-only">, {note.title}</span>
        </Link>
        <Menu as="div" className="relative flex-none">
          <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
            <span className="sr-only">Open options</span>
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={`/categories/${categoryId}/notes/${note.id}/edit`}
                    className={classNames(
                      active ? 'bg-gray-50' : '',
                      'block px-3 py-1 text-sm leading-6 text-gray-900',
                    )}
                  >
                    Edit<span className="sr-only">, {note.title}</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Form
                    action={`/categories/${categoryId}/notes/${note.id}/destroy`}
                    method="POST"
                    onSubmit={(event) => {
                      const response = confirm(
                        'Please confirm you want to delete this record.',
                      );
                      if (!response) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <button
                      className={classNames(
                        active ? 'bg-gray-50' : '',
                        'w-full text-start px-3 py-1 text-sm leading-6 text-gray-900',
                      )}
                    >
                      Delete<span className="sr-only">, {note.title}</span>
                    </button>
                  </Form>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </li>
  );
}
