import { getPostData } from "lib/posts";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa"; // Existing icons
// Import Simple Icons for languages
import {
    SiC,
    SiCplusplus,
    SiPython,
    SiRuby,
    SiLua,
    SiJavascript,
    SiTypescript
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";

export default async function ProfilePage() { // Explicit return type
    const postData = await getPostData("../about");
    if (!postData) {
        return <div>Loading...</div>; // Handle loading state
    }

    return (
        // Use defined card/border colors
        <section className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
            <h1 className="text-3xl font-bold mb-4 text-foreground-light dark:text-foreground-dark">About</h1>

            <h2 className="text-xl font-semibold mb-2 text-foreground-light dark:text-foreground-dark">SeokguKim, the Problem Solver</h2>

            <div className="prose dark:prose-invert max-w-none">
                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </div>

            <div className="mt-4 border-t border-border-light dark:border-border-dark pt-4">
                <h2 className="text-xl font-semibold mb-2 text-foreground-light dark:text-foreground-dark">Skills</h2>
                {/* Use text color from foreground */}
                <ul className="list-none pl-0 flex flex-wrap gap-4 text-foreground-light dark:text-foreground-dark"> {/* Changed to list-none, flex layout */}
                    {/* Language icons */}
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded"> {/* Added styling for list items */}
                        <SiC size={16} /> C
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <SiCplusplus size={16} /> C++
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <TbBrandCSharp size={16} /> C#
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <SiPython size={16} /> Python
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <SiRuby size={16} /> Ruby
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <SiLua size={16} /> Lua
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <SiJavascript size={16} /> JavaScript
                    </li>
                    <li className="flex items-center gap-2 bg-card-muted-light dark:bg-card-muted-dark px-3 py-1 rounded">
                        <SiTypescript size={16} /> TypeScript
                    </li>
                </ul>
            </div>

            <div className="mt-4 border-t border-border-light dark:border-border-dark pt-4">
                <h2 className="text-xl font-semibold mb-2 text-foreground-light dark:text-foreground-dark">Social</h2>
                <ul className="list-none pl-5">
                    <li>
                        <a href="https://seokgukim.github.io/" className="text-primary-muted hover:underline">
                            { /* globe icon */}
                            <FaGlobe size={16} className="inline mr-1" />
                            My former blog
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/seokgukim" className="text-primary-muted hover:underline">
                            { /* GitHub icon */}
                            <FaGithub size={16} className="inline mr-1" />
                            GitHub
                        </a>
                    </li>
                    <li>
                        <a href="https://linkedin.com/in/seungroklee549" className="text-primary-muted hover:underline">
                            { /* LinkedIn icon */}
                            <FaLinkedin size={16} className="inline mr-1" />
                            LinkedIn
                        </a>
                    </li>
                    {/* Add more social links as needed */}
                </ul>
            </div>

            <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
                <h2 className="text-xl font-semibold mb-2 text-foreground-light dark:text-foreground-dark">Contact</h2>
                {/* Use defined primary-muted color */}
                <a href="mailto:your-email@example.com" className="text-primary-muted hover:underline">
                    rokja97@naver.com
                </a>
            </div>
        </section>
    );
}