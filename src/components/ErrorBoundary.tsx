import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. This has been logged and we'll look into it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className="font-mono text-xs mt-2">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  title = "Something went wrong",
  description = "We encountered an error while loading this page. Please try again.",
  onRetry,
  onGoBack,
  showDetails = true,
}: ErrorFallbackProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive mb-2">
          <AlertTriangle className="h-6 w-6" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="font-mono text-xs mt-2 break-all">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          {!onRetry && !onGoBack && (
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}