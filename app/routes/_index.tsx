import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes Demo v2" },
    { name: "description", content: "Notes app build with Remix and Cloudflare" },
  ];
};

export default function Index() {
  return (
    <div>
      <h1>Notes App</h1>
      <p>
        This is a demo app built with <a href="https://remix.run">Remix</a> and{" "}
        <a href="https://www.cloudflare.com/">Cloudflare</a>.
      </p>
    </div>
  );
}
