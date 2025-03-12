//src/app/page.tsx

//Homeページを定義、エクスポート
export default function Home() {
    return (
        <div className="isolate flex">
            {/* Side Bar component */}
            <div className="fixed top-0 left-0 w-64">
                <aside id="default-sidebar" className="h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
                    <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                        <ul className="space-y-2 font-medium">
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                >
                                    <span className="material-symbols-outlined">
                                        home
                                    </span>
                                    {/* Homeの表示 */}
                                    <span className="ml-2 h-[24px] w-auto">Home</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                >
                                    <span className="material-symbols-outlined">
                                        tag
                                    </span>
                                    <span className="ml-2 h-[24px] w-auto">Antenna</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
            {/* Main contents */}
            <div className="fixed top-0 left-64">
                <div>
                    <h1>Here is the main position</h1>
                </div>
                <h1>Welcome to Imaginary Space Station</h1>
                <p>Your app is running successfully!</p>
            </div>
            {/* TODO:Make right sidebar menu */}
            {/* Right sidebar component */}
            <div className="fixed right-0 w-[287px] bg-slate-200">
                <aside id="default-sidebar" className="h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
                    <div className="h-full px-3 py-4 overflow-y-auto dark:bg-gray-800">
                        <ul className="space-y-2 font-medium">
                            <li>
                                <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                    <span className="material-symbols-outlined text-gray-900 ms-3">home</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}