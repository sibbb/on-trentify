import React, { useState, useCallback } from 'react';
import { getPoorMansVersion, generateImageOf } from './services/geminiService';
import Spinner from './components/Spinner';

const App: React.FC = () => {
    const [originalInput, setOriginalInput] = useState<string>('');
    const [submittedInput, setSubmittedInput] = useState<string>('');
    const [poorMansVersion, setPoorMansVersion] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!originalInput.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setPoorMansVersion('');
        setSubmittedInput(originalInput);
        setIsRevealed(false);

        try {
            // Step 1: Get the "poor man's version" and if it's a person
            const { poorMansVersion: pmv, isPerson } = await getPoorMansVersion(originalInput);
            setPoorMansVersion(pmv);

            // Step 2: Generate an image of it, passing the person flag
            const imageB64 = await generateImageOf(pmv, isPerson);
            setGeneratedImage(`data:image/png;base64,${imageB64}`);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [originalInput, isLoading]);

    return (
        <div 
            className="min-h-screen text-white flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans relative"
            style={{
                backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/d/d9/Gladstone_Pottery_Museum_Bottle_Ovens_-_geograph.org.uk_-_1036345.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm"></div>
            <header className="relative z-10 w-full max-w-2xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 pb-2">
                    On-Trentify
                </h1>
                <p className="text-lg text-gray-300 mt-2">
                    Find the "poor man's version" of anything and rebrand it.
                </p>
            </header>

            <main className="relative z-10 w-full max-w-2xl flex-grow flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input
                        type="text"
                        value={originalInput}
                        onChange={(e) => setOriginalInput(e.target.value)}
                        placeholder="e.g., Gold, Champagne, A Rolex..."
                        className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        disabled={isLoading}
                        aria-label="Item to Trentify"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !originalInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                    >
                        {isLoading ? 'Generating...' : 'Trentify!'}
                    </button>
                </form>

                <div className="w-full bg-gray-800 bg-opacity-70 border border-gray-700 rounded-lg p-6 flex-grow flex items-center justify-center min-h-[400px]">
                    {isLoading ? (
                        <div className="text-center">
                            <Spinner />
                            <p className="mt-4 text-gray-300">Trentifying your concept...</p>
                            <p className="mt-2 text-sm text-gray-500">This can take a moment, please wait.</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center">
                            <p className="font-bold text-lg">Oops! Something went wrong.</p>
                            <p className="mt-2">{error}</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="text-center w-full">
                            <div className="relative w-full max-w-lg mx-auto shadow-2xl rounded-lg overflow-hidden">
                                <img src={generatedImage} alt={poorMansVersion} className="w-full h-auto object-cover aspect-square" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 text-center">
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                        {submittedInput}-on-Trent
                                    </h2>
                                </div>
                            </div>

                             <div className="mt-6">
                                {!isRevealed ? (
                                    <button
                                        onClick={() => setIsRevealed(true)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                        aria-label="Reveal the on-Trent version"
                                    >
                                        Reveal the 'on-Trent' version
                                    </button>
                                ) : (
                                    <p className="text-lg text-gray-300 bg-gray-900 bg-opacity-50 rounded-lg p-3 inline-block">
                                        The 'on-Trent' version of <span className="font-bold text-white">{submittedInput}</span> is: <span className="font-bold text-purple-400 capitalize">{poorMansVersion}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center">
                            <p className="text-xl">Enter something to see its "on-Trent" version.</p>
                            <p className="text-base mt-2">Example: "Gold" becomes an image of silver, branded as "Gold-on-Trent".</p>
                        </div>
                    )}
                </div>
                 <footer className="relative z-10 text-center text-gray-400 mt-8 text-sm py-4">
                    <p>Powered by the Gemini API. Inspired by a peculiar British naming convention.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;