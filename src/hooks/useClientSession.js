import { useState, useEffect } from 'react';

const SESSION_KEY = 'vorvox_client_session';

export function useClientSession() {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cek localStorage saat mount
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setClient(parsed);
            } catch (e) {
                console.error("Failed to parse client session", e);
                localStorage.removeItem(SESSION_KEY);
            }
        }
        setLoading(false);
    }, []);

    const login = (clientData) => {
        setClient(clientData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(clientData));
    };

    const logout = () => {
        setClient(null);
        localStorage.removeItem(SESSION_KEY);
    };

    return { client, loading, login, logout };
}
