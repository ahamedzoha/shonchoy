import { Loader2 } from "lucide-react";

interface AppLoaderProps {
  isLoading: boolean;
  element: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AppLoader({ isLoading, element, fallback }: AppLoaderProps) {
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  return <>{element}</>;
}
