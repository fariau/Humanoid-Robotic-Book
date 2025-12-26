import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const AuthComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to get user session
  const fetchSession = async () => {
    try {
      const response = await fetch('/auth/api.getSession', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      await fetch('/auth/api.signOut', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div className="auth-logged-in">
          <span>Welcome, {user.name || user.email}!</span>
          <button onClick={handleSignOut} className="button button--secondary button--sm">
            Sign Out
          </button>
        </div>
      ) : (
        <a href="/auth" className="button button--primary button--sm">
          Sign In
        </a>
      )}
    </div>
  );
};

const AuthComponentWrapper = () => {
  return (
    <BrowserOnly>
      {() => <AuthComponent />}
    </BrowserOnly>
  );
};

export default AuthComponentWrapper;