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
            className="min-h-screen text-white flex flex-col items-center p-4 sm:p-6 md:p-8 relative"
            style={{
                background: 'linear-gradient(180deg, #1a0033 0%, #0d001a 50%, #1a0033 100%)',
                fontFamily: "'Space Mono', monospace"
            }}
        >
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ff00ff 2px, #ff00ff 4px)',
                    pointerEvents: 'none'
                }}
            ></div>
            <header className="relative z-10 w-full max-w-2xl text-center mb-8">
                <h1
                    className="text-4xl sm:text-5xl md:text-6xl font-black pb-2"
                    style={{
                        fontFamily: "'Orbitron', sans-serif",
                        color: '#ff00ff',
                        textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #00ffff, 0 0 70px #00ffff, 0 0 80px #00ffff',
                        letterSpacing: '0.1em'
                    }}
                >
                    ON-TRENTIFY
                </h1>
                <p className="text-base sm:text-lg mt-2" style={{ color: '#00ffff' }}>
                    Because knockoffs deserve postcodes too.
                </p>
            </header>

            <main className="relative z-10 w-full max-w-2xl flex-grow flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input
                        type="text"
                        value={originalInput}
                        onChange={(e) => setOriginalInput(e.target.value)}
                        placeholder="Enter something posh you can't afford..."
                        className="flex-grow px-4 py-3 text-white transition duration-200 font-bold"
                        style={{
                            background: '#0a0015',
                            border: '2px solid #ff00ff',
                            borderRadius: '0',
                            boxShadow: '0 0 10px #ff00ff',
                            outline: 'none'
                        }}
                        disabled={isLoading}
                        aria-label="Item to Trentify"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !originalInput.trim()}
                        className="font-black py-3 px-6 flex items-center justify-center transition duration-200"
                        style={{
                            background: isLoading || !originalInput.trim() ? '#333' : 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
                            border: '2px solid #00ffff',
                            borderRadius: '0',
                            boxShadow: isLoading || !originalInput.trim() ? 'none' : '0 0 20px #00ffff',
                            color: '#fff',
                            fontFamily: "'Orbitron', sans-serif",
                            letterSpacing: '0.1em',
                            cursor: isLoading || !originalInput.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'TRENTIFYING...' : 'TRENTIFY!'}
                    </button>
                </form>

                <div
                    className="w-full p-6 flex-grow flex items-center justify-center min-h-[400px]"
                    style={{
                        background: '#0a0015',
                        border: '3px solid #ff00ff',
                        borderRadius: '0',
                        boxShadow: '0 0 20px #ff00ff, inset 0 0 20px rgba(255, 0, 255, 0.1)'
                    }}
                >
                    {isLoading ? (
                        <div className="text-center">
                            <Spinner />
                            <p className="mt-4 font-bold" style={{ color: '#00ffff' }}>TRENTIFYING IN PROGRESS...</p>
                            <p className="mt-2 text-sm" style={{ color: '#ff00ff' }}>Please wait while we find something cheaper.</p>
                        </div>
                    ) : error ? (
                        <div className="text-center" style={{ color: '#ff00ff' }}>
                            <p className="font-bold text-lg">Well, that's embarrassing.</p>
                            <p className="mt-2">{error}</p>
                            <p className="mt-2 text-sm" style={{ color: '#00ffff' }}>Even the budget version broke.</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="text-center w-full">
                            <div
                                className="relative w-full max-w-lg mx-auto overflow-hidden"
                                style={{
                                    border: '4px solid #00ffff',
                                    boxShadow: '0 0 30px #00ffff, inset 0 0 20px rgba(0, 255, 255, 0.2)'
                                }}
                            >
                                <img src={generatedImage} alt={poorMansVersion} className="w-full h-auto object-cover aspect-square" />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: 'linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.9) 100%)'
                                    }}
                                ></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 text-center">
                                    <h2
                                        className="text-2xl md:text-3xl font-black uppercase tracking-wider"
                                        style={{
                                            fontFamily: "'Orbitron', sans-serif",
                                            color: '#ff00ff',
                                            textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 2px 2px 0px #00ffff'
                                        }}
                                    >
                                        {submittedInput}-ON-TRENT
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6">
                                {!isRevealed ? (
                                    <button
                                        onClick={() => setIsRevealed(true)}
                                        className="font-black py-3 px-6 transition duration-200"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
                                            border: '2px solid #00ffff',
                                            borderRadius: '0',
                                            boxShadow: '0 0 20px #00ffff',
                                            color: '#fff',
                                            fontFamily: "'Orbitron', sans-serif",
                                            letterSpacing: '0.1em'
                                        }}
                                        aria-label="Reveal the on-Trent version"
                                    >
                                        REVEAL THE TRUTH
                                    </button>
                                ) : (
                                    <p
                                        className="text-base sm:text-lg p-3 inline-block"
                                        style={{
                                            background: '#0a0015',
                                            border: '2px solid #ff00ff',
                                            boxShadow: '0 0 10px #ff00ff',
                                            color: '#00ffff'
                                        }}
                                    >
                                        The budget alternative to <span className="font-bold" style={{ color: '#ff00ff' }}>{submittedInput}</span> is: <span className="font-bold uppercase" style={{ color: '#00ffff' }}>{poorMansVersion}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-xl font-bold mb-3" style={{ color: '#ff00ff' }}>
                                AWAITING LUXURY INPUT
                            </p>
                            <p className="text-base" style={{ color: '#00ffff' }}>
                                Type in something expensive you'll never own.
                            </p>
                            <p className="text-sm mt-4" style={{ color: '#666' }}>
                                We'll show you the disappointing alternative.
                            </p>
                        </div>
                    )}
                </div>
                <footer className="relative z-10 text-center mt-8 text-xs py-4" style={{ color: '#666' }}>
                    <p>Made with regret somewhere in the Midlands. Not actually affiliated with Stoke-on-Trent.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;