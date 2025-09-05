"use client";

import { Card } from "../components/ui/card";
import Image from "next/image";

const LINKS = [
  {
    title: "Docs",
    href: "https://turborepo.com/docs",
    description: "Find in-depth information about Turborepo features and API.",
  },
  {
    title: "Learn",
    href: "https://turborepo.com/docs/handbook",
    description: "Learn more about monorepos with our handbook.",
  },
  {
    title: "Templates",
    href: "https://turborepo.com/docs/getting-started/from-example",
    description: "Choose from over 15 examples and deploy with a single click.",
  },
  {
    title: "Deploy",
    href: "https://vercel.com/new",
    description:
      "Instantly deploy your Turborepo to a shareable URL with Vercel.",
  },
];
export default function Page() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <div className="z-10 items-center justify-between w-full max-w-5xl font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex items-end justify-center w-full h-48 lg:static lg:h-auto lg:w-auto">
          <a
            className="flex gap-2 p-8 pointer-events-none place-items-center lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo"
            rel="noopener noreferrer"
            target="_blank"
          >
            By{" "}
            <Image
              alt="Vercel Logo"
              className="dark:invert"
              height={24}
              priority
              src="/vercel.svg"
              width={100}
            />
          </a>
        </div>
      </div>

      {/* WCAG Violations for Testing */}
      <div className="wcag-testing-section">
        {/* Missing alt text */}
        <img src="/vercel.svg" className="w-8 h-8" />

        {/* Poor color contrast */}
        <p style={{ color: "#cccccc", backgroundColor: "#f0f0f0" }}>
          This text has very poor contrast and is hard to read
        </p>

        {/* Missing form labels */}
        <input type="text" />
        <input type="email" placeholder="Enter your email" />

        {/* Missing button labels */}
        <button className="w-8 h-8 bg-blue-500"></button>
        <button className="w-8 h-8 bg-red-500"></button>

        <h1>Main heading</h1>
        <h3>Another heading</h3>

        {/* Empty links */}
        <a href="#">Link with no text</a>

        {/* Form without fieldset/legend */}
        <form>
          <input type="radio" name="gender" value="male" />
          <input type="radio" name="gender" value="female" />
        </form>
      </div>

      <p className="low-contrast">
        This text has poor contrast and may be hard to read for users with
        visual impairments.
      </p>
      <p className="terrible-contrast">This text has even worse contrast.</p>
      <p>
        For more information, <a href="/info">click here</a> to learn about our
        services.
      </p>

      <div className="flex">
        <button className="w-4 h-4">A</button>
        <button className="w-4 h-4">B</button>
        <button className="w-4 h-4">C</button>
      </div>

      <div className="grid mb-32 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {LINKS.map(({ title, href, description }) => (
          <Card href={href} key={title} title={title}>
            {description}
          </Card>
        ))}
      </div>
    </main>
  );
}
