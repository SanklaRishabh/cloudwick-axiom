
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloudwick-blue mx-auto mb-4"></div>
          <p className="text-gray-600 font-lexend">Loading...</p>
        </div>
      </div>
    );
  }

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.username;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-cloudwick-blue font-lato text-3xl font-bold">Cloudwick</span>
            <span className="text-gray-800 font-lato text-3xl font-light">Axiom</span>
          </div>
          
          {isAuthenticated && user ? (
            <>
              <h1 className="text-4xl font-bold font-lexend text-gray-900 mb-4">
                Welcome back, {getUserDisplayName()}!
              </h1>
              <p className="text-xl text-gray-600 font-lexend max-w-md mx-auto">
                You're successfully signed in to Cloudwick Axiom.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold font-lexend text-gray-900 mb-4">
                Welcome to Cloudwick Axiom
              </h1>
              <p className="text-xl text-gray-600 font-lexend max-w-md mx-auto">
                Knowledge awaits you. Sign in to access your account and explore the platform.
              </p>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <Button
                onClick={() => signOut()}
                className="bg-gray-600 hover:bg-gray-700 text-white font-lexend font-medium px-8 py-3 text-lg transition-colors"
              >
                Sign Out
              </Button>
              <p className="text-sm text-gray-500 font-lexend">
                Signed in as {user?.email}
              </p>
            </div>
          ) : (
            <>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-cloudwick-blue hover:bg-blue-600 text-white font-lexend font-medium px-8 py-3 text-lg transition-colors"
              >
                Get Started
              </Button>
              <p className="text-sm text-gray-500 font-lexend">
                Access your Cloudwick Axiom dashboard
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
