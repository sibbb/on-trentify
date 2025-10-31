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
                background: '#f5f5f5',
                fontFamily: "'Roboto Condensed', sans-serif"
            }}
        >
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #E03A3E 0px, #E03A3E 40px, white 40px, white 80px)',
                    pointerEvents: 'none'
                }}
            ></div>
            <header className="relative z-10 w-full max-w-2xl text-center mb-8">
                <div
                    className="inline-block px-8 py-6 mb-4"
                    style={{
                        background: 'white',
                        border: '4px solid #1E2952',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <h1
                        className="text-5xl sm:text-6xl md:text-7xl font-black"
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            color: '#E03A3E',
                            letterSpacing: '0.05em',
                            lineHeight: '1'
                        }}
                    >
                        ON-TRENTIFY
                    </h1>
                    <div
                        className="text-xs sm:text-sm font-bold mt-2"
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            color: '#1E2952',
                            letterSpacing: '0.15em'
                        }}
                    >
                        THE BUDGET ALTERNATIVE
                    </div>
                </div>
                <p className="text-base sm:text-lg font-bold" style={{ color: '#1E2952' }}>
                    Finding the on-Trent version of your favourite thing
                </p>
            </header>

            <main className="relative z-10 w-full max-w-2xl flex-grow flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input
                        type="text"
                        value={originalInput}
                        onChange={(e) => setOriginalInput(e.target.value)}
                        placeholder="Enter a luxury brand (we'll find the Stoke equivalent...)"
                        className="flex-grow px-4 py-3 transition duration-200 font-bold"
                        style={{
                            background: 'white',
                            border: '3px solid #1E2952',
                            borderRadius: '4px',
                            color: '#1E2952',
                            outline: 'none',
                            fontSize: '16px'
                        }}
                        disabled={isLoading}
                        aria-label="Item to Trentify"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !originalInput.trim()}
                        className="font-black py-3 px-8 flex items-center justify-center transition duration-200"
                        style={{
                            background: isLoading || !originalInput.trim() ? '#999' : '#E03A3E',
                            border: '3px solid #1E2952',
                            borderRadius: '4px',
                            color: 'white',
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: '20px',
                            letterSpacing: '0.1em',
                            cursor: isLoading || !originalInput.trim() ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        {isLoading ? 'FINDING...' : 'TRENTIFY!'}
                    </button>
                </form>

                <div
                    className="w-full p-6 flex-grow flex items-center justify-center min-h-[400px]"
                    style={{
                        background: 'white',
                        border: '4px solid #1E2952',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isLoading ? (
                        <div className="text-center">
                            <Spinner />
                            <p className="mt-4 font-bold text-xl" style={{ color: '#E03A3E', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
                                SCOUTING THE CHAMPIONSHIP...
                            </p>
                            <p className="mt-2 text-sm font-bold" style={{ color: '#1E2952' }}>
                                Finding you a proper bargain
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <p className="font-bold text-2xl mb-2" style={{ color: '#E03A3E', fontFamily: "'Bebas Neue', sans-serif" }}>
                                OWN GOAL!
                            </p>
                            <p className="mt-2" style={{ color: '#1E2952' }}>{error}</p>
                            <p className="mt-2 text-sm font-bold" style={{ color: '#666' }}>
                                Even the budget version let us down
                            </p>
                        </div>
                    ) : generatedImage ? (
                        <div className="text-center w-full">
                            <div
                                className="relative w-full max-w-lg mx-auto overflow-hidden"
                                style={{
                                    border: '6px solid #1E2952',
                                    borderRadius: '8px',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                    background: 'white'
                                }}
                            >
                                <div
                                    className="absolute top-0 left-0 right-0 h-12"
                                    style={{
                                        background: 'repeating-linear-gradient(90deg, #E03A3E 0px, #E03A3E 30px, white 30px, white 60px)',
                                        borderBottom: '3px solid #1E2952',
                                        zIndex: 1
                                    }}
                                ></div>
                                <img src={generatedImage} alt={poorMansVersion} className="w-full h-auto object-cover aspect-square" style={{ paddingTop: '48px' }} />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: 'linear-gradient(180deg, transparent 70%, rgba(30, 41, 82, 0.95) 100%)',
                                        pointerEvents: 'none'
                                    }}
                                ></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 text-center">
                                    <h2
                                        className="text-2xl md:text-4xl font-black uppercase"
                                        style={{
                                            fontFamily: "'Bebas Neue', sans-serif",
                                            color: 'white',
                                            letterSpacing: '0.1em',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
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
                                        className="font-black py-3 px-8 transition duration-200"
                                        style={{
                                            background: '#E03A3E',
                                            border: '3px solid #1E2952',
                                            borderRadius: '4px',
                                            color: 'white',
                                            fontFamily: "'Bebas Neue', sans-serif",
                                            fontSize: '20px',
                                            letterSpacing: '0.1em',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        aria-label="Reveal the on-Trent version"
                                    >
                                        SEE THE SQUAD PLAYER
                                    </button>
                                ) : (
                                    <p
                                        className="text-base sm:text-lg p-4 inline-block font-bold"
                                        style={{
                                            background: '#1E2952',
                                            border: '3px solid #E03A3E',
                                            borderRadius: '4px',
                                            color: 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        The Championship version of <span style={{ color: '#E03A3E' }}>{submittedInput}</span> is: <span style={{ color: 'white', textTransform: 'uppercase' }}>{poorMansVersion}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-2xl font-bold mb-3" style={{ color: '#E03A3E', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
                                READY FOR KICK-OFF
                            </p>
                            <p className="text-base font-bold mb-2" style={{ color: '#1E2952' }}>
                                Enter your Premier League choice
                            </p>
                            <p className="text-sm mt-4" style={{ color: '#666' }}>
                                We'll match you with the Championship equivalent
                            </p>
                        </div>
                    )}
                </div>
                <footer className="relative z-10 text-center mt-8 text-xs py-4 font-bold" style={{ color: '#666' }}>
                    <p>Relegating luxury brands to League One since 2025. Not affiliated with Stoke City FC or the actual city of Stoke-on-Trent.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;